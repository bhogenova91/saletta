import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';


@Component({
  selector: 'page-user-note',
  templateUrl: 'user-note.html',
})
export class Usernote {

  notes :Array<String> = []

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private alertCtrl: AlertController){

      this.notes.push("nota1")
      this.notes.push("nota2")
      this.notes.push("nota3")
      this.notes.push("nota4")

  }

  ionViewDidLoad() {

  }

   
}
