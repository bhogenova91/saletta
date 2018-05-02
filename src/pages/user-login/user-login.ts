import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Dashboard } from '../dashboard/dashboard';
import { UserSignup } from '../user-signup/user-signup';
import {User} from '../../models/user';
import {AngularFireAuth}from 'angularfire2/auth';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'page-user-login',
  templateUrl: 'user-login.html',
})
export class UserLogin {
  user = {} as User;

  constructor(public navCtrl: NavController, public navParams: NavParams, private ofAuth : AngularFireAuth,
    private storage: Storage) {
      
      if(navParams.get("isLog"))
          this.navCtrl.push(Dashboard, {user: navParams.get("user")})
  }

  async login(user: User){
    this.storage.set(`isLog`, true);
    this.storage.set(`user`,this.user.nickname);

    user.email = user.nickname + "@lasaletta.bho";
    try{   
          const result = await this.ofAuth.auth.signInWithEmailAndPassword(user.email, user.password);
          if(result)
            this.navCtrl.push(Dashboard, {user: this.user.nickname});
    }
    catch(e){
          alert(e.message); 
    }
  }
 
  signupPage(){ this.navCtrl.push(UserSignup); }

}
