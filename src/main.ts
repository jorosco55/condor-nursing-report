import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideEventPlugins } from '@taiga-ui/event-plugins';
import { provideFormlyCore } from '@ngx-formly/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import {
  CondorFormlyDateFieldComponent,
  CondorFormlySelectFieldComponent,
  CondorFormlyTextFieldComponent,
  CondorFormlyTextareaFieldComponent
} from './app/shared/formly/condor-formly-fields';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      mode: 'md',
      scrollAssist: false,
      scrollPadding: false
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAnimations(),
    provideEventPlugins(),
    provideFormlyCore({
      types: [
        { name: 'condor-text', component: CondorFormlyTextFieldComponent },
        { name: 'condor-date', component: CondorFormlyDateFieldComponent },
        { name: 'condor-select', component: CondorFormlySelectFieldComponent },
        { name: 'condor-textarea', component: CondorFormlyTextareaFieldComponent },
      ],
    }),
  ],
}).catch((err) => console.log(err));
