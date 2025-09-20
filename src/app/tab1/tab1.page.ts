import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons, 
  IonButton, 
  IonIcon,
  IonFab,
  IonFabButton,
  IonSpinner
} from '@ionic/angular/standalone';
import { RecipeService, Recipe } from '../services/recipe.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    CommonModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButtons, 
    IonButton, 
    IonIcon,
    IonFab,
    IonFabButton,
    IonSpinner
  ],
})
export class Tab1Page implements OnInit {
  
  recipes: Recipe[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  
  constructor(
    private router: Router,
    private recipeService: RecipeService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadRecipes();
  }

  ionViewWillEnter() {
    // Ricarica le ricette ogni volta che si entra nel tab
    this.loadRecipes();
  }

  private async loadRecipes() {
    console.log('🔄 Inizio caricamento ricette...');
    
    // Controlla se l'utente è autenticato
    if (!this.authService.isLoggedIn()) {
      console.log('⚠️ Utente non autenticato');
      this.recipes = [];
      this.error = null;
      return;
    }

    console.log('✅ Utente autenticato, caricamento ricette...');
    this.isLoading = true;
    this.error = null;
    
    try {
      this.recipes = await this.recipeService.getUserRecipes();
      console.log(`✅ Ricette caricate: ${this.recipes.length}`);
      
      // Se non ci sono ricette, non è un errore
      if (this.recipes.length === 0) {
        console.log('📝 Nessuna ricetta trovata (database vuoto)');
      }
    } catch (error) {
      console.error('❌ Errore nel caricare le ricette:', error);
      
      // Gestione specifica degli errori
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          this.error = 'Permessi insufficienti. Verifica di essere loggato.';
        } else if (error.message.includes('network')) {
          this.error = 'Errore di connessione. Controlla la rete.';
        } else if (error.message.includes('not-found')) {
          this.error = 'Database non trovato. Contatta il supporto.';
        } else {
          this.error = `Errore: ${error.message}`;
        }
      } else {
        this.error = 'Errore sconosciuto nel caricamento delle ricette';
      }
      
      this.recipes = [];
    } finally {
      this.isLoading = false;
    }
  }

  goToAddRecipe() {
    this.router.navigate(['/add-recipe']);
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'facile': return 'success';
      case 'media': return 'warning';
      case 'difficile': return 'danger';
      default: return 'medium';
    }
  }

  getDifficultyLabel(difficulty: string): string {
    switch (difficulty) {
      case 'facile': return 'Facile';
      case 'media': return 'Media';
      case 'difficile': return 'Difficile';
      default: return difficulty;
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    
    // Gestisce sia Timestamp che Date
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  async refreshRecipes(event?: any) {
    await this.loadRecipes();
    if (event) {
      event.target.complete();
    }
  }
}
