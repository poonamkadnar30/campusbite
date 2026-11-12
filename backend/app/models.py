import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False, default="customer") # 'customer', 'restaurant_owner', 'delivery_partner'
    phone = Column(String(30), nullable=True)
    address = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    orders = relationship("Order", foreign_keys="[Order.customer_id]", back_populates="customer")
    deliveries = relationship("Order", foreign_keys="[Order.delivery_partner_id]", back_populates="delivery_partner")
    restaurants = relationship("Restaurant", back_populates="owner")
    reviews = relationship("Review", back_populates="customer")


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(120), nullable=False, index=True)
    cuisine = Column(String(120), nullable=False)
    rating = Column(Float, default=4.5)
    review_count = Column(Integer, default=0)
    delivery_time = Column(String(50), default="20-30 min")
    min_order = Column(Float, default=100.0)
    price_for_two = Column(Float, default=300.0)
    image = Column(String(500), nullable=True)
    address = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="restaurants")
    menu_items = relationship("MenuItem", back_populates="restaurant", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="restaurant")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False, index=True)
    name = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String(60), default="General", index=True)
    image = Column(String(500), nullable=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="menu_items")
    order_items = relationship("OrderItem", back_populates="menu_item")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False, index=True)
    delivery_partner_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Lifecycle: PLACED, ACCEPTED, PREPARING, READY, ASSIGNED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, REFUNDED
    status = Column(String(40), default="PLACED", index=True)
    payment_status = Column(String(40), default="mock_paid") # 'mock_paid', 'refunded'
    
    subtotal = Column(Float, nullable=False)
    delivery_fee = Column(Float, default=25.0)
    taxes = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    
    delivery_address = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    
    # Return / Refund request tracking
    return_reason = Column(Text, nullable=True)
    return_status = Column(String(30), nullable=True) # None, 'pending', 'approved', 'rejected'
    return_requested_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    customer = relationship("User", foreign_keys=[customer_id], back_populates="orders")
    restaurant = relationship("Restaurant", back_populates="orders")
    delivery_partner = relationship("User", foreign_keys=[delivery_partner_id], back_populates="deliveries")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    review = relationship("Review", back_populates="order", uselist=False, cascade="all, delete-orphan")
    ledger_entries = relationship("PaymentLedger", back_populates="order", cascade="all, delete-orphan")
    reminders = relationship("AdminReminderLog", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=True)
    item_name = Column(String(120), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="order_items")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False) # 1 to 5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="review")
    customer = relationship("User", back_populates="reviews")


class PaymentLedger(Base):
    __tablename__ = "payment_ledger"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    transaction_type = Column(String(30), default="payment") # 'payment', 'refund'
    amount = Column(Float, nullable=False)
    status = Column(String(30), default="mock_paid") # 'mock_paid', 'refunded'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="ledger_entries")


class AdminReminderLog(Base):
    __tablename__ = "admin_reminder_logs"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    status = Column(String(40), nullable=False)
    idle_minutes = Column(Integer, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="reminders")
