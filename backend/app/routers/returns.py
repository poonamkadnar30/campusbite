import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.routers.orders import format_order_response

router = APIRouter(prefix="/orders", tags=["Return & Refund Management"])

@router.post("/{order_id}/return", response_model=schemas.OrderOut)
def request_order_return(
    order_id: int,
    payload: schemas.ReturnRequestCreate,
    db: Session = Depends(get_db)
):
    """
    Submits a return/refund request with reason (PRD Section 5).
    Rule: Allowed ONLY after order has been DELIVERED.
    Rule: A customer cannot submit multiple return requests for the same order.
    """
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != "DELIVERED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Return/refund requests can only be submitted for 'DELIVERED' orders. Current status: '{order.status}'"
        )

    if order.return_reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A return/refund request has already been submitted for this order."
        )

    order.return_reason = payload.reason
    order.return_status = "pending"
    order.return_requested_at = datetime.datetime.utcnow()
    order.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(order)
    return format_order_response(order)

@router.post("/{order_id}/return/handle", response_model=schemas.OrderOut)
def handle_return_request(
    order_id: int,
    payload: schemas.ReturnHandleRequest,
    db: Session = Depends(get_db)
):
    """
    Restaurant owner approves or rejects a customer return/refund request (PRD Section 5).
    - If approved: updates order status to 'REFUNDED', payment status to 'refunded', and writes a refund record in 'payment_ledger'.
    - If rejected: updates return status to 'rejected'.
    """
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order or not order.return_reason:
        raise HTTPException(status_code=404, detail="Return request not found for this order")

    action = payload.action.lower()

    if action == "approve":
        order.return_status = "approved"
        order.status = "REFUNDED"
        order.payment_status = "refunded"
        order.updated_at = datetime.datetime.utcnow()

        # Add refund record to payment ledger (PRD Section 5)
        refund_ledger = models.PaymentLedger(
            order_id=order.id,
            transaction_type="refund",
            amount=order.total,
            status="refunded",
            created_at=datetime.datetime.utcnow()
        )
        db.add(refund_ledger)
    else:
        order.return_status = "rejected"
        order.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(order)
    return format_order_response(order)
