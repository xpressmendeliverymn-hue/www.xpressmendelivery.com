import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://xpress_user:xpress_dev_pass@localhost:5432/xpressmen',
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role TEXT NOT NULL CHECK(role IN ('customer', 'salesperson', 'admin')),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        code TEXT,
        discount_percent INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        total_referrals INTEGER DEFAULT 0,
        total_revenue REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reference TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'scheduled', 'dispatched', 'in_transit', 'delivered', 'completed', 'cancelled')),
        service_type TEXT NOT NULL,
        pricing_subtotal REAL NOT NULL DEFAULT 0,
        pricing_discount REAL NOT NULL DEFAULT 0,
        pricing_discount_code TEXT,
        pricing_tax REAL NOT NULL DEFAULT 0,
        pricing_total REAL NOT NULL DEFAULT 0,
        affiliate_code TEXT,
        room_type TEXT,
        room_placements TEXT,
        room_considerations TEXT,
        room_description TEXT,
        schedule_date TEXT,
        schedule_time_slot TEXT,
        contact_first_name TEXT,
        contact_last_name TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        contact_address TEXT,
        contact_comm_prefs TEXT,
        additional_home_type TEXT,
        additional_parking TEXT,
        additional_access_notes TEXT,
        additional_special_requests TEXT,
        order_store_name TEXT,
        order_order_number TEXT,
        order_item_description TEXT,
        assigned_crew TEXT,
        notes TEXT,
        source TEXT DEFAULT 'web' CHECK(source IN ('web', 'salesperson', 'admin')),
        salesperson_id UUID REFERENCES users(id) ON DELETE SET NULL,
        warehouse_status TEXT DEFAULT 'warehouse_new' CHECK(warehouse_status IN ('warehouse_new', 'warehouse_picking', 'warehouse_ready', 'in_transit', 'not_needed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order items
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        price REAL NOT NULL,
        image TEXT,
        action TEXT NOT NULL CHECK(action IN ('deliver', 'remove'))
      )
    `);

    // Status timeline
    await client.query(`
      CREATE TABLE IF NOT EXISTS status_timeline (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        status TEXT NOT NULL,
        label TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        note TEXT
      )
    `);

    // Photos
    await client.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        ai_description TEXT,
        status TEXT DEFAULT 'complete'
      )
    `);

    // Delivery photos
    await client.query(`
      CREATE TABLE IF NOT EXISTS delivery_photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        note TEXT,
        uploaded_by TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crew schedule
    await client.query(`
      CREATE TABLE IF NOT EXISTS crew_schedule (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        crew_name TEXT NOT NULL,
        date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        status TEXT DEFAULT 'available' CHECK(status IN ('available', 'booked', 'blocked'))
      )
    `);

    // Notifications
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('order_status', 'system', 'promo')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        order_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Furniture catalog
    await client.query(`
      CREATE TABLE IF NOT EXISTS furniture_catalog (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        base_price REAL NOT NULL,
        image TEXT,
        description TEXT
      )
    `);

    // Store locations
    await client.query(`
      CREATE TABLE IF NOT EXISTS store_locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        brand TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        city TEXT NOT NULL
      )
    `);

    // Salesperson invites
    await client.query(`
      CREATE TABLE IF NOT EXISTS salesperson_invites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token TEXT UNIQUE NOT NULL,
        email TEXT,
        code TEXT NOT NULL,
        discount_percent INTEGER DEFAULT 10,
        max_uses INTEGER DEFAULT 1,
        used_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '7 days'
      )
    `);

    // Order form images (scanned paper forms from stores)
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_form_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order messages (customer correspondence)
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
        sender_name TEXT NOT NULL,
        sender_role TEXT NOT NULL CHECK(sender_role IN ('customer', 'salesperson', 'admin', 'system')),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migrate old columns if they exist
    try { await client.query(`ALTER TABLE salesperson_invites ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 1`); } catch (e) {}
    try { await client.query(`ALTER TABLE salesperson_invites ADD COLUMN IF NOT EXISTS used_count INTEGER DEFAULT 0`); } catch (e) {}
    try { await client.query(`ALTER TABLE salesperson_invites ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`); } catch (e) {}
    try { await client.query(`ALTER TABLE salesperson_invites DROP COLUMN IF EXISTS used`); } catch (e) {}

    // Migrate warehouse_status to new values
    try { await client.query(`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_warehouse_status_check`); } catch (e) {}
    try { await client.query(`ALTER TABLE orders ADD CONSTRAINT orders_warehouse_status_check CHECK(warehouse_status IN ('warehouse_new', 'warehouse_picking', 'warehouse_ready', 'in_transit', 'not_needed'))`); } catch (e) {}

    await client.query('COMMIT');
    console.log('Database tables initialized');

    // Seed if empty
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      await seedData(client);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function seedData(client) {
  console.log('Seeding database...');

  const adminHash = bcrypt.hashSync('admin123', 10);
  const spHash = bcrypt.hashSync('sales123', 10);

  await client.query(`
    INSERT INTO users (id, role, name, email, phone, password_hash)
    VALUES ($1, 'admin', 'Admin User', 'admin@xpressmen.com', '(612) 555-0000', $2)
  `, [uuidv4(), adminHash]);

  const salespeople = [
    { name: 'Mike Rodriguez', email: 'mike@xpressmen.com', phone: '(612) 555-0001', code: 'MIKE10', discount: 10 },
    { name: 'Ashley Johnson', email: 'ashley@xpressmen.com', phone: '(612) 555-0002', code: 'ASHLEY15', discount: 15 },
    { name: 'David Kim', email: 'david@xpressmen.com', phone: '(612) 555-0003', code: 'DAVE20', discount: 20 },
  ];

  for (const sp of salespeople) {
    await client.query(`
      INSERT INTO users (id, role, name, email, phone, password_hash, code, discount_percent)
      VALUES ($1, 'salesperson', $2, $3, $4, $5, $6, $7)
    `, [uuidv4(), sp.name, sp.email, sp.phone, spHash, sp.code, sp.discount]);
  }

  const furniture = [
    { id: 'sofa-3seat', category: 'sofa', name: '3-Seat Sofa', basePrice: 120, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop', description: 'Standard three-seat couch or sofa' },
    { id: 'sofa-sectional', category: 'sofa', name: 'Sectional Sofa', basePrice: 180, image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=300&fit=crop', description: 'L-shaped or U-shaped sectional' },
    { id: 'sofa-loveseat', category: 'sofa', name: 'Loveseat', basePrice: 90, image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=400&h=300&fit=crop', description: 'Two-seat loveseat' },
    { id: 'bed-queen', category: 'bed', name: 'Queen Bed Frame', basePrice: 110, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop', description: 'Queen size bed frame' },
    { id: 'bed-king', category: 'bed', name: 'King Bed Frame', basePrice: 140, image: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=400&h=300&fit=crop', description: 'King size bed frame' },
    { id: 'bed-twin', category: 'bed', name: 'Twin Bed Frame', basePrice: 80, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop', description: 'Twin or single bed frame' },
    { id: 'mattress-queen', category: 'mattress', name: 'Queen Mattress', basePrice: 85, image: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=400&h=300&fit=crop', description: 'Queen size mattress' },
    { id: 'mattress-king', category: 'mattress', name: 'King Mattress', basePrice: 110, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop', description: 'King size mattress' },
    { id: 'dresser-standard', category: 'dresser', name: 'Standard Dresser', basePrice: 95, image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=300&fit=crop', description: '6-drawer dresser or chest' },
    { id: 'dresser-tall', category: 'dresser', name: 'Tall Chest', basePrice: 75, image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=300&fit=crop', description: 'Tallboy or high chest' },
    { id: 'table-dining', category: 'table', name: 'Dining Table', basePrice: 130, image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=300&fit=crop', description: 'Dining room table' },
    { id: 'table-coffee', category: 'table', name: 'Coffee Table', basePrice: 60, image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400&h=300&fit=crop', description: 'Coffee or end table' },
    { id: 'chair-recliner', category: 'chair', name: 'Recliner', basePrice: 85, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=300&fit=crop', description: 'Reclining armchair' },
    { id: 'chair-dining', category: 'chair', name: 'Dining Chair (ea)', basePrice: 25, image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=300&fit=crop', description: 'Per dining chair' },
    { id: 'entertainment-center', category: 'entertainment_center', name: 'Entertainment Center', basePrice: 150, image: 'https://images.unsplash.com/photo-1611486212557-88be5ff6f941?w=400&h=300&fit=crop', description: 'TV stand or entertainment wall unit' },
    { id: 'other', category: 'other', name: 'Other Item', basePrice: 75, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop', description: 'Miscellaneous furniture item' },
  ];

  for (const item of furniture) {
    await client.query(`
      INSERT INTO furniture_catalog (id, category, name, base_price, image, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING
    `, [item.id, item.category, item.name, item.basePrice, item.image, item.description]);
  }

  const stores = [
    { name: 'Ashley Fridley', brand: 'Ashley Furniture', address: '5353 E River Rd, Fridley, MN 55421', phone: '(763) 502-2480', city: 'Fridley' },
    { name: 'Ashley Maple Grove', brand: 'Ashley Furniture', address: '7950 Wedgewood Ln N, Maple Grove, MN 55369', phone: '(612) 216-3580', city: 'Maple Grove' },
    { name: 'Furniture Mart Fridley', brand: 'Furniture Mart', address: '5401 E River Rd, Fridley, MN 55421', phone: '(763) 571-9649', city: 'Fridley' },
    { name: 'Furniture Mart Shakopee', brand: 'Furniture Mart', address: '4270 12th Ave E, Shakopee, MN 55379', phone: '(952) 445-6400', city: 'Shakopee' },
    { name: 'Furniture Mart Woodbury', brand: 'Furniture Mart', address: '10150 Hudson Rd, Woodbury, MN 55129', phone: '(651) 731-4000', city: 'Woodbury' },
  ];

  for (const store of stores) {
    await client.query(`
      INSERT INTO store_locations (id, name, brand, address, phone, city)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [uuidv4(), store.name, store.brand, store.address, store.phone, store.city]);
  }

  const crews = ['Crew A', 'Crew B', 'Crew C'];
  const slots = ['8:00 AM - 11:00 AM', '1:00 PM - 4:00 PM'];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    for (const crew of crews) {
      for (const slot of slots) {
        await client.query(`
          INSERT INTO crew_schedule (id, crew_name, date, time_slot, status)
          VALUES ($1, $2, $3, $4, 'available')
        `, [uuidv4(), crew, dateStr, slot]);
      }
    }
  }

  console.log('Database seeded successfully');
}

export default pool;
