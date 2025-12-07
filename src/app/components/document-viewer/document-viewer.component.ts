import { Component, inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentService } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-viewer.component.html',
})
export class DocumentViewerComponent implements OnInit {
  private readonly documentService = inject(DocumentService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly ticket = '571cc3a3-5b1f-4855-af26-0de6e7c5475f';

  documentTypes = [
    { type: 'pdf' as const, label: 'PDF', color: 'bg-red-500 hover:bg-red-600' },
    { type: 'xml' as const, label: 'XML', color: 'bg-green-500 hover:bg-green-600' },
    { type: 'cdr' as const, label: 'CDR', color: 'bg-blue-500 hover:bg-blue-600' }
  ];

  tabs = [
    { id: 'documento' as const, label: 'Documento' },
    { id: 'crear' as const, label: 'Crear' },
    { id: 'convertir' as const, label: 'Convertir a Factura Negociable' }
  ];

  activeTab: 'documento' | 'crear' | 'convertir' = 'documento';

  currentDocType: 'pdf' | 'xml' | 'cdr' | null = null;

  pdfUrl: SafeResourceUrl | null = null;

  textContent: string = '';

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPdf();
    }
  }

  setActiveTab(tab: 'documento' | 'crear' | 'convertir'): void {
    this.activeTab = tab;
  }

  loadDocument(type: string): void {
    if (type === 'pdf') this.loadPdf();
    else if (type === 'xml') this.loadXml();
    else if (type === 'cdr') this.loadCdr();
  }

  loadPdf(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.currentDocType = 'pdf';
    this.pdfUrl = null;
    this.textContent = '';
    this.changeDetector.detectChanges();

    this.documentService.getPdf(this.ticket).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.isLoading = false;
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar PDF:', error);
        this.errorMessage = 'Error al cargar el PDF';
        this.isLoading = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  loadXml(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.currentDocType = 'xml';
    this.pdfUrl = null;
    this.textContent = '';
    this.changeDetector.detectChanges();

    this.documentService.getXml(this.ticket).subscribe({
      next: async (blob) => {
        this.textContent = await blob.text();
        this.isLoading = false;
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar XML:', error);
        this.errorMessage = 'Error al cargar el XML';
        this.isLoading = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  loadCdr(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.currentDocType = 'cdr';
    this.pdfUrl = null;
    this.textContent = '';
    this.changeDetector.detectChanges();

    this.documentService.getCdr(this.ticket).subscribe({
      next: async (blob) => {
        this.textContent = await blob.text();
        this.isLoading = false;
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar CDR:', error);
        this.errorMessage = 'Error al cargar el CDR';
        this.isLoading = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  downloadFile(type: 'pdf' | 'xml' | 'cdr'): void {
    const observable =
      type === 'pdf'
        ? this.documentService.getPdf(this.ticket)
        : type === 'xml'
        ? this.documentService.getXml(this.ticket)
        : this.documentService.getCdr(this.ticket);

    observable.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `documento-${this.ticket}.${type}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error(`Error al descargar ${type.toUpperCase()}:`, error);
        alert(`Error al descargar el archivo ${type.toUpperCase()}`);
      },
    });
  }

  showHelp(): void {
    alert('¡¡Ayudaaaa!!');
  }

  showUpcoming(): void {
    alert('Es un placeholder por ahora :)');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
