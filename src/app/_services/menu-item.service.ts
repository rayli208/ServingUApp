import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MenuItem } from '../_models/menu-item.model';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize, map, switchMap } from 'rxjs/operators';
import { from, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuItemService {
  constructor(
    private afs: AngularFirestore,
    private storage: AngularFireStorage
  ) { }

  // Create a new menu item
  createMenuItem(menuItem: MenuItem): Promise<void> {
    return new Promise((resolve, reject) => {
      this.afs.collection('menuItems').add(menuItem)
        .then(() => resolve())
        .catch(error => reject(error));
    });
  }

  updateMenuItem(menuItem: MenuItem): Promise<void> {
    return this.afs
      .collection("menuItems")
      .doc(menuItem.id)
      .update(menuItem)
      .then(() => {
        // Handle successful update
      })
      .catch((error) => {
        // Handle error
      });
  }

  // Delete a menu item
  deleteMenuItem(menuItemId: string, imageUrl: string | null): Promise<void> {
    return new Promise((resolve, reject) => {
      const deleteDoc = () => {
        // Delete the menu item document
        this.afs.collection('menuItems').doc(menuItemId).delete().then(() => {
          console.log('Menu item document deleted successfully');
          resolve();
        }).catch(error => {
          console.error('Error deleting menu item document:', error);
          reject(error);
        });
      };

      if (imageUrl) {
        // Delete the image if it exists
        const imageRef = this.storage.refFromURL(imageUrl);
        imageRef.delete().toPromise()
          .then(() => {
            console.log('Image deleted successfully');
            deleteDoc(); // Proceed to delete the document after image deletion
          })
          .catch(error => {
            console.error('Error deleting image or image not found:', error);
            deleteDoc(); // Even if image deletion fails, proceed to delete the document
          });
      } else {
        // No image URL, directly delete the document
        deleteDoc();
      }
    });
  }

  // Get menu items for a specific section, ordered by 'order'
  getMenuItemsForSection(sectionId: string) {
    return this.afs.collection<MenuItem>('menuItems', ref =>
      ref.where('sectionId', '==', sectionId).orderBy('order'))
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(c => ({ id: c.payload.doc.id, ...c.payload.doc.data() as MenuItem }))
        )
      );
  }
}
