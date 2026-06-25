// biome-ignore-all lint/suspicious/noExplicitAny: PDFKit Document type is complex and not fully typed
/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface TableColumn {
  label: string;
  align: 'left' | 'center' | 'right';
  width: number; // fraction of available content width (e.g. 0.52)
}

export interface TableLine {
  cells: Array<string>; // one cell value per column
}

export interface DrawTableOptions {
  columns: Array<TableColumn>;
  lines: Array<TableLine>;
  y: number; // top-left Y position
  zebra?: boolean; // default: true
  pageSubtotal?: number; // draw "subtotal carried forward" after rows
}

/** Internal layout computed once, then passed to all row-drawing functions. */
export interface TableLayout {
  /** X positions for each column */
  x: Array<number>;
  /** Widths for each column */
  w: Array<number>;
  /** Alignment for each column */
  align: Array<'left' | 'center' | 'right'>;
  /** Total content width */
  contentW: number;
  /** Header Y position */
  headerY: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MARGIN = 46;
const TABLE_HEADER_H = 24;
const HEADER_FONT_SIZE = 9;
const HEADER_FONT_FACE = 'Helvetica-Bold';
const HEADER_TEXT_Y_OFFSET = 7;
const HEADER_FILL_COLOR = '#1f2937';
const HEADER_TEXT_FILL_COLOR = '#ffffff';
const ROW_FONT_SIZE = 9;
const ROW_FONT_FACE = 'Helvetica';
const ROW_TEXT_FILL_COLOR = '#111827';
const ROW_TEXT_Y_OFFSET = 7;
const ROW_MIN_HEIGHT = 26;
const ROW_SEPARATOR_COLOR = '#e5e7eb';
const ZEBRA_FILL_COLOR = '#f9fafb';
const PAGE_SUBTOTAL_FONT_SIZE = 10;
const PAGE_SUBTOTAL_BOLD_FONT_SIZE = 10;
const PAGE_SUBTOTAL_FILL_COLOR = '#111827';
const TOTALS_WIDTH = 220;

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Draw a complete table (header + all lines) in one call.
 * For the multi-page page-break loop, use the granular functions below.
 */
export function drawTable(doc: any, options: DrawTableOptions): void {
  const layout = buildTableLayout(doc, options.y, options.columns);
  drawTableHeader(doc, layout, options.columns);
  const rowY = layout.headerY + TABLE_HEADER_H;

  for (let i = 0; i < options.lines.length; i++) {
    const line = options.lines[i];
    const rowHeight = computeRowHeight(doc, line.cells[0], layout.w[0]);
    drawLineRow(doc, line, rowY, rowHeight, layout, (options.zebra ?? true) && i % 2 === 1);
  }

  if (options.pageSubtotal !== undefined) {
    drawPageSubtotal(doc, options.pageSubtotal, rowY + 6);
  }
}

/* ------------------------------------------------------------------ */
/*  Granular helpers (for multi-page flow)                             */
/* ------------------------------------------------------------------ */

/**
 * Compute column layout from definitions. Call once per page where the
 * table header appears.
 */
export function buildTableLayout(doc: any, y: number, columns: Array<TableColumn>): TableLayout {
  const pageRight = doc.page.width - MARGIN;
  const contentW = pageRight - MARGIN;
  const x: Array<number> = [];
  const w: Array<number> = [];
  const align: Array<'left' | 'center' | 'right'> = [];

  let offsetX = MARGIN;
  for (const col of columns) {
    const colW = col.width * contentW;
    x.push(offsetX);
    w.push(colW);
    align.push(col.align);
    offsetX += colW;
  }

  return { x, w, align, contentW, headerY: y };
}

/**
 * Draw the table header row. Call after buildTableLayout.
 */
export function drawTableHeader(doc: any, layout: TableLayout, columns: Array<TableColumn>): void {
  doc.rect(MARGIN, layout.headerY, layout.contentW, TABLE_HEADER_H).fillColor(HEADER_FILL_COLOR).fill();

  doc.fontSize(HEADER_FONT_SIZE).font(HEADER_FONT_FACE).fillColor(HEADER_TEXT_FILL_COLOR);

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    const pad = col.align !== 'center' ? 6 : 0;
    doc.text(col.label, layout.x[i] + pad, layout.headerY + HEADER_TEXT_Y_OFFSET, {
      width: layout.w[i] - pad * 2,
      align: col.align,
    });
  }
}

/**
 * Draw a single data row.
 */
export function drawLineRow(
  doc: any,
  line: TableLine,
  rowY: number,
  rowHeight: number,
  layout: TableLayout,
  zebra: boolean
): void {
  if (zebra) {
    doc.rect(MARGIN, rowY, layout.contentW, rowHeight).fillColor(ZEBRA_FILL_COLOR).fill();
  }

  doc.fontSize(ROW_FONT_SIZE).font(ROW_FONT_FACE).fillColor(ROW_TEXT_FILL_COLOR);

  for (let i = 0; i < line.cells.length; i++) {
    const pad = line.cells[i].length > 0 ? (layout.align[i] !== 'center' ? 6 : 0) : 0;
    doc.text(line.cells[i], layout.x[i] + pad, rowY + ROW_TEXT_Y_OFFSET, {
      width: layout.w[i] - pad * 2,
      align: layout.align[i],
    });
  }

  doc
    .moveTo(MARGIN, rowY + rowHeight)
    .lineTo(MARGIN + layout.contentW, rowY + rowHeight)
    .strokeColor(ROW_SEPARATOR_COLOR)
    .stroke();
}

/**
 * Compute the height needed for a cell's text.
 */
export function computeRowHeight(doc: any, text: string, width: number): number {
  const textHeight = doc.heightOfString(text, { width, align: 'left' });
  return Math.max(ROW_MIN_HEIGHT, Math.ceil(textHeight) + 10);
}

/**
 * Draw the "Sous-total reporté" line (page subtotal).
 */
export function drawPageSubtotal(doc: any, subtotal: number, y: number): void {
  const pageRight = doc.page.width - MARGIN;
  const totalsX = pageRight - TOTALS_WIDTH;

  doc
    .fontSize(PAGE_SUBTOTAL_FONT_SIZE)
    .font('Helvetica-Bold')
    .fillColor(PAGE_SUBTOTAL_FILL_COLOR)
    .text('Sous-total reporté', totalsX, y, { lineBreak: false });

  // Format: 1'234.56
  const sign = subtotal < 0 ? '-' : '';
  const formatted =
    sign
    + Math.abs(subtotal)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, "'");

  doc
    .fontSize(PAGE_SUBTOTAL_BOLD_FONT_SIZE)
    .font('Helvetica-Bold')
    .fillColor(PAGE_SUBTOTAL_FILL_COLOR)
    .text(formatted, totalsX, y, { width: TOTALS_WIDTH, align: 'right', lineBreak: false });
}
