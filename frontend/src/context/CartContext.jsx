import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('campusbite_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [restaurant, setRestaurant] = useState(() => {
    const saved = localStorage.getItem('campusbite_cart_restaurant');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('campusbite_cart', JSON.stringify(cartItems));
    if (cartItems.length === 0) {
      setRestaurant(null);
      localStorage.removeItem('campusbite_cart_restaurant');
    }
  }, [cartItems]);

  useEffect(() => {
    if (restaurant) {
      localStorage.setItem('campusbite_cart_restaurant', JSON.stringify(restaurant));
    }
  }, [restaurant]);

  const addToCart = (dish, restInfo) => {
    if (cartItems.length > 0 && restaurant && restaurant.id !== restInfo.id) {
      const confirmReset = window.confirm(
        `Your cart contains items from "${restaurant.name}". Would you like to clear your cart and start a new order from "${restInfo.name}"?`
      );
      if (!confirmReset) return false;
      setCartItems([{ ...dish, quantity: 1, restaurantId: restInfo.id }]);
      setRestaurant(restInfo);
      return true;
    }

    if (!restaurant) {
      setRestaurant(restInfo);
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...dish, quantity: 1, restaurantId: restInfo.id }];
    });
    return true;
  };

  const updateQuantity = (dishId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(dishId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === dishId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (dishId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== dishId));
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurant(null);
    localStorage.removeItem('campusbite_cart');
    localStorage.removeItem('campusbite_cart_restaurant');
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cartItems.length > 0 ? 25 : 0;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + taxes;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurant,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        deliveryFee,
        taxes,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
