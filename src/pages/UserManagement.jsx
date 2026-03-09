import { useState, useEffect, useCallback } from 'react';
import { Plus, UserPlus, Shield, Mail, Trash2, Edit2, Key } from 'lucide-react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'consultant'
    });

    const fetchUsers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await api.get('/users', { params: { page } });
            // API returns paginated results, actual users are in .data.data
            setUsers(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
        } catch (error) {
            console.error('Error fetching users', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenModal = (item = null) => {
        setError('');
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                email: item.email,
                password: '',
                role: item.role
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'consultant'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingItem) {
                const data = { ...formData };
                if (!data.password) delete data.password;
                await api.put(`/users/${editingItem.id}`, data);
            } else {
                await api.post('/users', formData);
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue.');
        }
    };

    const handleDelete = async (id) => {
        if (id === currentUser.id) {
            alert("Vous ne pouvez pas supprimer votre propre compte.");
            return;
        }
        if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user', error);
            }
        }
    };

    const columns = [
        {
            key: 'name', label: 'Nom Complet', render: (val, row) => (
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                        {val.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-900">{val}</span>
                </div>
            )
        },
        { key: 'email', label: 'Email', hiddenOnMobile: true },
        { key: 'role', label: 'Rôle', render: (val) => <StatusBadge status={val} /> },
        { key: 'created_at', label: 'Membre depuis', render: (val) => new Date(val).toLocaleDateString(), hiddenOnMobile: true },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestion des Utilisateurs</h1>
                    <p className="text-sm text-slate-500">Gérez les accès et les rôles du personnel</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Nouvel Utilisateur
                </button>
            </div>

            <DataTable
                columns={columns}
                data={users}
                loading={loading}
                pagination={pagination}
                onPageChange={fetchUsers}
                onEdit={handleOpenModal}
                onDelete={(row) => handleDelete(row.id)}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Modifier l\'Utilisateur' : 'Créer un Utilisateur'}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 flex items-center">
                            <Shield className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nom complet</label>
                        <div className="relative">
                            <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text" required value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="ex: Jean Dupont"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email" required value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="jean@sonalgaz.dz"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Mot de passe {editingItem && <span className="text-xs text-slate-400 font-normal">(Laisser vide pour ne pas changer)</span>}
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="password" required={!editingItem} value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Rôle</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['admin', 'archiviste', 'consultant'].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role })}
                                    className={`py-2 px-3 rounded-lg border text-sm font-bold transition-all capitalize ${formData.role === role
                                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200">Annuler</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-100">
                            {editingItem ? 'Mettre à jour' : 'Créer l\'utilisateur'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagement;
