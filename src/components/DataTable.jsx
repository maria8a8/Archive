import { ChevronLeft, ChevronRight, Edit2, Trash2, Eye, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const DataTable = ({ columns, data, loading, onEdit, onDelete, onView, onDownload, pagination, onPageChange }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={cn(
                                        "px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider",
                                        col.hiddenOnMobile && "hidden md:table-cell"
                                    )}
                                >
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                        Chargement des données...
                                    </div>
                                </td>
                            </tr>
                        ) : (!Array.isArray(data) || data.length === 0) ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-400">
                                    Aucune donnée trouvée.
                                </td>
                            </tr>
                        ) : (
                            data.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                    {columns.map((col) => (
                                        <td
                                            key={`${row.id}-${col.key}`}
                                            className={cn(
                                                "px-4 md:px-6 py-4 text-xs sm:text-sm text-slate-600 truncate max-w-[120px] sm:max-w-xs",
                                                col.hiddenOnMobile && "hidden md:table-cell"
                                            )}
                                        >
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                    <td className="px-4 md:px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                                            {onView && (
                                                <button onClick={() => onView(row)} className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Voir">
                                                    <Eye className="w-3.5 h-3.5 sm:w-4 h-4" />
                                                </button>
                                            )}
                                            {onDownload && (
                                                <button onClick={() => onDownload(row)} className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Télécharger">
                                                    <Download className="w-3.5 h-3.5 sm:w-4 h-4" />
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button onClick={() => onEdit(row)} className="p-1.5 sm:p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                                                    <Edit2 className="w-3.5 h-3.5 sm:w-4 h-4" />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button onClick={() => onDelete(row)} className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5 sm:w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Affichage de <span className="font-semibold">{data.length}</span> résultats sur <span className="font-semibold">{pagination.total}</span>
                    </p>
                    <div className="flex items-center space-x-2">
                        <button
                            disabled={pagination.current_page === 1}
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            className="p-2 text-slate-500 hover:bg-white border border-slate-200 rounded-lg disabled:opacity-50 transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold px-4">Page {pagination.current_page}</span>
                        <button
                            disabled={pagination.current_page === pagination.last_page}
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            className="p-2 text-slate-500 hover:bg-white border border-slate-200 rounded-lg disabled:opacity-50 transition-all shadow-sm"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
