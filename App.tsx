
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { FloralScene } from './components/FloralScene';
import { PetalRain } from './components/PetalRain';
import { ProductSection } from './components/ProductSection';
import { TikTokCarousel } from './components/TikTokCarousel';

// Lazy load heavy components and pages (Vercel Best Practice: bundle-dynamic-imports)
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AboutUs = React.lazy(() => import('./pages/AboutUs').then(m => ({ default: m.AboutUs })));
const Posts = React.lazy(() => import('./pages/Posts').then(m => ({ default: m.Posts })));
const PostDetail = React.lazy(() => import('./pages/PostDetail').then(m => ({ default: m.PostDetail })));
const CartView = React.lazy(() => import('./pages/CartView').then(m => ({ default: m.CartView })));

import { ShoppingBag, Menu, X, Heart, MapPin, Camera, Ghost, Calendar, User, LogOut, Settings, Lock, Info, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ENDPOINTS, ABOUT_PREVIEW_CONTENT } from './constants';
import { CartProvider, useCart } from './components/CartContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import { ToastProvider, useToast } from './components/ToastContext';
import { UserProfile } from './types';
import api, { checkCacheValidity } from './backend';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const FeatureItem = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="flex flex-col items-center text-center p-6 group">
    <div className="w-16 h-16 rounded-full bg-floral-rose/10 flex items-center justify-center mb-4 group-hover:bg-floral-rose/20 transition-colors">
      <Icon className="text-floral-rose" size={28} />
    </div>
    <h3 className="font-serif text-2xl mb-2 text-floral-deep">{title}</h3>
    <p className="text-base text-stone-500 leading-relaxed">{desc}</p>
  </div>
);

const Home = ({ scrollToSection }: { scrollToSection: (id: string) => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
    <header id="hero" className="relative h-[90vh] md:h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-floral-petal to-[#FCE7EB]">
      <FloralScene />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-floral-petal/10 to-floral-petal z-0" />
      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <span className="inline-block mb-6 px-6 py-2 border border-floral-rose text-floral-rose text-[10px] md:text-[12px] tracking-[0.3em] uppercase font-bold rounded-full bg-white/50 backdrop-blur-sm">
            Khai trương ưu đãi -20%
          </span>
          <h1 className="font-serif text-5xl md:text-8xl lg:text-9xl font-medium leading-[1] md:leading-[0.9] mb-10 text-floral-deep">Trao Gửi <br /><span className="italic font-normal text-floral-rose">Cảm Xúc</span></h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-stone-600 font-light leading-relaxed mb-12">Tuyển tập những giỏ hoa và trái cây nghệ thuật được thiết kế riêng cho những dịp quan trọng nhất của bạn.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <button onClick={() => scrollToSection('collections')} className="px-12 py-5 bg-floral-rose text-white rounded-full font-bold text-base tracking-widest hover:bg-floral-deep transition-all shadow-xl uppercase">KHÁM PHÁ NGAY</button>
            <Link to="/about" className="px-12 py-5 border border-floral-rose text-floral-rose rounded-full font-bold text-base tracking-widest hover:bg-floral-rose hover:text-white transition-all backdrop-blur-sm uppercase flex items-center justify-center">VỀ CHÚNG TÔI</Link>
          </div>
        </motion.div>
      </div>
    </header>
    <main>
      <section id="features" className="py-24 bg-white border-b border-stone-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <FeatureItem icon={Camera} title="Ảnh Thực Tế" desc="Chụp ảnh sản phẩm hoàn thiện gửi khách duyệt trước khi giao." />
            <FeatureItem icon={Calendar} title="Giao Giờ Vàng" desc="Cam kết giao đúng khung giờ yêu cầu để tạo sự bất ngờ tuyệt đối." />
            <FeatureItem icon={Ghost} title="Tặng Ẩn Danh" desc="Dịch vụ tặng quà bí mật dành cho những dịp đặc biệt." />
            <FeatureItem icon={MapPin} title="Giao Tận Nơi" desc="Miễn phí vận chuyển cho các đơn hàng trong bán kính 5km." />
          </div>
        </div>
      </section>
      <section id="tiktok-carousel">
        <TikTokCarousel />
      </section>
      <section id="collections" className="py-24 scroll-mt-32">
        <ProductSection />
      </section>
      <section id="about-preview" className="py-24 bg-floral-deep text-white relative overflow-hidden">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="text-floral-rose text-[14px] font-bold tracking-[0.2em] uppercase mb-6 block">Về Tiệm hoa của ChinChin</span>
            <h2
              className="font-serif text-5xl md:text-6xl mb-10 leading-tight"
              dangerouslySetInnerHTML={{ __html: ABOUT_PREVIEW_CONTENT.title }}
            />
            <p className="text-stone-300 text-lg md:text-xl font-light leading-relaxed">{ABOUT_PREVIEW_CONTENT.description}</p>
            <Link to="/about" className="mt-12 px-10 py-4 bg-floral-rose text-white rounded-full font-bold text-base tracking-widest hover:scale-105 transition-transform uppercase shadow-lg shadow-floral-rose/20 block w-fit">
              {ABOUT_PREVIEW_CONTENT.buttonText}
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="aspect-[3/4] rounded-3xl bg-[#3D2528] overflow-hidden shadow-2xl">
              <img src={ABOUT_PREVIEW_CONTENT.images[0]} className="w-full h-full object-cover opacity-80" alt="About 1" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="aspect-[3/4] rounded-3xl bg-[#3D2528] overflow-hidden shadow-2xl mt-16">
              <img src={ABOUT_PREVIEW_CONTENT.images[1]} className="w-full h-full object-cover opacity-80" alt="About 2" />
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  </motion.div>
);

const PostDetailWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  return id ? <PostDetail postId={id} onBack={() => navigate('/posts')} /> : null;
};

const ProtectedRoute = ({ children, user }: { children: React.ReactNode, user: UserProfile | null }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;
  return <>{children}</>;
};

const NotFound = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-32"
  >
    <div className="w-32 h-32 bg-stone-100 rounded-full flex items-center justify-center mb-8">
      <Ghost className="text-floral-rose animate-bounce" size={64} />
    </div>
    <h1 className="font-serif text-6xl md:text-8xl text-floral-deep mb-4">404</h1>
    <h2 className="font-serif text-3xl text-stone-500 mb-8 italic">Trang này đã "bay màu" hoặc chưa từng tồn tại...</h2>
    <Link to="/" className="px-12 py-5 bg-floral-rose text-white rounded-full font-bold text-base tracking-widest hover:bg-floral-deep transition-all shadow-xl uppercase">
      QUAY VỀ TRANG CHỦ
    </Link>
  </motion.div>
);

const AppContent: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pendingCartAction, setPendingCartAction] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();
  const { user, login, logout } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // TikTok Navbar State
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0, scale: 0.8 });
  const navRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Auto-clean stale cache
  useEffect(() => {
    checkCacheValidity();
  }, []);

  // Listen for login prompt requests
  useEffect(() => {
    const handleLoginPrompt = () => {
      setLoginPromptOpen(true);
    };
    window.addEventListener('chinchin-login-prompt', handleLoginPrompt);
    return () => window.removeEventListener('chinchin-login-prompt', handleLoginPrompt);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const data = await api.auth.login({ email, password });

      const userProfile: UserProfile = {
        name: data.user?.fullName || 'Thành viên',
        email: data.user.email,
        role: data.user?.roles?.length ? data.user.roles[0].toLowerCase() : 'user'
      };

      // Use AuthContext login
      login(data.token || data.accessToken, data.refreshToken, userProfile);

      setAuthModalOpen(false);
      setEmail('');
      setPassword('');
      addToast(`Chào mừng trở lại, ${userProfile.name}!`, 'success');

      if (pendingCartAction) {
        setPendingCartAction(false);
        navigate('/cart');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Email hoặc mật khẩu không chính xác');
      // Toast already triggered by handleResponse in backend.ts
    } finally {
      setAuthLoading(false);
    }

  };

  const handleLogout = () => {
    logout();
    navigate('/');
    addToast('Bạn đã đăng xuất thành công.', 'info');
  };

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    const performScroll = () => {
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    };

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(performScroll, 500);
    } else {
      performScroll();
    }
  };

  return (
    <div className="min-h-screen bg-floral-petal text-floral-deep selection:bg-floral-rose selection:text-white overflow-x-hidden">
      <ScrollToTop />
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || location.pathname !== '/' ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 cursor-pointer group" aria-label="Trang chủ Tiệm hoa của ChinChin">
            <div className="w-12 h-12 bg-floral-rose rounded-full flex items-center justify-center text-white font-serif font-bold text-3xl shadow-sm group-hover:rotate-12 transition-transform" aria-hidden="true">❁</div>
            <span className="font-serif font-bold text-2xl tracking-tighter text-floral-deep hidden sm:block">Tiệm hoa của ChinChin</span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {/* TikTok-Style Modern Pill Navbar */}
            <div 
              className="flex items-center p-1.5 bg-white/20 backdrop-blur-xl border border-white/40 shadow-[0_15px_35px_rgba(0,0,0,0.05)] rounded-full relative"
              onMouseLeave={() => setPillStyle(prev => ({ ...prev, opacity: 0, scale: 0.8 }))}
            >
              {/* Sliding Indicator */}
              <div 
                className="absolute top-1.5 bottom-1.5 left-0 bg-floral-rose rounded-full shadow-[0_0_15px_rgba(216,140,154,0.6)] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                style={{
                  transform: `translateX(${pillStyle.left}px) scale(${pillStyle.scale})`,
                  width: `${pillStyle.width}px`,
                  opacity: pillStyle.opacity,
                }}
              />

              {[
                { label: 'Trang chủ', action: () => navigate('/'), isActive: location.pathname === '/' },
                { label: 'Sản phẩm', action: () => { if(location.pathname !== '/') navigate('/'); setTimeout(() => scrollToSection('collections'), 100); }, isActive: false },
                { label: 'Bài viết', action: () => navigate('/posts'), isActive: location.pathname.startsWith('/posts') },
                { label: 'Về chúng tôi', action: () => navigate('/about'), isActive: location.pathname === '/about' },
                ...(user?.role === 'admin' ? [{ label: 'Quản lý', action: () => navigate('/admin'), isActive: location.pathname === '/admin' }] : [])
              ].map((item, i) => (
                <button
                  key={i}
                  ref={el => { navRefs.current[i] = el; }}
                  onMouseEnter={() => {
                    const el = navRefs.current[i];
                    if (el) {
                      setPillStyle({
                        left: el.offsetLeft,
                        width: el.offsetWidth,
                        opacity: 1,
                        scale: 1
                      });
                    }
                  }}
                  onClick={item.action}
                  className={`relative z-10 px-6 py-2.5 text-[12px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 rounded-full ${
                    item.isActive && pillStyle.opacity === 0 ? 'text-floral-rose' : 'text-floral-deep hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-[1px] bg-stone-200" />

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-stone-400 normal-case font-normal leading-none">{user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</span>
                  <span className="text-floral-deep normal-case tracking-normal font-bold">{user.name}</span>
                </div>
                <button onClick={handleLogout} className="p-2 text-stone-400 hover:text-floral-rose transition-colors" aria-label="Đăng xuất">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button onClick={() => { setAuthError(null); setAuthModalOpen(true); }} className="flex items-center gap-2 text-floral-deep hover:text-floral-rose transition-colors">
                <User size={18} />
                <span>ĐĂNG NHẬP</span>
              </button>
            )}

            <Link to="/cart" className="flex items-center gap-3 px-6 py-3 bg-floral-deep text-white rounded-full hover:bg-stone-800 transition-all shadow-md group relative">
              <ShoppingBag size={18} id="cart-icon" className="group-hover:scale-110 transition-transform" />
              <span>Giỏ hàng ({cartItems.length})</span>
              <AnimatePresence>
                {cartItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-floral-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white"
                  >
                    {cartItems.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>

          <button className="lg:hidden text-floral-deep p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Đóng menu" : "Mở menu"}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white border-b border-stone-100 overflow-hidden" >
              <div className="container mx-auto px-6 py-8 flex flex-col gap-6 text-[12px] font-bold tracking-[0.2em] uppercase">
                <Link to="/" onClick={() => setMenuOpen(false)} className="text-left py-2 border-b border-stone-50">Trang chủ</Link>
                <button onClick={() => scrollToSection('collections')} className="text-left py-2 border-b border-stone-50">Sản phẩm</button>
                <Link to="/posts" onClick={() => setMenuOpen(false)} className="text-left py-2 border-b border-stone-50">Bài viết</Link>
                <Link to="/about" onClick={() => setMenuOpen(false)} className="text-left py-2 border-b border-stone-50">Về chúng tôi</Link>
                <Link to="/cart" onClick={() => setMenuOpen(false)} className="text-left py-2 border-b border-stone-50 flex items-center gap-2">
                  <ShoppingBag size={16} /> Giỏ hàng ({cartItems.length})
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-left py-2 border-b border-stone-50 text-floral-gold flex items-center gap-2">
                    <Settings size={16} /> QUẢN LÝ HỆ THỐNG
                  </Link>
                )}
                {!user ? (
                  <button onClick={() => { setAuthModalOpen(true); setMenuOpen(false); }} className="text-left py-2 text-floral-rose flex items-center gap-2">
                    <User size={16} /> ĐĂNG NHẬP
                  </button>
                ) : (
                  <button onClick={handleLogout} className="text-left py-2 text-red-400 flex items-center gap-2">
                    <LogOut size={16} /> ĐĂNG XUẤT
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence mode="wait">
        <React.Suspense fallback={
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-4 border-floral-rose border-t-transparent rounded-full animate-spin" />
            <p className="font-serif text-xl text-floral-deep italic">Đang chuẩn bị không gian...</p>
          </div>
        }>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home scrollToSection={scrollToSection} />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/posts" element={<Posts onSelectPost={(id) => navigate(`/posts/${id}`)} />} />
            <Route path="/posts/:id" element={<PostDetailWrapper />} />
            <Route path="/cart" element={<CartView />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute user={user}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </React.Suspense>
      </AnimatePresence>

      <footer className="bg-white border-t border-stone-200 py-20">
        <div className="container mx-auto px-6 text-center">
          {/* Same footer code */}
          <div className="flex flex-col items-center gap-8 mb-16">
            <div className="w-14 h-14 bg-floral-rose rounded-full flex items-center justify-center text-white font-serif font-bold text-3xl shadow-sm group-hover:rotate-12 transition-transform">❁</div>
            <h4 className="font-serif text-3xl text-floral-deep">Tiệm hoa của ChinChin</h4>
            <div className="flex flex-wrap justify-center gap-6 text-stone-400 text-xs md:text-sm uppercase tracking-widest font-bold">
              <Link to="/" className="hover:text-floral-rose transition-colors">Trang chủ</Link>
              <Link to="/posts" className="hover:text-floral-rose transition-colors">Bài viết</Link>
              <Link to="/about" className="hover:text-floral-rose transition-colors">Về chúng tôi</Link>
              <button onClick={() => scrollToSection('collections')} className="uppercase hover:text-floral-rose transition-colors">Sản phẩm</button>
            </div>
          </div>
          <div className="text-[14px] text-stone-400 pt-5 border-t border-stone-100">© 2026 Tiệm hoa của ChinChin. Crafting moments with love.</div>
        </div>
      </footer>

      {/* Login Prompt Modal */}
      <AnimatePresence>
        {loginPromptOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLoginPromptOpen(false)} className="absolute inset-0 bg-floral-deep/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-sm bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 text-center shadow-2xl border border-white/40">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-floral-rose/20 text-floral-rose rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertCircle size={32} />
              </div>
              <h3 className="font-serif text-xl md:text-2xl text-floral-deep mb-4 uppercase tracking-tighter">Đăng nhập để tiếp tục</h3>
              <p className="text-stone-500/80 mb-8 md:mb-10 leading-relaxed text-sm font-medium">Bạn cần đăng nhập tài khoản thành viên để thực hiện thêm sản phẩm vào giỏ hàng.</p>
              <div className="flex flex-col gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setLoginPromptOpen(false);
                    setPendingCartAction(true);
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-4 bg-floral-rose text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:bg-floral-deep transition-all text-xs md:text-sm"
                >
                  ĐĂNG NHẬP NGAY
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setLoginPromptOpen(false);
                    setPendingCartAction(false);
                  }}
                  className="w-full py-4 text-stone-400 font-bold uppercase tracking-widest text-[10px] md:text-xs hover:text-floral-rose transition-colors"
                >
                  HỦY BỎ
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setAuthModalOpen(false); setPendingCartAction(false); }} className="absolute inset-0 bg-floral-deep/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-10 border border-white/40" >
              <div className="text-center mb-8 md:mb-10">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-floral-rose/20 text-floral-rose rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Lock size={28} />
                </div>
                <h3 className="font-serif text-2xl md:text-3xl text-floral-deep mb-2 uppercase tracking-tighter">Đăng nhập</h3>
                <p className="text-stone-500/80 text-sm font-medium">Truy cập tài khoản cao cấp của bạn</p>
              </div>
              {authError && <div className="p-4 bg-red-50 text-red-500 text-sm rounded-2xl border border-red-100 mb-6">{authError}</div>}
              <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Địa chỉ Email" className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-floral-rose/20 outline-none text-sm" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" aria-label="Mật khẩu" className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-floral-rose/20 outline-none text-sm" />
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 md:py-5 bg-floral-deep text-white rounded-2xl font-bold uppercase transition-all flex items-center justify-center gap-3 text-sm"
                >
                  {authLoading && <Loader2 className="animate-spin" size={18} />}
                  {authLoading ? 'ĐANG XỬ LÝ...' : 'TIẾP TỤC'}
                </motion.button>
              </form>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setAuthModalOpen(false); setPendingCartAction(false); }}
                className="mt-6 w-full text-stone-400 text-xs md:text-sm hover:text-floral-rose transition-colors"
              >
                Hủy bỏ
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => (
  <ToastProvider>
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  </ToastProvider>
);

export default App;
