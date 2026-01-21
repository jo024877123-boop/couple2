import React, { useEffect, useState, useMemo } from 'react';
import Icon from '../ui/Icon';

const EndingCredits = ({ onClose, coupleUsers, settings, posts }) => {
    const [showMessage, setShowMessage] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const myName = coupleUsers[0]?.name || '나';
    const partnerName = coupleUsers[1]?.name || '상대방';
    const totalDays = settings.growth?.totalVisits || 0;
    const totalPosts = posts.length || 0;
    const startDate = settings.anniversaryDate;

    // 모든 이미지 추출 (최신순)
    const allImages = useMemo(() => {
        return posts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .flatMap(post => post.media || [])
            .filter(media => media.type === 'image')
            .map(media => media.url);
    }, [posts]);

    // 이미지 슬라이드쇼 타이머
    useEffect(() => {
        if (allImages.length === 0) return;
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % allImages.length);
        }, 3000); // 3초마다 변경
        return () => clearInterval(interval);
    }, [allImages]);

    // 25초 뒤에 마지막 메시지 표시 (크레딧 길이에 따라 조절)
    useEffect(() => {
        const timer = setTimeout(() => setShowMessage(true), 25000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white overflow-hidden flex flex-col items-center justify-center">

            {/* 닫기 버튼 */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-50 p-2 text-white/50 hover:text-white transition-colors bg-black/20 rounded-full"
            >
                <Icon name="x" size={24} />
            </button>

            {/* 배경 사진 슬라이드쇼 */}
            <div className="absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out opacity-40">
                {allImages.length > 0 ? (
                    allImages.map((img, idx) => (
                        <div
                            key={idx}
                            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${idx === currentImageIndex ? 'opacity-100 scale-105' : 'opacity-0'}`}
                            style={{ backgroundImage: `url(${img})` }}
                        />
                    ))
                ) : (
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1600')] bg-cover opacity-30 animate-pulse-slow"></div>
                )}
                <div className="absolute inset-0 bg-black/60" /> {/* 어둡게 처리 */}
            </div>

            {/* 크레딧 애니메이션 */}
            {!showMessage ? (
                <div className="animate-credits text-center space-y-32 w-full max-w-md px-6 relative z-10 py-20">
                    {/* Intro */}
                    <div className="h-[60vh] flex flex-col items-center justify-center">
                        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300 mb-4 animate-bounce-slow">
                            사랑의 결실
                        </h1>
                        <p className="text-gray-400 text-sm">Created by {myName} & {partnerName}</p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-gray-400 text-xs tracking-widest uppercase mb-2">Cast</p>
                        <h2 className="text-3xl font-bold">{myName}</h2>
                        <h2 className="text-3xl font-bold text-pink-300">&</h2>
                        <h2 className="text-3xl font-bold">{partnerName}</h2>
                    </div>

                    <div className="space-y-4">
                        <p className="text-gray-400 text-xs tracking-widest uppercase mb-2">총 함께한 시간</p>
                        <h2 className="text-4xl font-bold text-yellow-300">{totalDays}일</h2>
                    </div>

                    <div className="space-y-4">
                        <p className="text-gray-400 text-xs tracking-widest uppercase mb-2">함께 기록한 추억</p>
                        <h2 className="text-4xl font-bold text-blue-300">{totalPosts}개의 이야기</h2>
                        <p className="text-xs text-gray-500">{allImages.length}장의 사진</p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-gray-400 text-xs tracking-widest uppercase mb-2">우리의 시작</p>
                        <h2 className="text-2xl font-bold">{startDate}</h2>
                    </div>

                    <div className="h-[40vh]"></div>
                </div>
            ) : (
                /* 최종 메시지 */
                <div className="animate-fadeIn scale-110 text-center z-20 px-6">
                    <div className="mb-8 relative">
                        <Icon name="heart" size={80} className="text-pink-500 mx-auto animate-pulse" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-pink-500 blur-2xl opacity-50 animate-pulse" />
                    </div>

                    <h2 className="text-4xl font-bold mb-6 leading-tight">우리의 이야기는<br /><span className="text-pink-300">계속됩니다</span></h2>

                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 mb-8 max-w-xs mx-auto">
                        <p className="text-gray-200 leading-relaxed font-medium">
                            Lv.7 달성을 축하합니다!<br /><br />
                            이제 이 곳은<br />
                            우리의 영원한 추억 저장소입니다.<br />
                            앞으로도 함께 채워나가요.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center gap-2 mx-auto"
                    >
                        <Icon name="edit-3" size={16} />
                        계속 기록하기
                    </button>
                </div>
            )}

            <style jsx>{`
        @keyframes credits {
          0% { transform: translateY(60vh); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-150%); opacity: 0; }
        }
        .animate-credits {
          animation: credits 25s linear forwards;
        }
      `}</style>
        </div>
    );
};

export default EndingCredits;
