import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    BrowserAnimationsModule
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
