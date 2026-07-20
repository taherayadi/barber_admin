/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Barber, ServiceItem, Review } from './types';

export const INITIAL_BARBERS: Barber[] = [
  {
    id: 'b1',
    name: 'Marcus Vance',
    specialty: 'Master Barber • Precision Fades & Beards',
    rating: 4.9,
    reviewsCount: 142,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    bio: 'With over 12 years of luxury grooming experience, Marcus is a master of sharp skin fades, razor line-ups, and contemporary beard sculpting.',
    availableTimes: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']
  },
  {
    id: 'b2',
    name: 'Sofia Russo',
    specialty: 'Executive Stylist • Modern Textures & Coloring',
    rating: 4.8,
    reviewsCount: 96,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    bio: 'Sofia blends traditional craft with modern hair aesthetics. She specializes in scissor cuts, long textured hair, and premium scalp treatments.',
    availableTimes: ['09:30', '10:30', '11:30', '13:30', '14:30', '15:30', '16:30']
  },
  {
    id: 'b3',
    name: 'Liam Tanaka',
    specialty: 'Creative Barber • Hair Tattoos & Pompadours',
    rating: 4.7,
    reviewsCount: 74,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    bio: 'Liam is our creative soul, specializing in graphic lines, sharp hair tattoos, and retro-classic styles with a modern metropolitan twist.',
    availableTimes: ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:30']
  },
  {
    id: 'b4',
    name: 'Andre Dubois',
    specialty: 'Classic Barber • Scissors Only & Shave Guru',
    rating: 5.0,
    reviewsCount: 128,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    bio: 'A traditional craftsman. Andre believes in the timeless art of pure scissor-over-comb cuts and the absolute therapy of hot towel razor shaves.',
    availableTimes: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']
  }
];

export const SERVICES: ServiceItem[] = [
  {
    id: 's1',
    name: 'Classic Precision Cut',
    price: 35,
    duration: 30,
    pointsGiven: 10,
    pointsCost: 100,
    description: 'Precision clipper or scissor cut tailored to your hair texture and style. Includes refreshing warm hair wash, invigorating scalp massage, and custom styling with premium pomades.',
    category: 'haircut'
  },
  {
    id: 's2',
    name: 'Royal Hot Towel Shave',
    price: 30,
    duration: 40,
    pointsGiven: 8,
    pointsCost: 80,
    description: 'Traditional straight-razor shave with pre-shave essential oils, double hot steam towels, ultra-hydrating lather, and finishing cold towel treatment with cooling menthol balm.',
    category: 'shave'
  },
  {
    id: 's3',
    name: 'Signature Cut & Beard Design',
    price: 55,
    duration: 50,
    pointsGiven: 20,
    pointsCost: 150,
    description: 'Our flagship combo. Includes the Classic Precision Cut together with complete beard clean-up, hot razor edging, beard steam oil treatment, and styling advice for your specific structures.',
    category: 'combo'
  },
  {
    id: 's4',
    name: 'Revitalizing Scalp Detox',
    price: 25,
    duration: 25,
    pointsGiven: 6,
    pointsCost: 70,
    description: 'Organic tea tree oil scalp physical scrub, warm clay head mask to draw out impurities, dynamic pneumatic head pressure massage, and blow dry finish to leave hair deeply energized.',
    category: 'treatment'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    barberId: 'b1',
    clientName: 'Julian Carter',
    rating: 5,
    comment: 'Marcus does the cleanest fade in town! The lines are razor-sharp and he pays incredible attention to detail. Definitely coming back.',
    date: '2026-06-02'
  },
  {
    id: 'r2',
    barberId: 'b1',
    clientName: 'Ethan Wright',
    rating: 4,
    comment: 'Great beard shaping. Took his time to explain which line fits my jaw structure. Highly recommended barber shop.',
    date: '2026-05-30'
  },
  {
    id: 'r3',
    barberId: 'b2',
    clientName: 'Robert Vance',
    rating: 5,
    comment: 'Sofia is an absolute talent. Scissor cutting is top notch, gave me exactly the texture I asked for. The head massage was incredible.',
    date: '2026-06-01'
  },
  {
    id: 'r4',
    barberId: 'b4',
    clientName: 'Miles Sterling',
    rating: 5,
    comment: 'Andre is a legend! The hot towel razor shave is pure therapeutic bliss. If you want old-school service, Andre is your man.',
    date: '2026-06-03'
  },
  {
    id: 'r5',
    barberId: 'b3',
    clientName: 'Kenji Sato',
    rating: 5,
    comment: 'Liam did an amazing custom hair design on the side of my head! Professional artist. Got tons of compliments.',
    date: '2026-05-28'
  }
];
