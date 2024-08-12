import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import { MapaComponent } from './components/mapa/mapa.component';
import { SocketIoModule } from 'ngx-socket-io';
import { environment } from '../environments/environment.development';



@NgModule({
  declarations: [
    AppComponent,
    MapaComponent
  ],
  imports: [
    BrowserModule,
    SocketIoModule,
    HttpClientModule,
    SocketIoModule.forRoot(environment.socketConfig),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
