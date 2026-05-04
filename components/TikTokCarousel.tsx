import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../backend';
import { BACKEND_URL, ENDPOINTS } from '../constants';
import { FileHandler } from './FileHandler';

const FALLBACK_ITEMS = [
  {
    id: 'f1',
    image: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&q=80&w=800",
    title: "Rose Symphony",
    desc: "Hòa âm của những đóa hồng tuyệt sắc",
    link: "/category/1"
  },
  {
    id: 'f2',
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=800",
    title: "Spring Whisper",
    desc: "Lời thì thầm của mùa xuân rực rỡ",
    link: "/category/2"
  },
  {
    id: 'f3',
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800",
    title: "Golden Hour",
    desc: "Ánh sáng vàng rực rỡ của buổi hoàng hôn",
    link: "/category/3"
  },
  {
    id: 'f4',
    image: "https://images.unsplash.com/photo-1464852047516-e50558a38162?auto=format&fit=crop&q=80&w=800",
    title: "Velvet Dream",
    desc: "Giấc mơ nhung lụa ngọt ngào",
    link: "/category/4"
  }
];

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1522673607200-1648832cee33?auto=format&fit=crop&q=80&w=800";

export const TikTokCarousel: React.FC = () => {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const requestRef = useRef<number>(undefined);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [items, setItems] = useState<any[]>([]);

  const hoveredIndexRef = useRef<number | null>(null);
  const itemsLengthRef = useRef(FALLBACK_ITEMS.length);

  useEffect(() => {
    hoveredIndexRef.current = hoveredIndex;
  }, [hoveredIndex]);

  useEffect(() => {
    api.products.getAll().then(products => {
      if (!products || products.length === 0) return;

      const featured = products.filter((p: any) => p.badge === 'Mới về' || p.badge === 'Luxury' || p.category === 'combo');
      const selected = featured.length >= 4 ? featured : products;

      const mapped = selected.slice(0, 8).map((p: any) => {
        let imageUrl = p.image || p.imageUrl;
        
        // Handle relative paths from backend
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = ENDPOINTS.FILES.VIEW(imageUrl);
        }
        
        return {
          id: p.id,
          image: (imageUrl && imageUrl.trim() !== '') ? imageUrl : PLACEHOLDER_IMAGE,
          title: p.name,
          desc: p.description || `${p.price?.toLocaleString('vi-VN')} ₫`,
          link: `/?product=${p.id}`
        };
      });
      
      if (mapped.length > 0) setItems(mapped);
    }).catch(e => {
      setItems([]); // Ensure we trigger fallback to FALLBACK_ITEMS
    });
  }, []);

  const displayItems = items.length > 0 ? items : FALLBACK_ITEMS;

  useEffect(() => {
    itemsLengthRef.current = displayItems.length;
  }, [displayItems]);

  const animate = () => {
    if (hoveredIndexRef.current !== null) {
      // Calculate target angle to center the hovered card
      const targetAngle = (360 - hoveredIndexRef.current * (360 / itemsLengthRef.current)) % 360;

      // Shortest path interpolation
      let diff = targetAngle - angleRef.current;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      // Ease towards the target angle
      angleRef.current += diff * 0.06;
      angleRef.current = (angleRef.current + 360) % 360;
    } else {
      // Normal rotation speed when not hovered
      angleRef.current = (angleRef.current + 0.15) % 360;
    }

    if (carouselRef.current) {
      carouselRef.current.style.transform = `rotateY(${angleRef.current}deg)`;
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-[700px] md:h-[800px] flex items-center justify-center bg-white py-20 z-30">

      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 text-center">

        <h2 className="font-serif text-3xl md:text-5xl text-floral-deep leading-tight">
          Bộ Sưu Tập <span className="italic text-floral-rose">Cao Cấp</span>
        </h2>
      </div>

      <div
        className="absolute inset-0 z-10 w-full flex items-center justify-center"
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative w-[130px] h-[190px] sm:w-[180px] sm:h-[260px] md:w-[220px] md:h-[320px] lg:w-[250px] lg:h-[360px]"
          style={{ transform: 'rotateX(-8deg)', transformStyle: 'preserve-3d' }}
        >
          <div
            ref={carouselRef}
            className="absolute inset-0"
            style={{
              '--quantity': displayItems.length,
              transformStyle: 'preserve-3d'
            } as React.CSSProperties}
          >
            {displayItems.map((item, index) => {
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={index}
                  className="absolute inset-0"
                  style={{
                    transform: `rotateY(calc((360deg / var(--quantity)) * ${index})) translateZ(clamp(180px, 45vw, 420px))`,
                    backfaceVisibility: 'hidden'
                  }}
                >
                  <div
                    onClick={() => navigate(item.link)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`relative w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden border-[4px] md:border-[6px] border-floral-petal cursor-pointer bg-floral-deep group transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isHovered
                      ? 'scale-[1.3] md:scale-[1.4] -translate-y-8 shadow-[0_0_0_2px_#D88C9A,0_40px_80px_-15px_rgba(216,140,154,0.7)]'
                      : 'scale-100 shadow-[0_0_0_1px_#C5A059,0_20px_50px_-15px_rgba(45,27,30,0.5)] hover:scale-[1.05]'
                      }`}
                  >
                    {/* Subtle Inner Glow */}
                    <div className="absolute inset-0 border border-black/10 rounded-xl md:rounded-[1.6rem] z-10 pointer-events-none" />
                    <FileHandler
                      objectId={item.id}
                      objectType="product"
                      viewOnly={true}
                      fallbackImage={item.image}
                      className={`w-full h-full rounded-none transition-transform duration-1000 ${isHovered ? 'scale-110' : 'group-hover:scale-105'}`}
                    />

                    {/* Info Overlay */}
                    <div className={`absolute inset-x-0 bottom-0 p-5 md:p-8 bg-gradient-to-t from-[#2D1B1E]/95 via-[#2D1B1E]/60 to-transparent flex flex-col justify-end h-3/4 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <h3 className={`text-floral-gold font-serif text-xl md:text-2xl transition-transform duration-500 ease-out ${isHovered ? 'translate-y-0' : 'translate-y-6 group-hover:translate-y-0'}`}>
                        {item.title}
                      </h3>
                      <div className={`w-10 h-[1px] bg-floral-rose/60 my-2 md:my-3 transition-all duration-500 ease-out delay-75 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0'}`} />
                      <p className={`text-floral-petal/90 text-xs md:text-sm font-light line-clamp-2 leading-relaxed transition-transform duration-500 ease-out delay-150 ${isHovered ? 'translate-y-0' : 'translate-y-6 group-hover:translate-y-0'}`}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
