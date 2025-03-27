import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { addIcons } from "ionicons";
import { heart, home, person, add, search, closeCircle, eye, help, heartOutline, shareSocialOutline, chatbubbleOutline, bookmarkOutline, ellipsisHorizontalOutline, homeOutline, paperPlaneOutline, personOutline, bookOutline } from "ionicons/icons";

addIcons({
  heart,
  home,
  person,
  add,
  search,
  closeCircle,
  eye,
  help,
  heartOutline,
  shareSocialOutline,
  chatbubbleOutline,
  bookmarkOutline,
  ellipsisHorizontalOutline,
  homeOutline,
  paperPlaneOutline,
  personOutline,
  bookOutline

});



bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
