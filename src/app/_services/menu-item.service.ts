import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MenuItem } from '../_models/menu-item.model';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize, switchMap } from 'rxjs/operators';
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
  deleteMenuItem(menuItemId: string) {
    return this.afs.collection('menuItems').doc(menuItemId).delete();
  }

  // Get menu items for a specific section, ordered by 'order'
  getMenuItemsForSection(sectionId: string) {
    return this.afs.collection<MenuItem>('menuItems', ref =>
      ref.where('sectionId', '==', sectionId).orderBy('order')).valueChanges();
  }
}
