import { Resume } from '../_models/resume.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import 'firebase/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
    providedIn: 'root'
})
export class ResumesService {

    constructor(private afs: AngularFirestore, private storage: AngularFireStorage  // <-- Inject AngularFireStorage
    ) { }

    // Function to get all resumes for a user based on their uid
    getResumesListForUser(userId: string) {
        return this.afs
            .collection("resumes", ref => ref.where('uid', '==', userId))
            .snapshotChanges();
    }

    // Function to toggle the archived status of a resume
    toggleArchiveStatus(resume: Resume) {
        const id = resume.id;
        const resumeRef = this.afs.collection("resumes").doc(id).ref;

        return this.afs.firestore.runTransaction((transaction) => {
            return transaction.get(resumeRef).then((resumeDoc) => {
                if (!resumeDoc.exists) {
                    throw "Document does not exist!";
                }

                const resumeData = resumeDoc.data() as Resume;
                const newArchivedStatus = !resumeData.archived;
                transaction.update(resumeRef, { archived: newArchivedStatus });
            });
        });
    }

    // Function to delete a specific resume
    async deleteResume(resume: Resume): Promise<void> {
        // Use AngularFire's storage service to delete the resume from Firebase Storage
        const resumeFilePath = `resumes/${resume.uid}/${resume.fileName}`;
        const resumeFileRef = this.storage.ref(resumeFilePath);
        await resumeFileRef.delete().toPromise();

        // Then, delete the resume from Firestore
        await this.afs.collection("resumes").doc(resume.id).delete();
    }
}
