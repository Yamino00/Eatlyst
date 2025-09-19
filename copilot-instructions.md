# Eatlyst - Meal Planning & Grocery Management App

## Project Overview
Eatlyst is a mobile-first Progressive Web App for intelligent meal planning and automatic grocery list generation.

## Technology Stack
- **Frontend**: Ionic 8 + Angular 20 (Standalone Components) + TypeScript
- **Backend**: Firebase (Authentication, Firestore, Storage, Hosting)  
- **Mobile**: Capacitor for native features
- **UI**: Angular Material + custom drag-drop handlers
- **PWA**: Service Workers for offline functionality

## Core Features
- Recipe management with cloud database (public/private)
- Weekly planning via drag-and-drop calendar
- Automatic grocery list generation with intelligent ingredient aggregation
- User authentication and personalized profiles with dietary preferences
- Recipe and meal plan sharing between users/families
- Real-time multi-device synchronization with offline mode

## Data Architecture
- Users with dietary preferences (diets, allergies, portions)
- Recipes with ingredients, instructions, ratings, categories
- Weekly plans with assigned meals per day/meal type
- Ingredients with nutritional info and estimated prices
- Auto-generated grocery lists from multiple recipes

## Smart Algorithms
- Automatic ingredient aggregation avoiding duplicates
- Quantity optimization to reduce waste
- Dynamic portion calculation based on people/preferences
- Recipe suggestions based on history and preferences
- Real vs estimated cost tracking for better predictions

## UI/UX Design
- Mobile-first with intuitive interface
- Weekly calendar for recipe assignment
- Swipe gestures and drag-drop for reorganization
- Dark mode support and full accessibility
- Offline-first with automatic synchronization

## Setup Progress
- [ ] Project scaffolding setup
- [ ] Firebase configuration
- [ ] Data models and TypeScript interfaces
- [ ] Authentication system
- [ ] Recipe management CRUD
- [ ] Drag-drop calendar planning
- [ ] Smart grocery list algorithms
- [ ] Sharing and collaboration system
- [ ] Offline synchronization and PWA
- [ ] Final UI/UX and deployment

