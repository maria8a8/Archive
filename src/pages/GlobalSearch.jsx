import { useState } from 'react';
import { Search as SearchIcon, Calendar, Filter, FileText, ChevronRight, Download } from 'lucide-react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';

const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        date_from: '',
        date_to: '',
        type: ''
    });

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim() && !filters.date_from && !filters.date_to && !filters.type) return;

        setLoading(true);
        try {
            const params = { q: query, ...filters };
            const response = await api.get('/search/global', { params });
            setResults(response.data);
        } catch (error) {
            console.error('Search error', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (item) => {
        if (!item.file_path) return;
        try {
            const response = await api.get(`/download?path=${encodeURIComponent(item.file_path)}`, {
                responseType: 'blob'
            });
            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = item.file_path.split('/').pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="text-center space-y-4 py-8">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Recherche Globale</h1>
                <p className="text-slate-500 text-lg">Recherchez dans l'intégralité des archives Sonalgaz</p>
            </div>

            <form onSubmit={handleSearch} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Mots clés, numéros, noms, entreprises..."
                        className="w-full pl-14 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Du</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Au</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Source</label>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Tous les documents</option>
                                <option value="courrier">Courriers</option>
                                <option value="ligne">Lignes & Plans</option>
                                <option value="poste">Postes</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center disabled:opacity-70"
                >
                    {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Lancer la recherche"}
                </button>
            </form>

            <div className="space-y-6">
                {results && (
                    <>
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-bold text-slate-900">
                                {results.length} Résultats trouvés
                            </h2>
                        </div>

                        <div className="grid gap-4">
                            {results.map((item, idx) => (
                                <div key={idx} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                    <div className="flex items-center space-x-4 overflow-hidden w-full">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="truncate flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <StatusBadge status={item.type.toLowerCase()} />
                                                <span className="text-xs text-slate-400">
                                                    {new Date(item.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
                                                {item.title}
                                            </p>
                                            <p className="text-xs sm:text-sm text-slate-500 truncate">
                                                {item.subtitle}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {item.file_path && (
                                            <>
                                                <button
                                                    onClick={() => window.open(`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${item.file_path}`)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Voir le fichier"
                                                >
                                                    <FileText className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(item)}
                                                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Télécharger"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                        <Link
                                            to={`/${item.type.toLowerCase()}s`}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Aller à la page"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {results.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                                <SearchIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Aucun résultat ne correspond à votre recherche.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default GlobalSearch;
