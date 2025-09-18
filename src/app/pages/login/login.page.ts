import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
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
  LoadingController,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, logoGoogle, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
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
    IonSpinner
  ]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({ mailOutline, lockClosedOutline, logoGoogle, eyeOutline, eyeOffOutline });
    
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loading = await this.loadingController.create({
        message: 'Accesso in corso...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const { email, password } = this.loginForm.value;
        await this.authService.signIn(email, password);
        
        await loading.dismiss();
        await this.showToast('Accesso effettuato con successo!', 'success');
        this.router.navigate(['/tabs/home']);
      } catch (error: any) {
        await loading.dismiss();
        await this.showToast(error.message || 'Errore durante l\'accesso', 'danger');
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  async signInWithGoogle() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Accesso con Google...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await this.authService.signInWithGoogle();
      
      await loading.dismiss();
      await this.showToast('Accesso effettuato con successo!', 'success');
      this.router.navigate(['/tabs/home']);
    } catch (error: any) {
      await loading.dismiss();
      await this.showToast(error.message || 'Errore durante l\'accesso con Google', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async forgotPassword() {
    const alert = await this.alertController.create({
      header: 'Reset Password',
      message: 'Inserisci la tua email per ricevere il link di reset password',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email',
          value: this.loginForm.get('email')?.value || ''
        }
      ],
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Invia',
          handler: async (data) => {
            if (data.email) {
              try {
                await this.authService.resetPassword(data.email);
                await this.showToast('Email di reset inviata!', 'success');
              } catch (error: any) {
                await this.showToast(error.message || 'Errore durante l\'invio', 'danger');
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  // Getter per facilità di accesso nei template
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
