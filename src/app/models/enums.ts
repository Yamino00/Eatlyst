// Enums for better type safety
export enum DietType {
  NONE = 'none',
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  PESCATARIAN = 'pescatarian',
  KETO = 'keto',
  PALEO = 'paleo',
  MEDITERRANEAN = 'mediterranean',
  LOW_CARB = 'low-carb',
  GLUTEN_FREE = 'gluten-free'
}

export enum AllergyType {
  NUTS = 'nuts',
  DAIRY = 'dairy',
  EGGS = 'eggs',
  FISH = 'fish',
  SHELLFISH = 'shellfish',
  SOY = 'soy',
  WHEAT = 'wheat',
  SESAME = 'sesame'
}

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack'
}

export enum RecipeCategory {
  APPETIZER = 'appetizer',
  MAIN_COURSE = 'main-course',
  SIDE_DISH = 'side-dish',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
  SOUP = 'soup',
  SALAD = 'salad',
  PASTA = 'pasta',
  PIZZA = 'pizza',
  BREAD = 'bread'
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum Unit {
  // Weight
  GRAMS = 'g',
  KILOGRAMS = 'kg',
  POUNDS = 'lb',
  OUNCES = 'oz',
  
  // Volume
  MILLILITERS = 'ml',
  LITERS = 'l',
  CUPS = 'cups',
  TABLESPOONS = 'tbsp',
  TEASPOONS = 'tsp',
  FLUID_OUNCES = 'fl-oz',
  
  // Count
  PIECES = 'pieces',
  SLICES = 'slices',
  
  // Others
  PINCH = 'pinch',
  TO_TASTE = 'to-taste'
}