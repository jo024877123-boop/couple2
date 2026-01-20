import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { BALANCE_QUESTIONS, getTodayQuestion } from '../../constants/balanceGame';

const BalanceGameCard = ({ settings, coupleUsers, currentUser, onUpdateSettings }) => {
    const today = new Date().toISOString().slice(0, 10);

    // 게임 데이터 가져오기
    const gameData = settings.balanceGame || { completedIds: [], todayAnswers: {}, todayDate: '' };

    // 오늘 날짜가 변경되면 todayAnswers 초기화
    const isNewDay = gameData.todayDate !== today;
    const completedIds = isNewDay ? gameData.completedIds : gameData.completedIds;
    const todayAnswers = isNewDay ? {} : (gameData.todayAnswers || {});

    // 오늘의 질문 가져오기
    const todayQuestion = getTodayQuestion(completedIds);

    // 내 답변 / 상대방 답변
    const myAnswer = todayAnswers[currentUser?.uid];
    const partnerUser = coupleUsers.find(u => u.uid !== currentUser?.uid);
    const partnerAnswer = partnerUser ? todayAnswers[partnerUser.uid] : null;

    // 둘 다 답변했는지
    const bothAnswered = myAnswer && partnerAnswer;
    const isMatch = bothAnswered && myAnswer === partnerAnswer;

    // 선택하기
    const handleSelect = async (option) => {
        if (myAnswer) return; // 이미 선택함

        const newAnswers = { ...todayAnswers, [currentUser.uid]: option };
        const newGameData = {
            ...gameData,
            todayDate: today,
            todayAnswers: newAnswers,
            // 둘 다 답변하면 completedIds에 추가
            completedIds: (partnerAnswer && partnerAnswer !== undefined)
                ? [...completedIds, todayQuestion.id]
                : completedIds
        };

        await onUpdateSettings({ balanceGame: newGameData });
    };

    // 둘 다 답변 후 completedIds 업데이트
    useEffect(() => {
        if (bothAnswered && !completedIds.includes(todayQuestion.id)) {
            const newGameData = {
                ...gameData,
                completedIds: [...completedIds, todayQuestion.id]
            };
            onUpdateSettings({ balanceGame: newGameData });
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
            <div className="text-center mb-4">
                <p className="font-bold text-lg text-gray-800">둘 중에 하나만 고른다면?</p>
            </div>

            {/* 선택지 */}
            <div className="grid grid-cols-2 gap-3">
                {/* Option A */}
                <button
                    onClick={() => handleSelect('A')}
                    disabled={!!myAnswer}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${myAnswer === 'A'
                            ? 'border-purple-500 bg-purple-100 scale-105'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                        } ${myAnswer && myAnswer !== 'A' ? 'opacity-50' : ''}`}
                >
                    <span className="text-2xl mb-2 block">🅰️</span>
                    <p className="text-sm font-medium text-gray-800 leading-tight">{todayQuestion.optionA}</p>

                    {/* 상대방 선택 표시 */}
                    {bothAnswered && partnerAnswer === 'A' && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">
                            💕
                        </div>
                    )}
                </button>

                {/* Option B */}
                <button
                    onClick={() => handleSelect('B')}
                    disabled={!!myAnswer}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${myAnswer === 'B'
                            ? 'border-pink-500 bg-pink-100 scale-105'
                            : 'border-gray-200 bg-white hover:border-pink-300 hover:bg-pink-50'
                        } ${myAnswer && myAnswer !== 'B' ? 'opacity-50' : ''}`}
                >
                    <span className="text-2xl mb-2 block">🅱️</span>
                    <p className="text-sm font-medium text-gray-800 leading-tight">{todayQuestion.optionB}</p>

                    {/* 상대방 선택 표시 */}
                    {bothAnswered && partnerAnswer === 'B' && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">
                            💕
                        </div>
                    )}
                </button>
            </div>

            {/* 결과 또는 대기 상태 */}
            <div className="mt-4 text-center">
                {!myAnswer && (
                    <p className="text-xs text-gray-400">터치해서 선택하세요!</p>
                )}
                {myAnswer && !bothAnswered && (
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <div className="w-4 h-4 border-2 border-theme-500 border-t-transparent rounded-full animate-spin" />
                        <span>{partnerUser?.name || '상대방'}의 선택을 기다리는 중...</span>
                    </div>
                )}
                {bothAnswered && (
                    <div className="text-xs text-gray-500 mt-2">
                        {isMatch ? (
                            <span className="text-pink-500 font-bold">🎉 둘 다 "{myAnswer === 'A' ? todayQuestion.optionA : todayQuestion.optionB}"를 선택했어요!</span>
                        ) : (
                            <span>
                                나: <span className="font-medium">{myAnswer === 'A' ? todayQuestion.optionA : todayQuestion.optionB}</span>
                                {' '}vs{' '}
                                {partnerUser?.name}: <span className="font-medium">{partnerAnswer === 'A' ? todayQuestion.optionA : todayQuestion.optionB}</span>
                            </span>
                        )}
                    </div>
                )}
            </div>

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
