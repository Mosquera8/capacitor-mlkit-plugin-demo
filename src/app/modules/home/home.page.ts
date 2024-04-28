import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  public plugins = [
    {
      name: 'Escanea codigo ganador',
      url: '/barcode-scanning',
    },
    {
      name: 'Mapa',
      url:'/map',
    }
  ];

  constructor() {}
}
