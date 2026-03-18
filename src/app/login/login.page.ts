import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, IonContent } from '@ionic/angular/standalone';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiInputPassword } from '@taiga-ui/kit';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    TuiTextfield,
    TuiInputPassword,
    TuiButton
  ]
})
export class LoginPage {
  username: string = '';
  password: string = '';

  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  async onLogin() {
    // Generic login - accept any non-empty credentials for now
    if (this.username.trim() && this.password.trim()) {
      // Store login state (simple implementation)
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', this.username);

      const toast = await this.toastCtrl.create({
        message: `Welcome, ${this.username}!`,
        duration: 2000,
        color: 'success'
      });
      toast.present();

      // Navigate to main app
      this.router.navigate(['/records']);
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Please enter username and password.',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }
}
