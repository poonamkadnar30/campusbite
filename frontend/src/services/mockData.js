// CampusBite Comprehensive Mock Store for development, testing, and offline fallback

export const MOCK_USERS = [
  {
    id: 1,
    name: 'Aarav Sharma',
    email: 'customer@campusbite.com',
    role: 'customer',
    phone: '+91 98765 43210',
    address: 'Hostel Block 4, Room 302, Campus North',
  },
  {
    id: 2,
    name: 'Priya Patel',
    email: 'owner@campusbite.com',
    role: 'restaurant_owner',
    phone: '+91 98123 45678',
    restaurantId: 1,
    restaurantName: 'Campus Spice Hub',
    address: 'Student Center Food Court, Shop #2',
  },
  {
    id: 3,
    name: 'Rohan Verma',
    email: 'delivery@campusbite.com',
    role: 'delivery_partner',
    phone: '+91 98987 65432',
    vehicleNumber: 'DL-01-CB-9021',
  },
  {
    id: 4,
    name: 'Vikram Singh',
    email: 'vikram.delivery@campusbite.com',
    role: 'delivery_partner',
    phone: '+91 97766 55443',
    vehicleNumber: 'DL-04-CB-1122',
  }
];

export const MOCK_RESTAURANTS = [
  {
    id: 1,
    name: 'Campus Spice Hub',
    cuisine: 'North Indian, Street Food & Biryani',
    rating: 4.6,
    reviewCount: 184,
    deliveryTime: '20-30 min',
    minOrder: 150,
    priceForTwo: 300,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=60',
    address: 'Student Center Food Court, Shop #2',
    description: 'Authentic rich curries, freshly baked garlic naans, and signature Dum Biryanis for university foodies.',
    isAvailable: true,
  },
  {
    id: 2,
    name: 'Bite & Brew Cafe',
    cuisine: 'Burgers, Artisan Coffee & Wraps',
    rating: 4.8,
    reviewCount: 320,
    deliveryTime: '15-25 min',
    minOrder: 120,
    priceForTwo: 250,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=60',
    address: 'Central Library Walkway, Gate #3',
    description: 'Your late-night study fueling station with smash burgers, crispy tenders, and iced cold brews.',
    isAvailable: true,
  },
  {
    id: 3,
    name: 'Wok & Roll Asian Bowl',
    cuisine: 'Pan-Asian, Noodles & Dimsums',
    rating: 4.5,
    reviewCount: 142,
    deliveryTime: '25-35 min',
    minOrder: 180,
    priceForTwo: 350,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=60',
    address: 'Engineering Quad Eatery, Bay 5',
    description: 'Sizzling hot Hakka noodles, Thai basil chicken, and freshly steamed dim sums made fresh to order.',
    isAvailable: true,
  },
  {
    id: 4,
    name: 'Bella Italia Pizzeria',
    cuisine: 'Woodfired Pizza, Pastas & Garlic Breads',
    rating: 4.7,
    reviewCount: 210,
    deliveryTime: '20-35 min',
    minOrder: 200,
    priceForTwo: 400,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60',
    address: 'Sports Complex Plaza, Shop 4',
    description: 'Crispy sourdough Neapolitan pizza baked with imported mozzarella and herbs.',
    isAvailable: true,
  }
];

export const MOCK_MENU_ITEMS = [
  // Restaurant 1: Campus Spice Hub
  {
    id: 101,
    restaurantId: 1,
    name: 'Hyderabadi Dum Chicken Biryani',
    description: 'Slow-cooked aromatic basmati rice layered with marinated tender chicken and fragrant saffron.',
    price: 249,
    category: 'Biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
    is_available: true,
  },
  {
    id: 102,
    restaurantId: 1,
    name: 'Paneer Butter Masala',
    description: 'Cottage cheese cubes simmered in a luscious rich butter and tomato gravy.',
    price: 199,
    category: 'Curry',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60',
    is_available: true,
  },
  {
    id: 103,
    restaurantId: 1,
    name: 'Garlic Butter Naan (2 Pcs)',
    description: 'Clay-oven tandoor bread brushed with melted butter and fresh minced garlic.',
    price: 79,
    category: 'Breads',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60',
    is_available: true,
  },
  {
    id: 104,
    restaurantId: 1,
    name: 'Dal Makhani Bowl',
    description: 'Black lentils slow-cooked overnight with cream and house-ground spices.',
    price: 169,
    category: 'Curry',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60',
    is_available: true,
  },
  {
    id: 105,
    restaurantId: 1,
    name: 'Gulab Jamun (2 Pcs)',
    description: 'Hot melt-in-mouth milk dumplings soaked in cardamom sugar syrup.',
    price: 69,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60',
    is_available: true,
  },

  // Restaurant 2: Bite & Brew Cafe
  {
    id: 201,
    restaurantId: 2,
    name: 'Crispy Spicy Chicken Burger',
    description: 'Crispy fried chicken breast, pickled jalapenos, melted cheese and house chipotle sauce.',
    price: 179,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
    is_available: true,
  },
  {
    id: 202,
    restaurantId: 2,
    name: 'Double Cheeseburger',
    description: 'Double grilled patties with cheddar cheese, lettuce, tomato, and caramelized onions.',
    price: 199,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60',
    is_available: true,
  },
  {
    id: 203,
    restaurantId: 2,
    name: 'Peri-Peri Loaded Fries',
    description: 'Golden potato fries tossed in spicy peri-peri dust, topped with warm cheese sauce.',
    price: 119,
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&auto=format&fit=crop&q=60',
    is_available: true,
  },
  {
    id: 204,
    restaurantId: 2,
    name: 'Iced Hazelnut Latte',
    description: 'Double shot espresso shaken over ice with milk and toasted hazelnut syrup.',
    price: 129,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60',
    is_available: true,
  },

  // Restaurant 3: Wok & Roll
  {
    id: 301,
    restaurantId: 3,
    name: 'Chilli Garlic Chicken Noodles',
    description: 'Wok-tossed egg noodles with shredded chicken, crunchy bell peppers, and roasted garlic.',
    price: 189,
    category: 'Noodles',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60',
    is_available: true,
  },
  {
    id: 302,
    restaurantId: 3,
    name: 'Steamed Chicken Momos (6 Pcs)',
    description: 'Juicy steamed dumplings served with red fiery schezwan dip and sesame soup.',
    price: 139,
    category: 'Dimsums',
    image: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=500&auto=format&fit=crop&q=60',
    is_available: true,
  },

  // Restaurant 4: Bella Italia
  {
    id: 401,
    restaurantId: 4,
    name: 'Margherita Woodfired Pizza',
    description: 'San Marzano tomato sauce, fresh mozzarella balls, virgin olive oil, and fresh basil.',
    price: 269,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60',
    is_available: true,
  },
  {
    id: 402,
    restaurantId: 4,
    name: 'Creamy Alfredo Penne Pasta',
    description: 'Penne tossed in garlic parmesan cream sauce with mushrooms and Italian herbs.',
    price: 229,
    category: 'Pasta',
    image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&auto=format&fit=crop&q=60',
    is_available: true,
  }
];

export const MOCK_ORDERS = [
  {
    id: 1001,
    customerId: 1,
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98765 43210',
    restaurantId: 1,
    restaurantName: 'Campus Spice Hub',
    status: 'DELIVERED',
    paymentStatus: 'mock_paid',
    orderDate: '2026-11-08T18:30:00Z',
    items: [
      { id: 101, name: 'Hyderabadi Dum Chicken Biryani', price: 249, quantity: 2 },
      { id: 105, name: 'Gulab Jamun (2 Pcs)', price: 69, quantity: 1 }
    ],
    subtotal: 567,
    deliveryFee: 30,
    taxes: 28,
    total: 625,
    deliveryAddress: 'Hostel Block 4, Room 302, Campus North',
    assignedTo: 3, // Rohan Verma
    deliveryPartnerName: 'Rohan Verma',
    review: {
      rating: 5,
      comment: 'Arrived steaming hot! The biryani flavor was outstanding.',
      createdAt: '2026-11-08T19:25:00Z'
    },
    returnRequest: null
  },
  {
    id: 1002,
    customerId: 1,
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98765 43210',
    restaurantId: 1,
    restaurantName: 'Campus Spice Hub',
    status: 'PLACED',
    paymentStatus: 'mock_paid',
    orderDate: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 mins ago (triggers reminder >15 mins!)
    items: [
      { id: 102, name: 'Paneer Butter Masala', price: 199, quantity: 1 },
      { id: 103, name: 'Garlic Butter Naan (2 Pcs)', price: 79, quantity: 2 }
    ],
    subtotal: 357,
    deliveryFee: 25,
    taxes: 18,
    total: 400,
    deliveryAddress: 'Hostel Block 4, Room 302, Campus North',
    assignedTo: null,
    deliveryPartnerName: null,
    review: null,
    returnRequest: null
  },
  {
    id: 1003,
    customerId: 1,
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98765 43210',
    restaurantId: 1,
    restaurantName: 'Campus Spice Hub',
    status: 'READY',
    paymentStatus: 'mock_paid',
    orderDate: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    items: [
      { id: 101, name: 'Hyderabadi Dum Chicken Biryani', price: 249, quantity: 1 },
      { id: 104, name: 'Dal Makhani Bowl', price: 169, quantity: 1 }
    ],
    subtotal: 418,
    deliveryFee: 25,
    taxes: 21,
    total: 464,
    deliveryAddress: 'Hostel Block 4, Room 302, Campus North',
    assignedTo: null,
    deliveryPartnerName: null,
    review: null,
    returnRequest: null
  },
  {
    id: 1004,
    customerId: 1,
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98765 43210',
    restaurantId: 1,
    restaurantName: 'Campus Spice Hub',
    status: 'ASSIGNED',
    paymentStatus: 'mock_paid',
    orderDate: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    items: [
      { id: 102, name: 'Paneer Butter Masala', price: 199, quantity: 2 },
      { id: 103, name: 'Garlic Butter Naan (2 Pcs)', price: 79, quantity: 3 }
    ],
    subtotal: 635,
    deliveryFee: 30,
    taxes: 32,
    total: 697,
    deliveryAddress: 'Hostel Block 4, Room 302, Campus North',
    assignedTo: 3,
    deliveryPartnerName: 'Rohan Verma',
    review: null,
    returnRequest: null
  },
  {
    id: 1005,
    customerId: 1,
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98765 43210',
    restaurantId: 2,
    restaurantName: 'Bite & Brew Cafe',
    status: 'DELIVERED',
    paymentStatus: 'mock_paid',
    orderDate: '2026-11-05T20:15:00Z',
    items: [
      { id: 201, name: 'Crispy Spicy Chicken Burger', price: 179, quantity: 2 },
      { id: 203, name: 'Peri-Peri Loaded Fries', price: 119, quantity: 1 },
      { id: 204, name: 'Iced Hazelnut Latte', price: 129, quantity: 2 }
    ],
    subtotal: 735,
    deliveryFee: 25,
    taxes: 37,
    total: 797,
    deliveryAddress: 'Hostel Block 4, Room 302, Campus North',
    assignedTo: 3,
    deliveryPartnerName: 'Rohan Verma',
    review: null,
    returnRequest: {
      reason: 'Fries were cold and soggy upon arrival due to rain delay.',
      status: 'pending', // pending | approved | rejected
      requestedAt: '2026-11-05T21:40:00Z'
    }
  }
];

export const MOCK_REMINDERS = [
  {
    id: 1,
    orderId: 1002,
    restaurantId: 1,
    status: 'PLACED',
    idleMinutes: 20,
    message: 'Order #1002 has been in PLACED status for more than 15 minutes without response.',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  }
];
