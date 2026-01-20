import React, { useEffect, useState } from 'react';
import Icon from '../ui/Icon';

const LEVELS = [
    { level: 1, minExp: 0, next: 100, icon: '🌱', label: '사랑의 씨앗', desc: '작은 씨앗을 심었어요' },
    { level: 2, minExp: 100, next: 300, icon: '🌿', label: '반짝이는 새싹', desc: '사랑이 싹트고 있어요' },
    { level: 3, minExp: 300, next: 600, icon: '🎋', label: '자라나는 줄기', desc: '쑥쑥 자라고 있네요' },
    { level: 4, minExp: 600, next: 1000, icon: '🌳', label: '튼튼한 나무', desc: '비바람에도 끄떡없어요' },
    { level: 5, minExp: 1000, next: 1500, icon: '✨', label: '풍성한 나무', desc: '그늘이 되어줄게요' },
    { level: 6, minExp: 1500, next: 2100, icon: '🌸', label: '꽃 피운 나무', desc: '향기로운 추억이 가득' },
    { level: 7, minExp: 2100, next: Infinity, icon: '🍎', label: '사랑의 결실', desc: '영원한 사랑을 맹세해요' },
];

const GrowthWidget = ({ growth, onLevelUp }) => {
    const defaultGrowth = { level: 1, exp: 0 };
    const currentGrowth = growth || defaultGrowth;

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
        <div className="card-bg rounded-2xl p-5 border border-theme-100 mb-6 bg-gradient-to-br from-white to-green-50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon name="sprout" size={60} className="text-green-500" />
            </div>

            <div className="flex items-center gap-4 relative z-10">
                {/* 나무 아이콘 */}
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-4xl border-4 border-green-100 shrink-0 transform group-hover:scale-110 transition-transform duration-500 cursor-pointer" title={levelInfo.desc}>
                    {levelInfo.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-end mb-1">
                        <div>
                            <h3 className="font-bold text-primary flex items-center gap-1">
                                Lv.{levelInfo.level} {levelInfo.label}
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

                    {/* 다음 레벨까지 */}
                    {nextLevel ? (
                        <p className="text-[10px] text-gray-400 mt-1 text-right">
                            다음 단계까지 {levelInfo.next - Math.floor(currentGrowth.exp)} XP 남음
                        </p>
                    ) : (
                        <p className="text-[10px] text-theme-500 mt-1 text-right font-bold">최고 레벨 도달! 🎉</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GrowthWidget;
