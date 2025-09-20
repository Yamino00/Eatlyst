import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ActionSheetController, AlertController, ToastController, NavController, LoadingController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Subscription } from 'rxjs';
import { RecipeService, Recipe as FirebaseRecipe, Ingredient } from '../../services/recipe.service';

// Interfaccia semplificata per il form (per compatibilità)
interface RecipeForm {
  id: string;
  nome: string;
  tempoTotale: number;
  porzioni: number;
  difficolta: 'facile' | 'media' | 'difficile';
  ingredienti: IngredientForm[];
  procedimento: string;
  foto: string;
  autoreId: string;
  autoreNome: string;
  dataCreazione: Date;
  categoria: string;
}

interface IngredientForm {
  nome: string;
  quantita: number;
  unita: string;
}

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.page.html',
  styleUrls: ['./add-recipe.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddRecipePage implements OnInit, OnDestroy {

  private readonly DRAFT_STORAGE_KEY = 'eatlyst_recipe_draft';
  private autoSaveSubscription?: Subscription;
  private autoSaveInterval = 5000; // Auto-save ogni 5 secondi

  recipe: RecipeForm = {
    id: '',
    nome: '',
    tempoTotale: 30,
    porzioni: 4,
    difficolta: 'facile',
    ingredienti: [],
    procedimento: '',
    foto: '',
    autoreId: '',
    autoreNome: '',
    dataCreazione: new Date(),
    categoria: 'altro'
  };

  selectedPhoto: string = '';
  isDraftSaved: boolean = false;
  lastSaveTime: string = '';
  
  newIngredient: IngredientForm = {
    nome: '',
    quantita: 0,
    unita: 'gr'
  };

  nameSuggestions: string[] = [];
  ingredientSuggestions: string[] = [];

  commonRecipeNames = [
    'Pasta al Pomodoro', 'Risotto ai Funghi', 'Carbonara', 'Amatriciana'
  ];

  commonIngredients = [
    'pasta', 'riso', 'pomodoro', 'basilico', 'aglio', 'cipolla'
  ];

  constructor(
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController,
    private navController: NavController,
    private loadingController: LoadingController,
    private recipeService: RecipeService
  ) { }

  ngOnInit() {
    this.loadDraft();
    this.startAutoSave();
  }

  ngOnDestroy() {
    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
    }
  }

  // === GESTIONE BOZZE ===
  
  private loadDraft() {
    try {
      const savedDraft = localStorage.getItem(this.DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        this.recipe = { ...this.recipe, ...draftData.recipe };
        this.selectedPhoto = draftData.selectedPhoto || '';
        this.isDraftSaved = true;
        this.lastSaveTime = draftData.timestamp ? new Date(draftData.timestamp).toLocaleTimeString() : '';
        console.log('Bozza caricata:', this.recipe.nome || 'Ricetta senza nome');
        
        // Mostra notifica di recupero bozza
        setTimeout(() => {
          this.presentToast('Bozza recuperata! Continua da dove avevi lasciato.', 'success');
        }, 1000);
      }
    } catch (error) {
      console.error('Errore nel caricare la bozza:', error);
    }
  }

  private saveDraftToStorage() {
    try {
      const draftData = {
        recipe: this.recipe,
        selectedPhoto: this.selectedPhoto,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(this.DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      this.isDraftSaved = true;
      this.lastSaveTime = new Date().toLocaleTimeString();
    } catch (error) {
      console.error('Errore nel salvare la bozza:', error);
    }
  }

  private startAutoSave() {
    // Auto-salvataggio ogni 5 secondi se ci sono modifiche
    this.autoSaveSubscription = new Subscription();
    
    const autoSaveTimer = setInterval(() => {
      if (this.hasContent()) {
        this.saveDraftToStorage();
      }
    }, this.autoSaveInterval);

    this.autoSaveSubscription.add(() => clearInterval(autoSaveTimer));
  }

  private hasContent(): boolean {
    return !!(
      this.recipe.nome.trim() ||
      this.recipe.procedimento.trim() ||
      this.recipe.ingredienti.length > 0 ||
      this.selectedPhoto
    );
  }

  private clearDraft() {
    localStorage.removeItem(this.DRAFT_STORAGE_KEY);
    this.isDraftSaved = false;
    this.lastSaveTime = '';
  }

  async selectPhoto() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Seleziona Foto',
      buttons: [
        {
          text: 'Scatta Foto',
          icon: 'camera',
          handler: () => {
            this.takePicture(CameraSource.Camera);
          }
        },
        {
          text: 'Galleria',
          icon: 'images',
          handler: () => {
            this.takePicture(CameraSource.Photos);
          }
        },
        {
          text: 'Annulla',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async takePicture(source: CameraSource) {
    try {
      // Controllo se siamo nel browser (per sviluppo)
      const isWeb = window.location.protocol === 'http:' || window.location.protocol === 'https:';
      
      if (isWeb && source === CameraSource.Camera) {
        this.presentToast('Fotocamera non disponibile nel browser. Usa la galleria o testa su dispositivo mobile.', 'warning');
        return;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source,
        width: 800,
        height: 600,
        promptLabelHeader: 'Selezione Foto',
        promptLabelCancel: 'Annulla',
        promptLabelPhoto: 'Galleria',
        promptLabelPicture: 'Fotocamera'
      });
      
      if (image.dataUrl) {
        this.selectedPhoto = image.dataUrl;
        this.recipe.foto = this.selectedPhoto;
        this.presentToast('Foto selezionata con successo!', 'success');
      }
    } catch (error: any) {
      console.error('Errore selezione foto:', error);
      
      if (error.message === 'User cancelled photos app') {
        this.presentToast('Selezione foto annullata', 'warning');
      } else if (error.message === 'Camera not available') {
        this.presentToast('Fotocamera non disponibile su questo dispositivo', 'danger');
      } else if (error.message === 'Photo library not available') {
        this.presentToast('Galleria non disponibile su questo dispositivo', 'danger');
      } else {
        this.presentToast('Errore nel selezionare la foto. Riprova.', 'danger');
      }
    }
  }

  onNameChange(event: any) {
    const query = event.detail.value.toLowerCase();
    if (query.length > 2) {
      this.nameSuggestions = this.commonRecipeNames
        .filter(name => name.toLowerCase().includes(query))
        .slice(0, 3);
    } else {
      this.nameSuggestions = [];
    }
  }

  selectNameSuggestion(suggestion: string) {
    this.recipe.nome = suggestion;
    this.nameSuggestions = [];
  }

  setDifficulty(difficulty: 'facile' | 'media' | 'difficile') {
    this.recipe.difficolta = difficulty;
  }

  onIngredientChange(event: any) {
    const query = event.detail.value.toLowerCase();
    if (query.length > 1) {
      this.ingredientSuggestions = this.commonIngredients
        .filter(ingredient => ingredient.toLowerCase().includes(query))
        .slice(0, 5);
    } else {
      this.ingredientSuggestions = [];
    }
  }

  selectIngredientSuggestion(suggestion: string) {
    this.newIngredient.nome = suggestion;
    this.ingredientSuggestions = [];
  }

  addIngredient() {
    if (this.newIngredient.nome.trim() && this.newIngredient.quantita > 0) {
      this.recipe.ingredienti.push({
        nome: this.newIngredient.nome.trim(),
        quantita: this.newIngredient.quantita,
        unita: this.newIngredient.unita
      });

      this.newIngredient = {
        nome: '',
        quantita: 0,
        unita: 'gr'
      };
      this.ingredientSuggestions = [];
    }
  }

  removeIngredient(index: number) {
    this.recipe.ingredienti.splice(index, 1);
  }

  isFormValid(): boolean {
    return !!(
      this.recipe.nome.trim() &&
      this.recipe.tempoTotale &&
      this.recipe.porzioni &&
      this.recipe.difficolta &&
      this.recipe.ingredienti.length > 0 &&
      this.recipe.procedimento.trim()
    );
  }

  async saveDraft() {
    try {
      this.saveDraftToStorage();
      this.presentToast('Bozza salvata! I tuoi dati sono al sicuro.', 'success');
    } catch (error) {
      console.error('Errore salvataggio bozza:', error);
      this.presentToast('Errore nel salvare la bozza', 'danger');
    }
  }

  async clearDraftAndExit() {
    const alert = await this.alertController.create({
      header: 'Eliminare la bozza?',
      message: 'Tutti i dati inseriti verranno persi. Sei sicuro?',
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Elimina',
          handler: () => {
            this.clearDraft();
            this.presentToast('Bozza eliminata', 'warning');
            this.navController.navigateBack('/tabs/tab1');
          }
        }
      ]
    });
    await alert.present();
  }

  async publishRecipe() {
    if (!this.isFormValid()) {
      // Mostra dettagli sui campi mancanti
      const missingFields = this.getMissingFields();
      const alert = await this.alertController.create({
        header: 'Campi Obbligatori Mancanti',
        message: `Per pubblicare la ricetta completa questi campi:\n\n${missingFields.join('\n')}`,
        buttons: [
          {
            text: 'Salva come Bozza',
            handler: () => {
              this.saveDraft();
            }
          },
          {
            text: 'Continua a Modificare',
            role: 'cancel'
          }
        ]
      });
      await alert.present();
      return;
    }

    // Conferma pubblicazione
    const confirmAlert = await this.alertController.create({
      header: 'Pubblica Ricetta',
      message: `Sei sicuro di voler pubblicare "${this.recipe.nome}"?`,
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Pubblica',
          handler: async () => {
            await this.saveRecipe();
          }
        }
      ]
    });
    await confirmAlert.present();
  }

  private async saveRecipe() {
    const loading = await this.presentLoading('Pubblicazione in corso...');
    
    try {
      // Converti la ricetta nel formato Firebase
      const firebaseRecipe: Omit<FirebaseRecipe, 'id' | 'dataCreazione'> = {
        nome: this.recipe.nome,
        tempoTotale: this.recipe.tempoTotale,
        porzioni: this.recipe.porzioni,
        difficolta: this.recipe.difficolta,
        ingredienti: this.recipe.ingredienti.map(ing => ({
          nome: ing.nome,
          quantita: ing.quantita,
          unita: ing.unita
        })),
        procedimento: this.recipe.procedimento,
        categoria: this.recipe.categoria,
        autoreId: '', // Sarà impostato dal service
        autoreNome: '' // Sarà impostato dal service
      };

      // Crea la ricetta su Firestore
      const recipeId = await this.recipeService.createRecipe(firebaseRecipe as FirebaseRecipe);
      
      // Upload dell'immagine se presente
      if (this.selectedPhoto) {
        await loading.dismiss();
        const uploadLoading = await this.presentLoading('Upload immagine...');
        
        try {
          const imageUrl = await this.recipeService.uploadRecipeImage(this.selectedPhoto, recipeId);
          // Aggiorna la ricetta con l'URL dell'immagine
          await this.recipeService.updateRecipe(recipeId, { fotoUrl: imageUrl });
          await uploadLoading.dismiss();
        } catch (imageError) {
          await uploadLoading.dismiss();
          console.warn('Errore upload immagine, ma ricetta salvata:', imageError);
          this.presentToast('Ricetta salvata, ma errore nel caricamento immagine', 'warning');
        }
      } else {
        await loading.dismiss();
      }
      
      // Pulisci la bozza dopo pubblicazione riuscita
      this.clearDraft();
      
      this.presentToast(`"${this.recipe.nome}" pubblicata con successo!`, 'success');
      
      // Ritorna alla lista ricette
      setTimeout(() => {
        this.navController.navigateBack('/tabs/tab1');
      }, 1500);
      
    } catch (error) {
      await loading.dismiss();
      console.error('Errore pubblicazione:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          this.presentToast('Errore: permessi insufficienti. Riprova dopo il login.', 'danger');
        } else if (error.message.includes('network')) {
          this.presentToast('Errore di connessione. Controlla la rete e riprova.', 'danger');
        } else {
          this.presentToast(`Errore: ${error.message}`, 'danger');
        }
      } else {
        this.presentToast('Errore nella pubblicazione. Riprova.', 'danger');
      }
    }
  }

  private getMissingFields(): string[] {
    const missing: string[] = [];
    
    if (!this.recipe.nome.trim()) missing.push('• Nome ricetta');
    if (!this.recipe.tempoTotale || this.recipe.tempoTotale <= 0) missing.push('• Tempo di preparazione');
    if (!this.recipe.porzioni || this.recipe.porzioni <= 0) missing.push('• Numero porzioni');
    if (!this.recipe.difficolta) missing.push('• Livello difficoltà');
    if (this.recipe.ingredienti.length === 0) missing.push('• Almeno un ingrediente');
    if (!this.recipe.procedimento.trim()) missing.push('• Procedimento');
    
    return missing;
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  async presentLoading(message: string) {
    const loading = await this.loadingController.create({
      message: message,
      spinner: 'circular'
    });
    await loading.present();
    return loading;
  }
}