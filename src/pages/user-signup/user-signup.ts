import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Dashboard } from '../dashboard/dashboard';
import { UserLogin } from '../user-login/user-login';
import { UserForgotpassword } from '../user-forgotpassword/user-forgotpassword';
import {AngularFireAuth}from 'angularfire2/auth';
import {User} from '../../models/user';
import { FirebaseProvider } from './../../providers/firebase-services';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
//import { Camera } from '@ionic-native/camera';

@Component({
  selector: 'page-user-signup',
  templateUrl: 'user-signup.html',
})
export class UserSignup {

  songs: any;
  user = {} as User;
  confirmPassword : string;
  files: Observable<any[]>;
  userFirebaseList: AngularFireList<any>;
  //base64Image:any;

  constructor(/*public camera:Camera, */public navCtrl: NavController, private ofAuth: AngularFireAuth,
    private firebaseProvider: FirebaseProvider, private alertCtrl: AlertController, private toastCtrl: ToastController, private iab: InAppBrowser, private AfDatabase : AngularFireDatabase) {
      this.songs = AfDatabase.list('/songs').valueChanges();
     // this.files = this.firebaseProvider.getFiles();
    }

  checkPasswor(user)
  {
    user.email = user.nickname + "@lasaletta.bho";
    if(this.confirmPassword === user.password)
      this.register(user)
    else
      alert("Passwords do not match");
  }

  async register(user: User){
    try{
        const result = await this.ofAuth.auth.createUserWithEmailAndPassword(user.email, user.password);
      if(result)
          this.navCtrl.push(Dashboard);
    }
    catch(e){
      alert(e.message);
    }
  }


  addFile() {
    let inputAlert = this.alertCtrl.create({
      title: 'Store new information',
      inputs: [
        {
          name: 'info',
          placeholder: 'Lorem ipsum dolor...'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Store',
          handler: data => {
            this.uploadInformation(data.info);
          }
        }
      ]
    });
    inputAlert.present();
  }

  uploadInformation(text) {
    let upload = this.firebaseProvider.uploadToStorage(text);
 
    // Perhaps this syntax might change, it's no error here!
    upload.then().then(res => {
      this.firebaseProvider.storeInfoToDatabase(res.metadata).then(() => {
        let toast = this.toastCtrl.create({
          message: 'New File added!',
          duration: 3000
        });
        toast.present();
      });
    });
  }


  addSong(){
    let prompt = this.alertCtrl.create({
      title: 'Song Name',
      message: "Enter a name for this new song you're so keen on adding",
      inputs: [
        {
          name: 'title',
          placeholder: 'Title'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            const newSongRef = this.songs.push({});
   
            newSongRef.set({
              id: newSongRef.key
            });
          }
        }
      ]
    });
    prompt.present();
  }
  /*accessGallery(){
    this.camera.getPicture({
      sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
      destinationType: this.camera.DestinationType.DATA_URL
     }).then((imageData) => {
       this.base64Image = 'data:image/jpeg;base64,'+imageData;
      }, (err) => {
       console.log(err);
     });
   }*/

}