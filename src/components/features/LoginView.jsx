import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Icon from '../ui/Icon';

const LoginView = () => {
    const { login, signup, loginWithGoogle, setAdminMode } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Admin Login Check
                if (email === 'admin' && password === '296800') {
                    setAdminMode(true);
                    return; // Skip Firebase auth
                }
                await login(email, password);
            } else {
                if (!name) throw new Error('이름을 입력해주세요.');
                await signup(email, password, name);
            }
        } catch (err) {
            console.error(err);
            let msg = err.message;
            if (msg.includes('auth/email-already-in-use')) msg = '이미 사용 중인 이메일입니다.';
            else if (msg.includes('auth/weak-password')) msg = '비밀번호는 6자리 이상이어야 합니다.';
            else if (msg.includes('auth/invalid-email')) msg = '유효하지 않은 이메일 형식입니다.';
            else if (msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) msg = '이메일 또는 비밀번호가 일치하지 않습니다.';
            else if (msg.includes('api-key')) msg = 'Firebase API 키 설정 오류입니다 (.env 확인 필요)';

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-50 to-blue-50">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 animate-scaleIn">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 gradient-theme rounded-3xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
                        <Icon name="heart" size={40} fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Story</h1>
                    <p className="text-gray-500">우리만의 특별한 공간</p>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm rounded-xl text-center font-medium animate-shake break-keep">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">이름 (닉네임)</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-theme-300 rounded-xl px-4 py-3 outline-none transition-all"
                                placeholder="예: 우진" required />
                        </div>
                    )}

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
                            placeholder={isLogin ? "비밀번호 입력" : "6자리 이상 입력"} required minLength={6} />
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-4 rounded-xl gradient-theme text-white font-bold text-lg shadow-lg btn-bounce mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? '처리 중...' : (isLogin ? '로그인하기' : '새로 시작하기')}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">또는</span></div>
                </div>

                <button onClick={async () => {
                    try { setLoading(true); await loginWithGoogle(); }
                    catch (e) { console.error(e); setError('Google 로그인 실패: ' + e.message); setLoading(false); }
                }} className="w-full py-4 rounded-xl border-2 border-gray-100 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all text-gray-700 font-bold mb-4 btn-bounce">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
                    Google로 계속하기
                </button>

                <div className="mt-8 text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-gray-400 hover:text-theme-500 font-medium text-sm transition-colors">
                        {isLogin ? '아직 계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
