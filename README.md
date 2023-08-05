# Building a secure dashboard with Angular 11 and Firebase

# Overview
1. Create a Firebase app
1. Create a nearly empty Angular app
1. Connect Firebase authentication to the Angular app
1. Adjust the Cloud Firebase database's security
1. Build for production

# Create your Firebase App
The Firebase website changes fairly often, so the exact wording below might change a little.

We're going to use Firebase Authentication for logins and Cloud Firestore 
    to build a NoSQL database to store details about our users.

* firebase.google.com > (login) > "Go to console" > "Add project" > name: "skeleton" >
    Continue > (we're not going to enable Google Analytics) > "Create project" 
    
* when the project is created, you'll be taken to its dashboard, click the small "</>" Web logo > 
    enter "skeleton" for "My web app" name > (no need to set up Firebase hosting) > "Register app"

* you'll be taken to a page with Firebase SDK code. keep this tab open! we'll work with the `firebaseConfig` variable in a later step when we connect our Firebase and Angular apps

## Set up Firebase Authentication
* open a duplicate browser tab and navigate to your Skeleton app console

* in the left column, browse to Build > Authentication > click "Get started"

* you should be on the "Sign-in method" tab now. Select "Email/Password" and click "Enable" (we're going to leave "passwordless sign-in" disabled) > "Save"

## Set up the Cloud Firestore database
* in the left column, browse to Build > Cloud Firestore > click "Create database" > "Start in test mode" > "Next" > (choose a location close to you) > "Enable"

## Cloud Firestore test data
* you don't have to set up any data, collections, or documents manually! Everything will be automatically built from our Angular app

* for this project, I have 1 collection of documents called `users`
    
* documents inside the `users` collection contain the fields `{accountType<string>, displayName<string>, displayName_lower<string>, email<string>, email_lower<string>}`

# Create your Angular App

## Make sure your coding environment is up to date
> ng version            
* make sure you're at least using Angular 11

> npm -v                
* make sure you're at least using npm version 7

## Create the Angular project
> npm install -g @angular/cli

> ng new angular-firebase-dashboard
* Enforce stricter type checking? No
* Add Angular routing? Yes
* Which stylesheet? CSS

> cd angular-firebase-dashboard

## Add the Firebase and Angular Material libraries

> ng add @angular/fire
* Please select a project: (the newly created Firebase "skeleton-###" app)

> ng add @angular/material
* Choose a prebuilt theme: (any)
* Typography: Yes
* Browser animations: (yes or no; I'll be choosing yes)

Note: you can choose "No", but even if you choose "Yes" and end up
    not using it, when you build your app for production, all unused libraries will be removed

## Start the Server
> ng serve --port 4202 --open

## Remove boilerplate code
* in `angular-firebase-dashboard/src/app/app.component.html`, only keep the `<router-outlet></router-outlet>` tag at the very bottom of the file

## Add components, services, Firebase auth, and Angular page guards
> ng generate component home

> ng generate component signup
    
> ng generate component login

> ng generate component forgot-password

> ng generate component verify-email
    
> ng generate component dashboard

> ng generate component admin-dashboard

> ng generate service services/auth

> ng generate guard services/auth
* Which interface?  CanActivate

## Link the pages (Set up page routing)
* open `angular-firebase-dashboard/src/app/app-routing.module.ts`
    * import each component
    * add each component to the `routes:[...]` array
    * import `AuthGuard`
    * add the property `canActivate: [AuthGuard]` to make the dashboard and admin-dashboard accessible only to logged in users

# Connect Firebase authentication to the Angular app

## Use the Firebase App credentials
* open `angular-firebase-dashboard/src/environments/environment.ts` and `environment.prod.ts`
* in your browser, return to the tab with the Firebase SDK code and the `firebaseConfig` variable; copy the snippet of code to both `environment` files, renaming `firebaseConfig` to `firebase`
* in case you're using `git`, you won't want to publish this information, so open your `.gitignore` file, make sure to include the line `/src/environments/**`
* note: since these files are not part of my GitLab project, here's what my `environment.ts` file generally looks like:

```
export const environment = {
    production: false,
    firebase: {
        apiKey: "MY_DATA_HERE",
        authDomain: "MY_DATA_HERE",
        projectId: "MY_DATA_HERE",
        storageBucket: "MY_DATA_HERE",
        messagingSenderId: "MY_DATA_HERE",
        appId: "MY_DATA_HERE"
    }
};
```

* keep in mind that Firebase often changes what info is put inside the `firebaseConfig = {...}` variable, so if Firebase supplies you with slightly different info, that's fine

## Add basic navigation to each component
* open `angular-firebase-dashboard/src/app/app.module.ts`
    * import the additional modules that we'll be using (see my code)
    * add these modules to the `imports:[...]` array
    * this lets us use Angular Material in our components and it imports our Firebase environment variables

* open `angular-firebase-dashboard/src/app/services/auth.guard.ts`
    * import the code
    * this code checks if the user is logged in via Firebase Authentication and limits their ability to view pages based on what we've set up in `app-routing.module.ts`
    * if the user isn't allowed in a given component, we use this code to navigate them back to `/home`

* open `angular-firebase-dashboard/src/app/services/auth.service.ts`
    * import the code
    * this code interfaces with Firebase Authentication and Cloud Firestore
    * notice that the `signupUser` function not only uses Firebase Authentication to sign up a new user, but when that signup returns successfully, it uses Cloud Firestore to create a new NoSQL document in the `users` collection to store info about our new user!
        * we don't have to explicitly create a collection or a document; if one doesn't exist, it'll be created automatically
        * notice that we have `*_lower` fields in the document; that's because Cloud Firestore doesn't allow for case-insensitive searching, so when we need to search a field, we'll always search the `*_lower` field

* open `angular-firebase-dashboard/src/app/home/home.component.ts` and `.html`
    * import the code
    * repeat this for every other component we generated

# Adjust the Cloud Firebase database's security
Currently, anyone with a link to the Cloud Firestore database can read from it and write to it.  Let's change this!

* in a browser, navigate to Firebase > Build > Cloud Firestore > Rules

* to allow read & write access only if the user is logged in: 
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userEmail} {
        allow read, write: if request.auth != null;
    }
  }
}
```

* to allow read access only to a logged in user's own doc and no write access: 
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userEmail} {
        allow read: if request.auth.token.email.lower() == userEmail;
        allow write: if false;
    }
  }
}
```

# Build for production 
> ng build --prod

* building for production will take a little time, but all of the unused libraries will be removed!

* you can take the contents of your `angular-firebase-dashboard/dist/angular-firebase-dashboard` folder and upload it to the `html` folder of your website




