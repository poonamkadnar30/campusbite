import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/orders", tags=["Order Lifecycle & Management"])

# Valid state machine transitions (PRD Section 4)
VALID_TRANSITIONS = {
    "PLACED": ["ACCEPTED", "CANCELLED"],
    "ACCEPTED": ["PREPARING"],
    "PREPARING": ["READY"],
    "READY": ["ASSIGNED"],
    "ASSIGNED": ["OUT_FOR_DELIVERY"],
    "OUT_FOR_DELIVERY": ["DELIVERED"],
    "DELIVERED": ["REFUNDED"],
    "CANCELLED": [],
    "REFUNDED": [],
}

def format_order_response(o: models.Order) -> dict:
    """Helper to convert Order ORM model to dictionary matching frontend expectation."""
    items = []
    for it in o.items:
        items.append({
            "id": it.id,
            "item_name": it.item_name,
            "name": it.item_name,
            "quantity": it.quantity,
            "unit_price": it.unit_price,
            "price": it.unit_price,
        })

    review_data = None
    if o.review:
        review_data = {
            "rating": o.review.rating,
            "comment": o.review.comment,
            "createdAt": o.review.created_at,
        }

    return_info = None
    if o.return_reason:
        return_info = {
            "reason": o.return_reason,
            "status": o.return_status or "pending",
            "requestedAt": o.return_requested_at,
        }

    return {
        "id": o.id,
        "customerId": o.customer_id,
        "customerName": o.customer.name if o.customer else "Customer",
        "customerPhone": o.customer.phone if o.customer else "",
        "restaurantId": o.restaurant_id,
        "restaurantName": o.restaurant.name if o.restaurant else "Campus Restaurant",
        "status": o.status,
        "paymentStatus": o.payment_status,
        "orderDate": o.created_at,
        "items": items,
        "subtotal": o.subtotal,
        "deliveryFee": o.delivery_fee,
        "taxes": o.taxes,
        "total": o.total,
        "deliveryAddress": o.delivery_address,
        "assignedTo": o.delivery_partner_id,
        "deliveryPartnerName": o.delivery_partner.name if o.delivery_partner else None,
        "review": review_data,
        "returnRequest": return_info,
    }

@router.post("", response_model=schemas.OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(order_in: schemas.OrderCreate, db: Session = Depends(get_db)):
    """
    Places a new food order with Dummy Payment (PRD Section 5).
    Sets status to 'PLACED', payment_status to 'mock_paid', and writes to 'payment_ledger'.
    """
    cust_id = order_in.customerId or 1

    # Validate financial calculations integrity
    computed_subtotal = sum(item.price * item.quantity for item in order_in.items)
    delivery_fee = order_in.deliveryFee if order_in.deliveryFee is not None else 25.0
    computed_taxes = round(computed_subtotal * 0.05, 2) if order_in.taxes is None else order_in.taxes
    expected_total = round(computed_subtotal + delivery_fee + computed_taxes, 2)

    new_order = models.Order(
        customer_id=cust_id,
        restaurant_id=order_in.restaurantId,
        status="PLACED",
        payment_status="mock_paid",
        subtotal=round(computed_subtotal, 2),
        delivery_fee=delivery_fee,
        taxes=computed_taxes,
        total=expected_total,
        delivery_address=order_in.deliveryAddress.strip(),
        notes=order_in.notes,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(new_order)
    db.flush()

    # Add order items
    for item in order_in.items:
        order_item = models.OrderItem(
            order_id=new_order.id,
            menu_item_id=item.id,
            item_name=item.name,
            quantity=item.quantity,
            unit_price=item.price,
        )
        db.add(order_item)

    # Record dummy payment in payment ledger (PRD Section 5)
    ledger_entry = models.PaymentLedger(
        order_id=new_order.id,
        transaction_type="payment",
        amount=new_order.total,
        status="mock_paid",
        created_at=datetime.datetime.utcnow(),
    )
    db.add(ledger_entry)

    db.commit()
    db.refresh(new_order)

    return format_order_response(new_order)

@router.get("", response_model=List[schemas.OrderOut])
def get_orders(
    customerId: Optional[int] = Query(None),
    restaurantId: Optional[int] = Query(None),
    assignedTo: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    startDate: Optional[str] = Query(None),
    endDate: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Retrieves orders with multi-criteria filtering for all three role dashboards."""
    query = db.query(models.Order)

    if customerId:
        query = query.filter(models.Order.customer_id == customerId)
    if restaurantId:
        query = query.filter(models.Order.restaurant_id == restaurantId)
    if assignedTo:
        query = query.filter(models.Order.delivery_partner_id == assignedTo)
    if status and status != "ALL":
        query = query.filter(models.Order.status == status)
    if startDate:
        try:
            s_date = datetime.datetime.fromisoformat(startDate)
            query = query.filter(models.Order.created_at >= s_date)
        except ValueError:
            pass
    if endDate:
        try:
            e_date = datetime.datetime.fromisoformat(endDate)
            query = query.filter(models.Order.created_at <= e_date)
        except ValueError:
            pass

    orders = query.order_by(models.Order.created_at.desc()).all()
    return [format_order_response(o) for o in orders]

@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order_by_id(order_id: int, db: Session = Depends(get_db)):
    """Retrieves detailed information of a single order."""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return format_order_response(order)

@router.patch("/{order_id}/status", response_model=schemas.OrderOut)
def update_order_status(
    order_id: int,
    payload: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
):
    """
    Updates the lifecycle status of an order according to the state machine rules (PRD Section 4).
    Rejects invalid state transitions with HTTP 400.
    """
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    new_status = payload.status.upper()
    current_status = order.status.upper()

    allowed = VALID_TRANSITIONS.get(current_status, [])
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid order status transition from '{current_status}' to '{new_status}'. Allowed transitions: {allowed}",
        )

    order.status = new_status
    order.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(order)
    return format_order_response(order)

@router.post("/{order_id}/cancel", response_model=schemas.OrderOut)
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    """
    Cancels an order (PRD Section 4 rule: Allowed ONLY when in 'PLACED' status).
    """
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != "PLACED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cancellation rejected: Only orders in 'PLACED' status can be cancelled. Current status is '{order.status}'.",
        )

    order.status = "CANCELLED"
    order.payment_status = "refunded"
    order.updated_at = datetime.datetime.utcnow()

    # Record cancellation refund in payment ledger
    db.add(
        models.PaymentLedger(
            order_id=order.id,
            transaction_type="refund",
            amount=order.total,
            status="refunded",
            created_at=datetime.datetime.utcnow(),
        )
    )

    db.commit()
    db.refresh(order)
    return format_order_response(order)

@router.post("/{order_id}/assign", response_model=schemas.OrderOut)
def assign_delivery_partner(
    order_id: int,
    payload: schemas.OrderAssign,
    db: Session = Depends(get_db),
):
    """
    Assigns a campus delivery partner to an order (PRD Section 4: Allowed when order is 'READY').
    Transitions status from READY to ASSIGNED.
    """
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    partner = db.query(models.User).filter(
        models.User.id == payload.deliveryPartnerId,
        models.User.role == "delivery_partner"
    ).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Delivery partner not found")

    order.delivery_partner_id = partner.id
    order.status = "ASSIGNED"
    order.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(order)
    return format_order_response(order)
