import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
    PerspectiveCamera, 
    ContactShadows, 
    Html, 
    Float, 
    MeshDistortMaterial,
    Sphere,
    PresentationControls,
    Sparkles
} from '@react-three/drei';
import * as THREE from 'three';
import { FileHandler } from './FileHandler';
import { api, triggerToast } from '../backend';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Star, Heart, Info } from 'lucide-react';
import { Product } from '../types';

interface ProductExhibitProps {
    product: Product;
}

const ProductExhibit: React.FC<ProductExhibitProps> = ({ product }) => {
    const cardRef = useRef<THREE.Mesh>(null);
    
    // Auto-rotation and tilt effect
    useFrame((state) => {
        if (cardRef.current) {
            const t = state.clock.getElapsedTime();
            cardRef.current.rotation.y = Math.sin(t * 0.3) * 0.1; // Smoother, slower rotation
            cardRef.current.position.y = Math.sin(t * 1.0) * 0.05; // Softer floating
        }
    });

    return (
        <group>
            {/* Main Product Card */}
            <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
                <mesh ref={cardRef} castShadow receiveShadow>
                    {/* The physical back and sides of the card */}
                    <boxGeometry args={[3.2, 4.5, 0.15]} />
                    <meshStandardMaterial attach="material-0" color="#ffffff" metalness={0.2} roughness={0.1} />
                    <meshStandardMaterial attach="material-1" color="#ffffff" metalness={0.2} roughness={0.1} />
                    <meshStandardMaterial attach="material-2" color="#ffffff" metalness={0.2} roughness={0.1} />
                    <meshStandardMaterial attach="material-3" color="#ffffff" metalness={0.2} roughness={0.1} />
                    
                    {/* Front face is solid to sit behind the HTML */}
                    <meshStandardMaterial attach="material-4" color="#ffffff" metalness={0.1} roughness={0.05} />
                    
                    {/* Back face */}
                    <meshStandardMaterial attach="material-5" color="#FFF5F7" metalness={0.3} roughness={0.05} />
                    
                    {/* HTML Overlay attached perfectly to the front face of the 3D box */}
                    <Html 
                        transform 
                        center 
                        position={[0, 0, 0.08]} 
                        distanceFactor={4.5} 
                        zIndexRange={[100, 0]}
                        occlude="blending"
                    >
                        {/* We embed the actual DOM image component inside the 3D rotating frame! */}
                        <div className="w-[340px] h-[480px] bg-white rounded-[2rem] overflow-hidden shadow-xl border border-stone-100 pointer-events-auto flex items-center justify-center p-2">
                            <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-stone-50">
                                <FileHandler
                                    objectId={product.id}
                                    objectType="product"
                                    viewOnly={true}
                                    fallbackImage={product.image}
                                    className="w-full h-full rounded-none"
                                />
                            </div>
                        </div>
                    </Html>

                    {/* Subtle Edge/Border Highlight */}
                    <mesh position={[0, 0, 0]} scale={[1.02, 1.02, 1.1]}>
                        <boxGeometry args={[3.2, 4.5, 0.15]} />
                        <meshBasicMaterial color="#D88C9A" transparent opacity={0.05} wireframe />
                    </mesh>
                </mesh>

                {/* Floating Elements (Sparkles & Mini Orbs) */}
                <Sparkles count={30} scale={5} size={2} speed={0.2} opacity={0.8} color="#D88C9A" />
                <Sparkles count={15} scale={6} size={3} speed={0.1} opacity={0.4} color="#C5A059" />
                
                {/* Elegant floating orbs */}
                <Sphere args={[0.08, 32, 32]} position={[-1.8, 2, 0.5]}>
                    <MeshDistortMaterial color="#C5A059" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0} metalness={0.8} />
                </Sphere>
                <Sphere args={[0.06, 32, 32]} position={[1.5, -2, 0.8]}>
                    <MeshDistortMaterial color="#D88C9A" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0} metalness={0.8} />
                </Sphere>

                {/* Info Tags in 3D Space - Light Theme */}
                <Html position={[1.8, 1.2, 0.2]} center distanceFactor={10}>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-px bg-floral-rose/30 mb-2" />
                        <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-bold text-floral-deep uppercase tracking-[0.2em] border border-stone-100 whitespace-nowrap shadow-lg">
                            <span className="inline-block w-1.5 h-1.5 bg-floral-gold rounded-full mr-2" />
                            Premium Quality
                        </span>
                    </div>
                </Html>

                <Html position={[-1.8, -1.8, 0.2]} center distanceFactor={10}>
                    <span className="px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-2xl text-[13px] font-bold text-floral-rose shadow-xl border border-stone-100">
                        {product.price.toLocaleString()}đ
                    </span>
                </Html>
            </Float>

            {/* Background Decorative Element - Soft Pastel */}
            <mesh position={[0, 0, -3]}>
                <sphereGeometry args={[5, 64, 64]} />
                <MeshDistortMaterial
                    color="#FFF5F7"
                    speed={1}
                    distort={0.2}
                    radius={1}
                    transparent
                    opacity={0.6}
                    roughness={0.2}
                />
            </mesh>
        </group>
    );
};

interface Interactive3DProductCardProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product) => void;
}

export const Interactive3DProductCard: React.FC<Interactive3DProductCardProps> = ({
    product,
    isOpen,
    onClose,
    onAddToCart
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-0 md:p-8 overflow-hidden">
                    {/* Backdrop - Light Theme Concept */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-white/95 backdrop-blur-xl"
                    />

                    {/* Main Container - Airy and Elegant */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 30, stiffness: 200 }}
                        className="relative w-full max-w-7xl h-full md:h-[85vh] bg-transparent flex flex-col md:flex-row overflow-hidden pointer-events-auto"
                    >
                        {/* Close button */}
                        <motion.button
                            whileHover={{ scale: 1.05, rotate: 90 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="absolute top-6 right-6 z-[300] w-12 h-12 bg-white hover:bg-stone-50 rounded-full flex items-center justify-center text-stone-400 hover:text-floral-rose transition-all shadow-sm border border-stone-100"
                        >
                            <X size={24} />
                        </motion.button>

                        {/* 3D Scene Section */}
                        <div className="flex-1 relative h-[50vh] md:h-auto cursor-grab active:cursor-grabbing pb-8 md:pb-0">
                            <Canvas shadows dpr={[1, 2]}>
                                <Suspense fallback={null}>
                                    <PerspectiveCamera makeDefault position={[0, 0, 11]} fov={35} />
                                    
                                    {/* Soft, natural lighting */}
                                    <ambientLight intensity={0.8} color="#ffffff" />
                                    <spotLight position={[5, 10, 5]} angle={0.25} penumbra={1} intensity={1} shadow-mapSize={[1024, 1024]} castShadow color="#FFF5F7" />
                                    <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#ffffff" />
                                    
                                    <PresentationControls
                                        global
                                        rotation={[0, 0.1, 0]}
                                        polar={[-Math.PI / 12, Math.PI / 12]}
                                        azimuth={[-Math.PI / 8, Math.PI / 8]}
                                        config={{ mass: 1, tension: 170, friction: 26 }} // Smoother return spring
                                    >
                                        <ProductExhibit product={product} />
                                    </PresentationControls>

                                    {/* Floor Reflector & Shadows - Light Theme */}
                                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]} receiveShadow>
                                        <planeGeometry args={[50, 50]} />
                                        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
                                    </mesh>

                                    <ContactShadows position={[0, -3.4, 0]} opacity={0.3} scale={15} blur={3} far={5} color="#D88C9A" />
                                </Suspense>
                            </Canvas>

                            {/* Interaction Hint */}
                            <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-12 z-10 flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-2.5 rounded-full border border-stone-100 shadow-sm pointer-events-none">
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 rounded-full bg-floral-rose animate-bounce" />
                                    <div className="w-1 h-1 rounded-full bg-floral-rose animate-bounce delay-100" />
                                    <div className="w-1 h-1 rounded-full bg-floral-rose animate-bounce delay-200" />
                                </div>
                                <span className="text-[9px] font-bold text-floral-deep/50 tracking-[0.2em] uppercase">Tương tác xoay 360°</span>
                            </div>
                        </div>

                        {/* Right Content Section - Elegant & Air */}
                        <div className="w-full md:w-[45%] p-8 md:p-16 flex flex-col justify-center bg-transparent z-[100] h-[50vh] md:h-auto overflow-y-auto custom-scrollbar">
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
                            >
                                <span className="inline-block px-4 py-1.5 bg-floral-rose/10 text-floral-rose rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-floral-rose/20">
                                    Exclusive Collection
                                </span>
                                
                                <h1 className="font-serif text-3xl lg:text-5xl text-floral-deep mb-4 uppercase tracking-tight leading-[1.1]">
                                    {product.name}
                                </h1>
                                
                                <div className="flex items-center gap-4 mb-8 text-stone-500">
                                    <div className="flex items-center gap-1 text-floral-gold scale-90 origin-left">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                                    </div>
                                    <span className="text-xs font-bold tracking-widest">(4.9/5)</span>
                                </div>

                                <p className="text-stone-500 font-light text-base leading-relaxed mb-10 italic">
                                    "{product.description || 'Sản phẩm nghệ thuật độc bản từ ChinChin.'}"
                                </p>

                                <div className="flex flex-col gap-4 mb-10">
                                    <div className="flex items-center justify-between py-4 border-b border-stone-100">
                                        <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold">Giá Niêm Yết</span>
                                        <span className="text-2xl text-floral-rose font-bold">{product.price.toLocaleString()}đ</span>
                                    </div>
                                    <div className="flex items-center justify-between py-4 border-b border-stone-100">
                                        <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold">Tình Trạng</span>
                                        <span className="flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-widest text-[10px] px-3 py-1 bg-emerald-50 rounded-full">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Sẵn có
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <motion.button
                                        whileHover={{ y: -2, backgroundColor: '#2D1B1E' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onAddToCart(product)}
                                        className="flex-grow py-4 bg-floral-deep text-white rounded-xl font-bold text-[11px] md:text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-floral-deep/20 z-50 pointer-events-auto"
                                    >
                                        <ShoppingBag size={18} />
                                        THÊM VÀO GIỎ
                                    </motion.button>
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.05, backgroundColor: '#FFF5F7' }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => triggerToast("Đã thêm vào danh sách yêu thích!", "success")}
                                        className="w-14 h-14 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-stone-400 hover:text-floral-rose hover:border-floral-rose/30 transition-all duration-300 shadow-sm z-50 pointer-events-auto"
                                    >
                                        <Heart size={20} />
                                    </motion.button>
                                </div>

                                <div className="mt-12 flex items-center gap-4 text-stone-200">
                                    <div className="flex-1 h-px bg-stone-100" />
                                    <Info size={14} className="text-stone-300" />
                                    <div className="flex-1 h-px bg-stone-100" />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
