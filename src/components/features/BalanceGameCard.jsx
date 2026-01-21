import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { BALANCE_QUESTIONS, getTodayQuestion } from '../../constants/balanceGame';
import { ACHIEVEMENTS } from '../../constants';

const BalanceGameCard = ({ settings, coupleUsers, currentUser, onUpdateSettings, isConnected, onRequireConnection, gameData: serverGameData, onSaveHistory }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isInputOpen, setIsInputOpen] = useState(false);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [localSubmitted, setLocalSubmitted] = useState(false); // 즉시 반영용 로컬 상태

    // 설정이 아직 로드되지 않았으면 렌더링 보류
    if (!settings || !settings.coupleName) return null;

    // KST(한국시간) or Local Time 기준으로 날짜 생성 (UTC 문제 해결)
    const getLocalISODate = () => {
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 10);
    };
    const today = getLocalISODate();
    // gameData가 없으면 빈 객체 ({}) - 서버 데이터를 우선 사용
    const gameData = serverGameData || settings.balanceGameV2 || {};

    // 1. 데이터 상태 진단
    const storedDate = gameData.todayDate;
    const hasQuestion = !!gameData.questionId;

    // 2. 날짜 변경 여부 판단
    // storedDate가 존재하고, 오늘과 다르면 -> 새로운 날 (리셋 필요)
    // storedDate가 없으면 -> 첫 실행 (초기화 필요)
    const isNewDay = storedDate && storedDate !== today;
    const isFirstRun = !storedDate;

    // -------------------------------------------------------------------------
    // 3. 렌더링용 변수 설정 (화면 표시용)
    // -------------------------------------------------------------------------
    // 새 날이면 질문 ID 없음(새로 뽑아야 함), 아니면 기존 것 사용
    let currentQuestionId = (isNewDay || !hasQuestion) ? null : gameData.questionId;

    // 완료 목록: 새 날이어도 기존 기록 유지
    let completedIds = gameData.completedIds || [];

    // 답변: 새 날이면 초기화, 같은 날이면 유지 **(핵심: 실수로 리셋 방지)**
    let todayAnswers = isNewDay ? {} : (gameData.todayAnswers || {});

    // 표시할 질문 선정
    let todayQuestion;
    if (currentQuestionId) {
        // 이미 저장된 질문이 있으면 그거 보여줌
        todayQuestion = BALANCE_QUESTIONS.find(q => q.id === currentQuestionId) || BALANCE_QUESTIONS[0];
    } else {
        // 없거나 새 날이면 알고리즘으로 새로 뽑음 (화면엔 일단 이걸 보여주되, useEffect에서 저장함)
        todayQuestion = getTodayQuestion(completedIds);
    }

    // -------------------------------------------------------------------------
    // 4. 데이터 초기화 및 저장 (useEffect)
    // -------------------------------------------------------------------------
    useEffect(() => {
        // 방어: 설정 로드 전이면 중단
        if (!settings.coupleName) return;

        // 저장 조건:
        // 1) 날짜가 바뀌었을 때
        // 2) 처음 실행일 때 (날짜 기록 없음)
        // 3) 질문 ID가 데이터에 없을 때 (마이그레이션 등)
        const needsInit = isNewDay || isFirstRun || !hasQuestion;

        if (needsInit) {
            console.log(`🔄 [BalanceGame] 초기화 실행 (조건: NewDay=${isNewDay}, First=${isFirstRun}, NoQ=${!hasQuestion})`);

            // 저장할 데이터 구성
            const initGameData = {
                ...gameData,
                todayDate: today,
                // 중요: 새 날일 때만 답변 초기화, 아니면(ex:질문ID만 복구) 기존 답변 유지
                todayAnswers: isNewDay ? {} : (gameData.todayAnswers || {}),
                questionId: todayQuestion.id,
                completedIds: completedIds
            };

            // 변경 사항이 있을 때만 updateSettings 호출 (무한루프 방지)
            const isDifferent =
                JSON.stringify(initGameData.todayAnswers) !== JSON.stringify(gameData.todayAnswers) ||
                initGameData.todayDate !== gameData.todayDate ||
                initGameData.questionId !== gameData.questionId;

            if (isDifferent) {
                console.log("💾 [BalanceGame] DB 업데이트 요청");
                onUpdateSettings({ balanceGameV2: initGameData });
            }
        }
    }, [isNewDay, isFirstRun, hasQuestion, today, todayQuestion.id, settings.coupleName]); // settings 전체 의존성 제거

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

        // 커플 연결 체크
        if (isConnected === false && onRequireConnection) {
            alert("⚠️ 커플 연결이 필요합니다!\n상대방과 연결 후 즐겨보세요.");
            onRequireConnection();
            return;
        }

        // 기존 코멘트 있으면 가져오기 (같은 옵션일 때만)
        if (myAnswerData && myAnswerData.option === selectedOption) {
            setComment(myAnswerData.comment || '');
        }
        setIsInputOpen(true);
    };

    const handleFinalSubmit = async () => {
        if (isSubmitting) return;

        // 기존 답변 확인
        const dbAnswer = gameData.todayAnswers?.[currentUser.uid];
        const isEditMode = !!dbAnswer || localSubmitted;

        setIsSubmitting(true);

        try {
            // 새 코멘트 포함한 답변 객체
            const newAnswers = {
                ...todayAnswers,
                [currentUser.uid]: {
                    option: selectedOption,
                    comment: comment.trim()
                }
            };

            let updates = { balanceGameV2: { ...gameData, todayAnswers: newAnswers } };
            let alertMessage = isEditMode ? "✅ 답변이 수정되었습니다!" : "✅ 답변이 저장되었습니다! (+10 XP)";

            // 첫 참여 시에만 XP/업적 지급
            if (!isEditMode) {
                const currentStats = settings.gameStats || { balanceCount: 0 };
                const newCount = (currentStats.balanceCount || 0) + 1;
                const newStats = { ...currentStats, balanceCount: newCount };

                const currentGrowth = settings.growth || { level: 1, exp: 0, achievements: [] };
                let newExp = (currentGrowth.exp || 0) + 10;
                let newAchievements = [...(currentGrowth.achievements || [])];

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
            }

            // 둘 다 답변했으면 completedIds에 영구 추가 + 히스토리 저장
            const partnerUid = partnerUser?.uid;
            const partnerHasAnswer = partnerUid && (newAnswers[partnerUid] || partnerAnswerData);
            const isFirstBothComplete = partnerHasAnswer && !(gameData.completedIds || []).includes(todayQuestion.id);

            if (partnerHasAnswer) {
                const currentCompleted = gameData.completedIds || [];
                if (!currentCompleted.includes(todayQuestion.id)) {
                    updates.balanceGameV2.completedIds = [...currentCompleted, todayQuestion.id];
                }
            }

            await onUpdateSettings(updates);
            setLocalSubmitted(true);

            // 둘 다 처음 완료했을 때 히스토리에 저장
            if (isFirstBothComplete && onSaveHistory) {
                const myAnswer = newAnswers[currentUser.uid];
                const partnerAnswer = newAnswers[partnerUid] || partnerAnswerData;
                const myName = coupleUsers.find(u => u.uid === currentUser.uid)?.name || '나';
                const partnerName = partnerUser?.name || '상대방';

                await onSaveHistory({
                    questionId: todayQuestion.id,
                    question: todayQuestion.category,
                    optionA: todayQuestion.optionA,
                    optionB: todayQuestion.optionB,
                    date: today,
                    answers: {
                        [currentUser.uid]: { ...myAnswer, name: myName },
                        [partnerUid]: { ...partnerAnswer, name: partnerName }
                    },
                    isMatch: myAnswer.option === partnerAnswer.option
                });
            }

            // UI 피드백
            // alert(alertMessage); // 너무 잦은 alert 방지, 필요하면 toast로 대체하거나 생략
            if (!isEditMode) alert(alertMessage); // 첫 저장시에만 축하

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
                {(selectedOption) && (
                    <button
                        onClick={handleConfirmClick}
                        disabled={false} // 항상 열어둠 (수정 가능하게)
                        className={`w-full mb-3 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 animate-fadeInUp
                            ${hasSubmitted || localSubmitted
                                ? 'bg-white text-theme-500 border-2 border-theme-100 hover:bg-theme-50'
                                : 'bg-gradient-to-r from-theme-500 to-pink-500 text-white hover:opacity-90 active:scale-95'
                            }
                        `}
                    >
                        {hasSubmitted || localSubmitted ? (
                            <>
                                <Icon name="check-circle" size={16} /> 답변 완료 (수정하기)
                            </>
                        ) : (
                            <>
                                <span>이걸로 확정하기</span>
                                <Icon name="arrow-right" size={16} />
                            </>
                        )}
                    </button>
                )}

                {/* 결과 보기 (내가 답변했으면 내껀 무조건 보임) */}
                {hasSubmitted && (
                    <div className="mt-2 space-y-3 animate-fadeIn border-t border-gray-100 pt-4">
                        {/* 내 답변 */}
                        <div className="bg-white/60 p-3 rounded-xl border border-theme-100 relative group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-theme-100 text-theme-600 px-2 py-0.5 rounded-full">나</span>
                                    <p className="text-xs text-gray-500 font-medium">
                                        "{myAnswerData.option === 'A' ? todayQuestion.optionA : todayQuestion.optionB}"
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {/* 다시 고르기 버튼 */}
                                    <button
                                        onClick={() => {
                                            setSelectedOption(null);
                                            setLocalSubmitted(false);
                                        }}
                                        className="p-1.5 hover:bg-orange-50 rounded-lg text-orange-400 hover:text-orange-500 transition-colors flex items-center gap-1"
                                        title="다시 고르기"
                                    >
                                        <Icon name="rotate-ccw" size={12} />
                                        <span className="text-[10px] font-medium">다시 고르기</span>
                                    </button>
                                    {/* 코멘트 수정 버튼 */}
                                    <button
                                        onClick={() => {
                                            setComment(myAnswerData.comment || '');
                                            setIsInputOpen(true);
                                        }}
                                        className="p-1 hover:bg-theme-50 rounded-lg text-gray-400 hover:text-theme-500 transition-colors"
                                        title="코멘트 수정"
                                    >
                                        <Icon name="pencil" size={12} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-800 pl-1 whitespace-pre-wrap">{myAnswerData.comment || "코멘트 없음"}</p>
                        </div>

                        {/* 상대방 답변 or 대기중 */}
                        {bothAnswered ? (
                            <div className="bg-white/60 p-3 rounded-xl border border-pink-100 animate-slideInUp">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">{partnerUser?.name}</span>
                                    <p className="text-xs text-gray-500 font-medium">
                                        "{partnerAnswerData.option === 'A' ? todayQuestion.optionA : todayQuestion.optionB}"
                                    </p>
                                </div>
                                <p className="text-sm text-gray-800 pl-1 whitespace-pre-wrap">{partnerAnswerData.comment || "코멘트 없음"}</p>
                            </div>
                        ) : (
                            <div className="text-center p-3 bg-gray-50 rounded-xl mt-3 flex flex-col items-center gap-2">
                                <div className="animate-spin text-xl">⏳</div>
                                <p className="text-xs text-gray-500">상대방의 선택을 기다리는 중...</p>
                                <p className="text-[10px] text-gray-400">00시가 지나면 새로운 질문으로 바뀝니다.</p>
                            </div>
                        )}
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
