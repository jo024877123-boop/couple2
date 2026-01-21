import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Icon from '../ui/Icon';

const LoginView = () => {
    const { login, signup, loginWithGoogle, setAdminMode, resetPassword } = useAuth();
    const [mode, setMode] = useState('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');

    // 타이핑 효과를 위한 상태
    const [typedText, setTypedText] = useState('');
    const fullText = "둘만의 특별한 공간";

    useEffect(() => {
        let idx = 0;
        const timer = setInterval(() => {
            setTypedText(fullText.slice(0, idx));
            idx++;
            if (idx > fullText.length) clearInterval(timer);
        }, 150);
        return () => clearInterval(timer);
    }, []);

    const resetForm = () => {
        setEmail(''); setPassword(''); setConfirmPassword(''); setName('');
        setError(''); setSuccess('');
    };

    const handleLogin = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            if (email === 'admin' && password === '296800') { setAdminMode(true); return; }
            await login(email, password);
        } catch (err) {
            setError(err.message.includes('auth') ? '로그인 정보를 확인해주세요.' : err.message);
            console.error(err);
        } finally { setLoading(false); }
    };

    const handleSignup = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            if (!name.trim()) throw new Error('이름을 입력해주세요.');
            if (password !== confirmPassword) throw new Error('비밀번호가 일치하지 않습니다.');
            if (password.length < 6) throw new Error('6자리 이상이어야 합니다.');
            const res = await signup(email, password, name);
            setSuccess(res.message); setMode('verify-sent');
        } catch (err) {
            setError(err.message.includes('email-already-in-use') ? '이미 사용 중인 이메일입니다.' : err.message);
        } finally { setLoading(false); }
    };

    const handleGoogleLogin = async () => {
        setError(''); setLoading(true);
        try { await loginWithGoogle(); } catch (err) { setError('Google 로그인 실패'); console.error(err); } finally { setLoading(false); }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
        try { await resetPassword(email); setSuccess('이메일을 발송했습니다!'); setTimeout(() => { setMode('login'); setSuccess(''); }, 5000); } catch (err) { setError('이메일을 확인해주세요.'); } finally { setLoading(false); }
    };

    const features = [
        { icon: 'book-open', title: '추억 기록', desc: '사진과 함께 타임라인' },
        { icon: 'scale', title: '밸런스 게임', desc: '매일 새로운 질문' },
        { icon: 'sprout', title: '커플 성장', desc: '함께 키우는 사랑의 나무' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-0 lg:p-4 bg-gray-50 relative overflow-x-hidden font-sans">

            {/* 1. 배경 애니메이션 (움직이는 Blob) - 모바일에서는 조금 더 작게 */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[80vw] lg:w-[50vw] h-[80vw] lg:h-[50vw] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[80vw] lg:w-[50vw] h-[80vw] lg:h-[50vw] bg-yellow-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[80vw] lg:w-[50vw] h-[80vw] lg:h-[50vw] bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-6xl min-h-screen lg:min-h-0 lg:h-[85vh] bg-white lg:bg-white/40 backdrop-blur-xl lg:rounded-[2.5rem] shadow-none lg:shadow-2xl overflow-y-auto overflow-x-hidden flex flex-col lg:flex-row relative z-10 lg:border border-white/50">

                {/* Left Side: Dynamic Intro */}
                <div className="lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#6A85B6] to-[#BAC8E0] p-8 lg:p-12 text-white flex flex-col justify-between group shrink-0 min-h-[40vh] lg:min-h-full">
                    {/* Background Image Overlay */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay transition-transform duration-[20s] ease-linear group-hover:scale-110" />

                    <div className="relative z-10 mt-auto mb-auto lg:my-0">
                        <div className="flex items-center gap-3 mb-6 lg:mb-12 animate-fadeInDown">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                                <Icon name="heart" fill="white" className="text-white" size={16} /> {/* 모바일 사이즈 조정 */}
                            </div>
                            <span className="font-bold text-sm lg:text-lg tracking-widest uppercase text-white/90">Our Story</span>
                        </div>

                        <h1 className="text-3xl lg:text-5xl xl:text-6xl font-black mb-4 lg:mb-6 leading-tight drop-shadow-lg break-keep transition-all">
                            {typedText}<span className="animate-blink">|</span><br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-purple-200">
                                우리들의 이야기
                            </span>
                        </h1>
                        <p className="text-sm lg:text-lg text-white/90 font-light mb-8 lg:mb-12 max-w-md leading-relaxed animate-fadeIn break-keep" style={{ animationDelay: '1s' }}>
                            소중한 순간을 영원히. <br className="lg:hidden" />
                            서로의 일상을 공유하고 사랑을 키워나가는 <br className="lg:hidden" />
                            가장 로맨틱한 방법입니다.
                        </p>
                    </div>

                    {/* Feature Cards Showcase - 모바일에서는 가로 스크롤 혹은 간소화 */}
                    <div className="hidden lg:grid relative z-10 grid-cols-1 md:grid-cols-3 gap-4 animate-fadeInUp" style={{ animationDelay: '1.5s' }}>
                        {features.map((f, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl hover:bg-white/20 transition-all cursor-default hover:-translate-y-1 duration-300">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
                                    <Icon name={f.icon} size={20} />
                                </div>
                                <h3 className="font-bold text-base mb-1">{f.title}</h3>
                                <p className="text-xs text-white/70">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* 모바일용 심플 피처 (아이콘만) */}
                    <div className="lg:hidden flex gap-4 animate-fadeInUp justify-center opacity-80" style={{ animationDelay: '1.5s' }}>
                        {features.map((f, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <div className="p-2 bg-white/20 rounded-full"><Icon name={f.icon} size={16} /></div>
                                <span className="text-[10px] font-medium">{f.title}</span>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Right Side: Login Form */}
                <div className="lg:w-1/2 bg-white flex flex-col justify-center p-6 lg:p-16 relative rounded-t-[2rem] lg:rounded-t-none -mt-6 lg:mt-0 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none min-h-[60vh]">
                    <div className="max-w-md mx-auto w-full relative z-10">
                        {/* Messages */}
                        {(error || success) && (
                            <div className={`mb-6 p-4 rounded-xl text-sm font-bold text-center animate-bounce-slow flex items-center justify-center gap-2 ${error ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                <Icon name={error ? "alert-circle" : "check-circle"} size={18} />
                                {error || success}
                            </div>
                        )}

                        {mode === 'login' && (
                            <div className="animate-fadeInRight">
                                <div className="mb-8 lg:mb-10 text-center lg:text-left">
                                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">반가워요! 👋</h2>
                                    <p className="text-sm lg:text-base text-gray-500 break-keep">오늘도 소중한 추억을 기록해볼까요?</p>
                                </div>
                                <form onSubmit={handleLogin} className="space-y-5 lg:space-y-6">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-theme-500 transition-colors">Email Address</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                            className="w-full bg-gray-50 border-b-2 border-gray-200 focus:border-theme-500 px-4 py-3 outline-none transition-all text-base lg:text-lg font-medium placeholder:text-gray-300 bg-transparent" placeholder="name@example.com" />
                                    </div>
                                    <div className="group">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider group-focus-within:text-theme-500 transition-colors">Password</label>
                                            <button type="button" onClick={() => setMode('forgot-password')} className="text-xs font-bold text-theme-500 hover:text-theme-600">비밀번호 찾기</button>
                                        </div>
                                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                            className="w-full bg-gray-50 border-b-2 border-gray-200 focus:border-theme-500 px-4 py-3 outline-none transition-all text-base lg:text-lg font-medium placeholder:text-gray-300 bg-transparent" placeholder="••••••••" />
                                    </div>

                                    <button type="submit" disabled={loading}
                                        className="w-full py-3.5 lg:py-4 rounded-2xl bg-gray-900 text-white font-bold text-lg shadow-xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                                        {loading ? <Icon name="loader" className="animate-spin" /> : <>로그인 <Icon name="arrow-right" size={18} /></>}
                                    </button>
                                </form>

                                <div className="mt-8">
                                    <div className="relative flex py-5 items-center">
                                        <div className="flex-grow border-t border-gray-100"></div>
                                        <span className="flex-shrink-0 mx-4 text-gray-300 text-xs font-bold uppercase">Or continue with</span>
                                        <div className="flex-grow border-t border-gray-100"></div>
                                    </div>
                                    <button onClick={handleGoogleLogin} disabled={loading}
                                        className="w-full py-3.5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all font-bold text-gray-600 flex items-center justify-center gap-2 text-sm lg:text-base">
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
                                        Google
                                    </button>
                                    <p className="text-center mt-8 text-sm text-gray-500">
                                        처음이신가요? <button onClick={() => { resetForm(); setMode('signup'); }} className="text-theme-600 font-bold hover:underline ml-1">회원가입</button>
                                    </p>
                                </div>
                            </div>
                        )}

                        {mode === 'signup' && (
                            <div className="animate-fadeInRight">
                                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">회원가입</h2>
                                <p className="text-sm lg:text-base text-gray-500 mb-6 lg:mb-8">간편하게 시작하세요.</p>
                                <form onSubmit={handleSignup} className="space-y-4 text-sm lg:text-base">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Name</label>
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} required
                                            className="w-full border-b-2 border-gray-200 focus:border-theme-500 py-2 outline-none transition-all font-medium bg-transparent" placeholder="닉네임" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                            className="w-full border-b-2 border-gray-200 focus:border-theme-500 py-2 outline-none transition-all font-medium bg-transparent" placeholder="이메일" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
                                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                            className="w-full border-b-2 border-gray-200 focus:border-theme-500 py-2 outline-none transition-all font-medium bg-transparent" placeholder="6자리 이상" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Confirm Password</label>
                                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                                            className="w-full border-b-2 border-gray-200 focus:border-theme-500 py-2 outline-none transition-all font-medium bg-transparent" placeholder="비밀번호 확인" />
                                    </div>
                                    <button type="submit" disabled={loading}
                                        className="w-full py-4 mt-4 rounded-2xl bg-gray-900 text-white font-bold text-lg shadow-xl hover:bg-black transition-all">
                                        {loading ? '처리 중...' : '계정 만들기'}
                                    </button>
                                </form>
                                <button onClick={() => { resetForm(); setMode('login'); }} className="w-full mt-6 text-gray-400 hover:text-gray-600 text-sm font-bold flex items-center justify-center gap-1">
                                    <Icon name="arrow-left" size={14} /> 로그인으로 돌아가기
                                </button>
                            </div>
                        )}

                        {(mode === 'forgot-password' || mode === 'verify-sent') && (
                            <div className="animate-fadeInRight text-center">
                                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-theme-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Icon name={mode === 'verify-sent' ? 'mail-check' : 'key'} size={28} className="text-theme-500" />
                                </div>
                                <h2 className="text-xl lg:text-2xl font-bold mb-2">{mode === 'verify-sent' ? '메일함 확인' : '비밀번호 찾기'}</h2>
                                <p className="text-sm lg:text-base text-gray-500 mb-8 max-w-xs mx-auto break-keep">
                                    {mode === 'verify-sent' ? `${email}로 인증 메일을 보냈습니다.` : '가입한 이메일을 입력하세요.'}
                                </p>

                                {mode === 'forgot-password' && (
                                    <form onSubmit={handleResetPassword} className="space-y-6">
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                            className="w-full border-b-2 border-gray-200 focus:border-theme-500 py-2 outline-none transition-all font-medium text-center bg-transparent" placeholder="name@example.com" />
                                        <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl gradient-theme text-white font-bold shadow-lg">전송하기</button>
                                    </form>
                                )}

                                <button onClick={() => { resetForm(); setMode('login'); }} className="mt-8 text-gray-400 hover:text-gray-600 text-sm font-bold">
                                    로그인으로 돌아가기
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 10s infinite;
                }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
                .animate-blink { animation: blink 1s step-end infinite; }
                @keyframes blink { 50% { opacity: 0; } }
            `}</style>
        </div>
    );
};

export default LoginView;
