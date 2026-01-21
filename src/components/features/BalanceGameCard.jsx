import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { BALANCE_QUESTIONS, getTodayQuestion } from '../../constants/balanceGame';
import { ACHIEVEMENTS } from '../../constants';

const BalanceGameCard = ({ settings, coupleUsers, currentUser, onUpdateSettings }) => {
    const [selectedOption, setSelectedOption] = useState(null); // 'A' or 'B' (임시 선택)
    const [isInputOpen, setIsInputOpen] = useState(false); // 이유 입력 모달 상태
    const [comment, setComment] = useState(''); // 입력된 이유
    const [isSubmitting, setIsSubmitting] = useState(false);

    const today = new Date().toISOString().slice(0, 10);

    // V2로 변경하여 강제 초기화 효과
    const gameData = settings.balanceGameV2 || { completedIds: [], todayAnswers: {}, todayDate: '' };

    // 오늘 날짜가 변경되면 todayAnswers 초기화
    const isNewDay = gameData.todayDate !== today;
    const completedIds = isNewDay ? (gameData.completedIds || []) : (gameData.completedIds || []);
    const todayAnswers = isNewDay ? {} : (gameData.todayAnswers || {});

    // 오늘의 질문
    const todayQuestion = getTodayQuestion(completedIds);

    // 사용자 데이터 가져오기 helper
    const getAnswerData = (uid) => {
        const data = todayAnswers[uid];
        if (!data) return null;
        return data; // { option: 'A', comment: '...' }
    };

    const myAnswerData = getAnswerData(currentUser?.uid);
    const partnerUser = coupleUsers.find(u => u.uid !== currentUser?.uid);
    const partnerAnswerData = partnerUser ? getAnswerData(partnerUser.uid) : null;

    // 이미 최종 제출했는지 확인
    const hasSubmitted = !!myAnswerData;

    // 둘 다 제출했는지 (결과 공개 여부)
    const bothAnswered = hasSubmitted && !!partnerAnswerData;
    const isMatch = bothAnswered && myAnswerData.option === partnerAnswerData.option;

    // 1. 선택지 클릭 핸들러
    const handleOptionClick = (option) => {
        if (hasSubmitted) return;
        setSelectedOption(option);
    };

    // 2. 확정 버튼 클릭 -> 모달 오픈
    const handleConfirmClick = () => {
        if (!selectedOption) return;
        setIsInputOpen(true);
    };

    // 3. 모달에서 저장 버튼 클릭 -> 최종 제출
    const handleFinalSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // 답변 데이터 구성
            const newAnswers = {
                ...todayAnswers,
                [currentUser.uid]: { option: selectedOption, comment: comment.trim() }
            };

            // 통계 및 XP (업적 체크용)
            const currentStats = settings.gameStats || { balanceCount: 0 };
            const newCount = (currentStats.balanceCount || 0) + 1;
            const newStats = { ...currentStats, balanceCount: newCount };

            const currentGrowth = settings.growth || { level: 1, exp: 0, achievements: [] };
            let newExp = (currentGrowth.exp || 0) + 10;
            let newAchievements = [...(currentGrowth.achievements || [])];
            let alertMessage = "✅ 답변이 저장되었습니다! (+10 XP)";

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

            // 데이터 업데이트
            const newGameData = {
                ...gameData,
                todayDate: today,
                todayAnswers: newAnswers,
                // 둘 다 답변했으면 완료 목록에 추가
                completedIds: (partnerAnswerData)
                    ? [...completedIds, todayQuestion.id]
                    : completedIds
            };

            await onUpdateSettings({
                balanceGameV2: newGameData, // V2 키 사용
                growth: newGrowth,
                gameStats: newStats
            });

            setIsInputOpen(false);
            alert(alertMessage);

        } catch (error) {
            console.error("Failed to submit:", error);
            alert("저장에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 상대방이 나중에 답변했을 때 실시간 업데이트 처리
    useEffect(() => {
        if (bothAnswered && !completedIds.includes(todayQuestion.id)) {
            // 이 부분은 실시간 동기화 시 자동으로 처리되거나,
            // 다음날 접속 시 completedIds가 갱신되어 있을 것임.
            // 굳이 여기서 강제 업데이트 안 해도 됨 (무한 루프 방지)
        }
    }, [bothAnswered]);

    return (
        <>
            <div className="card-bg rounded-2xl p-5 border border-theme-100 mb-6 bg-gradient-to-br from-purple-50 to-pink-50 shadow-sm relative overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⚖️</span>
                        <div>
                            <h3 className="font-bold text-primary text-sm">오늘의 밸런스 게임</h3>
                            <p className="text-[10px] text-secondary">{todayQuestion.category} • #{completedIds.length + 1}번째</p>
                        </div>
                    </div>
                    {bothAnswered && (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold animate-bounce-slow ${isMatch ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {isMatch ? '💖 천생연분!' : '😂 취향 차이!'}
                        </div>
                    )}
                </div>

                {/* 질문 텍스트 */}
                <div className="text-center mb-6">
                    <p className="font-bold text-lg text-gray-800 break-keep">둘 중에 하나만 고른다면?</p>
                </div>

                {/* 선택지 영역 */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Option A */}
                    <button
                        onClick={() => handleOptionClick('A')}
                        disabled={hasSubmitted}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left group
                            ${(hasSubmitted ? myAnswerData?.option === 'A' : selectedOption === 'A')
                                ? 'border-purple-500 bg-purple-100 scale-105 shadow-md ring-2 ring-purple-200'
                                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                            }
                            ${hasSubmitted && myAnswerData?.option !== 'A' ? 'opacity-50 grayscale' : ''}
                        `}
                    >
                        <span className="text-3xl mb-3 block">🅰️</span>
                        <p className="text-sm font-bold text-gray-800 leading-tight break-keep">{todayQuestion.optionA}</p>

                        {/* 결과 공개 시 상대방 선택 표시 */}
                        {bothAnswered && partnerAnswerData.option === 'A' && (
                            <div className="absolute -top-3 -right-2 bg-white p-1 rounded-full shadow-md border border-pink-100 z-10 animate-bounce">
                                <span className="text-xs font-bold text-pink-500 px-2 py-0.5 bg-pink-100 rounded-full border border-pink-200">
                                    {partnerUser?.name || '상대방'}
                                </span>
                            </div>
                        )}
                    </button>

                    {/* Option B */}
                    <button
                        onClick={() => handleOptionClick('B')}
                        disabled={hasSubmitted}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left group
                            ${(hasSubmitted ? myAnswerData?.option === 'B' : selectedOption === 'B')
                                ? 'border-pink-500 bg-pink-100 scale-105 shadow-md ring-2 ring-pink-200'
                                : 'border-gray-200 bg-white hover:border-pink-300 hover:bg-pink-50'
                            }
                            ${hasSubmitted && myAnswerData?.option !== 'B' ? 'opacity-50 grayscale' : ''}
                        `}
                    >
                        <span className="text-3xl mb-3 block">🅱️</span>
                        <p className="text-sm font-bold text-gray-800 leading-tight break-keep">{todayQuestion.optionB}</p>

                        {/* 결과 공개 시 상대방 선택 표시 */}
                        {bothAnswered && partnerAnswerData.option === 'B' && (
                            <div className="absolute -top-3 -right-2 bg-white p-1 rounded-full shadow-md border border-pink-100 z-10 animate-bounce">
                                <span className="text-xs font-bold text-pink-500 px-2 py-0.5 bg-pink-100 rounded-full border border-pink-200">
                                    {partnerUser?.name || '상대방'}
                                </span>
                            </div>
                        )}
                    </button>
                </div>

                {/* 확정 버튼 (선택했으나 아직 제출 안 했을 때) */}
                {!hasSubmitted && selectedOption && (
                    <button
                        onClick={handleConfirmClick}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-theme-500 to-pink-500 text-white font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 animate-fadeInUp"
                    >
                        <span>이걸로 확정하기</span>
                        <Icon name="arrow-right" size={16} />
                    </button>
                )}

                {/* 대기 상태 메시지 */}
                {hasSubmitted && !bothAnswered && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-center animate-fadeIn">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-1">
                            <Icon name="loader" className="animate-spin text-theme-500" size={16} />
                            <span className="font-bold">상대방의 선택을 기다리는 중...</span>
                        </div>
                        <p className="text-xs text-gray-400">상대방도 답변하면 서로의 이유를 볼 수 있어요!</p>
                    </div>
                )}

                {/* 결과 확인 (둘 다 제출 시) */}
                {bothAnswered && (
                    <div className="mt-4 space-y-3 animate-fadeIn">
                        {/* 내 답변 & 코멘트 */}
                        <div className="bg-white/60 p-3 rounded-xl border border-theme-100">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold bg-theme-100 text-theme-600 px-2 py-0.5 rounded-full">나의 생각</span>
                                <p className="text-xs text-gray-500 font-medium">
                                    "{myAnswerData.option === 'A' ? todayQuestion.optionA : todayQuestion.optionB}" 선택
                                </p>
                            </div>
                            <p className="text-sm text-gray-800 pl-1">{myAnswerData.comment || "코멘트 없음"}</p>
                        </div>

                        {/* 상대방 답변 & 코멘트 */}
                        <div className="bg-white/60 p-3 rounded-xl border border-pink-100">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">{partnerUser?.name}의 생각</span>
                                <p className="text-xs text-gray-500 font-medium">
                                    "{partnerAnswerData.option === 'A' ? todayQuestion.optionA : todayQuestion.optionB}" 선택
                                </p>
                            </div>
                            <p className="text-sm text-gray-800 pl-1">{partnerAnswerData.comment || "코멘트 없음"}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 이유 입력 모달 (팝업) */}
            {isInputOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsInputOpen(false)} />
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 relative z-10 shadow-2xl animate-scaleIn">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">선택한 이유가 뭔가요?</h3>
                        <p className="text-xs text-gray-500 text-center mb-6">
                            "{selectedOption === 'A' ? todayQuestion.optionA : todayQuestion.optionB}"<br />
                            를 선택하신 이유를 간단히 적어주세요!
                        </p>

                        <textarea
                            className="w-full h-24 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-theme-500 focus:ring-1 focus:ring-theme-200 outline-none resize-none text-sm mb-4"
                            placeholder="예: 나는 평소에 ~하니까 이게 더 좋아!"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            autoFocus
                        />

                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsInputOpen(false)}
                                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleFinalSubmit}
                                disabled={isSubmitting}
                                className="flex-[2] py-3 rounded-xl gradient-theme text-white font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Icon name="loader" className="animate-spin" /> : <Icon name="check" />}
                                저장하고 확인하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BalanceGameCard;
