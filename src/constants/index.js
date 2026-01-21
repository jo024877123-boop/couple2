export const THEMES = [
    { id: 'simple', name: '심플', color: '#171717', emoji: '🖤', unlockLevel: 1 },
    { id: 'dark', name: '다크', color: '#1e293b', emoji: '🌙', unlockLevel: 1 },
    { id: 'cat', name: '고양이', color: '#ff6b7e', emoji: '🐱', unlockLevel: 1 },
    { id: 'pixel', name: '픽셀 게임', color: '#22c55e', emoji: '👾', unlockLevel: 3, description: '레트로 게임 감성' },
    { id: 'crayon', name: '크레파스', color: '#facc15', emoji: '🖍️', unlockLevel: 4, description: '몽글몽글 손그림 감성' },
    { id: 'galaxy', name: '갤럭시', color: '#6366f1', emoji: '🪐', unlockLevel: 5, description: '신비로운 우주 여행' },
];

export const LEVELS = [
    { level: 1, minExp: 0, next: 150, icon: '🌱', label: '사랑의 씨앗', desc: '작은 씨앗을 심었어요' },
    { level: 2, minExp: 150, next: 600, icon: '🌿', label: '반짝이는 새싹', desc: '사랑이 싹트고 있어요' },
    { level: 3, minExp: 600, next: 2000, icon: '🎋', label: '자라나는 줄기', desc: '쑥쑥 자라고 있네요', reward: '👾 픽셀 테마 해금!' },
    { level: 4, minExp: 2000, next: 4000, icon: '🌳', label: '튼튼한 나무', desc: '비바람에도 끄떡없어요', reward: '🖍️ 크레파스 테마 해금!' },
    { level: 5, minExp: 4000, next: 7000, icon: '✨', label: '풍성한 나무', desc: '그늘이 되어줄게요', reward: '🪐 갤럭시 테마 해금!' },
    { level: 6, minExp: 7000, next: 10000, icon: '🌸', label: '꽃 피운 나무', desc: '향기로운 추억이 가득' },
    { level: 7, minExp: 10000, next: Infinity, icon: '🍎', label: '사랑의 결실', desc: '영원한 사랑을 맹세해요', reward: '💖 히든 엔딩 해금' },
];

export const ACHIEVEMENTS = [
    { id: 'visit_7', title: '설레는 일주일', description: '7일 동안 매일매일 만나러 왔어요', target: 7, type: 'visit', reward: 50 },
    { id: 'visit_30', title: '한 달의 기적', description: '30일 개근! 성실한 사랑꾼', target: 30, type: 'visit', reward: 100 },
    { id: 'visit_100', title: '백일의 약속', description: '100일 동안 변함없이 찾아왔어요', target: 100, type: 'visit', reward: 300 },
    { id: 'visit_365', title: '일 년의 여정', description: '365일, 사계절을 함께 했어요', target: 365, type: 'visit', reward: 500 },

    { id: 'post_5', title: '추억의 시작', description: '소중한 추억 5개를 기록했어요', target: 5, type: 'post', reward: 50 },
    { id: 'post_10', title: '기록 꿈나무', description: '벌써 10개의 이야기가 쌓였네요', target: 10, type: 'post', reward: 100 },
    { id: 'post_50', title: '추억 수집가', description: '50개의 순간들을 영원히 간직해요', target: 50, type: 'post', reward: 300 },
    { id: 'post_100', title: '우리만의 역사책', description: '100개의 기록, 한 권의 책이 되었어요', target: 100, type: 'post', reward: 500 },

    { id: 'balance_1', title: '선택의 시작', description: '밸런스 게임에 처음 참여했어요', target: 1, type: 'balance', reward: 30 },
    { id: 'balance_10', title: '서로를 알아가는 중', description: '밸런스 게임 10회 완료!', target: 10, type: 'balance', reward: 100 },
    { id: 'balance_30', title: '취향 저격수', description: '밸런스 게임 30회 완료!', target: 30, type: 'balance', reward: 200 },
];

export const MOOD_OPTIONS = [
    { id: 'happy', icon: 'smile', label: '행복', color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { id: 'neutral', icon: 'meh', label: '그저그럼', color: 'text-gray-500', bg: 'bg-gray-50' },
    { id: 'fun', icon: 'laugh', label: '즐거움', color: 'text-pink-500', bg: 'bg-pink-50' },
    { id: 'love', icon: 'heart', label: '사랑스러움', color: 'text-red-500', bg: 'bg-red-50' },
    { id: 'angry', icon: 'frown', label: '화남', color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'gloom', icon: 'cloud-rain', label: '우울', color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'sad', icon: 'droplet', label: '슬픔', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'lucky', icon: 'sparkles', label: '행운', color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

export const MEMO_COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5856D6', '#FF2D55', '#00C7BE'];

export const SAMPLE_POSTS = [
    {
        id: '1', content: '첫 데이트 날, 같이 산책하면서 커피 마셨던 그 순간이 아직도 생생해요. 💗',
        location: '한강공원',
        media: [
            { url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800', type: 'image' },
            { url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800', type: 'image' },
        ],
        thumbnailIndex: 0, mood: 'love', date: '2025-11-15', author: 'me',
    },
    {
        id: '2', content: '같이 본 영화 너무 재밌었어! 팝콘도 맛있었고 😊',
        location: 'CGV 강남',
        media: [{ url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800', type: 'image' }],
        thumbnailIndex: 0, mood: 'happy', date: '2025-12-24', author: 'partner',
    },
    {
        id: '3', content: '우리 100일 기념 제주도 여행! 바다가 너무 예뻤어 🌊',
        location: '제주도 협재해변',
        media: [
            { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', type: 'image' },
            { url: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=800', type: 'image' },
            { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', type: 'image' },
        ],
        thumbnailIndex: 0, mood: 'excited', date: '2026-01-10', author: 'me',
    }
];
