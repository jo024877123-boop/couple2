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

    // ==========================================
    // 🛡️ 인앱 브라우저 감지 및 대응
    // ==========================================
    const [showInAppAlert, setShowInAppAlert] = useState(false);

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        // 카카오톡, 인스타그램, 페이스북, 네이버, 라인 등 인앱 브라우저 식별 문자열
        const isInApp = /KAKAOTALK|Instagram|NAVER|ZuukTalk|Snapchat|Line|Everytime|Twitter|Whale/i.test(userAgent);

        if (isInApp) {
            // Android: Chrome으로 강제 이동 시도
            if (/android/i.test(userAgent)) {
                // 현재 페이지 URL
                const currentUrl = window.location.href.replace(/^https?:\/\//i, '');
                // Intent 스키마를 이용해 Chrome 호출
                window.location.href = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
            } else {
                // iOS: 강제 이동 불가 -> 안내 모달 표시
                setShowInAppAlert(true);
            }
        }
    }, []);

    const features = [
        { icon: 'book-open', title: '추억 기록', desc: '사진과 함께 타임라인' },
        { icon: 'scale', title: '밸런스 게임', desc: '매일 새로운 질문' },
        { icon: 'sprout', title: '커플 성장', desc: '함께 키우는 사랑의 나무' },
    ];

    return (
        <div id="login-view-root" className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-[#f8fcff] relative overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">

            {/* Force Cursor Reset for Login View (ID Selector for max specificity) */}
            <style>{`
                #login-view-root, #login-view-root * { 
                    cursor: default !important; 
                }
                #login-view-root button, 
                #login-view-root a, 
                #login-view-root [role="button"],
                #login-view-root input[type="submit"],
                #login-view-root input[type="button"] { 
                    cursor: pointer !important; 
                }
                #login-view-root input[type="text"],
                #login-view-root input[type="email"],
                #login-view-root input[type="password"] { 
                    cursor: text !important; 
                }
            `}</style>

            {/* 1. Left Side (Emotional Visuals) */}
            <div className="relative w-full lg:w-7/12 h-[38vh] lg:h-auto overflow-hidden flex flex-col justify-center p-6 lg:p-24 z-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50">

                {/* 2026 Trend: Cloud/Cotton Candy "Mongle-Mongle" */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-pink-200/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000" />
                    <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-blue-100/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000" />
                </div>

                {/* Hand Heart Texture Overlay - Refined Visibility */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-overlay contrast-110 grayscale-[10%]" />
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]" />

                <div className="relative z-10 max-w-2xl mt-4 lg:mt-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 lg:px-4 lg:py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/50 text-[10px] lg:text-xs font-bold tracking-widest uppercase text-indigo-900 mb-4 lg:mb-6 shadow-sm animate-fadeIn hover:scale-105 transition-transform cursor-default select-none">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                        Our Special Space
                    </div>

                    <h1 className="text-3xl lg:text-7xl font-black tracking-tighter mb-4 lg:mb-6 leading-[1.15] text-slate-800 drop-shadow-sm">
                        <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500 bg-clip-text text-transparent">
                            {typedText}
                        </span>
                        <span className="text-indigo-400 animate-pulse ml-1">_</span>
                        <br />
                        <span className="block text-xl lg:text-5xl opacity-80 font-medium tracking-tight mt-1 lg:mt-4 text-slate-600">
                            우리 둘만의 특별한 공간
                        </span>
                    </h1>

                    <p className="hidden lg:block text-lg text-slate-600 font-medium leading-relaxed max-w-lg animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                        가장 소중한 순간을 기록하고 공유하세요.<br />
                        서로의 하루를 다정하게 나누는 곳.
                    </p>

                    {/* Features Grid (Sky Theme) */}
                    <div className="hidden lg:grid grid-cols-3 gap-4 mt-16 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                        {features.map((f, i) => (
                            <div key={i} className="group p-5 rounded-2xl bg-white/40 border border-white/60 backdrop-blur-sm shadow-sm hover:bg-white/70 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-default">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-indigo-500 mb-3 group-hover:scale-110 transition-transform shadow-inner">
                                    <Icon name={f.icon} size={20} />
                                </div>
                                <h3 className="font-bold text-slate-800 text-sm mb-1">{f.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. Right Side (Glass/Clean Form) */}
            <div className="relative w-full lg:w-5/12 min-h-[62vh] lg:h-auto bg-white/90 lg:bg-white/80 backdrop-blur-3xl flex flex-col items-center justify-center p-6 lg:p-12 z-20 rounded-t-[2rem] lg:rounded-none lg:rounded-l-[3.5rem] shadow-[0_-10px_60px_-15px_rgba(0,0,0,0.1)] lg:shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.05)]">
                <div className="w-full max-w-[380px] animate-fadeIn">

                    {/* Feedback Toast */}
                    {(error || success) && (
                        <div className={`mb-6 p-4 rounded-2xl text-sm font-bold text-center animate-shake flex items-center justify-center gap-3 shadow-lg backdrop-blur-md ${error ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                            <Icon name={error ? "alert-circle" : "check-circle"} size={20} />
                            <span>{error || success}</span>
                        </div>
                    )}

                    {mode === 'login' && (
                        <div className="space-y-6 lg:space-y-8">
                            <div className="text-center lg:text-left mt-2 lg:mt-0">
                                <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight mb-1 lg:mb-2">Welcome!</h2>
                                <p className="text-sm lg:text-base text-slate-500 font-medium">오늘도 당신의 이야기를 들려주세요.</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4 lg:space-y-5">
                                <div className="space-y-3 lg:space-y-4">
                                    <div className="group relative transition-all">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <Icon name="mail" size={20} />
                                        </div>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                            className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-2xl py-3.5 lg:py-4 pl-12 pr-4 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-400 text-sm lg:text-base"
                                            placeholder="이메일" />
                                    </div>
                                    <div className="group relative transition-all">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <Icon name="lock" size={20} />
                                        </div>
                                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                            className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-2xl py-3.5 lg:py-4 pl-12 pr-4 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-400 text-sm lg:text-base"
                                            placeholder="비밀번호" />
                                        <button type="button" onClick={() => setMode('forgot-password')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] lg:text-xs font-bold text-sky-500 hover:text-sky-700 transition-colors px-2 py-1 rounded-md hover:bg-sky-50 whitespace-nowrap">
                                            비밀번호 찾기
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full py-4 rounded-xl relative overflow-hidden bg-slate-800 text-white font-bold text-lg hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group">
                                    <span className="relative flex items-center justify-center gap-2">
                                        {loading ? <Icon name="loader" className="animate-spin" /> : '로그인'}
                                        {!loading && <Icon name="arrow-right" size={18} className="group-hover:translate-x-1 transition-transform" />}
                                    </span>
                                </button>
                            </form>

                            <div className="pt-2">
                                <div className="relative flex py-2 items-center mb-6">
                                    <div className="flex-grow border-t border-slate-100"></div>
                                    <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest">Or continue with</span>
                                    <div className="flex-grow border-t border-slate-100"></div>
                                </div>

                                <button onClick={handleGoogleLogin} disabled={loading}
                                    className="w-full py-3.5 lg:py-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-slate-600 flex items-center justify-center gap-3 relative overflow-hidden active:scale-[0.98] text-sm lg:text-base">
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
                                    <span>Google 계정으로 시작</span>
                                </button>

                                <div className="text-center mt-6 lg:mt-8">
                                    <p className="text-xs lg:text-sm text-slate-400 mb-2">아직 계정이 없으신가요?</p>
                                    <button onClick={() => { resetForm(); setMode('signup'); }} className="text-indigo-600 font-black text-sm hover:text-indigo-800 transition-colors hover:underline underline-offset-4 decoration-2">
                                        30초 만에 회원가입
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Signup Mode */}
                    {mode === 'signup' && (
                        <div className="space-y-6 animate-fadeInRight">
                            <div>
                                <button onClick={() => { resetForm(); setMode('login'); }} className="mb-6 lg:mb-8 text-slate-400 hover:text-slate-600 flex items-center gap-2 text-sm font-bold transition-colors group">
                                    <Icon name="arrow-left" size={16} className="group-hover:-translate-x-1 transition-transform" /> 로그인으로 돌아가기
                                </button>
                                <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">회원가입</h2>
                                <p className="text-sm lg:text-base text-slate-500 font-medium mt-1">우리 둘만의 공간을 만들어보세요.</p>
                            </div>

                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-3">
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} required
                                        className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-2xl px-5 py-3.5 outline-none font-semibold placeholder:text-slate-400 transition-all text-sm lg:text-base"
                                        placeholder="이름 (닉네임)" />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                        className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-2xl px-5 py-3.5 outline-none font-semibold placeholder:text-slate-400 transition-all text-sm lg:text-base"
                                        placeholder="이메일" />
                                    <div className="flex gap-2">
                                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                            className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-2xl px-5 py-3.5 outline-none font-semibold placeholder:text-slate-400 transition-all text-xs lg:text-sm"
                                            placeholder="비밀번호 (6자리↑)" />
                                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                                            className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-2xl px-5 py-3.5 outline-none font-semibold placeholder:text-slate-400 transition-all text-xs lg:text-sm"
                                            placeholder="비밀번호 확인" />
                                    </div>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.98] transition-all">
                                    {loading ? <Icon name="loader" className="animate-spin" /> : '가입 완료하고 시작하기 ✨'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Forgot Password Mode */}
                    {(mode === 'forgot-password' || mode === 'verify-sent') && (
                        <div className="animate-fadeInRight text-center py-4">
                            <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                                <Icon name={mode === 'verify-sent' ? 'mail-check' : 'key'} size={32} />
                            </div>
                            <h2 className="text-2xl font-bold mb-3 text-slate-800">{mode === 'verify-sent' ? '메일함 확인' : '비밀번호 찾기'}</h2>
                            <p className="text-sm text-slate-500 mb-8 max-w-[240px] mx-auto leading-relaxed">
                                {mode === 'verify-sent' ? `${email}로 링크를 보냈어요.` : '가입하신 이메일 주소를 알려주세요.'}
                            </p>

                            {mode === 'forgot-password' && (
                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 rounded-2xl px-5 py-4 outline-none font-semibold text-center placeholder:text-slate-400 transition-all"
                                        placeholder="name@example.com" />
                                    <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-slate-800 text-white font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl">
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

            {/* 🛡️ 인앱 브라우저 경고 모달 (iOS용) */}
            {showInAppAlert && (
                <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center p-6 text-white text-center">
                    <div className="animate-bounce mb-8">
                        <Icon name="arrow-up-right" size={48} className="text-yellow-400 rotate-45" />
                    </div>

                    <h2 className="text-2xl font-bold mb-4 leading-normal">
                        더 원활한 사용을 위해<br />
                        <span className="text-yellow-400">Safari</span>로 열어주세요!
                    </h2>

                    <p className="text-white/80 mb-8 leading-relaxed max-w-xs mx-auto text-sm">
                        현재 브라우저 보안 정책으로 인해<br />
                        로그인이 제한될 수 있습니다.<br /><br />
                        오른쪽 하단(또는 상단)의 <span className="inline-block p-1 bg-gray-700 rounded mx-1"><Icon name="more-horizontal" size={12} className="inline" /></span> 버튼을 누르고<br />
                        <span className="font-bold text-white bg-blue-500 px-2 py-0.5 rounded mx-1">Safari로 열기</span>를 선택해주세요.
                    </p>

                    <button
                        onClick={() => setShowInAppAlert(false)}
                        className="text-white/50 text-xs underline mt-4"
                    >
                        안내 닫기 (로그인 시도해보기)
                    </button>

                    {/* 상단 화살표 가이드 (절대적 위치 시도) */}
                    <div className="absolute top-4 right-6 animate-pulse text-yellow-400">
                        <Icon name="arrow-up" size={32} />
                    </div>
                    <div className="absolute bottom-6 right-6 animate-pulse text-yellow-400">
                        <Icon name="arrow-down" size={32} />
                    </div>
                </div>
            )}

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
