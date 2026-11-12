import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/orders", tags=["Reviews & Ratings"])

@router.post("/{order_id}/review", response_model=schemas.ReviewOut, status_code=status.HTTP_201_CREATED)
def submit_order_review(
    order_id: int,
    review_in: schemas.ReviewCreate,
    db: Session = Depends(get_db)
):
    """
    Submits a rating (1-5) and feedback review (PRD Section 2A & 10).
    Rule: Allowed ONLY for orders in 'DELIVERED' status.
    Rule: Only one review allowed per delivered order.
    """
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != "DELIVERED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Reviews can only be submitted for 'DELIVERED' orders. Current status: '{order.status}'"
        )

    existing_review = db.query(models.Review).filter(models.Review.order_id == order_id).first()
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A review has already been submitted for this order."
        )

    new_review = models.Review(
        order_id=order.id,
        customer_id=order.customer_id,
        rating=review_in.rating,
        comment=review_in.comment,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(new_review)

    # Update restaurant average rating & review count
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == order.restaurant_id).first()
    if restaurant:
        all_reviews = (
            db.query(models.Review)
            .join(models.Order)
            .filter(models.Order.restaurant_id == restaurant.id)
            .all()
        )
        total_rating = sum(r.rating for r in all_reviews) + review_in.rating
        restaurant.review_count = len(all_reviews) + 1
        restaurant.rating = round(total_rating / restaurant.review_count, 1)

    db.commit()
    db.refresh(new_review)

    return {
        "rating": new_review.rating,
        "comment": new_review.comment,
        "createdAt": new_review.created_at
    }
