import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore'; // DB Operations
import { findCoupleByInviteCode } from '../services/db';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false); // Admin State

    // Helper to override current user (for admin monitoring)
    const setAdminMode = (status) => {
        setIsAdmin(status);
        if (status) {
            setCurrentUser({ uid: 'admin', email: 'admin@ourstory.com' });
            setUserData({ name: '관리자', coupleId: null });
        } else {
            setCurrentUser(null);
            setUserData(null);
        }
    };
    async function signup(email, password, name) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        const inviteCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code

        // Create new Couple Document
        const coupleRef = doc(collection(db, 'couples'));
        await setDoc(coupleRef, {
            createdAt: serverTimestamp(),
            coupleName: '우리',
            inviteCode, // Save code
            anniversaryDate: new Date().toISOString().split('T')[0],
            theme: 'simple',
            appTitle: 'Our Story',
            appSubtitle: '우리의 이야기'
        });

        // Save User Data with Couple ID
        const userDocData = {
            email,
            name,
            coupleId: coupleRef.id,
            createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', user.uid), userDocData);

        // Immediately update state (no refresh needed)
        setUserData({ ...userDocData, uid: user.uid });

        return user;
    }

    // Google Login
    async function loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        const res = await signInWithPopup(auth, provider);
        const user = res.user;

        // Check if existing user
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            // New User -> Create Couple
            const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();
            const coupleRef = doc(collection(db, 'couples'));
            await setDoc(coupleRef, {
                createdAt: serverTimestamp(),
                coupleName: '우리',
                inviteCode,
                anniversaryDate: new Date().toISOString().split('T')[0],
                theme: 'simple',
                appTitle: 'Our Story',
                appSubtitle: '우리의 이야기'
            });

            await setDoc(docRef, {
                email: user.email,
                name: user.displayName || '이름 없음',
                coupleId: coupleRef.id,
                createdAt: serverTimestamp()
            });
        }
    }

    // Connect Partner (Merge Couple)
    async function connectPartner(code) {
        if (!currentUser) return;
        const couple = await findCoupleByInviteCode(code);
        if (!couple) throw new Error('유효하지 않은 초대 코드입니다.');

        // Update my coupleId to target couple
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { coupleId: couple.id });

        // Reload to refresh context
        window.location.reload();
    }



    async function login(email, password) {
        const res = await signInWithEmailAndPassword(auth, email, password);
        // Fetch and set user data immediately
        const docSnap = await getDoc(doc(db, 'users', res.user.uid));
        if (docSnap.exists()) {
            setUserData({ ...docSnap.data(), uid: res.user.uid });
        }
        return res;
    }

    // Email Link (Passwordless) Authentication
    async function sendEmailLink(email) {
        const actionCodeSettings = {
            url: window.location.origin + '/login', // Redirect URL after click
            handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        // Save email to localStorage for completing sign-in
        window.localStorage.setItem('emailForSignIn', email);
    }

    async function completeEmailLinkSignIn(email, name) {
        if (!isSignInWithEmailLink(auth, window.location.href)) {
            throw new Error('유효하지 않은 로그인 링크입니다.');
        }

        const res = await signInWithEmailLink(auth, email, window.location.href);
        const user = res.user;

        // Check if user exists
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            // New user - create couple and user doc
            const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();
            const coupleRef = doc(collection(db, 'couples'));
            await setDoc(coupleRef, {
                createdAt: serverTimestamp(),
                coupleName: '우리',
                inviteCode,
                anniversaryDate: new Date().toISOString().split('T')[0],
                theme: 'simple',
                appTitle: 'Our Story',
                appSubtitle: '우리의 이야기'
            });

            const userDocData = {
                email,
                name: name || '사용자',
                coupleId: coupleRef.id,
                createdAt: serverTimestamp()
            };
            await setDoc(docRef, userDocData);
            setUserData({ ...userDocData, uid: user.uid });
        } else {
            setUserData({ ...docSnap.data(), uid: user.uid });
        }

        // Clear saved email
        window.localStorage.removeItem('emailForSignIn');
        return res;
    }

    function logout() {
        setUserData(null);
        setIsAdmin(false);
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    }
                } catch (e) {
                    console.error("Error fetching user data:", e);
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userData,
        signup,
        login,
        loginWithGoogle,
        sendEmailLink,
        completeEmailLinkSignIn,
        connectPartner,
        logout,
        isAdmin,
        setAdminMode,
        setUserData
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
