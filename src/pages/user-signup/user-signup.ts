import { Component } from '@angular/core';
import {NavController, NavParams } from 'ionic-angular';
import { Dashboard } from '../dashboard/dashboard';
import { UserLogin } from '../user-login/user-login';
import {AngularFireAuth}from 'angularfire2/auth';
import {User} from '../../models/user';
import { FirebaseProvider } from './../../providers/firebase-services';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Storage } from '@ionic/storage';
import { TabsPage } from '../../pages/tabs/tabs';
@Component({
  selector: 'page-user-signup',
  templateUrl: 'user-signup.html',
})
export class UserSignup {

  user = {} as User;
  confirmPassword : string;
  userOnsignalId: String;

  constructor(
    public navCtrl: NavController, 
    private ofAuth: AngularFireAuth,
    private firebaseProvider: FirebaseProvider,  
    private storage: Storage) {
 
    }


  checkUser(user){
    if(user.nickname !="" && user.password !="" && user.confirmPassword !="")
    {
      user.email = user.nickname + "@lasaletta.bho";
      if(this.confirmPassword === user.password)
        this.register(user)
      else
        alert("le password non corrispondono");
    }
    else
      alert("Compilare tutti i campi");     
  }

  async register(user: User){
    try{
        const result = await this.ofAuth.auth.createUserWithEmailAndPassword(user.email, user.password);
      if(result)
      {
        this.storage.set(`isLog`, true);
        this.storage.set(`user`,this.user.nickname);
        this.firebaseAddUser()
        this.navCtrl.push(TabsPage, {user: this.user.nickname})
        //this.navCtrl.push(Dashboard, {user: user.nickname});
      }
    }
    catch(e){
      alert(e.message);
    }
  }

  firebaseAddUser(){
    this.storage.get('idOnesignal').then((value) => {
      this.user.onesignalid = value
      this.user.isAdmin = false;
      this.firebaseProvider.insert("users", this.user);
    });
    
  }

  goLogin(){
    this.navCtrl.push(UserLogin);
  }

}
