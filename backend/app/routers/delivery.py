from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="", tags=["Delivery Partners"])

@router.get("/delivery-partners", response_model=List[schemas.UserOut])
def list_delivery_partners(db: Session = Depends(get_db)):
    """Retrieves all registered delivery partners for order assignment."""
    partners = db.query(models.User).filter(models.User.role == "delivery_partner").all()
    results = []
    for p in partners:
        results.append(schemas.UserOut(
            id=p.id,
            name=p.name,
            email=p.email,
            role=p.role,
            phone=p.phone,
            address=p.address,
        ))
    return results
