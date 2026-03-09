import { useState, useEffect } from 'react';
import { Mail, Map, Database, FileText, ChevronRight } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/stats/dashboard');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Tableau de Bord</h1>
                    <p className="text-slate-500 mt-1">Vue d'ensemble de l'archive Sonalgaz</p>
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm w-fit">
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Courriers"
                    value={data?.counts.courriers || 0}
                    icon={Mail}
                    trend="up"
                    trendValue={12}
                    color="blue"
                />
                <StatCard
                    title="Total Plans/Lignes"
                    value={data?.counts.lignes || 0}
                    icon={Map}
                    trend="up"
                    trendValue={8}
                    color="green"
                />
                <StatCard
                    title="Total Postes"
                    value={data?.counts.postes || 0}
                    icon={Database}
                    trend="up"
                    trendValue={5}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Courriers by Month Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Courriers par Mois</h3>
                    <div className="h-[320px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%" debounce={100}>
                            <AreaChart data={data?.courriers_by_month || []}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Region Distribution Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Distribution par Région (Plans)</h3>
                    <div className="h-[320px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%" debounce={100}>
                            <PieChart>
                                <Pie
                                    data={data?.distribution_by_region || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="region"
                                >
                                    {(data?.distribution_by_region || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Uploads */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Ajouts Récents</h3>
                    <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center transition-colors">
                        Voir tout <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Document</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Source</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Date d'Ajout</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data?.recent_uploads?.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="truncate max-w-[150px] sm:max-w-xs">
                                                <p className="text-sm font-bold text-slate-900 truncate">
                                                    {item.objet || item.nom_ligne || item.code_poste}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {item.expediteur || item.region || item.localisation}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <StatusBadge status={item.source_type.toLowerCase()} />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            to={`/${item.source_type.toLowerCase()}s`}
                                            className="text-blue-600 hover:text-blue-700 font-bold text-sm whitespace-nowrap"
                                        >
                                            <span className="hidden sm:inline">Détails</span>
                                            <ChevronRight className="w-4 h-4 sm:hidden ml-auto" />
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
};

export default Dashboard;
