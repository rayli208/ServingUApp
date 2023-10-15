import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => {
    if ('serviceWorker' in navigator && environment.production) {
      navigator.serviceWorker.register('/custom-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);

          // When an update is found, refresh the page
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available, refresh the page to use the new version immediately
                  window.location.reload();
                }
              }
            };
          });
        })
        .catch((err) => {
          console.log('Service Worker registration failed:', err);
        });
    }
  })
  .catch(err => console.error(err));

// When the service worker changes, refresh the page
let refreshing: boolean;
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (refreshing) return;
  refreshing = true;
  window.location.reload();
});
