import React, { useState } from 'react';
import Icon from '../ui/Icon';
import { ACHIEVEMENTS, LEVELS } from '../../constants';

const AchievementModal = ({ onClose, growth }) => {
    const [activeTab, setActiveTab] = useState('achievements'); // 'achievements' or 'rewards'

    const currentLevel = growth?.level || 1;
    const currentExp = growth?.exp || 0;
    const completedAchievements = growth?.achievements || [];

    // Calculate progress for an achievement
    const getProgress = (achieve) => {
        if (completedAchievements.includes(achieve.id)) return 100;

        let current = 0;
        if (achieve.type === 'visit') current = growth?.totalVisits || 0;
        else if (achieve.type === 'post') current = 0; // We don't track exact post count in growth obj yet, assume completed if in ID list

        // If post count is not tracked in growth object, we can't show partial progress accurately without passing posts prop.
        // For now, simpler logic: if completed 100%, else 0% (or we need to update growth to track post count)
        // Let's assume we want to show completed vs locked state primarily.

        return Math.min(100, (current / achieve.target) * 100);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative card-bg rounded-2xl shadow-2xl w-full max-w-md h-[70vh] flex flex-col overflow-hidden border border-theme-100" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="p-4 border-b border-theme-100 flex justify-between items-center bg-white/50 backdrop-blur-md">
                    <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                        <Icon name="trophy" size={20} className="text-yellow-500" />
                        우리의 업적 & 보상
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-theme-50 rounded-full transition-colors">
                        <Icon name="x" size={20} className="text-secondary" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-2 bg-theme-50/50">
                    <button
                        onClick={() => setActiveTab('achievements')}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'achievements' ? 'bg-white text-theme-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        🏆 업적 현황
                    </button>
                    <button
                        onClick={() => setActiveTab('rewards')}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'rewards' ? 'bg-white text-theme-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        🎁 레벨 보상
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeTab === 'achievements' ? (
                        <div className="space-y-3">
                            {ACHIEVEMENTS.map(achieve => {
                                const isCompleted = completedAchievements.includes(achieve.id);
                                return (
                                    <div key={achieve.id} className={`p-4 rounded-2xl border transition-all ${isCompleted ? 'bg-gradient-to-br from-yellow-50 to-white border-yellow-200' : 'bg-gray-50 border-gray-100 opacity-70'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm ${isCompleted ? 'bg-yellow-100' : 'bg-gray-200 grayscale'}`}>
                                                    {isCompleted ? '🏆' : '🔒'}
                                                </div>
                                                <div>
                                                    <h4 className={`font-bold text-sm ${isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>{achieve.title}</h4>
                                                    <p className="text-xs text-secondary">{achieve.description}</p>
                                                </div>
                                            </div>
                                            {isCompleted && <span className="text-[10px] font-bold bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">완료</span>}
                                        </div>

                                        {/* Reward Badge */}
                                        <div className="flex items-center gap-1 mt-2">
                                            <span className="text-[10px] font-bold text-theme-500 bg-theme-50 px-2 py-0.5 rounded-md">
                                                +{achieve.reward} XP
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Current Level Status */}
                            <div className="text-center py-6">
                                <div className="w-20 h-20 mx-auto rounded-full bg-theme-50 flex items-center justify-center text-4xl mb-3 shadow-inner">
                                    {LEVELS.find(l => l.level === currentLevel)?.icon}
                                </div>
                                <h3 className="text-xl font-black text-theme-600">Lv.{currentLevel} {LEVELS.find(l => l.level === currentLevel)?.label}</h3>
                                <p className="text-sm text-secondary mt-1">현재 경험치: {currentExp} XP</p>
                            </div>

                            {/* Level List */}
                            <div className="space-y-4 relative">
                                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-100" />
                                {LEVELS.map((lvl, idx) => {
                                    const isReached = currentLevel >= lvl.level;
                                    const isNext = currentLevel + 1 === lvl.level;

                                    return (
                                        <div key={lvl.level} className={`relative pl-14 py-2 ${isReached ? 'opacity-100' : 'opacity-50'}`}>
                                            {/* Node */}
                                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 z-10 ${isReached ? 'bg-theme-500 border-white shadow-md' : 'bg-gray-200 border-white'}`} />

                                            <div className={`p-4 rounded-xl border ${isNext ? 'bg-theme-50 border-theme-300 ring-2 ring-theme-100' : 'bg-white border-gray-100'}`}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-primary flex items-center gap-2">
                                                        Lv.{lvl.level} {lvl.label} <span className="text-lg">{lvl.icon}</span>
                                                    </span>
                                                    <span className="text-xs text-gray-400">{lvl.minExp} XP</span>
                                                </div>
                                                <p className="text-xs text-secondary mb-2">{lvl.desc}</p>

                                                {lvl.reward && (
                                                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold shadow-sm">
                                                        <Icon name="gift" size={12} />
                                                        {lvl.reward}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AchievementModal;
