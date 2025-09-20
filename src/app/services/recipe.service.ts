import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp 
} from '@angular/fire/firestore';
import { 
  Storage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from '@angular/fire/storage';
import { AuthService } from './auth.service';
import { Observable, from } from 'rxjs';

export interface Recipe {
  id?: string;
  nome: string;
  tempoTotale: number;
  porzioni: number;
  difficolta: 'facile' | 'media' | 'difficile';
  ingredienti: Ingredient[];
  procedimento: string;
  foto?: string;
  fotoUrl?: string;
  autoreId: string;
  autoreNome: string;
  dataCreazione: Timestamp | Date;
  categoria: string;
}

export interface Ingredient {
  nome: string;
  quantita: number;
  unita: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private recipesCollection = 'recipes';

  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private authService: AuthService
  ) {}

  // === GESTIONE RICETTE ===
  
  async createRecipe(recipe: Recipe): Promise<string> {
    try {
      // Assicurati che l'utente sia autenticato
      const currentUser = await this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Utente non autenticato');
      }

      // Prepara i dati per Firestore
      const recipeData = {
        ...recipe,
        autoreId: currentUser.id,
        autoreNome: currentUser.displayName || currentUser.email || 'Utente',
        dataCreazione: Timestamp.now()
      };

      // Rimuovi l'id se presente (sarà generato da Firestore)
      delete recipeData.id;

      const docRef = await addDoc(collection(this.firestore, this.recipesCollection), recipeData);
      return docRef.id;
    } catch (error) {
      console.error('Errore nella creazione ricetta:', error);
      throw error;
    }
  }

  async getUserRecipes(): Promise<Recipe[]> {
    try {
      console.log('🔄 RecipeService: Inizio caricamento ricette utente...');
      
      const currentUser = await this.authService.getCurrentUser();
      if (!currentUser) {
        console.log('⚠️ RecipeService: Nessun utente autenticato');
        return [];
      }

      console.log(`✅ RecipeService: Utente autenticato: ${currentUser.id}`);

      const q = query(
        collection(this.firestore, this.recipesCollection),
        where('autoreId', '==', currentUser.id),
        orderBy('dataCreazione', 'desc')
      );

      console.log('🔍 RecipeService: Esecuzione query Firestore...');
      const querySnapshot = await getDocs(q);
      console.log(`📊 RecipeService: Query completata, trovati ${querySnapshot.size} documenti`);
      
      const recipes: Recipe[] = [];

      querySnapshot.forEach((doc) => {
        console.log(`📄 RecipeService: Elaborazione documento ${doc.id}`);
        const data = doc.data();
        recipes.push({
          id: doc.id,
          ...data,
          dataCreazione: data['dataCreazione'] // Mantieni come Timestamp
        } as Recipe);
      });

      console.log(`✅ RecipeService: Ricette caricate con successo: ${recipes.length}`);
      return recipes;
    } catch (error: any) {
      console.error('❌ RecipeService: Errore nel caricamento ricette:', error);
      
      // Analizza il tipo di errore per fornire feedback migliore
      if (error?.code === 'permission-denied') {
        console.error('🚫 RecipeService: Errore di permessi - verificare le regole Firestore');
        throw new Error('permission-denied: Permessi insufficienti per accedere al database');
      } else if (error?.code === 'unavailable') {
        console.error('🌐 RecipeService: Errore di rete - Firestore non raggiungibile');
        throw new Error('network: Errore di connessione al database');
      } else if (error?.code === 'not-found') {
        console.error('🔍 RecipeService: Database o collezione non trovata');
        throw new Error('not-found: Database non configurato correttamente');
      }
      
      throw error;
    }
  }

  async updateRecipe(recipeId: string, updates: Partial<Recipe>): Promise<void> {
    try {
      const recipeRef = doc(this.firestore, this.recipesCollection, recipeId);
      await updateDoc(recipeRef, {
        ...updates,
        dataModifica: Timestamp.now()
      });
    } catch (error) {
      console.error('Errore nell\'aggiornamento ricetta:', error);
      throw error;
    }
  }

  async deleteRecipe(recipeId: string): Promise<void> {
    try {
      // Prima elimina l'immagine se presente
      const recipes = await this.getUserRecipes();
      const recipe = recipes.find(r => r.id === recipeId);
      
      if (recipe?.fotoUrl) {
        await this.deleteImage(recipe.fotoUrl);
      }

      // Poi elimina il documento
      const recipeRef = doc(this.firestore, this.recipesCollection, recipeId);
      await deleteDoc(recipeRef);
    } catch (error) {
      console.error('Errore nell\'eliminazione ricetta:', error);
      throw error;
    }
  }

  // === GESTIONE IMMAGINI ===

  async uploadRecipeImage(imageDataUrl: string, recipeId?: string): Promise<string> {
    try {
      const currentUser = await this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Utente non autenticato');
      }

      // Converti DataURL in Blob
      const blob = this.dataURLtoBlob(imageDataUrl);
      
      // Crea il percorso del file
      const timestamp = Date.now();
      const fileName = `recipe_${recipeId || timestamp}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      const filePath = `recipes/${currentUser.id}/${fileName}`;
      
      // Upload su Firebase Storage
      const storageRef = ref(this.storage, filePath);
      const snapshot = await uploadBytes(storageRef, blob);
      
      // Ottieni URL di download
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Errore nell\'upload immagine:', error);
      throw error;
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const imageRef = ref(this.storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Errore nell\'eliminazione immagine:', error);
      // Non lanciare l'errore per non bloccare l'eliminazione della ricetta
    }
  }

  // === UTILITÀ ===

  private dataURLtoBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }

  // Metodo per comprimere immagini (opzionale)
  compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcola nuove dimensioni mantenendo aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Disegna l'immagine compressa
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Converti in DataURL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => reject(new Error('Errore nel caricamento immagine'));
      img.src = URL.createObjectURL(file);
    });
  }
}