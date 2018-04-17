import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
 
@Injectable()
export class FirebaseProvider {
 
  dbRecord:AngularFireList<any>;

  constructor(private db: AngularFireDatabase, private afStorage: AngularFireStorage) { }
 
  insert(table:string, insertObject:any){
    this.dbRecord = this.db.list('/'+table);
    const newSongRef = this.dbRecord.push({});
            newSongRef.set(insertObject);
  }

  getFiles() {
    let ref = this.db.list('files');
 
    return ref.snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
  }
 
  uploadToStorage(information): AngularFireUploadTask {
    let newName = `${new Date().getTime()}.txt`;
 
    return this.afStorage.ref(`files/${newName}`).putString(information);
  }
 
  storeInfoToDatabase(metainfo) {
    let toSave = {
      created: metainfo.timeCreated,
      url: metainfo.downloadURLs[0],
      fullPath: metainfo.fullPath,
      contentType: metainfo.contentType
    }
    return this.db.list('files').push(toSave);
  }
 
  deleteFile(file) {
    let key = file.key;
    let storagePath = file.fullPath;
 
    let ref = this.db.list('files');
 
    ref.remove(key);
    return this.afStorage.ref(storagePath).delete();
  }
}
