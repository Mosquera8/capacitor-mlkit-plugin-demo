import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  //styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit {
  private map: any;
  private qrData: any[] = []; // Array para almacenar los datos de los códigos QR

  constructor() { }

  ngOnInit(): void {
    this.initializeMap();
    this.loadQRDataFromLocalStorage();
    this.addMarkersFromQRData();
  }

  private initializeMap(): void {
    this.map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private loadQRDataFromLocalStorage(): void {
    const qrDataString = localStorage.getItem('qrData');
    if (qrDataString) {
      this.qrData = JSON.parse(qrDataString);
    }
  }

  private addMarkersFromQRData(): void {
    this.qrData.forEach(qr => {
      this.addMarker(qr.coordinates.lat, qr.coordinates.lng);
    });
  }

  public addMarker(lat: number, lng: number): void {
    L.marker([lat, lng]).addTo(this.map)
      .bindPopup('Coordenadas: ' + lat + ', ' + lng)
      .openPopup();
  }
}
