import datetime
import logging
from sqlalchemy.orm import Session
from app import models

logger = logging.getLogger("campusbite.background")

def check_idle_orders_background_task(db: Session):
    """
    Background Task (PRD Section 8):
    Identifies orders that are still in PLACED or ACCEPTED status for > 15 minutes,
    and generates persistent reminder records in 'admin_reminder_logs'.
    """
    threshold_time = datetime.datetime.utcnow() - datetime.timedelta(minutes=15)
    
    idle_orders = (
        db.query(models.Order)
        .filter(
            models.Order.status.in_(["PLACED", "ACCEPTED"]),
            models.Order.created_at <= threshold_time
        )
        .all()
    )

    count_created = 0
    for order in idle_orders:
        # Check if reminder already logged in the last 15 minutes
        recent_reminder = (
            db.query(models.AdminReminderLog)
            .filter(
                models.AdminReminderLog.order_id == order.id,
                models.AdminReminderLog.created_at >= threshold_time
            )
            .first()
        )
        
        if not recent_reminder:
            idle_minutes = int((datetime.datetime.utcnow() - order.created_at).total_seconds() / 60)
            reminder = models.AdminReminderLog(
                order_id=order.id,
                status=order.status,
                idle_minutes=idle_minutes,
                message=f"Order #{order.id} has been waiting in '{order.status}' status for {idle_minutes} minutes! Please update preparation status.",
                created_at=datetime.datetime.utcnow()
            )
            db.add(reminder)
            count_created += 1

    if count_created > 0:
        db.commit()
        logger.info(f"Background Task: Generated {count_created} reminder record(s) for idle orders.")
