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
            let msg = 'Google 로그인 실패: ' + err.message;
            if (err.message.includes('popup-closed-by-user')) msg = '로그인 창이 닫혔습니다. 다시 시도해주세요.';
            if (err.message.includes('popup-blocked')) msg = '팝업이 차단되었습니다. 브라우저 설정을 확인해주세요.';
            setError(msg);
            if (navigator.userAgent.includes('KAKAOTALK') || navigator.userAgent.includes('Instagram')) {
                alert('카카오톡/인스타그램 인앱 브라우저에서는 Google 로그인이 제한될 수 있습니다. Chrome이나 Safari 등 기본 브라우저를 이용해주세요.');
            }
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

    // 소개 페이지용 기능 목록
    const features = [
        { icon: 'book-open', title: '소중한 추억 기록', desc: '사진과 함께 우리의 일상을 타임라인으로 남겨보세요.' },
        { icon: 'scale', title: '커플 밸런스 게임', desc: '서로의 취향을 알아가며 더욱 가까워지세요.' },
        { icon: 'sprout', title: '사랑의 나무 키우기', desc: '함께 기록할수록 무럭무럭 자라나는 사랑의 나무!' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 lg:p-10 bg-[#f8f9fa] relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200 rounded-full blur-[100px] opacity-30 animate-float" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-pink-200 rounded-full blur-[100px] opacity-30 animate-float" style={{ animationDelay: '2s' }} />

            <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row shadow-theme/10 relative z-10 animate-scaleIn">

                {/* Left Side: Brand & Intro */}
                <div className="lg:w-1/2 bg-gradient-to-br from-theme-500 to-pink-500 p-8 lg:p-12 text-white relative flex flex-col justify-between overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                <Icon name="heart" size={24} fill="white" className="text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-wide opacity-90">Our Story</span>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
                            둘만의<br />특별한 공간,<br />
                            <span className="text-yellow-300">Our Story</span>
                        </h1>

                        <div className="space-y-6 mt-8">
                            {features.map((feat, i) => (
                                <div key={i} className="flex gap-4 items-start animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shrink-0">
                                        <Icon name={feat.icon} size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{feat.title}</h3>
                                        <p className="text-white/80 text-sm leading-relaxed">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl" />
                </div>

                {/* Right Side: Login Form */}
                <div className="lg:w-1/2 p-8 lg:p-12 bg-white flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        {/* Error / Success Messages */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm rounded-xl text-center font-medium animate-shake flex items-center justify-center gap-2">
                                <Icon name="alert-circle" size={16} /> {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 text-green-600 text-sm rounded-xl text-center font-medium flex items-center justify-center gap-2">
                                <Icon name="check-circle" size={16} /> {success}
                            </div>
                        )}

                        {/* ========== LOGIN MODE ========== */}
                        {mode === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-5 animate-fadeIn">
                                <div className="text-center lg:text-left mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900">로그인</h2>
                                    <p className="text-gray-500 text-sm mt-1">이메일로 간편하게 로그인하세요.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">이메일</label>
                                    <div className="relative">
                                        <Icon name="mail" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-theme-500 focus:ring-4 focus:ring-theme-500/10 rounded-xl pl-11 pr-4 py-3.5 outline-none transition-all"
                                            placeholder="example@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2 ml-1">
                                        <label className="block text-sm font-bold text-gray-700">비밀번호</label>
                                        <button type="button" onClick={() => setMode('forgot-password')} className="text-xs text-theme-500 font-bold hover:underline">
                                            비밀번호 찾기
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Icon name="lock" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-theme-500 focus:ring-4 focus:ring-theme-500/10 rounded-xl pl-11 pr-4 py-3.5 outline-none transition-all"
                                            placeholder="비밀번호 입력"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl gradient-theme text-white font-bold text-lg shadow-theme hover:shadow-lg transition-all disabled:opacity-50 btn-bounce"
                                >
                                    {loading ? '로그인 중...' : '로그인하기'}
                                </button>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-100"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-3 bg-white text-gray-400">또는</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-xl border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all text-gray-700 font-bold disabled:opacity-50"
                                >
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
                                    Google로 시작하기
                                </button>

                                <div className="text-center pt-4">
                                    <p className="text-sm text-gray-500">
                                        아직 계정이 없으신가요?{' '}
                                        <button
                                            type="button"
                                            onClick={() => { resetForm(); setMode('signup'); }}
                                            className="text-theme-600 font-bold hover:underline"
                                        >
                                            회원가입
                                        </button>
                                    </p>
                                </div>
                            </form>
                        )}

                        {/* ========== SIGNUP MODE ========== */}
                        {mode === 'signup' && (
                            <form onSubmit={handleSignup} className="space-y-4 animate-fadeIn">
                                <div className="text-center lg:text-left mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">회원가입</h2>
                                    <p className="text-gray-500 text-sm mt-1">간편하게 가입하고 시작해보세요.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">이름 (닉네임)</label>
                                    <div className="relative">
                                        <Icon name="user" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-theme-500 rounded-xl pl-11 pr-4 py-3 outline-none transition-all"
                                            placeholder="예: 민수"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">이메일</label>
                                    <div className="relative">
                                        <Icon name="mail" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-theme-500 rounded-xl pl-11 pr-4 py-3 outline-none transition-all"
                                            placeholder="example@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">비밀번호</label>
                                    <div className="relative">
                                        <Icon name="lock" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-theme-500 rounded-xl pl-11 pr-4 py-3 outline-none transition-all"
                                            placeholder="6자리 이상"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">비밀번호 확인</label>
                                    <div className="relative">
                                        <Icon name="check-circle" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-theme-500 rounded-xl pl-11 pr-4 py-3 outline-none transition-all"
                                            placeholder="비밀번호 다시 입력"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-4 py-4 rounded-xl gradient-theme text-white font-bold text-lg shadow-theme hover:shadow-lg transition-all disabled:opacity-50 btn-bounce"
                                >
                                    {loading ? '처리 중...' : '이메일 인증 받기'}
                                </button>

                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { resetForm(); setMode('login'); }}
                                        className="text-gray-400 text-sm hover:text-gray-600 flex items-center justify-center gap-1 mx-auto"
                                    >
                                        <Icon name="arrow-left" size={14} /> 로그인으로 돌아가기
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ========== FORGOT PASSWORD MODE ========== */}
                        {mode === 'forgot-password' && (
                            <form onSubmit={handleResetPassword} className="space-y-4 animate-fadeIn">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icon name="key" size={32} className="text-yellow-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">비밀번호 재설정</h3>
                                    <p className="text-gray-500 text-sm mt-1">가입하신 이메일로 링크를 보내드립니다.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">이메일</label>
                                    <div className="relative">
                                        <Icon name="mail" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-theme-500 rounded-xl pl-11 pr-4 py-3 outline-none transition-all"
                                            placeholder="example@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl gradient-theme text-white font-bold text-lg shadow-theme hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {loading ? '전송 중...' : '재설정 링크 보내기'}
                                </button>

                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { resetForm(); setMode('login'); }}
                                        className="text-gray-400 text-sm hover:text-gray-600 flex items-center justify-center gap-1 mx-auto"
                                    >
                                        <Icon name="arrow-left" size={14} /> 로그인으로 돌아가기
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ========== VERIFY SENT MODE ========== */}
                        {mode === 'verify-sent' && (
                            <div className="text-center space-y-6 animate-fadeIn py-8">
                                <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                                    <Icon name="mail-check" size={48} className="text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">이메일을 확인해주세요!</h2>
                                    <p className="text-gray-600">
                                        <span className="font-bold text-theme-500 underline">{email}</span>으로<br />
                                        인증 메일을 발송했습니다.
                                    </p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700 text-left flex gap-3">
                                    <Icon name="info" className="shrink-0 mt-0.5" size={18} />
                                    <span>이메일의 링크를 클릭하여 인증을 완료한 후, 다시 로그인해주세요. 스팸 메일함도 확인해주세요!</span>
                                </div>
                                <button
                                    onClick={() => { resetForm(); setMode('login'); }}
                                    className="w-full py-4 rounded-xl gradient-theme text-white font-bold text-lg shadow-theme mt-4"
                                >
                                    로그인하러 가기
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
