import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { BALANCE_QUESTIONS, getTodayQuestion } from '../../constants/balanceGame';
import { ACHIEVEMENTS } from '../../constants';

const BalanceGameCard = ({ settings, coupleUsers, currentUser, onUpdateSettings }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const today = new Date().toISOString().slice(0, 10);

    // 게임 데이터 가져오기
    const gameData = settings.balanceGame || { completedIds: [], todayAnswers: {}, todayDate: '' };

    // 오늘 날짜가 변경되면 todayAnswers 초기화 (00시 초기화 로직)
    const isNewDay = gameData.todayDate !== today;
    const completedIds = isNewDay ? (gameData.completedIds || []) : (gameData.completedIds || []);
    const todayAnswers = isNewDay ? {} : (gameData.todayAnswers || {});

    // 오늘의 질문 가져오기
    const todayQuestion = getTodayQuestion(completedIds);

    // 내 답변 / 상대방 답변 (데이터 구조: { option: 'A', comment: '...' })
    // 하위 호환성: 문자열이면 객체로 변환
    const getAnswerData = (uid) => {
        const data = todayAnswers[uid];
        if (!data) return null;
        if (typeof data === 'string') return { option: data, comment: '' };
        return data;
    };

    const myAnswerData = getAnswerData(currentUser?.uid);
    const partnerUser = coupleUsers.find(u => u.uid !== currentUser?.uid);
    const partnerAnswerData = partnerUser ? getAnswerData(partnerUser.uid) : null;

    // 확정된 답변이 있는지
    const myConfirmedAnswer = myAnswerData?.option;

    // 둘 다 답변했는지
    const bothAnswered = myConfirmedAnswer && partnerAnswerData?.option;
    const isMatch = bothAnswered && myConfirmedAnswer === partnerAnswerData?.option;

    // 선택 핸들러 (확정 전)
    const handleSelect = (option) => {
        if (myConfirmedAnswer) return; // 이미 확정했으면 수정 불가
        setSelectedOption(option);
    };

    // 답변 제출 (확정)
    const handleSubmit = async () => {
        if (!selectedOption || isSubmitting) return;
        setIsSubmitting(true);

        try {
            // 1. 답변 저장
            const newAnswers = {
                ...todayAnswers,
                [currentUser.uid]: { option: selectedOption, comment: comment.trim() }
            };

            // 2. XP 보상 및 통계 업데이트
            // 밸런스 게임 참여 횟수 증가 (업적용)
            const currentStats = settings.gameStats || { balanceCount: 0 };
            const newCount = (currentStats.balanceCount || 0) + 1;
            const newStats = { ...currentStats, balanceCount: newCount };

            // XP 지급
            const currentGrowth = settings.growth || { level: 1, exp: 0, achievements: [] };
            let newExp = (currentGrowth.exp || 0) + 10;
            let newAchievements = [...(currentGrowth.achievements || [])];
            let alertMessage = "✅ 답변이 등록되었습니다! (+10 XP)";

            // 업적 달성 체크
            const unlockedAchievements = ACHIEVEMENTS.filter(a =>
                a.type === 'balance' &&
                newCount >= a.target &&
                !newAchievements.includes(a.id)
            );

            if (unlockedAchievements.length > 0) {
                unlockedAchievements.forEach(ach => {
                    newAchievements.push(ach.id);
                    newExp += ach.reward;
                    alertMessage += `\n🏆 업적 달성: ${ach.title} (+${ach.reward} XP)`;
                });
            }

            const newGrowth = {
                ...currentGrowth,
                exp: newExp,
                achievements: newAchievements
            };

            // 3. 게임 데이터 업데이트
            const newGameData = {
                ...gameData,
                todayDate: today,
                todayAnswers: newAnswers,
                // 둘 다 답변하면 completedIds에 추가 (중복 방지)
                completedIds: (partnerAnswerData && partnerAnswerData.option)
                    ? [...completedIds, todayQuestion.id]
                    : completedIds
            };

            await onUpdateSettings({
                balanceGame: newGameData,
                growth: newGrowth,
                gameStats: newStats
            });

            alert(alertMessage);
        } catch (error) {
            console.error("Failed to submit balance game answer:", error);
            alert("저장에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 둘 다 답변 완료 시 completedIds 업데이트 (상대방이 나중에 했을 때를 위해)
    // 단, 내 쪽에서 이미 처리했으면 패스. 이 useEffect는 주로 실시간 업데이트 동기화를 위함.
    useEffect(() => {
        if (bothAnswered && !completedIds.includes(todayQuestion.id)) {
            // 로컬 상태와 DB 상태 불일치 방지 위해 한번 더 체크하고 업데이트는 생략하거나 신중히 해야 함.
            // 여기서는 handleSubmit에서 이미 처리하므로, 상대방 로직에 의존하거나
            // 간단히 렌더링 시점에 completedIds가 업데이트되지 않았을 때를 대비함.
            // 하지만 무한 루프 위험이 있으므로, handleSubmit에서 처리하는 것을 원칙으로 함.
        }
    }, [bothAnswered]);

    return (
        <div className="card-bg rounded-2xl p-5 border border-theme-100 mb-6 bg-gradient-to-br from-purple-50 to-pink-50 shadow-sm relative overflow-hidden">
            {/* 배경 장식 */}
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <Icon name="scale" size={60} className="text-purple-500" />
            </div>

            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">⚖️</span>
                    <div>
                        <h3 className="font-bold text-primary text-sm">오늘의 밸런스 게임</h3>
                        <p className="text-[10px] text-secondary">{todayQuestion.category} • #{completedIds.length + 1}번째 질문</p>
                    </div>
                </div>
                {bothAnswered && (
                    <div className={`px-3 py-1 rounded-full text-xs font-bold animate-bounce-slow ${isMatch ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {isMatch ? '💖 천생연분!' : '😂 이건 달랐네!'}
                    </div>
                )}
            </div>

            {/* 질문 */}
            <div className="text-center mb-6">
                <p className="font-bold text-lg text-gray-800 break-keep">둘 중에 하나만 고른다면?</p>
            </div>

            {/* 선택지 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Option A */}
                <button
                    onClick={() => handleSelect('A')}
                    disabled={!!myConfirmedAnswer}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left group ${(myConfirmedAnswer === 'A' || selectedOption === 'A')
                        ? 'border-purple-500 bg-purple-100 scale-105 shadow-md'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                        } ${(myConfirmedAnswer && myConfirmedAnswer !== 'A') ? 'opacity-50 grayscale' : ''}`}
                >
                    <span className="text-3xl mb-3 block">🅰️</span>
                    <p className="text-sm font-bold text-gray-800 leading-tight break-keep">{todayQuestion.optionA}</p>

                    {/* 상대방 선택 표시 (둘 다 답변했을 때만 공개) */}
                    {bothAnswered && partnerAnswerData?.option === 'A' && (
                        <div className="absolute -top-3 -right-2 bg-white p-1 rounded-full shadow-sm border border-pink-100 z-10 animate-bounce">
                            <span className="text-xs font-bold text-pink-500 px-2 py-0.5 bg-pink-100 rounded-full">
                                {partnerUser?.name || '상대방'}
                            </span>
                        </div>
                    )}
                </button>

                {/* Option B */}
                <button
                    onClick={() => handleSelect('B')}
                    disabled={!!myConfirmedAnswer}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left group ${(myConfirmedAnswer === 'B' || selectedOption === 'B')
                        ? 'border-pink-500 bg-pink-100 scale-105 shadow-md'
                        : 'border-gray-200 bg-white hover:border-pink-300 hover:bg-pink-50'
                        } ${(myConfirmedAnswer && myConfirmedAnswer !== 'B') ? 'opacity-50 grayscale' : ''}`}
                >
                    <span className="text-3xl mb-3 block">🅱️</span>
                    <p className="text-sm font-bold text-gray-800 leading-tight break-keep">{todayQuestion.optionB}</p>

                    {/* 상대방 선택 표시 */}
                    {bothAnswered && partnerAnswerData?.option === 'B' && (
                        <div className="absolute -top-3 -right-2 bg-white p-1 rounded-full shadow-sm border border-pink-100 z-10 animate-bounce">
                            <span className="text-xs font-bold text-pink-500 px-2 py-0.5 bg-pink-100 rounded-full">
                                {partnerUser?.name || '상대방'}
                            </span>
                        </div>
                    )}
                </button>
            </div>

            {/* 선택 후 입력 폼 (확정 전) */}
            {!myConfirmedAnswer && selectedOption && (
                <div className="animate-fadeIn mt-4 p-4 bg-white/50 rounded-xl border border-white/60">
                    <p className="text-xs font-bold text-gray-500 mb-2">선택한 이유 (선택사항)</p>
                    <textarea
                        className="w-full text-sm p-3 rounded-lg border border-gray-200 focus:border-theme-500 focus:ring-1 focus:ring-theme-200 outline-none resize-none bg-white"
                        rows="2"
                        placeholder="왜 이 선택지를 골랐나요? 상대방에게 알려주세요!"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full mt-3 py-3 rounded-xl bg-theme-500 text-white font-bold shadow-lg hover:bg-theme-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Icon name="loader" className="animate-spin" /> : <Icon name="check" />}
                        선택 확정하기 (+10 XP)
                    </button>
                </div>
            )}

            {/* 결과 및 코멘트 표시 (확정 후) */}
            {myConfirmedAnswer && (
                <div className="mt-4 animate-fadeIn">
                    {!bothAnswered ? (
                        <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-1">
                                <div className="w-4 h-4 border-2 border-theme-500 border-t-transparent rounded-full animate-spin" />
                                <span className="font-medium">상대방의 선택을 기다리고 있어요...</span>
                            </div>
                            <p className="text-[10px] text-gray-400">상대방도 답변하면 서로의 선택과 이유가 공개됩니다!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* 내 코멘트 */}
                            <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                                <span className="text-[10px] font-bold text-purple-500 block mb-1">나의 생각</span>
                                <p className="text-sm text-gray-700">{myAnswerData.comment || "코멘트 없음"}</p>
                            </div>

                            {/* 상대방 코멘트 */}
                            <div className="bg-pink-50 p-3 rounded-xl border border-pink-100">
                                <span className="text-[10px] font-bold text-pink-500 block mb-1">{partnerUser?.name || '상대방'}의 생각</span>
                                <p className="text-sm text-gray-700">{partnerAnswerData?.comment || "코멘트 없음"}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 진행률 표시 */}
            <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>완료한 질문: {completedIds.length}개</span>
                    <span>남은 질문: {BALANCE_QUESTIONS.length - completedIds.length}개</span>
                </div>
                <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all"
                        style={{ width: `${(completedIds.length / BALANCE_QUESTIONS.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default BalanceGameCard;
