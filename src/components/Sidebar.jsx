import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Mail,
    Map,
    Database,
    Search,
    Users,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import logo from '../assets/logo.png';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Sidebar = () => {
    const { user, isAdmin, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        { name: 'Tableau de bord', icon: LayoutDashboard, path: '/', roles: ['admin', 'archiviste', 'consultant'] },
        { name: 'Courriers', icon: Mail, path: '/courriers', roles: ['admin', 'archiviste', 'consultant'] },
        { name: 'Lignes', icon: Map, path: '/lignes', roles: ['admin', 'archiviste', 'consultant'] },
        { name: 'Postes', icon: Database, path: '/postes', roles: ['admin', 'archiviste', 'consultant'] },
        { name: 'Recherche globale', icon: Search, path: '/search', roles: ['admin', 'archiviste', 'consultant'] },
        { name: 'Paramètres', icon: Settings, path: '/settings', roles: ['admin'] },
    ];

    if (isAdmin()) {
        navItems.push({ name: 'Utilisateurs', icon: Users, path: '/users', roles: ['admin'] });
    }

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] lg:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-[60] w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out transform shadow-2xl lg:shadow-none",
                    !isOpen && "-translate-x-full"
                )}
            >
                <div className="flex items-center justify-between h-16 px-6 bg-slate-950">
                    <img src={logo} alt="Sonalgaz" className="h-10 w-auto object-contain" />
                    <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="mt-6 px-4 space-y-2 overflow-y-auto max-h-[calc(100vh-10rem)]">
                    {navItems
                        .filter(item => item.roles.includes(user?.role))
                        .map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                                className={({ isActive }) => cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.name}
                            </NavLink>
                        ))}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900">
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-400 rounded-lg hover:bg-red-900/20 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Déconnexion
                    </button>
                </div>
            </div>

            {/* Mobile Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed top-3 left-4 z-[50] p-2.5 bg-slate-900 text-white rounded-xl lg:hidden shadow-lg border border-slate-800 hover:bg-slate-800 transition-all active:scale-95"
                >
                    <Menu className="w-6 h-6" />
                </button>
            )}
        </>
    );
};

export default Sidebar;
