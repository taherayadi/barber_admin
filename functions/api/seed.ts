import { Env, jsonResponse, errorResponse } from '../_middleware';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const db = context.env.DB;

  const count = await db.prepare('SELECT COUNT(*) as c FROM barbers').first<{ c: number }>();
  if (count && count.c > 0) return jsonResponse({ ok: true, seeded: false });

  const stmts = [
    db.prepare(`INSERT INTO barbers (id, name, specialty, rating, reviews_count, avatar, bio, available_times) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`),
    db.prepare(`INSERT INTO users (id, name, email, role, loyalty_points, avatar, password) VALUES (?, ?, ?, ?, ?, ?, ?)`),
    db.prepare(`INSERT INTO services (id, name, price, duration, points_given, points_cost, description, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`),
    db.prepare(`INSERT INTO categories (id, name, description, bg_class, fill_class, text_class) VALUES (?, ?, ?, ?, ?, ?)`),
    db.prepare(`INSERT INTO appointments (id, client_id, client_name, client_email, barber_id, barber_name, date, time, service, price, status, points_earned, points_redeemed, rated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
    db.prepare(`INSERT INTO reviews (id, barber_id, client_name, rating, comment, date) VALUES (?, ?, ?, ?, ?, ?)`),
    db.prepare(`INSERT INTO notifications (id, client_id, title, message, date, read, type) VALUES (?, ?, ?, ?, ?, ?, ?)`),
    db.prepare(`INSERT INTO promotions (id, title, description, image, discount, start_date, end_date, booking_limit, bookings_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),
    db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`),
  ];

  const barberData = [
    ['b1','Marcus Vance','Master Barber • Precision Fades & Beards',4.9,142,'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200','With over 12 years of luxury grooming experience, Marcus is a master of sharp skin fades, razor line-ups, and contemporary beard sculpting.','["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00"]'],
    ['b2','Sofia Russo','Executive Stylist • Modern Textures & Coloring',4.8,96,'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200','Sofia blends traditional craft with modern hair aesthetics. She specializes in scissor cuts, long textured hair, and premium scalp treatments.','["09:30","10:30","11:30","13:30","14:30","15:30","16:30"]'],
    ['b3','Liam Tanaka','Creative Barber • Hair Tattoos & Pompadours',4.7,74,'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200','Liam is our creative soul, specializing in graphic lines, sharp hair tattoos, and retro-classic styles with a modern metropolitan twist.','["10:00","11:00","13:00","14:00","15:00","16:00","17:30"]'],
    ['b4','Andre Dubois','Classic Barber • Scissors Only & Shave Guru',5.0,128,'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200','A traditional craftsman. Andre believes in the timeless art of pure scissor-over-comb cuts and the absolute therapy of hot towel razor shaves.','["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"]'],
  ];

  const userData = [
    ['u1','Taher Ayadi','taherayadi1990@gmail.com','client',120,'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',''],
    ['u2','Alex Mercer','alex@gmail.com','client',35,'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',''],
    ['admin1','Barberhouse Admin','admin@barbershop.com','admin',0,'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200','240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'],
  ];

  const serviceData = [
    ['s1','Classic Precision Cut',35,30,10,100,'Precision clipper or scissor cut tailored to your hair texture and style. Includes refreshing warm hair wash, invigorating scalp massage, and custom styling with premium pomades.','haircut'],
    ['s2','Royal Hot Towel Shave',30,40,8,80,'Traditional straight-razor shave with pre-shave essential oils, double hot steam towels, ultra-hydrating lather, and finishing cold towel treatment with cooling menthol balm.','shave'],
    ['s3','Signature Cut & Beard Design',55,50,20,150,'Our flagship combo. Includes the Classic Precision Cut together with complete beard clean-up, hot razor edging, beard steam oil treatment, and styling advice for your specific structures.','combo'],
    ['s4','Revitalizing Scalp Detox',25,25,6,70,'Organic tea tree oil scalp physical scrub, warm clay head mask to draw out impurities, dynamic pneumatic head pressure massage, and blow dry finish to leave hair deeply energized.','treatment'],
  ];

  const categoryData = [
    ['haircut','Precision Cuts & Fades','Standard hair styling, tailored scissor cuts, line-ups, and skin fades.','bg-emerald-500/10 border-emerald-500/20 text-emerald-400','bg-emerald-500','text-emerald-450'],
    ['shave','Luxury Hot Towel Shaves','Classic straight-razor groom with hot steam towels, lather, and conditioning oils.','bg-purple-500/10 border-purple-500/20 text-purple-400','bg-purple-500','text-purple-400'],
    ['combo','Signature Combos','Curated value bundles matching haircuts with facial beard styling or shampoos.','bg-amber-500/10 border-amber-500/20 text-amber-500','bg-amber-500','text-amber-550'],
    ['treatment','Scalp & Skin Treatments','Revitalizing clay head masks, pneumatic pressure massages, and follicle detoxes.','bg-sky-500/10 border-sky-500/20 text-sky-400','bg-sky-500','text-sky-400'],
  ];

  const serviceS1 = JSON.stringify(serviceData[0].reduce((acc: Record<string,unknown>, v, i) => { acc[['id','name','price','duration','pointsGiven','pointsCost','description','category'][i]] = v; return acc; }, {}));
  const serviceS2 = JSON.stringify(serviceData[1].reduce((acc: Record<string,unknown>, v, i) => { acc[['id','name','price','duration','pointsGiven','pointsCost','description','category'][i]] = v; return acc; }, {}));

  const appointmentData = [
    ['a1','u1','Taher Ayadi','taherayadi1990@gmail.com','b1','Marcus Vance','2026-06-04','11:00',serviceS1,35,'confirmed',10,0,0],
    ['a2','u1','Taher Ayadi','taherayadi1990@gmail.com','b4','Andre Dubois','2026-05-28','14:00',serviceS2,30,'completed',8,0,1],
    ['a3','u2','Alex Mercer','alex@gmail.com','b2','Sofia Russo','2026-06-05','14:30',serviceS1,55,'pending',20,0,0],
  ];

  const reviewData = [
    ['r1','b1','Julian Carter',5,'Marcus does the cleanest fade in town! The lines are razor-sharp and he pays incredible attention to detail. Definitely coming back.','2026-06-02'],
    ['r2','b1','Ethan Wright',4,'Great beard shaping. Took his time to explain which line fits my jaw structure. Highly recommended barber shop.','2026-05-30'],
    ['r3','b2','Robert Vance',5,'Sofia is an absolute talent. Scissor cutting is top notch, gave me exactly the texture I asked for. The head massage was incredible.','2026-06-01'],
    ['r4','b4','Miles Sterling',5,'Andre is a legend! The hot towel razor shave is pure therapeutic bliss. If you want old-school service, Andre is your man.','2026-06-03'],
    ['r5','b3','Kenji Sato',5,'Liam did an amazing custom hair design on the side of my head! Professional artist. Got tons of compliments.','2026-05-28'],
  ];

  const notifData = [
    ['n1','u1','Appointment Confirmed','Your booking with Marcus Vance on Jun 4, 11:00 AM has been successfully confirmed.','2026-06-03T18:45:00Z',0,'booking'],
    ['n2','u1','Loyalty Points Earned!','You have earned 8 loyalty points from your completed Royal Hot Towel Shave appointment.','2026-05-28T15:00:00Z',1,'loyalty'],
  ];

  const promoData = [
    ['p1','Executive Royal Ceremony Offer','Elevate your aesthetic with our Signature Combo. Includes custom skin fade, hot towel straight-razor shave, and luxury clay scalp therapy.','https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600','25% OFF SPECIAL','2026-06-01','2026-06-15',20,4],
    ['p2','Midweek Golden Shave & Tea','Beat the weekend rush. Refresh with a premium hot-towel treatment and custom beard conditioning oil, served with English Earl Grey tea.','https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600','$12 BARBER BONUS','2026-06-03','2026-06-10',15,7],
  ];

  const batches: D1ExecutedStatement[] = [];

  for (const b of barberData) batches.push(await stmts[0].bind(...b).run());
  for (const u of userData) batches.push(await stmts[1].bind(...u).run());
  for (const s of serviceData) batches.push(await stmts[2].bind(...s).run());
  for (const c of categoryData) batches.push(await stmts[3].bind(...c).run());
  for (const a of appointmentData) batches.push(await stmts[4].bind(...a).run());
  for (const r of reviewData) batches.push(await stmts[5].bind(...r).run());
  for (const n of notifData) batches.push(await stmts[6].bind(...n).run());
  for (const p of promoData) batches.push(await stmts[7].bind(...p).run());
  batches.push(await stmts[8].bind('pointValue', '0.01').run());

  return jsonResponse({ ok: true, seeded: true });
};
