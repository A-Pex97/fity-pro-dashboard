import { useState, useEffect } from 'react';
import { Users, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { authHeaders } from '../auth';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Mock Interface
interface Trainee {
    id: number;
    name: string;
    phone: string;
    status: 'active' | 'inactive';
    churnRisk: 'High' | 'Medium' | 'Low';
    recentScores: number[]; // e.g [3, 4, 5, 2, 4]
}

// Simple Sparkline Component utilizing flex bars
function Sparkline({ scores }: { scores: number[] }) {
    if (!scores || scores.length === 0) return <span className="text-gray-500 text-xs">No data</span>;

    return (
        <div className="flex items-end gap-1 h-6">
            {scores.map((score, i) => {
                // Height percentage (score 1-5 = 20%-100%)
                const height = `${score * 20}%`;
                // Color intensity based on score (1=red/low energy, 5=green/high energy)
                const colorClass = score <= 2 ? 'bg-red-400' : score === 3 ? 'bg-yellow-400' : 'bg-emerald-400';

                return (
                    <div
                        key={i}
                        style={{ height }}
                        className={cn("w-1.5 rounded-t-sm opacity-80", colorClass)}
                        title={`Score: ${score}`}
                    />
                );
            })}
        </div>
    );
}

function ChurnBadge({ risk }: { risk: Trainee['churnRisk'] }) {
    const styles = {
        High: 'bg-red-500/10 text-red-500 border-red-500/20',
        Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        Low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };

    const icons = {
        High: <AlertTriangle className="w-3 h-3 mr-1" />,
        Medium: <Activity className="w-3 h-3 mr-1" />,
        Low: <CheckCircle2 className="w-3 h-3 mr-1" />,
    };

    return (
        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", styles[risk])}>
            {icons[risk]}
            {risk}
        </span>
    );
}

const MOCK: Trainee[] = [
    { id: 1, name: 'Alex Johnson', phone: '+972501112222', status: 'active', churnRisk: 'Low', recentScores: [4, 5, 4, 3, 5] },
    { id: 2, name: 'Sarah Miller', phone: '+972503334444', status: 'active', churnRisk: 'Medium', recentScores: [3, 2, 3, 4, 3] },
    { id: 3, name: 'David Cohen', phone: '+972505556666', status: 'inactive', churnRisk: 'High', recentScores: [1, 2, 1, 1] },
];

export default function Trainees() {
    const [trainees, setTrainees] = useState<Trainee[]>([]);
    const [loading, setLoading] = useState(true);
    const API = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${API}/api/coach/trainees`, {
                    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                });
                setTrainees(res.ok ? await res.json() : MOCK);
            } catch { setTrainees(MOCK); }
            finally { setLoading(false); }
        }
        load();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-accent-blue" />
                        My Trainees
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Manage athletes, monitor churn, and review 1-5 feeling logs.</p>
                </div>
                <button className="bg-accent-blue hover:bg-accent-blue/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-accent-blue/20">
                    + Add Trainee
                </button>
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-dark-border">
                        <thead className="bg-dark-bg/40">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Athlete
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Churn Risk
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Energy Trend (Last 5)
                                </th>
                                <th scope="col" className="relative px-6 py-4">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border bg-transparent">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                                        Loading roster...
                                    </td>
                                </tr>
                            ) : trainees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                                        No trainees found. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                trainees.map((person) => (
                                    <tr key={person.id} className="hover:bg-dark-border/10 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr from-accent-blue/20 to-accent-indigo/20 flex items-center justify-center border border-accent-blue/30">
                                                    <span className="text-sm font-bold text-accent-blue">
                                                        {person.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-white">{person.name}</div>
                                                    <div className="text-sm text-gray-400">{person.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                                                person.status === 'active' ? "bg-emerald-400/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"
                                            )}>
                                                {person.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <ChurnBadge risk={person.churnRisk} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Sparkline scores={person.recentScores} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <a href="#" className="text-accent-blue hover:text-accent-blue/80 transition-colors">
                                                View Plan
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
