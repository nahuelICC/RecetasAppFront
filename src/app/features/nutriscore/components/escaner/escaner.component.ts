import {Component} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {ZXingScannerModule} from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import {HttpClient} from '@angular/common/http';
import {BotonComponent} from '../../../../shared/components/boton/boton.component';
import {PantallaCargaComponent} from '../../../../shared/components/pantalla-carga/pantalla-carga.component';

/**
 * Componente para el escáner de códigos de barras
 */
@Component({
  selector: 'app-escaner',
  templateUrl: './escaner.component.html',
  styleUrls: ['./escaner.component.css'],
  standalone: true,
  imports: [
    NgIf,
    ZXingScannerModule,
    NgForOf,
    BotonComponent,
    PantallaCargaComponent
  ]
})
export class EscanerComponent {


  allowedFormats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX, BarcodeFormat.AZTEC, BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.PDF_417];
  cameras: MediaDeviceInfo[] = [];
  myDevice!: MediaDeviceInfo;
  scannerEnabled = false;
  productData: any = null;
  loading = false;

  constructor(private http: HttpClient) {}

  /**
   * Manejador para cuando se encuentran cámaras disponibles
   * @param cameras
   */
  camerasFoundHandler(cameras: MediaDeviceInfo[]) {
    this.cameras = cameras;
    if (this.cameras.length > 0) {
      this.selectCamera(this.cameras[0].label);
    }
  }

  /**
   * Manejador para cuando se escanea un código de barras exitosamente
   * @param barcode
   */
  async scanSuccessHandler(barcode: string) {
    try {
      this.loading = true;
      const response = await this.http.post<any>('/api/alimento/find', { barcode }).toPromise();
      this.productData = response;
      this.loading = false;
    } catch (error) {
      console.error('Error fetching product data:', error);
      this.loading = false;
    }
  }

  /**
   * Manejador selecciona una cámara específica
   * @param error
   */
  selectCamera(cameraLabel: string) {
    const selectedCamera = this.cameras.find(camera =>
      camera.label.includes(cameraLabel)
    );
    if (selectedCamera) {
      this.myDevice = selectedCamera;
      this.scannerEnabled = true;
    }
  }

}
