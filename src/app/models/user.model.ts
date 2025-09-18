import { DietType, AllergyType } from './enums';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  
  // Profile information
  firstName: string;
  lastName: string;
  bio?: string;
  
  // Dietary preferences
  diets: DietType[];
  allergies: AllergyType[];
  dislikes: string[]; // Array of ingredient names
  
  // Household information
  householdSize: number; // Number of people
  defaultPortions: number; // Default portions when planning meals
  
  // App preferences
  preferredLanguage: string;
  preferredCurrency: string;
  darkMode: boolean;
  notifications: NotificationSettings;
  
  // Social features
  friends: string[]; // Array of user IDs
  familyGroupId?: string; // ID of family group if member
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyPlanReminder: boolean;
  groceryListReminder: boolean;
  recipeRecommendations: boolean;
}

export interface UserPreferences {
  maxCookingTime: number; // in minutes
  preferredMealTypes: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  shoppingDay: number; // 0-6 (Sunday-Saturday)
}