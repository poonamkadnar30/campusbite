# 🍔 CampusBite - Frontend Application

CampusBite is a full-stack campus restaurant ordering and delivery application built with **React.js**, **React Router DOM**, and **React Hooks**, featuring strict Role-Based Access Control (RBAC), a 7-stage order lifecycle, dummy payment processing, customer return/refund workflows, background reminders, and AI-powered order insights.

---

## 🚀 Key Features Implemented

### 1. Multi-Role Authentication & Access Control (RBAC)
- **Role Support**:
  - **Customer** (`customer@campusbite.com`)
  - **Restaurant Owner** (`owner@campusbite.com`)
  - **Delivery Partner** (`delivery@campusbite.com`)
- **Protected Routes**: Frontend routing enforces role constraints (`ProtectedRoute.jsx`), preventing unauthorized URL visits.
- **Demo Quick-Switcher Bar**: 1-click persona switcher fixed at the top of the app to easily grade and test all 3 roles without manual logouts.
- **JWT Persistence**: Tokens saved in `localStorage` and sent with protected API requests.

### 2. Customer Features
- **Restaurant Discovery**: Search restaurants by name, cuisine, or campus location with real-time filtering.
- **Interactive Menus**: Filter dishes by category and price range (e.g. Under ₹150, ₹150–₹250, Above ₹250).
- **Cart & Sticky Tray**: Real-time quantity adjustments, cart calculations (subtotal, ₹25 delivery fee, 5% tax), and validation preventing mixing items from different restaurants.
- **Dummy Payment System (PRD Section 5)**: Simulated payment options (Mock Smart Card / UPI) setting order status to `mock_paid` without external gateways.
- **Order Lifecycle Progress Bar**: Real-time step progress visualizer tracking all 7 states:
  `PLACED` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `READY` ➔ `ASSIGNED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`
- **Cancellation**: Orders can be cancelled by customers **only** in `PLACED` status.
- **Reviews & Ratings**: Star rating (1–5) and feedback submissions for `DELIVERED` orders.
- **Return & Refund Requests**: Reason submission for `DELIVERED` orders with single-request validation.
- **Applied AI Order Insights (PRD Section 7)**: Interactive conversational assistant with preset chips:
  - *"Summarize my last five orders."*
  - *"Which of my orders are still not delivered?"*
  - *"How much did I spend this week?"*
  - *"Which food items have I ordered most frequently?"*

### 3. Restaurant Owner Features
- **Statistics Dashboard**: Live overview of Total Revenue, Orders count, Active Kitchen pipeline, and Pending Refund Disputes.
- **Background Task Reminders (PRD Section 8)**: Highlights orders in `PLACED` or `ACCEPTED` status for >15 minutes.
- **Kitchen Lifecycle Management**: Step-by-step order actions (`Accept Order`, `Start Preparing`, `Mark Ready`).
- **Delivery Partner Assignment**: Modal dropdown to assign campus riders once orders are `READY`.
- **Return / Refund Dispute Handling**: Manager can approve (marks order as `REFUNDED` and payment as `refunded`) or reject refund requests.
- **Menu Management**: Add, update, delete dishes, adjust pricing, and toggle item availability (`Available` vs `Unavailable`).

### 4. Delivery Partner Features
- **Assigned Deliveries View**: Strict scoping showing only deliveries assigned to the logged-in rider.
- **Customer & Destination Details**: Access to student phone numbers, hostel room drops, and order packages.
- **Two-Step Delivery Progression**:
  - `ASSIGNED` ➔ `OUT_FOR_DELIVERY` (Pickup from eatery)
  - `OUT_FOR_DELIVERY` ➔ `DELIVERED` (Drop-off completion)
- **Delivery History & Pagination**: Paginated log of completed campus runs.

---

## 🛠️ Technology Stack

- **React.js 18+** (Functional Components, Hooks: `useState`, `useEffect`, `useContext`, `useRef`)
- **React Router DOM 6+** (Dynamic routing, nested routes, navigation guards)
- **Custom Design System**: Modular CSS with responsive breakpoints and zero external icon library baggage (`Icons.jsx` SVG architecture).
- **Vite 5**: Blazing fast bundler and dev server.

---

## 💻 How to Run the Frontend Locally

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or pnpm or yarn

### Steps
1. Navigate to the `frontend` directory:
   ```bash
   cd Capstone/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open your browser at:
   ```
   http://localhost:3000
   ```

---

## 🌐 Instant Zero-Install Browser Preview

For immediate demonstration or grading before Node.js/FastAPI containers are started, you can double-click or open `preview.html` in any web browser (Chrome, Edge, Firefox, Safari). It provides the complete interface with full role-switching and live state simulation!

---

## 🔑 Demo Account Credentials

| Role | Email | Password | Persona |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@campusbite.com` | `pass123` | Aarav Sharma |
| **Restaurant Owner** | `owner@campusbite.com` | `pass123` | Priya Patel (Campus Spice Hub) |
| **Delivery Partner** | `delivery@campusbite.com` | `pass123` | Rohan Verma |
