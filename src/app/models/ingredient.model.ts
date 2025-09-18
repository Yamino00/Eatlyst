import { Unit } from './enums';

export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  category: IngredientCategory;
  
  // Nutritional information per 100g
  nutrition: NutritionalInfo;
  
  // Price estimation
  averagePrice: number; // per unit
  priceUnit: Unit;
  
  // Storage and shelf life
  storageType: StorageType;
  shelfLifeDays: number;
  
  // Common units and conversions
  commonUnits: Unit[];
  conversionRates: ConversionRate[];
  
  // Substitutions
  substitutes: string[]; // Array of ingredient IDs
  
  // Metadata
  imageUrl?: string;
  barcode?: string;
  brand?: string;
  organic: boolean;
  seasonal: boolean;
  seasonalMonths?: number[]; // 1-12 for months when in season
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionalInfo {
  calories: number; // per 100g
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sugar: number; // grams
  sodium: number; // milligrams
  cholesterol: number; // milligrams
  
  // Vitamins and minerals (optional)
  vitaminC?: number;
  calcium?: number;
  iron?: number;
}

export interface ConversionRate {
  fromUnit: Unit;
  toUnit: Unit;
  multiplier: number;
}

export enum IngredientCategory {
  VEGETABLES = 'vegetables',
  FRUITS = 'fruits',
  PROTEINS = 'proteins',
  DAIRY = 'dairy',
  GRAINS = 'grains',
  LEGUMES = 'legumes',
  HERBS_SPICES = 'herbs-spices',
  OILS_FATS = 'oils-fats',
  CONDIMENTS = 'condiments',
  BEVERAGES = 'beverages',
  SNACKS = 'snacks',
  FROZEN = 'frozen',
  CANNED = 'canned',
  BAKING = 'baking',
  OTHER = 'other'
}

export enum StorageType {
  ROOM_TEMPERATURE = 'room-temperature',
  REFRIGERATED = 'refrigerated',
  FROZEN = 'frozen',
  DRY_PANTRY = 'dry-pantry'
}