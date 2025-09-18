// Export all enums
export * from './enums';

// Export all models
export * from './user.model';
export * from './ingredient.model';
export * from './recipe.model';
export * from './weekly-plan.model';
export * from './grocery-list.model';

// Import types for use in interfaces
import { User, UserPreferences } from './user.model';

// Common types used across the app
export interface FirebaseDocument {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchOptions {
  query: string;
  filters?: Record<string, any>;
  pagination?: PaginationOptions;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// App state interfaces
export interface AppState {
  user: User | null;
  loading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
}

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  preferences: UserPreferences | null;
}

// Navigation interfaces
export interface TabInfo {
  title: string;
  icon: string;
  url: string;
  badge?: number;
}

// Notification interfaces
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

// Share interfaces
export interface ShareData {
  title: string;
  text: string;
  url?: string;
  files?: File[];
}

// Re-export for convenience
export { User } from './user.model';
export { Recipe } from './recipe.model';
export { WeeklyPlan } from './weekly-plan.model';
export { GroceryList } from './grocery-list.model';
export { Ingredient } from './ingredient.model';