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
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, serverTimestamp, getDocs, query, where, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null); // Firestore user data
    const [coupleData, setCoupleData] = useState(null); // Firestore couple data
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // ========== SIGNUP ==========
    async function signup(email, password, name) {
        // 1. Create Auth
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        await sendEmailVerification(user);

        // 2. Create User Doc (No Couple ID yet)
        await setDoc(doc(db, 'users', user.uid), {
            email,
            name,
            coupleId: null, // 초기에는 커플 연결 없음
            emailVerified: false,
            createdAt: serverTimestamp()
        });

        await signOut(auth);
        return { message: '인증 메일을 발송했습니다. 이메일을 확인해주세요!' };
    }

    // ========== LOGIN ==========
    async function login(email, password) {
        // Local persistence is default, but explicit setting is good
        await setPersistence(auth, browserLocalPersistence);
        const res = await signInWithEmailAndPassword(auth, email, password);
        const user = res.user;

        if (!user.emailVerified) {
            await signOut(auth);
            throw new Error('이메일 인증이 필요합니다.');
        }

        // 유저 정보 가져와서 상태 업데이트는 onAuthStateChanged에서 처리됨
        return res;
    }

    // ========== GOOGLE LOGIN ==========
    async function loginWithGoogle() {
        try {
            await setPersistence(auth, browserLocalPersistence);
            const provider = new GoogleAuthProvider();
            const res = await signInWithPopup(auth, provider);
            const user = res.user;

            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // 신규 구글 유저
                await setDoc(userRef, {
                    email: user.email,
                    name: user.displayName || '사용자',
                    coupleId: null, // 초기에는 커플 연결 없음
                    emailVerified: true,
                    onboardingCompleted: false,
                    createdAt: serverTimestamp()
                });
            }
            return res;
        } catch (error) {
            console.error('Google Login Error:', error);
            throw error;
        }
    }

    // ========== CREATE MY SPACE (초대 코드 생성 시 호출) ==========
    async function createMyCoupleSpace() {
        if (!currentUser) return;

        // 이미 공간이 있다면 기존 정보 반환 또는 재발급
        if (userData?.coupleId) {
            const coupleRef = doc(db, 'couples', userData.coupleId);
            const snap = await getDoc(coupleRef);
            if (snap.exists()) {
                const data = snap.data();
                // 1. 이미 코드가 살아있으면 반환
                if (data.inviteCode) {
                    return { coupleId: userData.coupleId, inviteCode: data.inviteCode };
                }
                // 2. 코드는 없는데 파트너도 없다면 (오류 상황 or 만료) -> 코드 재발급
                if (!data.user2) {
                    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                    await updateDoc(coupleRef, { inviteCode: newCode });
                    return { coupleId: userData.coupleId, inviteCode: newCode };
                }
                // 3. 파트너가 있으면 (이미 연결됨) -> 그대로 코드 없이 리턴
                return { coupleId: userData.coupleId, inviteCode: null };
            }
            // 문서가 없으면(유령) -> 아래로 흘러가서 새로 생성
        }

        const coupleRef = doc(collection(db, 'couples'));
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();

        await setDoc(coupleRef, {
            inviteCode: newCode,
            user1: currentUser.uid,
            user2: null, // 아직 상대방 없음
            coupleName: '우리',
            anniversaryDate: new Date().toISOString().split('T')[0],
            theme: 'simple',
            appTitle: 'Our Story',
            appSubtitle: '우리의 이야기',
            createdAt: serverTimestamp()
        });

        await updateDoc(doc(db, 'users', currentUser.uid), {
            coupleId: coupleRef.id
        });

        // 로컬 상태 즉시 업데이트 (SnapShot이 늦을 수 있으므로)
        setUserData(prev => ({ ...prev, coupleId: coupleRef.id }));
        setCoupleData({
            id: coupleRef.id,
            inviteCode: newCode,
            user1: currentUser.uid,
            user2: null
        });

        return { coupleId: coupleRef.id, inviteCode: newCode };
    }

    // ========== CONNECT WITH CODE (상대방 코드 입력) ==========
    async function connectWithCode(inviteCode) {
        if (!currentUser) throw new Error('로그인이 필요합니다.');

        const code = inviteCode.trim();
        if (code.length !== 6) throw new Error('6자리 코드를 입력해주세요.');

        // 1. 코드 검색
        const q = query(collection(db, 'couples'), where('inviteCode', '==', code));
        const snapshot = await getDocs(q);

        if (snapshot.empty) throw new Error('유효하지 않은 코드입니다.');

        const targetCoupleDoc = snapshot.docs[0];
        const targetData = targetCoupleDoc.data();

        // 2. 유효성 검사
        if (targetData.user2) throw new Error('이미 연결이 완료된 코드입니다.');
        if (targetData.user1 === currentUser.uid) throw new Error('자신의 코드는 입력할 수 없습니다.');

        // 3. 기존에 내가 만든 "빈 방"이 있다면 삭제 (청소)
        if (userData?.coupleId) {
            // 기존 방이 정말 "빈 방(나 혼자 있는)"인지 확인 후 삭제
            // 만약 user2가 있는 방이라면(이미 커플인데 다른 사람과 연결 시도?) -> 에러 처리 하거나 기존 연결 끊기
            // 여기서는 간단하게 "나만의 대기방"이면 삭제
            const myOldRef = doc(db, 'couples', userData.coupleId);
            const myOldSnap = await getDoc(myOldRef);
            if (myOldSnap.exists() && !myOldSnap.data().user2) {
                await deleteDoc(myOldRef);
            }
        }

        // 4. 연결 실행
        // 상대방 방에 user2로 들어감 + 코드 만료 처리
        await updateDoc(targetCoupleDoc.ref, {
            user2: currentUser.uid,
            inviteCode: null
        });

        // 내 정보 업데이트
        await updateDoc(doc(db, 'users', currentUser.uid), {
            coupleId: targetCoupleDoc.id
        });

        // 상태 업데이트
        setUserData(prev => ({ ...prev, coupleId: targetCoupleDoc.id }));
        // coupleData는 onSnapshot에 의해 업데이트될 것임
    }

    // ========== DISCONNECT ==========
    async function disconnectCouple() {
        if (!currentUser || !userData?.coupleId) return;

        const coupleId = userData.coupleId;
        const coupleRef = doc(db, 'couples', coupleId);

        // 1. 내 정보에서 coupleId 제거
        await updateDoc(doc(db, 'users', currentUser.uid), {
            coupleId: null
        });

        // 2. couple 문서 처리
        // 상대방이 있는지 확인
        const snap = await getDoc(coupleRef);
        if (snap.exists()) {
            const data = snap.data();
            if (data.user1 === currentUser.uid) {
                // 내가 방장(user1)이었다면 user1 = null
                await updateDoc(coupleRef, { user1: null });
            } else if (data.user2 === currentUser.uid) {
                // 내가 user2 였다면 user2 = null
                await updateDoc(coupleRef, { user2: null });
            }

            // 만약 둘 다 나갔다면 문서 삭제? (선택사항, 데이터 보존 정책에 따라 다름)
            // 여기서는 "완전 초기화"를 원하셨으므로, 둘 중 한 명이라도 나가면 "깨진 커플"이 됨.
            // 상대방도 로그인 시 "어? 커플Id는 있는데 user1/user2 중 하나가 없네?" -> 유령 상태 처리 필요
            // **가장 깔끔한 방법**: 연결 끊으면 그냥 나는 나가고, 남은 사람은 남음.
            // 남은 사람이 나중에 들어왔을 때 "상대방이 연결을 끊었습니다" 메시지 보고 초기화 하게 유도.
        }

        setUserData(prev => ({ ...prev, coupleId: null }));
        setCoupleData(null);
    }

    function logout() {
        setUserData(null);
        setCoupleData(null);
        setIsAdmin(false);
        return signOut(auth);
    }

    function resetPassword(email) { return sendPasswordResetEmail(auth, email); }
    function setAdminMode(status) {
        setIsAdmin(status);
        if (status) {
            setCurrentUser({ uid: 'admin' });
            setUserData({ isAdmin: true });
        }
    }

    // 1. Auth State Observer
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(true);
            if (!user) {
                setUserData(null);
                setCoupleData(null);
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // 2. User Data Subscription
    useEffect(() => {
        if (!currentUser || isAdmin) return;

        console.log("📡 [Auth] Subscribing to user:", currentUser.uid);
        const unsubUser = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
            if (docSnap.exists()) {
                const newData = { ...docSnap.data(), uid: currentUser.uid };
                // Deep equality check to avoid infinite loops if needed, but basic object spread is usually fine if fields change
                setUserData(newData);
            }
            // User loaded, allows couple subscription to start
        });

        return () => unsubUser();
    }, [currentUser, isAdmin]);

    // 3. Couple Data Subscription
    useEffect(() => {
        if (!userData?.coupleId || isAdmin) {
            if (!userData?.coupleId) setCoupleData(null);
            setLoading(false); // User loaded, no couple, stop loading
            return;
        }

        console.log("📡 [Auth] Subscribing to couple:", userData.coupleId);
        const unsubCouple = onSnapshot(doc(db, 'couples', userData.coupleId), (docSnap) => {
            if (docSnap.exists()) {
                setCoupleData({ ...docSnap.data(), id: docSnap.id });
            } else {
                setCoupleData(null);
            }
            setLoading(false); // Couple loaded, stop loading
        }, (err) => {
            console.error("Couple Sync Error:", err);
            setLoading(false);
        });

        return () => unsubCouple();
    }, [userData?.coupleId, isAdmin]);

    // **핵심**: 올바르게 연결된 상태인지 판별
    // coupleData가 존재하고, user1과 user2가 모두 존재해야 함
    const isCoupleConnected = !!(coupleData && coupleData.user1 && coupleData.user2);

    const value = {
        currentUser, userData, coupleData,
        loading, isAdmin, isCoupleConnected,
        signup, login, loginWithGoogle, logout,
        createMyCoupleSpace, connectWithCode, disconnectCouple,
        setAdminMode, resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="flex h-screen items-center justify-center flex-col gap-4">
                    <div className="animate-spin text-4xl">❤️</div>
                    <p className="text-gray-500">로딩중...</p>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}
