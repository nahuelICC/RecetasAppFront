import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { addIcons } from "ionicons";
import { heart, home, person, add, search, closeCircle, eye, help } from "ionicons/icons";

addIcons({
  heart,
  home,
  person,
  add,
  search,
  closeCircle,
  eye,
  help
});



bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
