import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Icon from '../ui/Icon';

const OnboardingView = ({ userData, coupleId, onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        coupleName: '우리',
        myName: userData?.name || '',
        anniversaryDate: new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);

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
            await updateDoc(doc(db, 'users', userData.uid), {
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
            <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 animate-scaleIn">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`w-1/3 h-2 mx-1 rounded-full transition-all ${step >= s ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                    <p className="text-center text-sm text-gray-500 font-medium">Step {step} / 3</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Step 1: Welcome */}
                    {step === 1 && (
                        <div className="text-center animate-fadeIn">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                <Icon name="heart" size={48} className="text-white" fill="currentColor" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-3">환영합니다! 🎉</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Our Story에 오신 것을 환영합니다.<br />
                                간단한 설정으로 시작해볼까요?
                            </p>
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all btn-bounce"
                            >
                                시작하기 ✨
                            </button>
                        </div>
                    )}

                    {/* Step 2: Basic Info */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-6">
                                <span className="text-4xl mb-2 block">💑</span>
                                <h2 className="text-2xl font-black text-gray-900">기본 정보</h2>
                                <p className="text-gray-600 text-sm mt-1">우리만의 이름을 설정해요</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">내 이름 (닉네임)</label>
                                <input
                                    type="text"
                                    value={formData.myName}
                                    onChange={(e) => setFormData({ ...formData, myName: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-300 rounded-xl px-4 py-3 outline-none transition-all"
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
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-300 rounded-xl px-4 py-3 outline-none transition-all"
                                    placeholder="예: 민수 & 지연"
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
                                >
                                    이전
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-lg btn-bounce"
                                >
                                    다음
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Anniversary */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-6">
                                <span className="text-4xl mb-2 block">📅</span>
                                <h2 className="text-2xl font-black text-gray-900">특별한 날</h2>
                                <p className="text-gray-600 text-sm mt-1">우리가 시작한 날을 기억해요</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">우리의 기념일</label>
                                <input
                                    type="date"
                                    value={formData.anniversaryDate}
                                    onChange={(e) => setFormData({ ...formData, anniversaryDate: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-300 rounded-xl px-4 py-3 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <p className="text-sm text-purple-800 font-medium">💡 나중에 설정에서 언제든 변경할 수 있어요!</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
                                >
                                    이전
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-lg btn-bounce disabled:opacity-50"
                                >
                                    {loading ? '저장 중...' : '완료! 🎉'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default OnboardingView;
