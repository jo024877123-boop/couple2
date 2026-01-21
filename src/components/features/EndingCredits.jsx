import React, { useEffect, useState } from 'react';
import Icon from '../ui/Icon';

const EndingCredits = ({ onClose, coupleUsers, settings, posts }) => {
    const [showMessage, setShowMessage] = useState(false);

    const myName = coupleUsers[0]?.name || '나';
    const partnerName = coupleUsers[1]?.name || '상대방';
    const totalDays = settings.growth?.totalVisits || 0;
    const totalPosts = posts.length || 0;
    const startDate = settings.anniversaryDate;

    useEffect(() => {
        // 15초 뒤에 마지막 메시지 표시
        const timer = setTimeout(() => setShowMessage(true), 15000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white overflow-hidden flex flex-col items-center justify-center">

            {/* 닫기 버튼 (언제든 나갈 수 있게) */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-50 p-2 text-white/50 hover:text-white transition-colors"
            >
                <Icon name="x" size={24} />
            </button>

            {/* 배경 별 효과 */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1600')] bg-cover opacity-30 animate-pulse-slow"></div>

            {/* 크레딧 애니메이션 */}
            {!showMessage ? (
                <div className="animate-credits text-center space-y-20 w-full max-w-md px-6 relative z-10">
                    {/* Intro */}
                    <div className="h-screen flex items-center justify-center">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">
                            사랑의 결실
                        </h1>
                    </div>

                    <div className="space-y-4">
                        <p className="text-gray-400 text-sm">Cast</p>
                        <h2 className="text-2xl font-bold">{myName} & {partnerName}</h2>
                    </div>

                    <div className="space-y-4">
                        <p className="text-gray-400 text-sm">함께한 시간</p>
                        <h2 className="text-2xl font-bold">{totalDays}일의 만남</h2>
                    </div>

                    <div className="space-y-4">
                        <p className="text-gray-400 text-sm">기록된 추억</p>
                        <h2 className="text-2xl font-bold">{totalPosts}개의 이야기</h2>
                    </div>

                    <div className="space-y-4">
                        <p className="text-gray-400 text-sm">시작일</p>
                        <h2 className="text-2xl font-bold">{startDate}</h2>
                    </div>

                    <div className="h-40"></div>
                </div>
            ) : (
                /* 최종 메시지 */
                <div className="animate-fadeIn scale-110 text-center z-20 px-6">
                    <Icon name="heart" size={60} className="text-pink-500 mx-auto mb-6 animate-bounce" />
                    <h2 className="text-3xl font-bold mb-4">우리의 이야기는<br />계속됩니다</h2>
                    <p className="text-gray-300 mb-8 max-w-xs mx-auto leading-relaxed">
                        Lv.7 달성을 축하합니다!<br />
                        이제 이 앱은 여러분의 영원한<br />
                        추억 저장소가 되었습니다.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors btn-bounce"
                    >
                        계속 기록하기
                    </button>
                </div>
            )}

            <style jsx>{`
        @keyframes credits {
          0% { transform: translateY(0); }
          100% { transform: translateY(-120%); }
        }
        .animate-credits {
          animation: credits 20s linear forwards;
        }
      `}</style>
        </div>
    );
};

export default EndingCredits;
