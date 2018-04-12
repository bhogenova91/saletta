import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Dashboard } from '../dashboard/dashboard';
import { UserSignup } from '../user-signup/user-signup';
import { UserForgotpassword } from '../user-forgotpassword/user-forgotpassword';
import {User} from '../../models/user';
import {AngularFireAuth}from 'angularfire2/auth';


@IonicPage()
@Component({
  selector: 'page-user-login',
  templateUrl: 'user-login.html',
})
export class UserLogin {
  user = {} as User;
  constructor(public navCtrl: NavController, public navParams: NavParams, private ofAuth : AngularFireAuth) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserLogin');
  }

  async login(user: User){
    user.email = user.nickname + "@lasaletta.bho";
    try{   
          const result = await this.ofAuth.auth.signInWithEmailAndPassword(user.email, user.password);
          if(result)
            this.navCtrl.push(Dashboard);
    }
    catch(e){
          alert(e.message); 
    }
  }

  signupPage(){ this.navCtrl.push(UserSignup); }

  dashboardPage(){ this.navCtrl.push(Dashboard); }
  forgotPasswordPage(){ this.navCtrl.push(UserForgotpassword); }

}
