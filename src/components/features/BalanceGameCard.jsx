import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { BALANCE_QUESTIONS, getTodayQuestion } from '../../constants/balanceGame';
import { ACHIEVEMENTS } from '../../constants';

const BalanceGameCard = ({ settings, coupleUsers, currentUser, onUpdateSettings }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isInputOpen, setIsInputOpen] = useState(false);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');

    // 설정이 아직 로드되지 않았으면 렌더링 보류 (데이터 덮어쓰기 방지)
    if (!settings || !settings.coupleName) return null;

    const today = new Date().toISOString().slice(0, 10);
    // 빈 객체가 아니라 진짜 데이터가 없으면 초기값 사용
    const gameData = settings.balanceGameV2 || { completedIds: [], todayAnswers: {}, todayDate: '', questionId: null };

    // 날짜 변경 체크 (DB 날짜가 있고, 오늘과 다르면 New Day)
    // DB 날짜가 아예 없으면(첫 실행) New Day
    const isNewDay = gameData.todayDate && gameData.todayDate !== today;
    const isFirstRun = !gameData.todayDate;

    // -------------------------------------------------------------------------
    // 1. 오늘의 질문 결정 로직
    // -------------------------------------------------------------------------
    // 기존 질문 ID가 유효하면 유지
    let currentQuestionId = (!isNewDay && gameData.questionId) ? gameData.questionId : null;
    let completedIds = gameData.completedIds || [];
    let todayAnswers = (!isNewDay && gameData.todayAnswers) ? gameData.todayAnswers : {};

    // 질문이 없으면 새로 선정
    let todayQuestion;
    if (currentQuestionId) {
        todayQuestion = BALANCE_QUESTIONS.find(q => q.id === currentQuestionId) || BALANCE_QUESTIONS[0];
    } else {
        todayQuestion = getTodayQuestion(completedIds);
    }

    // 초기화 로직 (DB 업데이트)
    useEffect(() => {
        // 데이터가 아직 로드 중일 수 있으므로 방어
        if (!settings.coupleName) return;

        // 1. 날짜가 지났거나
        // 2. 처음 실행이거나 (날짜 없음)
        // 3. 질문 ID가 누락되었을 때
        const needsInit = isNewDay || isFirstRun || !gameData.questionId;

        if (needsInit) {
            console.log("🔄 밸런스 게임 초기화 조건 충족:", { isNewDay, isFirstRun, noQId: !gameData.questionId });

            const newCompletedIds = isNewDay ? completedIds : completedIds; // 날짜 지났다고 completedIds를 비우진 않음 (영구 기록)
            // 주의: questionId가 바뀔 때만 저장해야 함

            const initGameData = {
                ...gameData,
                todayDate: today,
                todayAnswers: {}, // 새 날이면 답변 초기화
                questionId: todayQuestion.id,
                completedIds: newCompletedIds
            };

            // 무한 루프 방지: DB값과 다를 때만 업데이트
            // JSON stringify 비교는 순서에 따라 다를 수 있으나, 여기선 간단 비교
            if (JSON.stringify(initGameData.todayAnswers) !== JSON.stringify(gameData.todayAnswers) ||
                initGameData.todayDate !== gameData.todayDate ||
                initGameData.questionId !== gameData.questionId) {

                console.log("💾 밸런스 게임 데이터 저장 실행");
                onUpdateSettings({ balanceGameV2: initGameData });
            }
        }
    }, [isNewDay, isFirstRun, today, todayQuestion.id, settings.balanceGameV2]); // settings 전체 대신 balanceGameV2만 의존성 확인

    // -------------------------------------------------------------------------
    // 2. 남은 시간 카운트다운 (00:00:00 까지)
    // -------------------------------------------------------------------------
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0); // 다음날 00:00:00

            const diff = tomorrow - now;
            if (diff <= 0) return "00:00:00";

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            const left = calculateTimeLeft();
            setTimeLeft(left);
            if (left === "00:00:00") {
                window.location.reload(); // 00시 되면 자동 리로드하여 데이터 갱신
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);


    // 사용자 데이터 Helper
    const getAnswerData = (uid) => todayAnswers[uid];
    const myAnswerData = getAnswerData(currentUser?.uid);
    const partnerUser = coupleUsers.find(u => u.uid !== currentUser?.uid);
    const partnerAnswerData = partnerUser ? getAnswerData(partnerUser.uid) : null;

    const hasSubmitted = !!myAnswerData;
    const bothAnswered = hasSubmitted && !!partnerAnswerData;
    const isMatch = bothAnswered && myAnswerData.option === partnerAnswerData.option;

    // 코멘트 초기값 세팅
    useEffect(() => {
        if (myAnswerData) {
            // 내가 이미 답변했다면 그 값을 보여줌 (다른거 선택해서 수정하려고 할땐 건드리지 않음)
            // 즉, confirm 창이 열릴때만 값을 업데이트하거나 초기 1회만 해야함.
            // 여기선 편의상 selectedOption이 없을 때만 세팅
            if (!selectedOption) setSelectedOption(myAnswerData.option);
        }
    }, [myAnswerData]); // selectedOption 제외하여 무한루프 방지


    // 핸들러들
    const handleOptionClick = (option) => {
        setSelectedOption(option);
        if (myAnswerData && myAnswerData.option === option) {
            setComment(myAnswerData.comment || '');
        } else {
            setComment(''); // 옵션 바꾸면 코멘트 초기화 (새로운 마음으로)
        }
    };

    const handleConfirmClick = () => {
        if (!selectedOption) return;
        // 기존 코멘트 있으면 가져오기 (같은 옵션일 때만)
        if (myAnswerData && myAnswerData.option === selectedOption) {
            setComment(myAnswerData.comment || '');
        }
        setIsInputOpen(true);
    };

    const handleFinalSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const newAnswers = {
                ...todayAnswers,
                [currentUser.uid]: { option: selectedOption, comment: comment.trim() }
            };

            const alreadyParticipated = !!gameData.todayAnswers?.[currentUser.uid];

            let updates = { balanceGameV2: { ...gameData, todayAnswers: newAnswers } };

            // 첫 참여 시에만 XP/업적
            if (!alreadyParticipated) {
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

            // 둘 다 답변했으면 completedIds에 영구 추가
            // (혹시 오늘 처음 둘 다 완료한거라면)
            if (partnerAnswerData || (partnerUser && partnerUser.uid && newAnswers[partnerUser.uid])) {
                const currentCompleted = gameData.completedIds || [];
                if (!currentCompleted.includes(todayQuestion.id)) {
                    updates.balanceGameV2.completedIds = [...currentCompleted, todayQuestion.id];
                }
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
                            <h3 className="font-bold text-primary text-sm flex items-center gap-2">
                                오늘의 밸런스 게임
                                <span className="text-[10px] font-normal text-gray-500 bg-white/50 px-1.5 py-0.5 rounded-md border border-gray-100 flex items-center gap-1">
                                    <Icon name="clock" size={10} />
                                    {timeLeft}
                                </span>
                            </h3>
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
                                ${hasSubmitted && selectedOption !== option ? 'opacity-60 grayscale-[0.5]' : ''}
                            `}
                        >
                            <span className="text-3xl mb-3 block">{option === 'A' ? '🅰️' : '🅱️'}</span>
                            <p className="text-sm font-bold text-gray-800 leading-tight break-keep shadow-sm">
                                {option === 'A' ? todayQuestion.optionA : todayQuestion.optionB}
                            </p>

                            {/* 상대방 선택 표시 */}
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

                {/* 버튼 영역 */}
                {selectedOption && (
                    <button
                        onClick={handleConfirmClick}
                        className={`w-full mb-3 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 animate-fadeInUp
                            ${hasSubmitted && selectedOption === myAnswerData?.option
                                ? 'bg-white border-2 border-theme-100 text-theme-500' // 수정 버튼 스타일
                                : 'bg-gradient-to-r from-theme-500 to-pink-500 text-white' // 확정/변경 버튼 스타일
                            }
                        `}
                    >
                        {hasSubmitted && selectedOption === myAnswerData?.option ? (
                            <>
                                <Icon name="edit-3" size={16} /> 내용 수정하기
                            </>
                        ) : (
                            <>
                                <span>{hasSubmitted ? '이걸로 변경하기' : '이걸로 확정하기'}</span>
                                <Icon name="arrow-right" size={16} />
                            </>
                        )}
                    </button>
                )}

                {/* 결과 보기 */}
                {bothAnswered ? (
                    <div className="mt-2 space-y-3 animate-fadeIn border-t border-gray-100 pt-4">
                        <div className="bg-white/60 p-3 rounded-xl border border-theme-100">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold bg-theme-100 text-theme-600 px-2 py-0.5 rounded-full">나</span>
                                <p className="text-xs text-gray-500 font-medium">
                                    "{myAnswerData.option === 'A' ? todayQuestion.optionA : todayQuestion.optionB}"
                                </p>
                            </div>
                            <p className="text-sm text-gray-800 pl-1 whitespace-pre-wrap">{myAnswerData.comment || "코멘트 없음"}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-xl border border-pink-100">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">{partnerUser?.name}</span>
                                <p className="text-xs text-gray-500 font-medium">
                                    "{partnerAnswerData.option === 'A' ? todayQuestion.optionA : todayQuestion.optionB}"
                                </p>
                            </div>
                            <p className="text-sm text-gray-800 pl-1 whitespace-pre-wrap">{partnerAnswerData.comment || "코멘트 없음"}</p>
                        </div>
                    </div>
                ) : hasSubmitted && (
                    <div className="text-center p-3 bg-gray-50 rounded-xl mt-3">
                        <p className="text-xs text-gray-500 animate-pulse">상대방의 선택을 기다리는 중...</p>
                        <p className="text-[10px] text-gray-400 mt-1">00시가 지나면 새로운 질문으로 바뀝니다.</p>
                    </div>
                )}
            </div>

            {/* 입력 모달 */}
            {isInputOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsInputOpen(false)} />
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 relative z-10 shadow-2xl animate-scaleIn">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">
                            {hasSubmitted && selectedOption === myAnswerData?.option ? '답변 내용 수정' : '선택한 이유가 뭔가요?'}
                        </h3>
                        <p className="text-xs text-gray-500 text-center mb-6">
                            "{selectedOption === 'A' ? todayQuestion.optionA : todayQuestion.optionB}"<br />
                            선택 이유를 자유롭게 적어주세요!
                        </p>

                        <textarea
                            className="w-full h-24 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-theme-500 focus:ring-1 focus:ring-theme-200 outline-none resize-none text-sm mb-4"
                            placeholder="이유를 입력하세요 (선택)"
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
                                저장완료
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BalanceGameCard;
