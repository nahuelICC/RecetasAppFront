import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { addIcons } from "ionicons";
import { heart, add, search, closeCircle, eye, help, heartOutline, shareSocialOutline, chatbubbleOutline, bookmarkOutline, ellipsisHorizontalOutline, home, paperPlaneOutline, person, bookOutline, restaurantOutline, logOut, nutrition, bookmarkSharp,
  addCircleOutline,
  cartOutline } from "ionicons/icons";

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
  paperPlaneOutline,
  bookOutline,
  restaurantOutline,
  logOut,
  nutrition,
  bookmarkSharp,
  addCircleOutline,
  cartOutline,

});



bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
