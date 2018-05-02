import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import firebase from 'firebase';

@Injectable()
export class FirebaseProvider {
 
  dbRecord:AngularFireList<any>;

  constructor(private db: AngularFireDatabase) { }
 
  insert(table:string, insertObject:any){
    this.dbRecord = this.db.list('/'+table);
    const newSongRef = this.dbRecord.push({});
            newSongRef.set(insertObject);
  }

  remove(id: String, table: String): void {
    this.db.object(table+'/' + id).remove();
  }

  read(ref: firebase.database.Reference){
    ref.on('value', paySnapshot => {
    return paySnapshot
    });
  }

}
