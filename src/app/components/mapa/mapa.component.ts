import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as mapboxgl from 'mapbox-gl';

import { Lugar } from '../../interfaces/interfaces';
import { WebsocketService } from '../../services/websocket.service';

interface RespMarcadores {
  [key: string]: Lugar
}

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css'
})
export class MapaComponent implements OnInit {
 
  mapa: mapboxgl.Map | undefined; 

  //lugares: Lugar[] = [];
  //lugares: {[key: string]: Lugar } = {};
  lugares: RespMarcadores = {};
  markerMapBox: {[id: string]:  mapboxgl.Marker} ={};

  constructor(
    private http: HttpClient,
    private wsService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.http.get<RespMarcadores>('http://localhost:5000/mapa').subscribe(
      ( lugares ) =>{
        console.log(lugares);
        this.lugares = lugares;
        this.crearMapa();
      }
    );

    this.escucahaSockets();
  }


  escucahaSockets(){
    // marcador-nuevo
    this.wsService.listen('marcador-nuevo').subscribe(
      (marcador: any )=>{ //Con Lugar da error de tipado
        this.agregarMarcador(marcador);
      }
    );

    // marcador-mover
    this.wsService.listen('marcador-mover').subscribe(
      (marcador: any ) => {
        this.markerMapBox[marcador.id].setLngLat([marcador.lng, marcador.lat]);
      }
    );


    // marcador-borrar
    this.wsService.listen('marcador-borrar').subscribe(
      (id: any )=>{ //Con string da error de tipado
       this.markerMapBox[id].remove();
       delete this.markerMapBox[id]; 
       delete this.lugares[id]
      }
    );
  }

  crearMapa() {
    this.mapa = new mapboxgl.Map({
      accessToken: 'pk.eyJ1IjoiajJnIiwiYSI6ImNsMjRocTY5djAzNzAzbG5ucm94YzdsbTMifQ.ytMLfcV9AWvAY-LyvCE-GA',
      container: 'mapa',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-75.75512993582937, 45.349977429009954],
      zoom: 15.8,
    });

    for (const [key, marcador] of Object.entries(this.lugares)) {
      this.agregarMarcador(marcador);
    }
  }

  agregarMarcador(marcador: Lugar) {
    
    // const html =`<h2> ${ marcador.nombre } <h2>
    //             <br>
    //             <button>Borrar</button>`;


    const h2 = document.createElement('h2');
    h2.innerText = marcador.nombre;

    const btnBorrar = document.createElement('button');
    btnBorrar.innerText = 'Borrar';

    const div = document.createElement('div');
    div.append (h2, btnBorrar);



    const customPopup = new mapboxgl.Popup({
      offset: 25,
      closeOnClick: false
    }).setDOMContent(div);  //.setHTML( html );

    const marker = new mapboxgl.Marker({
      draggable: true,
      color: marcador.color
    })
    .setLngLat([marcador.lng, marcador.lat])
    .setPopup(customPopup)
    .addTo(this.mapa!);

    marker.on('drag',() => {
      const lngLat = marker.getLngLat();

      const nuevoMarcador = {
        id:  marcador.id,
        lng: lngLat.lng,
        lat: lngLat.lat
      };

      this.wsService.emit('marcador-mover', nuevoMarcador);
    })

    btnBorrar.addEventListener('click', () => { 
      marker.remove();
      this.wsService.emit('marcador-borrar', marcador.id);
      
    });

    this.markerMapBox[marcador.id] = marker;
  }

  crearMarcador(){

    const customMarket: Lugar = {
      id: new Date().toISOString(),
      lng: -75.75512993582937,
      lat: 45.349977429009954,
      nombre: 'Sin nombre',
      color: '#' + Math.floor(Math.random()*16777215).toString(16) 
    }
    this.agregarMarcador( customMarket );

    // Emitir marcador-nuevo
    this.wsService.emit('marcador-nuevo', customMarket);
  }
}
