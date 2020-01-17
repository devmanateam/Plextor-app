import { Component, OnInit } from '@angular/core';
import {NavController} from '@ionic/angular';
import {HttpClient} from '@angular/common/http';
import {LanguageService} from '../../../services/language/language.service';
import {environment} from '../../../environments/environment';
import {UtilsService} from '../../../services/utils/utils.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {

  password_1: string;
  password_2: string;

  constructor(
      private navController: NavController,
      private language: LanguageService,
      private http: HttpClient,
      private utils: UtilsService,
  ) { }

  ngOnInit() {
  }

  ionViewDidLoad() {
    this.initializeStates();
  }

  initializeStates() {
    this.password_1 = "";
    this.password_2 = "";
  }

  navigateToForgotPassword() {
    this.navController.navigateBack('/auth/forgot-password');
  }

  navigateToConfirm() {
    if (this.password_1 != this.password_2) {
      this.utils.showToast(this.language.getWordByLanguage('wrongPassword')).then(async () => {
        await setTimeout(()=>{
          this.initializeStates();
        },500);
      });
      return;
    }
    const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
    this.http.post(environment.userApi + 'resetPassword', {
      password: this.password_1,
      deviceInfo: deviceInfo,
    }).subscribe((response: any) => {
      if (!response) {
        this.utils.showToast(this.language.getWordByLanguage('serverError')).then(async () => {
          await setTimeout(()=>{
            this.initializeStates();
          },500);
        });
      }
      else {
        this.utils.showToast(this.language.getWordByLanguage('successResetPassword')).then(async () => {
          await setTimeout(()=>{
            this.initializeStates();
            localStorage.setItem('confirmType', 'reset');
          },500);
          this.navController.navigateForward('/auth/confirmation');
        });
      }
    });
  }

}
