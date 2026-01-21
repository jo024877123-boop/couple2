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
        <div className="h-[100dvh] w-full flex flex-col lg:flex-row bg-white relative overflow-hidden font-sans">

            {/* 1. Left Side (Mobile: Top Banner) */}
            <div className="relative w-full lg:w-1/2 h-[40vh] lg:h-full bg-gradient-to-br from-[#6A85B6] to-[#BAC8E0] text-white flex flex-col justify-center lg:justify-between p-8 lg:p-16 shrink-0 z-0">
                {/* Background Overlay */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />

                {/* Floating Blobs (Background) */}
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-purple-300/30 rounded-full mix-blend-screen filter blur-3xl animate-blob opacity-60" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-pink-300/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000 opacity-60" />

                <div className="relative z-10 flex flex-col h-full justify-center lg:justify-center">
                    <div className="flex items-center gap-2 mb-4 lg:mb-8 animate-fadeInDown opacity-90">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] lg:text-xs font-bold uppercase tracking-widest border border-white/10">Our Story</span>
                    </div>

                    <h1 className="text-3xl lg:text-6xl font-black mb-3 lg:mb-6 leading-tight drop-shadow-sm tracking-tight">
                        {typedText}<span className="animate-blink font-light text-pink-200">|</span><br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-100 to-indigo-100">
                            우리들의 이야기
                        </span>
                    </h1>

                    <p className="text-sm lg:text-lg text-white/80 font-medium max-w-md leading-relaxed animate-fadeIn break-keep hidden lg:block" style={{ animationDelay: '0.5s' }}>
                        서로의 일상을 공유하고, 소중한 추억을 기록하세요.<br />
                        가장 로맨틱한 우리만의 공간입니다.
                    </p>
                </div>

                {/* Desktop Features Grid */}
                <div className="hidden lg:grid relative z-10 grid-cols-3 gap-4 animate-fadeInUp mt-auto" style={{ animationDelay: '1s' }}>
                    {features.map((f, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-2xl hover:bg-white/15 transition-all">
                            <Icon name={f.icon} size={24} className="mb-2 text-pink-100" />
                            <h3 className="font-bold text-sm mb-0.5">{f.title}</h3>
                            <p className="text-[10px] text-white/60">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Right Side (Mobile: Bottom Sheet) */}
            <div className="relative w-full lg:w-1/2 h-[60vh] lg:h-full bg-white flex flex-col z-10 -mt-10 lg:mt-0 rounded-t-[2.5rem] lg:rounded-none shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] lg:shadow-none overflow-hidden">
                <div className="flex-1 overflow-y-auto px-8 py-10 lg:p-20 flex flex-col justify-center">
                    <div className="max-w-sm mx-auto w-full">

                        {/* Status Message */}
                        {(error || success) && (
                            <div className={`mb-6 p-4 rounded-2xl text-sm font-bold text-center animate-shake flex items-center justify-center gap-2 shadow-sm ${error ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                <Icon name={error ? "alert-circle" : "check-circle"} size={18} />
                                {error || success}
                            </div>
                        )}

                        {mode === 'login' && (
                            <div className="animate-fadeInRight space-y-8">
                                <div className="text-center lg:text-left">
                                    <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2 tracking-tight">반가워요! 👋</h2>
                                    <p className="text-gray-400 text-sm lg:text-base">오늘 하루는 어땠나요? 함께 이야기해요.</p>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-5">
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <Icon name="mail" size={18} />
                                            </div>
                                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                                className="w-full bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-2xl py-4 pl-11 pr-4 outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400"
                                                placeholder="이메일 주소" />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <Icon name="lock" size={18} />
                                            </div>
                                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                                className="w-full bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-2xl py-4 pl-11 pr-4 outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400"
                                                placeholder="비밀번호" />
                                            <button type="button" onClick={() => setMode('forgot-password')} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-500 hover:text-indigo-600 p-1">
                                                찾기
                                            </button>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading}
                                        className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold text-lg hover:bg-black hover:scale-[1.01] active:scale-[0.98] transition-all shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        {loading ? <Icon name="loader" className="animate-spin" /> : '로그인'}
                                    </button>
                                </form>

                                <div className="pt-2">
                                    <div className="relative flex py-2 items-center mb-6">
                                        <div className="flex-grow border-t border-gray-100"></div>
                                        <span className="flex-shrink-0 mx-4 text-gray-300 text-xs font-bold uppercase tracking-wider">간편 로그인</span>
                                        <div className="flex-grow border-t border-gray-100"></div>
                                    </div>

                                    <button onClick={handleGoogleLogin} disabled={loading}
                                        className="w-full py-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-gray-600 flex items-center justify-center gap-2.5">
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
                                        <span>Google로 계속하기</span>
                                    </button>

                                    <p className="text-center mt-8 text-sm text-gray-400">
                                        아직 계정이 없으신가요?
                                        <button onClick={() => { resetForm(); setMode('signup'); }} className="ml-1.5 text-indigo-600 font-bold hover:underline transition-colors">
                                            회원가입
                                        </button>
                                    </p>
                                </div>
                            </div>
                        )}

                        {mode === 'signup' && (
                            <div className="animate-fadeInRight space-y-6">
                                <div>
                                    <button onClick={() => { resetForm(); setMode('login'); }} className="mb-6 text-gray-400 hover:text-gray-600 flex items-center gap-1">
                                        <Icon name="arrow-left" size={18} /> 이전
                                    </button>
                                    <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">회원가입</h2>
                                    <p className="text-gray-400 text-sm">30초면 충분해요.</p>
                                </div>

                                <form onSubmit={handleSignup} className="space-y-4">
                                    <div className="space-y-3">
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} required
                                            className="w-full bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-5 py-3.5 outline-none font-medium placeholder:text-gray-400"
                                            placeholder="이름 (닉네임)" />
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                            className="w-full bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-5 py-3.5 outline-none font-medium placeholder:text-gray-400"
                                            placeholder="이메일" />
                                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                            className="w-full bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-5 py-3.5 outline-none font-medium placeholder:text-gray-400"
                                            placeholder="비밀번호 (6자리 이상)" />
                                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                                            className="w-full bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-5 py-3.5 outline-none font-medium placeholder:text-gray-400"
                                            placeholder="비밀번호 확인" />
                                    </div>

                                    <button type="submit" disabled={loading}
                                        className="w-full py-4 mt-2 rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-lg hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.98] transition-all">
                                        {loading ? <Icon name="loader" className="animate-spin" /> : '가입 완료 🎉'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {(mode === 'forgot-password' || mode === 'verify-sent') && (
                            <div className="animate-fadeInRight text-center py-4">
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Icon name={mode === 'verify-sent' ? 'mail-check' : 'key'} size={28} />
                                </div>
                                <h2 className="text-xl font-bold mb-2 text-gray-900">{mode === 'verify-sent' ? '메일함 확인' : '비밀번호 찾기'}</h2>
                                <p className="text-sm text-gray-500 mb-8 max-w-[200px] mx-auto leading-relaxed">
                                    {mode === 'verify-sent' ? `${email}로 링크를 보냈어요.` : '가입하신 이메일을 입력하세요.'}
                                </p>

                                {mode === 'forgot-password' && (
                                    <form onSubmit={handleResetPassword} className="space-y-4">
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                            className="w-full bg-gray-50 border border-gray-100 focus:border-indigo-500 rounded-2xl px-5 py-3.5 outline-none font-medium text-center"
                                            placeholder="name@example.com" />
                                        <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-all">
                                            링크 보내기
                                        </button>
                                    </form>
                                )}
                                <button onClick={() => { resetForm(); setMode('login'); }} className="mt-8 text-gray-400 text-sm font-bold hover:text-gray-600">
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
                .animate-blink { animation: blink 1s step-end infinite; }
                @keyframes blink { 50% { opacity: 0; } }
            `}</style>
        </div>
    );
};

export default LoginView;
