import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../ui/Icon';
import { MOOD_OPTIONS, MEMO_COLORS } from '../../constants';

const CalendarView = ({
    posts, settings, dDay, onSelectPost, getMoodInfo, calendarNotes, setCalendarNotes,
    anniversaries = [], coupleId, onAddAnniversary, onUpdateAnniversary, onDeleteAnniversary
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isAddingMemo, setIsAddingMemo] = useState(false);
    const [editingMemo, setEditingMemo] = useState(null);
    const [memoTitle, setMemoTitle] = useState('');
    const [memoColor, setMemoColor] = useState('#007AFF');
    const [isRecurringMemo, setIsRecurringMemo] = useState(false);
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchEndX, setTouchEndX] = useState(0);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAnniversaryFormOpen, setIsAnniversaryFormOpen] = useState(false);
    const [editingAnniversary, setEditingAnniversary] = useState(null);
    const [anniversaryForm, setAnniversaryForm] = useState({ title: '', date: '', emoji: '💕' });
    const [moodStamps, setMoodStamps] = useState(() => {
        const saved = localStorage.getItem('coupleApp_moodStamps');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('coupleApp_moodStamps', JSON.stringify(moodStamps));
    }, [moodStamps]);

    // 데이터 백업
    const handleBackup = () => {
        const data = {
            posts: localStorage.getItem('coupleApp_data'),
            settings: localStorage.getItem('coupleApp_settings'),
            notes: localStorage.getItem('coupleApp_calendarNotes'),
            checklist: localStorage.getItem('coupleApp_checklist'),
            bucketList: localStorage.getItem('coupleApp_bucketList'),
            postColors: localStorage.getItem('coupleApp_postColors'),
            theme: localStorage.getItem('coupleApp_theme'),
            moodStamps: localStorage.getItem('coupleApp_moodStamps'),
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `couple_app_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setIsSettingsOpen(false);
    };

    // 데이터 복원
    const handleRestore = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.posts) localStorage.setItem('coupleApp_data', data.posts);
                if (data.settings) localStorage.setItem('coupleApp_settings', data.settings);
                if (data.notes) localStorage.setItem('coupleApp_calendarNotes', data.notes);
                if (data.checklist) localStorage.setItem('coupleApp_checklist', data.checklist);
                if (data.bucketList) localStorage.setItem('coupleApp_bucketList', data.bucketList);
                if (data.postColors) localStorage.setItem('coupleApp_postColors', data.postColors);
                if (data.theme) localStorage.setItem('coupleApp_theme', data.theme);
                if (data.moodStamps) localStorage.setItem('coupleApp_moodStamps', data.moodStamps);

                alert('데이터가 성공적으로 복원되었습니다. 앱을 재시작합니다.');
                window.location.reload();
            } catch (err) {
                alert('백업 파일 형식이 올바르지 않습니다.');
            }
        };
        reader.readAsText(file);
        setIsSettingsOpen(false);
    };

    const [postColors, setPostColors] = useState(() => {
        const saved = localStorage.getItem('coupleApp_postColors');
        return saved ? JSON.parse(saved) : {};
    });

    // postColors 저장
    useEffect(() => {
        localStorage.setItem('coupleApp_postColors', JSON.stringify(postColors));
    }, [postColors]);

    // 게시글 색상 변경
    const setPostColor = (postId, color) => {
        setPostColors(prev => ({ ...prev, [postId]: color }));
    };

    // 게시글 색상 가져오기
    const getPostColor = (postId) => postColors[postId] || '#f472b6';

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    // 스와이프 핸들러 (Touch + Mouse)
    const handleTouchStart = (e) => setTouchStartX(e.targetTouches[0].clientX);
    const handleTouchMove = (e) => setTouchEndX(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
        if (!touchStartX || !touchEndX) return;
        const distance = touchStartX - touchEndX;
        if (distance > 50) nextMonth();
        if (distance < -50) prevMonth();
        setTouchStartX(0);
        setTouchEndX(0);
    };

    const handleMouseDown = (e) => {
        setTouchStartX(e.clientX);
        setTouchEndX(0); // 초기화
    };

    const handleMouseUp = (e) => {
        if (!touchStartX) return;
        const touchEndX = e.clientX;
        const distance = touchStartX - touchEndX;
        if (distance > 50) nextMonth();
        if (distance < -50) prevMonth();
        setTouchStartX(0); // Reset
    };

    // 날짜 클릭 -> 모달 열기
    const handleDayClick = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        setIsModalOpen(true);
        setIsAddingMemo(false);
        setEditingMemo(null);
        setMemoTitle('');
        setIsRecurringMemo(false);
    };

    // 메모 가져오기 (반복 일정 포함)
    const getMemosForDate = (dateStr) => {
        if (!dateStr) return [];
        let result = [];
        const notesData = calendarNotes || {};
        const data = notesData[dateStr];
        // 1. 해당 날짜 고유 메모
        if (data) {
            if (Array.isArray(data)) result = [...data];
            else if (typeof data === 'string') result.push({ id: 1, title: data, color: '#007AFF' });
            else if (data.text) result.push({ id: 1, title: data.text, color: data.color || '#007AFF' });
        }
        // 2. 반복 일정 검색
        const [y, m, d] = dateStr.split('-');
        const targetMD = `${m}-${d}`;
        Object.entries(notesData).forEach(([key, notes]) => {
            if (Array.isArray(notes)) {
                notes.forEach(note => {
                    if (note.isRecurring) {
                        const [_, rm, rd] = key.split('-');
                        if (key !== dateStr && `${rm}-${rd}` === targetMD) {
                            result.push({ ...note, isRecurringDisplay: true });
                        }
                    }
                });
            }
        });
        // ID 중복 제거
        return result.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    };

    // 게시글 가져오기
    const getPostsForDate = (dateStr) => {
        return posts.filter(p => p.date === dateStr);
    };

    // 메모 추가
    const addMemo = () => {
        if (!memoTitle.trim() || !selectedDate) return;
        const memos = calendarNotes[selectedDate] && Array.isArray(calendarNotes[selectedDate]) ? calendarNotes[selectedDate] : [];
        const newMemo = {
            id: Date.now(),
            title: memoTitle.trim(),
            color: memoColor,
            isRecurring: isRecurringMemo
        };
        setCalendarNotes(prev => ({
            ...prev,
            [selectedDate]: [...memos, newMemo]
        }));
        setMemoTitle('');
        setMemoColor('#007AFF');
        setIsRecurringMemo(false);
        setIsAddingMemo(false);
    };

    // 메모 수정
    const updateMemo = () => {
        if (!editingMemo || !memoTitle.trim() || !selectedDate) return;
        // 현재 날짜 키에 있는 메모만 수정 (반복된 타 날짜 메모는 일단 제외)
        const memos = calendarNotes[selectedDate] && Array.isArray(calendarNotes[selectedDate]) ? calendarNotes[selectedDate] : [];
        const updated = memos.map(m => m.id === editingMemo.id ? {
            ...m,
            title: memoTitle.trim(),
            color: memoColor,
            isRecurring: isRecurringMemo
        } : m);
        setCalendarNotes(prev => ({ ...prev, [selectedDate]: updated }));
        setEditingMemo(null);
        setMemoTitle('');
        setMemoColor('#007AFF');
        setIsRecurringMemo(false);
    };

    // 메모 삭제
    const deleteMemo = (id) => {
        if (!selectedDate) return;
        const memos = getMemosForDate(selectedDate);
        const filtered = memos.filter(m => m.id !== id);
        setCalendarNotes(prev => {
            const next = { ...prev };
            if (filtered.length === 0) delete next[selectedDate];
            else next[selectedDate] = filtered;
            return next;
        });
    };

    // Combine default + custom anniversaries
    const allAnniversaries = [
        { id: 'default-start', title: '시작일', date: settings.anniversaryDate, emoji: '💕', isDefault: true },
        { id: 'default-100', title: '100일', date: new Date(new Date(settings.anniversaryDate).getTime() + 99 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), emoji: '🎂', isDefault: true },
        { id: 'default-1yr', title: '1주년', date: new Date(new Date(settings.anniversaryDate).getTime() + 364 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), emoji: '🎉', isDefault: true },
        ...anniversaries
    ];

    const isAnniversary = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return allAnniversaries.find(a => a.date === dateStr);
    };

    // Calculate D-Day for each anniversary
    const calcDDay = (dateStr) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(dateStr);
        target.setHours(0, 0, 0, 0);
        return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    };

    // Save anniversary
    const handleSaveAnniversary = async () => {
        if (!anniversaryForm.title.trim() || !anniversaryForm.date) {
            alert('기념일 이름과 날짜를 입력해주세요.');
            return;
        }

        const action = editingAnniversary ? '수정' : '저장';
        if (!confirm(`정말 ${action}하시겠습니까?`)) return;

        try {
            if (editingAnniversary) {
                // 기본 기념일(시작일) 수정 시 settings 업데이트 필요
                if (editingAnniversary.isDefault && editingAnniversary.id === 'default-start') {
                    // 시작일 변경 알림
                    alert('시작일을 변경하면 100일, 1주년도 자동으로 변경됩니다.');
                }
                await onUpdateAnniversary(editingAnniversary.id, anniversaryForm);
            } else {
                await onAddAnniversary(anniversaryForm);
            }
            setIsAnniversaryFormOpen(false);
            setEditingAnniversary(null);
            setAnniversaryForm({ title: '', date: '', emoji: '💕' });
            alert(`기념일이 ${action}되었습니다!`);
        } catch (err) {
            alert('저장 실패: ' + err.message);
        }
    };

    const isToday = (day) => {
        const today = new Date();
        return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    };

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {/* 기념일 카드 */}
            <div className="card-bg rounded-2xl p-5 border border-theme-100 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">💕 우리의 기념일</h3>
                    <button
                        onClick={() => { setIsAnniversaryFormOpen(true); setEditingAnniversary(null); setAnniversaryForm({ title: '', date: '', emoji: '💕' }); }}
                        className="text-sm text-theme-500 font-medium flex items-center gap-1"
                    >
                        <Icon name="plus" size={14} /> 추가
                    </button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {allAnniversaries.map((item) => {
                        const d = calcDDay(item.date);
                        return (
                            <div key={item.id} className="flex items-center justify-between bg-theme-50 rounded-xl p-3 group">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{item.emoji}</span>
                                    <div>
                                        <p className="text-sm font-bold text-primary">{item.title}</p>
                                        <p className="text-xs text-secondary">{item.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold ${d > 0 ? 'text-theme-500' : d === 0 ? 'text-green-500' : 'text-secondary'}`}>
                                        {d > 0 ? `D-${d}` : d === 0 ? '🎉 오늘!' : `D+${Math.abs(d)}`}
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                                        <button onClick={() => {
                                            setEditingAnniversary(item);
                                            setAnniversaryForm({ title: item.title, date: item.date, emoji: item.emoji, isDefault: item.isDefault });
                                            setIsAnniversaryFormOpen(true);
                                        }} className="p-1.5 hover:bg-white rounded-lg">
                                            <Icon name="pencil" size={14} className="text-secondary" />
                                        </button>
                                        <button onClick={() => {
                                            if (confirm('정말 이 기념일을 삭제하시겠습니까?')) {
                                                if (item.isDefault) {
                                                    alert('기본 기념일은 삭제할 수 없습니다. 날짜를 수정해주세요.');
                                                } else {
                                                    onDeleteAnniversary(item.id);
                                                }
                                            }
                                        }} className="p-1.5 hover:bg-white rounded-lg">
                                            <Icon name="trash-2" size={14} className="text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 기념일 추가/수정 모달 */}
            {/* 기념일 추가/수정 모달 */}
            <AnimatePresence>
                {isAnniversaryFormOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsAnniversaryFormOpen(false)}
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="pointer-events-auto relative card-bg rounded-2xl shadow-2xl p-5 w-full max-w-sm border border-theme-100"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="font-bold text-lg mb-4">{editingAnniversary ? '기념일 수정' : '새 기념일 추가'}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-1">이모지</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {['💕', '❤️', '🎂', '🎉', '🎁', '💍', '🌹', '✨', '🥂', '📅'].map(e => (
                                                <button key={e} onClick={() => setAnniversaryForm(prev => ({ ...prev, emoji: e }))}
                                                    className={`text-2xl p-1 rounded ${anniversaryForm.emoji === e ? 'bg-theme-100 ring-2 ring-theme-300' : ''}`}>
                                                    {e}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-1">기념일 이름</label>
                                        <input type="text" value={anniversaryForm.title} onChange={(e) => setAnniversaryForm(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="예: 첫 키스 기념일" className="w-full px-3 py-2 border border-theme-200 rounded-lg text-sm bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-1">날짜 선택</label>
                                        <input
                                            type="date"
                                            value={anniversaryForm.date}
                                            onChange={(e) => setAnniversaryForm(prev => ({ ...prev, date: e.target.value }))}
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                            className="w-full px-4 py-3 border-2 border-theme-200 rounded-xl text-base bg-white focus:border-theme-400 focus:outline-none cursor-pointer"
                                            style={{ colorScheme: 'light' }}
                                        />
                                        {anniversaryForm.date && (
                                            <p className="text-xs text-theme-500 mt-1">
                                                선택된 날짜: {new Date(anniversaryForm.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-6">
                                    <button onClick={() => setIsAnniversaryFormOpen(false)} className="flex-1 py-2 border border-theme-200 rounded-lg text-secondary text-sm">취소</button>
                                    <button onClick={handleSaveAnniversary} className="flex-1 py-2 bg-theme-500 text-white rounded-lg text-sm font-medium">저장</button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* 달력 */}
            <div
                className="card-bg rounded-2xl shadow-sm border border-theme-100 overflow-hidden select-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => setTouchStartX(0)}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-theme-100">
                    <button onClick={prevMonth} className="p-2 hover:bg-theme-100 rounded-full">
                        <Icon name="chevron-left" size={20} className="text-secondary" />
                    </button>
                    <button
                        onClick={() => setShowYearMonthPicker(!showYearMonthPicker)}
                        className="font-semibold text-lg text-primary"
                    >
                        {year}년 {month + 1}월
                    </button>
                    <div className="flex items-center gap-1">
                        <button onClick={nextMonth} className="p-2 hover:bg-theme-100 rounded-full">
                            <Icon name="chevron-right" size={20} className="text-secondary" />
                        </button>
                        {/* 설정 메뉴 */}
                        <div className="relative">
                            <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-2 hover:bg-theme-100 rounded-full">
                                <Icon name="settings" size={20} className="text-secondary" />
                            </button>
                            {isSettingsOpen && (
                                <div className="absolute top-full right-0 mt-2 card-bg border border-theme-100 rounded-xl shadow-xl z-50 min-w-[180px] p-2 animate-scaleIn">
                                    <button onClick={handleBackup} className="w-full text-left px-3 py-2 rounded-lg hover:bg-theme-50 text-primary text-sm flex items-center gap-2">
                                        <Icon name="download" size={16} /> 백업 내보내기
                                    </button>
                                    <label className="w-full text-left px-3 py-2 rounded-lg hover:bg-theme-50 text-primary text-sm flex items-center gap-2 cursor-pointer">
                                        <Icon name="upload" size={16} /> 백업 불러오기
                                        <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 요일 */}
                <div className="grid grid-cols-7 border-b border-theme-100">
                    {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                        <div key={d} className={`text-center text-xs font-medium py-2 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-secondary'}`}>
                            {d}
                        </div>
                    ))}
                </div>

                {/* 날짜 그리드 */}
                <div className="grid grid-cols-7">
                    {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} className="aspect-square" />)}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const memos = getMemosForDate(dateStr);
                        const dayPosts = getPostsForDate(dateStr);
                        const today = isToday(day);
                        const dayOfWeek = (firstDay + i) % 7;
                        const totalItems = memos.length + dayPosts.length;
                        const moodId = moodStamps && moodStamps[dateStr];
                        const moodObj = moodId ? MOOD_OPTIONS.find(m => m.id === moodId) : null;
                        const anniversaryItem = isAnniversary(day);

                        return (
                            <button
                                key={day}
                                onClick={() => handleDayClick(day)}
                                className="aspect-square flex flex-col items-center justify-center relative cal-cell hover:bg-theme-100"
                            >
                                {/* Anniversary Star */}
                                {anniversaryItem && (
                                    <span className="absolute top-0.5 left-0.5 text-yellow-400 text-[10px]" title={anniversaryItem.title}>⭐</span>
                                )}
                                <span className={`text-sm text-primary p-1 rounded-full w-7 h-7 flex items-center justify-center ${today ? 'bg-theme-500 text-white' : ''} ${!today && dayOfWeek === 0 ? 'text-red-400' : ''} ${!today && dayOfWeek === 6 ? 'text-blue-400' : ''}`}>
                                    {day}
                                </span>
                                {moodObj ? (
                                    <div className={`absolute top-1 right-1 ${moodObj.color}`}>
                                        <Icon name={moodObj.icon} size={12} />
                                    </div>
                                ) : (
                                    moodId && <span className="absolute top-1 right-1 text-[10px] sm:text-xs">{moodId}</span>
                                )}
                                {/* 아이템 표시 (메모 색상 + 게시글) */}
                                {totalItems > 0 && (
                                    <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center max-w-full px-1">
                                        {memos.map((m, idx) => (
                                            <div key={idx} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color || '#007AFF' }} />
                                        ))}
                                        {dayPosts.map((p, idx) => (
                                            <div key={`p-${idx}`} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getPostColor(p.id) }} />
                                        ))}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 상세 모달 */}
            {/* 상세 모달 (Standard Popup) */}
            <AnimatePresence>
                {isModalOpen && selectedDate && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="pointer-events-auto relative w-full max-w-2xl card-bg rounded-2xl shadow-2xl overflow-hidden border border-theme-100 max-h-[85vh] flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-5 overflow-y-auto">
                                    {/* 헤더 */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-primary">
                                            {new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
                                        </h3>
                                        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-theme-100 rounded-full">
                                            <Icon name="x" size={20} className="text-secondary" />
                                        </button>
                                    </div>

                                    {/* 오늘의 기분 스탬프 */}
                                    <div className="mb-6 border-b border-theme-100 pb-4">
                                        <h4 className="font-semibold text-primary text-sm mb-3 flex items-center gap-2">
                                            <Icon name="smile" size={16} /> 오늘의 기분
                                        </h4>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {MOOD_OPTIONS.map(mood => {
                                                const isSelected = moodStamps[selectedDate] === mood.id;
                                                return (
                                                    <button key={mood.id} onClick={() => setMoodStamps(prev => {
                                                        if (prev[selectedDate] === mood.id) {
                                                            const next = { ...prev };
                                                            delete next[selectedDate];
                                                            return next;
                                                        }
                                                        return { ...prev, [selectedDate]: mood.id };
                                                    })}
                                                        className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[3.5rem] h-14 rounded-2xl border transition-all ${isSelected ? `${mood.bg} ${mood.color} border-current ring-1 ring-current shadow-sm` : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-500'}`}>
                                                        <Icon name={mood.icon} size={20} className="mb-0.5" />
                                                        <span className="text-[10px] font-bold">{mood.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 메모 섹션 */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-primary flex items-center gap-2">
                                                <Icon name="file-text" size={16} /> 메모 ({getMemosForDate(selectedDate).length})
                                            </h4>
                                            <button
                                                onClick={() => { setIsAddingMemo(true); setMemoTitle(''); setMemoColor('#007AFF'); }}
                                                className="text-sm text-theme-500 font-medium"
                                            >+ 추가</button>
                                        </div>

                                        {/* 메모 추가/수정 폼 */}
                                        {(isAddingMemo || editingMemo) && (
                                            <div className="mb-3 p-3 rounded-xl border border-theme-200 bg-theme-50">
                                                <input
                                                    type="text"
                                                    value={memoTitle}
                                                    onChange={(e) => setMemoTitle(e.target.value)}
                                                    placeholder="메모 내용..."
                                                    className="w-full px-3 py-2 border border-theme-200 rounded-lg text-sm mb-2 bg-white text-gray-800"
                                                    autoFocus
                                                    onKeyDown={(e) => e.key === 'Enter' && (editingMemo ? updateMemo() : addMemo())}
                                                />
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs text-secondary">색상:</span>
                                                    {MEMO_COLORS.map(c => (
                                                        <button
                                                            key={c}
                                                            onClick={() => setMemoColor(c)}
                                                            className={`w-5 h-5 rounded-full transition-transform ${memoColor === c ? 'ring-2 ring-offset-1 ring-theme-400 scale-110' : ''}`}
                                                            style={{ backgroundColor: c }}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <input
                                                        type="checkbox"
                                                        id="recurring"
                                                        checked={isRecurringMemo}
                                                        onChange={(e) => setIsRecurringMemo(e.target.checked)}
                                                        className="rounded border-theme-300 text-theme-500 focus:ring-theme-500"
                                                    />
                                                    <label htmlFor="recurring" className="text-xs text-secondary cursor-pointer select-none flex items-center gap-1">
                                                        <Icon name="rotate-cw" size={12} /> 매년 반복
                                                    </label>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={editingMemo ? updateMemo : addMemo} className="flex-1 py-2 bg-theme-500 text-white rounded-lg text-sm font-medium">
                                                        {editingMemo ? '수정' : '추가'}
                                                    </button>
                                                    <button onClick={() => { setIsAddingMemo(false); setEditingMemo(null); }} className="px-3 py-2 text-secondary text-sm">취소</button>
                                                </div>
                                            </div>
                                        )}

                                        {/* 메모 목록 */}
                                        <div className="space-y-2">
                                            {getMemosForDate(selectedDate).map(memo => (
                                                <div key={memo.id} className="p-3 rounded-lg flex items-center justify-between group" style={{ backgroundColor: memo.color + '20', borderLeft: `3px solid ${memo.color}` }}>
                                                    <span className="text-sm text-primary flex items-center gap-1">
                                                        {memo.title}
                                                        {(memo.isRecurring || memo.isRecurringDisplay) && <Icon name="rotate-cw" size={10} className="text-secondary" />}
                                                    </span>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditingMemo(memo); setMemoTitle(memo.title); setMemoColor(memo.color || '#007AFF'); setIsAddingMemo(false); }} className="p-1 hover:bg-white/50 rounded">
                                                            <Icon name="pencil" size={12} className="text-secondary" />
                                                        </button>
                                                        <button onClick={() => deleteMemo(memo.id)} className="p-1 hover:bg-white/50 rounded">
                                                            <Icon name="trash-2" size={12} className="text-red-400" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {getMemosForDate(selectedDate).length === 0 && !isAddingMemo && (
                                                <p className="text-center text-secondary text-sm py-3">메모가 없습니다</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* 게시글 섹션 */}
                                    <div>
                                        <h4 className="font-semibold text-primary flex items-center gap-2 mb-3">
                                            <Icon name="image" size={16} className="text-pink-400" /> 게시글 ({getPostsForDate(selectedDate).length})
                                        </h4>
                                        <div className="space-y-2">
                                            {getPostsForDate(selectedDate).map(post => (
                                                <div key={post.id} className="p-3 rounded-lg flex items-center gap-3" style={{ backgroundColor: getPostColor(post.id) + '20', borderLeft: `3px solid ${getPostColor(post.id)}` }}>
                                                    <button onClick={() => { onSelectPost(post); setIsModalOpen(false); }} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                                        {post.media[0] && (
                                                            post.media[0].type === 'video' ? (
                                                                <div className="w-10 h-10 rounded-lg bg-black/10 flex items-center justify-center shrink-0">
                                                                    <Icon name="video" size={20} className="text-primary" />
                                                                </div>
                                                            ) : (
                                                                <img src={post.media[0].url} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" />
                                                            )
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-primary truncate">{post.content}</p>
                                                        </div>
                                                    </button>
                                                    {/* 색상 선택 */}
                                                    <div className="flex gap-0.5">
                                                        {MEMO_COLORS.slice(0, 4).map(c => (
                                                            <button
                                                                key={c}
                                                                onClick={() => setPostColor(post.id, c)}
                                                                className={`w-4 h-4 rounded-full transition-transform ${getPostColor(post.id) === c ? 'ring-1 ring-offset-1 ring-gray-400 scale-110' : ''}`}
                                                                style={{ backgroundColor: c }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            {getPostsForDate(selectedDate).length === 0 && (
                                                <p className="text-center text-secondary text-sm py-3">게시글이 없습니다</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default CalendarView;
