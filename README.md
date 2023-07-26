# Building a Secure Dashboard with Angular 11 and Firebase for ServingU

# Overview
We will walk you through the process of creating a secure and efficient dashboard for ServingU, an expert agency in restaurant management and staffing led by the dynamic duo, Rayli Raykov and Josh Hageman. Rayli, the developer, focuses on ensuring the digital infrastructure's smooth functioning, while Josh, the sales and consulting maestro, handles client relationship and business development.

This guide will cover the following steps:

1. Setting up a Firebase App
2. Crafting an Angular app with minimal elements
3. Integrating Firebase authentication into the Angular app
4. Tweaking the security of Cloud Firestore database 
5. Building the application for production 

Let's get started!

# Creating Your Firebase App
Head over to Firebase website and follow the instructions below. The precise steps might differ slightly due to frequent updates to Firebase.

Start with initializing a Firebase Authentication for user logins and build a Cloud Firestore NoSQL database for user data storage. 

The database for this project will include a `users` collection. Documents inside this collection will contain `{accountType<string>, displayName<string>, displayName_lower<string>, email<string>, email_lower<string>}` fields.

# Constructing Your Angular App
Ensure that you're using at least Angular 11 and npm version 7.

Next, create your Angular project, 'serving-u-app', and add Firebase and Angular Material libraries to it. The Angular Material library will enhance the visual appeal and user experience of your application. Angular's built-in tools will remove any unused libraries during the production build process.

After setting up the basic architecture, proceed to create the necessary components, services, Firebase auth, and Angular page guards. 

# Integrating Firebase Authentication with the Angular App

Next, we will incorporate Firebase authentication into the Angular app using the Firebase App credentials. Remember to hide these credentials if you're using Git for version control.

The basic navigation for each component is set up in the `app.module.ts` file. Firebase Authentication's user log-in status is used to restrict access to certain pages, navigated using the code in `services/auth.guard.ts`.

The `services/auth.service.ts` code allows interaction with Firebase Authentication and Cloud Firestore. Notice how the `signupUser` function not only signs up a new user but also creates a new NoSQL document in the `users` collection to store user information!

# Modifying Cloud Firestore Database Security

Initially, anyone with a database link can read/write into the Firestore database. It's crucial to adjust these settings to ensure data security. By modifying the rules in the Firebase > Build > Cloud Firestore > Rules section, you can customize read and write access as needed.

# Building for Production 

Finally, build your application for production using the `ng build --prod` command. Angular's production build process will automatically remove all unused libraries.

You can then upload the contents of your `serving-u-app/dist/serving-u-app` folder to the `html` folder of your website.

This efficient and secure Angular application, powered by Firebase, will act as the digital backbone of ServingU, enabling Rayli and Josh to excel in their roles and deliver unparalleled service to their clientele.