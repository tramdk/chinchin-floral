import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit2, Trash2, X, Save, Plus } from 'lucide-react';
import { Product, Category } from '../../../types';
import { FileHandler } from '../../../components/FileHandler';
import { api, triggerToast } from '../../../backend';
import { ConfirmModal } from '../../../components/ConfirmModal';

interface ProductManagerProps {
    products: Product[];
    categories: Category[];
    onRefresh: () => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ products, categories, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '', category: 'hoa', price: 0, image: '', description: '', badge: ''
    });

    const [selectedCategory, setSelectedCategory] = useState<string | number>('all');
    const [isIdVisible, setIsIdVisible] = useState(false);

    // Confirm Modal State
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; productId: string | number | null }>({
        isOpen: false,
        productId: null
    });

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(p.id).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || String(p.category) === String(selectedCategory);
        return matchesSearch && matchesCategory;
    });

    const handleSaveProduct = async (e: React.FormEvent) => {
        // ... (same as before)
        e.preventDefault();
        try {
            const payload = {
                id: formData.id,
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                categoryId: formData.category, // Map category ID to categoryId for backend
                image: formData.image,
                badge: formData.badge
            };

            if (editingProduct) {
                await api.products.update(editingProduct.id, { ...payload, id: editingProduct.id });
            } else {
                await api.products.create(payload);
            }
            onRefresh();
            setIsModalOpen(false);
            triggerToast("Đã lưu sản phẩm thành công", "success");
        } catch (err) {
            // API handles toast
        }
    };

    const handleDeleteProduct = async () => {
        if (!confirmDelete.productId) return;

        try {
            await api.products.delete(confirmDelete.productId);
            onRefresh();
            triggerToast("Đã xóa sản phẩm", "info");
        } catch (err) { }
        setConfirmDelete({ isOpen: false, productId: null });
    };

    const openAddModal = () => {
        const newId = crypto.randomUUID();
        setEditingProduct(null);
        setFormData({ id: newId, name: '', category: String(categories[0]?.id || 'hoa'), price: 0, image: '', description: '', badge: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData(product);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
                <div className="p-5 md:p-8 border-b border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto flex-1">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                            <input
                                type="text"
                                placeholder="Tìm theo tên hoặc ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-stone-100 border-none rounded-xl md:rounded-2xl focus:ring-2 focus:ring-floral-rose/20 transition-all text-sm outline-none"
                            />
                        </div>
                        <select
                            value={String(selectedCategory)}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full md:w-48 px-6 py-4 bg-stone-100 border-none rounded-xl md:rounded-2xl focus:ring-2 focus:ring-floral-rose/20 transition-all text-sm outline-none appearance-none cursor-pointer text-stone-600 font-bold"
                        >
                            <option value="all">Tất cả danh mục</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="w-full md:w-auto px-8 py-4 bg-floral-rose text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:bg-floral-deep transition-all shadow-xl shadow-floral-rose/20"
                    >
                        <Plus size={20} /> THÊM SẢN PHẨM
                    </button>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-stone-200/50">
                                <th className="px-8 py-6 text-[12px] font-bold uppercase tracking-widest text-stone-900">Sản phẩm</th>
                                <th className="px-8 py-6 text-[12px] font-bold uppercase tracking-widest text-stone-900">Danh mục</th>
                                <th className="px-8 py-6 text-[12px] font-bold uppercase tracking-widest text-stone-900">Giá</th>
                                <th className="px-8 py-6 text-[12px] font-bold uppercase tracking-widest text-stone-900 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="group hover:bg-stone-200/30 transition-colors">
                                    <td className="px-8 py-6 min-w-[300px]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 shrink-0 bg-stone-100 rounded-xl overflow-hidden border border-stone-100">
                                                <FileHandler objectId={product.id} objectType="product" viewOnly={true} className="w-full h-full" fallbackImage={product.image} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-floral-deep text-sm mb-0.5 truncate">{product.name}</p>
                                                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">ID: {String(product.id).substring(0, 8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-stone-500 uppercase tracking-wider">
                                        {categories.find(c => c.id === product.category)?.name || product.category}
                                    </td>
                                    <td className="px-8 py-6 font-mono text-sm font-bold text-floral-rose">
                                        {product.price.toLocaleString()}đ
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditModal(product)} className="p-3 bg-white text-stone-400 hover:text-floral-gold rounded-xl shadow-sm border border-stone-100"><Edit2 size={16} /></button>
                                            <button onClick={() => setConfirmDelete({ isOpen: true, productId: product.id })} className="p-3 bg-white text-stone-400 hover:text-red-500 rounded-xl shadow-sm border border-stone-100"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden grid grid-cols-2 gap-3 p-3 bg-stone-50/50">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="bg-white p-3 rounded-2xl border border-stone-100 shadow-sm flex flex-col h-full">
                            <div className="relative aspect-square w-full mb-3 bg-stone-100 rounded-xl overflow-hidden border border-stone-100">
                                <FileHandler objectId={product.id} objectType="product" viewOnly={true} className="w-full h-full" fallbackImage={product.image} />
                            </div>
                            <div className="flex-grow min-w-0">
                                <p className="font-bold text-floral-deep text-xs mb-1 line-clamp-2 h-8 leading-tight">{product.name}</p>
                                <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest leading-none mb-2">
                                    {categories.find(c => c.id === product.category)?.name || product.category}
                                </p>
                                <p className="text-floral-rose font-bold text-xs">
                                    {product.price.toLocaleString()}đ
                                </p>
                            </div>
                            <div className="flex gap-2 mt-3 pt-3 border-t border-stone-50">
                                <button onClick={() => openEditModal(product)} className="flex-1 py-2 bg-stone-50 text-stone-400 rounded-lg flex items-center justify-center active:bg-floral-gold active:text-white transition-colors"><Edit2 size={14} /></button>
                                <button onClick={() => setConfirmDelete({ isOpen: true, productId: product.id })} className="flex-1 py-2 bg-stone-50 text-stone-400 rounded-lg flex items-center justify-center active:bg-red-500 active:text-white transition-colors"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-floral-deep/60 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-4xl bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col p-6 md:p-10 max-h-[95vh] md:max-h-[90vh] overflow-y-auto" >
                            <div className="flex justify-between items-center mb-6 md:mb-8">
                                <h3 className="font-serif text-2xl md:text-3xl text-floral-deep">{editingProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm Mới'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Tên sản phẩm</label>
                                        <input required type="text" className="w-full px-5 md:px-6 py-3 md:py-4 bg-stone-100 rounded-xl md:rounded-2xl border border-stone-100 outline-none focus:ring-2 focus:ring-floral-rose/20 text-sm md:text-base transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Danh mục</label>
                                            <select className="w-full px-5 md:px-6 py-3 md:py-4 bg-stone-100 rounded-xl md:rounded-2xl border border-stone-100 outline-none text-sm md:text-base appearance-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Giá (VNĐ)</label>
                                            <input required type="number" className="w-full px-5 md:px-6 py-3 md:py-4 bg-stone-100 rounded-xl md:rounded-2xl border border-stone-100 outline-none font-mono text-sm md:text-base" value={formData.price === 0 ? '' : formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Mô tả</label>
                                        <textarea rows={3} className="w-full px-5 md:px-6 py-3 md:py-4 bg-stone-100 rounded-xl md:rounded-2xl border border-stone-100 outline-none resize-none text-sm md:text-base transition-all" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Nhãn (Badge)</label>
                                        <input type="text" className="w-full px-5 md:px-6 py-3 md:py-4 bg-stone-100 rounded-xl md:rounded-2xl border border-stone-100 outline-none text-sm md:text-base" placeholder="Ví dụ: Bestseller, Mới..." value={formData.badge} onChange={e => setFormData({ ...formData, badge: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Hình ảnh sản phẩm</label>
                                        <div className="space-y-4">
                                            <FileHandler
                                                objectId={formData.id || 'new'}
                                                objectType="product"
                                                allowUpload={true}
                                                allowDelete={true}
                                                onUploadSuccess={(data) => setFormData(prev => ({ ...prev, image: data.url || data.path }))}
                                                refreshTrigger={formData.image}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="col-span-full py-4 md:py-5 bg-floral-deep text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm tracking-[0.2em] uppercase shadow-xl hover:bg-stone-800 transition-all flex items-center justify-center gap-3">
                                    <Save size={18} /> LƯU THAY ĐỔI
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Xóa sản phẩm?"
                message="Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa khỏi hệ thống."
                onConfirm={handleDeleteProduct}
                onCancel={() => setConfirmDelete({ isOpen: false, productId: null })}
                confirmText="XÓA NGAY"
                type="danger"
            />
        </>
    );
};
