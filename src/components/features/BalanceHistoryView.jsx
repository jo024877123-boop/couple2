import React, { useMemo } from 'react';
import Icon from '../ui/Icon';
import { useAuth } from '../../context/AuthContext';
import { deleteBalanceHistoryItem } from '../../services/db';

const BalanceHistoryView = ({ history = [], coupleUsers = [], onClose }) => {
    const { userData } = useAuth();

    // 중복 검사 (같은 날짜 + 같은 질문)
    const duplicates = useMemo(() => {
        const lookup = {};
        const dups = [];
        history.forEach(item => {
            // 구버전 데이터 호환을 위해 id check
            const key = `${item.date}_${item.questionId}`;
            if (lookup[key]) {
                dups.push(item);
            } else {
                lookup[key] = item;
            }
        });
        return dups;
    }, [history]);

    const handleCleanupDuplicates = async () => {
        if (!confirm(`중복된 기록 ${duplicates.length}개를 정리하시겠습니까?`)) return;

        try {
            for (const item of duplicates) {
                await deleteBalanceHistoryItem(userData.coupleId, item.id);
            }
            alert('중복 기록이 정리되었습니다. 깔끔해졌네요! ✨');
        } catch (e) {
            console.error(e);
            alert('정리 중 오류가 발생했습니다.');
        }
    };

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
            <div className="text-center mb-6 relative">
                <span className="text-4xl mb-2 block">📚</span>
                <h2 className="font-black text-2xl text-primary">밸런스 게임 기록</h2>
                <p className="text-secondary text-sm mt-1">우리의 선택들을 돌아보세요</p>

                {/* 중복 정리 버튼 (발견될 때만 표시) */}
                {duplicates.length > 0 && (
                    <button
                        onClick={handleCleanupDuplicates}
                        className="absolute right-0 top-0 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-lg border border-orange-200 animate-pulse hover:bg-orange-200"
                    >
                        🧹 중복 정리 ({duplicates.length})
                    </button>
                )}
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
                            <div className="space-y-3">
                                {answerEntries.map(([uid, answer]) => (
                                    <div key={uid} className="flex flex-col gap-1 p-3 bg-white/80 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${answer.option === 'A' ? 'bg-purple-100 text-purple-600' : 'bg-pink-100 text-pink-600'}`}>
                                                {answer.name || '익명'}
                                            </span>
                                            <span className="text-xs font-bold text-gray-700">
                                                {answer.option === 'A' ? '🅰️' : '🅱️'} {answer.option === 'A' ? record.optionA : record.optionB}
                                            </span>
                                        </div>

                                        {/* 코멘트 말풍선 스타일 */}
                                        {answer.comment ? (
                                            <div className="relative mt-1 ml-1 bg-gray-50 p-2 rounded-lg rounded-tl-none border border-gray-100 text-xs text-gray-600 font-medium">
                                                "{answer.comment}"
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-gray-400 pl-1 mt-1">코멘트 없음</p>
                                        )}
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
