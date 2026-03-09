import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Eye, Download, Trash2, Map as MapIcon } from 'lucide-react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';

const LigneManagement = () => {
    const { isArchiviste } = useAuth();
    const [lignes, setLignes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [search, setSearch] = useState('');
    const [filterPlanType, setFilterPlanType] = useState('');
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        plan_type: 'vue_plan',
        region: '',
        type_reseau: '',
        numero_planche: '',
        nom_ligne: '',
        district: '',
        distance_gc: '',
        echelle: '',
        date_creation: '',
        entreprise_realisatrice: '',
        numero_contrat: '',
        mots_cles: '',
        observations: '',
        numero_boite: '',
        rayonnage: '',
        file: null
    });

    const fetchLignes = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, search, plan_type: filterPlanType };
            const response = await api.get('/lignes', { params });
            setLignes(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
        } catch (error) {
            console.error('Error fetching lignes', error);
        } finally {
            setLoading(false);
        }
    }, [search, filterPlanType]);

    useEffect(() => {
        fetchLignes();
    }, [fetchLignes]);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                plan_type: item.plan_type,
                region: item.region,
                type_reseau: item.type_reseau,
                numero_planche: item.numero_planche,
                nom_ligne: item.nom_ligne,
                district: item.district,
                distance_gc: item.distance_gc,
                echelle: item.echelle,
                date_creation: item.date_creation,
                entreprise_realisatrice: item.entreprise_realisatrice,
                numero_contrat: item.numero_contrat,
                mots_cles: item.mots_cles,
                observations: item.observations || '',
                numero_boite: item.numero_boite || '',
                rayonnage: item.rayonnage || '',
                file: null
            });
        } else {
            setEditingItem(null);
            setFormData({
                plan_type: 'vue_plan',
                region: '',
                type_reseau: '',
                numero_planche: '',
                nom_ligne: '',
                district: '',
                distance_gc: '',
                echelle: '',
                date_creation: new Date().toISOString().split('T')[0],
                entreprise_realisatrice: '',
                numero_contrat: '',
                mots_cles: '',
                observations: '',
                numero_boite: '',
                rayonnage: '',
                file: null
            });
        }
        setErrors({});
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
                await api.post(`/lignes/${editingItem.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/lignes', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setIsModalOpen(false);
            fetchLignes();
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error('Error saving ligne', error);
            }
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
        { key: 'nom_ligne', label: 'Nom de Ouvrage' },
        { key: 'plan_type', label: 'Type de Plan', render: (val) => <StatusBadge status={val} /> },
        { key: 'region', label: 'Région', hiddenOnMobile: true },
        { key: 'numero_boite', label: 'Boîte', hiddenOnMobile: true },
        { key: 'rayonnage', label: 'Rayon', hiddenOnMobile: true },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Lignes</h1>
                    <p className="text-sm text-slate-500">Gestion des lignes</p>
                </div>
                {isArchiviste() && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Ajouter une Ligne
                    </button>
                )}
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, région, mots clés..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={filterPlanType}
                    onChange={(e) => setFilterPlanType(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Tous les types</option>
                    <option value="vue_plan">Vue Plan</option>
                    <option value="profil_long">Profil Long</option>
                    <option value="point_singulier">Point Singulier</option>
                    <option value="carte_generale">Carte Générale</option>
                    <option value="schema_equipement">Schéma Équipement</option>
                    <option value="terrain">Terrain</option>
                </select>
            </div>

            <DataTable
                columns={columns}
                data={lignes}
                loading={loading}
                pagination={pagination}
                onPageChange={fetchLignes}
                onEdit={isArchiviste() ? handleOpenModal : null}
                onDelete={isArchiviste() ? (row) => handleDelete(row.id) : null}
                onView={(row) => row.file_path && window.open(`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${row.file_path}`)}
                onDownload={(row) => row.file_path && handleDownload(row)}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Modifier une Ligne' : 'Ajouter une Ligne'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 text-xs">Type de Plan</label>
                            <select
                                required
                                value={formData.plan_type}
                                onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="vue_plan">Vue Plan</option>
                                <option value="profil_long">Profil Long</option>
                                <option value="point_singulier">Point Singulier</option>
                                <option value="carte_generale">Carte Générale</option>
                                <option value="schema_equipement">Schéma Équipement</option>
                                <option value="terrain">Terrain</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 text-xs">Région</label>
                            <input
                                type="text" required value={formData.region}
                                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="ex: Alger"
                            />
                        </div>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 text-xs">N° Planche</label>
                            <input
                                type="text" required value={formData.numero_planche}
                                onChange={(e) => setFormData({ ...formData, numero_planche: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 text-xs">Nom de Ouvrage</label>
                            <input
                                type="text" required value={formData.nom_ligne}
                                onChange={(e) => setFormData({ ...formData, nom_ligne: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 text-xs">Wilaya</label>
                            <input
                                type="text" required value={formData.district}
                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 text-xs">Longueur</label>
                            <input
                                type="number" step="0.01" required value={formData.distance_gc}
                                onChange={(e) => setFormData({ ...formData, distance_gc: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 text-xs">Échelle</label>
                            <input
                                type="text" required value={formData.echelle}
                                onChange={(e) => setFormData({ ...formData, echelle: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="ex: 1/500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 text-xs">Date de Création</label>
                            <input
                                type="date" required value={formData.date_creation}
                                onChange={(e) => setFormData({ ...formData, date_creation: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 text-xs">Entreprise Réalisatrice</label>
                            <input
                                type="text" required value={formData.entreprise_realisatrice}
                                onChange={(e) => setFormData({ ...formData, entreprise_realisatrice: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 text-xs">Mots Clés (tags)</label>
                        <input
                            type="text" required value={formData.mots_cles}
                            onChange={(e) => setFormData({ ...formData, mots_cles: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Tag1, Tag2, Tag3..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 text-xs">Observations</label>
                        <textarea
                            rows="2" value={formData.observations}
                            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 text-xs">Numéro de la boîte</label>
                            <input
                                type="text"
                                value={formData.numero_boite}
                                onChange={(e) => setFormData({ ...formData, numero_boite: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="Boîte"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 text-xs">Rayonnage</label>
                            <input
                                type="text"
                                value={formData.rayonnage}
                                onChange={(e) => setFormData({ ...formData, rayonnage: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="Rayon"
                            />
                        </div>
                    </div>

                    <FileUpload
                        onFileSelect={(file) => setFormData({ ...formData, file })}
                        existingFile={editingItem?.file_path}
                    />

                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                            <ul className="list-disc list-inside">
                                {Object.values(errors).flat().map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200">Annuler</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Enregistrer</button>
                    </div>
                </form>
            </Modal>
        </div >
    );
};

export default LigneManagement;
