import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import firebase from 'firebase';
import { UserLogin } from '../pages/user-login/user-login';
import { Dashboard } from '../pages/dashboard/dashboard';
import { Storage } from '@ionic/storage';
import {PaymentUser} from '../models/paymentUser';
import { FirebaseProvider } from '../providers/firebase-services';
import { AlertController } from 'ionic-angular';
import { OneSignal } from '@ionic-native/onesignal';
import { POINT_CONVERSION_COMPRESSED } from 'constants';
import { Usernote } from '../pages/user-note/user-note';
import { TabsPage } from '../pages/tabs/tabs';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  rootPage = UserLogin;
  user = {} as String;
  userList: Array<String> = []
  isLog = {} as Boolean;
  pages: Array<{title: string,icon:string, component: any}>;
  actions: Array<{title: string,icon:string, action: any}>;
  paymentInsert = {} as PaymentUser
  paymentUserInsert = {} as PaymentUser
  userRef: firebase.database.Reference = firebase.database().ref('/users');

  constructor(
    private firebaseProvider: FirebaseProvider,
    private alertCtrl: AlertController,
    public menuCtrl: MenuController,
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private storage: Storage
  ) {
    this.isLog = false;
    this.user = "";
   
    this.userRef.on('value', Snapshot => {
      
      Snapshot.forEach( SnapshotV => {
      this.userList.push(SnapshotV.val().nickname)
      return false;
    });
  });

    this.initializeApp(); 

    this.actions = [
      { title: 'Add Payment',icon:'paper',action:"insertPayment" },
      { title: 'Note',icon:'book',action:"goNote" },
      { title: 'LogOut',icon:'unlock',action:"logOut" }
    ];
    
  }

  initializeApp() {
      
    this.platform.ready().then(() => {
        this.statusBar.styleDefault();
        this.splashScreen.hide();
        
        this.setUser();

        var notificationOpenedCallback = function(jsonData) {
          console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
        };
    
        window["plugins"].OneSignal
          .startInit("6d161892-b62f-4f74-aa9d-7bc9ecba363c", "554008380664")
          .handleNotificationOpened(notificationOpenedCallback)
          .endInit();
      });
  }
  
  goNote(){
    this.nav.push(Usernote)
    this.menu.close();
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

  logOut(){
    this.storage.set(`user`, "");
    this.storage.set(`isLog`, false);
    this.initializeApp() 
    this.menuCtrl.close();
  }

  addPaymentType(){
    let prompt = this.alertCtrl.create({
      title: 'Tipologia',
      inputs : [
      {
          type:'radio',
          label:'Affitto',
          value:'Affitto'
      },
      {
        type:'radio',
        label:'Bolletta',
        value:'Bolletta'
      },
      {
        type:'radio',
        label:'ADSL',
        value:'ADSL'
      }],
      buttons : [
      {
          text: "Cancel",
          role: 'cancel',
      },
      {
          text: "Next",
          handler: data => {
            
            if(data == null)
              this.emptyType();
            else{
              this.paymentInsert.type = data
              this.addPaymentData()
            }
          }
      }]});
      prompt.present();
  }

  addPaymentData(){
    let alert = this.alertCtrl.create({
      title: 'Dati',
      inputs: [
        {
          name: 'cifra',
          placeholder: 'cifra in euro',
          type: 'number'
        },
        {
          name: 'date',
          placeholder: 'date',
          type: 'date'
        },
        {
          name: 'note',
          placeholder: 'note'
        }

      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Finish',
          handler: data => {
            if(data.date == "" || data.cifra == "")
            this.emptyData();
          else{
            this.paymentInsert.amount = data.cifra
            this.paymentInsert.data = data.date
            this.paymentInsert.note = data.note
            this.firebaseAddPayment()
          }
        }
        }]
    });
    alert.present();
  }

  emptyType(){
    alert("Scegli la tipologia")
    this.addPaymentType();
  }

   emptyData(){
    alert("Compila tutti i dati")
    this.addPaymentData();
  }

  firebaseAddPayment(){
    this.firebaseProvider.insert("payment", this.paymentInsert)
     this.userList.forEach(val =>{
      this.paymentUserInsert.nickname = val
      this.paymentUserInsert.note = this.paymentInsert.note
      this.paymentUserInsert.data = this.paymentInsert.data
      this.paymentUserInsert.type = this.paymentInsert.type
      this.paymentUserInsert.amount = this.paymentInsert.amount
      this.paymentUserInsert.isPay = false
      this.paymentUserInsert.noteuser =""
      this.firebaseProvider.insert("paymentuser", this.paymentUserInsert)
    })
    this.pushMessage("Pagamento Inserito")
  }

  insertPayment(){
    this.addPaymentType();
    this.menu.close();
  }

  actionMenu(action){

    if(action == "insertPayment")
      this.insertPayment()
    else if(action == "logOut")
      this.logOut();
    else if(action == "goNote")
      this.goNote()

  }

  pushMessage(notifyMessage){

    var sendNotification = function(data) {
      var headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic M2RhMGI2YmItZDQwYS00MjM1LWExMDMtZGMwYzA0YmU5NTEx"
      };
      
      var options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: headers
      };
      
      var https =  require('https');
      var req = https.request(options, function(res) {  
        res.on('data', function(data) {
         console.log("Response:");
         console.log(JSON.parse(data));
        });
      });
    
      req.on('error', function(e) {
       console.log("ERROR:");
       console.log(e);
      });
     
      req.write(JSON.stringify(data));
      console.log(data);
      req.end();
    };
    
   
    var message = { 
      app_id: "6d161892-b62f-4f74-aa9d-7bc9ecba363c",
      contents: {"en": notifyMessage},
      included_segments: ["All"]
    };

    sendNotification(message);
  }
}

