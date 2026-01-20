import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    // Sign Up: Create User -> Create Couple -> Link them
    async function signup(email, password, name) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;

        // Create new Couple Document
        const coupleRef = doc(collection(db, 'couples'));
        await setDoc(coupleRef, {
            createdAt: serverTimestamp(),
            coupleName: '우리',
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

    // Link to existing couple (Feature for partner) - Not fully implemented yet
    async function joinCouple(email, password, name, coupleCode) {
        // Logic to find couple by code and link user
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
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
