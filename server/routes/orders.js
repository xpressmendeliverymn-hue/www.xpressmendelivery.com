import express from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import pool from '../database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { notifyCustomerOnBooking, notifyCustomerOnStatusChange } from '../services/notifications.js';
import { sendProofPacketToSalesperson, sendDeliveryConfirmationToCustomer } from '../services/proofPacket.js';
import { generateInvoicePdf } from '../services/invoices.js';

const router = express.Router();

const createOrderSchema = z.object({
  serviceType: z.array(z.enum(['delivery', 'removal'])).min(1, 'Select at least one service'),
  items: z.array(z.object({
    category: z.string(),
    name: z.string(),
    quantity: z.number().min(1),
    price: z.number(),
    image: z.string().optional(),
    action: z.enum(['deliver', 'remove']),
  })).min(1, 'Select at least one item'),
  pricing: z.object({
    subtotal: z.number(),
    discount: z.number(),
    discountCode: z.string().optional(),
    tax: z.number(),
    total: z.number(),
  }),
  affiliateCode: z.string().optional(),
  photos: z.array(z.object({
    url: z.string(),
    aiDescription: z.string().optional(),
    status: z.string().optional(),
  })).optional(),
  roomSelection: z.object({
    roomType: z.string(),
    placements: z.array(z.string()),
    considerations: z.array(z.string()),
    description: z.string().optional(),
  }).optional(),
  schedule: z.object({
    date: z.string(),
    timeSlot: z.string(),
  }).optional(),
  contactInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    email: z.string().email(),
    address: z.string(),
    communicationPrefs: z.array(z.string()),
  }),
  additionalDetails: z.object({
    homeType: z.string(),
    parking: z.string().optional(),
    accessNotes: z.string().optional(),
    specialRequests: z.string().optional(),
  }).optional(),
  orderDetails: z.object({
    storeName: z.string(),
    orderNumber: z.string().optional(),
    itemDescription: z.string(),
  }).optional(),
  source: z.enum(['web', 'salesperson', 'admin']).optional(),
  salespersonId: z.string().uuid().optional(),
});

function generateReference() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `XM-${num}`;
}

async function getOrderWithItems(orderId) {
  const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  const order = orderRes.rows[0];
  if (!order) return null;

  const [items, timeline, photos, deliveryPhotos, salesperson, formImages, messages] = await Promise.all([
    pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]),
    pool.query('SELECT * FROM status_timeline WHERE order_id = $1 ORDER BY timestamp', [orderId]),
    pool.query('SELECT * FROM photos WHERE order_id = $1', [orderId]),
    pool.query('SELECT * FROM delivery_photos WHERE order_id = $1 ORDER BY uploaded_at', [orderId]),
    order.salesperson_id ? pool.query('SELECT name, code FROM users WHERE id = $1', [order.salesperson_id]) : { rows: [] },
    pool.query('SELECT * FROM order_form_images WHERE order_id = $1', [orderId]),
    pool.query('SELECT * FROM order_messages WHERE order_id = $1 ORDER BY created_at ASC', [orderId]),
  ]);

  return {
    ...order,
    serviceType: order.service_type ? order.service_type.split(',') : [],
    items: items.rows.map(i => ({
      id: i.id, category: i.category, name: i.name, quantity: i.quantity, price: i.price, image: i.image, action: i.action,
    })),
    pricing: {
      subtotal: order.pricing_subtotal, discount: order.pricing_discount,
      discountCode: order.pricing_discount_code, tax: order.pricing_tax, total: order.pricing_total,
    },
    roomSelection: order.room_type ? {
      roomType: order.room_type,
      placements: order.room_placements ? order.room_placements.split(',') : [],
      considerations: order.room_considerations ? order.room_considerations.split(',') : [],
      description: order.room_description,
    } : null,
    schedule: order.schedule_date ? { date: order.schedule_date, timeSlot: order.schedule_time_slot } : null,
    contactInfo: order.contact_first_name ? {
      firstName: order.contact_first_name, lastName: order.contact_last_name,
      phone: order.contact_phone, email: order.contact_email, address: order.contact_address,
      communicationPrefs: order.contact_comm_prefs ? order.contact_comm_prefs.split(',') : [],
    } : null,
    additionalDetails: order.additional_home_type ? {
      homeType: order.additional_home_type, parking: order.additional_parking,
      accessNotes: order.additional_access_notes, specialRequests: order.additional_special_requests,
    } : null,
    orderDetails: order.order_store_name ? {
      storeName: order.order_store_name, orderNumber: order.order_order_number, itemDescription: order.order_item_description,
    } : null,
    statusTimeline: timeline.rows.map(t => ({ status: t.status, label: t.label, timestamp: t.timestamp, note: t.note })),
    photos: photos.rows,
    deliveryPhotos: deliveryPhotos.rows,
    formImages: formImages.rows,
    messages: messages.rows,
    notes: order.notes ? order.notes.split('||') : [],
    salesperson: salesperson.rows[0] || null,
  };
}

// Create order
router.post('/', validateBody(createOrderSchema), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      serviceType, items, pricing, affiliateCode, roomSelection, schedule,
      contactInfo, additionalDetails, orderDetails, photos, source, salespersonId,
    } = req.body;

    const orderId = crypto.randomUUID();
    const reference = generateReference();
    const now = new Date().toISOString();

    await client.query(`
      INSERT INTO orders (
        id, reference, status, service_type,
        pricing_subtotal, pricing_discount, pricing_discount_code, pricing_tax, pricing_total,
        affiliate_code,
        room_type, room_placements, room_considerations, room_description,
        schedule_date, schedule_time_slot,
        contact_first_name, contact_last_name, contact_phone, contact_email, contact_address, contact_comm_prefs,
        additional_home_type, additional_parking, additional_access_notes, additional_special_requests,
        order_store_name, order_order_number, order_item_description,
        source, salesperson_id,
        created_at, updated_at
      ) VALUES ($1,$2,'pending',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32)
    `, [
      orderId, reference, serviceType.join(','),
      pricing.subtotal, pricing.discount, pricing.discountCode || null, pricing.tax, pricing.total,
      affiliateCode || null,
      roomSelection?.roomType || null,
      roomSelection?.placements?.join(',') || null,
      roomSelection?.considerations?.join(',') || null,
      roomSelection?.description || null,
      schedule?.date || null, schedule?.timeSlot || null,
      contactInfo.firstName, contactInfo.lastName, contactInfo.phone, contactInfo.email, contactInfo.address,
      contactInfo.communicationPrefs?.join(',') || null,
      additionalDetails?.homeType || null, additionalDetails?.parking || null,
      additionalDetails?.accessNotes || null, additionalDetails?.specialRequests || null,
      orderDetails?.storeName || null, orderDetails?.orderNumber || null, orderDetails?.itemDescription || null,
      source || 'web', salespersonId || null,
      now, now,
    ]);

    for (const item of items) {
      await client.query(`
        INSERT INTO order_items (id, order_id, category, name, quantity, price, image, action)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `, [crypto.randomUUID(), orderId, item.category, item.name, item.quantity || 1, item.price, item.image || null, item.action]);
    }

    await client.query(`
      INSERT INTO status_timeline (id, order_id, status, label, timestamp, note)
      VALUES ($1,$2,'pending','Booking Received',$3,$4)
    `, [crypto.randomUUID(), orderId, now, 'Customer booked online']);

    if (photos && photos.length > 0) {
      for (const photo of photos) {
        await client.query(`
          INSERT INTO photos (id, order_id, url, ai_description, status)
          VALUES ($1,$2,$3,$4,$5)
        `, [crypto.randomUUID(), orderId, photo.url, photo.aiDescription || '', photo.status || 'complete']);
      }
    }

    if (schedule?.date && schedule?.timeSlot) {
      await client.query(`
        UPDATE crew_schedule SET status = 'booked', order_id = $1
        WHERE date = $2 AND time_slot = $3 AND status = 'available'
      `, [orderId, schedule.date, schedule.timeSlot]);
    }

    if (affiliateCode) {
      const spRes = await client.query('SELECT * FROM users WHERE code = $1 AND role = $2', [affiliateCode, 'salesperson']);
      if (spRes.rows.length > 0) {
        const sp = spRes.rows[0];
        await client.query(`
          UPDATE users SET total_referrals = total_referrals + 1, total_revenue = total_revenue + $1
          WHERE id = $2
        `, [pricing.total, sp.id]);

        await client.query(`
          INSERT INTO notifications (id, user_id, type, title, message, order_id, created_at)
          VALUES ($1,$2,'order_status','New Referral Booking',$3,$4,$5)
        `, [crypto.randomUUID(), sp.id, `Your code ${affiliateCode} was used for order ${reference}`, orderId, now]);
      }
    }

    const admins = await client.query("SELECT id FROM users WHERE role = 'admin'");
    for (const admin of admins.rows) {
      await client.query(`
        INSERT INTO notifications (id, user_id, type, title, message, order_id, created_at)
        VALUES ($1,$2,'order_status','New Booking',$3,$4,$5)
      `, [crypto.randomUUID(), admin.id, `Order ${reference} received from ${contactInfo.firstName} ${contactInfo.lastName}`, orderId, now]);
    }

    await client.query('COMMIT');

    notifyCustomerOnBooking({
      contactInfo, reference, schedule, pricing,
    }).catch((e) => console.error('Notification error:', e.message));

    res.status(201).json({ orderId, reference, message: 'Order created successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// Get order by reference (public tracking)
router.get('/track/:reference', async (req, res) => {
  const result = await pool.query('SELECT id FROM orders WHERE reference = $1', [req.params.reference]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

  const fullOrder = await getOrderWithItems(result.rows[0].id);
  const safeOrder = {
    reference: fullOrder.reference, status: fullOrder.status,
    statusTimeline: fullOrder.statusTimeline, serviceType: fullOrder.serviceType,
    items: fullOrder.items, pricing: fullOrder.pricing,
    schedule: fullOrder.schedule,
    contactInfo: fullOrder.contactInfo ? {
      firstName: fullOrder.contactInfo.firstName, lastName: fullOrder.contactInfo.lastName,
      phone: fullOrder.contactInfo.phone, email: fullOrder.contactInfo.email, address: fullOrder.contactInfo.address,
    } : null,
    deliveryPhotos: fullOrder.deliveryPhotos,
    createdAt: fullOrder.created_at,
    assignedCrew: fullOrder.assigned_crew,
    warehouseStatus: fullOrder.warehouse_status,
    salesperson: fullOrder.salesperson,
  };
  res.json(safeOrder);
});

// List orders (admin or salesperson)
router.get('/', authenticateToken, async (req, res) => {
  const { status, warehouseStatus, dateFrom, dateTo, affiliateCode } = req.query;

  let sql = 'SELECT id FROM orders WHERE 1=1';
  const params = [];
  let idx = 1;

  if (status) { sql += ` AND status = $${idx++}`; params.push(status); }
  if (warehouseStatus) { sql += ` AND warehouse_status = $${idx++}`; params.push(warehouseStatus); }
  if (dateFrom) { sql += ` AND schedule_date >= $${idx++}`; params.push(dateFrom); }
  if (dateTo) { sql += ` AND schedule_date <= $${idx++}`; params.push(dateTo); }
  if (affiliateCode) { sql += ` AND affiliate_code = $${idx++}`; params.push(affiliateCode); }

  if (req.user.role === 'salesperson' && req.user.code) {
    sql += ` AND affiliate_code = $${idx++}`;
    params.push(req.user.code);
  }

  sql += ' ORDER BY created_at DESC';
  const result = await pool.query(sql, params);
  const orders = await Promise.all(result.rows.map(r => getOrderWithItems(r.id)));
  res.json(orders);
});

// Get single order
router.get('/:id', authenticateToken, async (req, res) => {
  const order = await getOrderWithItems(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Update order status
router.patch('/:id/status', authenticateToken, requireRole(['admin', 'salesperson']), async (req, res) => {
  const { status, note } = req.body;
  const orderId = req.params.id;

  const validStatuses = ['pending', 'confirmed', 'scheduled', 'dispatched', 'in_transit', 'delivered', 'completed', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (orderRes.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

  const now = new Date().toISOString();
  const statusLabels = {
    pending: 'Booking Received', confirmed: 'Confirmed', scheduled: 'Scheduled',
    dispatched: 'Dispatched', in_transit: 'In Transit', delivered: 'Delivered',
    completed: 'Completed', cancelled: 'Cancelled',
  };

  await pool.query('UPDATE orders SET status = $1, updated_at = $2 WHERE id = $3', [status, now, orderId]);
  await pool.query(`
    INSERT INTO status_timeline (id, order_id, status, label, timestamp, note)
    VALUES ($1,$2,$3,$4,$5,$6)
  `, [crypto.randomUUID(), orderId, status, statusLabels[status], now, note || null]);

  const fullOrder = await getOrderWithItems(orderId);
  if (fullOrder?.contactInfo) {
    notifyCustomerOnStatusChange(fullOrder, status, note).catch((e) => console.error('Notification error:', e.message));
  }

  // Auto-send proof packet when delivered/completed
  if (status === 'delivered' || status === 'completed') {
    sendProofPacketToSalesperson(orderId).catch((e) => console.error('Proof packet error:', e.message));
    if (fullOrder?.contactInfo?.email) {
      sendDeliveryConfirmationToCustomer(orderId).catch((e) => console.error('Delivery confirmation error:', e.message));
    }
  }

  res.json({ message: 'Status updated', status });
});

// Update warehouse status
router.patch('/:id/warehouse', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { warehouseStatus, note } = req.body;
  const validStatuses = ['warehouse_new', 'warehouse_picking', 'warehouse_ready', 'in_transit', 'not_needed'];
  if (!warehouseStatus || !validStatuses.includes(warehouseStatus)) {
    return res.status(400).json({ error: 'Invalid warehouse status' });
  }
  await pool.query('UPDATE orders SET warehouse_status = $1 WHERE id = $2', [warehouseStatus, req.params.id]);

  const statusLabels = {
    warehouse_new: 'New Order', warehouse_picking: 'Picking Items', warehouse_ready: 'Ready for Dispatch', in_transit: 'Dispatched', not_needed: 'No Warehouse Action',
  };

  await pool.query(`
    INSERT INTO status_timeline (id, order_id, status, label, timestamp, note)
    VALUES ($1,$2,$3,$4,$5,$6)
  `, [crypto.randomUUID(), req.params.id, 'warehouse_update', statusLabels[warehouseStatus], new Date().toISOString(), note || null]);

  res.json({ message: 'Warehouse status updated', warehouseStatus });
});

// Add note to order
router.post('/:id/notes', authenticateToken, requireRole(['admin', 'salesperson']), async (req, res) => {
  const { note } = req.body;
  const orderId = req.params.id;

  const orderRes = await pool.query('SELECT notes FROM orders WHERE id = $1', [orderId]);
  if (orderRes.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

  const existing = orderRes.rows[0].notes ? orderRes.rows[0].notes.split('||') : [];
  existing.push(`${new Date().toISOString()}: ${note}`);

  await pool.query('UPDATE orders SET notes = $1 WHERE id = $2', [existing.join('||'), orderId]);
  res.json({ message: 'Note added' });
});

// Assign crew
router.patch('/:id/crew', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { crewName } = req.body;
  await pool.query('UPDATE orders SET assigned_crew = $1 WHERE id = $2', [crewName, req.params.id]);
  res.json({ message: 'Crew assigned' });
});

// Upload delivery photo
router.post('/:id/delivery-photos', authenticateToken, requireRole(['admin', 'salesperson']), async (req, res) => {
  const { url, note } = req.body;
  const orderId = req.params.id;

  await pool.query(`
    INSERT INTO delivery_photos (id, order_id, url, note, uploaded_by, uploaded_at)
    VALUES ($1,$2,$3,$4,$5,$6)
  `, [crypto.randomUUID(), orderId, url, note || null, req.user.name, new Date().toISOString()]);

  res.status(201).json({ message: 'Photo uploaded' });
});

// Save scanned store order form image
router.post('/:id/form-images', authenticateToken, requireRole(['admin', 'salesperson']), async (req, res) => {
  const { url } = req.body;
  const orderId = req.params.id;

  await pool.query(`
    INSERT INTO order_form_images (id, order_id, url, created_at)
    VALUES ($1,$2,$3,$4)
  `, [crypto.randomUUID(), orderId, url, new Date().toISOString()]);

  res.status(201).json({ message: 'Form image saved' });
});

// Generate invoice PDF
router.post('/:id/invoice', authenticateToken, requireRole(['admin', 'salesperson']), async (req, res) => {
  try {
    const result = await generateInvoicePdf(req.params.id);
    res.json({ message: 'Invoice generated', invoiceUrl: result.invoiceUrl, filename: result.filename });
  } catch (err) {
    console.error('Invoice generation error:', err);
    res.status(500).json({ error: err.message || 'Invoice generation failed' });
  }
});

// Manually send proof packet
router.post('/:id/proof-packet', authenticateToken, requireRole(['admin', 'salesperson']), async (req, res) => {
  try {
    const result = await sendProofPacketToSalesperson(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('Proof packet error:', err);
    res.status(500).json({ error: err.message || 'Proof packet failed' });
  }
});

export default router;
