import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Database, Trash2 } from 'lucide-react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';

const PosteManagement = () => {
    const { isArchiviste } = useAuth();
    const [postes, setPostes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    const [formData, setFormData] = useState({
        categorie: 'genie_civil',
        code_poste: '',
        localisation: '',
        date_realisation: '',
        entreprise: '',
        mots_cles: '',
        observations: '',
        numero_boite: '',
        rayonnage: '',
        file: null
    });

    const fetchPostes = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, search, categorie: filterCategory };
            const response = await api.get('/postes', { params });
            setPostes(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
        } catch (error) {
            console.error('Error fetching postes', error);
        } finally {
            setLoading(false);
        }
    }, [search, filterCategory]);

    useEffect(() => {
        fetchPostes();
    }, [fetchPostes]);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                categorie: item.categorie,
                code_poste: item.code_poste,
                localisation: item.localisation,
                date_realisation: item.date_realisation,
                entreprise: item.entreprise,
                mots_cles: item.mots_cles,
                observations: item.observations || '',
                numero_boite: item.numero_boite || '',
                rayonnage: item.rayonnage || '',
                file: null
            });
        } else {
            setEditingItem(null);
            setFormData({
                categorie: 'genie_civil',
                code_poste: '',
                localisation: '',
                date_realisation: new Date().toISOString().split('T')[0],
                entreprise: '',
                mots_cles: '',
                observations: '',
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

        if (editingItem) data.append('_method', 'PUT');

        try {
            if (editingItem) {
                await api.post(`/postes/${editingItem.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/postes', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setIsModalOpen(false);
            fetchPostes();
        } catch (error) {
            console.error('Error saving poste', error);
        }
    };

    const handleDelete = async (id) => {
    }

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
        { key: 'code_poste', label: 'Capacité' },
        { key: 'categorie', label: 'Catégorie', render: (val) => <StatusBadge status={val} /> },
        { key: 'localisation', label: 'Localisation', hiddenOnMobile: true },
        { key: 'numero_boite', label: 'Boîte', hiddenOnMobile: true },
        { key: 'rayonnage', label: 'Rayon', hiddenOnMobile: true },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestion des Postes</h1>
                    <p className="text-sm text-slate-500">Archives des équipements et installations</p>
                </div>
                {isArchiviste() && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nouveau Poste
                    </button>
                )}
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par code, localisation, entreprise..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Toutes les catégories</option>
                    <option value="genie_civil">Génie Civil</option>
                    <option value="isometrique">Isométrique</option>
                    <option value="soudure">Soudure</option>
                    <option value="tuyauterie">Tuyauterie</option>
                    <option value="protection">Protection</option>
                </select>
            </div>

            <DataTable
                columns={columns}
                data={postes}
                loading={loading}
                pagination={pagination}
                onPageChange={fetchPostes}
                onEdit={isArchiviste() ? handleOpenModal : null}
                onDelete={isArchiviste() ? (row) => handleDelete(row.id) : null}
                onView={(row) => row.file_path && window.open(`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${row.file_path}`)}
                onDownload={(row) => row.file_path && handleDownload(row)}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Modifier le Poste' : 'Ajouter un Nouveau Poste'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                            <select
                                required
                                value={formData.categorie}
                                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="genie_civil">Génie Civil</option>
                                <option value="isometrique">Isométrique</option>
                                <option value="soudure">Soudure</option>
                                <option value="tuyauterie">Tuyauterie</option>
                                <option value="protection">Protection</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Capacité</label>
                            <input
                                type="text" required value={formData.code_poste}
                                onChange={(e) => setFormData({ ...formData, code_poste: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="ex: 1000 KVA"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Localisation</label>
                            <input
                                type="text" required value={formData.localisation}
                                onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date de Réalisation</label>
                            <input
                                type="date" required value={formData.date_realisation}
                                onChange={(e) => setFormData({ ...formData, date_realisation: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Entreprise</label>
                        <input
                            type="text" required value={formData.entreprise}
                            onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mots Clés</label>
                        <input
                            type="text" required value={formData.mots_cles}
                            onChange={(e) => setFormData({ ...formData, mots_cles: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Séparés par des virgules"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Observations</label>
                        <textarea
                            rows="2" value={formData.observations}
                            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de la boîte</label>
                            <input
                                type="text"
                                value={formData.numero_boite}
                                onChange={(e) => setFormData({ ...formData, numero_boite: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Boîte"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Rayonnage</label>
                            <input
                                type="text"
                                value={formData.rayonnage}
                                onChange={(e) => setFormData({ ...formData, rayonnage: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Rayon"
                            />
                        </div>
                    </div>

                    <FileUpload
                        onFileSelect={(file) => setFormData({ ...formData, file })}
                        existingFile={editingItem?.file_path}
                    />

                    <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200">Annuler</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Enregistrer</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PosteManagement;
