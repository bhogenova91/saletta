import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { FirebaseProvider } from './../../providers/firebase-services';
import firebase from 'firebase';
import {User} from '../../models/user';
import { PaymentUser } from '../../models/paymentUser';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';

@Component({
  selector: 'page-pay-pay',
  templateUrl: 'user-pay.html',
})
export class UserPay {

  public payRef: firebase.database.Reference = firebase.database().ref('/paymentuser');
  paymentList :Array<PaymentUser> = []
  payData = {} as PaymentUser
  payType = {} as String
  songs: AngularFireList<any>;
  
  constructor(
    private firebaseProvider: FirebaseProvider,
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private alertCtrl: AlertController){

      this.payData = navParams.data.data;
      this.payType = navParams.data.type;

      this.payRef.on('value', paySnapshot => {
        this.paymentList =[]
        paySnapshot.forEach( paySnapshotV => {

          if(paySnapshotV.val().data == this.payData && paySnapshotV.val().type == this.payType)
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

  ionViewDidLoad() {

  }

  confirmPay(paymentId:string){
      this.firebaseProvider.update(paymentId)
  }

  updateFunction(questionId){
    var sample;
    sample.list('/paperCode', ref => ref.orderByChild('questionId').equalTo(questionId)).snapshotChanges()
    .subscribe(actions => {
        actions.forEach(action => {
          // here you get the key
          console.log(action.key);
          sample.list('/paperCode').update(action.key, { points: 10 });
        });
    });
}


   
}
