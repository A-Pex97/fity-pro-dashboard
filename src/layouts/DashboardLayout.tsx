import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for cleaner tailwind class merging
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const SIDEBAR_LINKS = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Trainees', icon: Users, path: '/trainees' },
    { name: 'Payouts', icon: CreditCard, path: '/payouts' },
    { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function DashboardLayout() {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-dark-bg text-gray-100 overflow-hidden font-inter">
            {/* Sidebar */}
            <aside className="w-64 border-r border-dark-border bg-dark-panel flex flex-col justify-between">
                <div>
                    <div className="h-16 flex items-center px-6 border-b border-dark-border">
                        <span className="text-xl font-bold bg-gradient-to-r from-accent-blue to-accent-indigo bg-clip-text text-transparent">
                            Fity Pro
                        </span>
                    </div>

                    <nav className="p-4 space-y-1 mt-4">
                        {SIDEBAR_LINKS.map((link) => {
                            const isActive = location.pathname.startsWith(link.path);
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                        isActive
                                            ? 'bg-accent-blue/10 text-accent-blue'
                                            : 'text-gray-400 hover:text-gray-200 hover:bg-dark-border/50'
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-dark-border">
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto w-full relative">
                <div className="p-8 max-w-7xl mx-auto h-full w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
