import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // ========== SIGNUP ==========
    async function signup(email, password, name) {
        // 1. Create Firebase Auth user
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;

        // 2. Send verification email
        await sendEmailVerification(user);

        // 3. Create user document (not fully registered until email verified)
        await setDoc(doc(db, 'users', user.uid), {
            email,
            name,
            coupleId: null, // Will be set on first login after verification
            emailVerified: false,
            createdAt: serverTimestamp()
        });

        // 4. Sign out - user must verify email and log in again
        await signOut(auth);

        return { message: '인증 메일을 발송했습니다. 이메일을 확인해주세요!' };
    }

    // ========== LOGIN ==========
    async function login(email, password) {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const user = res.user;

        // Check email verification
        if (!user.emailVerified) {
            await signOut(auth);
            throw new Error('이메일 인증이 필요합니다. 메일함을 확인해주세요.');
        }

        // Get user document
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();

            // First login after email verification
            if (!data.coupleId) {
                // Create new couple for this user
                // Invite Code is NULL initially. User must generate it manually.
                const coupleRef = doc(collection(db, 'couples'));
                await setDoc(coupleRef, {
                    inviteCode: null, // Changed from auto-generation
                    user1: user.uid,
                    user2: null,
                    coupleName: '우리',
                    anniversaryDate: new Date().toISOString().split('T')[0],
                    theme: 'simple',
                    appTitle: 'Our Story',
                    appSubtitle: '우리의 이야기',
                    createdAt: serverTimestamp()
                });

                // Update user with coupleId
                await updateDoc(userRef, {
                    coupleId: coupleRef.id,
                    emailVerified: true
                });

                setUserData({ ...data, coupleId: coupleRef.id, emailVerified: true, uid: user.uid });
            } else {
                // Mark as verified if not already
                if (!data.emailVerified) {
                    await updateDoc(userRef, { emailVerified: true });
                }
                setUserData({ ...data, emailVerified: true, uid: user.uid });
            }
        }

        return res;
    }

    // ========== GOOGLE LOGIN ==========
    async function loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        const res = await signInWithPopup(auth, provider);
        const user = res.user;

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // New user - create couple and user doc
            // Invite Code is NULL initially
            const coupleRef = doc(collection(db, 'couples'));
            await setDoc(coupleRef, {
                inviteCode: null, // Changed from auto-generation
                user1: user.uid,
                user2: null,
                coupleName: '우리',
                anniversaryDate: new Date().toISOString().split('T')[0],
                theme: 'simple',
                appTitle: 'Our Story',
                appSubtitle: '우리의 이야기',
                createdAt: serverTimestamp()
            });

            const newUserData = {
                email: user.email,
                name: user.displayName || '사용자',
                coupleId: coupleRef.id,
                emailVerified: true,
                createdAt: serverTimestamp()
            };
            await setDoc(userRef, newUserData);
            setUserData({ ...newUserData, uid: user.uid });
        } else {
            setUserData({ ...userSnap.data(), uid: user.uid });
        }

        return res;
    }

    // ========== COUPLE CONNECTION ==========
    async function connectWithCode(inviteCode) {
        if (!currentUser || !userData) throw new Error('로그인이 필요합니다.');

        // Trim and validate
        const code = inviteCode.trim();
        if (!code || code.length !== 6) {
            throw new Error('초대 코드는 6자리 숫자입니다.');
        }

        console.log('Looking for invite code:', code);

        // Find couple with this invite code
        const q = query(collection(db, 'couples'), where('inviteCode', '==', code));
        const snapshot = await getDocs(q);

        console.log('Found couples:', snapshot.size);

        if (snapshot.empty) {
            throw new Error('유효하지 않은 초대 코드입니다. 코드를 다시 확인해주세요.');
        }

        const targetCouple = snapshot.docs[0];
        const targetCoupleData = targetCouple.data();

        if (targetCoupleData.user2) {
            throw new Error('이미 다른 사람과 연결된 코드입니다.');
        }

        if (targetCoupleData.user1 === currentUser.uid) {
            throw new Error('자신의 코드는 사용할 수 없습니다.');
        }

        // Delete my old couple data
        // Delete my old couple data (Try-catch to prevent blocking)
        if (userData.coupleId && userData.coupleId !== targetCouple.id) {
            try {
                await deleteCouple(userData.coupleId);
            } catch (err) {
                console.warn('Failed to delete old couple data, but proceeding:', err);
            }
        }

        // Connect to target couple
        await updateDoc(doc(db, 'couples', targetCouple.id), {
            user2: currentUser.uid,
            inviteCode: null // Remove invite code after connection
        });

        // Update my user doc
        await updateDoc(doc(db, 'users', currentUser.uid), {
            coupleId: targetCouple.id
        });

        setUserData({ ...userData, coupleId: targetCouple.id });
    }

    // ========== DISCONNECT ==========
    async function disconnectCouple() {
        if (!currentUser || !userData?.coupleId) return;

        const coupleRef = doc(db, 'couples', userData.coupleId);
        const coupleSnap = await getDoc(coupleRef);

        if (!coupleSnap.exists()) return;

        const coupleData = coupleSnap.data();
        const isUser1 = coupleData.user1 === currentUser.uid;
        const partnerId = isUser1 ? coupleData.user2 : coupleData.user1;

        // Create new couple for me
        // Invite Code is NULL initially
        const newCoupleRef = doc(collection(db, 'couples'));
        await setDoc(newCoupleRef, {
            inviteCode: null,
            user1: currentUser.uid,
            user2: null,
            coupleName: '우리',
            anniversaryDate: new Date().toISOString().split('T')[0],
            theme: 'simple',
            appTitle: 'Our Story',
            appSubtitle: '우리의 이야기',
            createdAt: serverTimestamp()
        });

        // Update my user doc
        await updateDoc(doc(db, 'users', currentUser.uid), {
            coupleId: newCoupleRef.id
        });

        // If partner exists, give them the old couple (minus me)
        if (partnerId) {
            await updateDoc(coupleRef, {
                [isUser1 ? 'user1' : 'user2']: null,
                inviteCode: null // Reset invite code for partner too
            });
        } else {
            // No partner, delete old couple and its data
            await deleteCouple(userData.coupleId);
        }

        setUserData({ ...userData, coupleId: newCoupleRef.id });
    }

    // ========== GENERATE INVITE CODE ==========
    async function generateInviteCode() {
        if (!userData?.coupleId) return;
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Check duplicate (optional but good practice) - skipped for simplicity assuming collision low
        await updateDoc(doc(db, 'couples', userData.coupleId), {
            inviteCode: newCode
        });
        // Update local state to reflect change immediately without reload
        // But since we use real-time listeners in some parts, verify if settings are real-time.
        // Settings are NOT real-time in App.jsx (getCoupleSettings is one-time).
        return newCode;
    }

    // ========== FORCE START NEW COUPLE ==========
    async function startNewCouple() {
        if (!currentUser) return;

        // Create brand new couple
        const coupleRef = doc(collection(db, 'couples'));
        await setDoc(coupleRef, {
            inviteCode: null,
            user1: currentUser.uid,
            user2: null,
            coupleName: '우리',
            anniversaryDate: new Date().toISOString().split('T')[0],
            theme: 'simple',
            createdAt: serverTimestamp()
        });

        // Update user
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
            coupleId: coupleRef.id
        });

        // Update local state to immediately trigger App re-render
        setUserData({
            ...userData,
            coupleId: coupleRef.id
        });
    }

    // ========== DELETE COUPLE DATA ==========
    async function deleteCouple(coupleId) {
        // Delete subcollections (posts, checklist, bucketlist)
        const subcollections = ['posts', 'checklist', 'bucketlist', 'checklist_groups'];
        for (const sub of subcollections) {
            const subRef = collection(db, `couples/${coupleId}/${sub}`);
            const subDocs = await getDocs(subRef);
            for (const d of subDocs.docs) {
                await deleteDoc(d.ref);
            }
        }
        // Delete couple doc
        await deleteDoc(doc(db, 'couples', coupleId));
    }

    // ========== LOGOUT ==========
    function logout() {
        setUserData(null);
        setIsAdmin(false);
        return signOut(auth);
    }

    // ========== PASSWORD RESET ==========
    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    // ========== ADMIN ==========
    function setAdminMode(status) {
        setIsAdmin(status);
        if (status) {
            setCurrentUser({ uid: 'admin', email: 'admin@ourstory.com' });
            setUserData({ name: '관리자', coupleId: null, isAdmin: true });
        }
    }

    // ========== AUTH STATE OBSERVER ==========
    useEffect(() => {
        let unsubscribeUserDoc;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);

            // Cleanup previous listener if any
            if (unsubscribeUserDoc) {
                unsubscribeUserDoc();
                unsubscribeUserDoc = null;
            }

            if (user) {
                if (!isAdmin) {
                    // Real-time subscription to user data
                    unsubscribeUserDoc = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
                        if (docSnap.exists()) {
                            setUserData({ ...docSnap.data(), uid: user.uid });
                        }
                        // If doc doesn't exist yet (e.g. during signup), we wait.
                        // setLoading(false) is called inside to ensure we have data or at least tried.
                        setLoading(false);
                    }, (error) => {
                        console.error("Auth Error:", error);
                        setLoading(false);
                    });
                } else {
                    // Admin mode
                    setLoading(false);
                }
            } else {
                // Logged out
                setUserData(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeUserDoc) unsubscribeUserDoc();
        };
    }, [isAdmin]);

    const value = {
        currentUser,
        userData,
        signup,
        login,
        loginWithGoogle,
        resetPassword,
        connectWithCode,
        generateInviteCode,
        startNewCouple,
        disconnectCouple,
        logout,
        isAdmin,
        setAdminMode,
        setUserData
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                    ❤️
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}
