import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import { Section } from '../_models/section.model';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  constructor(
    private afs: AngularFirestore,
  ) { }

  // Get a single section document
  getSectionDoc(id: string) {
    return this.afs
      .collection("sections")
      .doc(id)
      .valueChanges();
  }

  // Get list of sections for a specific user, ordered by 'order'
  getSectionsListForUser(userId: string) {
    return this.afs
      .collection("sections", ref => ref.where('uid', '==', userId).orderBy('order'))
      .snapshotChanges();
  }

  // Create a new section
  createSection(section: Section) {
    return new Promise<any>((resolve, reject) => {
      this.afs
        .collection("sections")
        .add(section)
        .then(resolve, reject);
    });
  }

  // Delete a section
  deleteSection(sectionId: string) {
    return this.afs
      .collection("sections")
      .doc(sectionId)
      .delete();
  }

  // Update a section
  updateSection(section: Section) {
    return this.afs
      .collection("sections")
      .doc(section.id)
      .update({
        name: section.name,
        order: section.order
      });
  }
}
