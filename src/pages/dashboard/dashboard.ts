import { Component } from '@angular/core';
import { NavController, NavParams, App  } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { User} from '../../models/user';
import { Note} from '../../models/note';
import { FirebaseProvider } from './../../providers/firebase-services';
import   firebase from 'firebase';
import { PaymentUser } from '../../models/paymentUser';
import { Storage } from '@ionic/storage';
import { UserLogin } from '../user-login/user-login';
import { UserPay } from '../user-pay/user-pay';
import { OneSignal } from '@ionic-native/onesignal';
import { POINT_CONVERSION_COMPRESSED } from 'constants';

@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html',
})
export class Dashboard {

  rootNavCtrl: NavController
  userList: Array<User> = []
    paymentUserInsert = {} as PaymentUser
    user = {} as User;
    note = {} as Note;
    paymentList: Array<PaymentUser> = []
    payStringView : string;
    public payRef: firebase.database.Reference = firebase.database().ref('/paymentuser');
    public payRefView: firebase.database.Reference = firebase.database().ref('/paymentuser');
    paymentInsert = {} as PaymentUser
    userRef: firebase.database.Reference = firebase.database().ref('/users');
    onesignalList: Array<String>
    onesignalSendList: Array<String>

  constructor(
    private app: App,
    private storage: Storage,
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private alertCtrl: AlertController,
    private firebaseProvider: FirebaseProvider){
  
      this.userRef.on('value', Snapshot => {
      
        Snapshot.forEach( SnapshotV => {
        this.userList.push(SnapshotV.val())
        return false;
      });
    });
      
        this.user.nickname = navParams.data;
  }

  ionViewDidLoad() {
      this.makePaymentList();
  }

  makePaymentList(){
    
      this.payRef.on('value', paySnapshot => {
        this.paymentList =[]
        paySnapshot.forEach( paySnapshotV => {
          if(paySnapshotV.val().nickname == this.user.nickname)
          {
            var payment = {} as PaymentUser
            payment = paySnapshotV.val()
            payment.paymentId = paySnapshotV.key
            
            this.paymentList.push(payment);  
          }    
            return false;
      });
      this.paymentList = this.paymentList.reverse();
      });
  }
    
  showNote(note:string) {
    let alert = this.alertCtrl.create({
      title: note,
      buttons: ['Ok']
    });
    alert.present();
  }

  logOut(){
    this.storage.set(`user`, "");
    this.storage.set(`isLog`, false);
    this.app.getRootNav().push(UserLogin);
  }
  
  async viewPay(pay:PaymentUser) {
      this.payStringView=""

      await this.payRefView.on('value', paySnapshot => {
        paySnapshot.forEach( paySnapshotV => {

          if(paySnapshotV.val().type = pay.type && paySnapshotV.val().data == pay.data && !paySnapshotV.val().isPay)
          {
            this.payStringView = "<br />- " + paySnapshotV.val().nickname + "<br />" + this.payStringView 
          }    
            return false;
        });
      });

      let alert = this.alertCtrl.create({
            title: 'DA PAGARE:',
            subTitle: this.payStringView,
            buttons: ['OK']
          });
      alert.present();
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
      }
      ,
      {
        type:'radio',
        label:'Altro',
        value:'Altro'
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
            this.selectUser()
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
      this.onesignalList.forEach(val2 =>{
        if(val.onesignalid == val2)
        {
          this.paymentUserInsert.nickname = val.nickname
          this.paymentUserInsert.note = this.paymentInsert.note
          this.paymentUserInsert.data = this.paymentInsert.data
          this.paymentUserInsert.type = this.paymentInsert.type
          this.paymentUserInsert.amount = this.paymentInsert.amount
          this.paymentUserInsert.isPay = "0"
          this.paymentUserInsert.noteuser =""
          this.firebaseProvider.insert("paymentuser", this.paymentUserInsert)
          this.UserpushMessage("Notifica: "+this.paymentInsert.type, val.onesignalid)
        }
       });
    });
  }

  insertPayment(){
    this.addPaymentType();
  }

  UserpushMessage(notifyMessage, arrayUser){
    console.log(arrayUser)
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
        });
      });
    
      req.on('error', function(e) {
      });
     
      req.write(JSON.stringify(data));
      req.end();
    };
    
   
    var message = { 
      app_id: "6d161892-b62f-4f74-aa9d-7bc9ecba363c",
      contents: {"en": notifyMessage},
      include_player_ids: [arrayUser]
    };

    sendNotification(message);
  }

  addNote(){
    let alert = this.alertCtrl.create({
      title: 'Note',
      inputs: [
        {
          name: 'Note',
          placeholder: 'Note'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
          }
        },
        {
          text: 'Save',
          handler: data => {
            this.note.nickname=this.user.nickname;
            this.note.note = data.Note;
            this.firebaseProvider.insert("noteuser", this.note)
          }
        }
      ]
    });
    alert.present();
  }

  userPay(typePay:string, dataPay:string){
    this.navCtrl.push(UserPay, {type: typePay, data: dataPay})
  }

  selectUser() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Users');
    this.userList.forEach(val =>{
      alert.addInput({
        type: 'checkbox',
        label: val.nickname,
        value: val.onesignalid,
        checked: false
      });
    });
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Ok',
      handler: selected => {
       this.onesignalList= null;
       this.onesignalList = selected
       this.firebaseAddPayment()
      }
    });
    alert.present();
  }
}
