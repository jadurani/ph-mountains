import { Injectable } from '@angular/core';
import mapboxgl, { Marker } from 'mapbox-gl';
import { environment } from '@env/environment';
// import SENSOR_DATA from '@assets/sensors.json';
import { fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  map: mapboxgl.Map;
  style = 'mapbox://styles/jadurani/cksd49h6t67oj18s3myu826h0';
  lat = 12.599512;
  lng = 120.984222;
  zoom = 5;
  graphShown = false;

  constructor() {
    mapboxgl.accessToken = environment.mapbox.accessToken;
  }

  buildMap() {
    this.map = new mapboxgl.Map({
      container: 'ph-mountains-map',
      style: this.style,
      zoom: this.zoom,
      center: [this.lng, this.lat],
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    fromEvent(this.map, 'load').subscribe(() => {
      this.showDataPoints();
    });
  }

  showDataPoints() {
    const graphDiv = document.getElementById('graph-dom');
    let popUp = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    this.map.addLayer({
      id: 'ph-mountain-list-027fow',
      type: 'circle',
      source: {
        type: 'vector',
        url: 'mapbox://jadurani.22cu7zmz',
      },
      'source-layer': 'ph-mountain-list-027fow',
      paint: {
        'circle-color': '#6C8B7F',
        'circle-radius': 6,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#A3CCBD',
      },
    });

    const _this = this;
    this.map.on('mouseover', 'ph-mountain-list-027fow', (e) => {
      _this.map.getCanvas().style.cursor = 'pointer';
      console.log(e.features[0]);
      const coordinates = (e.features[0].geometry as any).coordinates.slice();
      const location = e.features[0].properties.location;
      const name = e.features[0].properties.name;
      const elevation = e.features[0].properties.elevation;

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      popUp
        .setLngLat(coordinates)
        .setHTML(
          `
          <div style="color: #333333;">
            <div><strong>Mt. ${name}</strong></div>
            <div>Location: ${location}</div>
            <div>Elevation: ${elevation} MASL</div>
          </div>
        `
        )
        .addTo(_this.map);
    });

    this.map.on('click', 'ph-mountain-list-027fow', function (e) {
      _this.map.flyTo({
        center: (e.features[0].geometry as any).coordinates.slice(),
        zoom: 11,
        essential: true,
      });

      popUp.setDOMContent(graphDiv).setMaxWidth('500px');

      _this.graphShown = true;
    });

    popUp.on('close', () => (_this.graphShown = false));

    this.map.on('mouseleave', 'ph-mountain-list-027fow', function () {
      if (_this.graphShown) return;

      _this.map.getCanvas().style.cursor = '';
      popUp.remove();
    });
  }
}
