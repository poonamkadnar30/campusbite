from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

@router.post("/register", response_model=schemas.TokenResponse)
def register(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    """Registers a new user with bcrypt password hashing and returns an access token."""
    restaurant_name = (user_in.restaurantName or "").strip()
    if user_in.role == "restaurant_owner" and (not restaurant_name or not user_in.address):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Restaurant owners must provide a restaurant name and location.",
        )

    existing_user = db.query(models.User).filter(models.User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    hashed_pw = get_password_hash(user_in.password)
    new_user = models.User(
        name=user_in.name,
        email=user_in.email.lower(),
        hashed_password=hashed_pw,
        role=user_in.role,
        phone=user_in.phone,
        address=user_in.address,
    )
    db.add(new_user)
    db.flush()

    restaurant = None
    if new_user.role == "restaurant_owner":
        restaurant = models.Restaurant(
            owner_id=new_user.id,
            name=restaurant_name,
            cuisine="Other",
            address=user_in.address,
        )
        db.add(restaurant)

    db.commit()
    db.refresh(new_user)
    if restaurant:
        db.refresh(restaurant)

    token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role})

    user_out = schemas.UserOut(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role,
        phone=new_user.phone,
        address=new_user.address,
        restaurantId=restaurant.id if restaurant else None,
        restaurantName=restaurant.name if restaurant else None,
    )
    return {"token": token, "user": user_out}

@router.post("/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticates email and bcrypt password, returning a signed JWT token."""
    user = db.query(models.User).filter(models.User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role})

    # Find associated restaurant if owner
    restaurant = None
    if user.role == "restaurant_owner":
        restaurant = db.query(models.Restaurant).filter(models.Restaurant.owner_id == user.id).first()

    user_out = schemas.UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        phone=user.phone,
        address=user.address,
        restaurantId=restaurant.id if restaurant else None,
        restaurantName=restaurant.name if restaurant else None,
    )
    return {"token": token, "user": user_out}

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns the authenticated user details according to their JWT Bearer token."""
    restaurant = None
    if current_user.role == "restaurant_owner":
        restaurant = db.query(models.Restaurant).filter(models.Restaurant.owner_id == current_user.id).first()

    return schemas.UserOut(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        phone=current_user.phone,
        address=current_user.address,
        restaurantId=restaurant.id if restaurant else None,
        restaurantName=restaurant.name if restaurant else None,
    )
