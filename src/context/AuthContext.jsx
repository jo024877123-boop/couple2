import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; // Google Auth
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
        await setDoc(doc(db, 'users', user.uid), {
            email,
            name,
            coupleId: coupleRef.id,
            createdAt: serverTimestamp()
        });

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



    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
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
        connectPartner,
        logout,
        isAdmin,
        setAdminMode,
        setUserData // Allow overriding userData for monitoring
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
