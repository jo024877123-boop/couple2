import React, { useState } from 'react';
import Icon from './Icon';

const InstallGuide = ({ onClose, platform = 'ios' }) => {
    // 초기 탭은 사용자의 기기 환경에 따라 자동 선택, PC라면 android 기본
    const [activeTab, setActiveTab] = useState(platform === 'ios' ? 'ios' : 'android');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl animate-scaleIn">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 rounded-full">
                    <Icon name="x" size={20} />
                </button>

                <div className="text-center mb-6 mt-2">
                    <h3 className="text-2xl font-bold text-gray-900">앱 설치 가이드</h3>
                    <p className="text-gray-500 text-sm mt-1 font-medium">기기에 맞는 방법을 선택하세요</p>
                </div>

                {/* Platform Tabs */}
                <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-6">
                    <button
                        onClick={() => setActiveTab('android')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'android' ? 'bg-white shadow-sm text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Icon name="smartphone" size={16} /> Android
                    </button>
                    <button
                        onClick={() => setActiveTab('ios')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'ios' ? 'bg-white shadow-sm text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Icon name="smartphone" size={16} /> iOS (iPhone)
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-50 p-5 rounded-2xl flex items-start gap-4 text-left border border-gray-100">
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${activeTab === 'android' ? 'bg-green-500 text-white shadow-green-200' : 'bg-blue-500 text-white shadow-blue-200'}`}>1</span>
                        <div>
                            <p className="font-bold text-gray-900 text-base">브라우저 메뉴 열기</p>
                            {activeTab === 'ios' ? (
                                <div className="text-gray-500 text-sm mt-1 leading-snug">
                                    사파리(Safari) 하단의 <span className="inline-block px-1.5 py-0.5 bg-gray-200 rounded text-gray-700 font-bold mx-0.5"><Icon name="share" size={12} className="inline" /> 공유</span> 버튼을 눌러주세요.
                                </div>
                            ) : (
                                <div className="text-gray-500 text-sm mt-1 leading-snug">
                                    크롬(Chrome) 상단의 <span className="inline-block px-1.5 py-0.5 bg-gray-200 rounded text-gray-700 font-bold mx-0.5"><Icon name="more-vertical" size={12} className="inline" /> 메뉴</span> 버튼을 눌러주세요.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-2xl flex items-start gap-4 text-left border border-gray-100">
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${activeTab === 'android' ? 'bg-green-500 text-white shadow-green-200' : 'bg-blue-500 text-white shadow-blue-200'}`}>2</span>
                        <div>
                            <p className="font-bold text-gray-900 text-base">홈 화면에 추가</p>
                            {activeTab === 'ios' ? (
                                <p className="text-gray-500 text-sm mt-1 leading-snug">
                                    메뉴 목록에서 <span className="font-bold text-gray-800">"홈 화면에 추가"</span>를 선택하면 설치됩니다.
                                </p>
                            ) : (
                                <p className="text-gray-500 text-sm mt-1 leading-snug">
                                    메뉴에서 <span className="font-bold text-gray-800">"앱 설치"</span> 또는 <span className="font-bold text-gray-800">"홈 화면에 추가"</span>를 선택하세요.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <button onClick={onClose} className={`w-full mt-8 py-4 rounded-xl text-white font-bold shadow-lg btn-bounce ${activeTab === 'android' ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200/50' : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-200/50'}`}>
                    확인했어요
                </button>
            </div>
        </div>
    );
};
export default InstallGuide;
