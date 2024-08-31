import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

console.log('Angular application starting...');

bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('Angular application started successfully.'))
  .catch((err) => {
    console.error('Angular application failed to start:', err);
  });
