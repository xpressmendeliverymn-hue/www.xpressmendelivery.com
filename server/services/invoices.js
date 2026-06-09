import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INVOICES_DIR = path.join(__dirname, '../uploads/invoices');
if (!fs.existsSync(INVOICES_DIR)) fs.mkdirSync(INVOICES_DIR, { recursive: true });

/**
 * Generate a professional PDF invoice for an order.
 * Returns the file path and public URL.
 */
export async function generateInvoicePdf(orderId) {
  const orderRes = await pool.query(`
    SELECT o.*, u.name as salesperson_name
    FROM orders o
    LEFT JOIN users u ON o.salesperson_id = u.id
    WHERE o.id = $1
  `, [orderId]);

  const order = orderRes.rows[0];
  if (!order) throw new Error('Order not found');

  const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
  const items = itemsRes.rows;

  const filename = `invoice-${order.reference}.pdf`;
  const filePath = path.join(INVOICES_DIR, filename);

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  doc.fillColor('#E63946').fontSize(28).font('Helvetica-Bold').text('XMX', 50, 45);
  doc.fillColor('#1a1a1a').fontSize(14).font('Helvetica').text('XPRESSMEN', 115, 52);
  doc.fillColor('#666').fontSize(9).text('Third-Party Delivery & Removal', 50, 80);
  doc.fillColor('#666').fontSize(9).text('Minnesota\'s Furniture Delivery Experts', 50, 92);

  // Invoice title
  doc.fillColor('#1a1a1a').fontSize(24).font('Helvetica-Bold').text('INVOICE', 400, 45, { align: 'right' });
  doc.fillColor('#666').fontSize(10).font('Helvetica').text(`Reference: ${order.reference}`, 400, 75, { align: 'right' });
  doc.fillColor('#666').fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, 400, 88, { align: 'right' });
  if (order.schedule_date) {
    doc.fillColor('#666').fontSize(10).text(`Delivery Date: ${order.schedule_date}`, 400, 101, { align: 'right' });
  }

  // Divider
  doc.moveTo(50, 120).lineTo(545, 120).stroke('#E63946');

  // Bill To
  doc.fillColor('#E63946').fontSize(11).font('Helvetica-Bold').text('BILL TO', 50, 135);
  doc.fillColor('#1a1a1a').fontSize(10).font('Helvetica');
  doc.text(`${order.contact_first_name || ''} ${order.contact_last_name || ''}`, 50, 152);
  doc.text(order.contact_address || '', 50, 165);
  doc.text(order.contact_phone || '', 50, 178);
  doc.text(order.contact_email || '', 50, 191);

  // Store Info
  if (order.order_store_name) {
    doc.fillColor('#E63946').fontSize(11).font('Helvetica-Bold').text('STORE', 300, 135);
    doc.fillColor('#1a1a1a').fontSize(10).font('Helvetica');
    doc.text(order.order_store_name, 300, 152);
    if (order.order_order_number) doc.text(`Order #: ${order.order_order_number}`, 300, 165);
    if (order.salesperson_name) doc.text(`Salesperson: ${order.salesperson_name}`, 300, 178);
  }

  // Items Table Header
  const tableTop = 240;
  doc.rect(50, tableTop, 495, 25).fill('#0A1628');
  doc.fillColor('#fff').fontSize(9).font('Helvetica-Bold');
  doc.text('ITEM', 60, tableTop + 8);
  doc.text('QTY', 350, tableTop + 8, { width: 40, align: 'center' });
  doc.text('PRICE', 400, tableTop + 8, { width: 60, align: 'right' });
  doc.text('AMOUNT', 470, tableTop + 8, { width: 60, align: 'right' });

  // Items
  let rowY = tableTop + 25;
  doc.fillColor('#1a1a1a').fontSize(9).font('Helvetica');

  items.forEach((item, i) => {
    const amount = (item.price * item.quantity).toFixed(2);
    doc.text(item.name, 60, rowY + 6, { width: 280 });
    doc.text(String(item.quantity), 350, rowY + 6, { width: 40, align: 'center' });
    doc.text(`$${item.price.toFixed(2)}`, 400, rowY + 6, { width: 60, align: 'right' });
    doc.text(`$${amount}`, 470, rowY + 6, { width: 60, align: 'right' });

    if (item.category) {
      doc.fillColor('#888').fontSize(8).text(item.category.toUpperCase(), 60, rowY + 18);
    }

    doc.moveTo(50, rowY + 30).lineTo(545, rowY + 30).stroke('#e5e5e5');
    rowY += 35;
  });

  // Totals
  const totalsY = rowY + 15;
  doc.fillColor('#1a1a1a').fontSize(10).font('Helvetica');
  doc.text('Subtotal:', 380, totalsY, { width: 70, align: 'right' });
  doc.text(`$${order.pricing_subtotal?.toFixed(2) || '0.00'}`, 470, totalsY, { width: 60, align: 'right' });

  doc.text('Discount:', 380, totalsY + 18, { width: 70, align: 'right' });
  doc.text(`-$${order.pricing_discount?.toFixed(2) || '0.00'}`, 470, totalsY + 18, { width: 60, align: 'right' });

  doc.text('Tax (8.5%):', 380, totalsY + 36, { width: 70, align: 'right' });
  doc.text(`$${order.pricing_tax?.toFixed(2) || '0.00'}`, 470, totalsY + 36, { width: 60, align: 'right' });

  doc.moveTo(380, totalsY + 55).lineTo(545, totalsY + 55).stroke('#1a1a1a');

  doc.fillColor('#E63946').fontSize(14).font('Helvetica-Bold');
  doc.text('TOTAL:', 380, totalsY + 65, { width: 70, align: 'right' });
  doc.text(`$${order.pricing_total?.toFixed(2) || '0.00'}`, 470, totalsY + 65, { width: 60, align: 'right' });

  // Footer
  doc.moveTo(50, 720).lineTo(545, 720).stroke('#E63946');
  doc.fillColor('#666').fontSize(9).font('Helvetica');
  doc.text('Thank you for choosing Xpressmen!', 50, 730);
  doc.text('Questions? Call (612) 555-0000 or email support@xpressmen.com', 50, 743);
  doc.text('XMX XPRESSMEN • Minnesota\'s Furniture Delivery Experts', 50, 756);

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  // Save invoice URL to order
  const invoiceUrl = `/uploads/invoices/${filename}`;
  await pool.query('UPDATE orders SET invoice_url = $1 WHERE id = $2', [invoiceUrl, orderId]);

  return { filePath, invoiceUrl, filename };
}
