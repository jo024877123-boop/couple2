import React from 'react';
import Icon from '../ui/Icon';

const BalanceHistoryView = ({ history = [], coupleUsers = [], onClose }) => {
    if (!history || history.length === 0) {
        return (
            <div className="text-center p-8">
                <span className="text-6xl mb-4 block">📋</span>
                <h3 className="text-xl font-bold text-primary mb-2">아직 기록이 없어요</h3>
                <p className="text-secondary text-sm">
                    둘 다 밸런스 게임에 참여하면<br />
                    여기에 기록이 남아요!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* 헤더 */}
            <div className="text-center mb-6">
                <span className="text-4xl mb-2 block">📚</span>
                <h2 className="font-black text-2xl text-primary">밸런스 게임 기록</h2>
                <p className="text-secondary text-sm mt-1">우리의 선택들을 돌아보세요</p>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="card-bg rounded-xl p-3 text-center border border-theme-100">
                    <p className="text-2xl font-black text-theme-500">{history.length}</p>
                    <p className="text-xs text-secondary">총 게임</p>
                </div>
                <div className="card-bg rounded-xl p-3 text-center border border-pink-100">
                    <p className="text-2xl font-black text-pink-500">
                        {history.filter(h => h.isMatch).length}
                    </p>
                    <p className="text-xs text-secondary">💖 천생연분</p>
                </div>
                <div className="card-bg rounded-xl p-3 text-center border border-gray-100">
                    <p className="text-2xl font-black text-gray-500">
                        {history.filter(h => !h.isMatch).length}
                    </p>
                    <p className="text-xs text-secondary">😂 취향차이</p>
                </div>
            </div>

            {/* 기록 목록 */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {history.map((record, idx) => {
                    const answerEntries = Object.entries(record.answers || {});

                    return (
                        <div
                            key={record.id || idx}
                            className={`card-bg rounded-2xl p-4 border ${record.isMatch ? 'border-pink-200 bg-pink-50/30' : 'border-gray-200'}`}
                        >
                            {/* 날짜 및 매치 여부 */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-xs text-secondary">
                                    <Icon name="calendar" size={12} />
                                    <span>{record.date || '날짜 없음'}</span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-gray-400">#{record.questionId}</span>
                                </div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${record.isMatch ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {record.isMatch ? '💖 천생연분' : '😂 취향차이'}
                                </span>
                            </div>

                            {/* 질문 */}
                            <p className="text-sm font-bold text-gray-700 mb-3 bg-gray-50 p-2 rounded-lg">
                                ⚖️ {record.question || '밸런스 게임'}
                            </p>

                            {/* 선택지 */}
                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                                    <span className="font-bold text-purple-600">🅰️</span> {record.optionA}
                                </div>
                                <div className="p-2 bg-pink-50 rounded-lg border border-pink-100">
                                    <span className="font-bold text-pink-600">🅱️</span> {record.optionB}
                                </div>
                            </div>

                            {/* 각자의 선택 */}
                            <div className="space-y-2">
                                {answerEntries.map(([uid, answer]) => (
                                    <div key={uid} className="flex items-start gap-2 p-2 bg-white/60 rounded-xl border border-gray-100">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${answer.option === 'A' ? 'bg-purple-100 text-purple-600' : 'bg-pink-100 text-pink-600'}`}>
                                            {answer.name || '익명'}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-600 font-medium">
                                                {answer.option === 'A' ? record.optionA : record.optionB}
                                            </p>
                                            {answer.comment && (
                                                <p className="text-xs text-gray-500 mt-1 italic">
                                                    "{answer.comment}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BalanceHistoryView;
