
import { ENDPOINTS, STORAGE_KEYS } from './constants';
import { Product, Category, Post, PostCategory } from './types';

interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
}

// Variables cho Refresh Token logic
let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void, reject: (err: unknown) => void }> = [];

// Helper: Phát sự kiện Toast hệ thống
export const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
    window.dispatchEvent(new CustomEvent('chinchin-toast', {
        detail: { message, type }
    }));
};

// Helper: Xử lý refresh token
const handleRefreshToken = async (): Promise<string | null> => {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
        });
    }

    isRefreshing = true;
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const oldToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (!refreshToken) {
        isRefreshing = false;
        return null;
    }

    try {
        const response = await fetch(ENDPOINTS.AUTH.REFRESH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: oldToken, refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            const newToken = data.token || data.accessToken;
            const newRefreshToken = data.refreshToken;

            localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
            if (newRefreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

            refreshQueue.forEach(req => req.resolve(newToken));
            refreshQueue = [];
            return newToken;
        } else {
            throw new Error("Refresh failed");
        }
    } catch (err) {
        refreshQueue.forEach(req => req.reject(err));
        refreshQueue = [];
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.dispatchEvent(new Event('chinchin-require-auth'));
        return null;
    } finally {
        isRefreshing = false;
    }
};

// Helper: Xử lý phản hồi an toàn
const handleResponse = async (response: Response, originalRequest?: () => Promise<unknown>): Promise<unknown> => {
    if (response.status === 401 && originalRequest) {
        const newToken = await handleRefreshToken();
        if (newToken) {
            return originalRequest(); // Thử lại yêu cầu ban đầu
        }
        triggerToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "info");
        throw new Error("Unauthorized");
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        let errorMsg = errorData.message;
        
        // Xử lý mảng lỗi trực tiếp (vd: FluentValidation format [{PropertyName, ErrorMessage}])
        if (Array.isArray(errorData)) {
            errorMsg = errorData.map(e => e.ErrorMessage || e.message || JSON.stringify(e)).filter(Boolean).join('\n');
        } 
        // Xử lý chuẩn ProblemDetails có chứa trường errors
        else if (errorData.errors) {
            if (Array.isArray(errorData.errors)) {
                errorMsg = errorData.errors.map((e: any) => e.ErrorMessage || e.message || e).filter(Boolean).join('\n');
            } else if (typeof errorData.errors === 'object') {
                errorMsg = Object.values(errorData.errors).flat().join('\n');
            }
        }

        errorMsg = errorMsg || `Lỗi hệ thống (${response.status})`;
        
        // Chỉ trigger toast nếu không phải lỗi 401 đã xử lý ở trên
        if (response.status !== 401) triggerToast(errorMsg, "error");
        throw new Error(errorMsg);
    }

    if (response.status === 204) return true;
    return response.json().catch(() => ({}));
};

const fetchWithAuth = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
    const makeRequest = async () => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        return handleResponse(response, makeRequest) as Promise<T>;
    };

    return await makeRequest();
};

// Raw fetch wrapper for non-auth requests but still using handleResponse
const safeFetch = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    } as RequestInit);
    return handleResponse(response) as Promise<T>;
};

const extractList = <T>(data: any): T[] => {
    if (Array.isArray(data)) return data;
    return data.items || data.payload || data.data || [];
};

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 ngày tính bằng milliseconds

// Helper: Kiểm tra và xóa cache nếu quá cũ
export const checkCacheValidity = () => {
    const lastUpdated = localStorage.getItem(STORAGE_KEYS.CACHE_UPDATED);
    if (lastUpdated) {
        const age = Date.now() - parseInt(lastUpdated);
        if (age > CACHE_TTL) {
            console.warn("Cache expired. Clearing old data.");
            [STORAGE_KEYS.PRODUCTS, STORAGE_KEYS.CATEGORIES, STORAGE_KEYS.POSTS].forEach(key => {
                localStorage.removeItem(key);
            });
            localStorage.removeItem(STORAGE_KEYS.CACHE_UPDATED);
        }
    }
};

// Helper: Cập nhật cache localstorage
const updateCache = <T extends { id: string | number }>(key: string, action: 'add' | 'update' | 'delete', item?: T, id?: string | number) => {
    const localData = localStorage.getItem(key);
    if (!localData) return;

    try {
        let list = JSON.parse(localData);
        if (!Array.isArray(list)) return;

        if (action === 'add' && item) {
            list.push(item);
        } else if (action === 'update' && item) {
            list = list.map((i: any) => String(i.id) === String(item.id) ? { ...i, ...item } : i);
        } else if (action === 'delete' && id) {
            list = list.filter((i: any) => String(i.id) !== String(id));
        }

        localStorage.setItem(key, JSON.stringify(list));
        localStorage.setItem(STORAGE_KEYS.CACHE_UPDATED, Date.now().toString());
        window.dispatchEvent(new Event('storage'));
    } catch (e) {
        console.warn("Failed to update cache", e);
    }
};

export const api = {
    products: {
        getAll: () => safeFetch<any>(ENDPOINTS.PRODUCTS.BASE).then(data => {
            const list = extractList<Product>(data);
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
            localStorage.setItem(STORAGE_KEYS.CACHE_UPDATED, Date.now().toString());
            return list;
        }),
        getOne: (id: string | number) => safeFetch<Product>(ENDPOINTS.PRODUCTS.DETAIL(id)),
        create: (data: Partial<Product>) => fetchWithAuth<Product>(ENDPOINTS.PRODUCTS.BASE, { method: 'POST', body: data }).then(res => {
            updateCache(STORAGE_KEYS.PRODUCTS, 'add', res);
            return res;
        }),
        update: (id: string | number, data: Partial<Product>) => fetchWithAuth<Product>(ENDPOINTS.PRODUCTS.DETAIL(id), { method: 'PUT', body: data }).then(res => {
            updateCache(STORAGE_KEYS.PRODUCTS, 'update', res);
            return res;
        }),
        delete: (id: string | number) => fetchWithAuth<void>(ENDPOINTS.PRODUCTS.DETAIL(id), { method: 'DELETE' }).then(() => {
            updateCache(STORAGE_KEYS.PRODUCTS, 'delete', undefined, id);
        }),
    },
    productCategories: {
        getAll: () => safeFetch<any>(ENDPOINTS.PRODUCT_CATEGORIES.BASE).then(data => {
            const list = extractList<Category>(data);
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
            localStorage.setItem(STORAGE_KEYS.CACHE_UPDATED, Date.now().toString());
            return list;
        }),
        create: (data: Partial<Category>) => fetchWithAuth<Category>(ENDPOINTS.PRODUCT_CATEGORIES.BASE, { method: 'POST', body: data }).then(res => {
            updateCache(STORAGE_KEYS.CATEGORIES, 'add', res);
            return res;
        }),
        update: (id: string | number, data: Partial<Category>) => fetchWithAuth<Category>(ENDPOINTS.PRODUCT_CATEGORIES.DETAIL(id), { method: 'PUT', body: data }).then(res => {
            updateCache(STORAGE_KEYS.CATEGORIES, 'update', res);
            return res;
        }),
        delete: (id: string | number) => fetchWithAuth<void>(ENDPOINTS.PRODUCT_CATEGORIES.DETAIL(id), { method: 'DELETE' }).then(() => {
            updateCache(STORAGE_KEYS.CATEGORIES, 'delete', undefined, id);
        }),
    },
    postCategories: {
        getAll: () => safeFetch<any>(ENDPOINTS.POST_CATEGORIES.BASE).then(data => extractList<PostCategory>(data)),
        create: (data: Partial<PostCategory>) => fetchWithAuth<PostCategory>(ENDPOINTS.POST_CATEGORIES.BASE, { method: 'POST', body: data }),
        update: (id: string | number, data: Partial<PostCategory>) => fetchWithAuth<PostCategory>(ENDPOINTS.POST_CATEGORIES.DETAIL(id), { method: 'PUT', body: data }),
        delete: (id: string | number) => fetchWithAuth<void>(ENDPOINTS.POST_CATEGORIES.DETAIL(id), { method: 'DELETE' }),
    },
    blog: {
        getAll: () => safeFetch<any>(ENDPOINTS.POSTS.BASE).then(data => {
            const list = extractList<Post>(data);
            localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(list));
            localStorage.setItem(STORAGE_KEYS.CACHE_UPDATED, Date.now().toString());
            return list;
        }),
        getOne: (id: string | number) => safeFetch<Post>(ENDPOINTS.POSTS.DETAIL(id)),
        create: (data: Partial<Post>) => fetchWithAuth<Post>(ENDPOINTS.POSTS.BASE, { method: 'POST', body: data }).then(res => {
            updateCache(STORAGE_KEYS.POSTS, 'add', res);
            return res;
        }),
        update: (id: string | number, data: Partial<Post>) => fetchWithAuth<Post>(ENDPOINTS.POSTS.DETAIL(id), { method: 'PUT', body: data }).then(res => {
            updateCache(STORAGE_KEYS.POSTS, 'update', res);
            return res;
        }),
        delete: (id: string | number) => fetchWithAuth<void>(ENDPOINTS.POSTS.DETAIL(id), { method: 'DELETE' }).then(() => {
            updateCache(STORAGE_KEYS.POSTS, 'delete', undefined, id);
        }),
        rate: (id: string | number, rating: number) => fetchWithAuth<void>(ENDPOINTS.POSTS.RATE(id), { method: 'POST', body: { rating } }),
    },
    cart: {
        get: () => fetchWithAuth<any>(ENDPOINTS.CART.BASE),
        add: (productId: any, quantity: number = 1) => fetchWithAuth<any>(ENDPOINTS.CART.ADD, { method: 'POST', body: { productId, quantity } }),
        remove: (productId: string | number) => fetchWithAuth<any>(ENDPOINTS.CART.REMOVE(productId), { method: 'DELETE' }),
    }
};

export default api;
