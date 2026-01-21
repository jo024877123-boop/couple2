import React from 'react';
import Icon from '../ui/Icon';

const ConnectWidget = ({ onClick }) => {
    return (
        <div
            onClick={onClick}
            className="mx-4 mt-4 p-4 bg-gradient-to-r from-theme-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-between text-white cursor-pointer hover:scale-[1.02] transition-transform animate-pulse"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                    <Icon name="link" size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg">커플 연결이 필요해요!</h3>
                    <p className="text-white/80 text-sm">여기를 눌러 연인과 연결하고 시작하세요.</p>
                </div>
            </div>
            <div className="bg-white text-theme-600 px-4 py-2 rounded-xl font-extrabold text-sm shadow-sm whitespace-nowrap">
                연결하기
            </div>
        </div>
    );
};

export default ConnectWidget;
