import { useState, useEffect } from 'react';
import { Activity, Bot, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { authHeaders } from '../auth';

const API = import.meta.env.VITE_API_URL || '';

interface ApiCallEntry {
    id: number;
    user_phone: string;
    api_type: string;
    model: string;
    tokens: number;
    cost_estimate: number;
    timestamp: string | null;
}

interface AgentActionEntry {
    id: number;
    agent_name: string;
    action: string;
    result: string;
    success: boolean;
    timestamp: string | null;
}

interface LogsData {
    api_logs: ApiCallEntry[];
    agent_logs: AgentActionEntry[];
}

type Tab = 'ai_calls' | 'agent_actions';

function formatTs(ts: string | null): string {
    if (!ts) return '—';
    try {
        return new Date(ts).toLocaleString();
    } catch {
        return ts;
    }
}

export default function ActivityLogs() {
    const [data, setData] = useState<LogsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>('ai_calls');

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${API}/api/coach/logs`, {
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
            <p className="text-gray-400 text-sm">Loading activity logs...</p>
        </div>
    );

    if (error) return (
        <div className="glass-panel p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 text-sm">{error}</p>
        </div>
    );

    const TABS: { key: Tab; label: string; icon: any; count: number }[] = [
        { key: 'ai_calls', label: 'AI Calls', icon: Bot, count: data?.api_logs?.length ?? 0 },
        { key: 'agent_actions', label: 'Agent Actions', icon: Activity, count: data?.agent_logs?.length ?? 0 },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-6 h-6 text-accent-blue" />
                    Activity Logs
                </h1>
                <p className="text-gray-400 text-sm mt-1">AI interactions and agent actions for your trainees.</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-dark-border flex gap-1">
                {TABS.map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                            tab === t.key
                                ? 'border-accent-blue text-accent-blue'
                                : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}>
                        <t.icon className="w-4 h-4" />
                        {t.label}
                        <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-dark-border text-gray-400">{t.count}</span>
                    </button>
                ))}
            </div>

            {/* AI Calls */}
            {tab === 'ai_calls' && (
                <div className="glass-panel overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-dark-border">
                            <thead className="bg-dark-bg/40">
                                <tr>
                                    {['Timestamp', 'Phone', 'Type', 'Model', 'Tokens', 'Cost (USD)'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-border">
                                {!data?.api_logs?.length ? (
                                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">No AI call logs yet.</td></tr>
                                ) : data.api_logs.map((row) => (
                                    <tr key={row.id} className="hover:bg-dark-border/10 transition-colors">
                                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatTs(row.timestamp)}</td>
                                        <td className="px-4 py-3 text-xs text-gray-300 font-mono">{row.user_phone}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-accent-blue/10 text-accent-blue">{row.api_type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-300 font-mono">{row.model}</td>
                                        <td className="px-4 py-3 text-xs text-gray-400">{row.tokens?.toLocaleString() ?? '—'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-400">${(row.cost_estimate ?? 0).toFixed(4)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Agent Actions */}
            {tab === 'agent_actions' && (
                <div className="glass-panel overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-dark-border">
                            <thead className="bg-dark-bg/40">
                                <tr>
                                    {['Timestamp', 'Agent', 'Action', 'Result', 'Status'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-border">
                                {!data?.agent_logs?.length ? (
                                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No agent action logs yet.</td></tr>
                                ) : data.agent_logs.map((row) => (
                                    <tr key={row.id} className="hover:bg-dark-border/10 transition-colors">
                                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatTs(row.timestamp)}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-accent-indigo/10 text-accent-indigo">{row.agent_name}</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-300 max-w-xs truncate" title={row.action}>{row.action}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate" title={row.result}>{row.result || '—'}</td>
                                        <td className="px-4 py-3">
                                            {row.success ? (
                                                <span className="flex items-center gap-1 text-xs text-emerald-400">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> OK
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-red-400">
                                                    <XCircle className="w-3.5 h-3.5" /> Failed
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
