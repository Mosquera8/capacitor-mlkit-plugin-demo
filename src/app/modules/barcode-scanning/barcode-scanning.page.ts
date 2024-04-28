import { Component, NgZone, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DialogService } from '@app/core';
import {
  Barcode,
  BarcodeFormat,
  BarcodeScanner,
  LensFacing,
} from '@capacitor-mlkit/barcode-scanning';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';

@Component({
  selector: 'app-barcode-scanning',
  templateUrl: './barcode-scanning.page.html',
  styleUrls: ['./barcode-scanning.page.scss'],
})

export class BarcodeScanningPage implements OnInit {
  public readonly barcodeFormat = BarcodeFormat;
  public readonly lensFacing = LensFacing;

  public formGroup = new UntypedFormGroup({
    formats: new UntypedFormControl([]),
    lensFacing: new UntypedFormControl(LensFacing.Back),
    googleBarcodeScannerModuleInstallState: new UntypedFormControl(0),
    googleBarcodeScannerModuleInstallProgress: new UntypedFormControl(0),
  });
  public barcodes: Barcode[] = [];
  public isSupported = false;
  public isPermissionGranted = false;

 
  constructor(
    private readonly dialogService: DialogService,
    private readonly ngZone: NgZone,
  ) {}
  
  // Google y permisos de camara 
  public ngOnInit(): void {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
    BarcodeScanner.checkPermissions().then((result) => {
      this.isPermissionGranted = result.camera === 'granted';
    });
    BarcodeScanner.removeAllListeners().then(() => {
      BarcodeScanner.addListener(
        'googleBarcodeScannerModuleInstallProgress',
        (event) => {
          this.ngZone.run(() => {
            console.log('googleBarcodeScannerModuleInstallProgress', event);
            const { state, progress } = event;
            this.formGroup.patchValue({
              googleBarcodeScannerModuleInstallState: state,
              googleBarcodeScannerModuleInstallProgress: progress,
            });
          });
        },
      );
    });
  }

  // Scan solo libreria QR
  public async startScan(): Promise<void> {
    const element = await this.dialogService.showModal({
      component: BarcodeScanningModalComponent,
      cssClass: 'barcode-scanning-modal',
      showBackdrop: false,
      componentProps: {
        formats: [BarcodeFormat.QrCode], // Usamos solo el formato QrCode
        lensFacing: LensFacing.Back, // Definimos el valor de lensFacing
      },
    });
    element.onDidDismiss().then(async (result) => {
      const barcode: Barcode | undefined = result.data?.barcode;
      if (barcode) {
        this.barcodes = [barcode];

        // Almacenar información del código QR en el almacenamiento local
        const qrData = {
          coordinates: barcode.cornerPoints?.toString() || '',
          id: barcode.rawValue || '',
          date: new Date().toISOString(),
        };
        localStorage.setItem('qrData', JSON.stringify(qrData));
      }
    });
  }

  // De imagen coger el QR
  public async readBarcodeFromImage(): Promise<void> {
    const { files } = await FilePicker.pickImages({ limit: 1 });
    const path = files[0]?.path;
    if (!path) {
      return;
    }
    const { barcodes } = await BarcodeScanner.readBarcodesFromImage({
      path,
      formats: [BarcodeFormat.QrCode], // Leemos solo códigos QR de la imagen seleccionada
    });
    this.barcodes = barcodes;

    // Almacenar información de los códigos QR en el almacenamiento local
    barcodes.forEach((barcode: Barcode) => {
      const qrData = {
        coordinates: barcode.cornerPoints?.toString() || '',
        id: barcode.rawValue || '',
        date: new Date().toISOString(),
      };
      localStorage.setItem('qrData', JSON.stringify(qrData));
    });
  }
  // Promesa del Scan
  public async scan(): Promise<void> {
    const { barcodes } = await BarcodeScanner.scan({
      formats: [BarcodeFormat.QrCode], // Escaneamos solo códigos QR
    });
    this.barcodes = barcodes;
  }

  // Consulta de google scan
  public async installGoogleBarcodeScannerModule(): Promise<void> {
    await BarcodeScanner.installGoogleBarcodeScannerModule();
  }
  // Permisos celular
  public async requestPermissions(): Promise<void> {
    await BarcodeScanner.requestPermissions();
  }

}
