import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const StatusBadge = ({ status, type = 'default' }) => {
    const statusConfig = {
        // Courriers
        arrive: { label: 'Arrivé', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
        depart: { label: 'Départ', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },

        // Roles
        admin: { label: 'Admin', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
        archiviste: { label: 'Archiviste', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
        consultant: { label: 'Consultant', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100' },

        // Lignes
        vue_plan: { label: 'Vue Plan', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
        profil_long: { label: 'Profil Long', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-100' },

        // Default
        default: { label: status, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }
    };

    const config = statusConfig[status] || statusConfig.default;

    return (
        <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-bold border",
            config.bg, config.text, config.border
        )}>
            {config.label}
        </span>
    );
};

export default StatusBadge;
