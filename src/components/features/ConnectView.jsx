import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Icon from '../ui/Icon';

const ConnectView = () => {
    const { currentUser, userData, coupleData, createMyCoupleSpace, connectWithCode, logout } = useAuth();
    const [mode, setMode] = useState('select'); // 'select', 'create', 'enter'
    const [inputCode, setInputCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 이미 생성된 코드가 있다면 'create' 모드로 보여주기
    // coupleData가 있는데 user2가 비어있으면 -> 대기 중인 상태
    const myCode = coupleData?.inviteCode;
    const isWaiting = coupleData && !coupleData.user2;

    const handleCreateCode = async () => {
        setLoading(true);
        try {
            await createMyCoupleSpace();
            setMode('create');
        } catch (err) {
            console.error(err);
            alert("코드 생성 실패: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await connectWithCode(inputCode);
            // 성공하면 AuthContext 상태가 변하면서 자동으로 Main으로 이동됨
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(myCode);
        alert("코드가 복사되었습니다! 연인에게 전송하세요 💌");
    };

    if (isWaiting || mode === 'create') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
                <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl text-center animate-scaleIn">
                    <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Icon name="heart" size={40} className="text-pink-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">연결 대기 중...</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        상대방이 코드를 입력하면<br />
                        자동으로 연결됩니다!
                    </p>

                    <div className="bg-gray-50 p-6 rounded-2xl mb-6 relative group cursor-pointer hover:bg-gray-100 transition-colors" onClick={copyCode}>
                        <p className="text-xs text-gray-400 mb-1 uppercase font-bold tracking-wider">나의 초대 코드</p>
                        <p className="text-4xl font-black text-theme-600 tracking-widest">{myCode || coupleData?.inviteCode}</p>
                        <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icon name="copy" size={20} className="text-gray-400" />
                        </div>
                    </div>

                    <button
                        onClick={copyCode}
                        className="w-full py-4 rounded-xl gradient-theme text-white font-bold shadow-theme btn-bounce mb-4"
                    >
                        코드 복사하기
                    </button>

                    <button
                        onClick={logout}
                        className="text-gray-400 text-sm hover:underline"
                    >
                        로그아웃 / 처음으로
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'enter') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
                <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl animate-scaleIn">
                    <button onClick={() => setMode('select')} className="mb-6 text-gray-400 hover:text-gray-600">
                        <Icon name="arrow-left" size={24} />
                    </button>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">코드 입력</h2>
                    <p className="text-gray-500 mb-8 text-center">연인에게 받은 코드를 입력해주세요.</p>

                    <form onSubmit={handleConnect} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                                placeholder="6자리 숫자 코드"
                                className="w-full text-center text-3xl font-bold tracking-widest py-4 border-b-2 border-gray-200 focus:border-theme-500 outline-none bg-transparent placeholder:text-gray-200 placeholder:text-2xl placeholder:font-normal placeholder:tracking-normal"
                                maxLength={6}
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-500 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 animate-shake">
                                <Icon name="alert-circle" size={16} /> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || inputCode.length !== 6}
                            className="w-full py-4 rounded-xl gradient-theme text-white font-bold shadow-theme btn-bounce disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '연결 중...' : '연결하기 💕'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Default: Select Mode
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl text-center animate-scaleIn">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">커플 연결 🔗</h1>
                    <p className="text-gray-500">
                        아직 연결된 연인이 없어요.<br />
                        어떻게 연결할까요?
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleCreateCode}
                        disabled={loading}
                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        <div className="bg-white/20 p-2 rounded-full">
                            <Icon name="plus" size={20} />
                        </div>
                        초대 코드 만들기
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-100"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-300 text-xs font-bold uppercase">OR</span>
                        <div className="flex-grow border-t border-gray-100"></div>
                    </div>

                    <button
                        onClick={() => setMode('enter')}
                        className="w-full py-5 rounded-2xl bg-white border-2 border-theme-100 text-theme-600 font-bold text-lg hover:bg-theme-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        <div className="bg-theme-100 p-2 rounded-full">
                            <Icon name="key" size={20} />
                        </div>
                        초대 코드 입력하기
                    </button>

                    <button onClick={logout} className="mt-8 text-gray-400 text-sm hover:underline">
                        로그아웃
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConnectView;
