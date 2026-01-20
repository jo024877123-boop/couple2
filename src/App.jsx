import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
// Force redeploy trigger
import Icon from './components/ui/Icon';
import { THEMES, MOOD_OPTIONS, SAMPLE_POSTS, MEMO_COLORS } from './constants';
import './styles/index.css';




import PostCard from './components/ui/PostCard';
import ChecklistItem from './components/ui/ChecklistItem';
import BucketItem from './components/ui/BucketItem';
import CalendarView from './components/features/CalendarView';
import BottomSheet from './components/ui/BottomSheet';
import InstallGuide from './components/ui/InstallGuide';
import LoginView from './components/features/LoginView'; // Login View
import OnboardingView from './components/features/OnboardingView'; // Onboarding
import AdminDashboard from './components/features/AdminDashboard'; // Admin Dashboard
import GrowthWidget from './components/features/GrowthWidget'; // Growth Widget
import AchievementModal from './components/features/AchievementModal'; // Achievement Modal
import { useDrag } from '@use-gesture/react';
import { useAuth } from './context/AuthContext'; // Auth Hook
import {
  getCoupleSettings, updateCoupleSettings,
  subscribePosts, addPost, updatePost, deletePost, uploadMedia, subscribeCoupleUsers,
  subscribeChecklist, addChecklistItem, updateChecklistItem, deleteChecklistItem,
  subscribeBucketList, addBucketItem, updateBucketItem, deleteBucketItem,
  subscribeChecklistGroups, addChecklistGroup, deleteChecklistGroup,
  getCoupleUsers, updateUserProfile, uploadProfilePhoto,
  subscribeAnniversaries, addAnniversary, updateAnniversary, deleteAnniversary
} from './services/db';
// Cat Theme Click Interaction
const useCatEffect = (theme) => {
  useEffect(() => {
    if (theme !== 'cat') return;

    const handleClick = (e) => {
      const paw = document.createElement('div');
      paw.innerHTML = '🐾';
      paw.style.position = 'fixed';
      paw.style.left = `${e.clientX}px`;
      paw.style.top = `${e.clientY}px`;
      paw.style.transform = 'translate(-50%, -50%) scale(0.5)';
      paw.style.pointerEvents = 'none';
      paw.style.fontSize = '24px';
      paw.style.opacity = '1';
      paw.style.transition = 'all 0.8s ease-out';
      paw.style.zIndex = '9999';
      document.body.appendChild(paw);

      // Random Meow Text occasionally
      if (Math.random() > 0.7) {
        const meow = document.createElement('div');
        const meows = ['야옹!', 'Meow', '골골..', '꾹꾹'];
        meow.innerText = meows[Math.floor(Math.random() * meows.length)];
        meow.style.position = 'fixed';
        meow.style.left = `${e.clientX + 20}px`;
        meow.style.top = `${e.clientY - 20}px`;
        meow.style.fontSize = '14px';
        meow.style.fontWeight = 'bold';
        meow.style.color = '#ff6b7e';
        meow.style.pointerEvents = 'none';
        meow.style.animation = 'float 1s ease-out forwards';
        meow.style.zIndex = '9999';
        document.body.appendChild(meow);
        setTimeout(() => meow.remove(), 1000);
      }

      requestAnimationFrame(() => {
        paw.style.transform = `translate(-50%, -50%) scale(1.2) rotate(${Math.random() * 40 - 20}deg)`;
        paw.style.opacity = '0';
        paw.style.top = `${e.clientY - 50}px`;
      });

      setTimeout(() => paw.remove(), 800);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [theme]);
};



// 심플하고 세련된 로고 (Intertwined Lines 컨셉)
const Logo = ({ size = 40, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={`text-theme-500 fill-none stroke-current ${className}`} xmlns="http://www.w3.org/2000/svg">
    {/* Intertwined Lines: 추상적인 두 사람의 인연 */}
    <path d="M30 40 C30 10, 70 10, 70 40 C70 70, 30 70, 30 40 Z" strokeWidth="4.5" className="animate-float" style={{ animationDelay: '0s' }} />
    <path d="M70 60 C70 90, 30 90, 30 60 C30 30, 70 30, 70 60 Z" strokeWidth="4.5" className="animate-float" style={{ animationDelay: '1.5s' }} />
    <circle cx="50" cy="50" r="3" fill="currentColor" className="animate-pulse" />
  </svg>
);

const App = () => {
  const { currentUser, userData, logout, connectWithCode, generateInviteCode, startNewCouple, disconnectCouple, isAdmin, setUserData } = useAuth();
  const [adminViewTarget, setAdminViewTarget] = useState(null); // Couple ID to monitor

  // Settings State (Default values with LocalStorage Fallback)
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('couple_settings');
      const initial = {
        coupleName: '우리', anniversaryDate: new Date().toISOString().split('T')[0],
        myName: '나', partnerName: '당신', theme: 'simple', appTitle: 'Our Story', appSubtitle: '우리의 이야기',
        customTabs: { feed: 'Timeline', gallery: 'Gallery', checklist: 'Checklist', bucket: 'Bucket List', calendar: 'Anniversary' },
        customHeaders: { feed: '우리의 모든 순간', gallery: '추억 저장소', checklist: '체크리스트', bucket: '버킷리스트', calendar: '우리의 기념일' },
        customIcons: { feed: '📖', gallery: '🖼️', checklist: '✅', bucket: '⭐', calendar: '📅' },
        adminPassword: '11'
      };
      return saved ? { ...initial, ...JSON.parse(saved) } : initial;
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
      return {
        coupleName: '우리', anniversaryDate: new Date().toISOString().split('T')[0],
        myName: '나', partnerName: '당신', theme: 'simple', appTitle: 'Our Story', appSubtitle: '우리의 이야기',
        customTabs: { feed: 'Timeline', gallery: 'Gallery', checklist: 'Checklist', bucket: 'Bucket List', calendar: 'Anniversary' },
        customHeaders: { feed: '우리의 모든 순간', gallery: '추억 저장소', checklist: '체크리스트', bucket: '버킷리스트', calendar: '우리의 기념일' },
        customIcons: { feed: '📖', gallery: '🖼️', checklist: '✅', bucket: '⭐', calendar: '📅' },
        adminPassword: '11'
      };
    }
  });

  const [posts, setPosts] = useState([]); // Loaded from DB
  const [coupleUsers, setCoupleUsers] = useState([]);

  const [activeTab, setActiveTabState] = useState('feed');
  const [direction, setDirection] = useState('right');
  const tabOrder = ['feed', 'gallery', 'checklist', 'bucket', 'calendar'];

  const setActiveTab = (newTab) => {
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    setDirection(newIndex > currentIndex ? 'right' : 'left');
    setActiveTabState(newTab);
  };

  // Wrap interactions without sound
  const handleModalOpen = () => { setIsModalOpen(true); };
  const handleThemePicker = () => { setIsThemePickerOpen(true); };
  const handleSettingsOpen = () => { setIsSettingsOpen(true); };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isAchievementOpen, setIsAchievementOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Apply Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') setDeferredPrompt(null);
      });
    } else {
      setIsInstallGuideOpen(true);
    }
  };

  // Gestures
  const bind = useDrag(({ swipe: [swipeX, swipeY], cancel }) => {
    // Pull to Refresh (Down swipe on top)
    if (swipeY === 1 && window.scrollY === 0) {
      cancel();
      window.location.reload();
      return;
    }
    // Tab Swipe
    if (swipeX !== 0) {
      const curr = tabOrder.indexOf(activeTab);
      if (swipeX === -1 && curr < tabOrder.length - 1) setActiveTab(tabOrder[curr + 1]);
      if (swipeX === 1 && curr > 0) setActiveTab(tabOrder[curr - 1]);
    }
  }, { filterTaps: true, rubberband: true });

  // Apply Cat Theme Effect
  useCatEffect(settings.theme);

  const [newPost, setNewPost] = useState({
    content: '', location: '', media: [], thumbnailIndex: 0,
    mood: 'happy', date: new Date().toISOString().split('T')[0]
  });

  // 체크리스트 상태
  // 체크리스트 상태
  // 체크리스트 & 버킷리스트 상태
  const [checklistGroups, setChecklistGroups] = useState([{ id: 'default', name: '기본 그룹' }]);
  const [selectedGroupId, setSelectedGroupId] = useState('default');
  const [checklist, setChecklist] = useState([]);
  const [bucketList, setBucketList] = useState([]);
  const [calendarNotes, setCalendarNotes] = useState({});
  const [anniversaries, setAnniversaries] = useState([]);

  const [newCheckItem, setNewCheckItem] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [checklistEditMode, setChecklistEditMode] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [newBucketItem, setNewBucketItem] = useState('');

  // 홈 위젯 상태
  const [dDayImage, setDDayImage] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ my: '오늘 기분 어때요?', partner: '보고 싶어요 💕' });
  const [isDateRecommendOpen, setIsDateRecommendOpen] = useState(false);
  const [recommendedDate, setRecommendedDate] = useState(null);
  const [galleryMode, setGalleryMode] = useState('grid');

  const DATE_COURSES = [
    { title: '한강 치맥 & 산책', icon: 'beer' }, { title: '공방에서 커플템 만들기', icon: 'hammer' },
    { title: '따뜻한 집에서 넷플릭스', icon: 'tv' }, { title: '분위기 좋은 와인바', icon: 'wine' },
    { title: '동네 맛집 탐방', icon: 'utensils' }, { title: '교복 입고 놀이공원', icon: 'ticket' },
    { title: '전시회 관람로 감성 충전', icon: 'image' }, { title: '볼링/포켓볼 내기', icon: 'trophy' },
    { title: '만화카페에서 뒹굴거리기', icon: 'book-open' }, { title: '근교 드라이브 & 카페', icon: 'car' }
  ];

  const recommendDate = () => {
    const random = DATE_COURSES[Math.floor(Math.random() * DATE_COURSES.length)];
    setRecommendedDate(random);
    setIsDateRecommendOpen(true);
  };

  // Firebase Data Subscription
  useEffect(() => {
    if (!userData?.coupleId) return;

    // 1. Settings Fetch & Attendance Check
    getCoupleSettings(userData.coupleId).then(async data => {
      if (data) setSettings(prev => ({ ...prev, ...data }));

      // Love Tree Growth & Attendance Logic
      const today = new Date().toISOString().slice(0, 10);
      let growth = data?.growth || { level: 1, exp: 0, lastVisit: '', totalVisits: 0, achievements: [] };

      if (growth.lastVisit !== today) {
        // Daily attendance reward
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        // If last visit was yesterday, streak logic could go here (omitted for simple accumulation)

        growth.lastVisit = today;
        growth.totalVisits = (growth.totalVisits || 0) + 1;
        growth.exp = (growth.exp || 0) + 10; // Daily EXP

        // Check Attendance Achievements
        const achievements = growth.achievements || [];
        const checkAchieve = (target, id, reward) => {
          if (growth.totalVisits >= target && !achievements.includes(id)) {
            achievements.push(id);
            growth.exp += reward;
            alert(`🏆 업적 달성! "출석 ${target}일" (+${reward} XP)`);
          }
        };

        checkAchieve(7, 'visit_7', 50);
        checkAchieve(30, 'visit_30', 100);
        checkAchieve(100, 'visit_100', 300);
        checkAchieve(365, 'visit_365', 500);

        growth.achievements = achievements;

        // Save updated growth
        await updateCoupleSettings(userData.coupleId, { growth });
        setSettings(prev => ({ ...prev, growth }));
        console.log('Daily attendance checked:', growth);
      }
    });
    // 2. Subscriptions
    const unsubUsers = subscribeCoupleUsers(userData.coupleId, setCoupleUsers); // Real-time users update
    const unsubPosts = subscribePosts(userData.coupleId, setPosts);
    const unsubCheckGroups = subscribeChecklistGroups(userData.coupleId, (groups) => {
      setChecklistGroups(groups.length ? groups : [{ id: 'default', name: '기본 그룹' }]);
    });
    const unsubChecklist = subscribeChecklist(userData.coupleId, setChecklist);
    const unsubBucket = subscribeBucketList(userData.coupleId, setBucketList);
    const unsubAnniversaries = subscribeAnniversaries(userData.coupleId, setAnniversaries);

    return () => {
      unsubUsers();
      unsubPosts();
      unsubCheckGroups();
      unsubChecklist();
      unsubBucket();
      unsubAnniversaries();
    };
  }, [userData?.coupleId]);

  // Scroll effect - must be before conditional returns
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // dDay calculation - must be before conditional returns (Day 1 = anniversary date itself)
  const dDay = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const anniversary = new Date(settings.anniversaryDate);
    anniversary.setHours(0, 0, 0, 0);
    const diff = Math.abs(today - anniversary);
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1; // +1 to count from day 1
  }, [settings.anniversaryDate]);

  const isConnected = !!(settings.user1 && settings.user2) || coupleUsers.length >= 2;

  // Login Check
  if (!currentUser) return <LoginView />;
  if (!userData?.coupleId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <div className="animate-spin text-4xl">⏳</div>
        <p className="text-gray-500 text-sm">데이터를 불러오고 있습니다...</p>
        <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
          <p className="font-mono">currentUser: {currentUser ? '✓' : '✗'}</p>
          <p className="font-mono">userData: {userData ? '✓' : '✗'}</p>
          <p className="font-mono">coupleId: {userData?.coupleId || '없음'}</p>
        </div>
        <button onClick={() => {
          if (confirm('로그아웃 하시겠습니까?')) logout();
        }} className="mt-4 px-6 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-600 shadow-sm hover:bg-gray-50 transition-all">
          로그아웃 및 재시도
        </button>
      </div>
    );
  }

  // Onboarding Check
  if (!isAdmin && !userData?.onboardingCompleted) {
    return <OnboardingView userData={userData} coupleId={userData.coupleId} userId={currentUser.uid} onComplete={() => setUserData({ ...userData, onboardingCompleted: true })} />;
  }

  // Admin Dashboard View
  if (isAdmin && !adminViewTarget) {
    return <AdminDashboard onSelectCouple={(coupleId) => {
      setAdminViewTarget(coupleId);
      setUserData({ coupleId }); // Fake coupleId for App to load data
    }} />;
  }

  // Admin Monitoring Header (Overlay)
  const AdminOverlay = () => isAdmin ? (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white z-50 px-4 py-2 flex justify-between items-center shadow-lg">
      <span className="font-bold flex items-center gap-2"><Icon name="eye" size={16} /> 관리자 모니터링 모드</span>
      <button onClick={() => {
        setAdminViewTarget(null);
        setUserData({ name: '관리자', coupleId: null });
      }} className="bg-white text-red-600 px-3 py-1 rounded text-sm font-bold">목록으로</button>
    </div>
  ) : null;



  const handleSettingsUpdate = async (newSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('couple_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }

    if (userData?.coupleId) {
      try {
        console.log('Saving settings...', newSettings);
        await updateCoupleSettings(userData.coupleId, newSettings);
        console.log('Settings saved!');
      } catch (error) {
        console.error("Failed to update settings:", error);
        alert(`저장 실패: ${error.message} (${error.code})`);
      }
    } else {
      console.warn("Couple ID missing, saved locally only.");
    }
  };

  const handleAddPost = async (e) => {
    e.preventDefault();

    // 1. Check Connection
    if (!isConnected) {
      alert("⚠️ 커플 연결이 되어있지 않습니다.\n설정에서 파트너와 연결 후 작성해주세요.");
      return;
    }

    // 2. Check Content
    if (!newPost.content.trim() && newPost.media.length === 0) {
      alert("내용이나 사진을 입력해주세요.");
      return;
    }

    // 3. Confirm Save
    if (!confirm("소중한 추억을 저장하시겠습니까?")) return;

    try {
      // Media Upload Logic
      const processedMedia = [];
      if (newPost.media.length > 0) {
        // Uploading indicator could be added here
        for (const m of newPost.media) {
          if (m.file) {
            // Upload File object
            const result = await uploadMedia(m.file, `couples/${userData.coupleId}/posts`);
            processedMedia.push(result);
          } else if (m.url && m.url.startsWith('data:')) {
            // Convert Base64 to Blob and Upload
            const res = await fetch(m.url);
            const blob = await res.blob();
            const file = new File([blob], m.name || `file_${Date.now()}`, { type: m.type === 'video' ? 'video/mp4' : 'image/jpeg' });
            const result = await uploadMedia(file, `couples/${userData.coupleId}/posts`);
            processedMedia.push(result);
          } else {
            // Assume it's already a URL
            processedMedia.push(m);
          }
        }
      }

      const post = {
        ...newPost,
        media: processedMedia,
        author: currentUser.uid,
        date: newPost.date,
      };

      await addPost(userData.coupleId, post);

      // Growth Logic: Post Creation Reward
      const growth = settings.growth || { level: 1, exp: 0, lastVisit: '', totalVisits: 0, achievements: [] };
      let newExp = (growth.exp || 0) + 5; // +5 XP per post
      let newAchievements = [...(growth.achievements || [])];
      let expBonus = 0;

      const currentPostCount = (posts?.length || 0) + 1;
      const checkPostAchieve = (target, id, reward) => {
        if (currentPostCount >= target && !newAchievements.includes(id)) {
          newAchievements.push(id);
          expBonus += reward;
          alert(`✍️ 업적 달성! "추억 기록 ${target}개" (+${reward} XP)`);
        }
      };

      checkPostAchieve(5, 'post_5', 50);
      checkPostAchieve(10, 'post_10', 100);
      checkPostAchieve(50, 'post_50', 300);
      checkPostAchieve(100, 'post_100', 500);

      if (expBonus > 0 || newExp !== growth.exp) {
        const newGrowth = { ...growth, exp: newExp + expBonus, achievements: newAchievements };
        await updateCoupleSettings(userData.coupleId, { growth: newGrowth });
        setSettings(prev => ({ ...prev, growth: newGrowth }));
      }

      alert("✨ 추억이 저장되었습니다! (+5 XP) 💕");
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('게시글을 업로드하는 중 오류가 발생했습니다.\n' + err.message);
    }
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    if (!editingPost) return;
    await updatePost(userData.coupleId, editingPost.id, editingPost);
    setEditingPost(null);
  };

  const handleDeletePost = async (id) => {
    await deletePost(userData.coupleId, id);
    setDeleteConfirm(null);
    setSelectedPost(null);
  };

  const resetForm = () => {
    setNewPost({ content: '', location: '', media: [], thumbnailIndex: 0, mood: 'happy', date: new Date().toISOString().split('T')[0] });
  };

  const getMoodInfo = (moodId) => MOOD_OPTIONS.find(m => m.id === moodId) || MOOD_OPTIONS[0];

  const handleDDayImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setDDayImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`min-h-screen text-primary ${isAdmin ? 'pt-12' : ''}`}>
      <AdminOverlay />

      {/* 사이드바 */}
      {/* 사이드바 (데스크탑) */}
      <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 ${isSidebarCollapsed ? 'w-20' : 'w-72'} glass border-r border-theme-100 flex-col transition-all duration-300 z-30`}>
        {/* 토글 버튼 */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-9 w-6 h-6 bg-white border border-theme-100 rounded-full flex items-center justify-center shadow-md text-secondary hover:text-theme-500 transition-all z-40 hover:scale-110"
        >
          <Icon name={isSidebarCollapsed ? 'chevron-right' : 'chevron-left'} size={14} />
        </button>

        <div className={`p-6 mb-2 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-4'} transition-all`}>
          <div className="shrink-0 cursor-pointer" onClick={() => setActiveTab('feed')}>
            <Logo size={40} className="hover:scale-110 transition-transform duration-500" />
          </div>
          {!isSidebarCollapsed && (
            <div className="overflow-hidden whitespace-nowrap animate-fadeIn">
              <span className="font-black text-xl text-primary block truncate transition-colors duration-300">
                {coupleUsers.length === 2
                  ? <span className="text-base">{coupleUsers[0].name} <span className="text-red-500">❤️</span> {coupleUsers[1].name}</span>
                  : (settings.appTitle || 'Our Story')}
              </span>
              <p className="text-xs text-secondary font-medium truncate">{settings.appSubtitle || '우리의 이야기'}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-2 overflow-y-auto scrollbar-hide">
          {[
            { id: 'feed', icon: 'layout-grid', label: '타임라인' },
            { id: 'gallery', icon: 'image', label: '갤러리' },
            { id: 'checklist', icon: 'check-square', label: '체크리스트' },
            { id: 'bucket', icon: 'star', label: '버킷리스트' },
            { id: 'calendar', icon: 'calendar-days', label: '기념일' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-4'} py-3.5 rounded-2xl font-semibold transition-all btn-bounce ${activeTab === tab.id ? 'bg-theme-100 text-theme-600 shadow-sm' : 'text-secondary hover:bg-theme-50'
                }`} title={isSidebarCollapsed ? tab.label : ''}>
              <Icon name={tab.icon} size={22} className={activeTab === tab.id ? 'text-theme-500' : ''} />
              {!isSidebarCollapsed && <span>{settings.customTabs ? settings.customTabs[tab.id] : tab.label}</span>}
              {!isSidebarCollapsed && activeTab === tab.id && <div className="ml-auto w-1.5 h-1.5 bg-theme-500 rounded-full" />}
            </button>
          ))}
        </nav>

        {!isSidebarCollapsed ? (
          <div className="relative overflow-hidden p-4 mx-2 mt-auto mb-4 bg-gradient-to-br from-theme-50 to-pink-50 rounded-3xl border border-theme-100 animate-fadeInUp group shadow-sm transition-all hover:shadow-md">
            {dDayImage && (
              <>
                <img src={dDayImage} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
              </>
            )}
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl animate-bounce-slow drop-shadow-md">💕</span>
                <p className={`text-xs font-bold uppercase tracking-wider ${dDayImage ? 'text-white/90 drop-shadow-sm' : 'text-theme-500'}`}>함께한 지</p>
              </div>
              <p className={`text-3xl font-black tracking-tight ${dDayImage ? 'text-white drop-shadow-md' : 'text-theme-600'}`}>
                {dDay}<span className={`text-sm font-medium ml-1 ${dDayImage ? 'text-white/80' : 'text-theme-400'}`}>days</span>
              </p>
            </div>
            <div className="absolute top-2 right-2 flex gap-1 z-20 opacity-30 hover:opacity-100 transition-opacity duration-200">
              {dDayImage && (
                <button
                  onClick={(e) => { e.stopPropagation(); setDDayImage(null); }}
                  className="p-1.5 bg-black/20 hover:bg-black/50 backdrop-blur-md rounded-full text-white transition-all btn-bounce"
                  title="배경 삭제"
                >
                  <Icon name="x" size={12} />
                </button>
              )}
              <label className="p-1.5 bg-black/20 hover:bg-black/50 backdrop-blur-md rounded-full text-white cursor-pointer transition-all btn-bounce" title="배경 사진 변경">
                <Icon name="camera" size={12} />
                <input type="file" accept="image/*" className="hidden" onChange={handleDDayImageUpload} />
              </label>
            </div>
          </div>
        ) : (
          <div className="mt-auto mb-6 flex flex-col items-center gap-1 animate-fadeIn">
            <span className="text-xl">💕</span>
            <span className="text-xs font-bold text-theme-500">{dDay}</span>
          </div>
        )}

        <div className={`p-4 ${isSidebarCollapsed ? 'flex-col gap-4 items-center' : 'flex gap-2'}`}>
          <button onClick={() => setIsProfileOpen(true)} className={`flex items-center justify-center ${isSidebarCollapsed ? 'w-10 h-10 rounded-full' : 'flex-1 px-4 py-3 rounded-xl'} text-secondary hover:text-theme-500 hover:bg-theme-50 transition-all btn-bounce`}>
            <Icon name="user" size={20} />
            {!isSidebarCollapsed && <span className="text-sm font-medium ml-2">내 정보</span>}
          </button>
          <button onClick={handleThemePicker} className={`flex items-center justify-center ${isSidebarCollapsed ? 'w-10 h-10 rounded-full' : 'flex-1 px-4 py-3 rounded-xl'} text-secondary hover:text-theme-500 hover:bg-theme-50 transition-all btn-bounce`}>
            <Icon name="palette" size={20} />
            {!isSidebarCollapsed && <span className="text-sm font-medium ml-2">테마</span>}
          </button>
          <button onClick={handleSettingsOpen} className={`flex items-center justify-center ${isSidebarCollapsed ? 'w-10 h-10 rounded-full' : 'flex-1 px-4 py-3 rounded-xl'} text-secondary hover:text-theme-500 hover:bg-theme-50 transition-all btn-bounce`}>
            <Icon name="settings" size={20} />
            {!isSidebarCollapsed && <span className="text-sm font-medium ml-2">설정</span>}
          </button>
        </div>

        {/* PWA Install Button (Sidebar - Always Visible) */}
        <div className="px-4 mb-4">
          <button onClick={handleInstallClick} className={`w-full py-3 rounded-xl gradient-theme text-white shadow-theme btn-bounce flex items-center justify-center ${isSidebarCollapsed ? 'px-0' : 'gap-2'}`}>
            <Icon name="download" size={20} />
            {!isSidebarCollapsed && <span className="font-bold text-sm">앱 설치하기</span>}
          </button>
        </div>

        {/* Logout Button */}
        <div className="px-4 mb-4">
          <button onClick={() => { if (confirm('로그아웃 하시겠습니까?')) logout(); }} className={`w-full py-3 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 transition-all btn-bounce flex items-center justify-center ${isSidebarCollapsed ? 'px-0' : 'gap-2'}`}>
            <Icon name="log-out" size={18} />
            {!isSidebarCollapsed && <span className="font-bold text-sm">로그아웃</span>}
          </button>
        </div>
      </aside>

      {/* 모바일 헤더 */}
      <header className={`lg:hidden sticky top-0 border-b border-theme-100 z-30 px-4 transition-all duration-300 flex justify-between items-center ${isScrolled ? 'py-2 bg-white/95 backdrop-blur-md shadow-sm' : 'py-4 bg-transparent backdrop-blur-sm'}`}>
        <div
          onClick={() => { setActiveTab('feed'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex items-center gap-2 transition-transform duration-300 ${isScrolled ? 'scale-95 origin-left' : 'scale-100'} cursor-pointer active:opacity-80`}
        >
          <button onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(true); }} className="mr-1 text-secondary p-1 active:scale-90 transition-transform">
            <Icon name="menu" size={24} />
          </button>
          <Logo size={isScrolled ? 28 : 34} />
          <span className="font-black text-lg bg-gradient-to-r from-theme-500 to-pink-500 bg-clip-text text-transparent truncate max-w-[140px] flex items-center">
            {settings.appTitle || (
              coupleUsers.length === 2
                ? <span className="text-sm text-black flex items-center gap-1"><span className="truncate max-w-[60px]">{coupleUsers[0].name}</span> <span className="text-red-500 shrink-0 text-[10px]">❤️</span> <span className="truncate max-w-[60px]">{coupleUsers[1].name}</span></span>
                : 'Our Story'
            )}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm mr-1">D+{dDay}</div>
          <button onClick={() => setIsProfileOpen(true)} className="p-1.5 text-secondary hover:text-theme-500 transition-colors active:scale-90"><Icon name="user" size={18} /></button>
          <button onClick={handleThemePicker} className="p-1.5 text-secondary hover:text-theme-500 transition-colors active:scale-90"><Icon name="palette" size={18} /></button>
          <button onClick={handleSettingsOpen} className="p-1.5 text-secondary hover:text-theme-500 transition-colors active:scale-90"><Icon name="settings" size={18} /></button>
        </div>
      </header>

      {/* 메인 */}
      <main {...bind()} className={`${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'} min-h-screen transition-all duration-300 touch-pan-y`}>
        {/* 데스크탑 탑바 (Floating Style with Scroll Effect) */}
        <div className={`hidden lg:flex sticky top-6 z-20 mx-6 mb-6 px-6 ${isScrolled ? 'py-2.5 scale-[0.98] bg-white/60 shadow-md backdrop-blur-2xl' : 'py-4 bg-white/40 shadow-sm backdrop-blur-md'} rounded-2xl border border-white/20 items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-lg hover:scale-[0.99]`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-theme-50/50 rounded-xl text-theme-500 transition-all duration-300 ${isScrolled ? 'scale-90' : ''}`}>
              <Icon name={
                activeTab === 'feed' ? 'layout-grid' :
                  activeTab === 'gallery' ? 'image' :
                    activeTab === 'checklist' ? 'check-square' :
                      activeTab === 'bucket' ? 'star' : 'calendar-days'
              } size={isScrolled ? 18 : 20} />
            </div>
            <span className={`font-bold text-primary tracking-tight transition-all duration-300 ${isScrolled ? 'text-base' : 'text-lg'}`}>{
              settings.customTabs ? settings.customTabs[activeTab] : (activeTab === 'feed' ? 'Timeline' :
                activeTab === 'gallery' ? 'Gallery' :
                  activeTab === 'checklist' ? 'Checklist' :
                    activeTab === 'bucket' ? 'Bucket List' : 'Anniversary')
            }</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsAdminOpen(true)} className="w-8 h-8 flex items-center justify-center hover:bg-theme-50 rounded-full text-secondary hover:text-primary transition-colors" title="관리자 설정">
              <Icon name="wrench" size={14} />
            </button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-10 h-10 flex items-center justify-center hover:bg-theme-50 rounded-full btn-bounce text-secondary hover:text-primary transition-colors">
              <Icon name="arrow-up" size={20} />
            </button>
          </div>
        </div>
        <div className={`max-w-4xl mx-auto px-5 py-8 lg:py-12 pb-32 ${direction === 'right' ? 'animate-slideInRight' : 'animate-slideInLeft'}`} key={activeTab}>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{settings.customIcons ? settings.customIcons[activeTab] : (activeTab === 'feed' ? '📖' : activeTab === 'gallery' ? '🖼️' : '📅')}</span>
              <div>
                <h2 className="text-2xl lg:text-3xl font-black text-primary">
                  {settings.customHeaders ? settings.customHeaders[activeTab] : (
                    activeTab === 'feed' ? '우리의 모든 순간' : activeTab === 'gallery' ? '추억 저장소' : '우리의 기념일'
                  )}
                </h2>
                <p className="text-secondary text-sm font-medium mt-1">{posts.length}개의 소중한 기억</p>
              </div>
            </div>
            {activeTab === 'feed' && (
              <button onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2 rounded-xl font-medium text-sm btn-bounce flex items-center gap-2 ${isEditMode ? 'bg-theme-500 text-white' : 'bg-theme-50 text-theme-600'
                  }`}>
                <Icon name={isEditMode ? 'check' : 'pencil'} size={16} />
                {isEditMode ? '완료' : '편집'}
              </button>
            )}
            {activeTab === 'gallery' && (
              <div className="flex bg-theme-50 p-1 rounded-xl gap-1">
                <button onClick={() => setGalleryMode('grid')} className={`p-2 rounded-lg transition-all ${galleryMode === 'grid' ? 'bg-white text-theme-500 shadow-sm' : 'text-secondary hover:text-theme-500'}`}>
                  <Icon name="layout-grid" size={18} />
                </button>
                <button onClick={() => setGalleryMode('polaroid')} className={`p-2 rounded-lg transition-all ${galleryMode === 'polaroid' ? 'bg-white text-theme-500 shadow-sm' : 'text-secondary hover:text-theme-500'}`}>
                  <Icon name="image" size={18} />
                </button>
              </div>
            )}
          </div>


          {/* 피드 */}
          {activeTab === 'feed' && (
            <div className="space-y-6">
              {/* 사랑의 나무 위젯 */}
              <GrowthWidget
                growth={settings.growth}
                onLevelUp={async (nextLevel) => {
                  const newGrowth = { ...settings.growth, level: nextLevel.level };
                  await updateCoupleSettings(userData.coupleId, { growth: newGrowth });
                  setSettings(prev => ({ ...prev, growth: newGrowth }));
                  alert(`🎉 축하합니다! 사랑의 나무가 "${nextLevel.label}"로 성장했습니다!`);
                }}
                onClick={() => setIsAchievementOpen(true)}
              />

              {posts.length === 0 ? (
                <EmptyState onAdd={() => setIsModalOpen(true)} />
              ) : (
                posts.sort((a, b) => new Date(b.date) - new Date(a.date)).map((post, i) => (
                  <div key={post.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s` }}>
                    <PostCard
                      post={post} settings={settings} getMoodInfo={getMoodInfo}
                      onClick={() => setSelectedPost(post)}
                      isEditMode={isEditMode}
                      onEdit={() => setEditingPost({ ...post })}
                      onDelete={() => setDeleteConfirm(post.id)}
                      coupleUsers={coupleUsers}
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {/* 갤러리 */}
          {activeTab === 'gallery' && (
            galleryMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {posts.flatMap(post => post.media.map((m, idx) => ({ ...m, postId: post.id, post, idx }))).map((item, i) => (
                  <div key={`${item.postId}-${item.idx}`}
                    className="aspect-square rounded-3xl overflow-hidden shadow-md card-hover cursor-pointer group animate-fadeInUp relative"
                    style={{ animationDelay: `${i * 0.05}s` }}
                    onClick={() => setSelectedPost({ ...item.post, initialIndex: item.idx })}>
                    {item.type === 'video' ? (
                      <video src={item.url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={item.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white text-sm font-medium line-clamp-1">{item.post.location}</p>
                      </div>
                    </div>
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/30 backdrop-blur rounded-full flex items-center justify-center">
                          <Icon name="play" size={24} className="text-white ml-1" fill />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 px-2 pb-10">
                {posts.flatMap(post => post.media.map((m, idx) => ({ ...m, postId: post.id, post, idx }))).map((item, i) => (
                  <div key={`${item.postId}-${item.idx}`}
                    className="break-inside-avoid relative group cursor-pointer animate-fadeInUp"
                    style={{ animationDelay: `${i * 0.05}s`, transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}
                    onClick={() => setSelectedPost({ ...item.post, initialIndex: item.idx })}>
                    <div className="bg-white p-3 pb-8 shadow-md hover:shadow-xl transition-all duration-500 hover:scale-105 hover:rotate-0 hover:z-20 relative transform-gpu">
                      <div className="aspect-square bg-gray-100 overflow-hidden mb-2 shadow-inner">
                        {item.type === 'video' ? <video src={item.url} className="w-full h-full object-cover" muted /> : <img src={item.url} className="w-full h-full object-cover filter contrast-[1.05]" alt="" />}
                      </div>
                      <p className="text-center font-bold text-gray-500 text-xs truncate px-1 absolute bottom-2 left-0 right-0 font-sans opacity-70">
                        {item.post.content || item.post.location || new Date(item.post.date).toLocaleDateString()}
                      </p>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/40 backdrop-blur-[1px] shadow-sm opacity-80" style={{ transform: `translateX(-50%) rotate(${i % 3 === 0 ? -5 : 5}deg)` }}></div>
                      {item.type === 'video' && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
                          <Icon name="play" size={12} className="text-white ml-0.5" fill />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* 체크리스트 */}
          {activeTab === 'checklist' && (
            <div className="space-y-6 animate-scaleIn">

              {/* 그룹 탭 리스트 */}
              <div className="card-bg rounded-2xl p-4 border border-theme-100 overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="folder-heart" size={18} className="text-theme-500" />
                    <span className="font-bold text-primary">체크리스트 그룹</span>
                  </div>
                  {checklistGroups.length > 0 && (
                    <button
                      onClick={() => setChecklistEditMode(prev => !prev)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${checklistEditMode
                        ? 'bg-theme-500 text-white'
                        : 'bg-theme-100 text-theme-600 hover:bg-theme-200'
                        }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Icon name={checklistEditMode ? 'check' : 'settings'} size={14} />
                        {checklistEditMode ? '완료' : '편집'}
                      </span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {checklistGroups.map(group => (
                    <div key={group.id} className="relative group shrink-0 pt-2 pr-2">
                      {editingGroupId === group.id ? (
                        <div className="flex items-center gap-1 bg-theme-100 rounded-xl px-2 py-2">
                          <input
                            type="text"
                            value={editingGroupName}
                            onChange={(e) => setEditingGroupName(e.target.value)}
                            className="w-24 text-sm bg-transparent border-none focus:ring-0 p-0 font-medium text-theme-700"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (editingGroupName.trim()) {
                                  setChecklistGroups(prev => prev.map(g => g.id === group.id ? { ...g, name: editingGroupName.trim() } : g));
                                  setEditingGroupId(null);
                                }
                              }
                            }}
                            // Group Name Edit: Implement DB update if needed, currently kept local or add updateChecklistGroup service
                            onBlur={() => {
                              if (editingGroupName.trim()) {
                                // For now local update only, real app should update DB
                                // updateChecklistGroup(userData.coupleId, group.id, { name: editingGroupName.trim() });
                              }
                              setEditingGroupId(null);
                            }}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedGroupId(group.id)}
                          className={`px-4 py-2 rounded-xl font-medium text-sm btn-bounce transition-all ${selectedGroupId === group.id
                            ? 'gradient-theme text-white shadow-theme'
                            : 'bg-theme-50 text-secondary hover:bg-theme-100'
                            }`}
                        >
                          {group.name}
                          <span className="ml-2 text-xs opacity-70">
                            {checklist.filter(c => c.groupId === group.id).length}
                          </span>
                        </button>
                      )}

                      {/* 편집 모드: 삭제 뱃지 */}
                      {checklistEditMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setGroupToDelete(group);
                          }}
                          className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-all animate-scaleIn z-10"
                        >
                          <Icon name="minus" size={12} />
                        </button>
                      )}

                      {/* 일반 모드: 선택된 그룹 관리 메뉴 제거됨 */}
                    </div>
                  ))}

                  {/* 새 그룹 추가 */}
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      placeholder="새 그룹"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newGroupName.trim()) {
                          const newId = Date.now().toString();
                          setChecklistGroups(prev => [...prev, { id: newId, name: newGroupName.trim() }]);
                          setNewGroupName('');
                          setSelectedGroupId(newId);
                        }
                      }}
                      className="w-24 px-3 py-2 bg-theme-50 border-2 border-dashed border-theme-200 rounded-xl text-sm focus:border-theme-300 focus:bg-white transition-all outline-none"
                    />
                    <button
                      onClick={async () => {
                        if (newGroupName.trim()) {
                          await addChecklistGroup(userData.coupleId, { name: newGroupName.trim() });
                          setNewGroupName('');
                        }
                      }}
                      className="p-2 bg-theme-500 text-white rounded-xl hover:bg-theme-600 transition-colors shadow-sm"
                    >
                      <Icon name="plus" size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 새 항목 추가 */}
              {checklistGroups.length > 0 ? (
                <div className="card-bg rounded-2xl p-4 border border-theme-100 flex gap-3">
                  <input
                    type="text"
                    placeholder={`${checklistGroups.find(g => g.id === selectedGroupId)?.name || '그룹'}에 항목 추가...`}
                    value={newCheckItem}
                    onChange={(e) => setNewCheckItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newCheckItem.trim()) {
                        setChecklist(prev => [...prev, { id: Date.now().toString(), text: newCheckItem.trim(), checked: false, groupId: selectedGroupId }]);
                        setNewCheckItem('');
                      }
                    }}
                    className="flex-1 bg-theme-50 border-none rounded-xl px-4 py-3 text-primary focus:ring-2 focus:ring-theme-300 placeholder:text-secondary"
                  />
                  <button
                    onClick={async () => {
                      if (newCheckItem.trim()) {
                        await addChecklistItem(userData.coupleId, { text: newCheckItem.trim(), checked: false, groupId: selectedGroupId });
                        setNewCheckItem('');
                      }
                    }}
                    className="gradient-theme text-white px-5 py-3 rounded-xl font-bold btn-bounce flex items-center gap-2"
                  >
                    <Icon name="plus" size={18} />
                  </button>
                </div>
              ) : (
                <div className="card-bg rounded-2xl p-8 text-center border border-theme-100">
                  <p className="text-secondary">그룹을 먼저 추가해주세요</p>
                </div>
              )}

              {/* 체크리스트 목록 */}
              <div className="space-y-3">
                {checklist.filter(item => item.groupId === selectedGroupId).length === 0 ? (
                  <div className="card-bg rounded-2xl p-8 text-center border border-theme-100">
                    <span className="text-4xl mb-3 block">📝</span>
                    <p className="text-secondary font-medium">이 그룹에 항목이 없어요</p>
                    <p className="text-secondary text-sm mt-1">새로운 목표를 추가해보세요!</p>
                  </div>
                ) : (
                  checklist.filter(item => item.groupId === selectedGroupId).map(item => (
                    <ChecklistItem
                      key={item.id}
                      item={item}
                      onToggle={() => updateChecklistItem(userData.coupleId, item.id, { checked: !item.checked })}
                      onEdit={(newText) => updateChecklistItem(userData.coupleId, item.id, { text: newText })}
                      onDelete={() => deleteChecklistItem(userData.coupleId, item.id)}
                    />
                  ))
                )}
              </div>

              {/* 완료 통계 */}
              {checklist.filter(item => item.groupId === selectedGroupId).length > 0 && (
                <div className="card-bg rounded-2xl p-4 border border-theme-100">
                  <div className="flex items-center justify-between mb-2">

                    <span className="text-sm font-bold text-secondary">그룹 달성률</span>
                    <span className="text-lg font-black text-theme-600">
                      {Math.round((checklist.filter(item => item.groupId === selectedGroupId && item.checked).length / checklist.filter(item => item.groupId === selectedGroupId).length) * 100)}%
                    </span>
                  </div>
                  <div className="h-3 bg-theme-100 rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-theme rounded-full transition-all duration-500"
                      style={{ width: `${(checklist.filter(item => item.groupId === selectedGroupId && item.checked).length / checklist.filter(item => item.groupId === selectedGroupId).length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 버킷리스트 */}
          {activeTab === 'bucket' && (
            <div className="space-y-6 animate-scaleIn">
              {/* 헤더 */}
              <div className="text-center mb-6">
                <span className="text-4xl mb-2 block">🌟</span>
                <h2 className="font-black text-2xl text-primary">우리의 버킷리스트</h2>
                <p className="text-secondary text-sm mt-1">함께 이루고 싶은 꿈들</p>
              </div>

              {/* 새 항목 추가 */}
              <div className="card-bg rounded-2xl p-4 border border-theme-100 flex gap-3">
                <input
                  type="text"
                  placeholder="이루고 싶은 꿈을 적어보세요..."
                  value={newBucketItem}
                  onChange={(e) => setNewBucketItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newBucketItem.trim()) {
                      setBucketList(prev => [...prev, { id: Date.now().toString(), text: newBucketItem.trim(), checked: false, emoji: '⭐' }]);
                      setNewBucketItem('');
                    }
                  }}
                  className="flex-1 bg-theme-50 border-none rounded-xl px-4 py-3 text-primary focus:ring-2 focus:ring-theme-300 placeholder:text-secondary"
                />
                <button
                  onClick={async () => {
                    if (newBucketItem.trim()) {
                      await addBucketItem(userData.coupleId, { text: newBucketItem.trim(), checked: false, emoji: '⭐' });
                      setNewBucketItem('');
                    }
                  }}
                  className="gradient-theme text-white px-5 py-3 rounded-xl font-bold btn-bounce flex items-center gap-2"
                >
                  <Icon name="plus" size={18} />
                </button>
              </div>

              {/* 버킷리스트 목록 */}
              <div className="space-y-3">
                {bucketList.length === 0 ? (
                  <div className="card-bg rounded-2xl p-8 text-center border border-theme-100">
                    <span className="text-4xl mb-3 block">💫</span>
                    <p className="text-secondary font-medium">버킷리스트가 비어있어요</p>
                    <p className="text-secondary text-sm mt-1">함께 이루고 싶은 꿈을 추가해보세요!</p>
                  </div>
                ) : (
                  bucketList.map(item => (
                    <BucketItem
                      key={item.id}
                      item={item}
                      onToggle={() => updateBucketItem(userData.coupleId, item.id, { checked: !item.checked })}
                      onEdit={(newText) => updateBucketItem(userData.coupleId, item.id, { text: newText })}
                      onDelete={() => deleteBucketItem(userData.coupleId, item.id)}
                      onEmojiChange={(emoji) => updateBucketItem(userData.coupleId, item.id, { emoji })}
                    />
                  ))
                )}
              </div>

              {/* 달성 통계 */}
              {bucketList.length > 0 && (
                <div className="card-bg rounded-2xl p-4 border border-theme-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-secondary">꿈 달성률</span>
                    <span className="text-lg font-black text-theme-600">
                      {bucketList.filter(b => b.checked).length} / {bucketList.length}
                    </span>
                  </div>
                  <div className="h-3 bg-theme-100 rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-theme rounded-full transition-all duration-500"
                      style={{ width: `${(bucketList.filter(b => b.checked).length / bucketList.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 캘린더 */}
          {activeTab === 'calendar' && (
            <div className="space-y-6 animate-scaleIn">
              {/* 달력 네비게이션 */}
              <CalendarView
                posts={posts}
                settings={settings}
                dDay={dDay}
                onSelectPost={setSelectedPost}
                getMoodInfo={getMoodInfo}
                calendarNotes={calendarNotes}
                setCalendarNotes={setCalendarNotes}
                anniversaries={anniversaries}
                coupleId={userData?.coupleId}
                onAddAnniversary={(data) => addAnniversary(userData.coupleId, data)}
                onUpdateAnniversary={(id, data) => updateAnniversary(userData.coupleId, id, data)}
                onDeleteAnniversary={(id) => deleteAnniversary(userData.coupleId, id)}
              />
            </div>
          )}
        </div>
      </main >

      {/* 그룹 삭제 확인 모달 */}
      {
        groupToDelete && (
          <Modal onClose={() => setGroupToDelete(null)} small>
            <div className="text-center p-2">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 animate-pulse-glow">
                <Icon name="trash-2" size={28} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">그룹 삭제</h3>
              <p className="text-secondary mb-6 leading-relaxed">
                <span className="font-bold text-red-500">'{groupToDelete.name}'</span> 그룹과<br />
                포함된 모든 항목이 삭제됩니다.<br />
                정말 삭제하시겠습니까?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setGroupToDelete(null)}
                  className="flex-1 py-3 rounded-xl bg-theme-50 text-secondary font-bold hover:bg-theme-100 transition-all"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    const group = groupToDelete;
                    setChecklistGroups(prev => {
                      const newGroups = prev.filter(g => g.id !== group.id);
                      if (newGroups.length > 0) {
                        if (selectedGroupId === group.id) setSelectedGroupId(newGroups[0].id);
                      } else {
                        setSelectedGroupId(null);
                      }
                      return newGroups;
                    });
                    setChecklist(prev => prev.filter(c => c.groupId !== group.id));
                    setGroupToDelete(null);
                    // Actual Deletion in DB
                    deleteChecklistGroup(userData.coupleId, group.id);
                    // Check items deletion logic should be server-side or cascading, but for now client-side maybe needed?
                    // Actually deleteChecklistGroup only deletes the group doc. The items might remain orphaned if not deleted.
                    // But we won't see them as they are filtered by groupId.
                    // Ideally: delete all items with this groupId.
                  }}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-md transition-all btn-bounce"
                >
                  삭제하기
                </button>
              </div>
            </div>
          </Modal>
        )
      }

      {/* 모바일 하단 네비 */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-theme-100 z-40 pb-safe shadow-lg">
        <div className="flex justify-around items-end pb-1.5 pt-1 h-[68px] px-1">
          <button onClick={() => setActiveTab('feed')} className={`flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1.5 px-2 rounded-xl transition-all ${activeTab === 'feed' ? 'text-theme-500 bg-theme-50' : 'text-gray-400'}`}>
            <Icon name="layout-grid" size={22} fill={activeTab === 'feed'} />
            <span className="text-[10px] font-bold truncate max-w-[48px]">{settings.customTabs?.feed || '타임라인'}</span>
          </button>
          <button onClick={() => setActiveTab('gallery')} className={`flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1.5 px-2 rounded-xl transition-all ${activeTab === 'gallery' ? 'text-theme-500 bg-theme-50' : 'text-gray-400'}`}>
            <Icon name="image" size={22} fill={activeTab === 'gallery'} />
            <span className="text-[10px] font-bold truncate max-w-[48px]">{settings.customTabs?.gallery || '갤러리'}</span>
          </button>

          <div className="relative -top-4">
            <button onClick={handleModalOpen} className="gradient-theme text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-4 border-white active:scale-90 transition-transform">
              <Icon name="plus" size={26} strokeWidth={2.5} />
            </button>
          </div>

          <button onClick={() => setActiveTab('checklist')} className={`flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1.5 px-2 rounded-xl transition-all ${activeTab === 'checklist' ? 'text-theme-500 bg-theme-50' : 'text-gray-400'}`}>
            <Icon name="check-square" size={22} fill={activeTab === 'checklist'} />
            <span className="text-[10px] font-bold truncate max-w-[48px]">{settings.customTabs?.checklist || '체크'}</span>
          </button>
          <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1.5 px-2 rounded-xl transition-all ${activeTab === 'calendar' ? 'text-theme-500 bg-theme-50' : 'text-gray-400'}`}>
            <Icon name="calendar-days" size={22} fill={activeTab === 'calendar'} />
            <span className="text-[10px] font-bold truncate max-w-[48px]">{settings.customTabs?.calendar || '기념일'}</span>
          </button>
        </div>
      </nav>

      {/* 데스크탑 FAB */}
      <button onClick={handleModalOpen} className="hidden lg:flex fixed bottom-6 right-6 lg:bottom-10 lg:right-10 px-6 py-4 gradient-theme shadow-theme hover:shadow-lg transition-all hover:scale-105 active:scale-95 items-center gap-2 z-40 btn-bounce btn-primary-text rounded-full">
        <Icon name="plus" size={24} strokeWidth={2.5} />
        <span className="font-bold text-lg">기록 추가하기</span>
      </button>

      {/* 기록 추가 모달 */}
      {
        isModalOpen && (
          <Modal onClose={() => { setIsModalOpen(false); resetForm(); }}>
            <ModalHeader title="✨ 오늘의 기억" subtitle="소중한 순간을 기록으로" onClose={() => { setIsModalOpen(false); resetForm(); }} />
            <PostForm post={newPost} setPost={setNewPost} onSubmit={handleAddPost} submitLabel="💕 저장하기" />
          </Modal>
        )
      }

      {/* 수정 모달 */}
      {
        editingPost && (
          <Modal onClose={() => setEditingPost(null)}>
            <ModalHeader title="✏️ 기록 수정" subtitle="추억을 다시 편집해요" onClose={() => setEditingPost(null)} />
            <PostForm post={editingPost} setPost={setEditingPost} onSubmit={handleEditPost} submitLabel="✅ 수정 완료" />
          </Modal>
        )
      }

      {/* 삭제 확인 */}
      {
        deleteConfirm && (
          <Modal onClose={() => setDeleteConfirm(null)} small>
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Icon name="trash-2" size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">정말 삭제할까요?</h3>
              <p className="text-secondary text-sm mb-6">이 기록은 복구할 수 없어요.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl border-2 border-theme-200 text-secondary font-bold btn-bounce">취소</button>
                <button onClick={() => handleDeletePost(deleteConfirm)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold btn-bounce">삭제</button>
              </div>
            </div>
          </Modal>
        )
      }

      {/* 상세 보기 */}
      {
        selectedPost && (
          <DetailView
            post={selectedPost}
            settings={settings}
            getMoodInfo={getMoodInfo}
            onClose={() => setSelectedPost(null)}
            isEditMode={isEditMode}
            onEdit={() => { setEditingPost({ ...selectedPost }); setSelectedPost(null); }}
            onDelete={() => { setDeleteConfirm(selectedPost.id); setSelectedPost(null); }}
            coupleUsers={coupleUsers}
          />
        )
      }

      {/* 내 정보 (프로필) 모달 */}
      {isProfileOpen && (
        <BottomSheet isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}>
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">👤</span>
            <h3 className="text-2xl font-bold text-primary">내 정보</h3>
            <p className="text-secondary text-sm">닉네임과 프로필 사진을 수정하세요</p>
          </div>

          {/* 현재 사용자 정보 */}
          {(() => {
            const myInfo = coupleUsers.find(u => u.uid === currentUser?.uid);
            return (
              <div className="space-y-6">
                {/* 프로필 사진 */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group">
                    {myInfo?.photoURL ? (
                      <img src={myInfo.photoURL} alt="프로필" className="w-24 h-24 rounded-full object-cover border-4 border-theme-200 shadow-lg" />
                    ) : (
                      <div className="w-24 h-24 rounded-full gradient-theme flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {(myInfo?.name || '나').charAt(0)}
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-theme-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-theme-600 transition-all">
                      <Icon name="camera" size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files?.[0] && currentUser) {
                            setProfileLoading(true);
                            try {
                              await uploadProfilePhoto(currentUser.uid, e.target.files[0]);
                              alert('프로필 사진이 변경되었습니다!');
                            } catch (err) {
                              alert('업로드 실패: ' + err.message);
                            }
                            setProfileLoading(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-secondary">사진을 클릭하여 변경</p>
                </div>

                {/* 닉네임 수정 */}
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">닉네임</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="nicknameInput"
                      defaultValue={myInfo?.name || ''}
                      placeholder="닉네임을 입력하세요"
                      className="flex-1 bg-theme-50 border-2 border-transparent focus:border-theme-300 rounded-xl px-4 py-3 text-primary outline-none"
                    />
                    <button
                      onClick={async () => {
                        const newName = document.getElementById('nicknameInput').value.trim();
                        if (newName && currentUser) {
                          setProfileLoading(true);
                          try {
                            await updateUserProfile(currentUser.uid, { name: newName });
                            alert('닉네임이 변경되었습니다!');
                          } catch (err) {
                            alert('변경 실패: ' + err.message);
                          }
                          setProfileLoading(false);
                        }
                      }}
                      disabled={profileLoading}
                      className="px-4 py-3 gradient-theme text-white font-bold rounded-xl shadow-theme btn-bounce disabled:opacity-50"
                    >
                      {profileLoading ? '...' : '저장'}
                    </button>
                  </div>
                </div>

                {/* 이메일 (읽기 전용) */}
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">이메일</label>
                  <p className="text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-xl">{currentUser?.email}</p>
                </div>

                {/* 커플 정보 */}
                {coupleUsers.length >= 2 && (
                  <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100">
                    <p className="text-sm font-bold text-pink-600 mb-2">💕 연결된 파트너</p>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const partner = coupleUsers.find(u => u.uid !== currentUser?.uid);
                        return partner ? (
                          <>
                            {partner.photoURL ? (
                              <img src={partner.photoURL} alt="파트너" className="w-10 h-10 rounded-full object-cover border-2 border-pink-200" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-pink-600 font-bold">
                                {(partner.name || '?').charAt(0)}
                              </div>
                            )}
                            <span className="font-bold text-primary">{partner.name || partner.email}</span>
                          </>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </BottomSheet>
      )}

      {/* 설정 */}
      {
        isSettingsOpen && (
          <BottomSheet isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">⚙️</span>
              <h3 className="text-2xl font-bold text-primary">설정</h3>
              <p className="text-secondary text-sm">우리의 정보를 수정해요</p>
            </div>
            {/* Current User Info */}
            <div className="bg-theme-50/50 p-3 rounded-xl text-center mb-2 border border-theme-100">
              <p className="text-xs text-start text-gray-400 mb-1 ml-1">현재 로그인 계정</p>
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                <div className="w-8 h-8 rounded-full gradient-theme flex items-center justify-center text-white font-bold text-xs">
                  {currentUser?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-bold text-primary truncate">{currentUser?.email}</p>
                  <p className="text-[10px] text-gray-400 truncate">Couple ID: {userData?.coupleId?.slice(0, 6)}...</p>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setIsSettingsOpen(false); }} className="space-y-5">

              {/* Couple Connection Section */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-sm text-gray-800 mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-theme-100 text-theme-600 flex items-center justify-center"><Icon name="link" size={12} /></span>
                    커플 연동 상태
                  </span>
                  {isConnected ? (
                    <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-full font-bold">🟢 연결됨</span>
                  ) : (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold">⚪ 연결 대기중</span>
                  )}
                </h4>

                {!isConnected ? (
                  <>
                    {/* Show invite code only if not connected */}
                    {/* Show invite code only if not connected */}
                    {/* Show invite code or generate button */}
                    {settings.inviteCode ? (
                      <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-xl border border-gray-200">
                        <span className="text-secondary text-sm font-medium">내 초대 코드</span>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xl text-theme-600 tracking-widest">{settings.inviteCode}</span>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm('초대 코드를 새로 발급하시겠습니까?\n이전 코드는 사용할 수 없게 됩니다.')) {
                                const newCode = await generateInviteCode();
                                if (newCode) setSettings(prev => ({ ...prev, inviteCode: newCode }));
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-theme-500 hover:bg-theme-50 rounded-full transition-colors"
                            title="코드 재발급"
                          >
                            <Icon name="refresh-cw" size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={async () => {
                            const newCode = await generateInviteCode();
                            if (newCode) setSettings(prev => ({ ...prev, inviteCode: newCode }));
                          }}
                          className="w-full py-3 rounded-xl border-2 border-dashed border-theme-300 text-theme-600 font-bold hover:bg-theme-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Icon name="plus" size={16} /> 초대 코드 발급받기
                        </button>
                        <p className="text-xs text-center text-gray-400 mt-2">상대방에게 공유할 코드를 생성합니다.</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input type="text" placeholder="상대방 코드 6자리" id="partnerCodeInput" className="bg-white border-2 border-transparent focus:border-theme-300 rounded-xl px-3 py-3 text-sm flex-1 outline-none text-center font-bold tracking-widest" maxLength={6} />
                      <button type="button" onClick={async () => {
                        const code = document.getElementById('partnerCodeInput').value;
                        if (code) {
                          try {
                            await connectWithCode(code);
                            alert('연결되었습니다! 🎉');
                            window.location.reload();
                          } catch (e) {
                            alert(e.message);
                          }
                        }
                      }} className="bg-theme-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-theme btn-bounce">연결</button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center p-3 bg-green-50 text-green-600 rounded-xl font-bold text-sm">
                      ❤️ {coupleUsers.find(u => u.uid !== currentUser?.uid)?.name || '파트너'}님과 연결되었습니다!
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm('💔 정말 연동을 해제하시겠습니까?\n\n서로의 연결이 끊어지며, 나는 새로운 공간으로 이동하게 됩니다.')) {
                          try {
                            await disconnectCouple();
                            alert('연동이 해제되었습니다. 새로운 공간이 생성되었습니다.');
                            window.location.reload();
                          } catch (e) {
                            alert('연동 해제 실패: ' + e.message);
                          }
                        }
                      }}
                      className="w-full py-4 rounded-xl bg-red-50 text-red-500 font-bold text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      💔 상대방과 연결 끊기
                    </button>
                  </div>
                )}
              </div>

              <InputField label="우리 이름" value={settings.coupleName} onChange={v => setSettings({ ...settings, coupleName: v })} placeholder="예: 우진 & 유나" />
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <InputField label="메인 제목" value={settings.appTitle || ''} onChange={v => setSettings({ ...settings, appTitle: v })} placeholder="커플 이름 (비우면 자동)" />
                </div>
                <div className="col-span-1">
                  <InputField label="이모지" value={settings.appEmoji || '💖'} onChange={v => setSettings({ ...settings, appEmoji: v })} />
                </div>
              </div>
              <InputField label="서브 타이틀" value={settings.appSubtitle || ''} onChange={v => setSettings({ ...settings, appSubtitle: v })} placeholder="우리의 이야기" />
              <div className="hidden">
                <InputField label="나의 이름" value={settings.myName} onChange={v => setSettings({ ...settings, myName: v })} />
                <InputField label="상대방 이름" value={settings.partnerName} onChange={v => setSettings({ ...settings, partnerName: v })} />
              </div>
              <InputField label="시작한 날" type="date" value={settings.anniversaryDate} onChange={v => setSettings({ ...settings, anniversaryDate: v })} icon="heart" />

              {/* 탭 이름 커스터마이징 */}
              <details className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <summary className="font-bold text-sm text-gray-800 cursor-pointer flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-theme-100 text-theme-600 flex items-center justify-center"><Icon name="edit-3" size={12} /></span>
                  탭 이름 수정 (고급)
                </summary>
                <div className="mt-4 space-y-3">
                  {[
                    { key: 'feed', label: '타임라인', icon: 'layout-grid' },
                    { key: 'gallery', label: '갤러리', icon: 'image' },
                    { key: 'checklist', label: '체크리스트', icon: 'check-square' },
                    { key: 'bucket', label: '버킷리스트', icon: 'star' },
                    { key: 'calendar', label: '기념일', icon: 'calendar' }
                  ].map(tab => (
                    <div key={tab.key} className="flex items-center gap-2">
                      <Icon name={tab.icon} size={16} className="text-secondary shrink-0" />
                      <input
                        type="text"
                        value={settings.customTabs?.[tab.key] || tab.label}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          customTabs: { ...prev.customTabs, [tab.key]: e.target.value }
                        }))}
                        placeholder={tab.label}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                  ))}
                </div>
              </details>

              <button type="submit" className="w-full py-4 rounded-2xl gradient-theme text-white font-bold shadow-theme btn-bounce" style={{ color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                onClick={async (e) => {
                  e.preventDefault();
                  await updateCoupleSettings(userData.coupleId, settings);
                  setIsSettingsOpen(false);
                }}
              >저장하기</button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => {
                  if (confirm('로그아웃 하시겠습니까?')) {
                    logout();
                  }
                }}
                className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-bold hover:bg-red-50 transition-all mt-4"
              >
                <span className="flex items-center justify-center gap-2">
                  <Icon name="log-out" size={18} />
                  로그아웃
                </span>
              </button>

              {/* Debug & Troubleshooting */}
              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-300 mb-2">Debug Info: {userData?.coupleId?.slice(0, 8)}...</p>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('⚠️정말 초기화하시겠습니까?\n\n현재 연결된 커플 정보를 버리고, 완전히 새로운 커플 페이지를 생성합니다.\n이 작업은 되돌릴 수 없습니다.')) {
                      await startNewCouple();
                    }
                  }}
                  className="text-xs text-gray-400 underline hover:text-red-500 transition-colors"
                >
                  데이터 초기화 및 새 커플 시작 (오류 해결용)
                </button>
              </div>
            </form>
          </BottomSheet>
        )
      }

      {/* 테마 선택 */}
      {
        isThemePickerOpen && (
          <BottomSheet isOpen={isThemePickerOpen} onClose={() => setIsThemePickerOpen(false)}>
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">🎨</span>
              <h3 className="text-2xl font-bold text-primary">테마 선택</h3>
              <p className="text-secondary text-sm">레벨을 올려 새로운 테마를 해금하세요!</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map(theme => {
                const isLocked = !isAdmin && ((settings.growth?.level || 1) < (theme.unlockLevel || 1));

                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      if (isLocked) {
                        alert(`🔒 이 테마는 Lv.${theme.unlockLevel}에 해금됩니다!\n(현재 Lv.${settings.growth?.level || 1})`);
                        return;
                      }
                      handleSettingsUpdate({ ...settings, theme: theme.id });
                      setIsThemePickerOpen(false);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all btn-bounce flex items-center gap-3 relative overflow-hidden ${settings.theme === theme.id ? 'border-current shadow-lg scale-105' : 'border-transparent bg-theme-50'
                      } ${isLocked ? 'opacity-70 grayscale' : ''}`}
                    style={{ borderColor: !isLocked && settings.theme === theme.id ? theme.color : undefined }}
                  >
                    <span className="text-2xl">{theme.emoji}</span>
                    <div className="text-left">
                      <span className="font-medium text-sm text-primary block">{theme.name}</span>
                      {isLocked && <span className="text-[10px] items-center gap-1 text-secondary flex"><Icon name="lock" size={10} /> Lv.{theme.unlockLevel}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </BottomSheet>
        )}

      {/* 업적 & 보상 모달 */}
      {isAchievementOpen && (
        <AchievementModal onClose={() => setIsAchievementOpen(false)} growth={settings.growth} />
      )}

      {/* 모바일 햄버거 메뉴 (Drawer) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fadeIn bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-[280px] h-full shadow-2xl p-6 animate-slideInLeft relative flex flex-col" onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Logo size={28} />
                <span className="font-black text-lg text-primary">Menu</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}><Icon name="x" size={24} className="text-secondary" /></button>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              <div className="text-xs font-bold text-gray-400 mb-2 px-2">바로가기</div>
              {[
                { id: 'feed', icon: 'layout-grid', label: '타임라인' },
                { id: 'gallery', icon: 'image', label: '갤러리' },
                { id: 'checklist', icon: 'check-square', label: '체크리스트' },
                { id: 'bucket', icon: 'star', label: '버킷리스트' },
                { id: 'calendar', icon: 'calendar', label: '기념일' },
              ].map(item => (
                <button key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-colors ${activeTab === item.id ? 'bg-theme-50 text-theme-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <Icon name={item.icon} size={18} />
                  {settings.customTabs?.[item.id] || item.label}
                </button>
              ))}

              <div className="h-px bg-gray-100 my-4" />

              <div className="text-xs font-bold text-gray-400 mb-2 px-2">성장 & 보상</div>
              <button onClick={() => { setIsAchievementOpen(true); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-gray-600 hover:bg-gray-50">
                <Icon name="trophy" size={18} className="text-yellow-500" />
                업적 게시판
              </button>
              <button onClick={() => { setIsThemePickerOpen(true); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-gray-600 hover:bg-gray-50">
                <Icon name="palette" size={18} className="text-indigo-500" />
                테마 변경
              </button>

              <div className="h-px bg-gray-100 my-4" />

              <button onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-gray-600 hover:bg-gray-50">
                <Icon name="settings" size={18} className="text-gray-400" />
                설정
              </button>
              <button onClick={() => { setIsProfileOpen(true); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-gray-600 hover:bg-gray-50">
                <Icon name="user" size={18} className="text-gray-400" />
                내 정보
              </button>
            </div>

            <div className="text-center text-[10px] text-gray-300 mt-4">
              v2.1.0 • Built with ❤️
            </div>
          </div>
        </div>
      )}
      {/* 관리자 모달 (작고 심플하게) */}
      {isAdminOpen && (
        <Modal onClose={() => setIsAdminOpen(false)} small>
          <ModalHeader title="🛠️ 관리자 설정" subtitle="앱의 문구를 내 마음대로!" onClose={() => setIsAdminOpen(false)} />
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
            <div>
              <h4 className="font-bold text-sm mb-3 text-secondary">네비게이션 탭 이름</h4>
              <div className="space-y-3">
                {['feed', 'gallery', 'checklist', 'bucket', 'calendar'].map(key => (
                  <InputField key={`tab-${key}`} label={key.toUpperCase()} value={settings.customTabs ? settings.customTabs[key] : ''}
                    onChange={v => handleSettingsUpdate({ ...settings, customTabs: { ...settings.customTabs, [key]: v } })} />
                ))}
              </div>
            </div>
            <div className="border-t border-theme-100 pt-6">
              <h4 className="font-bold text-sm mb-3 text-secondary">페이지 메인 제목</h4>
              <div className="space-y-3">
                {['feed', 'gallery', 'calendar'].map(key => (
                  <div key={`header-${key}`} className="flex gap-2">
                    <div className="w-16">
                      <InputField label="이모지" value={settings.customIcons ? settings.customIcons[key] : ''}
                        onChange={v => handleSettingsUpdate({ ...settings, customIcons: { ...settings.customIcons, [key]: v } })} />
                    </div>
                    <div className="flex-1">
                      <InputField label={key === 'feed' ? 'Timeline 제목' : key === 'gallery' ? 'Gallery 제목' : 'Anniversary 제목'}
                        value={settings.customHeaders ? settings.customHeaders[key] : ''}
                        onChange={v => handleSettingsUpdate({ ...settings, customHeaders: { ...settings.customHeaders, [key]: v } })} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Guide Modal */}
      {isInstallGuideOpen && <InstallGuide onClose={() => setIsInstallGuideOpen(false)} platform={isIos ? 'ios' : 'android'} />}
    </div >
  );
};



// 상세 보기 컴포넌트 (전체 리디자인)
const DetailView = ({ post, settings, getMoodInfo, onClose, isEditMode, onEdit, onDelete, coupleUsers }) => {
  const [currentIndex, setCurrentIndex] = useState(post.initialIndex || 0);
  const moodInfo = getMoodInfo(post.mood);
  const media = post.media || [];
  const [zoomImage, setZoomImage] = useState(null);

  const goNext = () => setCurrentIndex(prev => (prev + 1) % media.length);
  const goPrev = () => setCurrentIndex(prev => (prev - 1 + media.length) % media.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-lg animate-fadeIn" onClick={onClose} />

      {/* 컨테이너 */}
      <div className="relative detail-modal w-full max-w-5xl card-bg rounded-[2rem] shadow-2xl overflow-hidden animate-scaleIn">
        {/* 닫기 버튼 */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur rounded-full flex items-center justify-center text-white transition-all btn-bounce">
          <Icon name="x" size={20} />
        </button>

        {/* 스크롤 가능한 내용 */}
        <div className="detail-scroll">
          {/* 미디어 섹션 */}
          <div className={`relative bg-black aspect-[16/10] sm:aspect-[16/9] ${(post.filter && post.filter !== 'none') ? `filter-${post.filter}` : ''}`}>
            {media.length > 0 && (
              <>
                {media[currentIndex].type === 'video' ? (
                  <video src={media[currentIndex].url} className="w-full h-full object-contain" controls autoPlay />
                ) : (
                  <img
                    src={media[currentIndex].url}
                    className="w-full h-full object-contain cursor-zoom-in hover:opacity-90 transition-opacity"
                    alt=""
                    onClick={() => setZoomImage(media[currentIndex].url)}
                    title="클릭하여 확대"
                  />
                )}

                {/* 네비게이션 버튼 */}
                {media.length > 1 && (
                  <>
                    <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all btn-bounce">
                      <Icon name="chevron-left" size={24} />
                    </button>
                    <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all btn-bounce">
                      <Icon name="chevron-right" size={24} />
                    </button>

                    {/* 인디케이터 */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {media.map((_, i) => (
                        <button key={i} onClick={() => setCurrentIndex(i)}
                          className={`h-2 rounded-full transition-all ${i === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'}`} />
                      ))}
                    </div>

                    {/* 카운터 */}
                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full text-white text-sm font-medium">
                      {currentIndex + 1} / {media.length}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* 정보 섹션 */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* 메타 정보 */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-theme-100 px-4 py-2 rounded-full">
                <span className="text-xl">{moodInfo.emoji}</span>
                <span className="font-bold text-theme-600">{moodInfo.label}</span>
              </div>
              <div className="flex items-center gap-2 text-secondary">
                <Icon name="calendar" size={16} />
                <span className="text-sm font-medium">
                  {new Date(post.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-secondary">
                <Icon name="map-pin" size={16} />
                <span className="text-sm font-medium">{post.location}</span>
              </div>
            </div>

            {/* 작성자 */}
            <div className="flex items-center gap-3 pb-4 border-b border-theme-100">
              <div className="w-10 h-10 gradient-theme rounded-full flex items-center justify-center text-white font-bold">
                {((coupleUsers?.find(u => u.uid === post.author)?.name) || '나').charAt(0)}
              </div>
              <div>
                <p className="font-bold text-primary">{(coupleUsers?.find(u => u.uid === post.author)?.name) || '나'}의 기록</p>
                <p className="text-xs text-secondary">{settings.coupleName}</p>
              </div>
            </div>

            {/* 본문 */}
            <p className="text-lg sm:text-xl leading-relaxed text-primary whitespace-pre-wrap">{post.content}</p>

            {/* 썸네일 목록 */}
            {media.length > 1 && (
              <div className="pt-4 border-t border-theme-100">
                <p className="text-sm font-bold text-secondary mb-3">모든 사진/동영상</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {media.map((m, idx) => (
                    <button key={idx} onClick={() => setCurrentIndex(idx)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all ${idx === currentIndex ? 'ring-3 ring-theme-500 scale-105' : 'opacity-70 hover:opacity-100'
                        }`}>
                      {m.type === 'video' ? (
                        <video src={m.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={m.url} className="w-full h-full object-cover" alt="" />
                      )}
                      {m.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Icon name="play" size={16} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 편집 모드일 때 수정/삭제 버튼 */}
            {isEditMode && (
              <div className="flex gap-3 pt-4 border-t border-theme-100">
                <button
                  onClick={onEdit}
                  className="flex-1 py-4 rounded-2xl bg-theme-100 text-theme-600 font-bold btn-bounce flex items-center justify-center gap-2 text-lg"
                >
                  <Icon name="pencil" size={20} /> 수정하기
                </button>
                <button
                  onClick={onDelete}
                  className="flex-1 py-4 rounded-2xl bg-red-100 text-red-600 font-bold btn-bounce flex items-center justify-center gap-2 text-lg"
                >
                  <Icon name="trash-2" size={20} /> 삭제하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 이미지 확대 뷰 */}
      {zoomImage && <ImageZoom src={zoomImage} onClose={() => setZoomImage(null)} />}
    </div>
  );
};

// 서브 컴포넌트들
const Modal = ({ children, onClose, small = false }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fadeIn" onClick={onClose} />
    <div className={`relative w-full ${small ? 'max-w-sm' : 'max-w-lg'} card-bg rounded-t-[2rem] rounded-b-none sm:rounded-[2rem] shadow-2xl p-6 overflow-y-auto max-h-[85vh] sm:max-h-[90vh] animate-slideUp sm:animate-scaleIn pb-safe`}>
      {/* Mobile Handle Bar */}
      <div className="w-12 h-1.5 bg-gray-300/50 rounded-full mx-auto mb-6 sm:hidden" />
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, subtitle, onClose }) => (
  <div className="flex justify-between items-start mb-6">
    <div>
      <h3 className="text-2xl font-bold text-primary">{title}</h3>
      <p className="text-secondary text-sm mt-1">{subtitle}</p>
    </div>
    <button onClick={onClose} className="p-2 hover:bg-theme-50 rounded-full text-secondary btn-bounce">
      <Icon name="x" size={24} />
    </button>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = 'text', icon }) => (
  <div>
    <label className="block text-sm font-bold text-primary mb-2">{label}</label>
    <div className="relative">
      {icon && <Icon name={icon} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-400" />}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full bg-theme-50 border-2 border-transparent rounded-xl ${icon ? 'pl-12' : 'px-4'} pr-4 py-3 text-primary focus:ring-0 focus:border-theme-300 transition-all placeholder:text-secondary`} />
    </div>
  </div>
);

const PostForm = ({ post, setPost, onSubmit, submitLabel }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files) => {
    Array.from(files).forEach(file => {
      const isVideo = file.type.startsWith('video/');

      if (isVideo) {
        // 동영상은 크기 제한 (50MB)
        if (file.size > 50 * 1024 * 1024) {
          alert('동영상은 50MB 이하만 업로드 가능합니다.');
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          setPost(prev => ({
            ...prev,
            media: [...prev.media, { url: e.target.result, type: 'video', name: file.name, file: file }]
          }));
        };
        reader.readAsDataURL(file);
      } else {
        // 이미지는 압축 처리
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxSize = 1200;
            let { width, height } = img;

            if (width > maxSize || height > maxSize) {
              if (width > height) {
                height = (height / width) * maxSize;
                width = maxSize;
              } else {
                width = (width / height) * maxSize;
                height = maxSize;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedUrl = canvas.toDataURL('image/jpeg', 0.8);
            setPost(prev => ({
              ...prev,
              media: [...prev.media, { url: compressedUrl, type: 'image', name: file.name }]
            }));
          };
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFileSelect(e.dataTransfer.files);
  };

  const removeMedia = (idx) => {
    const newMedia = post.media.filter((_, i) => i !== idx);
    setPost({ ...post, media: newMedia, thumbnailIndex: Math.min(post.thumbnailIndex, Math.max(0, newMedia.length - 1)) });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* 감정 */}
      <div>
        <label className="block text-sm font-bold text-primary mb-3">오늘의 감정</label>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map(mood => (
            <button key={mood.id} type="button" onClick={() => setPost({ ...post, mood: post.mood === mood.id ? null : mood.id })}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border transition-all ${post.mood === mood.id ? `${mood.bg} ${mood.color} border-current ring-1 ring-current shadow-sm` : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-500'
                }`}>
              <Icon name={mood.icon} size={24} className="mb-0.5" />
              <span className="text-[10px] font-bold">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 내용 */}
      <div>
        <label className="block text-sm font-bold text-primary mb-2">무슨 일이 있었나요?</label>
        <textarea rows="3" required placeholder="오늘의 추억을 자유롭게..."
          className="w-full bg-theme-50 border-2 border-transparent rounded-2xl p-4 text-primary focus:ring-0 focus:border-theme-300 transition-all resize-none placeholder:text-secondary"
          value={post.content} onChange={e => setPost({ ...post, content: e.target.value })} />
      </div>

      {/* 날짜 & 장소 */}
      <div className="grid grid-cols-2 gap-3">
        <InputField label="날짜" type="date" value={post.date} onChange={v => setPost({ ...post, date: v })} icon="calendar-days" />
        <InputField label="장소" value={post.location} onChange={v => setPost({ ...post, location: v })} placeholder="어디서?" icon="map-pin" />
      </div>

      {/* 파일 업로드 */}
      <div>
        <label className="block text-sm font-bold text-primary mb-2">사진/동영상</label>
        <div
          className={`file-upload-zone rounded-2xl p-6 text-center cursor-pointer ${isDragging ? 'dragover' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)} />
          <Icon name="upload-cloud" size={32} className="mx-auto text-theme-400 mb-2" />
          <p className="text-sm text-secondary">클릭하거나 파일을 드래그하세요</p>
          <p className="text-xs text-secondary mt-1">이미지, 동영상 모두 가능</p>
        </div>

        {/* 미디어 미리보기 */}
        {post.media.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-secondary mb-2">클릭하여 대표 이미지 선택</p>
            <div className="flex flex-wrap gap-2">
              {post.media.map((m, idx) => (
                <div key={idx} onClick={() => setPost({ ...post, thumbnailIndex: idx })}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden cursor-pointer transition-all ${post.thumbnailIndex === idx ? 'ring-3 ring-theme-500 scale-105' : 'opacity-80 hover:opacity-100'
                    }`}>
                  {m.type === 'video' ? (
                    <video src={m.url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={m.url} className="w-full h-full object-cover" alt="" />
                  )}
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeMedia(idx); }}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">×</button>
                  {post.thumbnailIndex === idx && (
                    <div className="absolute bottom-1 left-1 bg-theme-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">대표</div>
                  )}
                  {m.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Icon name="play" size={14} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button type="submit" className="w-full py-4 rounded-2xl gradient-theme font-bold shadow-theme btn-bounce text-lg btn-primary-text">{submitLabel}</button>
    </form>
  );
};

const ImageZoom = ({ src, onClose }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-black/90" />
    <img
      src={src}
      className="relative max-w-full max-h-full object-contain animate-scaleIn"
      alt=""
      onClick={(e) => e.stopPropagation()}
    />
    <button
      onClick={onClose}
      className="absolute top-4 right-4 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white btn-bounce"
    >
      <Icon name="x" size={24} />
    </button>
    <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">클릭하여 닫기</p>
  </div>
);

const EmptyState = ({ onAdd }) => (
  <div className="card-bg border-2 border-dashed border-theme-200 rounded-[2.5rem] py-16 px-8 text-center flex flex-col items-center gap-5 animate-scaleIn">
    <div className="w-20 h-20 gradient-theme rounded-3xl flex items-center justify-center shadow-theme animate-float">
      <span className="text-4xl">💕</span>
    </div>
    <div>
      <h3 className="text-xl font-bold text-primary mb-2">아직 기록이 없네요!</h3>
      <p className="text-secondary text-sm">소중한 첫 번째 추억을 남겨보세요.</p>
    </div>
    <button onClick={onAdd} className="gradient-theme px-6 py-3 rounded-xl font-bold shadow-theme btn-bounce flex items-center gap-2 btn-primary-text">
      <Icon name="plus" size={18} /> 기록 시작하기
    </button>
  </div>
);


export default App;