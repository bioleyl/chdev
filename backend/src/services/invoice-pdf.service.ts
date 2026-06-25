// biome-ignore-all lint/suspicious/noExplicitAny: PDFKit Document type is complex and not fully typed
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';
import { SwissQRBill } from 'swissqrbill/pdf';
import {
  buildTableLayout,
  computeRowHeight,
  drawLineRow,
  drawPageSubtotal,
  drawTableHeader,
} from '../helpers/pdf-table.helper.js';
import type { Data as SwissQRBillData } from 'swissqrbill/types';
import type { TableColumn, TableLine } from '../helpers/pdf-table.helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface InvoiceLike {
  number: string;
  createdAt?: Date;
  status: string;
  total: number;
  client?: {
    companyName?: string;
    email?: string;
    phone?: string;
    address?: string;
    zipCode?: number | string;
    city?: string;
    country?: string;
  };
  lines: Array<{
    id: number;
    quantity: number;
    unitPrice: number;
    description?: string;
    prestation?: {
      label?: string;
    };
  }>;
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PdfData {
  number: string;
  invoiceDate: Date;
  status: string;
  total: number;
  client: {
    companyName?: string;
    email?: string;
    phone?: string;
    address?: string;
    zipCode?: number | string;
    city?: string;
    country?: string;
  };
  lines: Array<{
    id: number;
    quantity: number;
    unitPrice: number;
    description?: string;
    prestationLabel: string;
  }>;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MARGIN = 46;
const HEADER_BOTTOM_Y = 225;
const FIRST_PAGE_TABLE_HEADER_Y = HEADER_BOTTOM_Y + 28;
const CONTINUATION_TABLE_HEADER_Y = MARGIN + 28;
const FOOTER_H = 62;
const SWISS_QR_BILL_H = SwissQRBill.height;
const TOTALS_BLOCK_H = 44;
const TOTALS_TOP_GAP = 8;
const TOTALS_QR_GAP = 8;
const CLIENT_SHIFT_Y = 57;
const LOGO_WIDTH = 125;
const LOGO_HEIGHT = 50;

const SWISS_PAYMENT = {
  iban: 'CH44 3199 9123 0008 8901 2',
  creditorName: 'ChDev SAS',
  creditorStreet: 'Musterstrasse',
  creditorBuildingNumber: '7',
  creditorZip: '8000',
  creditorCity: 'Zurich',
  creditorCountry: 'CH',
  reference: '21 00000 00003 13947 14300 09017',
  additionalInfo: 'Facture de prestations informatiques',
  currency: 'CHF',
} as const;

const COMPANY = {
  name: 'Syware Sàrl',
  line1: 'Route de Broye 10 - 1008 Prilly',
  line2: '',
  line3: 'contact@syware.ch - +41 21 123 45 67',
};

/**
 * Windows-safe filename sanitizer.
 * Removes all characters that are invalid in Windows filenames.
 * Windows forbids: < > : " / \ | ? *
 */
export function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '_');
}

/**
 * Resolve the logo image path using platform-agnostic resolution.
 * Tries multiple candidate paths to handle different working directories
 * that occur on Windows vs Unix-based systems.
 */
const LOGO_CANDIDATE_PATHS = [
  // From the PDF service location: services/../data/syware.png
  resolve(__dirname, '../data/syware.png'),
  // From the backend root: backend/data/syware.png
  resolve(__dirname, '../../data/syware.png'),
  // From the project root (when run from monorepo root): chdev/data/syware.png
  resolve(process.cwd(), 'backend/data/syware.png'),
  // From the project root (when run from monorepo root): chdev/data/syware.png
  resolve(process.cwd(), 'data/syware.png'),
];

const LOGO_PATH = LOGO_CANDIDATE_PATHS.find((candidatePath) => existsSync(candidatePath)) ?? undefined;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtCurrency(v: number): string {
  const sign = v < 0 ? '-' : '';
  const absolute = Math.abs(v);
  const fixed = absolute.toFixed(2);
  const [intPart, decimalPart] = fixed.split('.');
  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${sign}${groupedInt}.${decimalPart}`;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('fr-FR');
}

function buildPdfData(invoice: InvoiceLike): PdfData {
  return {
    number: invoice.number,
    invoiceDate: invoice.createdAt ?? new Date(),
    status: invoice.status,
    total: invoice.total,
    client: {
      companyName: invoice.client?.companyName,
      email: invoice.client?.email,
      phone: invoice.client?.phone,
      address: invoice.client?.address,
      zipCode: invoice.client?.zipCode,
      city: invoice.client?.city,
      country: invoice.client?.country,
    },
    lines: invoice.lines.map((line) => ({
      id: line.id,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      description: line.description,
      prestationLabel: line.prestation?.label ?? '',
    })),
  };
}

function buildSwissQrBillData(data: PdfData): SwissQRBillData {
  return {
    amount: data.total,
    currency: SWISS_PAYMENT.currency,
    creditor: {
      account: 'CH7709000000895023289',
      name: 'Syware Sàrl',
      address: 'Route de Broye',
      buildingNumber: '10',
      zip: '1008',
      city: 'Prilly',
      country: 'CH',
    },
    debtor: {
      name: data.client.companyName || 'Client',
      address: data.client.address || 'Adresse non renseignee',
      zip: String(data.client.zipCode || '1000'),
      city: data.client.city || 'Lausanne',
      country: (data.client.country || 'CH').slice(0, 2).toUpperCase(),
    },
    // reference: SWISS_PAYMENT.reference,
    additionalInformation: `Facture: ${data.number}`,
  };
}

/* ------------------------------------------------------------------ */
/*  Drawing helpers                                                    */
/* ------------------------------------------------------------------ */

function drawHeader(doc: any, data: PdfData): void {
  const pageRight = doc.page.width - MARGIN;
  const clientX = doc.page.width - MARGIN - 210;
  const clientTitleY = MARGIN + 8 + CLIENT_SHIFT_Y;

  if (LOGO_PATH) {
    doc.image(LOGO_PATH, MARGIN, MARGIN - 10, {
      fit: [LOGO_WIDTH, LOGO_HEIGHT],
      align: 'left',
      valign: 'top',
    });
  } else {
    doc
      .fontSize(26)
      .font('Helvetica-Bold')
      .fillColor('#0f172a')
      .text('FACTURE', MARGIN, MARGIN - 2, { lineBreak: false });
  }

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#111827')
    .text(COMPANY.name, MARGIN, MARGIN + 50, { lineBreak: false });
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#374151')
    .text(COMPANY.line1, MARGIN, MARGIN + 65, { lineBreak: false });
  doc.text(COMPANY.line2, MARGIN, MARGIN + 76, { lineBreak: false });
  doc.text(COMPANY.line3, MARGIN, MARGIN + 87, { lineBreak: false });

  const clientName = data.client.companyName || 'Client non renseigne';
  const clientLines = [
    data.client.address || '',
    [data.client.zipCode, data.client.city].filter(Boolean).join(' '),
    data.client.country || '',
  ].filter(Boolean);

  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1f2937');
  let y = clientTitleY + 30;
  doc.text(clientName, clientX, y, { width: 210, align: 'left' });
  y += 12;

  doc.fontSize(11).font('Helvetica').fillColor('#1f2937');
  for (const line of clientLines) {
    doc.text(line, clientX, y, { width: 210, align: 'left' });
    y += 12;
  }

  doc.fontSize(10).font('Helvetica').fillColor('#374151');
  doc.text(`Facture: ${data.number}`, MARGIN, HEADER_BOTTOM_Y, { lineBreak: false });
  doc.text(`Date: ${fmtDate(data.invoiceDate)}`, clientX, HEADER_BOTTOM_Y, { lineBreak: false });

  doc
    .moveTo(MARGIN, HEADER_BOTTOM_Y + 18)
    .lineTo(pageRight, HEADER_BOTTOM_Y + 18)
    .strokeColor('#d1d5db')
    .stroke();
}

function drawContinuationHeader(doc: any, data: PdfData): void {
  const pageRight = doc.page.width - MARGIN;
  const clientX = doc.page.width - MARGIN - 210;

  doc.fontSize(9).font('Helvetica').fillColor('#374151');
  doc.text(`Facture: ${data.number}`, MARGIN, MARGIN + 2, { lineBreak: false });
  doc.text(`Date: ${fmtDate(data.invoiceDate)}`, clientX, MARGIN + 2, { lineBreak: false });

  doc
    .moveTo(MARGIN, CONTINUATION_TABLE_HEADER_Y - 10)
    .lineTo(pageRight, CONTINUATION_TABLE_HEADER_Y - 10)
    .strokeColor('#d1d5db')
    .stroke();
}

function drawFooter(doc: any, pageNumber: number, totalPages: number, isLastPage: boolean): void {
  const footerTop = doc.page.height - FOOTER_H;
  const pageRight = doc.page.width - MARGIN;
  const contentW = doc.page.width - MARGIN * 2;

  doc.fontSize(8).font('Helvetica').fillColor('#6b7280');

  if (!isLastPage) {
    doc.moveTo(MARGIN, footerTop).lineTo(pageRight, footerTop).strokeColor('#d1d5db').lineWidth(1).stroke();
    doc.text(COMPANY.name, MARGIN, footerTop + 10, { width: contentW, align: 'center', lineBreak: false });
    doc.text(COMPANY.line1, MARGIN, footerTop + 21, { width: contentW, align: 'center', lineBreak: false });
    doc.text(COMPANY.line2, MARGIN, footerTop + 32, { width: contentW, align: 'center', lineBreak: false });
  }

  doc.text(`Page ${pageNumber}/${totalPages}`, MARGIN, footerTop + 10, {
    width: contentW,
    align: 'right',
    lineBreak: false,
  });
}

function drawSwissQrBillFooter(doc: any, data: PdfData): void {
  const qrBill = new SwissQRBill(buildSwissQrBillData(data), {
    language: 'FR',
    outlines: true,
    scissors: false,
    separate: false,
  });

  const y = doc.page.height - SWISS_QR_BILL_H;
  qrBill.attachTo(doc, 0, y);
}

// Column definitions for the invoice table
const TABLE_COLUMNS: Array<TableColumn> = [
  { label: 'Prestation', align: 'left', width: 0.52 },
  { label: 'Qte', align: 'center', width: 0.12 },
  { label: 'Prix unitaire', align: 'right', width: 0.18 },
  { label: 'Total', align: 'right', width: 0.18 },
];

// Map a line to the table line format (cells as strings)
function mapLine(line: PdfData['lines'][number]): TableLine {
  const description = line.description ? `${line.prestationLabel}\n${line.description}` : line.prestationLabel;
  const amount = line.quantity * line.unitPrice;
  return {
    cells: [description, String(line.quantity), fmtCurrency(line.unitPrice), fmtCurrency(amount)],
  };
}

function drawTotals(doc: any, data: PdfData, startY: number): void {
  const pageRight = doc.page.width - MARGIN;
  const totalsWidth = 220;
  const totalsX = pageRight - totalsWidth;

  doc.fontSize(10).font('Helvetica').fillColor('#374151');
  doc.text('Total HT', totalsX, startY);
  doc.text(fmtCurrency(data.total), totalsX, startY, { width: totalsWidth, align: 'right' });

  doc
    .moveTo(totalsX, startY + 16)
    .lineTo(pageRight, startY + 16)
    .strokeColor('#9ca3af')
    .stroke();

  doc.fontSize(13).font('Helvetica-Bold').fillColor('#111827');
  doc.text('Total TTC', totalsX, startY + 24);
  doc.text(fmtCurrency(data.total), totalsX, startY + 24, { width: totalsWidth, align: 'right' });
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export async function generateInvoicePdf(invoice: InvoiceLike): Promise<Buffer> {
  const data = buildPdfData(invoice);

  const chunks: Array<Buffer> = [];

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      autoFirstPage: false,
      bufferPages: true,
      margins: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
      info: {
        Title: `Invoice ${data.number}`,
        Producer: 'ChDev Invoice PDF Generator',
      },
    });

    doc.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err: Error) => reject(err));

    let pageNumber = 0;
    let cursorY = FIRST_PAGE_TABLE_HEADER_Y + 24;
    let currentLayout: ReturnType<typeof buildTableLayout> | null = null;
    let runningSubtotal = 0;
    let currentTableHeaderY = FIRST_PAGE_TABLE_HEADER_Y;

    const addPage = (withTableHeader: boolean): void => {
      pageNumber += 1;
      doc.addPage();
      const isFirstPage = pageNumber === 1;

      if (isFirstPage) {
        drawHeader(doc, data);
      } else {
        drawContinuationHeader(doc, data);
      }

      if (withTableHeader) {
        currentTableHeaderY = isFirstPage ? FIRST_PAGE_TABLE_HEADER_Y : CONTINUATION_TABLE_HEADER_Y;
        currentLayout = buildTableLayout(doc, currentTableHeaderY, TABLE_COLUMNS);
        drawTableHeader(doc, currentLayout, TABLE_COLUMNS);
        cursorY = currentTableHeaderY + 24;
      } else {
        currentLayout = null;
        currentTableHeaderY = isFirstPage ? FIRST_PAGE_TABLE_HEADER_Y : CONTINUATION_TABLE_HEADER_Y;
        cursorY = currentTableHeaderY + 4;
      }
    };

    addPage(true);

    for (let i = 0; i < data.lines.length; i += 1) {
      const line = data.lines[i];
      const tableLine = mapLine(line);
      const tableWidth = doc.page.width - MARGIN * 2;
      const rowHeight = computeRowHeight(doc, tableLine.cells[0], tableWidth * 0.52 - 12);
      const rowBottomLimit = doc.page.height - FOOTER_H - 12;
      const subtotalY = Math.max(currentTableHeaderY + 24 + 6, cursorY + 10);

      if (!currentLayout || cursorY + rowHeight > rowBottomLimit) {
        if (currentLayout) {
          drawPageSubtotal(doc, runningSubtotal, subtotalY);
        }
        addPage(true);
      }

      if (!currentLayout) {
        continue;
      }

      drawLineRow(doc, tableLine, cursorY, rowHeight, currentLayout, i % 2 === 1);
      cursorY += rowHeight;
      runningSubtotal += line.quantity * line.unitPrice;
    }

    let totalsY = cursorY + TOTALS_TOP_GAP;
    const totalsBottomLimit = doc.page.height - FOOTER_H - 8;

    if (totalsY + TOTALS_BLOCK_H > totalsBottomLimit) {
      addPage(false);
      totalsY = cursorY + TOTALS_TOP_GAP;
    }

    drawTotals(doc, data, totalsY);

    const qrTopY = doc.page.height - SWISS_QR_BILL_H;
    const totalsBottomY = totalsY + TOTALS_BLOCK_H;
    if (totalsBottomY + TOTALS_QR_GAP > qrTopY) {
      addPage(false);
    }

    drawSwissQrBillFooter(doc, data);

    const pageRange = doc.bufferedPageRange();
    const totalPages = pageRange.count;
    for (let pageOffset = 0; pageOffset < totalPages; pageOffset += 1) {
      doc.switchToPage(pageRange.start + pageOffset);
      const pageNumber = pageOffset + 1;
      drawFooter(doc, pageNumber, totalPages, pageNumber === totalPages);
    }

    doc.end();
  });
}

export const invoicePdfService = {
  generateInvoicePdf,
};
