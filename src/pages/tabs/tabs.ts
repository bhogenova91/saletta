import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import {User} from '../../models/user';
import { Dashboard } from '../dashboard/dashboard';
import { Usernote } from '../user-note/user-note';


@Component({
  templateUrl: 'tabs.html'
})

export class TabsPage {

  tab1Root = Dashboard;
  tab2Root = Usernote;
  tab3Root = Dashboard;

  user = {} as User;
  exit = {} as String;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams) {
      
      this.user.nickname = navParams.get("user")

  }
}
