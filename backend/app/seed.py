import datetime
from sqlalchemy.orm import Session
from app import models
from app.auth import get_password_hash

def seed_database(db: Session):
    """Pre-populates the database with demo users, campus restaurants, menus, and orders."""
    # Check if already seeded
    if db.query(models.User).first():
        return

    print("🌱 Initializing CampusBite database with demo seed records...")

    default_hashed_pwd = get_password_hash("pass123")

    # 1. Users for all 3 roles
    u_customer = models.User(
        name="Aarav Sharma",
        email="customer@campusbite.com",
        hashed_password=default_hashed_pwd,
        role="customer",
        phone="+91 98765 43210",
        address="Hostel Block 4, Room 302, Campus North"
    )
    u_owner = models.User(
        name="Priya Patel",
        email="owner@campusbite.com",
        hashed_password=default_hashed_pwd,
        role="restaurant_owner",
        phone="+91 98123 45678",
        address="Student Center Food Court, Shop #2"
    )
    u_delivery1 = models.User(
        name="Rohan Verma",
        email="delivery@campusbite.com",
        hashed_password=default_hashed_pwd,
        role="delivery_partner",
        phone="+91 98987 65432",
        address="Campus Transit Hub"
    )
    u_delivery2 = models.User(
        name="Vikram Singh",
        email="vikram.delivery@campusbite.com",
        hashed_password=default_hashed_pwd,
        role="delivery_partner",
        phone="+91 97766 55443",
        address="Campus Bike Stand 2"
    )

    db.add_all([u_customer, u_owner, u_delivery1, u_delivery2])
    db.commit()

    # 2. Campus Restaurants
    r1 = models.Restaurant(
        owner_id=u_owner.id,
        name="Campus Spice Hub",
        cuisine="North Indian, Street Food & Biryani",
        rating=4.6,
        review_count=184,
        delivery_time="20-30 min",
        min_order=150.0,
        price_for_two=300.0,
        image="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=60",
        address="Student Center Food Court, Shop #2",
        description="Authentic rich curries, freshly baked garlic naans, and signature Dum Biryanis for university foodies.",
        is_available=True
    )
    r2 = models.Restaurant(
        owner_id=u_owner.id,
        name="Bite & Brew Cafe",
        cuisine="Burgers, Artisan Coffee & Wraps",
        rating=4.8,
        review_count=320,
        delivery_time="15-25 min",
        min_order=120.0,
        price_for_two=250.0,
        image="https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=60",
        address="Central Library Walkway, Gate #3",
        description="Your late-night study fueling station with smash burgers, crispy tenders, and iced cold brews.",
        is_available=True
    )
    r3 = models.Restaurant(
        owner_id=u_owner.id,
        name="Wok & Roll Asian Bowl",
        cuisine="Pan-Asian, Noodles & Dimsums",
        rating=4.5,
        review_count=142,
        delivery_time="25-35 min",
        min_order=180.0,
        price_for_two=350.0,
        image="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=60",
        address="Engineering Quad Eatery, Bay 5",
        description="Sizzling hot Hakka noodles, Thai basil chicken, and freshly steamed dim sums made fresh to order.",
        is_available=True
    )
    r4 = models.Restaurant(
        owner_id=u_owner.id,
        name="Bella Italia Pizzeria",
        cuisine="Woodfired Pizza, Pastas & Garlic Breads",
        rating=4.7,
        review_count=210,
        delivery_time="20-35 min",
        min_order=200.0,
        price_for_two=400.0,
        image="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60",
        address="Sports Complex Plaza, Shop 4",
        description="Crispy sourdough Neapolitan pizza baked with imported mozzarella and herbs.",
        is_available=True
    )

    db.add_all([r1, r2, r3, r4])
    db.commit()

    # 3. Menu Items
    menu_items = [
        # Restaurant 1
        models.MenuItem(restaurant_id=r1.id, name="Hyderabadi Dum Chicken Biryani", description="Slow-cooked aromatic basmati rice layered with marinated tender chicken and fragrant saffron.", price=249.0, category="Biryani", is_available=True, image="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60"),
        models.MenuItem(restaurant_id=r1.id, name="Paneer Butter Masala", description="Cottage cheese cubes simmered in a luscious rich butter and tomato gravy.", price=199.0, category="Curry", is_available=True, image="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60"),
        models.MenuItem(restaurant_id=r1.id, name="Garlic Butter Naan (2 Pcs)", description="Clay-oven tandoor bread brushed with melted butter and fresh minced garlic.", price=79.0, category="Breads", is_available=True, image="https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60"),
        models.MenuItem(restaurant_id=r1.id, name="Dal Makhani Bowl", description="Black lentils slow-cooked overnight with cream and house-ground spices.", price=169.0, category="Curry", is_available=True, image="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60"),
        models.MenuItem(restaurant_id=r1.id, name="Gulab Jamun (2 Pcs)", description="Hot melt-in-mouth milk dumplings soaked in cardamom sugar syrup.", price=69.0, category="Desserts", is_available=True, image="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60"),

        # Restaurant 2
        models.MenuItem(restaurant_id=r2.id, name="Crispy Spicy Chicken Burger", description="Crispy fried chicken breast, pickled jalapenos, melted cheese and house chipotle sauce.", price=179.0, category="Burgers", is_available=True, image="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60"),
        models.MenuItem(restaurant_id=r2.id, name="Double Cheeseburger", description="Double grilled patties with cheddar cheese, lettuce, tomato, and caramelized onions.", price=199.0, category="Burgers", is_available=True, image="https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60"),
        models.MenuItem(restaurant_id=r2.id, name="Peri-Peri Loaded Fries", description="Golden potato fries tossed in spicy peri-peri dust, topped with warm cheese sauce.", price=119.0, category="Sides", is_available=True, image="https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&auto=format&fit=crop&q=60"),
        models.MenuItem(restaurant_id=r2.id, name="Iced Hazelnut Latte", description="Double shot espresso shaken over ice with milk and toasted hazelnut syrup.", price=129.0, category="Beverages", is_available=True, image="https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60"),

        # Restaurant 3 & 4
        models.MenuItem(restaurant_id=r3.id, name="Chilli Garlic Chicken Noodles", description="Wok-tossed egg noodles with shredded chicken, crunchy bell peppers, and roasted garlic.", price=189.0, category="Noodles", is_available=True, image="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60"),
        models.MenuItem(restaurant_id=r4.id, name="Margherita Woodfired Pizza", description="San Marzano tomato sauce, fresh mozzarella balls, virgin olive oil, and fresh basil.", price=269.0, category="Pizza", is_available=True, image="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60")
    ]
    db.add_all(menu_items)
    db.commit()

    # 4. Sample Orders
    now = datetime.datetime.utcnow()

    # Order 1: DELIVERED with Review
    order1 = models.Order(
        customer_id=u_customer.id,
        restaurant_id=r1.id,
        delivery_partner_id=u_delivery1.id,
        status="DELIVERED",
        payment_status="mock_paid",
        subtotal=567.0,
        delivery_fee=30.0,
        taxes=28.0,
        total=625.0,
        delivery_address="Hostel Block 4, Room 302, Campus North",
        created_at=now - datetime.timedelta(days=1, hours=2)
    )
    db.add(order1)
    db.flush()

    db.add(models.OrderItem(order_id=order1.id, item_name="Hyderabadi Dum Chicken Biryani", quantity=2, unit_price=249.0))
    db.add(models.OrderItem(order_id=order1.id, item_name="Gulab Jamun (2 Pcs)", quantity=1, unit_price=69.0))
    db.add(models.PaymentLedger(order_id=order1.id, transaction_type="payment", amount=625.0, status="mock_paid"))
    db.add(models.Review(order_id=order1.id, customer_id=u_customer.id, rating=5, comment="Arrived steaming hot! The biryani flavor was outstanding."))

    # Order 2: PLACED > 20 mins ago (triggers idle reminder background task)
    order2 = models.Order(
        customer_id=u_customer.id,
        restaurant_id=r1.id,
        status="PLACED",
        payment_status="mock_paid",
        subtotal=357.0,
        delivery_fee=25.0,
        taxes=18.0,
        total=400.0,
        delivery_address="Hostel Block 4, Room 302, Campus North",
        created_at=now - datetime.timedelta(minutes=22)
    )
    db.add(order2)
    db.flush()

    db.add(models.OrderItem(order_id=order2.id, item_name="Paneer Butter Masala", quantity=1, unit_price=199.0))
    db.add(models.OrderItem(order_id=order2.id, item_name="Garlic Butter Naan (2 Pcs)", quantity=2, unit_price=79.0))
    db.add(models.PaymentLedger(order_id=order2.id, transaction_type="payment", amount=400.0, status="mock_paid"))
    db.add(models.AdminReminderLog(order_id=order2.id, status="PLACED", idle_minutes=22, message="Order #" + str(order2.id) + " has been in PLACED status for more than 15 minutes! Please update preparation status."))

    # Order 3: READY for driver assignment
    order3 = models.Order(
        customer_id=u_customer.id,
        restaurant_id=r1.id,
        status="READY",
        payment_status="mock_paid",
        subtotal=418.0,
        delivery_fee=25.0,
        taxes=21.0,
        total=464.0,
        delivery_address="Hostel Block 4, Room 302, Campus North",
        created_at=now - datetime.timedelta(minutes=35)
    )
    db.add(order3)
    db.flush()

    db.add(models.OrderItem(order_id=order3.id, item_name="Hyderabadi Dum Chicken Biryani", quantity=1, unit_price=249.0))
    db.add(models.OrderItem(order_id=order3.id, item_name="Dal Makhani Bowl", quantity=1, unit_price=169.0))
    db.add(models.PaymentLedger(order_id=order3.id, transaction_type="payment", amount=464.0, status="mock_paid"))

    # Order 4: ASSIGNED to delivery partner Rohan
    order4 = models.Order(
        customer_id=u_customer.id,
        restaurant_id=r1.id,
        delivery_partner_id=u_delivery1.id,
        status="ASSIGNED",
        payment_status="mock_paid",
        subtotal=635.0,
        delivery_fee=30.0,
        taxes=32.0,
        total=697.0,
        delivery_address="Hostel Block 4, Room 302, Campus North",
        created_at=now - datetime.timedelta(minutes=45)
    )
    db.add(order4)
    db.flush()

    db.add(models.OrderItem(order_id=order4.id, item_name="Paneer Butter Masala", quantity=2, unit_price=199.0))
    db.add(models.OrderItem(order_id=order4.id, item_name="Garlic Butter Naan (2 Pcs)", quantity=3, unit_price=79.0))
    db.add(models.PaymentLedger(order_id=order4.id, transaction_type="payment", amount=697.0, status="mock_paid"))

    # Order 5: DELIVERED with pending refund request
    order5 = models.Order(
        customer_id=u_customer.id,
        restaurant_id=r2.id,
        delivery_partner_id=u_delivery1.id,
        status="DELIVERED",
        payment_status="mock_paid",
        subtotal=735.0,
        delivery_fee=25.0,
        taxes=37.0,
        total=797.0,
        delivery_address="Hostel Block 4, Room 302, Campus North",
        return_reason="Fries were cold and soggy upon arrival due to rain delay.",
        return_status="pending",
        return_requested_at=now - datetime.timedelta(hours=5),
        created_at=now - datetime.timedelta(hours=6)
    )
    db.add(order5)
    db.flush()

    db.add(models.OrderItem(order_id=order5.id, item_name="Crispy Spicy Chicken Burger", quantity=2, unit_price=179.0))
    db.add(models.OrderItem(order_id=order5.id, item_name="Peri-Peri Loaded Fries", quantity=1, unit_price=119.0))
    db.add(models.OrderItem(order_id=order5.id, item_name="Iced Hazelnut Latte", quantity=2, unit_price=129.0))
    db.add(models.PaymentLedger(order_id=order5.id, transaction_type="payment", amount=797.0, status="mock_paid"))

    db.commit()
    print("✅ CampusBite seed data initialized successfully.")
