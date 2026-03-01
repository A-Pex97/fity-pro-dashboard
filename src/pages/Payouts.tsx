import { useState, useEffect } from 'react';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import { ConnectComponentsProvider, ConnectPayouts } from '@stripe/react-connect-js';
import { CreditCard, Loader2 } from 'lucide-react';

export default function Payouts() {
    const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchClientSecret = async () => {
        // Backend creates an Account Session using the logged-in coach's connected stripe_account_id
        const response = await fetch('/stripe/connect/session', { method: 'POST' });
        if (!response.ok) {
            const { error } = await response.json();
            throw new Error(error || 'Failed to create Stripe Account Session');
        }
        const { client_secret } = await response.json();
        return client_secret;
    };

    useEffect(() => {
        async function initializeStripe() {
            try {
                setLoading(true);
                // Replace with actual publishable key loaded from Vite env
                const stripePk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_DEFAULT';

                const instance = await loadConnectAndInitialize({
                    publishableKey: stripePk,
                    fetchClientSecret,
                    appearance: {
                        overlays: 'dialog',
                        variables: {
                            colorPrimary: '#3b82f6', // Tailwind accent-blue
                            colorBackground: '#111827', // Tailwind dark-panel
                            colorText: '#f3f4f6',
                            colorDanger: '#ef4444',
                            fontFamily: 'Inter, sans-serif',
                            spacingUnit: '4px',
                            borderRadius: '8px',
                        },
                    },
                });

                setStripeConnectInstance(instance);
            } catch (err: any) {
                console.error('Stripe initialization error:', err);
                setError('Failed to securely connect to Stripe. Are you fully onboarded?');
            } finally {
                setLoading(false);
            }
        }

        initializeStripe();
    }, []);

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-accent-blue" />
                    Payouts & Earnings
                </h1>
                <p className="text-gray-400 text-sm mt-1">Manage your subscriptions and initiate manual payouts securely via Stripe.</p>
            </div>

            <div className="glass-panel overflow-hidden flex-1 relative min-h-[500px]">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
                        <span className="text-gray-400 font-medium">Securing connection to Stripe...</span>
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl max-w-md text-center">
                            <p className="font-semibold mb-1">Connection Error</p>
                            <p className="text-sm opacity-90">{error}</p>
                        </div>
                    </div>
                ) : stripeConnectInstance ? (
                    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
                        {/* The embedded Connect component rendering the native Stripe UI inside our layout */}
                        <div className="h-full w-full overflow-y-auto custom-scrollbar">
                            <ConnectPayouts />
                        </div>
                    </ConnectComponentsProvider>
                ) : null}
            </div>
        </div>
    );
}
