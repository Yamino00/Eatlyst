import { RecipeCategory, DifficultyLevel, Unit, MealType } from './enums';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  
  // Media
  imageUrl?: string;
  videoUrl?: string;
  images: string[]; // Array of image URLs
  
  // Recipe details
  category: RecipeCategory;
  cuisine: string; // e.g., "Italian", "Mexican", "Asian"
  difficulty: DifficultyLevel;
  servings: number;
  
  // Timing
  prepTime: number; // minutes
  cookTime: number; // minutes
  totalTime: number; // minutes
  
  // Ingredients
  ingredients: RecipeIngredient[];
  
  // Instructions
  instructions: Instruction[];
  
  // Nutritional info (calculated from ingredients)
  nutrition: RecipeNutrition;
  
  // Estimated cost
  estimatedCost: number;
  costPerServing: number;
  
  // Metadata
  authorId: string; // User ID of recipe creator
  authorName: string;
  isPublic: boolean;
  tags: string[];
  
  // Social features
  likes: number;
  rating: number; // Average rating
  ratingCount: number;
  favorites: number;
  
  // Suitable meal types
  mealTypes: MealType[];
  
  // Dietary information
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  allergens: string[]; // List of allergens present
  
  // Recipe optimization
  makeAheadTips?: string;
  storageInstructions?: string;
  reheatingInstructions?: string;
  
  // Substitutions and variations
  substitutions: Substitution[];
  variations: RecipeVariation[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastMadeAt?: Date; // When user last made this recipe
}

export interface RecipeIngredient {
  ingredientId: string;
  name: string; // Denormalized for display
  quantity: number;
  unit: Unit;
  preparation?: string; // e.g., "diced", "chopped", "grated"
  optional: boolean;
  notes?: string;
}

export interface Instruction {
  stepNumber: number;
  instruction: string;
  imageUrl?: string;
  timer?: number; // minutes for this step
  temperature?: number; // for cooking steps
  tips?: string;
}

export interface RecipeNutrition {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  // Per serving
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
}

export interface Substitution {
  originalIngredientId: string;
  substituteIngredientId: string;
  substituteName: string;
  ratio: number; // How much substitute to use (1 = same amount)
  notes?: string;
}

export interface RecipeVariation {
  name: string;
  description: string;
  ingredientChanges: RecipeIngredient[];
  instructionChanges: string[];
}

// For recipe search and filtering
export interface RecipeFilter {
  categories?: RecipeCategory[];
  maxCookTime?: number;
  difficulty?: DifficultyLevel[];
  mealTypes?: MealType[];
  dietary?: string[]; // vegetarian, vegan, etc.
  maxCalories?: number;
  ingredients?: string[]; // Must include these ingredients
  excludeIngredients?: string[]; // Must not include these
  cuisine?: string[];
  rating?: number; // Minimum rating
}

// For recipe search results
export interface RecipeSearchResult {
  id: string;
  title: string;
  imageUrl?: string;
  rating: number;
  cookTime: number;
  difficulty: DifficultyLevel;
  calories: number;
  authorName: string;
  matchScore?: number; // Relevance score for search
}