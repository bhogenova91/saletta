import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import {User} from '../../models/user';
import { FirebaseProvider } from './../../providers/firebase-services';
import firebase from 'firebase';
import { PaymentUser } from '../../models/paymentUser';

@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html',
})
export class Dashboard {

user = {} as User;
paymentList: Array<PaymentUser> = []
payStringView : string;
public payRef: firebase.database.Reference = firebase.database().ref('/paymentuser');
public payRefView: firebase.database.Reference = firebase.database().ref('/paymentuser');


  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private alertCtrl: AlertController,
    private firebaseProvider: FirebaseProvider){

        this.user.nickname = navParams.get("user")
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
        title: 'Nota',
        subTitle: note,
        buttons: ['OK']
      });
      alert.present();
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

  goPay(pay:PaymentUser){
        pay.isPay = true
        this.firebaseProvider.remove(pay.paymentId,"paymentuser")
        this.firebaseProvider.insert("paymentuser",pay)
  }
   
}
