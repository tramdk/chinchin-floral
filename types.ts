/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

export interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export interface Laureate {
  name: string;
  image: string; // placeholder url
  role: string;
  desc: string;
}

export interface Product {
  id: number | string;
  name: string;
  category: string;
  categoryId?: string | number;
  price: number;
  image: string;
  description?: string;
  badge?: string;
}

export interface Category {
  id: string | number;
  name: string;
  description?: string;
  image?: string;
}

export interface Post {
  id: number | string;
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  categoryId?: string | number;
  author?: string;
  authorName?: string; // from backend
  date?: string;
  createdAt?: string; // from backend
  image?: string;
  readTime?: string; // frontend derived
  rating?: number; // frontend derived
  averageRating?: number; // from backend
}

export interface PostCategory {
  id: number | string;
  name: string;
  description?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}