import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    File, Image as ImageIcon, Download, Trash2, Loader2,
    ExternalLink, X, CheckCircle2, AlertTriangle, Upload,
    AlertCircle
} from 'lucide-react';
import { ENDPOINTS } from '../constants';
import { ConfirmModal } from './ConfirmModal';

interface FileData {
    id: string;
    fileName: string;
    filePath: string;
    contentType: string;
    fileSize: number;
    uploadedAt: string;
    viewUrl?: string;
    downloadUrl?: string;
}

interface UploadingFile {
    id: string;
    file: File;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
}

interface FileHandlerProps {
    objectId: string | number;
    objectType: 'product' | 'post' | 'user' | 'review' | 'category';
    className?: string;

    // View/Logic Props
    viewOnly?: boolean;
    allowDelete?: boolean;
    refreshTrigger?: any;

    // Upload Props
    allowUpload?: boolean;
    onUploadSuccess?: (fileData: any) => void;
    onUploadError?: (error: string) => void;
    onDeleteSuccess?: (fileId: string | number) => void;
    maxSizeMB?: number;
    accept?: string;
    fallbackImage?: string;
}

export const FileHandler: React.FC<FileHandlerProps> = ({
    objectId,
    objectType,
    className = "",
    viewOnly = false,
    allowDelete = false,
    allowUpload = false,
    refreshTrigger,
    onUploadSuccess,
    onUploadError,
    onDeleteSuccess,
    maxSizeMB = 5,
    accept = "image/*",
    fallbackImage
}) => {
    // --- Shared State ---
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // --- Viewer State ---
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [previewFile, setPreviewFile] = useState<FileData | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | number | null>(null);
    const [imageError, setImageError] = useState(false);

    // --- Upload State ---
    const [isDragging, setIsDragging] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [sessionUploadedIds, setSessionUploadedIds] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isImageFile = (file: FileData | { fileName: string; contentType?: string }) => {
        return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.fileName) ||
            file.contentType?.toLowerCase().includes('image');
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // --- Effects ---
    useEffect(() => {
        if (selectedImage || confirmDelete) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedImage, confirmDelete]);

    useEffect(() => {
        if (objectId && !objectId.toString().startsWith('temp_')) {
            viewFiles();
        } else if (objectId && objectId.toString().startsWith('temp_')) {
            viewFiles();
        } else {
            setFiles([]);
            setPreviewFile(null);
            setLoading(false);
        }
    }, [objectId, objectType, refreshTrigger]);

    const imageFiles = files.filter(f => isImageFile(f));

    useEffect(() => {
        let timer: any;
        if (viewOnly && imageFiles.length > 1) {
            timer = setInterval(() => {
                setCurrentImageIndex(prev => (prev + 1) % imageFiles.length);
            }, 5000);
        }
        return () => clearInterval(timer);
    }, [viewOnly, imageFiles.length]);

    // --- Viewer Logic ---
    const viewFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('objectId', objectId.toString());
            const response = await fetch(ENDPOINTS.FILES.METADATA, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('chinchin_token')}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                const fetchedFiles: FileData[] = Array.isArray(data) ? data : (data ? [data] : []);

                setFiles(prev => {
                    const combined = [...fetchedFiles];
                    const uniqueMap = new Map();
                    combined.forEach(f => uniqueMap.set(f.id, f));
                    return Array.from(uniqueMap.values());
                });

                const firstImage = fetchedFiles.find(f => isImageFile(f));
                if (firstImage) {
                    setPreviewFile(firstImage);
                } else if (fetchedFiles.length > 0) {
                    setPreviewFile(fetchedFiles[0]);
                } else {
                    setPreviewFile(null);
                }
            } else {
                setFiles([]);
                setPreviewFile(null);
            }
        } catch (err) {
            setError('Không thể tải danh sách tệp');
            setPreviewFile(null);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;

        try {
            const response = await fetch(ENDPOINTS.FILES.DELETE(confirmDelete), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('chinchin_token')}`
                }
            });

            if (response.ok) {
                setFiles(prev => {
                    const newFiles = prev.filter(f => f.id !== confirmDelete);
                    if (previewFile?.id === confirmDelete) {
                        const nextImage = newFiles.find(f => isImageFile(f));
                        setPreviewFile(nextImage || newFiles[0] || null);
                    }
                    return newFiles;
                });
                onDeleteSuccess?.(confirmDelete);
                showToast('Xóa tệp thành công');
            } else {
                showToast('Không thể xóa tệp', 'error');
            }
        } catch (err) {
            showToast('Lỗi khi xóa tệp', 'error');
            console.error(err);
        } finally {
            setConfirmDelete(null);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const ViewFile = (fileId: string | number) => ENDPOINTS.FILES.VIEW(fileId);
    const DownloadFile = (fileId: string | number) => ENDPOINTS.FILES.DOWNLOAD(fileId);

    // --- Sub-component for rendering a single file row ---
    const FileItemRow = ({ file }: { file: FileData }) => (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`group relative bg-white border rounded-2xl p-3 transition-all duration-300 ${previewFile?.id === file.id ? 'border-floral-rose/30 shadow-md ring-1 ring-floral-rose/10' : 'border-stone-100 hover:border-stone-200'}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 cursor-pointer overflow-hidden border transition-all ${previewFile?.id === file.id ? 'border-floral-rose bg-floral-rose/5' : 'border-stone-100 bg-stone-100'}`}
                    onClick={() => setPreviewFile(file)}
                >
                    {isImageFile(file) ? (
                        <img src={ViewFile(file.id)} alt={file.fileName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1s,2s]" />
                    ) : (
                        <File size={20} className="text-stone-400" />
                    )}
                </div>
                <div className="flex-grow min-w-0" onClick={() => setPreviewFile(file)}>
                    <p className={`text-sm font-bold truncate ${previewFile?.id === file.id ? 'text-floral-rose' : 'text-floral-deep'}`}>{file.fileName}</p>
                    <p className="text-[10px] text-stone-400">{formatSize(file.fileSize)} • {new Date(file.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1">
                    <a href={ViewFile(file.id)} target="_blank" rel="noreferrer" className="p-2 text-stone-300 hover:text-floral-rose hover:bg-stone-100 rounded-lg transition-colors"><ExternalLink size={14} /></a>
                    <a href={DownloadFile(file.id)} className="p-2 text-stone-300 hover:text-emerald-500 hover:bg-stone-100 rounded-lg transition-colors"><Download size={14} /></a>
                    {allowDelete && (
                        <button type="button" onClick={() => setConfirmDelete(file.id)} className="p-2 text-stone-300 hover:text-rose-500 hover:bg-stone-100 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    )}
                </div>
            </div>
        </motion.div>
    );

    // --- Upload Logic ---
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        processFiles(droppedFiles);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            processFiles(selectedFiles);
        }
    };

    const processFiles = (filesToProcess: File[]) => {
        const validFiles = filesToProcess.filter(file => {
            const sizeMB = file.size / (1024 * 1024);
            if (sizeMB > maxSizeMB) {
                const errorMsg = `File ${file.name} quá lớn (tối đa ${maxSizeMB}MB)`;
                onUploadError?.(errorMsg);
                showToast(errorMsg, 'error');
                return false;
            }
            return true;
        });

        validFiles.forEach(file => uploadFile(file));
    };

    const uploadFile = async (file: File) => {
        const tempId = Math.random().toString(36).substring(2, 9);
        const newUploadingFile: UploadingFile = {
            id: tempId,
            file,
            progress: 0,
            status: 'uploading'
        };

        setUploadingFiles(prev => [...prev, newUploadingFile]);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('objectId', objectId.toString());
        formData.append('objectType', objectType);

        try {
            const response = await fetch(ENDPOINTS.FILES.UPLOAD, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('chinchin_token')}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setUploadingFiles(prev =>
                    prev.map(f => f.id === tempId ? { ...f, status: 'completed', progress: 100 } : f)
                );
                if (data.id) {
                    setSessionUploadedIds(prev => new Set(prev).add(data.id));
                }
                onUploadSuccess?.(data);
                setUploadingFiles(prev => prev.filter(f => f.id !== tempId));
                viewFiles();
            } else {
                throw new Error('Upload failed');
            }
        } catch (err) {
            setUploadingFiles(prev =>
                prev.map(f => f.id === tempId ? { ...f, status: 'error', error: 'Lỗi tải lên' } : f)
            );
            onUploadError?.('Không thể tải tệp lên máy chủ');
        }
    };

    // --- Render ViewOnly Mode ---
    if (viewOnly) {
        if (loading && files.length === 0) {
            return (
                <div className={`flex items-center justify-center p-12 ${className}`}>
                    <Loader2 className="animate-spin text-floral-rose" size={32} />
                </div>
            );
        }

        const isSmall = className.includes('w-12') || className.includes('h-12');

        if (imageFiles.length === 0) {
            if (fallbackImage && !imageError) {
                return (
                    <div className={`relative group overflow-hidden bg-floral-rose/5 pointer-events-none ${(!className.includes('aspect-') && !className.includes('h-')) ? 'aspect-video' : ''} ${!className.includes('rounded-') ? 'rounded-[2.5rem]' : ''} ${className}`}>
                        <motion.img
                            src={fallbackImage}
                            alt="Gallery Fallback"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    </div>
                );
            }

            return (
                <div className={`relative bg-stone-100 border border-stone-100 flex items-center justify-center text-stone-200 ${!className.includes('aspect-') ? 'aspect-video' : ''} ${!className.includes('rounded-') ? 'rounded-[2.5rem]' : ''} ${className}`}>
                    <ImageIcon size={isSmall ? 20 : 48} />
                </div>
            );
        }

        return (
            <div className={`relative group overflow-hidden bg-floral-rose/5 pointer-events-none ${(!className.includes('aspect-') && !className.includes('h-')) ? 'aspect-video' : ''} ${!className.includes('shadow-') ? 'shadow-2xl' : ''} ${!className.includes('rounded-') ? 'rounded-[2.5rem]' : ''} ${className}`}>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={imageFiles[currentImageIndex]?.id || 'empty'}
                        src={imageFiles[currentImageIndex] ? ViewFile(imageFiles[currentImageIndex].id) : ''}
                        alt="Gallery"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                           (e.target as HTMLImageElement).style.display = 'none';
                           setImageError(true);
                        }}
                    />
                    {imageError && (
                        <div className="absolute inset-0 flex items-center justify-center text-stone-200">
                           <ImageIcon size={isSmall ? 20 : 48} />
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // --- Render Management Mode ---
    return (
        <div className={`space-y-6 ${className}`}>
            {/* Upload Zone */}
            {allowUpload && (
                <div className="w-full space-y-4">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-10 transition-all duration-300 flex flex-col items-center justify-center gap-4
                          ${isDragging
                                ? 'border-floral-rose bg-floral-rose/5 scale-[1.02]'
                                : 'border-stone-200 hover:border-floral-rose/50 hover:bg-stone-100'
                            }`}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept={accept}
                            className="hidden"
                        />

                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300
                          ${isDragging ? 'bg-floral-rose text-white' : 'bg-stone-100 text-stone-400 group-hover:bg-floral-rose/10 group-hover:text-floral-rose'}`}>
                            <Upload size={32} className={isDragging ? 'animate-bounce' : ''} />
                        </div>

                        <div className="text-center">
                            <p className="font-serif text-xl text-floral-deep">Kéo thả hoặc nhấn để tải ảnh</p>
                            <p className="text-sm text-stone-400 mt-1">Tối đa {maxSizeMB}MB</p>
                        </div>
                    </div>

                    <AnimatePresence>
                        {uploadingFiles.length > 0 && (
                            <div className="space-y-2">
                                {uploadingFiles.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="bg-white border border-stone-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm"
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                          ${item.status === 'completed' ? 'bg-emerald-50 text-emerald-500' :
                                                item.status === 'error' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                                            {item.status === 'uploading' && <Loader2 size={20} className="animate-spin" />}
                                            {item.status === 'completed' && <CheckCircle2 size={20} />}
                                            {item.status === 'error' && <AlertCircle size={20} />}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-sm font-medium text-floral-deep truncate">{item.file.name}</p>
                                                <span className="text-[10px] font-bold text-stone-400">{item.status.toUpperCase()}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    animate={{ width: item.status === 'completed' ? '100%' : `${item.progress}%` }}
                                                    className={`h-full rounded-full transition-all duration-300 ${item.status === 'completed' ? 'bg-emerald-500' : item.status === 'error' ? 'bg-rose-500' : 'bg-floral-rose'}`}
                                                />
                                            </div>
                                        </div>
                                        <button onClick={() => setUploadingFiles(prev => prev.filter(f => f.id !== item.id))} className="p-2 text-stone-300 hover:text-stone-500"><X size={16} /></button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Primary Image Preview Section */}
            <div className="relative aspect-video w-full bg-stone-100 rounded-[2.5rem] border border-stone-100 overflow-hidden flex items-center justify-center group shadow-inner">
                {previewFile ? (
                    isImageFile(previewFile) ? (
                        <>
                            <img
                                src={ViewFile(previewFile.id)}
                                alt={previewFile.fileName}
                                className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-700"
                                onClick={() => setSelectedImage(ViewFile(previewFile.id))}
                            />
                            <div className="absolute inset-0 bg-floral-deep/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <ImageIcon className="text-white drop-shadow-lg" size={32} />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-stone-400 p-8 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-sm mb-2 border border-stone-100">
                                <File size={40} className="text-stone-300" />
                            </div>
                            <div>
                                <p className="text-base font-bold text-stone-600 truncate max-w-xs mx-auto mb-1">{previewFile.fileName}</p>
                                <p className="text-xs text-stone-400">{formatSize(previewFile.fileSize)} • {previewFile.contentType}</p>
                            </div>
                            <div className="flex gap-4">
                                <a href={ViewFile(previewFile.id)} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-floral-rose/10 text-floral-rose rounded-xl text-sm font-medium hover:bg-floral-rose/20 transition-colors"><ExternalLink size={16} /> Xem</a>
                                <a href={DownloadFile(previewFile.id)} className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors"><Download size={16} /> Tải về</a>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center gap-3 text-stone-300">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm"><ImageIcon size={32} /></div>
                        <p className="text-sm font-medium italic">Không có dữ liệu</p>
                    </div>
                )}
            </div>

            {/* File List */}
            <div className="space-y-6">
                {files.filter(f => sessionUploadedIds.has(f.id)).length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Tệp vừa tải lên</h4>
                        </div>
                        <div className="flex flex-col gap-3">
                            <AnimatePresence>
                                {files.filter(f => sessionUploadedIds.has(f.id)).map((file) => (
                                    <FileItemRow key={file.id} file={file} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {files.filter(f => !sessionUploadedIds.has(f.id)).length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Tệp đã có trên máy chủ</h4>
                        </div>
                        <div className="flex flex-col gap-3">
                            <AnimatePresence>
                                {files.filter(f => !sessionUploadedIds.has(f.id)).map((file) => (
                                    <FileItemRow key={file.id} file={file} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>

            {/* Portals */}
            {typeof document !== 'undefined' && createPortal(
                <>
                    <AnimatePresence>
                        {selectedImage && (
                            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6" onClick={() => setSelectedImage(null)}>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-floral-deep/90 backdrop-blur-sm" />
                                <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={selectedImage} className="relative max-w-5xl max-h-full rounded-3xl shadow-2xl" onClick={e => e.stopPropagation()} />
                            </div>
                        )}
                        <ConfirmModal
                            isOpen={!!confirmDelete}
                            title="Xóa tệp tin?"
                            message="Dữ liệu này sẽ bị xóa vĩnh viễn khỏi máy chủ. Bạn chắc chắn chứ?"
                            onConfirm={handleDelete}
                            onCancel={() => setConfirmDelete(null)}
                            confirmText="XÓA NGAY"
                            type="danger"
                        />
                        {toast && (
                            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[1200] px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border ${toast.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-rose-500 border-rose-400 text-white'}`}>
                                {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                <span className="text-sm font-bold">{toast.message}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>,
                document.body
            )}
        </div>
    );
};
