import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Activity, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { authHeaders } from '../auth';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface Trainee {
    id: number;
    name: string;
    phone: string;
    current_streak: number;
    total_workouts: number;
    workouts_this_week: number;
    last_workout: string | null;
    days_inactive: number;
    has_plan: boolean;
    compliance_score: number;
    nutrition_compliance: number;
    workout_compliance: number;
}

function ComplianceBar({ value, color }: { value: number; color: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-dark-border rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
            </div>
            <span className="text-xs text-gray-400">{value}%</span>
        </div>
    );
}

function RiskBadge({ score }: { score: number }) {
    const risk = score >= 70 ? 'Low' : score >= 40 ? 'Medium' : 'High';
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
            {icons[risk]}{risk}
        </span>
    );
}

const MOCK: Trainee[] = [
    { id: 1, name: 'Alex Johnson', phone: '+972501112222', current_streak: 5, total_workouts: 42, workouts_this_week: 3, last_workout: '2026-03-24', days_inactive: 1, has_plan: true, compliance_score: 85, nutrition_compliance: 80, workout_compliance: 90 },
    { id: 2, name: 'Sarah Miller', phone: '+972503334444', current_streak: 2, total_workouts: 18, workouts_this_week: 1, last_workout: '2026-03-22', days_inactive: 3, has_plan: true, compliance_score: 55, nutrition_compliance: 60, workout_compliance: 50 },
    { id: 3, name: 'David Cohen', phone: '+972505556666', current_streak: 0, total_workouts: 7, workouts_this_week: 0, last_workout: null, days_inactive: 10, has_plan: false, compliance_score: 20, nutrition_compliance: 10, workout_compliance: 30 },
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
                if (res.ok) {
                    const json = await res.json();
                    setTrainees(json.data?.trainees ?? json);
                } else {
                    setTrainees(MOCK);
                }
            } catch {
                setTrainees(MOCK);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-accent-blue" />My Trainees
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Monitor compliance, streaks, and workout attendance.</p>
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
                                {['Athlete', 'Streak', 'This Week', 'Compliance', 'Churn Risk', ''].map(h => (
                                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border bg-transparent">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">Loading roster...</td></tr>
                            ) : trainees.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">No trainees found.</td></tr>
                            ) : trainees.map((t) => (
                                <tr key={t.id} className="hover:bg-dark-border/10 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr from-accent-blue/20 to-accent-indigo/20 flex items-center justify-center border border-accent-blue/30">
                                                <span className="text-sm font-bold text-accent-blue">{t.name.charAt(0)}</span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-white">{t.name}</div>
                                                <div className="text-xs text-gray-500">{t.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-accent-blue">🔥 {t.current_streak}</span>
                                        <div className="text-xs text-gray-500">{t.total_workouts} total</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={cn("text-sm font-semibold", t.workouts_this_week > 0 ? "text-emerald-400" : "text-red-400")}>
                                            {t.workouts_this_week} workouts
                                        </span>
                                        <div className="text-xs text-gray-500">
                                            {t.last_workout ? `Last: ${t.last_workout}` : 'Never'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap space-y-1">
                                        <ComplianceBar value={t.workout_compliance} color="bg-accent-blue" />
                                        <ComplianceBar value={t.nutrition_compliance} color="bg-accent-indigo" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <RiskBadge score={t.compliance_score} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <Link to={`/trainees/${t.id}`}
                                            className="inline-flex items-center gap-1 text-accent-blue hover:text-accent-blue/80 text-sm font-medium transition-colors">
                                            View <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
