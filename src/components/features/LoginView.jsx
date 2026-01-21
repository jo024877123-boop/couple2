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
        <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-[#0f172a] relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">

            {/* 1. Left Side (Premium Visuals) */}
            <div className="relative w-full lg:w-7/12 h-[35vh] lg:h-auto overflow-hidden flex flex-col justify-center p-8 lg:p-24 z-0 bg-[#0f172a]">
                {/* 2026 Trend: Aurora Gradients & Noise */}
                <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000" />
                <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-pink-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>

                <div className="relative z-10 text-white max-w-3xl mt-10 lg:mt-0">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-xs font-bold tracking-widest uppercase text-indigo-200 mb-6 animate-fadeIn transition-transform hover:scale-105 cursor-default">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                        The Premium Couple App
                    </div>

                    <h1 className="text-4xl lg:text-7xl font-black tracking-tighter mb-6 leading-[1.1] drop-shadow-2xl">
                        <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">
                            {typedText}
                        </span>
                        <span className="text-indigo-400 animate-pulse ml-1">_</span>
                        <br />
                        <span className="block text-2xl lg:text-5xl opacity-60 font-medium tracking-tight mt-2 lg:mt-4 text-slate-300">
                            우리만의 특별한 우주
                        </span>
                    </h1>

                    <p className="hidden lg:block text-lg text-slate-400 font-medium leading-relaxed max-w-lg animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                        가장 소중한 순간을 기록하고 공유하세요.<br />
                        단둘이서 만들어가는 <span className="text-white font-bold decoration-indigo-500 underline underline-offset-4">Our Story</span>의 시작.
                    </p>

                    {/* Features Grid (Desktop Only) */}
                    <div className="hidden lg:grid grid-cols-3 gap-4 mt-16 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                        {features.map((f, i) => (
                            <div key={i} className="group p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-300 mb-3 group-hover:scale-110 transition-transform">
                                    <Icon name={f.icon} size={20} />
                                </div>
                                <h3 className="font-bold text-white text-sm mb-1">{f.title}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. Right Side (Modern Form) */}
            <div className="relative w-full lg:w-5/12 min-h-[65vh] lg:h-auto bg-white flex flex-col items-center justify-center p-6 lg:p-12 z-10 rounded-t-[2.5rem] lg:rounded-none lg:rounded-l-[3.5rem] shadow-2xl overflow-y-auto">
                <div className="w-full max-w-[400px] animate-fadeIn">

                    {/* Feedback Toast */}
                    {(error || success) && (
                        <div className={`mb-6 p-4 rounded-2xl text-sm font-bold text-center animate-shake flex items-center justify-center gap-3 shadow-lg backdrop-blur-md ${error ? 'bg-red-50/90 text-red-500 ring-1 ring-red-100' : 'bg-green-50/90 text-green-600 ring-1 ring-green-100'}`}>
                            <Icon name={error ? "alert-circle" : "check-circle"} size={20} />
                            <span>{error || success}</span>
                        </div>
                    )}

                    {mode === 'login' && (
                        <div className="space-y-8">
                            <div className="text-center lg:text-left">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back!</h2>
                                <p className="text-slate-500 font-medium">오늘도 서로의 이야기를 들려주세요.</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-4">
                                    <div className="group relative transition-all">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <Icon name="mail" size={20} />
                                        </div>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-400"
                                            placeholder="이메일" />
                                    </div>
                                    <div className="group relative transition-all">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <Icon name="lock" size={20} />
                                        </div>
                                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-400"
                                            placeholder="비밀번호" />
                                        <button type="button" onClick={() => setMode('forgot-password')} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors px-2 py-1 rounded-md hover:bg-indigo-50">
                                            분실하셨나요?
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full py-4 rounded-xl relative overflow-hidden bg-slate-900 text-white font-bold text-lg hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <span className="relative flex items-center justify-center gap-2">
                                        {loading ? <Icon name="loader" className="animate-spin" /> : '로그인'}
                                        {!loading && <Icon name="arrow-right" size={18} className="group-hover:translate-x-1 transition-transform" />}
                                    </span>
                                </button>
                            </form>

                            <div className="pt-2">
                                <div className="relative flex py-2 items-center mb-6">
                                    <div className="flex-grow border-t border-slate-100"></div>
                                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Social Login</span>
                                    <div className="flex-grow border-t border-slate-100"></div>
                                </div>

                                <button onClick={handleGoogleLogin} disabled={loading}
                                    className="w-full py-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-slate-600 flex items-center justify-center gap-3 relative overflow-hidden active:scale-[0.98]">
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
                                    <span>Google 계정으로 시작</span>
                                </button>

                                <div className="text-center mt-10">
                                    <p className="text-sm text-slate-400 mb-2">아직 계정이 없으신가요?</p>
                                    <button onClick={() => { resetForm(); setMode('signup'); }} className="text-indigo-600 font-black text-sm hover:text-indigo-800 transition-colors hover:underline underline-offset-4 decoration-2">
                                        무료로 회원가입하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Signup Mode */}
                    {mode === 'signup' && (
                        <div className="space-y-6 animate-fadeInRight">
                            <div>
                                <button onClick={() => { resetForm(); setMode('login'); }} className="mb-8 text-slate-400 hover:text-slate-600 flex items-center gap-2 text-sm font-bold transition-colors group">
                                    <Icon name="arrow-left" size={16} className="group-hover:-translate-x-1 transition-transform" /> 로그인으로 돌아가기
                                </button>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">회원가입</h2>
                                <p className="text-slate-500 font-medium mt-1">30초 만에 커플 공간을 만들어보세요.</p>
                            </div>

                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-3">
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} required
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-5 py-4 outline-none font-semibold placeholder:text-slate-400 transition-all"
                                        placeholder="이름 (닉네임)" />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-5 py-4 outline-none font-semibold placeholder:text-slate-400 transition-all"
                                        placeholder="이메일" />
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-5 py-4 outline-none font-semibold placeholder:text-slate-400 transition-all"
                                        placeholder="비밀번호 (6자리 이상)" />
                                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-5 py-4 outline-none font-semibold placeholder:text-slate-400 transition-all"
                                        placeholder="비밀번호 확인" />
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.98] transition-all">
                                    {loading ? <Icon name="loader" className="animate-spin" /> : '가입 완료하고 시작하기 ✨'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Forgot Password Mode */}
                    {(mode === 'forgot-password' || mode === 'verify-sent') && (
                        <div className="animate-fadeInRight text-center py-4">
                            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm rotate-3 hover:rotate-6 transition-transform">
                                <Icon name={mode === 'verify-sent' ? 'mail-check' : 'key'} size={32} />
                            </div>
                            <h2 className="text-2xl font-bold mb-3 text-slate-900">{mode === 'verify-sent' ? '메일함 확인' : '비밀번호 찾기'}</h2>
                            <p className="text-sm text-slate-500 mb-8 max-w-[240px] mx-auto leading-relaxed">
                                {mode === 'verify-sent' ? `${email}로 재설정 링크를 보냈어요. 스팸함도 확인해주세요!` : '가입하신 이메일을 입력하시면\n재설정 링크를 보내드립니다.'}
                            </p>

                            {mode === 'forgot-password' && (
                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl px-5 py-4 outline-none font-semibold text-center placeholder:text-slate-400 transition-all"
                                        placeholder="name@example.com" />
                                    <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition-all shadow-lg">
                                        재설정 링크 보내기
                                    </button>
                                </form>
                            )}
                            <button onClick={() => { resetForm(); setMode('login'); }} className="mt-8 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors">
                                로그인으로 돌아가기
                            </button>
                        </div>
                    )}
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
            `}</style>
        </div>
    );
};

export default LoginView;
