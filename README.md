# 🍔 CampusBite - Restaurant Ordering & Delivery Platform

CampusBite is a full-stack restaurant ordering and delivery application developed for university campus environments. It features strict **Role-Based Access Control (RBAC)** across three personas (**Customers**, **Restaurant Owners**, and **Delivery Partners**), a 7-stage order lifecycle state machine, dummy payment processing, customer return/refund workflows, background reminders for idle orders, and **AI-powered order insights** using the OpenAI API.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js (18+), JavaScript (ES6+), React Hooks (`useState`, `useEffect`, `useContext`, `useRef`), React Router DOM (v6), Custom SVG Icon Architecture, Responsive CSS |
| **Backend** | Python 3.11, FastAPI, Pydantic (v2), SQLAlchemy ORM, Uvicorn, Python-Jose (JWT), Passlib (Bcrypt) |
| **Database** | SQL Relational Database (SQLite / PostgreSQL compatible) managed via SQLAlchemy models |
| **AI Integration**| OpenAI API (`gpt-3.5-turbo` / `gpt-4o-mini`) with contextual order history prompt engineering |
| **Containerization**| Docker, Dockerfile, Docker Compose |
| **Version Control**| Git & GitHub |

---

## ✨ Features Implemented

### 1. Multi-Role Authentication & Access Control (RBAC)
- Password hashing using **`bcrypt`** and **JWT Bearer token authentication**.
- Strict role scoping across 3 personas:
  - **Customer** (`customer@campusbite.com`)
  - **Restaurant Owner** (`owner@campusbite.com`)
  - **Delivery Partner** (`delivery@campusbite.com`)
- Frontend Protected Routes (`ProtectedRoute.jsx`) and backend authorization dependencies (`require_customer`, `require_owner`, `require_delivery`).
- Automatic JWT token persistence in `localStorage` and request header injection (`Authorization: Bearer <token>`).

### 2. Customer Workflow
- **Restaurant Discovery & Menus**: Search eateries by name, cuisine, or campus location; filter dishes by category and price range.
- **Cart Management**: Single-restaurant validation, real-time quantity adjustments, subtotal, ₹25 delivery fee, and 5% taxes calculation.
- **Dummy Payment System (PRD Section 5)**: Simulated payment options setting order status to `mock_paid` and recording entries in `payment_ledger`.
- **7-Stage Order Lifecycle Tracking**: Visual step progress tracking:
  $$\text{PLACED} \rightarrow \text{ACCEPTED} \rightarrow \text{PREPARING} \rightarrow \text{READY} \rightarrow \text{ASSIGNED} \rightarrow \text{OUT\_FOR\_DELIVERY} \rightarrow \text{DELIVERED}$$
- **Order Cancellation**: Allowed **only** when an order is in `PLACED` status.
- **Ratings & Reviews**: 1–5 star ratings and written reviews allowed **only** for `DELIVERED` orders.
- **Return & Refund Requests**: Reason submission for delivered orders; prevents duplicate requests.
- **Applied AI Order Insights (PRD Section 7)**: Conversational chat assistant providing instant order summaries, active pending delivery tracking, weekly expenditure calculations, and favorite dish highlights based on actual database records.

### 3. Restaurant Owner Workflow
- **Dashboard & Statistics**: Real-time metrics for Total Revenue, Total Orders, Active Kitchen Pipeline, and Pending Return Disputes.
- **Background Task Reminders (PRD Section 8)**: Automated background detection alerting owners of orders in `PLACED` or `ACCEPTED` status for >15 minutes.
- **Order Lifecycle Controls**: Step-by-step kitchen status transitions (`Accept Order` ➔ `Start Preparing` ➔ `Mark Ready`).
- **Delivery Partner Assignment**: Assigns available campus riders when orders reach `READY` status.
- **Return / Refund Dispute Handling**: Ability to approve (updates order and payment to `refunded`) or reject return requests.
- **Menu Management**: Full CRUD operations to add, edit, or delete dishes, adjust pricing, and toggle dish availability (`Available` vs `Unavailable`).

### 4. Delivery Partner Workflow
- **Assigned Deliveries View**: Strictly scoped view displaying only deliveries assigned to the logged-in rider.
- **Customer Delivery Details**: View student phone numbers, drop-off hostel locations, and package items.
- **Two-Step Delivery Progression**:
  - `ASSIGNED` ➔ `OUT_FOR_DELIVERY` (Pickup from kitchen)
  - `OUT_FOR_DELIVERY` ➔ `DELIVERED` (Drop-off confirmation)
- **Delivery History & Pagination**: Paginated delivery history records.

### 5. Backend Middleware (PRD Section 8)
- Middleware logs all incoming HTTP methods and route paths.
- Execution time tracking adding an `X-Process-Time` header to every response.

---

## 🗄️ Database Architecture (SQLAlchemy ORM)

The relational database models are organized into 8 distinct tables:
1. **`users`**: User credentials, role (`customer`, `restaurant_owner`, `delivery_partner`), bcrypt hash, contact details.
2. **`restaurants`**: Name, cuisine, rating, delivery time, min order, address, description, owner foreign key.
3. **`menu_items`**: Dish name, description, category, price, image, availability status, restaurant foreign key.
4. **`orders`**: Customer ID, restaurant ID, delivery partner ID, lifecycle status, payment status, total, delivery address, timestamps.
5. **`order_items`**: Line items with menu item references, quantities, and unit prices.
6. **`reviews`**: 1-to-1 relationship with delivered orders storing rating (1-5) and customer feedback.
7. **`payment_ledger`**: Complete ledger tracking dummy payments (`mock_paid`) and refunds (`refunded`).
8. **`admin_reminder_logs`**: Logs for orders idle for >15 minutes in `PLACED` or `ACCEPTED` status.

---

## 🚀 Instructions to Run the Application

### Method 1: Run the Backend with Docker Compose (Recommended)

1. Make sure **Docker** and **Docker Compose** are installed and running.
2. Clone the repository and navigate to the project root:
   ```bash
   cd Capstone
   ```
3. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Build and start the containerized backend:
   ```bash
   docker-compose up --build -d
   ```
5. Verify the backend container is healthy:
   ```bash
   docker ps
   ```
   The backend API will be live at:
   - **REST API Base**: `http://localhost:8000/api`
   - **Interactive Swagger Documentation**: `http://localhost:8000/docs`
   - **Alternative ReDoc Documentation**: `http://localhost:8000/redoc`

---

### Method 2: Run the Backend Locally with Python

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd Capstone/backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server using Uvicorn:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *Note: On first startup, the database tables and demo seed records will be generated automatically.*

---

### Instructions to Run the Frontend Locally

1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd Capstone/frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Copy the frontend environment file:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite React development server:
   ```bash
   npm run dev
   ```
5. Open your web browser at:
   ```
   http://localhost:3000
   ```

*(Alternatively, you can double-click `frontend/preview.html` to run the frontend in any web browser without needing Node.js installed).*

---

## 🔑 Demo Account Credentials

| Role | Email | Password | Persona |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@campusbite.com` | `pass123` | Aarav Sharma |
| **Restaurant Owner** | `owner@campusbite.com` | `pass123` | Priya Patel (Campus Spice Hub) |
| **Delivery Partner** | `delivery@campusbite.com` | `pass123` | Rohan Verma |
| **Delivery Partner 2**| `vikram.delivery@campusbite.com` | `pass123` | Vikram Singh |

---

## 📡 API Documentation Details

FastAPI automatically generates interactive OpenAPI documentation:
- **Swagger UI**: Visit [http://localhost:8000/docs](http://localhost:8000/docs) to test all endpoints interactively with authentication tokens.
- **ReDoc**: Visit [http://localhost:8000/redoc](http://localhost:8000/redoc) for standard specification reference.

Key API route groups:
- `/api/auth/*` : User registration, login, and profile fetching.
- `/api/restaurants/*` : Restaurant listings, menus, owner statistics, and idle order reminders.
- `/api/menu-items/*` : Dish CRUD operations and availability toggles.
- `/api/orders/*` : Order placement, status transitions, cancellations, and driver assignments.
- `/api/orders/{id}/review` : Star rating and customer review submissions.
- `/api/orders/{id}/return*` : Customer return requests and owner approval/rejection handling.
- `/api/delivery-partners` : Active delivery partner listings.
- `/api/ai/insights` : AI conversational queries with customer order context.
- `/api/health` : Health check endpoint.
