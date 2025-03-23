import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { addIcons } from "ionicons";
import {
  heart,
  home,
  person,
  add,
  search,
  closeCircle,
  eye,
  heartOutline,
  shareSocialOutline,
  chatbubbleOutline, bookmarkOutline, ellipsisHorizontalOutline
} from "ionicons/icons";
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
  eye,
  heartOutline,
  shareSocialOutline,
  chatbubbleOutline,
  bookmarkOutline,
  ellipsisHorizontalOutline,

});



bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
