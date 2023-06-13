import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    userLoggedIn: boolean;      // other components can check on this variable for the login status of the user

    constructor(private router: Router, private afAuth: AngularFireAuth, private afs: AngularFirestore) {
        this.userLoggedIn = false;

        this.afAuth.onAuthStateChanged((user) => {              // set up a subscription to always know the login status of the user
            if (user) {
                this.userLoggedIn = true;
            } else {
                this.userLoggedIn = false;
            }
        });
    }

    getAuthState(): Observable<any> {
        return this.afAuth.authState;
    }

    loginUser(email: string, password: string): Promise<any> {
        return this.afAuth.signInWithEmailAndPassword(email, password)
            .then(() => {
                console.log('Auth Service: loginUser: success');
                this.router.navigate(['/dashboard']);
            })
            .catch(error => {
                console.log('Auth Service: login error...');
                console.log('error code', error.code);
                console.log('error', error);
                if (error.code)
                    return { isValid: false, message: error.message };
            });
    }

    signupUser(user: any): Promise<any> {
        return this.afAuth.createUserWithEmailAndPassword(user.email, user.password)
            .then((result) => {
                let emailLower = user.email.toLowerCase();

                this.afs.doc('/users/' + emailLower)                        // on a successful signup, create a document in 'users' collection with the new user's info
                    .set({
                        accountType: 'endUser',
                        isPaying: true,
                        owner: user.owner,
                        location_name: user.location_name,
                        description: user.description,
                        email: user.email,
                        phone: user.phone,
                        website: user.website,
                        address: user.address,
                        zip: user.zip,
                        school: user.school,
                        pin: user.pin,
                        email_lower: emailLower,
                    });

                result.user.sendEmailVerification();                    // immediately send the user a verification email
            })
            .catch(error => {
                console.log('Auth Service: signup error', error);
                if (error.code)
                    return { isValid: false, message: error.message };
            });
    }

    resetPassword(email: string): Promise<any> {
        return this.afAuth.sendPasswordResetEmail(email)
            .then(() => {
                console.log('Auth Service: reset password success');
                // this.router.navigate(['/amount']);
            })
            .catch(error => {
                console.log('Auth Service: reset password error...');
                console.log(error.code);
                console.log(error)
                if (error.code)
                    return error;
            });
    }

    async resendVerificationEmail() {                         // verification email is sent in the Sign Up function, but if you need to resend, call this function
        return (await this.afAuth.currentUser).sendEmailVerification()
            .then(() => {
                // this.router.navigate(['login']);
            })
            .catch(error => {
                console.log('Auth Service: sendVerificationEmail error...');
                console.log('error code', error.code);
                console.log('error', error);
                if (error.code)
                    return error;
            });
    }

    logoutUser(): Promise<void> {
        return this.afAuth.signOut()
            .then(() => {
                this.router.navigate(['/login']);                    // when we log the user out, navigate them to home
            })
            .catch(error => {
                console.log('Auth Service: logout error...');
                console.log('error code', error.code);
                console.log('error', error);
                if (error.code)
                    return error;
            });
    }

    setUserInfo(payload: object) {
        console.log('Auth Service: saving user info...');
        this.afs.collection('users')
            .add(payload).then(function (res) {
                console.log("Auth Service: setUserInfo response...")
                console.log(res);
            })
    }

    getCurrentUser() {
        return this.afAuth.currentUser;                                 // returns user object for logged-in users, otherwise returns null 
    }

    getCurrentUserInfo(email) {
        return this.afs
            .collection("users")
            .doc(email)
            .valueChanges();
    }

    updateUser(email: string, user: any): Promise<void> {
        // ensure email is lower case since that's what we use in our Firestore document paths
        const emailLower = email.toLowerCase();

        // merge the new user data with the existing data
        // this way, only provided fields will be updated
        return this.afs.doc('/users/' + emailLower).update(user)
            .then(() => {
                console.log('Auth Service: updateUser: success');
            })
            .catch(error => {
                console.log('Auth Service: updateUser: error...');
                console.log('error code', error.code);
                console.log('error', error);
                if (error.code)
                    return error;
            });
    }

    //Save establishments images
    saveImageUrl(userId: string, imageUrl: string): Promise<void> {
        return this.afs.collection('userImages').add({
            uid: userId,
            imageUrl: imageUrl
        })
            .then(() => { }) // resolve with void
            .catch(error => {
                console.error("Error adding document: ", error);
            });
    }

    getImages(userId: string): Observable<any[]> {
        return this.afs.collection('userImages', ref => ref.where('uid', '==', userId))
          .snapshotChanges()
          .pipe(
            map(actions => actions.map(a => {
              const data = a.payload.doc.data() as object; // Ensure the data is treated as an object
              return { ...data };
            }))
          );
      }      
}
