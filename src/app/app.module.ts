import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { CountriesModalPageModule } from './modals/countries-modal/countries-modal.module';
import { IonicRatingModule } from 'ionic-rating';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { BreathingExercisePageModule } from './modals/breathing-exercise/breathing-exercise.module';
import { HttpClientModule } from '@angular/common/http';
import { MindfulExercisePageModule } from './modals/mindful-exercise/mindful-exercise.module';
import { CallModalPageModule } from './modals/call-modal/call-modal.module';
import * as firebase from 'firebase';
import { environment } from '../environments/environment';

import { Camera } from '@ionic-native/Camera/ngx';
import { File } from '@ionic-native/File/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { CallNumber } from '@ionic-native/call-number/ngx';

import { Zoom } from '@ionic-native/zoom/ngx';

firebase.initializeApp(environment.firebaseConfig);

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    HttpClientModule,
    AppRoutingModule,
    IonicRatingModule,
    CountriesModalPageModule,
    BreathingExercisePageModule,
    MindfulExercisePageModule,
    CallModalPageModule,
    IonicStorageModule.forRoot(),
    NgCircleProgressModule.forRoot(),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Camera,
    File,
    WebView,
    FilePath,
    CallNumber,
    Zoom
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
