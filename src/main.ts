import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { addIcons } from "ionicons";
import {heart, home, person, add, heartOutline} from "ionicons/icons";

addIcons({
  heart,
  home,
  person,
  add,
  heartOutline

});



bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
