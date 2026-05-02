import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit2, Trash2, X, Save, Tag, Plus } from 'lucide-react';
import { Category, Product } from '../../../types';
import { FileHandler } from '../../../components/FileHandler';
import { api, triggerToast } from '../../../backend';
import { ConfirmModal } from '../../../components/ConfirmModal';

interface CategoryManagerProps {
    categories: Category[];
    products: Product[]; // Needed for count
    onRefresh: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, products, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [catFormData, setCatFormData] = useState<Partial<Category>>({ name: '', description: '', image: '' });

    // Confirm Modal State
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; catId: string | number | null }>({
        isOpen: false,
        catId: null
    });

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                id: catFormData.id,
                name: catFormData.name,
                description: catFormData.description,
                image: catFormData.image
            };

            if (editingCategory) {
                await api.productCategories.update(editingCategory.id, { ...payload, id: editingCategory.id });
            } else {
                await api.productCategories.create(payload);
            }
            onRefresh();
            setIsCatModalOpen(false);
            triggerToast("Đã cập nhật danh mục", "success");
        } catch (err) { }
    };

    const handleDeleteCategory = async () => {
        if (!confirmDelete.catId) return;

        try {
            await api.productCategories.delete(confirmDelete.catId);
            onRefresh();
            triggerToast("Đã xóa danh mục", "info");
        } catch (err) { }
        setConfirmDelete({ isOpen: false, catId: null });
    };

    const confirmDeleteAction = (id: string | number) => {
        const hasProducts = products.some(p => String(p.category) === String(id));
        if (hasProducts) {
            triggerToast('Không thể xóa danh mục này vì vẫn còn sản phẩm thuộc danh mục.', 'error');
            return;
        }
        setConfirmDelete({ isOpen: true, catId: id });
    };

    const openAddModal = () => {
        const newId = crypto.randomUUID();
        setEditingCategory(null);
        setCatFormData({ id: newId, name: '' });
        setIsCatModalOpen(true);
    };

    const openEditModal = (cat: Category) => {
        setEditingCategory(cat);
        setCatFormData(cat);
        setIsCatModalOpen(true);
    };

    return (
        <>
            <div className="space-y-8">
                <div className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm danh mục..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-stone-100 border-none rounded-xl md:rounded-2xl focus:ring-2 focus:ring-floral-rose/20 transition-all text-sm outline-none"
                        />
                    </div>
                    <button
                        onClick={openAddModal}
                        className="w-full md:w-auto px-8 py-4 bg-floral-rose text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:bg-floral-deep transition-all shadow-xl shadow-floral-rose/20"
                    >
                        <Plus size={20} /> THÊM DANH MỤC
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {filteredCategories.map((cat) => (
                        <div key={cat.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-stone-100 relative group overflow-hidden transition-all hover:shadow-lg">
                            <div className="flex gap-4 md:gap-6 items-start mb-6">
                                <div className="w-20 h-20 shrink-0 bg-stone-100 rounded-2xl overflow-hidden border border-stone-100">
                                    <FileHandler objectId={cat.id} objectType="category" viewOnly={true} className="w-full h-full" fallbackImage={cat.image} />
                                </div>
                                <div className="flex-grow">
                                    <div className="w-10 h-10 bg-floral-rose/10 text-floral-rose rounded-xl flex items-center justify-center mb-3">
                                        <Tag size={18} />
                                    </div>
                                    <h3 className="font-serif text-xl text-floral-deep leading-tight truncate pr-4">{cat.name}</h3>
                                    <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mt-1">ID: {String(cat.id).substring(0, 8).toUpperCase()}</p>
                                </div>
                            </div>
                            {cat.description && (
                                <p className="text-stone-400 text-xs line-clamp-2 mb-6 italic leading-relaxed">
                                    "{cat.description}"
                                </p>
                            )}
                            <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                    {products.filter(p => p.category === cat.id).length} sản phẩm
                                </p>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(cat)} className="p-2.5 bg-stone-50 text-stone-400 hover:text-floral-gold hover:bg-stone-100 rounded-xl transition-all"><Edit2 size={14} /></button>
                                    <button onClick={() => confirmDeleteAction(cat.id)} className="p-2.5 bg-stone-50 text-stone-400 hover:text-red-500 hover:bg-stone-100 rounded-xl transition-all"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {isCatModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCatModalOpen(false)} className="absolute inset-0 bg-floral-deep/60 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl p-6 md:p-10 overflow-hidden max-h-[95vh] md:max-h-[90vh] overflow-y-auto" >
                            <div className="flex justify-between items-center mb-6 md:mb-8">
                                <h3 className="font-serif text-2xl md:text-3xl text-floral-deep">{editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục Mới'}</h3>
                                <button onClick={() => setIsCatModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSaveCategory} className="space-y-6 md:space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Tên danh mục</label>
                                            <input required autoFocus type="text" className="w-full px-5 md:px-6 py-3 md:py-4 bg-stone-100 rounded-xl md:rounded-2xl border border-stone-100 outline-none focus:ring-2 focus:ring-floral-rose/20 text-sm md:text-base transition-all" value={catFormData.name} onChange={e => setCatFormData({ ...catFormData, name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Mô tả danh mục</label>
                                            <textarea rows={4} className="w-full px-5 md:px-6 py-3 md:py-4 bg-stone-100 rounded-xl md:rounded-2xl border border-stone-100 outline-none resize-none text-sm md:text-base transition-all" placeholder="Nhập mô tả ngắn cho danh mục..." value={catFormData.description} onChange={e => setCatFormData({ ...catFormData, description: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Hình ảnh danh mục</label>
                                            <FileHandler
                                                objectId={catFormData.id!}
                                                objectType="category"
                                                allowUpload={true}
                                                allowDelete={true}
                                                onUploadSuccess={(data) => setCatFormData(prev => ({ ...prev, image: data.url || data.path }))}
                                                refreshTrigger={catFormData.image}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 md:py-5 bg-floral-deep text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm tracking-[0.2em] uppercase shadow-xl hover:bg-stone-800 transition-all flex items-center justify-center gap-3">
                                    <Save size={18} /> LƯU DANH MỤC
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Xóa danh mục?"
                message="Tất cả dữ liệu danh mục sẽ bị xóa. Hành động này không thể hoàn tác."
                onConfirm={handleDeleteCategory}
                onCancel={() => setConfirmDelete({ isOpen: false, catId: null })}
                confirmText="XÓA NGAY"
                type="danger"
            />
        </>
    );
};
