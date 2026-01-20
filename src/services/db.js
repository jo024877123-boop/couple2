/* ... existing imports ... */
import {
    collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
    query, orderBy, onSnapshot, serverTimestamp, where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

/* --- Settings --- */
export const getCoupleSettings = async (coupleId) => {
    const docRef = doc(db, 'couples', coupleId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data();
    return null;
};

// Fetch all users belonging to a couple (for "Name ❤️ Name")
export const getCoupleUsers = async (coupleId) => {
    const q = query(collection(db, 'users'), where('coupleId', '==', coupleId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};

export const subscribeCoupleUsers = (coupleId, callback) => {
    const q = query(collection(db, 'users'), where('coupleId', '==', coupleId));
    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        callback(users);
    });
};

// Find couple by invite code
export const findCoupleByInviteCode = async (inviteCode) => {
    const q = query(collection(db, 'couples'), where('inviteCode', '==', inviteCode));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    return null;
};

export const updateCoupleSettings = async (coupleId, settings) => {
    const docRef = doc(db, 'couples', coupleId);
    const { id, ...data } = settings; // Remove ID if exists
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

/* --- Posts (Feed) --- */
export const subscribePosts = (coupleId, callback) => {
    const q = query(
        collection(db, `couples/${coupleId}/posts`),
        orderBy('date', 'desc')
        // Removing secondary sort 'createdAt' to avoid index requirements for now
    );
    return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(posts);
    }, (error) => {
        console.error("Post subscription error:", error);
        if (error.code === 'permission-denied') alert('데이터 접근 권한이 없습니다.');
        if (error.code === 'failed-precondition') alert('쿼리 인덱스가 필요합니다. (개발자 확인 필요)');
    });
};

export const addPost = async (coupleId, post) => {
    await addDoc(collection(db, `couples/${coupleId}/posts`), {
        ...post,
        createdAt: serverTimestamp()
    });
};

export const updatePost = async (coupleId, postId, data) => {
    const docRef = doc(db, `couples/${coupleId}/posts`, postId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deletePost = async (coupleId, postId) => {
    const docRef = doc(db, `couples/${coupleId}/posts`, postId);
    await deleteDoc(docRef);
};

/* --- Checklist Groups --- */
export const subscribeChecklistGroups = (coupleId, callback) => {
    const q = query(collection(db, `couples/${coupleId}/checklist_groups`), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(items);
    });
};
export const addChecklistGroup = async (coupleId, group) => {
    await addDoc(collection(db, `couples/${coupleId}/checklist_groups`), { ...group, createdAt: serverTimestamp() });
};
export const deleteChecklistGroup = async (coupleId, groupId) => {
    await deleteDoc(doc(db, `couples/${coupleId}/checklist_groups`, groupId));
};

/* --- Checklist Items --- */
export const subscribeChecklist = (coupleId, callback) => {
    const q = query(collection(db, `couples/${coupleId}/checklist`), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(items);
    });
};

export const addChecklistItem = async (coupleId, item) => {
    await addDoc(collection(db, `couples/${coupleId}/checklist`), { ...item, createdAt: serverTimestamp() });
};

export const updateChecklistItem = async (coupleId, itemId, data) => {
    await updateDoc(doc(db, `couples/${coupleId}/checklist`, itemId), data);
};

export const deleteChecklistItem = async (coupleId, itemId) => {
    await deleteDoc(doc(db, `couples/${coupleId}/checklist`, itemId));
};

/* --- Bucket List --- */
export const subscribeBucketList = (coupleId, callback) => {
    const q = query(collection(db, `couples/${coupleId}/bucketlist`), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(items);
    });
};

export const addBucketItem = async (coupleId, item) => {
    await addDoc(collection(db, `couples/${coupleId}/bucketlist`), { ...item, createdAt: serverTimestamp() });
};

export const updateBucketItem = async (coupleId, itemId, data) => {
    await updateDoc(doc(db, `couples/${coupleId}/bucketlist`, itemId), data);
};

export const deleteBucketItem = async (coupleId, itemId) => {
    await deleteDoc(doc(db, `couples/${coupleId}/bucketlist`, itemId));
};

/* --- Storage (Media) --- */
export const uploadMedia = async (file, userPath) => {
    const timestamp = Date.now();
    const storagePath = `${userPath}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);

    return { url, type: file.type.startsWith('video') ? 'video' : 'image', path: storagePath };
};

/* --- Admin Functions --- */
export const getAllCouples = async () => {
    const snapshot = await getDocs(collection(db, 'couples'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/* --- User Profile --- */
export const updateUserProfile = async (userId, data) => {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const uploadProfilePhoto = async (userId, file) => {
    const storageRef = ref(storage, `profiles/${userId}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateUserProfile(userId, { photoURL: url });
    return url;
};
