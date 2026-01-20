export const THEMES = [
    { id: 'simple', name: 'Simple', color: '#171717', emoji: '🖤' },
    { id: 'dark', name: 'Dark', color: '#1e293b', emoji: '🌙' },
    { id: 'cat', name: 'Cat', color: '#ff6b7e', emoji: '🐱' },
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
