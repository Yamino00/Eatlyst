import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
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
        this.router.navigate(['/tabs']);
        
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
      this.router.navigate(['/tabs']);
      
    } catch (error: any) {
      await loading.dismiss();
      await this.showToast(this.getErrorMessage(error), 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async showTerms(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Termini e Condizioni',
      message: `
        <p><strong>Termini di Utilizzo di Eatlyst</strong></p>
        <p>1. Accettando questi termini, accetti di utilizzare l'app responsabilmente</p>
        <p>2. I tuoi dati sono protetti secondo la nostra privacy policy</p>
        <p>3. Le ricette condivise devono essere appropriate e sicure</p>
        <p>4. Ci riserviamo il diritto di rimuovere contenuti inappropriati</p>
        <p>5. L'app è fornita "come è" senza garanzie specifiche</p>
      `,
      buttons: ['Chiudi']
    });
    await alert.present();
  }

  async showPrivacyPolicy(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Privacy Policy',
      message: `
        <p><strong>Politica sulla Privacy di Eatlyst</strong></p>
        <p>1. Raccogliamo solo i dati necessari per il servizio</p>
        <p>2. I tuoi dati personali sono crittografati e protetti</p>
        <p>3. Non condividiamo i tuoi dati con terze parti senza consenso</p>
        <p>4. Puoi eliminare il tuo account e tutti i dati in qualsiasi momento</p>
        <p>5. Utilizziamo Firebase per l'archiviazione sicura dei dati</p>
      `,
      buttons: ['Chiudi']
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
