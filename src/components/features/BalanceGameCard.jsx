import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { BALANCE_QUESTIONS, getTodayQuestion } from '../../constants/balanceGame';
import { ACHIEVEMENTS } from '../../constants';

const BalanceGameCard = ({ settings, coupleUsers, currentUser, onUpdateSettings }) => {
    const [selectedOption, setSelectedOption] = useState(null); // 'A' or 'B'
    const [isInputOpen, setIsInputOpen] = useState(false); // 모달 상태
    const [comment, setComment] = useState(''); // 코멘트
    const [isSubmitting, setIsSubmitting] = useState(false);

    const today = new Date().toISOString().slice(0, 10);

    // 데이터 가져오기 (V2)
    const gameData = settings.balanceGameV2 || {
        completedIds: [],
        todayAnswers: {},
        todayDate: '',
        questionId: null // 오늘의 질문 ID 저장용
    };

    // 00시 초기화 체크 (날짜가 바뀌었으면 초기화)
    const isNewDay = gameData.todayDate !== today;

    // -------------------------------------------------------------------------
    // 1. 오늘의 질문 결정 로직 (매우 중요: 하루동안 질문 고정)
    // -------------------------------------------------------------------------
    let currentQuestionId = isNewDay ? null : gameData.questionId;
    let completedIds = isNewDay ? (gameData.completedIds || []) : (gameData.completedIds || []);
    let todayAnswers = isNewDay ? {} : (gameData.todayAnswers || {});

    // 질문 ID가 없으면 새로 뽑기 (첫 진입 or 날짜 변경)
    // 주의: 렌더링 중에 DB 업데이트를 할 수 없으므로, 로컬에서만 계산하고
    // 실제 저장은 사용자가 액션을 취하거나 useEffect에서 처리해야 함.
    // 하지만 "오늘의 질문"은 보여줘야 하므로 여기서 계산은 필요함.

    // 계산된 질문 객체
    let todayQuestion;
    if (currentQuestionId) {
        todayQuestion = BALANCE_QUESTIONS.find(q => q.id === currentQuestionId) || BALANCE_QUESTIONS[0];
    } else {
        // 아직 질문이 정해지지 않았으면 새로 뽑음
        todayQuestion = getTodayQuestion(completedIds);
    }

    // 날짜가 바뀌었거나 질문 ID가 없으면 DB 업데이트 (초기화)
    useEffect(() => {
        if (isNewDay || !gameData.questionId) {
            const initGameData = {
                ...gameData,
                todayDate: today,
                todayAnswers: {}, // 답변 초기화
                questionId: todayQuestion.id, // 질문 고정
                // completedIds는 유지
            };
            onUpdateSettings({ balanceGameV2: initGameData });
        }
    }, [isNewDay, today, todayQuestion.id]);


    // 사용자 데이터 helper
    const getAnswerData = (uid) => todayAnswers[uid];
    const myAnswerData = getAnswerData(currentUser?.uid);
    const partnerUser = coupleUsers.find(u => u.uid !== currentUser?.uid);
    const partnerAnswerData = partnerUser ? getAnswerData(partnerUser.uid) : null;

    // 상태 체크
    const hasSubmitted = !!myAnswerData;
    const bothAnswered = hasSubmitted && !!partnerAnswerData;
    const isMatch = bothAnswered && myAnswerData.option === partnerAnswerData.option;

    // 코멘트 초기값 설정 (수정 시 기존 코멘트 불러오기)
    useEffect(() => {
        if (myAnswerData) {
            setComment(myAnswerData.comment || '');
            setSelectedOption(myAnswerData.option);
        }
    }, [myAnswerData?.option, myAnswerData?.comment]); // 의존성 주의

    // 액션 핸들러
    const handleOptionClick = (option) => {
        // 언제든 선택 변경 가능
        setSelectedOption(option);
    };

    const handleConfirmClick = () => {
        if (!selectedOption) return;
        setIsInputOpen(true); // 입력창 열기
    };

    const handleFinalSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const newAnswers = {
                ...todayAnswers,
                [currentUser.uid]: { option: selectedOption, comment: comment.trim() }
            };

            // 통계 및 XP (최초 1회만 지급해야 하지만, 수정 시에도 지급되는 걸 막으려면 플래그 필요)
            // 여기서는 단순함을 위해 "오늘 이미 참여했으면" XP 중복 지급 안함
            const alreadyParticipated = !!gameData.todayAnswers?.[currentUser.uid];

            let updates = { balanceGameV2: { ...gameData, todayAnswers: newAnswers, questionId: todayQuestion.id } };

            if (!alreadyParticipated) {
                // 첫 참여시에만 XP/업적 처리
                const currentStats = settings.gameStats || { balanceCount: 0 };
                const newCount = (currentStats.balanceCount || 0) + 1;
                const newStats = { ...currentStats, balanceCount: newCount };

                const currentGrowth = settings.growth || { level: 1, exp: 0, achievements: [] };
                let newExp = (currentGrowth.exp || 0) + 10;
                let newAchievements = [...(currentGrowth.achievements || [])];
                let alertMessage = "✅ 답변이 저장되었습니다! (+10 XP)";

                const unlockedAchievements = ACHIEVEMENTS.filter(a =>
                    a.type === 'balance' && newCount >= a.target && !newAchievements.includes(a.id)
                );

                if (unlockedAchievements.length > 0) {
                    unlockedAchievements.forEach(ach => {
                        newAchievements.push(ach.id);
                        newExp += ach.reward;
                        alertMessage += `\n🏆 업적 달성: ${ach.title} (+${ach.reward} XP)`;
                    });
                }

                updates.growth = { ...currentGrowth, exp: newExp, achievements: newAchievements };
                updates.gameStats = newStats;

                alert(alertMessage);
            } else {
                alert("✅ 답변이 위트있게 수정되었습니다!");
            }

            // 둘 다 답변 완료 시 completedIds에 추가 (중복 방지)
            // 주의: 이미 추가되어 있어도 계속 덮어씀 (문제 없음)
            if (partnerAnswerData) { // 나 방금 했고, 상대도 있으면
                updates.balanceGameV2.completedIds = [...new Set([...completedIds, todayQuestion.id])];
            }

            await onUpdateSettings(updates);
            setIsInputOpen(false);

        } catch (error) {
            console.error("Failed to submit:", error);
            alert("저장에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="card-bg rounded-2xl p-5 border border-theme-100 mb-6 bg-gradient-to-br from-purple-50 to-pink-50 shadow-sm relative overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⚖️</span>
                        <div>
                            <h3 className="font-bold text-primary text-sm">오늘의 밸런스 게임</h3>
                            <p className="text-[10px] text-secondary">{todayQuestion.category} • #{todayQuestion.id}</p>
                        </div>
                    </div>
                    {bothAnswered && (
                        <div className={`px-3 py-1 rounded-full text-xs font-bold animate-bounce-slow ${isMatch ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {isMatch ? '💖 천생연분!' : '😂 취향 차이!'}
                        </div>
                    )}
                </div>

                <div className="text-center mb-6">
                    <p className="font-bold text-lg text-gray-800 break-keep">둘 중에 하나만 고른다면?</p>
                </div>

                {/* 선택지 */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {['A', 'B'].map((option) => (
                        <button
                            key={option}
                            onClick={() => handleOptionClick(option)}
                            className={`relative p-4 rounded-xl border-2 transition-all text-left group
                                ${(selectedOption === option)
                                    ? option === 'A' ? 'border-purple-500 bg-purple-100 scale-105 shadow-md ring-2 ring-purple-200' : 'border-pink-500 bg-pink-100 scale-105 shadow-md ring-2 ring-pink-200'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                }
                                ${hasSubmitted && selectedOption !== option ? 'opacity-60' : ''}
                            `}
                        >
                            <span className="text-3xl mb-3 block">{option === 'A' ? '🅰️' : '🅱️'}</span>
                            <p className="text-sm font-bold text-gray-800 leading-tight break-keep">
                                {option === 'A' ? todayQuestion.optionA : todayQuestion.optionB}
                            </p>

                            {/* 상대방 선택 (결과 공개 시) */}
                            {bothAnswered && partnerAnswerData?.option === option && (
                                <div className="absolute -top-3 -right-2 bg-white p-1 rounded-full shadow-md border border-pink-100 z-10 animate-bounce">
                                    <span className="text-xs font-bold text-pink-500 px-2 py-0.5 bg-pink-100 rounded-full border border-pink-200">
                                        {partnerUser?.name || '상대방'}
                                    </span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* 확인/수정 버튼 */}
                {(!hasSubmitted || (hasSubmitted && selectedOption !== myAnswerData?.option)) && selectedOption && (
                    <button
                        onClick={handleConfirmClick}
                        className="w-full mb-3 py-3 rounded-xl bg-gradient-to-r from-theme-500 to-pink-500 text-white font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 animate-fadeInUp"
                    >
                        <span>{hasSubmitted ? '이걸로 변경하기' : '이걸로 확정하기'}</span>
                        <Icon name="arrow-right" size={16} />
                    </button>
                )}

                {/* 이미 제출했지만, 그냥 내용만 수정하고 싶을 때 */}
                {hasSubmitted && selectedOption === myAnswerData?.option && (
                    <button
                        onClick={() => setIsInputOpen(true)}
                        className="w-full mb-3 py-2 rounded-xl text-theme-500 text-xs font-bold hover:bg-theme-50 transition-colors flex items-center justify-center gap-1"
                    >
                        <Icon name="edit-3" size={12} />
                        내용 수정하기
                    </button>
                )}

                {/* 결과 화면 */}
                {bothAnswered ? (
                    <div className="mt-2 space-y-3 animate-fadeIn border-t border-gray-100 pt-4">
                        {/* 나 */}
                        <div className="bg-white/60 p-3 rounded-xl border border-theme-100">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold bg-theme-100 text-theme-600 px-2 py-0.5 rounded-full">나</span>
                                <p className="text-xs text-gray-500 font-medium">
                                    "{myAnswerData.option === 'A' ? todayQuestion.optionA : todayQuestion.optionB}"
                                </p>
                            </div>
                            <p className="text-sm text-gray-800 pl-1">{myAnswerData.comment || "코멘트 없음"}</p>
                        </div>
                        {/* 상대 */}
                        <div className="bg-white/60 p-3 rounded-xl border border-pink-100">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">{partnerUser?.name}</span>
                                <p className="text-xs text-gray-500 font-medium">
                                    "{partnerAnswerData.option === 'A' ? todayQuestion.optionA : todayQuestion.optionB}"
                                </p>
                            </div>
                            <p className="text-sm text-gray-800 pl-1">{partnerAnswerData.comment || "코멘트 없음"}</p>
                        </div>
                    </div>
                ) : hasSubmitted && (
                    <div className="text-center p-3 bg-gray-50 rounded-xl mt-3">
                        <p className="text-xs text-gray-500 animate-pulse">상대방의 선택을 기다리는 중...</p>
                    </div>
                )}
            </div>

            {/* 입력 모달 */}
            {isInputOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsInputOpen(false)} />
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 relative z-10 shadow-2xl animate-scaleIn">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">
                            {hasSubmitted ? '답변을 수정할까요?' : '선택한 이유가 뭔가요?'}
                        </h3>
                        <p className="text-xs text-gray-500 text-center mb-6">
                            "{selectedOption === 'A' ? todayQuestion.optionA : todayQuestion.optionB}"<br />
                            선택 이유를 자유롭게 적어주세요!
                        </p>

                        <textarea
                            className="w-full h-24 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-theme-500 focus:ring-1 focus:ring-theme-200 outline-none resize-none text-sm mb-4"
                            placeholder="이유를 입력하세요..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            autoFocus
                        />

                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsInputOpen(false)}
                                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleFinalSubmit}
                                disabled={isSubmitting}
                                className="flex-[2] py-3 rounded-xl gradient-theme text-white font-bold shadow-lg flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Icon name="loader" className="animate-spin" /> : <Icon name="check" />}
                                {hasSubmitted ? '수정 완료' : '저장하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BalanceGameCard;
