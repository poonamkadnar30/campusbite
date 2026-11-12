from typing import List, Optional
import datetime
from pydantic import BaseModel, EmailStr, Field, HttpUrl

# ==================== User & Auth Schemas ====================
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field("customer", pattern="^(customer|restaurant_owner|delivery_partner)$")
    phone: Optional[str] = None
    address: Optional[str] = None
    restaurantName: Optional[str] = Field(None, min_length=2, max_length=120)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: Optional[str] = None
    address: Optional[str] = None
    restaurantId: Optional[int] = None
    restaurantName: Optional[str] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    token: str
    user: UserOut

# ==================== Restaurant Schemas ====================
class RestaurantBase(BaseModel):
    name: str
    cuisine: str
    delivery_time: Optional[str] = "20-30 min"
    min_order: Optional[float] = 100.0
    price_for_two: Optional[float] = 300.0
    image: Optional[str] = None
    address: str
    description: Optional[str] = None
    is_available: Optional[bool] = True

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantUpdate(BaseModel):
    cuisine: Optional[str] = Field(None, min_length=2, max_length=120)
    image: Optional[HttpUrl] = None
    description: Optional[str] = Field(None, max_length=500)

class RestaurantOut(RestaurantBase):
    id: int
    rating: float
    review_count: int
    reviewCount: Optional[int] = None
    deliveryTime: Optional[str] = None
    minOrder: Optional[float] = None
    isAvailable: Optional[bool] = None

    class Config:
        from_attributes = True

# ==================== Menu Item Schemas ====================
class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = "General"
    image: Optional[str] = None
    is_available: Optional[bool] = True

class MenuItemCreate(MenuItemBase):
    restaurantId: Optional[int] = None
    restaurant_id: Optional[int] = None

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image: Optional[str] = None
    is_available: Optional[bool] = None

class MenuItemOut(MenuItemBase):
    id: int
    restaurant_id: int
    restaurantId: Optional[int] = None

    class Config:
        from_attributes = True

# ==================== Order Item Schemas ====================
class OrderItemCreate(BaseModel):
    id: Optional[int] = None
    name: str
    price: float
    quantity: int = 1

class OrderItemOut(BaseModel):
    id: int
    item_name: str
    name: Optional[str] = None
    quantity: int
    unit_price: float
    price: Optional[float] = None

    class Config:
        from_attributes = True

# ==================== Order Schemas ====================
class OrderCreate(BaseModel):
    customerId: Optional[int] = None
    customerName: Optional[str] = None
    customerPhone: Optional[str] = None
    restaurantId: int
    restaurantName: Optional[str] = None
    items: List[OrderItemCreate]
    subtotal: float
    deliveryFee: Optional[float] = 25.0
    taxes: Optional[float] = 0.0
    total: float
    deliveryAddress: str
    notes: Optional[str] = None
    paymentStatus: Optional[str] = "mock_paid"

class OrderStatusUpdate(BaseModel):
    status: str

class OrderAssign(BaseModel):
    deliveryPartnerId: int

class ReviewOut(BaseModel):
    rating: int
    comment: Optional[str] = None
    createdAt: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class ReturnRequestInfo(BaseModel):
    reason: str
    status: str
    requestedAt: Optional[datetime.datetime] = None

class OrderOut(BaseModel):
    id: int
    customerId: int
    customerName: str
    customerPhone: Optional[str] = None
    restaurantId: int
    restaurantName: str
    status: str
    paymentStatus: str
    orderDate: datetime.datetime
    items: List[OrderItemOut]
    subtotal: float
    deliveryFee: float
    taxes: float
    total: float
    deliveryAddress: str
    assignedTo: Optional[int] = None
    deliveryPartnerName: Optional[str] = None
    review: Optional[ReviewOut] = None
    returnRequest: Optional[ReturnRequestInfo] = None

    class Config:
        from_attributes = True

# ==================== Review Schemas ====================
class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str

# ==================== Return / Refund Schemas ====================
class ReturnRequestCreate(BaseModel):
    reason: str

class ReturnHandleRequest(BaseModel):
    action: str = Field(..., pattern="^(approve|reject)$")

# ==================== AI Schemas ====================
class AiQueryRequest(BaseModel):
    query: str
    customerId: Optional[int] = None

class AiQueryResponse(BaseModel):
    reply: str
    insights: Optional[dict] = None

# ==================== Stats & Reminder Schemas ====================
class RestaurantStats(BaseModel):
    totalRevenue: float
    totalOrders: int
    activeOrdersCount: int
    totalMenuItems: int
    pendingReturnsCount: int

class ReminderOut(BaseModel):
    id: str
    orderId: int
    status: str
    idleMinutes: int
    message: str
    createdAt: datetime.datetime
