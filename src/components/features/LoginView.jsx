import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Icon from '../ui/Icon';

const LoginView = () => {
    const { login, signup, loginWithGoogle, setAdminMode, resetPassword } = useAuth();
    const [mode, setMode] = useState('login'); // 'login', 'signup', 'verify-sent', 'forgot-password'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setError('');
        setSuccess('');
    };

    // ========== LOGIN ==========
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Admin check
            if (email === 'admin' && password === '296800') {
                setAdminMode(true);
                return;
            }

            await login(email, password);
            // Navigation happens automatically via AuthContext
        } catch (err) {
            console.error(err);
            let msg = err.message;
            if (msg.includes('auth/user-not-found')) msg = '등록되지 않은 이메일입니다.';
            else if (msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) msg = '비밀번호가 일치하지 않습니다.';
            else if (msg.includes('auth/too-many-requests')) msg = '너무 많은 시도입니다. 잠시 후 다시 시도해주세요.';
            else if (msg.includes('이메일 인증')) msg = err.message;
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // ========== SIGNUP ==========
    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!name.trim()) throw new Error('이름을 입력해주세요.');
            if (password !== confirmPassword) throw new Error('비밀번호가 일치하지 않습니다.');
            if (password.length < 6) throw new Error('비밀번호는 6자리 이상이어야 합니다.');

            const result = await signup(email, password, name);
            setSuccess(result.message);
            setMode('verify-sent');
        } catch (err) {
            console.error(err);
            let msg = err.message;
            if (msg.includes('auth/email-already-in-use')) msg = '이미 사용 중인 이메일입니다.';
            else if (msg.includes('auth/invalid-email')) msg = '유효하지 않은 이메일 형식입니다.';
            else if (msg.includes('auth/operation-not-allowed')) msg = 'Firebase에서 이메일 인증을 활성화해주세요.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // ========== GOOGLE LOGIN ==========
    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            console.error(err);
            setError('Google 로그인 실패: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // ========== RESET PASSWORD ==========
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await resetPassword(email);
            setSuccess('비밀번호 재설정 메일을 보냈습니다! 메일함을 확인해주세요.');
            setTimeout(() => {
                setMode('login');
                setSuccess('');
            }, 5000);
        } catch (err) {
            console.error(err);
            let msg = err.message;
            if (msg.includes('auth/user-not-found')) msg = '등록되지 않은 이메일입니다.';
            else if (msg.includes('auth/invalid-email')) msg = '유효하지 않은 이메일 형식입니다.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 animate-scaleIn">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
                        <Icon name="heart" size={40} fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Story</h1>
                    <p className="text-gray-500">우리만의 특별한 공간</p>
                </div>

                {/* Error / Success Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm rounded-xl text-center font-medium animate-shake">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 text-green-600 text-sm rounded-xl text-center font-medium">
                        {success}
                    </div>
                )}

                {/* ========== LOGIN MODE ========== */}
                {mode === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">이메일</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-300 rounded-xl px-4 py-3 outline-none transition-all"
                                placeholder="example@email.com"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2 ml-1">
                                <label className="block text-sm font-bold text-gray-700">비밀번호</label>
                                <button type="button" onClick={() => setMode('forgot-password')} className="text-xs text-purple-500 font-bold hover:underline">
                                    비밀번호를 잊으셨나요?
                                </button>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-300 rounded-xl px-4 py-3 outline-none transition-all"
                                placeholder="비밀번호 입력"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-gray-400">또는</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full py-4 rounded-xl border-2 border-gray-100 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all text-gray-700 font-bold disabled:opacity-50"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
                            Google로 계속하기
                        </button>

                        <div className="text-center pt-4">
                            <button
                                type="button"
                                onClick={() => { resetForm(); setMode('signup'); }}
                                className="text-purple-500 font-medium text-sm hover:underline"
                            >
                                아직 계정이 없으신가요? <span className="font-bold">회원가입</span>
                            </button>
                        </div>
                    </form>
                )}

                {/* ========== SIGNUP MODE ========== */}
                {mode === 'signup' && (
                    <form onSubmit={handleSignup} className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">이름 (닉네임)</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-300 rounded-xl px-4 py-3 outline-none transition-all"
                                placeholder="예: 민수"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">이메일</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-300 rounded-xl px-4 py-3 outline-none transition-all"
                                placeholder="example@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">비밀번호</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-300 rounded-xl px-4 py-3 outline-none transition-all"
                                placeholder="6자리 이상"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">비밀번호 확인</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-300 rounded-xl px-4 py-3 outline-none transition-all"
                                placeholder="비밀번호 다시 입력"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                            {loading ? '처리 중...' : '이메일 인증 받기'}
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => { resetForm(); setMode('login'); }}
                                className="text-gray-400 text-sm hover:text-gray-600"
                            >
                                ← 로그인으로 돌아가기
                            </button>
                        </div>
                    </form>
                )}

                {/* ========== FORGOT PASSWORD MODE ========== */}
                {mode === 'forgot-password' && (
                    <form onSubmit={handleResetPassword} className="space-y-4 animate-fadeIn">
                        <div className="text-center mb-4">
                            <span className="text-3xl mb-2 block">🔑</span>
                            <h3 className="text-xl font-bold text-gray-900">비밀번호 재설정</h3>
                            <p className="text-gray-500 text-sm">가입하신 이메일을 입력하시면<br />재설정 링크를 보내드립니다.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">이메일</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-300 rounded-xl px-4 py-3 outline-none transition-all"
                                placeholder="example@email.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                            {loading ? '전송 중...' : '재설정 링크 보내기'}
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => { resetForm(); setMode('login'); }}
                                className="text-gray-400 text-sm hover:text-gray-600"
                            >
                                ← 로그인으로 돌아가기
                            </button>
                        </div>
                    </form>
                )}

                {/* ========== VERIFY SENT MODE ========== */}
                {mode === 'verify-sent' && (
                    <div className="text-center space-y-6 animate-fadeIn">
                        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                            <Icon name="mail-check" size={40} className="text-green-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">이메일을 확인해주세요!</h2>
                            <p className="text-gray-600">
                                <span className="font-bold text-purple-500">{email}</span>으로<br />
                                인증 메일을 발송했습니다.
                            </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl text-sm text-purple-700">
                            💡 이메일의 링크를 클릭하여 인증을 완료한 후,<br />다시 로그인해주세요.
                        </div>
                        <button
                            onClick={() => { resetForm(); setMode('login'); }}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg shadow-lg"
                        >
                            로그인하러 가기
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default LoginView;
