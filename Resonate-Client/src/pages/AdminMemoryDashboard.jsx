import React, { useEffect, useState } from 'react';
import { fetchAdminStats, fetchAdminInsights, fetchUserAdminMemory, addMemoryManual, deleteMemory } from '../api';

const AdminMemoryDashboard = () => {
    const [stats, setStats] = useState(null);
    const [insights, setInsights] = useState([]);
    const [userIdInput, setUserIdInput] = useState('');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Manual Memory Add State
    const [newMemoryText, setNewMemoryText] = useState('');
    const [newMemoryCategory, setNewMemoryCategory] = useState('user.defined');
    const [addingMemory, setAddingMemory] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const statsData = await fetchAdminStats();
            setStats(statsData.stats);

            const insightsData = await fetchAdminInsights();
            setInsights(insightsData.insights || []); // Expecting array
        } catch (err) {
            console.error("Failed to load dashboard data", err);
        }
    };

    const handleUserSearch = async (e) => {
        e.preventDefault();
        if (!userIdInput) return;

        setLoading(true);
        setError(null);
        setUserData(null);

        try {
            const data = await fetchUserAdminMemory(userIdInput);
            setUserData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMemory = async (e) => {
        e.preventDefault();
        if (!userData || !newMemoryText) return;

        setAddingMemory(true);
        try {
            const targetUserId = userData.memoryUserId || userData.userId;
            await addMemoryManual(targetUserId, {
                text: newMemoryText,
                metadata: { category: newMemoryCategory, source: 'admin_manual' }
            });

            // Refresh list
            const data = await fetchUserAdminMemory(targetUserId);
            setUserData(data);
            setNewMemoryText('');
            setNewMemoryCategory('user.defined');
        } catch (err) {
            alert("Failed to add memory: " + err.message);
        } finally {
            setAddingMemory(false);
        }
    };

    const handleDeleteMemory = async (memoryId) => {
        if (!window.confirm("Are you sure you want to delete this memory?")) return;

        try {
            await deleteMemory(memoryId);
            // Refresh list
            const targetUserId = userData.memoryUserId || userData.userId;
            const data = await fetchUserAdminMemory(targetUserId);
            setUserData(data);
        } catch (err) {
            alert("Failed to delete memory: " + err.message);
        }
    };

    return (
        <div className="min-h-screen p-6 pb-24" style={{ background: "linear-gradient(135deg, #EEF5E0 0%, #EAF0F8 45%, #F3EEF5 100%)" }}>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 ml-2">
                    <h1 className="text-4xl font-black mb-2" style={{ color: "#1A1A18" }}>
                        Memory Layer Admin
                    </h1>
                    <p className="font-medium" style={{ color: "rgba(26,26,24,0.55)" }}>Manage user memories and view system insights</p>
                </header>

                {/* Connectivity Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="glass-card rounded-3xl p-6 border-l-4 border-l-emerald-500 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
                        </div>
                        <h3 className="text-sm uppercase text-slate-400 font-bold tracking-wider mb-2">System Status</h3>
                        <p className="text-3xl font-black text-emerald-400">{stats?.system_status || 'Checking...'}</p>
                    </div>

                    <div className="glass-card rounded-3xl p-6 border-l-4 border-l-indigo-500 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>
                        </div>
                        <h3 className="text-sm uppercase text-slate-400 font-bold tracking-wider mb-2">Total Memories</h3>
                        <p className="text-3xl font-black text-indigo-400">{stats?.total_memories || '-'}</p>
                    </div>

                    <div className="glass-card rounded-3xl p-6 border-l-4 border-l-blue-500 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>
                        </div>
                        <h3 className="text-sm uppercase text-slate-400 font-bold tracking-wider mb-2">Last Updated</h3>
                        <p className="text-lg font-bold text-blue-400">{stats?.last_updated ? new Date(stats.last_updated).toLocaleString() : '-'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* User Inspector */}
                    <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: "#1A1A18" }}>
                            <span>🔍</span> User Memory Inspector
                        </h2>

                        <form onSubmit={handleUserSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
                            <input
                                type="text"
                                placeholder="Enter Firebase UID, Email, or Mongo User ID"
                                className="flex-1 glass-card rounded-xl px-4 py-3 focus:outline-none transition-all"
                                style={{ color: "#1A1A18", border: "1px solid rgba(26,26,24,0.15)" }}
                                value={userIdInput}
                                onChange={(e) => setUserIdInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="font-bold px-8 py-3 rounded-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                style={{ background: "linear-gradient(135deg, #CADB00 0%, #B8C900 100%)", color: "#1A1A18" }}
                            >
                                {loading ? 'Fetching...' : 'Inspect'}
                            </button>
                        </form>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {error}
                            </div>
                        )}

                        {userData && (
                            <div className="animate-fadeIn">
                                <div className="flex flex-wrap justify-between items-center mb-6 gap-4 pb-6 border-b border-slate-700/50">
                                    <h3 className="font-bold text-xl text-slate-200">Memory Timeline <span className="text-indigo-400">({userData.count})</span></h3>
                                    <span className="text-xs font-mono bg-slate-900 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-700">{userData.userId}</span>
                                </div>

                                {/* Add Memory Form */}
                                <form onSubmit={handleAddMemory} className="mb-8 bg-slate-900/40 p-5 rounded-2xl border border-dashed border-slate-700 hover:border-indigo-500/30 transition-colors">
                                    <div className="flex items-center gap-2 mb-4 text-emerald-400 font-bold text-sm uppercase tracking-wide">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                        Add Manual Memory
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <input
                                            type="text"
                                            value={newMemoryCategory}
                                            onChange={(e) => setNewMemoryCategory(e.target.value)}
                                            placeholder="Category (e.g. user.defined)"
                                            className="w-full sm:w-1/3 glass-card bg-slate-950/50 border-slate-700 text-slate-300 text-sm rounded-xl px-4 py-2 focus:border-emerald-500/50 focus:outline-none transition-colors"
                                        />
                                        <div className="flex gap-3">
                                            <textarea
                                                value={newMemoryText}
                                                onChange={(e) => setNewMemoryText(e.target.value)}
                                                placeholder="Enter memory text..."
                                                className="flex-1 glass-card bg-slate-950/50 border-slate-700 text-slate-300 text-sm rounded-xl px-4 py-3 focus:border-emerald-500/50 focus:outline-none transition-colors min-h-[80px]"
                                            />
                                            <button
                                                type="submit"
                                                disabled={addingMemory}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-6 rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 transition-all self-end h-[80px]"
                                            >
                                                {addingMemory ? '...' : 'Add'}
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                    {userData.memories && userData.memories.length > 0 ? (
                                        userData.memories.map((mem) => (
                                            <div key={mem.id} className="group relative glass-card p-5 rounded-2xl border-l-4 border-l-indigo-500 hover:bg-white/5 transition-all duration-300 hover:translate-x-1">
                                                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDeleteMemory(mem.id)}
                                                        className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/20 transition-all flex items-center gap-1"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        DELETE
                                                    </button>
                                                </div>
                                                <p className="text-slate-200 text-lg font-medium leading-relaxed mb-3 pr-16">{mem.memory}</p>
                                                <div className="flex flex-wrap gap-2 items-center text-xs">
                                                    <span className="text-slate-500 font-mono flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        {new Date(mem.created_at).toLocaleString()}
                                                    </span>
                                                    {mem.metadata?.category && (
                                                        <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-md">
                                                            {mem.metadata.category}
                                                        </span>
                                                    )}
                                                    {mem.metadata?.data_source && (
                                                        <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-md">
                                                            {mem.metadata.data_source}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                                            <p className="text-slate-500 italic">No memories found for this user.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recent Insights Stream */}
                    <div className="glass-card rounded-3xl p-6 h-fit">
                        <h2 className="text-xl font-bold mb-6 text-slate-50 flex items-center gap-2">
                            <span className="animate-pulse text-amber-500">⚡</span> Live Insights
                        </h2>
                        <div className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
                            {insights.length > 0 ? (
                                insights.map((insight, idx) => (
                                    <div key={idx} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-slate-600 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${insight.type === 'warning' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                insight.type === 'positive' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                {insight.type}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-200 mb-1">{insight.title}</h4>
                                        <p className="text-sm text-slate-400 leading-relaxed">{insight.message}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-sm italic text-center py-8">No recent insights generated stream available yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMemoryDashboard;

