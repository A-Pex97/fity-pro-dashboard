import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, KeyRound, Loader2, Dumbbell } from 'lucide-react';
import { setToken } from '../auth';

export default function Login() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const API = import.meta.env.VITE_API_URL || '';

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });

            if (!res.ok) throw new Error('Failed to send OTP. Is this a registered Coach number?');
            setStep('OTP');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API}/api/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp }),  // backend expects "otp"
            });

            if (!res.ok) throw new Error('Invalid OTP code');

            const data = await res.json();
            if (data.token) setToken(data.token);
            navigate('/trainees');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-inter">
            {/* Decorative background gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-indigo/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-tr from-accent-blue to-accent-indigo rounded-2xl flex items-center justify-center shadow-lg shadow-accent-blue/20">
                        <Dumbbell className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
                    Fity Pro Coach
                </h2>
                <p className="mt-2 text-center text-sm text-gray-400">
                    Enter your coach digits to access the dashboard
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="glass-panel py-8 px-4 sm:px-10">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {step === 'PHONE' ? (
                        <form className="space-y-6" onSubmit={handleSendOtp}>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                                    Phone Number
                                </label>
                                <div className="mt-2 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LogIn className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        placeholder="+972501234567"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-dark-border rounded-lg bg-dark-bg/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all sm:text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-accent-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:ring-offset-dark-bg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Magic OTP'}
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-6" onSubmit={handleVerifyOtp}>
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-300">
                                    One-Time Password
                                </label>
                                <p className="text-xs text-gray-500 mt-1 mb-2">Sent to {phone}</p>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        required
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-dark-border rounded-lg bg-dark-bg/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-indigo focus:border-transparent transition-all sm:text-sm tracking-widest font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent-indigo hover:bg-accent-indigo/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-indigo focus:ring-offset-dark-bg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('PHONE')}
                                    className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all"
                                >
                                    Back to phone number
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
