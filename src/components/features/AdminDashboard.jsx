import React, { useEffect, useState } from 'react';
import { getAllCouples, getAllUsers } from '../../services/db';
import Icon from '../ui/Icon';

const AdminDashboard = ({ onSelectCouple }) => {
    const [couples, setCouples] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cData, uData] = await Promise.all([getAllCouples(), getAllUsers()]);
                setCouples(cData);
                setUsers(uData);
            } catch (error) {
                console.error("Admin Fetch Error:", error);
                alert("데이터를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Enrich couple data against users
    const enrichedCouples = couples.map(couple => {
        const coupleUsers = users.filter(u => u.coupleId === couple.id);
        return { ...couple, members: coupleUsers };
    });

    if (loading) return <div className="p-10 text-center">데이터 불러오는 중...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
                        <span className="text-4xl">👮‍♂️</span> 관리자 모니터링
                    </h1>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm font-bold text-gray-600">
                        총 {enrichedCouples.length}쌍의 커플
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrichedCouples.map(couple => (
                        <div key={couple.id}
                            onClick={() => onSelectCouple(couple.id)}
                            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-theme-500 group relative overflow-hidden">

                            <div className="absolute top-0 right-0 bg-theme-50 text-theme-600 px-3 py-1 rounded-bl-xl text-xs font-bold font-mono">
                                {couple.inviteCode || 'N/A'}
                            </div>

                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-theme-600 transition-colors">
                                    {couple.coupleName || '이름 없음'}
                                </h3>
                                <p className="text-sm text-gray-500">기념일: {couple.anniversaryDate || '미설정'}</p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-3 mb-4">
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="font-bold text-gray-600">구성원</span>
                                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs font-bold">{couple.members.length}명</span>
                                </div>
                                {couple.members.length > 0 ? (
                                    <ul className="space-y-1">
                                        {couple.members.map(u => (
                                            <li key={u.id} className="text-gray-700 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                                {u.name} <span className="text-xs text-gray-400">({u.email})</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400 text-sm">연결된 사용자 없음</p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <span className="text-theme-500 font-bold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    모니터링 하기 <Icon name="arrow-right" size={16} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
