import { useState, useEffect } from 'react';
import { Users, Dumbbell, MessageSquare, TrendingUp, AlertTriangle, Activity, DollarSign } from 'lucide-react';
import { authHeaders } from '../auth';

const API = import.meta.env.VITE_API_URL || '';

interface ActivityItem {
    id: string;
    text: string;
    time: string;
    icon: string;
}

interface EngagementDay {
    day: string;
    engagement: number;
    sessions: number;
}

interface DashboardData {
    coach_name: string;
    active_trainees: number;
    total_trainees: number;
    weekly_workouts: number;
    messages_sent: number;
    avg_consistency: string;
    high_risk_count: number;
    total_mrr_usd: number;
    recent_activity: ActivityItem[];
    engagement: EngagementDay[];
}

function KpiCard({ icon: Icon, label, value, sub, color }: {
    icon: any; label: string; value: string | number; sub?: string; color?: string;
}) {
    return (
        <div className="glass-panel p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color ?? 'bg-accent-blue/10'}`}>
                <Icon className={`w-6 h-6 ${color ? 'text-white' : 'text-accent-blue'}`} />
            </div>
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
                {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function timeAgo(isoStr: string): string {
    if (!isoStr) return '';
    try {
        const diff = Date.now() - new Date(isoStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    } catch {
        return isoStr;
    }
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${API}/api/coach/dashboard`, {
                    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                });
                if (!res.ok) {
                    setError(`Server returned ${res.status}`);
                    return;
                }
                const json = await res.json();
                setData(json?.data ?? json);
            } catch (e: any) {
                setError(e?.message ?? 'Network error');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
    );

    if (error) return (
        <div className="glass-panel p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 text-sm">{error}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-6 h-6 text-accent-blue" />
                    Dashboard
                </h1>
                {data?.coach_name && (
                    <p className="text-gray-400 text-sm mt-1">Welcome back, {data.coach_name}</p>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={Users} label="Active Trainees" value={data?.active_trainees ?? 0}
                    sub={`${data?.total_trainees ?? 0} total`} />
                <KpiCard icon={Dumbbell} label="Weekly Workouts" value={data?.weekly_workouts ?? 0}
                    sub="last 7 days" />
                <KpiCard icon={MessageSquare} label="Messages Sent" value={data?.messages_sent ?? 0}
                    sub="last 7 days" />
                <KpiCard icon={TrendingUp} label="Avg Consistency" value={data?.avg_consistency ?? '0%'} />
            </div>

            {/* Risk + MRR row */}
            <div className="grid grid-cols-2 gap-4">
                <KpiCard icon={AlertTriangle} label="High Risk Trainees" value={data?.high_risk_count ?? 0}
                    sub="inactive 7+ days" color="bg-red-500/20" />
                <KpiCard icon={DollarSign} label="MRR (USD)" value={`$${(data?.total_mrr_usd ?? 0).toFixed(0)}`}
                    sub="from last payment" color="bg-emerald-500/20" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="glass-panel p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                    {!data?.recent_activity?.length ? (
                        <p className="text-gray-500 text-sm">No activity yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {data.recent_activity.map((item) => (
                                <li key={item.id} className="flex items-center justify-between gap-3 py-2 border-b border-dark-border last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
                                            <Dumbbell className="w-4 h-4 text-accent-blue" />
                                        </div>
                                        <span className="text-sm text-white">{item.text}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(item.time)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Engagement Timeline */}
                <div className="glass-panel p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Engagement (Last 30 Days)</h2>
                    {!data?.engagement?.length ? (
                        <p className="text-gray-500 text-sm">No engagement data yet.</p>
                    ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {[...data.engagement].reverse().map((e) => (
                                <div key={e.day} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 w-20 flex-shrink-0">{e.day.slice(5)}</span>
                                    <div className="flex-1 h-2 bg-dark-border rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent-blue rounded-full"
                                            style={{ width: `${Math.min(100, e.engagement)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-400 w-16 text-right">{e.sessions} sessions</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
