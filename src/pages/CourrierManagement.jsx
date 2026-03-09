import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Eye, Download, Trash2, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';

const CourrierManagement = () => {
    const { isArchiviste } = useAuth();
    const [courriers, setCourriers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        type: 'arrive',
        date_reception: '',
        expediteur: '',
        destinataire: '',
        objet: '',
        description: '',
        numero_boite: '',
        rayonnage: '',
        file: null
    });

    const fetchCourriers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, search, type: filterType };
            const response = await api.get('/courriers', { params });
            setCourriers(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
        } catch (error) {
            console.error('Error fetching courriers', error);
        } finally {
            setLoading(false);
        }
    }, [search, filterType]);

    useEffect(() => {
        fetchCourriers();
    }, [fetchCourriers]);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                type: item.type,
                date_reception: item.date_reception,
                expediteur: item.expediteur,
                destinataire: item.destinataire,
                objet: item.objet,
                description: item.description || '',
                numero_boite: item.numero_boite || '',
                rayonnage: item.rayonnage || '',
                file: null
            });
        } else {
            setEditingItem(null);
            setFormData({
                type: 'arrive',
                date_reception: new Date().toISOString().split('T')[0],
                expediteur: '',
                destinataire: '',
                objet: '',
                description: '',
                numero_boite: '',
                rayonnage: '',
                file: null
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        if (editingItem) {
            data.append('_method', 'PUT');
        }

        try {
            if (editingItem) {
                await api.post(`/courriers/${editingItem.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/courriers', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setIsModalOpen(false);
            fetchCourriers();
        } catch (error) {
            console.error('Error saving courrier', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce courrier ?')) {
            try {
                await api.delete(`/courriers/${id}`);
                fetchCourriers();
            } catch (error) {
                console.error('Error deleting courrier', error);
            }
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

    const columns = [
        { key: 'date_reception', label: 'Date', render: (val) => new Date(val).toLocaleDateString(), hiddenOnMobile: true },
        { key: 'type', label: 'Type', render: (val) => <StatusBadge status={val} /> },
        { key: 'objet', label: 'Objet' },
        { key: 'expediteur', label: 'Expéditeur', hiddenOnMobile: true },
        { key: 'numero_boite', label: 'Boîte', hiddenOnMobile: true },
        { key: 'rayonnage', label: 'Rayon', hiddenOnMobile: true },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestion des Courriers</h1>
                    <p className="text-sm text-slate-500">Gérez les arrivées et départs de documents</p>
                </div>
                {isArchiviste() && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nouveau Courrier
                    </button>
                )}
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par objet, expéditeur..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tous les types</option>
                        <option value="arrive">Arrivée</option>
                        <option value="depart">Départ</option>
                    </select>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={courriers}
                loading={loading}
                pagination={pagination}
                onPageChange={fetchCourriers}
                onEdit={isArchiviste() ? handleOpenModal : null}
                onDelete={isArchiviste() ? (row) => handleDelete(row.id) : null}
                onView={(row) => row.file_path && window.open(`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${row.file_path}`)}
                onDownload={(row) => row.file_path && handleDownload(row)}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Modifier le Courrier' : 'Ajouter un Nouveau Courrier'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Type de Courrier</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="arrive">Arrivée</option>
                                <option value="depart">Départ</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Date de Réception</label>
                            <input
                                type="date"
                                required
                                value={formData.date_reception}
                                onChange={(e) => setFormData({ ...formData, date_reception: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Expéditeur</label>
                            <input
                                type="text"
                                required
                                value={formData.expediteur}
                                onChange={(e) => setFormData({ ...formData, expediteur: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Nom de l'expéditeur"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Destinataire</label>
                            <input
                                type="text"
                                required
                                value={formData.destinataire}
                                onChange={(e) => setFormData({ ...formData, destinataire: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Nom du destinataire"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Objet</label>
                        <input
                            type="text"
                            required
                            value={formData.objet}
                            onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Objet du courrier"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Description / Observations</label>
                        <textarea
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Détails supplémentaires..."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Numéro de la boîte</label>
                            <input
                                type="text"
                                value={formData.numero_boite}
                                onChange={(e) => setFormData({ ...formData, numero_boite: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Ex: B-12"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Rayonnage</label>
                            <input
                                type="text"
                                value={formData.rayonnage}
                                onChange={(e) => setFormData({ ...formData, rayonnage: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Ex: R-05"
                            />
                        </div>
                    </div>

                    <FileUpload
                        onFileSelect={(file) => setFormData({ ...formData, file })}
                        existingFile={editingItem?.file_path}
                    />

                    <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-blue-100 shadow-lg"
                        >
                            {editingItem ? 'Enregistrer les modifications' : 'Ajouter le courrier'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CourrierManagement;
