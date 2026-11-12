import {
  MOCK_USERS,
  MOCK_RESTAURANTS,
  MOCK_MENU_ITEMS,
  MOCK_ORDERS,
  MOCK_REMINDERS,
} from './mockData';

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api';
const FORCE_MOCK = import.meta.env?.VITE_FORCE_MOCK === 'true';

// Local storage key for in-browser mock state persistence
const MOCK_STORAGE_KEY = 'campusbite_mock_db_v1';

const getMockDB = () => {
  const existing = localStorage.getItem(MOCK_STORAGE_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (e) {
      console.warn('Failed to parse mock DB, initializing defaults.');
    }
  }
  const initial = {
    users: MOCK_USERS,
    restaurants: MOCK_RESTAURANTS,
    menuItems: MOCK_MENU_ITEMS,
    orders: MOCK_ORDERS,
    reminders: MOCK_REMINDERS,
  };
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const saveMockDB = (db) => {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
};

// Helper to make authenticated fetch requests
const request = async (endpoint, options = {}) => {
  if (FORCE_MOCK) {
    throw new Error('MOCK_FALLBACK');
  }

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.message || `API error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    // If backend connection fails, we catch and throw MOCK_FALLBACK so callers can seamlessly use mock DB
    if (
      err.message === 'Failed to fetch' ||
      err.message.includes('NetworkError') ||
      err.message.includes('ECONNREFUSED')
    ) {
      console.info(`[Backend Offline] Falling back to interactive client mock DB for: ${endpoint}`);
      throw new Error('MOCK_FALLBACK');
    }
    throw err;
  }
};

/* =========================================================================
   1. AUTHENTICATION & USERS
   ========================================================================= */

export const apiLogin = async (email, password) => {
  try {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    if (err.message !== 'MOCK_FALLBACK') throw err;

    // Mock login fallback
    const db = getMockDB();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const token = `mock-jwt-token-role-${user.role}-${user.id}`;
    const restaurant = user.role === 'restaurant_owner'
      ? db.restaurants.find((item) => item.ownerId === user.id) ||
        (user.email === 'owner@campusbite.com'
          ? db.restaurants.find((item) => item.id === Number(user.restaurantId))
          : null)
      : null;
    return {
      token,
      user: {
        ...user,
        restaurantId: restaurant?.id ?? null,
        restaurantName: restaurant?.name ?? null,
      },
    };
  }
};

export const apiRegister = async (userData) => {
  try {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  } catch (err) {
    if (err.message !== 'MOCK_FALLBACK') throw err;

    // Mock register fallback
    const db = getMockDB();
    if (db.users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('An account with this email already exists');
    }
    const userId = Date.now();
    const restaurant = userData.role === 'restaurant_owner'
      ? {
          id: userId + 1,
          ownerId: userId,
          name: userData.restaurantName.trim(),
          cuisine: 'Other',
          rating: 0,
          reviewCount: 0,
          deliveryTime: '20-30 min',
          minOrder: 100,
          priceForTwo: 300,
          image: userData.restaurantImage || null,
          address: userData.address,
          description: userData.restaurantDescription || '',
          isAvailable: true,
        }
      : null;
    if (restaurant) db.restaurants.push(restaurant);

    const newUser = {
      id: userId,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'customer',
      phone: userData.phone || '',
      address: userData.address || '',
      restaurantId: restaurant?.id ?? null,
      restaurantName: restaurant?.name ?? null,
    };
    db.users.push(newUser);
    saveMockDB(db);
    const token = `mock-jwt-token-role-${newUser.role}-${newUser.id}`;
    return { token, user: newUser };
  }
};

/* =========================================================================
   2. RESTAURANTS & MENUS
   ========================================================================= */

export const apiGetRestaurants = async (searchQuery = '') => {
  try {
    const q = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
    return await request(`/restaurants${q}`);
  } catch (err) {
    if (err.message !== 'MOCK_FALLBACK') throw err;

    const db = getMockDB();
    let list = db.restaurants;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q)
      );
    }
    return list;
  }
};

export const apiGetRestaurantById = async (id) => {
  try {
    return await request(`/restaurants/${id}`);
  } catch (err) {
    const db = getMockDB();
    const r = db.restaurants.find((item) => item.id === Number(id));
    if (!r) throw new Error('Restaurant not found');
    return r;
  }
};

/** Updates an owner's restaurant profile. */
export const apiUpdateRestaurant = async (id, updates) => {
  try {
    return await request(`/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (err) {
    if (err.message !== 'MOCK_FALLBACK') throw err;

    const db = getMockDB();
    const restaurant = db.restaurants.find((item) => item.id === Number(id));
    if (!restaurant) throw new Error('Restaurant not found');
    Object.assign(restaurant, updates);
    saveMockDB(db);
    return restaurant;
  }
};

export const apiGetMenuItems = async (restaurantId) => {
  try {
    return await request(`/restaurants/${restaurantId}/menu`);
  } catch (err) {
    const db = getMockDB();
    return db.menuItems.filter((item) => item.restaurantId === Number(restaurantId));
  }
};

export const apiCreateMenuItem = async (itemData) => {
  try {
    return await request(`/menu-items`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  } catch (err) {
    const db = getMockDB();
    const newItem = {
      id: Date.now(),
      restaurantId: Number(itemData.restaurantId),
      name: itemData.name,
      description: itemData.description,
      price: Number(itemData.price),
      category: itemData.category || 'General',
      image:
        itemData.image ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      is_available: itemData.is_available !== false,
    };
    db.menuItems.push(newItem);
    saveMockDB(db);
    return newItem;
  }
};

export const apiUpdateMenuItem = async (id, updates) => {
  try {
    return await request(`/menu-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (err) {
    const db = getMockDB();
    const index = db.menuItems.findIndex((m) => m.id === Number(id));
    if (index === -1) throw new Error('Item not found');
    db.menuItems[index] = { ...db.menuItems[index], ...updates };
    saveMockDB(db);
    return db.menuItems[index];
  }
};

export const apiDeleteMenuItem = async (id) => {
  try {
    return await request(`/menu-items/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    const db = getMockDB();
    db.menuItems = db.menuItems.filter((m) => m.id !== Number(id));
    saveMockDB(db);
    return { success: true };
  }
};

/* =========================================================================
   3. ORDERS & LIFECYCLE MANAGEMENT
   ========================================================================= */

export const apiCreateOrder = async (orderPayload) => {
  try {
    return await request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  } catch (err) {
    const db = getMockDB();
    const newOrder = {
      id: Math.floor(1000 + Math.random() * 9000),
      customerId: orderPayload.customerId,
      customerName: orderPayload.customerName,
      customerPhone: orderPayload.customerPhone,
      restaurantId: orderPayload.restaurantId,
      restaurantName: orderPayload.restaurantName,
      status: 'PLACED',
      paymentStatus: 'mock_paid', // Dummy payment per PRD
      orderDate: new Date().toISOString(),
      items: orderPayload.items,
      subtotal: orderPayload.subtotal,
      deliveryFee: orderPayload.deliveryFee || 25,
      taxes: orderPayload.taxes || 15,
      total: orderPayload.total,
      deliveryAddress: orderPayload.deliveryAddress,
      assignedTo: null,
      deliveryPartnerName: null,
      review: null,
      returnRequest: null,
    };
    db.orders.unshift(newOrder);
    saveMockDB(db);
    return newOrder;
  }
};

export const apiGetOrders = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    return await request(`/orders?${params.toString()}`);
  } catch (err) {
    const db = getMockDB();
    let orders = [...db.orders];

    if (filters.customerId) {
      orders = orders.filter((o) => o.customerId === Number(filters.customerId));
    }
    if (filters.restaurantId) {
      orders = orders.filter((o) => o.restaurantId === Number(filters.restaurantId));
    }
    if (filters.assignedTo) {
      orders = orders.filter((o) => o.assignedTo === Number(filters.assignedTo));
    }
    if (filters.status && filters.status !== 'ALL') {
      orders = orders.filter((o) => o.status === filters.status);
    }
    if (filters.startDate) {
      orders = orders.filter((o) => new Date(o.orderDate) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      orders = orders.filter((o) => new Date(o.orderDate) <= new Date(filters.endDate));
    }
    return orders;
  }
};

export const apiUpdateOrderStatus = async (orderId, newStatus) => {
  try {
    return await request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
  } catch (err) {
    const db = getMockDB();
    const order = db.orders.find((o) => o.id === Number(orderId));
    if (!order) throw new Error('Order not found');

    // Lifecycle validation rules from PRD:
    // Placed -> Accepted -> Preparing -> Ready -> Assigned -> Out_for_delivery -> Delivered
    order.status = newStatus;
    saveMockDB(db);
    return order;
  }
};

export const apiCancelOrder = async (orderId) => {
  try {
    return await request(`/orders/${orderId}/cancel`, {
      method: 'POST',
    });
  } catch (err) {
    const db = getMockDB();
    const order = db.orders.find((o) => o.id === Number(orderId));
    if (!order) throw new Error('Order not found');
    if (order.status !== 'PLACED') {
      throw new Error('Only orders in PLACED status can be cancelled.');
    }
    order.status = 'CANCELLED';
    order.paymentStatus = 'refunded';
    saveMockDB(db);
    return order;
  }
};

/* =========================================================================
   4. DELIVERY ASSIGNMENT
   ========================================================================= */

export const apiAssignDeliveryPartner = async (orderId, deliveryPartnerId) => {
  try {
    return await request(`/orders/${orderId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ deliveryPartnerId }),
    });
  } catch (err) {
    const db = getMockDB();
    const order = db.orders.find((o) => o.id === Number(orderId));
    if (!order) throw new Error('Order not found');
    const partner = db.users.find((u) => u.id === Number(deliveryPartnerId));
    if (!partner) throw new Error('Delivery partner not found');

    order.assignedTo = partner.id;
    order.deliveryPartnerName = partner.name;
    order.status = 'ASSIGNED';
    saveMockDB(db);
    return order;
  }
};

export const apiGetDeliveryPartners = async () => {
  try {
    return await request('/delivery-partners');
  } catch (err) {
    const db = getMockDB();
    return db.users.filter((u) => u.role === 'delivery_partner');
  }
};

/* =========================================================================
   5. REVIEWS & RATINGS
   ========================================================================= */

export const apiSubmitReview = async (orderId, { rating, comment }) => {
  try {
    return await request(`/orders/${orderId}/review`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  } catch (err) {
    const db = getMockDB();
    const order = db.orders.find((o) => o.id === Number(orderId));
    if (!order) throw new Error('Order not found');
    if (order.status !== 'DELIVERED') {
      throw new Error('Reviews can only be submitted for DELIVERED orders.');
    }
    order.review = {
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString(),
    };
    saveMockDB(db);
    return order.review;
  }
};

/* =========================================================================
   6. RETURNS & REFUNDS
   ========================================================================= */

export const apiRequestReturn = async (orderId, reason) => {
  try {
    return await request(`/orders/${orderId}/return`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  } catch (err) {
    const db = getMockDB();
    const order = db.orders.find((o) => o.id === Number(orderId));
    if (!order) throw new Error('Order not found');
    if (order.status !== 'DELIVERED') {
      throw new Error('Return/Refund requests can only be made for DELIVERED orders.');
    }
    if (order.returnRequest) {
      throw new Error('A return request has already been submitted for this order.');
    }
    order.returnRequest = {
      reason,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    saveMockDB(db);
    return order;
  }
};

export const apiHandleReturnRequest = async (orderId, action) => {
  try {
    return await request(`/orders/${orderId}/return/handle`, {
      method: 'POST',
      body: JSON.stringify({ action }), // 'approve' or 'reject'
    });
  } catch (err) {
    const db = getMockDB();
    const order = db.orders.find((o) => o.id === Number(orderId));
    if (!order || !order.returnRequest) throw new Error('Return request not found');

    if (action === 'approve') {
      order.returnRequest.status = 'approved';
      order.status = 'REFUNDED';
      order.paymentStatus = 'refunded';
    } else {
      order.returnRequest.status = 'rejected';
    }
    saveMockDB(db);
    return order;
  }
};

/* =========================================================================
   7. AI-POWERED ORDER INSIGHTS
   ========================================================================= */

export const apiAskAiInsights = async (query, customerId) => {
  try {
    return await request('/ai/insights', {
      method: 'POST',
      body: JSON.stringify({ query, customerId }),
    });
  } catch (err) {
    // Client-side AI simulator that dynamically analyzes the user's real orders
    const db = getMockDB();
    const userOrders = db.orders.filter((o) => o.customerId === Number(customerId));
    const qLower = query.toLowerCase();

    // 1. Spending query
    if (qLower.includes('spend') || qLower.includes('money') || qLower.includes('cost') || qLower.includes('total')) {
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.paymentStatus === 'mock_paid' ? o.total : 0), 0);
      return {
        reply: `Based on your recent order records, you have spent a total of ₹${totalSpent} across ${userOrders.length} orders. Your highest single order was ₹${Math.max(...userOrders.map(o => o.total), 0)}.`,
        insights: { totalSpent, totalOrders: userOrders.length }
      };
    }

    // 2. Undelivered / In-progress query
    if (qLower.includes('not delivered') || qLower.includes('pending') || qLower.includes('active') || qLower.includes('current')) {
      const active = userOrders.filter((o) => !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status));
      if (active.length === 0) {
        return {
          reply: 'Great news! You have no pending orders at the moment. All your previous orders have either been delivered or concluded.',
          insights: { pendingCount: 0 }
        };
      }
      const orderSummary = active.map(o => `• Order #${o.id} (${o.restaurantName}): Status is currently "${o.status}"`).join('\n');
      return {
        reply: `You currently have ${active.length} active order(s) underway:\n\n${orderSummary}`,
        insights: { pendingCount: active.length }
      };
    }

    // 3. Most frequent items
    if (qLower.includes('frequent') || qLower.includes('favorite') || qLower.includes('most') || qLower.includes('popular')) {
      const itemCounts = {};
      userOrders.forEach((o) => {
        (o.items || []).forEach((it) => {
          itemCounts[it.name] = (itemCounts[it.name] || 0) + it.quantity;
        });
      });
      const sorted = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
      if (sorted.length === 0) {
        return { reply: 'You haven\'t ordered enough dishes yet to calculate your top favorites!' };
      }
      const topItems = sorted.slice(0, 3).map(([name, count], idx) => `${idx + 1}. ${name} (${count} ordered)`).join('\n');
      return {
        reply: `Here are your most frequently ordered dishes:\n\n${topItems}\n\nYou definitely have great taste!`,
        insights: { topItems: sorted }
      };
    }

    // 4. Summarize last orders (default)
    const recent = userOrders.slice(0, 5);
    const summary = recent.map((o, i) => `${i + 1}. Order #${o.id} from ${o.restaurantName} (₹${o.total}) - Status: ${o.status}`).join('\n');
    return {
      reply: `Here is a summary of your recent orders:\n\n${summary}\n\nYou can ask me specific questions like "How much did I spend?" or "Which food items have I ordered most frequently?"`,
      insights: { orderCount: recent.length }
    };
  }
};

/* =========================================================================
   8. RESTAURANT OWNER REMINDERS & STATISTICS
   ========================================================================= */

export const apiGetRestaurantStats = async (restaurantId) => {
  try {
    return await request(`/restaurants/${restaurantId}/stats`);
  } catch (err) {
    const db = getMockDB();
    const orders = db.orders.filter((o) => o.restaurantId === Number(restaurantId));
    const menuItems = db.menuItems.filter((m) => m.restaurantId === Number(restaurantId));
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'mock_paid' && o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
      .reduce((sum, o) => sum + o.total, 0);

    const activeOrders = orders.filter((o) => !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status));
    const pendingReturns = orders.filter((o) => o.returnRequest && o.returnRequest.status === 'pending');

    return {
      totalRevenue,
      totalOrders: orders.length,
      activeOrdersCount: activeOrders.length,
      totalMenuItems: menuItems.length,
      pendingReturnsCount: pendingReturns.length,
    };
  }
};

export const apiGetReminders = async (restaurantId) => {
  try {
    return await request(`/restaurants/${restaurantId}/reminders`);
  } catch (err) {
    const db = getMockDB();
    // Dynamically calculate idle orders in PLACED or ACCEPTED status for >15 mins
    const now = Date.now();
    const reminders = [];

    db.orders
      .filter((o) => o.restaurantId === Number(restaurantId) && (o.status === 'PLACED' || o.status === 'ACCEPTED'))
      .forEach((o) => {
        const orderTime = new Date(o.orderDate).getTime();
        const diffMinutes = Math.floor((now - orderTime) / (60 * 1000));
        if (diffMinutes >= 15) {
          reminders.push({
            id: `rem-${o.id}`,
            orderId: o.id,
            status: o.status,
            idleMinutes: diffMinutes,
            message: `⚠️ Order #${o.id} has been waiting in "${o.status}" status for ${diffMinutes} minutes! Please update its preparation status.`,
            createdAt: new Date().toISOString(),
          });
        }
      });

    return reminders;
  }
};
