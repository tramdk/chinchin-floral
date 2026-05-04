
// export const BACKEND_URL = 'http://localhost:5000';
export const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const API_BASE = `${BACKEND_URL}/api/v1`;

export const ENDPOINTS = {
    AUTH: {
        REGISTER: `${API_BASE}/auth/register`,
        LOGIN: `${API_BASE}/auth/login`,
        REFRESH: `${API_BASE}/auth/refresh`,
        LOGOUT: `${API_BASE}/auth/logout`,
    },
    USERS: {
        BASE: `${API_BASE}/users`,
        DETAIL: (id: string | number) => `${API_BASE}/users/${id}`,
    },
    POSTS: {
        BASE: `${API_BASE}/posts`,
        DETAIL: (id: string | number) => `${API_BASE}/posts/${id}`,
        RATE: (id: string | number) => `${API_BASE}/posts/${id}/rate`,
    },
    POST_CATEGORIES: {
        BASE: `${API_BASE}/postCategories`,
        DETAIL: (id: string | number) => `${API_BASE}/postCategories/${id}`,
    },
    PRODUCT_CATEGORIES: {
        BASE: `${API_BASE}/productCategories`,
        DETAIL: (id: string | number) => `${API_BASE}/productCategories/${id}`,
    },
    PRODUCTS: {
        BASE: `${API_BASE}/products`,
        DETAIL: (id: string | number) => `${API_BASE}/products/${id}`,
    },
    REVIEWS: {
        BASE: `${API_BASE}/reviews`,
    },
    CART: {
        BASE: `${API_BASE}/cart`,
        ADD: `${API_BASE}/cart/add`,
        REMOVE: (productId: string | number) => `${API_BASE}/cart/remove/${productId}`,
    },
    FAVORITES: {
        ITEM: (productId: string | number) => `${API_BASE}/favorites/${productId}`,
    },
    CHAT: {
        HISTORY: (otherUserId: string | number) => `${API_BASE}/chat/${otherUserId}`,
        SEND: `${API_BASE}/chat`,
    },
    NOTIFICATIONS: {
        BASE: `${API_BASE}/notifications`,
        READ: (id: string | number) => `${API_BASE}/notifications/${id}/read`,
    },
    FILES: {
        UPLOAD: `${API_BASE}/files/upload`,
        METADATA: `${API_BASE}/files/metadata`,
        // BY_OBJECT: (type: string, id: string | number) => `${API_BASE}/files/object/${type}/${id}`,
        // BY_ID: (id: string | number) => `${API_BASE}/files/id/${id}`,
        VIEW: (id: string | number) => `${API_BASE}/files/view/${id}`,
        VIEW_BY_OBJECT_ID: (id: string | number) => `${API_BASE}/files/view/object/${id}`,
        DOWNLOAD: (id: string | number) => `${API_BASE}/files/download/${id}`,
        DELETE: (id: string | number) => `${API_BASE}/files/${id}`,
    },
    HUBS: {
        CHAT: `${BACKEND_URL}/hubs/chat`,
        NOTIFICATIONS: `${BACKEND_URL}/hubs/notifications`,
    }
};

export const STORAGE_KEYS = {
    TOKEN: 'chinchin_token',
    REFRESH_TOKEN: 'chinchin_refresh_token',
    USER: 'chinchin_user',
    PRODUCTS: 'chinchin_products',
    CATEGORIES: 'chinchin_categories',
    POSTS: 'chinchin_posts',
    CACHE_UPDATED: 'chinchin_cache_updated',
};

export const ABOUT_PREVIEW_CONTENT = {
    title: "Mỗi sản phẩm là một <br /><span class=\"italic text-floral-rose\">tác phẩm nghệ thuật</span>",
    description: "Chúng tôi không chỉ bán hoa và quả. Chúng tôi bán những thông điệp yêu thương, lời cảm ơn chân thành và sự trân trọng dành cho người nhận.",
    buttonText: "XEM CHI TIẾT CÂU CHUYỆN",
    images: [
        "https://www.flowers.ae/cdn/shop/files/Pastel-ST_b6559cb5-799e-452a-9416-84c0ce6bc73a_1200x.jpg?v=1743776177",
        "https://cdn.shopify.com/s/files/1/0022/4847/4713/files/FAE_Congratulation_480x480.png?v=1720124727"
    ]
};
