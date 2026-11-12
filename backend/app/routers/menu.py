from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/menu-items", tags=["Menu Management"])

@router.post("", response_model=schemas.MenuItemOut, status_code=status.HTTP_201_CREATED)
def create_menu_item(item_in: schemas.MenuItemCreate, db: Session = Depends(get_db)):
    """Creates a new dish on the restaurant menu."""
    r_id = item_in.restaurantId or item_in.restaurant_id or 1
    new_item = models.MenuItem(
        restaurant_id=r_id,
        name=item_in.name,
        description=item_in.description,
        price=item_in.price,
        category=item_in.category or "General",
        image=item_in.image or "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
        is_available=item_in.is_available if item_in.is_available is not None else True,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return {
        "id": new_item.id,
        "restaurant_id": new_item.restaurant_id,
        "restaurantId": new_item.restaurant_id,
        "name": new_item.name,
        "description": new_item.description,
        "price": new_item.price,
        "category": new_item.category,
        "image": new_item.image,
        "is_available": new_item.is_available,
    }

@router.put("/{item_id}", response_model=schemas.MenuItemOut)
def update_menu_item(item_id: int, updates: schemas.MenuItemUpdate, db: Session = Depends(get_db)):
    """Updates dish details or toggles its availability."""
    item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    update_data = updates.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(item, field, val)

    db.commit()
    db.refresh(item)

    return {
        "id": item.id,
        "restaurant_id": item.restaurant_id,
        "restaurantId": item.restaurant_id,
        "name": item.name,
        "description": item.description,
        "price": item.price,
        "category": item.category,
        "image": item.image,
        "is_available": item.is_available,
    }

@router.delete("/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    """Deletes a dish from the menu."""
    item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    db.delete(item)
    db.commit()
    return {"success": True, "message": f"Item #{item_id} deleted successfully"}
