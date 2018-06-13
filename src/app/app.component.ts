import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { UserLogin } from '../pages/user-login/user-login';
import { Storage } from '@ionic/storage';
import { OneSignal } from '@ionic-native/onesignal';
import { POINT_CONVERSION_COMPRESSED } from 'constants';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  rootPage = UserLogin;
  user = {} as String;
  isLog = {} as Boolean;

  constructor(
    public menuCtrl: MenuController,
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private storage: Storage
  ) {
      this.isLog = false;
      this.user = "";
      this.initializeApp(); 
 
  }

  initializeApp() {
      
    this.platform.ready().then(() => {
        this.statusBar.styleDefault();
        this.splashScreen.hide();
        
        this.setUser();

        var notificationOpenedCallback = function(jsonData) {
          console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
        };

        var getPlayerIdCallback = function (response){
           this.storage.set(`idOnesignal`, response.userId);
        }

        window["plugins"].OneSignal.startInit("6d161892-b62f-4f74-aa9d-7bc9ecba363c", "554008380664");
        window["plugins"].OneSignal.handleNotificationOpened(notificationOpenedCallback);
        window["plugins"].OneSignal.getIds(getPlayerIdCallback.bind(this));
        window["plugins"].OneSignal.endInit();
      });
      
  }
  
  setUser(){
    this.storage.get('isLog').then((value) => {
      this.isLog = JSON.parse(value)
    });
    
    this.storage.get('user').then((value) => {
      this.user = value
      this.nav.setRoot(UserLogin, {isLog: this.isLog, user: this.user});
    });
  }
}

