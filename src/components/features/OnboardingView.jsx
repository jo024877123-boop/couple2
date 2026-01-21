import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Icon from '../ui/Icon';

const OnboardingView = ({ userData, coupleId, userId, onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        coupleName: '우리',
        myName: userData?.name || '',
        anniversaryDate: new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);

    // 기능 소개 슬라이드용 상태
    const [introStep, setIntroStep] = useState(0);
    const introFeatures = [
        {
            icon: 'heart', color: 'text-pink-500', bg: 'bg-pink-100',
            title: '우리의 소중한 기록',
            desc: '사진, 동영상, 그리고 그 날의 감정까지.\n소중한 순간들을 타임라인에 차곡차곡 쌓아보세요.'
        },
        {
            icon: 'scale', color: 'text-purple-500', bg: 'bg-purple-100',
            title: '매일매일 밸런스 게임',
            desc: '매일 새로운 질문이 도착해요!\n서로의 선택을 맞추고, 몰랐던 취향을 발견해보세요.'
        },
        {
            icon: 'sprout', color: 'text-green-500', bg: 'bg-green-100',
            title: '사랑의 나무 키우기',
            desc: '추억을 기록하고 게임에 참여하면 경험치가 쌓여요.\n함께 사랑의 나무를 무성하게 키워보세요!'
        },
        {
            icon: 'calendar', color: 'text-blue-500', bg: 'bg-blue-100',
            title: '설레는 기념일 관리',
            desc: '우리가 처음 만난 날부터 100일, 1년...\n다가오는 기념일을 잊지 않게 챙겨드릴게요.'
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Update couple settings
            await updateDoc(doc(db, 'couples', coupleId), {
                coupleName: formData.coupleName,
                anniversaryDate: formData.anniversaryDate,
            });

            // Mark onboarding as completed
            await updateDoc(doc(db, 'users', userId), {
                onboardingCompleted: true,
                name: formData.myName,
            });

            onComplete();
        } catch (err) {
            console.error('Onboarding error:', err);
            alert('설정 저장 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 animate-scaleIn relative">

                {/* Progress Indicators (dots) */}
                <div className="absolute top-8 left-0 right-0 flex justify-center gap-2">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`w-2 h-2 rounded-full transition-all duration-300 ${step === s ? 'w-6 bg-theme-500' : 'bg-gray-200'}`} />
                    ))}
                </div>

                <div className="mt-8">
                    {/* Step 1: Welcome */}
                    {step === 1 && (
                        <div className="text-center animate-fadeIn py-8">
                            <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-float">
                                <Icon name="sparkles" size={56} className="text-white" fill="currentColor" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4 leading-tight">
                                환영합니다!<br />
                                <span className="text-theme-500">Our Story</span>입니다.
                            </h2>
                            <p className="text-gray-600 mb-10 leading-relaxed text-lg">
                                두 분만의 특별한 공간을<br />
                                만들어드릴게요.
                            </p>
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="w-full py-4 rounded-xl gradient-theme text-white font-bold text-lg shadow-theme hover:shadow-lg transition-all btn-bounce"
                            >
                                시작하기 ✨
                            </button>
                        </div>
                    )}

                    {/* Step 2: Feature Introduction Carousel */}
                    {step === 2 && (
                        <div className="text-center animate-fadeIn min-h-[400px] flex flex-col justify-between">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">주요 기능 미리보기</h3>

                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className={`w-24 h-24 mb-6 rounded-3xl flex items-center justify-center shadow-md transition-all duration-500 ${introFeatures[introStep].bg}`}>
                                    <Icon name={introFeatures[introStep].icon} size={48} className={`transition-colors duration-500 ${introFeatures[introStep].color}`} />
                                </div>
                                <h4 className="text-2xl font-bold text-gray-800 mb-3 transition-all duration-300 animate-fadeInUp">
                                    {introFeatures[introStep].title}
                                </h4>
                                <p className="text-gray-500 whitespace-pre-line leading-relaxed h-16 transition-all duration-300 animate-fadeInUp">
                                    {introFeatures[introStep].desc}
                                </p>
                            </div>

                            <div className="mt-8 space-y-4">
                                {/* Carousel Dots */}
                                <div className="flex justify-center gap-2 mb-4">
                                    {introFeatures.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setIntroStep(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${introStep === idx ? 'bg-gray-800 scale-125' : 'bg-gray-300'}`}
                                        />
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (introStep < introFeatures.length - 1) {
                                            setIntroStep(prev => prev + 1);
                                        } else {
                                            setStep(3);
                                        }
                                    }}
                                    className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold text-lg shadow-lg hover:bg-gray-800 transition-all"
                                >
                                    {introStep < introFeatures.length - 1 ? '다음' : '설정하러 가기 👉'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Basic Info */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn py-4">
                            <div className="text-center mb-6">
                                <span className="text-4xl mb-2 block">💑</span>
                                <h2 className="text-2xl font-black text-gray-900">기본 정보 설정</h2>
                                <p className="text-gray-600 text-sm mt-1">서로를 부를 애칭을 정해주세요.</p>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">내 이름 (애칭)</label>
                                    <input
                                        type="text"
                                        value={formData.myName}
                                        onChange={(e) => setFormData({ ...formData, myName: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-theme-300 rounded-xl px-4 py-3.5 outline-none transition-all"
                                        placeholder="예: 민수"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">커플 이름</label>
                                    <input
                                        type="text"
                                        value={formData.coupleName}
                                        onChange={(e) => setFormData({ ...formData, coupleName: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-theme-300 rounded-xl px-4 py-3.5 outline-none transition-all"
                                        placeholder="예: 민수 & 지연"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
                                    >
                                        이전
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3.5 rounded-xl gradient-theme text-white font-bold shadow-theme btn-bounce"
                                    >
                                        다음
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 4: Anniversary */}
                    {step === 4 && (
                        <div className="space-y-6 animate-fadeIn py-4">
                            <div className="text-center mb-6">
                                <span className="text-4xl mb-2 block">📅</span>
                                <h2 className="text-2xl font-black text-gray-900">우리 시작일</h2>
                                <p className="text-gray-600 text-sm mt-1">우리가 처음 만난 날은 언제인가요?</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">기념일 선택</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={formData.anniversaryDate}
                                            onChange={(e) => setFormData({ ...formData, anniversaryDate: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-theme-300 rounded-xl px-4 py-4 outline-none transition-all text-center text-lg font-bold text-gray-800"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex gap-3 text-sm text-purple-800 font-medium">
                                    <Icon name="info" className="shrink-0 mt-0.5" />
                                    <span>설정에서 언제든 날짜를 변경할 수 있어요.</span>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
                                    >
                                        이전
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3.5 rounded-xl gradient-theme text-white font-bold shadow-theme btn-bounce disabled:opacity-50"
                                    >
                                        {loading ? '저장 중...' : '완료 및 입장! 🎉'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default OnboardingView;
