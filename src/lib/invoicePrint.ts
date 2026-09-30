import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { showAlert } from "./alerts";

export interface InvoiceItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface InvoiceData {
  invoiceNo: string;
  date: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  servedBy?: string;
  paymentMethod: string;
  paymentStatus?: string;
  orderStatus?: string;
  notes?: string;
  items: InvoiceItem[];
  totalAmount: number;
}

export interface BookingReceiptData {
  receiptNo: string;
  date: string;
  bookingId?: string;
  turfName?: string;
  customerName?: string;
  customerPhone?: string;
  amount: number;
  method: string;
  transactionId?: string;
  status?: string;
  bookingDate?: string;
  timeSlot?: string;
}

/**
 * Generates clean, high-contrast HTML for retail orders matching web SalesPOS.jsx
 */
export function generateOrderInvoiceHtml(data: InvoiceData): string {
  const {
    invoiceNo = "ORD-0001",
    date = new Date().toLocaleDateString(),
    customerName = "Walk-in Customer",
    customerPhone = "",
    customerAddress = "",
    servedBy = "Counter Staff",
    paymentMethod = "cash",
    paymentStatus = "PAID",
    orderStatus = "CONFIRMED",
    notes = "",
    items = [],
    totalAmount = 0,
  } = data;

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-weight: 500; color: #1e293b;">
          ${item.productName}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #475569;">
          ${item.quantity}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #475569; font-family: monospace;">
          ৳${(item.unitPrice || 0).toLocaleString()}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #0f172a; font-family: monospace;">
          ৳${(item.subtotal || 0).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice #${invoiceNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 32px;
      font-size: 13px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #10b981;
    }
    .brand-icon {
      width: 44px;
      height: 44px;
      background: #10b981;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 800;
      font-size: 18px;
      margin-bottom: 6px;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #0f172a;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
    }
    .invoice-title {
      font-size: 24px;
      font-weight: 900;
      color: #10b981;
      text-align: right;
      letter-spacing: 0.05em;
    }
    .invoice-meta {
      font-size: 12px;
      color: #64748b;
      text-align: right;
      margin-top: 4px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
    }
    .info-label {
      font-size: 10px;
      text-transform: uppercase;
      color: #059669;
      font-weight: 700;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }
    .info-val {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    .info-sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    thead tr {
      background: #ecfdf5;
    }
    th {
      padding: 10px 12px;
      font-size: 11px;
      text-transform: uppercase;
      color: #047857;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .total-row {
      background: #f0fdf4;
      border-top: 2px solid #10b981;
    }
    .total-row td {
      font-weight: 800;
      font-size: 16px;
      color: #047857;
      padding: 14px 12px;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-paid {
      background: #dcfce7;
      color: #15803d;
    }
    .thank-you {
      text-align: center;
      margin-top: 28px;
      font-size: 14px;
      color: #059669;
      font-weight: 700;
    }
    .footer {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 16px; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-icon">TS</div>
      <div class="brand-name">TurfSlot Store</div>
      <div class="brand-sub">Retail & Sports Ground Counter</div>
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-meta">#${invoiceNo}</div>
      <div class="invoice-meta">${date}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <div class="info-label">Billed To</div>
      <div class="info-val">${customerName}</div>
      ${customerPhone ? `<div class="info-sub">📞 ${customerPhone}</div>` : ""}
      ${customerAddress ? `<div class="info-sub">📍 ${customerAddress}</div>` : ""}
    </div>
    <div class="info-box">
      <div class="info-label">Transaction Details</div>
      <div class="info-val">Cashier: ${servedBy}</div>
      <div class="info-sub">Payment: <strong>${paymentMethod.toUpperCase()}</strong> <span class="badge badge-paid">${paymentStatus}</span></div>
      <div class="info-sub">Status: ${orderStatus.toUpperCase()}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="text-align: left;">Product</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Unit Price</th>
        <th style="text-align: right;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3" style="text-align: right;">GRAND TOTAL</td>
        <td style="text-align: right; font-family: monospace;">৳${totalAmount.toLocaleString()}</td>
      </tr>
    </tfoot>
  </table>

  ${notes ? `<div style="margin-top: 12px; padding: 10px 14px; background: #f8fafc; border-radius: 8px; font-size: 11px; color: #64748b;"><strong>Notes:</strong> ${notes}</div>` : ""}

  <div class="thank-you">Thank you for your purchase! 🙏</div>

  <div class="footer">
    <span>TurfSlot Management Platform</span>
    <span>Invoice #${invoiceNo} · Verified Purchase</span>
  </div>
</body>
</html>`;
}

/**
 * Generates clean HTML for ground booking payment receipts
 */
export function generateBookingReceiptHtml(data: BookingReceiptData): string {
  const {
    receiptNo = "RCP-0001",
    date = new Date().toLocaleDateString(),
    bookingId = "",
    turfName = "TurfSlot Ground",
    customerName = "Valued Player",
    customerPhone = "",
    amount = 0,
    method = "cash",
    transactionId = "",
    status = "COMPLETED",
    bookingDate = "",
    timeSlot = "",
  } = data;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Payment Receipt #${receiptNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 32px;
      font-size: 13px;
      line-height: 1.5;
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #10b981;
    }
    .brand-icon {
      width: 48px;
      height: 48px;
      background: #10b981;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 800;
      font-size: 20px;
      margin-bottom: 8px;
    }
    .brand-name { font-size: 22px; font-weight: 800; color: #0f172a; }
    .receipt-title { font-size: 16px; font-weight: 700; color: #059669; margin-top: 4px; }
    .receipt-meta { font-size: 12px; color: #64748b; margin-top: 2px; }
    .amount-box {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      margin-bottom: 24px;
    }
    .amount-label { font-size: 11px; text-transform: uppercase; color: #047857; font-weight: 700; letter-spacing: 0.05em; }
    .amount-value { font-size: 32px; font-weight: 900; color: #065f46; margin: 4px 0; font-family: monospace; }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      background: #d1fae5;
      color: #047857;
      text-transform: uppercase;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .details-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
    }
    .details-table td.label {
      color: #64748b;
      font-weight: 500;
      width: 40%;
    }
    .details-table td.val {
      color: #0f172a;
      font-weight: 600;
      text-align: right;
    }
    .footer {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 16px; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-icon">✓</div>
    <div class="brand-name">TurfSlot Ground Booking</div>
    <div class="receipt-title">PAYMENT RECEIPT</div>
    <div class="receipt-meta">Receipt #${receiptNo} · ${date}</div>
  </div>

  <div class="amount-box">
    <div class="amount-label">Amount Paid</div>
    <div class="amount-value">৳${amount.toLocaleString()}</div>
    <span class="badge">Payment Verified & Settled</span>
  </div>

  <table class="details-table">
    <tr>
      <td class="label">Customer Name</td>
      <td class="val">${customerName}</td>
    </tr>
    ${customerPhone ? `<tr><td class="label">Phone</td><td class="val">${customerPhone}</td></tr>` : ""}
    <tr>
      <td class="label">Turf Venue</td>
      <td class="val">${turfName}</td>
    </tr>
    ${bookingDate ? `<tr><td class="label">Booking Date</td><td class="val">${bookingDate}</td></tr>` : ""}
    ${timeSlot ? `<tr><td class="label">Reserved Slot</td><td class="val">${timeSlot}</td></tr>` : ""}
    ${bookingId ? `<tr><td class="label">Booking Reference</td><td class="val" style="font-family:monospace;">#${bookingId.slice(0, 8).toUpperCase()}</td></tr>` : ""}
    <tr>
      <td class="label">Payment Method</td>
      <td class="val" style="text-transform: uppercase;">${method}</td>
    </tr>
    ${transactionId ? `<tr><td class="label">Transaction ID</td><td class="val" style="font-family:monospace;">${transactionId}</td></tr>` : ""}
    <tr>
      <td class="label">Status</td>
      <td class="val" style="color: #059669;">${status.toUpperCase()}</td>
    </tr>
  </table>

  <div class="footer">
    <p>Thank you for choosing TurfSlot!</p>
    <p style="margin-top: 4px;">Receipt #${receiptNo} · Generated electronically</p>
  </div>
</body>
</html>`;
}

/**
 * Triggers native system printing dialog
 */
export async function printOrderInvoice(data: InvoiceData): Promise<void> {
  try {
    const html = generateOrderInvoiceHtml(data);
    await Print.printAsync({ html });
  } catch (err: any) {
    showAlert("Print Error", err.message || "Failed to trigger print dialog.");
  }
}

/**
 * Exports invoice as PDF and opens native system share sheet
 */
export async function shareOrderInvoicePdf(data: InvoiceData): Promise<void> {
  try {
    const html = generateOrderInvoiceHtml(data);
    const { uri } = await Print.printToFileAsync({ html });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
        dialogTitle: `Share Invoice #${data.invoiceNo || ""}`,
      });
    } else {
      await Print.printAsync({ html });
    }
  } catch (err: any) {
    showAlert("PDF Export Error", err.message || "Failed to generate or share PDF.");
  }
}

/**
 * Triggers native print dialog for booking payment receipts
 */
export async function printBookingReceipt(data: BookingReceiptData): Promise<void> {
  try {
    const html = generateBookingReceiptHtml(data);
    await Print.printAsync({ html });
  } catch (err: any) {
    showAlert("Print Error", err.message || "Failed to print receipt.");
  }
}

/**
 * Generates PDF and opens native share sheet for booking payment receipts
 */
export async function shareBookingReceiptPdf(data: BookingReceiptData): Promise<void> {
  try {
    const html = generateBookingReceiptHtml(data);
    const { uri } = await Print.printToFileAsync({ html });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
        dialogTitle: `Share Receipt #${data.receiptNo || ""}`,
      });
    } else {
      await Print.printAsync({ html });
    }
  } catch (err: any) {
    showAlert("PDF Error", err.message || "Failed to share receipt PDF.");
  }
}
