import { Component, OnDestroy, OnInit } from '@angular/core';

import { Events, ModalController, ToastController, Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { LoadingControllerOption, UserData } from '../interface/interface';

import * as firebase from 'firebase';
import 'firebase/database';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth/auth.service';
import { CallModalPage } from './modals/call-modal/call-modal.page';
import { Storage } from '@ionic/storage';
import { Zoom } from '@ionic-native/zoom/ngx';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  isLoading: boolean;
  loadingOptions: LoadingControllerOption;
  SDK_KEY = '9ZDl5tKRk86RbP6MKcCw0Vj0sIlxv12SYscD';
  SDK_SECRET = 'DQg5lSPwKMNp3FJxBdj3t8G0XvozDnedJ4Yt';

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private events: Events,
    private modalController: ModalController,
    private toastCtrl: ToastController,
    private auth: AuthService,
    private storage: Storage,
    private zoomService: Zoom
  ) {
    this.events.subscribe('show-loading', (options: LoadingControllerOption) => {
      this.isLoading = true;
      if (!options) {
        options = {
          position: 'center',
          message: 'Please wait...',
          showMessage: true,
          overlay: true
        };
      } else {
        if (options.position && options.position === null || options.position === undefined) {
          options.position = 'center';
        }

        if (options.message && options.message === null || options.message === undefined) {
          options.message = 'Please wait...';
        }

        if (options.showMessage && options.showMessage === null || options.showMessage === undefined) {
          options.showMessage = true;
        }

        if (options.overlay && options.overlay === null || options.overlay === undefined) {
          options.overlay = true;
        }
      }
      this.loadingOptions = options;
    });

    this.events.subscribe('hide-loading', () => {
      this.isLoading = false;
    });
    this.initializeApp();
  }

  ngOnInit(): void {
    this.isLoading = false;
    this.loadingOptions = {
      position: 'center',
      message: 'Please wait...',
      showMessage: true,
      overlay: true
    };
  }

  ngOnDestroy(): void {
    this.events.unsubscribe('show-loading');
    this.events.unsubscribe('hide-loading');
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();

      this.zoomService.initialize(this.SDK_KEY, this.SDK_SECRET)
        .then((success) => {
          console.log(success);
          this.presentToast(success);
        })
        .catch((error) => {
          console.log(error);
          this.presentToast(error);
        });

      this.events.subscribe('testing', () => {
        this.storage.get('tested').then((res) => {
          console.log(res);
        });
      });

      firebase.database().ref('/calls/signaling/').on('child_added', (snapshot) => {
        const data = snapshot.val();
        this.auth.currentUser().then((user: UserData) => {
          if (user) {
            const uid = data.remoteIdentify.split('-')[0];
            if (uid === user.id) {
              this.modalController.create({
                component: CallModalPage,
                componentProps: {
                  user: {
                    id: data.localIdentify.split('-')[0],
                    name: data.localName,
                    photo: data.localPhoto,
                    phone: data.localIdentify.split('-')[2]
                  },
                  type: data.type,
                  direction: 'inbound'
                }
              }).then(modal => {
                modal.present().then(async () => {
                  await firebase.database().ref('/calls/signaling/' + snapshot.key).remove();
                });
              });
            }
          }
        });
        console.log(snapshot.val());
      });

      firebase.database().ref('/calls/answered/').on('child_added', (snapshot) => {
        const data = snapshot.val();
        this.auth.currentUser().then((user: UserData) => {
          if (user) {
            const uid = data.remoteIdentify.split('-')[0];
            if (uid === user.id) {
              this.events.publish('call-answered', snapshot.key);
              firebase.database().ref('/calls/answered/' + snapshot.key).remove();
            }
          }
        });
        console.log(snapshot.val());
      });

      firebase.database().ref('/calls/completed/').on('child_added', (snapshot) => {
        const data = snapshot.val();
        this.auth.currentUser().then((user: UserData) => {
          if (user) {
            const uid = data.remoteIdentify.split('-')[0];
            if (uid === user.id) {
              this.events.publish('call-ended', snapshot.key);
              firebase.database().ref('/calls/completed/' + snapshot.key).remove();
            }
          }
        });
        console.log(snapshot.val());
      });
      // this.splashScreen.hide();
    });
  }

  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
}
