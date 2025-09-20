import { Injectable } from '@angular/core';
import { Auth, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, updatePassword, deleteUser } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { User, UserPreferences, DietType, AllergyType } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(true);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    this.initAuthState();
  }

  private initAuthState(): void {
    this.auth.onAuthStateChanged(async (firebaseUser) => {
      this.loadingSubject.next(true);
      
      if (firebaseUser) {
        try {
          const user = await this.getUserData(firebaseUser.uid);
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          
          // Update last login
          await this.updateLastLogin(firebaseUser.uid);
        } catch (error) {
          console.error('Error loading user data:', error);
          this.currentUserSubject.next(null);
          this.isAuthenticatedSubject.next(false);
        }
      } else {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      }
      
      this.loadingSubject.next(false);
    });
  }

  // Email/Password Authentication
  async signUp(email: string, password: string, userData: Partial<User>): Promise<User> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = credential.user;

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });

      // Create user document in Firestore
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        bio: userData.bio || '',
        diets: userData.diets || [],
        allergies: userData.allergies || [],
        dislikes: userData.dislikes || [],
        householdSize: userData.householdSize || 1,
        defaultPortions: userData.defaultPortions || 1,
        preferredLanguage: userData.preferredLanguage || 'it',
        preferredCurrency: userData.preferredCurrency || 'EUR',
        darkMode: userData.darkMode || false,
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          weeklyPlanReminder: true,
          groceryListReminder: true,
          recipeRecommendations: true
        },
        friends: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      };

      await setDoc(doc(this.firestore, 'users', firebaseUser.uid), newUser);
      return newUser;
    } catch (error) {
      console.error('Sign up error:', error);
      throw this.handleAuthError(error);
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = await this.getUserData(credential.user.uid);
      return user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      const firebaseUser = credential.user;

      // Check if user exists in Firestore
      let user = await this.getUserData(firebaseUser.uid, false);
      
      if (!user) {
        // Create new user from Google data
        user = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || undefined,
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          bio: '',
          diets: [],
          allergies: [],
          dislikes: [],
          householdSize: 1,
          defaultPortions: 1,
          preferredLanguage: 'it',
          preferredCurrency: 'EUR',
          darkMode: false,
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            weeklyPlanReminder: true,
            groceryListReminder: true,
            recipeRecommendations: true
          },
          friends: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date()
        };

        await setDoc(doc(this.firestore, 'users', firebaseUser.uid), user);
      }

      return user;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw this.handleAuthError(error);
    }
  }

  async updateUserPassword(newPassword: string): Promise<void> {
    if (!this.auth.currentUser) {
      throw new Error('No authenticated user');
    }
    
    try {
      await updatePassword(this.auth.currentUser, newPassword);
    } catch (error) {
      console.error('Update password error:', error);
      throw this.handleAuthError(error);
    }
  }

  async deleteAccount(): Promise<void> {
    if (!this.auth.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      const userId = this.auth.currentUser.uid;
      
      // Delete user document from Firestore
      // Note: In production, this should be done via Cloud Function
      // for proper cleanup of related data
      
      await deleteUser(this.auth.currentUser);
    } catch (error) {
      console.error('Delete account error:', error);
      throw this.handleAuthError(error);
    }
  }

  // User Data Management
  private async getUserData(uid: string, throwOnNotFound: boolean = true): Promise<User> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      
      if (!userDoc.exists()) {
        if (throwOnNotFound) {
          throw new Error('User data not found');
        }
        return null as any;
      }

      const userData = userDoc.data() as User;
      
      // Convert Firestore timestamps to Date objects
      if (userData.createdAt && typeof userData.createdAt !== 'object') {
        userData.createdAt = new Date(userData.createdAt);
      }
      if (userData.updatedAt && typeof userData.updatedAt !== 'object') {
        userData.updatedAt = new Date(userData.updatedAt);
      }
      if (userData.lastLoginAt && typeof userData.lastLoginAt !== 'object') {
        userData.lastLoginAt = new Date(userData.lastLoginAt);
      }

      return userData;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  async updateUserProfile(updates: Partial<User>): Promise<void> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      await updateDoc(doc(this.firestore, 'users', currentUser.id), updateData);
      
      // Update local user data
      const updatedUser = { ...currentUser, ...updateData };
      this.currentUserSubject.next(updatedUser);

      // Update Firebase Auth profile if display name changed
      if (updates.firstName || updates.lastName) {
        const firebaseUser = this.auth.currentUser;
        if (firebaseUser) {
          await updateProfile(firebaseUser, {
            displayName: `${updatedUser.firstName} ${updatedUser.lastName}`
          });
        }
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(this.firestore, 'users', uid), {
        lastLoginAt: new Date()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw - this is not critical
    }
  }

  // Utility methods
  getCurrentUser(): User | null {
    const user = this.currentUserSubject.value;
    console.log('🔍 AuthService: getCurrentUser() chiamato, utente:', user ? user.id : 'nessuno');
    return user;
  }

  getCurrentUserId(): string | null {
    const userId = this.currentUserSubject.value?.id || null;
    console.log('🔍 AuthService: getCurrentUserId() chiamato, ID:', userId);
    return userId;
  }

  isLoggedIn(): boolean {
    const isAuthenticated = this.isAuthenticatedSubject.value;
    console.log('🔍 AuthService: isLoggedIn() chiamato, autenticato:', isAuthenticated);
    return isAuthenticated;
  }

  private handleAuthError(error: any): Error {
    let message = 'An authentication error occurred';
    
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No user found with this email address';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password';
          break;
        case 'auth/email-already-in-use':
          message = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          message = 'Password is too weak';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          message = 'Too many attempts. Please try again later';
          break;
        default:
          message = error.message || message;
      }
    }
    
    return new Error(message);
  }
}