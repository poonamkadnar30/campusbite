import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app import models, schemas
from app.auth import require_owner

router = APIRouter(prefix="/restaurants", tags=["Restaurants & Menus"])

@router.get("", response_model=List[schemas.RestaurantOut])
def list_restaurants(
    search: Optional[str] = Query(None, description="Search by name, cuisine, or address"),
    sort_by: Optional[str] = Query(None, description="Sort options: rating, deliveryTime, minOrder"),
    db: Session = Depends(get_db)
):
    """Retrieves all campus restaurants, with optional search filtering and sorting."""
    query = db.query(models.Restaurant)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            or_(
                models.Restaurant.name.ilike(s),
                models.Restaurant.cuisine.ilike(s),
                models.Restaurant.address.ilike(s)
            )
        )

    if sort_by == "rating":
        query = query.order_by(models.Restaurant.rating.desc())
    elif sort_by == "minOrder":
        query = query.order_by(models.Restaurant.min_order.asc())
    else:
        query = query.order_by(models.Restaurant.id.asc())

    restaurants = query.all()

    # Format camelCase helper fields for frontend compatibility
    results = []
    for r in restaurants:
        r_dict = {
            "id": r.id,
            "name": r.name,
            "cuisine": r.cuisine,
            "rating": r.rating,
            "review_count": r.review_count,
            "reviewCount": r.review_count,
            "delivery_time": r.delivery_time,
            "deliveryTime": r.delivery_time,
            "min_order": r.min_order,
            "minOrder": r.min_order,
            "price_for_two": r.price_for_two,
            "image": r.image,
            "address": r.address,
            "description": r.description,
            "is_available": r.is_available,
            "isAvailable": r.is_available
        }
        results.append(r_dict)
    return results

@router.get("/{restaurant_id}", response_model=schemas.RestaurantOut)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    """Retrieves details of a specific restaurant by ID."""
    r = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    return {
        "id": r.id,
        "name": r.name,
        "cuisine": r.cuisine,
        "rating": r.rating,
        "review_count": r.review_count,
        "reviewCount": r.review_count,
        "delivery_time": r.delivery_time,
        "deliveryTime": r.delivery_time,
        "min_order": r.min_order,
        "minOrder": r.min_order,
        "price_for_two": r.price_for_two,
        "image": r.image,
        "address": r.address,
        "description": r.description,
        "is_available": r.is_available,
        "isAvailable": r.is_available
    }

@router.put("/{restaurant_id}", response_model=schemas.RestaurantOut)
def update_restaurant_profile(
    restaurant_id: int,
    updates: schemas.RestaurantUpdate,
    current_user: models.User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    """Updates profile fields for a restaurant owned by the current user."""
    restaurant = (
        db.query(models.Restaurant)
        .filter(
            models.Restaurant.id == restaurant_id,
            models.Restaurant.owner_id == current_user.id,
        )
        .first()
    )
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    update_data = updates.model_dump(exclude_unset=True)
    if "cuisine" in update_data:
        restaurant.cuisine = update_data["cuisine"]
    if "image" in update_data:
        image = update_data["image"]
        restaurant.image = str(image) if image else None
    if "description" in update_data:
        restaurant.description = update_data["description"]

    db.commit()
    db.refresh(restaurant)
    return restaurant

@router.get("/{restaurant_id}/menu", response_model=List[schemas.MenuItemOut])
def get_restaurant_menu(restaurant_id: int, db: Session = Depends(get_db)):
    """Retrieves all menu items for a specific restaurant."""
    items = db.query(models.MenuItem).filter(models.MenuItem.restaurant_id == restaurant_id).all()
    results = []
    for item in items:
        results.append({
            "id": item.id,
            "restaurant_id": item.restaurant_id,
            "restaurantId": item.restaurant_id,
            "name": item.name,
            "description": item.description,
            "price": item.price,
            "category": item.category,
            "image": item.image,
            "is_available": item.is_available
        })
    return results

@router.get("/{restaurant_id}/stats", response_model=schemas.RestaurantStats)
def get_restaurant_stats(restaurant_id: int, db: Session = Depends(get_db)):
    """Computes real-time statistics for the restaurant owner dashboard."""
    orders = db.query(models.Order).filter(models.Order.restaurant_id == restaurant_id).all()
    menu_count = db.query(models.MenuItem).filter(models.MenuItem.restaurant_id == restaurant_id).count()

    total_revenue = sum(
        o.total for o in orders 
        if o.payment_status == "mock_paid" and o.status not in ["CANCELLED", "REFUNDED"]
    )
    active_orders = [o for o in orders if o.status not in ["DELIVERED", "CANCELLED", "REFUNDED"]]
    pending_returns = [o for o in orders if o.return_status == "pending"]

    return {
        "totalRevenue": round(total_revenue, 2),
        "totalOrders": len(orders),
        "activeOrdersCount": len(active_orders),
        "totalMenuItems": menu_count,
        "pendingReturnsCount": len(pending_returns),
    }

@router.get("/{restaurant_id}/reminders", response_model=List[schemas.ReminderOut])
def get_restaurant_reminders(restaurant_id: int, db: Session = Depends(get_db)):
    """
    Background Task Reminders (PRD Section 8):
    Identifies and returns orders in PLACED or ACCEPTED status for > 15 minutes.
    """
    now = datetime.datetime.utcnow()
    orders = (
        db.query(models.Order)
        .filter(
            models.Order.restaurant_id == restaurant_id,
            models.Order.status.in_(["PLACED", "ACCEPTED"])
        )
        .all()
    )

    reminders = []
    for o in orders:
        diff_minutes = int((now - o.created_at).total_seconds() / 60)
        if diff_minutes >= 15:
            reminders.append({
                "id": f"rem-{o.id}",
                "orderId": o.id,
                "status": o.status,
                "idleMinutes": diff_minutes,
                "message": f"⚠️ Order #{o.id} has been waiting in '{o.status}' status for {diff_minutes} minutes! Please update its preparation status.",
                "createdAt": o.created_at
            })
    return reminders
