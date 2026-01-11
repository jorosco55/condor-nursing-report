import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class LoginPage {
  username: string = '';
  password: string = '';
  hidePassword: boolean = true;

  constructor(
    private router: Router,
    private toastCtrl: ToastController
  ) {}

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
      this.router.navigate(['/tabs/report']);
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Please enter username and password.',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}
