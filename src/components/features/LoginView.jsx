import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Icon from '../ui/Icon';

const LoginView = () => {
    const { login, signup } = useAuth();
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
                await login(email, password);
            } else {
                if (!name) throw new Error('이름을 입력해주세요.');
                await signup(email, password, name);
            }
        } catch (err) {
            console.error(err);
            setError(isLogin ? '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.' : '회원가입 중 오류가 발생했습니다. (비밀번호 6자리 이상)');
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

                {error && <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm rounded-xl text-center font-medium animate-shake">{error}</div>}

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
