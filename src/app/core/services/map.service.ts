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
  style = 'mapbox://styles/jadurani/ckn56hvjq09fb17p6cmnve685';
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
      closeButton: true,
      closeOnClick: false,
    });

    this.map.addLayer({
      id: 'sensors-bbsddb',
      type: 'circle',
      source: {
        type: 'vector',
        url: 'mapbox://jadurani.asse9xyo',
      },
      'source-layer': 'sensors-bbsddb',
      paint: {
        'circle-color': '#4264fb',
        'circle-radius': 6,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff',
      },
    });

    const _this = this;
    this.map.on('mouseover', 'sensors-bbsddb', (e) => {
      _this.map.getCanvas().style.cursor = 'pointer';

      const coordinates = (e.features[0].geometry as any).coordinates.slice();
      const location = e.features[0].properties.location;
      const stationID = e.features[0].properties.station_id;
      const rainValueSum = e.features[0].properties.rain_value_sum;

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      popUp
        .setLngLat(coordinates)
        .setHTML(
          `
          <div style="color: #333333;">
            <div><strong>#${stationID} - ${location}</strong></div>
            <div>Rain Value Sum: ${rainValueSum}</div>
          </div>
        `
        )
        .addTo(_this.map);
    });

    this.map.on('click', 'sensors-bbsddb', function (e) {
      _this.map.flyTo({
        center: (e.features[0].geometry as any).coordinates.slice(),
        zoom: 11,
        essential: true,
      });

      popUp.setDOMContent(graphDiv).setMaxWidth('500px');

      _this.graphShown = true;
    });

    popUp.on('close', () => (_this.graphShown = false));

    this.map.on('mouseleave', 'sensors-bbsddb', function () {
      if (_this.graphShown) return;

      _this.map.getCanvas().style.cursor = '';
      popUp.remove();
    });
  }
}
