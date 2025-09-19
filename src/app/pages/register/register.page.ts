import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonIcon,
  IonSpinner,
  IonCheckbox,
  LoadingController,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, 
  mailOutline, 
  lockClosedOutline, 
  logoGoogle, 
  eyeOutline, 
  eyeOffOutline 
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

// Custom validator per confermare password
function passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonBackButton,
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    IonIcon,
    IonSpinner,
    IonCheckbox
  ]
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    // Aggiungi le icone
    addIcons({
      personOutline,
      mailOutline,
      lockClosedOutline,
      logoGoogle,
      eyeOutline,
      eyeOffOutline
    });
  }

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: passwordMatchValidator });
  }

  // Getter per accesso facile ai controlli del form
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get acceptTerms() { return this.registerForm.get('acceptTerms'); }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const loading = await this.loadingController.create({
        message: 'Creazione account in corso...',
        translucent: true
      });
      await loading.present();

      try {
        const formData = this.registerForm.value;
        
        // Prepara i dati utente per il servizio
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          householdSize: 1, // Valore di default
          defaultPortions: 1, // Valore di default
          diets: [],
          allergies: [],
          dislikes: [],
          preferredLanguage: 'it',
          preferredCurrency: 'EUR',
          darkMode: false,
          friends: [],
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            weeklyPlanReminder: true,
            groceryListReminder: true,
            recipeRecommendations: true
          }
        };

        await this.authService.signUp(formData.email, formData.password, userData);
        
        await loading.dismiss();
        await this.showToast('Account creato con successo! Benvenuto su Eatlyst!', 'success');
        
        // Piccolo delay per permettere al Firebase di aggiornare lo stato
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Naviga immediatamente - l'AuthGuard gestirà l'autenticazione
        await this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
        
      } catch (error: any) {
        await loading.dismiss();
        await this.showToast(this.getErrorMessage(error), 'danger');
      } finally {
        this.isLoading = false;
      }
    } else {
      await this.showToast('Completa tutti i campi richiesti', 'warning');
    }
  }

  async signUpWithGoogle(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    
    const loading = await this.loadingController.create({
      message: 'Registrazione con Google...',
      translucent: true
    });
    await loading.present();

    try {
      await this.authService.signInWithGoogle();
      
      await loading.dismiss();
      await this.showToast('Account creato con successo!', 'success');
      
      // Piccolo delay per permettere al Firebase di aggiornare lo stato
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Naviga immediatamente - l'AuthGuard gestirà l'autenticazione
      await this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
      
    } catch (error: any) {
      await loading.dismiss();
      await this.showToast(this.getErrorMessage(error), 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async showTerms(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Termini e Condizioni di Utilizzo',
      cssClass: 'terms-alert',
      message: `
📋 TERMINI DI UTILIZZO DI EATLYST

Ultimo aggiornamento: Settembre 2025

1. ACCETTAZIONE DEI TERMINI
Utilizzando Eatlyst, accetti integralmente questi termini di utilizzo. Se non accetti questi termini, non utilizzare l'applicazione.

2. DESCRIZIONE DEL SERVIZIO
Eatlyst è un'applicazione per la pianificazione dei pasti e la gestione delle liste della spesa che ti aiuta a organizzare i tuoi pasti settimanali.

3. RESPONSABILITÀ DELL'UTENTE
• Fornire informazioni accurate durante la registrazione
• Utilizzare l'app in modo responsabile e legale
• Non condividere ricette protette da copyright
• Rispettare gli altri utenti della community

4. CONTENUTI E RICETTE
• Le ricette condivise devono essere sicure e appropriate
• Non pubblicare contenuti offensivi o inappropriati
• Rispetta i diritti di proprietà intellettuale
• Eatlyst si riserva il diritto di rimuovere contenuti inadeguati

5. LIMITAZIONE DI RESPONSABILITÀ
Eatlyst è fornita "così com'è" senza garanzie esplicite o implicite. Non siamo responsabili per eventuali danni derivanti dall'uso dell'applicazione.

6. MODIFICHE AI TERMINI
Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. Le modifiche saranno comunicate tramite l'app.

7. CONTATTI
Per domande sui termini, contattaci all'indirizzo: support@eatlyst.com
      `,
      buttons: [
        {
          text: 'Chiudi',
          cssClass: 'terms-close-button'
        }
      ]
    });
    await alert.present();
  }

  async showPrivacyPolicy(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Informativa sulla Privacy',
      cssClass: 'privacy-alert',
      message: `
🔒 INFORMATIVA SULLA PRIVACY DI EATLYST

Ultimo aggiornamento: Settembre 2025

1. DATI CHE RACCOGLIAMO

Dati di Registrazione:
• Nome, cognome ed email
• Preferenze alimentari e allergie (facoltativo)
• Foto profilo (facoltativo)

Dati di Utilizzo:
• Ricette create e salvate
• Pianificazioni settimanali
• Liste della spesa generate

2. COME UTILIZZIAMO I TUOI DATI
• Fornire e migliorare i nostri servizi
• Personalizzare la tua esperienza
• Sincronizzare i dati tra i dispositivi
• Inviare notifiche importanti (solo se autorizzate)

3. CONDIVISIONE DEI DATI
• NON VENDIAMO i tuoi dati personali
• Condividiamo solo ricette pubbliche che scegli di rendere pubbliche
• Utilizziamo Google Firebase per l'archiviazione sicura
• Possiamo condividere dati aggregati e anonimi per analisi

4. SICUREZZA DEI DATI
• Crittografia end-to-end per dati sensibili
• Autenticazione sicura tramite Firebase Auth
• Backup automatici per prevenire perdite di dati
• Monitoraggio costante per attività sospette

5. I TUOI DIRITTI
• ACCESSO: Visualizzare tutti i tuoi dati
• MODIFICA: Aggiornare le tue informazioni
• CANCELLAZIONE: Eliminare il tuo account e tutti i dati
• PORTABILITÀ: Esportare i tuoi dati

6. COOKIE E TRACCIAMENTO
Utilizziamo solo cookie tecnici essenziali per il funzionamento dell'app. Non utilizziamo cookie di tracciamento per pubblicità.

7. CONTATTI PER LA PRIVACY
Per domande sulla privacy o per esercitare i tuoi diritti:
Email: privacy@eatlyst.com
Responsabile Privacy: Data Protection Team

Questa informativa è conforme al GDPR (Regolamento Generale sulla Protezione dei Dati) e alle normative italiane sulla privacy.
      `,
      buttons: [
        {
          text: 'Chiudi',
          cssClass: 'privacy-close-button'
        }
      ]
    });
    await alert.present();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color,
      translucent: true
    });
    await toast.present();
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Questa email è già registrata. Prova ad accedere o usa un\'altra email.';
      case 'auth/weak-password':
        return 'Password troppo debole. Usa almeno 8 caratteri con lettere maiuscole, minuscole e numeri.';
      case 'auth/invalid-email':
        return 'Indirizzo email non valido.';
      case 'auth/operation-not-allowed':
        return 'Registrazione non consentita. Contatta il supporto.';
      case 'auth/popup-closed-by-user':
        return 'Registrazione con Google annullata.';
      case 'auth/popup-blocked':
        return 'Popup bloccato dal browser. Abilita i popup per continuare.';
      default:
        return error.message || 'Errore durante la registrazione. Riprova.';
    }
  }
}
