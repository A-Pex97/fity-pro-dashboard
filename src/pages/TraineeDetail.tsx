import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Dumbbell, TrendingUp, Calendar, User, Flame } from 'lucide-react';
import { authHeaders } from '../auth';

const API = import.meta.env.VITE_API_URL || '';

interface TraineeProfile {
    id: number;
    name: string;
    phone: string;
    current_streak: number;
    total_workouts: number;
    compliance_score: number;
    fitness_profile: Record<string, string>;
    has_plan: boolean;
    workout_plan?: string;
}

interface ProgressEntry {
    exercise: string;
    muscle_group: string;
    data_points: { date: string; weight: number; reps: number }[];
}

interface AttendanceWeek {
    week_label: string;
    workouts: number;
    expected: number;
}

interface Exercise {
    id: number;
    name: string;
    muscle_group: string;
    category: string;
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
    return (
        <div className="glass-panel p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-accent-blue" />
            </div>
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
                {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function ProgressChart({ entries }: { entries: ProgressEntry[] }) {
    if (!entries || entries.length === 0)
        return <p className="text-gray-500 text-sm py-4">No progress data yet.</p>;

    return (
        <div className="space-y-4">
            {entries.slice(0, 5).map((entry) => {
                const latest = entry.data_points?.[entry.data_points.length - 1];
                const first = entry.data_points?.[0];
                const diff = latest && first ? latest.weight - first.weight : 0;
                return (
                    <div key={entry.exercise} className="flex items-center justify-between p-4 bg-dark-bg/40 rounded-xl border border-dark-border">
                        <div>
                            <p className="text-sm font-semibold text-white">{entry.exercise}</p>
                            <p className="text-xs text-gray-500">{entry.muscle_group} · {entry.data_points?.length ?? 0} sessions</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-white">{latest?.weight ?? '—'} kg</p>
                            <p className={`text-xs font-medium ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                {diff > 0 ? `+${diff}` : diff} kg since start
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function AttendanceGrid({ weeks }: { weeks: AttendanceWeek[] }) {
    if (!weeks || weeks.length === 0)
        return <p className="text-gray-500 text-sm py-4">No attendance data yet.</p>;

    return (
        <div className="grid grid-cols-6 gap-2">
            {weeks.slice(-12).map((w, i) => {
                const pct = w.expected > 0 ? (w.workouts / w.expected) : 0;
                const color = pct >= 0.8 ? 'bg-emerald-500' : pct >= 0.5 ? 'bg-yellow-500' : pct > 0 ? 'bg-red-500' : 'bg-dark-border';
                return (
                    <div key={i} className="text-center" title={`${w.week_label}: ${w.workouts}/${w.expected}`}>
                        <div className={`w-full h-8 rounded ${color} opacity-80`} />
                        <p className="text-xs text-gray-500 mt-1 truncate">{w.week_label?.slice(5)}</p>
                    </div>
                );
            })}
        </div>
    );
}

function ExerciseLibrary({ exercises }: { exercises: Exercise[] }) {
    const [search, setSearch] = useState('');
    const filtered = exercises.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.muscle_group.toLowerCase().includes(search.toLowerCase())
    );

    const groups = filtered.reduce<Record<string, Exercise[]>>((acc, ex) => {
        const g = ex.muscle_group || 'Other';
        if (!acc[g]) acc[g] = [];
        acc[g].push(ex);
        return acc;
    }, {});

    return (
        <div className="space-y-4">
            <input
                type="text"
                placeholder="Search exercises..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-bg/50 border border-dark-border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
            {Object.keys(groups).length === 0 ? (
                <p className="text-gray-500 text-sm">No exercises found.</p>
            ) : (
                Object.entries(groups).map(([group, exs]) => (
                    <div key={group}>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{group}</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {exs.map(ex => (
                                <div key={ex.id} className="px-3 py-2 bg-dark-bg/40 border border-dark-border rounded-lg text-sm text-white hover:border-accent-blue/50 transition-colors cursor-default">
                                    {ex.name}
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

type Tab = 'overview' | 'progress' | 'attendance' | 'exercises';

export default function TraineeDetail() {
    const { id } = useParams<{ id: string }>();
    const [tab, setTab] = useState<Tab>('overview');
    const [profile, setProfile] = useState<TraineeProfile | null>(null);
    const [progress, setProgress] = useState<ProgressEntry[]>([]);
    const [attendance, setAttendance] = useState<AttendanceWeek[]>([]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const h = { 'Content-Type': 'application/json', ...authHeaders() };
            try {
                const [profileRes, progressRes, attendanceRes, exercisesRes] = await Promise.all([
                    fetch(`${API}/api/coach/trainee/${id}/profile`, { headers: h }),
                    fetch(`${API}/api/coach/trainee/${id}/progress`, { headers: h }),
                    fetch(`${API}/api/coach/trainee/${id}/attendance`, { headers: h }),
                    fetch(`${API}/api/coach/exercises`, { headers: h }),
                ]);

                if (profileRes.ok) {
                    const j = await profileRes.json();
                    setProfile(j.data ?? j);
                }
                if (progressRes.ok) {
                    const j = await progressRes.json();
                    setProgress(j.data?.exercises ?? j.data ?? []);
                }
                if (attendanceRes.ok) {
                    const j = await attendanceRes.json();
                    setAttendance(j.data?.weeks ?? j.data ?? []);
                }
                if (exercisesRes.ok) {
                    const j = await exercisesRes.json();
                    setExercises(j.data?.exercises ?? j.data ?? []);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const TABS: { key: Tab; label: string; icon: any }[] = [
        { key: 'overview', label: 'Overview', icon: User },
        { key: 'progress', label: 'Progress', icon: TrendingUp },
        { key: 'attendance', label: 'Attendance', icon: Calendar },
        { key: 'exercises', label: 'Exercise Library', icon: Dumbbell },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/trainees" className="p-2 rounded-lg hover:bg-dark-border/50 transition-colors text-gray-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Dumbbell className="w-6 h-6 text-accent-blue" />
                        {loading ? 'Loading...' : (profile?.name ?? `Trainee #${id}`)}
                    </h1>
                    <p className="text-gray-400 text-sm">{profile?.phone}</p>
                </div>
            </div>

            {/* Stats */}
            {profile && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={Flame} label="Streak" value={`${profile.current_streak} days`} />
                    <StatCard icon={Dumbbell} label="Total Workouts" value={profile.total_workouts} />
                    <StatCard icon={TrendingUp} label="Compliance" value={`${profile.compliance_score}%`} />
                    <StatCard icon={Calendar} label="Has Plan" value={profile.has_plan ? 'Yes ✅' : 'No ❌'} />
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-dark-border flex gap-1">
                {TABS.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                            tab === t.key
                                ? 'border-accent-blue text-accent-blue'
                                : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}>
                        <t.icon className="w-4 h-4" />{t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="glass-panel p-6">
                {tab === 'overview' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Fitness Profile</h3>
                        {profile?.fitness_profile && Object.keys(profile.fitness_profile).length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(profile.fitness_profile).map(([k, v]) => (
                                    <div key={k} className="p-3 bg-dark-bg/40 rounded-lg border border-dark-border">
                                        <p className="text-xs text-gray-500 capitalize">{k.replace(/_/g, ' ')}</p>
                                        <p className="text-sm font-medium text-white mt-0.5">{String(v)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No fitness profile data yet.</p>
                        )}
                    </div>
                )}
                {tab === 'progress' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Exercise Weight Progression</h3>
                        <ProgressChart entries={progress} />
                    </div>
                )}
                {tab === 'attendance' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Weekly Attendance (Last 12 Weeks)</h3>
                        <div className="flex gap-4 text-xs text-gray-400 mb-2">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> ≥80%</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500 inline-block" /> 50–79%</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> &lt;50%</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-dark-border inline-block" /> None</span>
                        </div>
                        <AttendanceGrid weeks={attendance} />
                    </div>
                )}
                {tab === 'exercises' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Exercise Library</h3>
                        <p className="text-gray-400 text-sm">{exercises.length} exercises available</p>
                        <ExerciseLibrary exercises={exercises} />
                    </div>
                )}
            </div>
        </div>
    );
}
