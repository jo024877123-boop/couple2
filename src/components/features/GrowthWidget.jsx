import React, { useEffect, useState } from 'react';
import Icon from '../ui/Icon';
import { LEVELS } from '../../constants';

const GrowthWidget = ({ growth, onLevelUp, onClick, onCheckIn }) => {
    const defaultGrowth = { level: 1, exp: 0 };
    const currentGrowth = growth || defaultGrowth;
    const today = new Date().toISOString().slice(0, 10);
    const isCheckedToday = currentGrowth.lastVisit === today;

    // 현재 레벨 정보 찾기
    const levelInfo = LEVELS.find(l => l.level === currentGrowth.level) || LEVELS[0];

    // 다음 레벨 정보 (마지막 레벨이면 현재 레벨 유지)
    const nextLevel = LEVELS.find(l => l.level === currentGrowth.level + 1);

    // 경험치 퍼센트 계산
    const expInRange = currentGrowth.exp - levelInfo.minExp;
    const expNeeded = levelInfo.next - levelInfo.minExp;
    const progress = nextLevel ? Math.min(100, Math.max(0, (expInRange / expNeeded) * 100)) : 100;

    // 레벨업 체크
    useEffect(() => {
        if (nextLevel && currentGrowth.exp >= levelInfo.next) {
            onLevelUp && onLevelUp(nextLevel);
        }
    }, [currentGrowth.exp, levelInfo.next, nextLevel, onLevelUp]);

    return (
        <div
            onClick={onClick}
            className="card-bg rounded-2xl p-5 border border-theme-100 mb-6 bg-gradient-to-br from-white to-green-50 shadow-sm relative overflow-hidden group cursor-pointer active:scale-98 transition-transform"
        >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon name="sprout" size={60} className="text-green-500" />
                <div className="absolute top-4 right-4 bg-red-500 rounded-full w-2 h-2 animate-ping" />
            </div>

            <div className="flex items-center gap-4 relative z-10">
                {/* 나무 아이콘 */}
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-4xl border-4 border-green-100 shrink-0 transform group-hover:scale-110 transition-transform duration-500" title={levelInfo.desc}>
                    {levelInfo.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-end mb-1">
                        <div>
                            <h3 className="font-bold text-primary flex items-center gap-1">
                                Lv.{levelInfo.level} {levelInfo.label}
                                <Icon name="chevron-right" size={14} className="text-gray-400" />
                            </h3>
                            <p className="text-xs text-secondary truncate">{levelInfo.desc}</p>
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-theme-600 text-sm">{Math.floor(currentGrowth.exp)}</span>
                            {nextLevel && <span className="text-xs text-gray-400">/{levelInfo.next} XP</span>}
                        </div>
                    </div>

                    {/* 경험치 바 */}
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                        <div
                            className="h-full bg-gradient-to-r from-green-300 to-green-500 rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 w-full animate-[shimmer_2s_infinite]" />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isCheckedToday && onCheckIn) onCheckIn();
                            }}
                            disabled={isCheckedToday}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${isCheckedToday
                                    ? 'bg-gray-100 text-gray-400 cursor-default'
                                    : 'gradient-theme text-white shadow-md btn-bounce hover:opacity-90'
                                }`}
                        >
                            <Icon name={isCheckedToday ? "check" : "calendar"} size={12} />
                            {isCheckedToday ? "오늘 출석 완료" : "출석체크 +10 XP"}
                        </button>

                        {nextLevel ? (
                            <p className="text-[10px] text-gray-400">
                                다음 단계까지 <span className="text-theme-500 font-bold">{levelInfo.next - Math.floor(currentGrowth.exp)}</span> XP
                            </p>
                        ) : (
                            <p className="text-[10px] text-theme-500 font-bold">최고 레벨 도달! 🎉</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrowthWidget;
