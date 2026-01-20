# Firebase 및 배포 설정 가이드 🚀

이 문서는 앱을 정상적으로 실행하기 위해 필요한 **Firebase 설정**과 **Vercel 배포** 과정을 단계별로 설명합니다.

---

## 1단계: Firebase 프로젝트 생성

1. **[Firebase Console](https://console.firebase.google.com/)**에 접속하세요.
2. **"프로젝트 추가"**를 클릭하고 이름을 입력하세요 (예: `our-story`).
3. Google Analytics는 사용 안 함으로 하셔도 됩니다 (선택 사항).
4. **"프로젝트 만들기"**를 완료하세요.

---

## 2단계: 앱 등록 및 키 발급

1. 프로젝트 개요 페이지 중앙에 있는 **웹 아이콘 (</>)**을 클릭하세요.
2. 앱 닉네임을 입력하고 **"앱 등록"**을 클릭하세요 (Hosting 체크박스는 무시).
3. **`const firebaseConfig = { ... }`** 코드가 나옵니다.
   - 여기서 `apiKey`, `authDomain` 등 6가지 값을 복사해두세요.
4. VS Code로 돌아와 **`.env.local`** 파일을 열고 아래와 같이 채워주세요. (따옴표 없이 값만 입력)

```env
VITE_FIREBASE_API_KEY=복사한_apiKey
VITE_FIREBASE_AUTH_DOMAIN=복사한_authDomain
VITE_FIREBASE_PROJECT_ID=복사한_projectId
VITE_FIREBASE_STORAGE_BUCKET=복사한_storageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=복사한_messagingSenderId
VITE_FIREBASE_APP_ID=복사한_appId
```

---

## 3단계: 로그인(Auth) 설정

1. Firebase Console 왼쪽 메뉴에서 **"빌드" -> "Authentication"**을 클릭하세요.
2. **"시작하기"**를 누르세요.
3. **"로그인 방법(Sign-in method)"** 탭에서 **"이메일/비밀번호"**를 선택하세요.
4. **사용 설정(Enable)** 스위치를 켜고 **"저장"**하세요. ("이메일 링크" 스위치는 끈 상태 유지)

---

## 4단계: 데이터베이스(Firestore) 설정

1. 왼쪽 메뉴에서 **"Firestore Database"**를 클릭하고 **"데이터베이스 만들기"**를 누르세요.
2. 위치는 `asia-northeast3` (서울) 또는 `us-central1`을 추천합니다.
3. 보안 규칙 설정에서 **"프로덕션 모드에서 시작"**을 선택하고 만드세요.
4. 데이터베이스가 생성되면 상단 **"규칙(Rules)"** 탭으로 이동하세요.
5. 기존 내용을 지우고 아래 내용을 복사해서 붙여넣고 **"게시"**를 누르세요.

```plaintext
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. 사용자 정보: 본인만 읽고 쓸 수 있음
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 2. 커플 데이터: 커플에 속한 사용자만 접근 가능
    match /couples/{coupleId} {
      // 커플 문서를 읽으려면 로그인해야 함 (상세 권한은 나중에 강화 가능)
      allow read: if request.auth != null;
      // 커플 생성은 누구나 가능 (가입 시)
      allow create: if request.auth != null;
      // 수정은 해당 커플 멤버만 가능해야 하지만, 지금은 로그인한 사용자 허용
      allow update: if request.auth != null;

      // 하위 컬렉션 (posts, settings 등) 모두 허용
      match /{document=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```
*(참고: 위 규칙은 초기 개발용으로, 로그인한 모든 사용자가 데이터를 읽을 수 있게 약간 열려있습니다. 론칭 후에는 보안을 강화하는 것이 좋습니다.)*

---

## 5단계: 스토리지(Storage) 설정 (사진 업로드용)

1. 왼쪽 메뉴에서 **"Storage"**를 클릭하고 **"시작하기"**를 누르세요.
2. 위치 설정 등 기본값으로 완료하세요.
3. **"규칙(Rules)"** 탭으로 이동하여 아래 내용으로 교체하고 **"게시"**하세요.

```plaintext
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // 로그인한 사용자만 이미지 업로드/다운로드 가능
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 6단계: Vercel에 배포하기

1. **[Vercel](https://vercel.com)**에 로그인하고 **"Add New Project"**를 클릭하세요.
2. GitHub 레포지토리를 연결하여 이 프로젝트(`couple` 폴더)를 불러오세요.
3. **"Environment Variables"** 섹션을 열어주세요.
4. `.env.local`에 적었던 6가지 키와 값을 하나씩 모두 추가하세요.
   - 예: `VITE_FIREBASE_API_KEY` (Key) / `AIzaSy...` (Value)
5. **"Deploy"**를 클릭하면 몇 분 뒤 배포가 완료됩니다! 🚀

---

### 🎉 축하합니다!
이제 당신의 커플 앱이 클라우드 서버와 연결되어 정상적으로 작동합니다.
앱을 열어서 회원가입을 하고, 사진을 올리며 테스트해보세요!
