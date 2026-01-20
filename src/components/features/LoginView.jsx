import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Icon from '../ui/Icon';

const LoginView = () => {
    const { login, signup, loginWithGoogle, setAdminMode, sendEmailLink, completeEmailLinkSignIn } = useAuth();
    const [mode, setMode] = useState('select'); // 'select', 'emailLink', 'password', 'signup', 'verifying'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Check if returning from email link
    useEffect(() => {
        const savedEmail = window.localStorage.getItem('emailForSignIn');
        if (savedEmail && window.location.href.includes('apiKey')) {
            setEmail(savedEmail);
            setMode('verifying');
        }
    }, []);

    const handleSendEmailLink = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await sendEmailLink(email);
            setMessage('📧 이메일을 확인해주세요! 로그인 링크를 보냈습니다.');
            setMode('select');
        } catch (err) {
            console.error(err);
            setError('이메일 발송 실패: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteEmailLink = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await completeEmailLinkSignIn(email, name);
            // Navigation will happen automatically via AuthContext
        } catch (err) {
            console.error(err);
            setError('로그인 실패: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Admin Login Check
            if (email === 'admin' && password === '296800') {
                setAdminMode(true);
                return;
            }
            await login(email, password);
        } catch (err) {
            console.error(err);
            let msg = err.message;
            if (msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) msg = '이메일 또는 비밀번호가 일치하지 않습니다.';
            else if (msg.includes('api-key')) msg = 'Firebase API 키 설정 오류입니다';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!name) throw new Error('이름을 입력해주세요.');
            await signup(email, password, name);
        } catch (err) {
            console.error(err);
            let msg = err.message;
            if (msg.includes('auth/email-already-in-use')) msg = '이미 사용 중인 이메일입니다.';
            else if (msg.includes('auth/weak-password')) msg = '비밀번호는 6자리 이상이어야 합니다.';
            else if (msg.includes('auth/invalid-email')) msg = '유효하지 않은 이메일 형식입니다.';
            else if (msg.includes('auth/operation-not-allowed')) msg = 'Firebase에서 이메일/비밀번호 인증을 활성화해주세요.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-50 to-blue-50">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 animate-scaleIn">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 gradient-theme rounded-3xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
                        <Icon name="heart" size={40} fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Story</h1>
                    <p className="text-gray-500">우리만의 특별한 공간</p>
                </div>

                {/* Messages */}
                {error && <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm rounded-xl text-center font-medium animate-shake break-keep">{error}</div>}
                {message && <div className="mb-6 p-4 bg-green-50 text-green-600 text-sm rounded-xl text-center font-medium break-keep">{message}</div>}

                {/* Mode: Select */}
                {mode === 'select' && (
                    <div className="space-y-4 animate-fadeIn">
                        <button
                            onClick={() => setMode('emailLink')}
                            className="w-full py-4 rounded-xl gradient-theme text-white font-bold text-lg shadow-lg btn-bounce flex items-center justify-center gap-3"
                        >
                            <Icon name="mail" size={22} />
                            이메일 링크로 로그인
                        </button>

                        <button
                            onClick={async () => {
                                try { setLoading(true); await loginWithGoogle(); }
                                catch (e) { setError('Google 로그인 실패: ' + e.message); setLoading(false); }
                            }}
                            className="w-full py-4 rounded-xl border-2 border-gray-100 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all text-gray-700 font-bold btn-bounce"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
                            Google로 계속하기
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">또는</span></div>
                        </div>

                        <button
                            onClick={() => setMode('password')}
                            className="w-full py-3 rounded-xl text-gray-500 font-medium text-sm hover:text-theme-500 transition-colors"
                        >
                            비밀번호로 로그인 →
                        </button>
                    </div>
                )}

                {/* Mode: Email Link */}
                {mode === 'emailLink' && (
                    <form onSubmit={handleSendEmailLink} className="space-y-4 animate-fadeIn">
                        <div className="text-center mb-4">
                            <span className="text-3xl mb-2 block">✉️</span>
                            <p className="text-gray-600 text-sm">이메일을 입력하면 로그인 링크를 보내드려요</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">이메일</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-theme-300 rounded-xl px-4 py-3 outline-none transition-all"
                                placeholder="example@email.com" required />
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-4 rounded-xl gradient-theme text-white font-bold text-lg shadow-lg btn-bounce disabled:opacity-50">
                            {loading ? '발송 중...' : '로그인 링크 받기'}
                        </button>

                        <button type="button" onClick={() => setMode('select')} className="w-full py-2 text-gray-400 text-sm">
                            ← 돌아가기
                        </button>
                    </form>
                )}

                {/* Mode: Verifying (from email link) */}
                {mode === 'verifying' && (
                    <form onSubmit={handleCompleteEmailLink} className="space-y-4 animate-fadeIn">
                        <div className="text-center mb-4">
                            <span className="text-3xl mb-2 block">🎉</span>
                            <p className="text-gray-600 text-sm">이메일 인증 완료! 이름을 입력해주세요</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">이메일</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full bg-gray-100 border-2 border-transparent rounded-xl px-4 py-3 outline-none"
                                readOnly />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">이름 (닉네임)</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-theme-300 rounded-xl px-4 py-3 outline-none transition-all"
                                placeholder="예: 민수" required />
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-4 rounded-xl gradient-theme text-white font-bold text-lg shadow-lg btn-bounce disabled:opacity-50">
                            {loading ? '로그인 중...' : '시작하기 ✨'}
                        </button>
                    </form>
                )}

                {/* Mode: Password Login */}
                {mode === 'password' && (
                    <form onSubmit={handlePasswordLogin} className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">이메일</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-theme-300 rounded-xl px-4 py-3 outline-none transition-all"
                                placeholder="example@email.com" required />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">비밀번호</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-theme-300 rounded-xl px-4 py-3 outline-none transition-all"
                                placeholder="비밀번호 입력" required minLength={6} />
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-4 rounded-xl gradient-theme text-white font-bold text-lg shadow-lg btn-bounce mt-4 disabled:opacity-50">
                            {loading ? '처리 중...' : '로그인하기'}
                        </button>

                        <div className="flex justify-between pt-2">
                            <button type="button" onClick={() => setMode('select')} className="text-gray-400 text-sm">← 돌아가기</button>
                            <button type="button" onClick={() => setMode('signup')} className="text-theme-500 text-sm font-medium">회원가입 →</button>
                        </div>
                    </form>
                )}

                {/* Mode: Signup */}
                {mode === 'signup' && (
                    <form onSubmit={handleSignup} className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">이름 (닉네임)</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-theme-300 rounded-xl px-4 py-3 outline-none transition-all"
                                placeholder="예: 민수" required />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">이메일</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-theme-300 rounded-xl px-4 py-3 outline-none transition-all"
                                placeholder="example@email.com" required />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">비밀번호</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-theme-300 rounded-xl px-4 py-3 outline-none transition-all"
                                placeholder="6자리 이상 입력" required minLength={6} />
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-4 rounded-xl gradient-theme text-white font-bold text-lg shadow-lg btn-bounce mt-4 disabled:opacity-50">
                            {loading ? '처리 중...' : '새로 시작하기'}
                        </button>

                        <button type="button" onClick={() => setMode('password')} className="w-full py-2 text-gray-400 text-sm">
                            ← 로그인으로 돌아가기
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginView;
