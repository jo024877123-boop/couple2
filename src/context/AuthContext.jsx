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
        try {
            console.log('🔐 [loginWithGoogle] Starting Google login...');
            const provider = new GoogleAuthProvider();
            const res = await signInWithPopup(auth, provider);
            const user = res.user;
            console.log('✅ [loginWithGoogle] signInWithPopup success. User:', user.uid);

            const userRef = doc(db, 'users', user.uid);
            let userSnap = await getDoc(userRef);
            console.log('📄 [loginWithGoogle] User document exists:', userSnap.exists());

            if (!userSnap.exists()) {
                console.log('🆕 [loginWithGoogle] New user detected. Creating couple and user docs...');
                // New user - create couple and user doc
                const coupleRef = doc(collection(db, 'couples'));
                await setDoc(coupleRef, {
                    inviteCode: null,
                    user1: user.uid,
                    user2: null,
                    coupleName: '우리',
                    anniversaryDate: new Date().toISOString().split('T')[0],
                    theme: 'simple',
                    appTitle: 'Our Story',
                    appSubtitle: '우리의 이야기',
                    createdAt: serverTimestamp()
                });
                console.log('✅ [loginWithGoogle] Couple document created:', coupleRef.id);

                const newUserData = {
                    email: user.email,
                    name: user.displayName || '사용자',
                    coupleId: coupleRef.id,
                    emailVerified: true,
                    onboardingCompleted: false,
                    createdAt: serverTimestamp()
                };
                await setDoc(userRef, newUserData);
                console.log('✅ [loginWithGoogle] User document created.');

                // Wait a bit and re-fetch to ensure it's readable
                await new Promise(resolve => setTimeout(resolve, 500));
                userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const finalData = { ...userSnap.data(), uid: user.uid };
                    console.log('✅ [loginWithGoogle] Document verified. Calling setUserData with:', finalData);
                    setUserData(finalData);
                } else {
                    console.warn('⚠️ [loginWithGoogle] Document still not readable after creation. Setting manually...');
                    setUserData({ ...newUserData, uid: user.uid });
                }
            } else {
                const existingData = userSnap.data();
                console.log('👤 [loginWithGoogle] Existing user. Data:', existingData);
                setUserData({ ...existingData, uid: user.uid });
                console.log('✅ [loginWithGoogle] setUserData called with:', { ...existingData, uid: user.uid });
            }

            console.log('🎉 [loginWithGoogle] Login flow completed successfully');
            return res;
        } catch (error) {
            console.error('❌ [loginWithGoogle] Error:', error);
            throw error;
        }
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

    const [statusMessage, setStatusMessage] = useState('초기화 중...');

    // ========== AUTH STATE OBSERVER ==========
    useEffect(() => {
        let unsubscribeUserDoc;
        let timeoutId;

        const loadingRef = { current: true };

        // Timeout failsafe (10 seconds)
        timeoutId = setTimeout(() => {
            if (loadingRef.current) {
                console.error("Auth timeout - forcing loading to false");
                setLoading(false);
                setStatusMessage("연결 시간이 너무 오래 걸립니다.");
            }
        }, 10000);

        setStatusMessage('인증 상태 확인 중...');
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);

            // Cleanup previous listener
            if (unsubscribeUserDoc) {
                unsubscribeUserDoc();
                unsubscribeUserDoc = null;
            }

            if (user) {
                if (!isAdmin) {
                    setStatusMessage('커플 데이터 연결 중...');
                    console.log('📡 [AuthContext] Subscribing to doc(db, "users", "' + user.uid + '")');
                    // Real-time subscription
                    unsubscribeUserDoc = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
                        clearTimeout(timeoutId);
                        loadingRef.current = false;

                        console.log('🔍 [AuthContext] onSnapshot callback:', {
                            exists: docSnap.exists(),
                            data: docSnap.data(),
                            uid: user.uid
                        });

                        if (docSnap.exists()) {
                            const userData = { ...docSnap.data(), uid: user.uid };
                            setUserData(userData);
                            setStatusMessage('연결 성공');
                            console.log('✅ [AuthContext] setUserData called:', userData);
                        } else {
                            setStatusMessage('사용자 정보를 찾을 수 없습니다.');
                            console.warn('⚠️ [AuthContext] Document does not exist for uid:', user.uid);
                            alert('⚠️ Firestore에 사용자 문서가 없습니다!\nUID: ' + user.uid + '\n\nFirebase Console에서 이 UID로 문서를 찾아보세요.');
                        }
                        setLoading(false);
                    }, (error) => {
                        clearTimeout(timeoutId);
                        loadingRef.current = false;
                        console.error("❌ [AuthContext] onSnapshot error:", error);
                        alert('❌ [AuthContext] Firestore 접근 오류:\n' + error.code + '\n' + error.message);
                        setStatusMessage('접근 권한 혹은 데이터 오류');
                        setLoading(false);
                    });
                } else {
                    clearTimeout(timeoutId);
                    loadingRef.current = false;
                    setLoading(false);
                }
            } else {
                clearTimeout(timeoutId);
                loadingRef.current = false;
                setUserData(null);
                setLoading(false);
                setStatusMessage('로그인 대기 중');
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeUserDoc) unsubscribeUserDoc();
            clearTimeout(timeoutId);
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
                <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '3rem' }}>❤️</div>
                    <div style={{ fontSize: '1rem', color: '#666' }}>{statusMessage}</div>
                    <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '20px', background: 'white' }}>
                        새로고침
                    </button>
                    {statusMessage.includes('초과') && (
                        <button onClick={() => signOut(auth).then(() => window.location.reload())} style={{ marginTop: '0.5rem', color: 'red', textDecoration: 'underline', background: 'none', border: 'none' }}>
                            강제 로그아웃
                        </button>
                    )}
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}
