import { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const FileUpload = ({ onFileSelect, existingFile, accept = ".pdf,.jpg,.jpeg,.png" }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files[0]);
        }
    };

    const handleFiles = (file) => {
        setSelectedFile(file);
        onFileSelect(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
        onFileSelect(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    const isImage = (file) => file && file.type.startsWith('image/');

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-2">Document (PDF ou Image)</label>

            {!selectedFile && !existingFile ? (
                <div
                    className={cn(
                        "relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer",
                        dragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleChange}
                    />
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600 mb-4">
                        <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Cliquez pour télécharger ou glissez-déposez</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (Max. 10MB)</p>
                </div>
            ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0">
                            {isImage(selectedFile) ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-bold text-slate-900 truncate">
                                {selectedFile ? selectedFile.name : 'Fichier existant'}
                            </p>
                            <p className="text-xs text-slate-500">
                                {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Téléchargé précédemment'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <button
                            onClick={removeFile}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
