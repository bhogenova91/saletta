import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { FirebaseProvider } from './../../providers/firebase-services';
import firebase from 'firebase';
import {User} from '../../models/user';
import {Note} from '../../models/note';

@Component({
  selector: 'page-user-note',
  templateUrl: 'user-note.html',
})
export class Usernote {

  public userRefView: firebase.database.Reference = firebase.database().ref('/noteuser');
  notes :Array<Note> = []
  user = {} as User;

  constructor(
    private firebaseProvider: FirebaseProvider,
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private alertCtrl: AlertController){

      this.user.nickname = navParams.data;
   

      this.userRefView.on('value', paySnapshot => {
        this.notes =[]
        paySnapshot.forEach( paySnapshotV => {
    
          if(paySnapshotV.val().nickname == this.user.nickname)
          { 
            var note = {} as Note
            note.nickname = navParams.data;
            note.id = paySnapshotV.key;
            note.note = paySnapshotV.val().note;
            this.notes.push(note);  
          }    
 
            return false;
      });
      this.notes = this.notes.reverse();
      });

  }

  ionViewDidLoad() {
  }

  deleteNote(id : String){
    this.firebaseProvider.remove(id, "noteuser")
  }

  showNote(note:string) {
    let alert = this.alertCtrl.create({
      title: note,
      buttons: ['Ok']
    });
    alert.present();
  }
   
}
