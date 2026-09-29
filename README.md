# SupportIQ

> **AI-Powered Customer Support Intelligence Dashboard**

SupportIQ is a modern, full-stack customer support intelligence platform. It helps customer support teams analyze support queries, determine customer sentiment and urgency, generate AI-assisted customer responses, manage support ticket queues, and track operational performance through real-time analytics.

---

## 🚀 Features

### 🤖 AI Query Analysis
Analyze customer support queries using AI to automatically extract key metadata:
- **Summary**: Concise recap of the customer's issue.
- **Category**: Classified into `Delivery`, `Payment`, `Refund`, `Product`, `Account`, `Technical`, or `Other`.
- **Intent**: Specific reason for contacting support.
- **Priority**: Urgency level (`Low`, `Medium`, `High`, `Critical`).
- **Sentiment**: Emotional tone (`Positive`, `Neutral`, `Frustrated`, `Angry`).
- **Status**: Default state set to `Pending`.

### ✨ AI Suggested Responses
Generate empathetic, professional, and concise customer support responses tailored to query metadata. Agents can also refine and improve drafted responses with one click.

### 🎫 Ticket Management
- Save analyzed queries directly to the user's ticket database.
- View, search, and filter tickets by category, priority, or status (`Pending` / `Resolved`).
- Inspect ticket details in a full-screen modal view.
- Update ticket status (e.g., mark as `Resolved`).
- Auto-seeds realistic sample tickets on first login for instant evaluation.

### 📊 Analytics Dashboard
Visual interactive charts (powered by Recharts) showing:
- Total, Pending, and Resolved ticket totals.
- Resolution rate percentage.
- Distribution by **Category** (Bar Chart).
- Distribution by **Priority** (Pie Chart).
- Customer **Sentiment** breakdown (Pie Chart).
- Automated Support Insights (Most common category, dominant sentiment, critical action count).

### 📈 Operational Command Center (Dashboard)
- Real-time KPI summary cards.
- **Attention Required** alert cards highlighting `Critical` and `High` priority items.
- Workload resolution progress bars.
- AI-recommended queue focus intelligence.
- Recent 5 support tickets preview.

### 🔐 Authentication & Data Isolation
- JWT-based authentication with 15-minute Access Tokens and 7-day HTTP-Only Cookie Refresh Tokens.
- Password security via `bcrypt` hashing.
- Role-based authorization (`Agent`, `Admin`).
- User profile editing (Name and Email).
- strict user data isolation so tickets belong strictly to the authenticated agent.

---

## 💻 Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Core** | React 19, JavaScript (ESM) | UI framework and state management |
| **Build Tool** | Vite 6 | Lightning-fast HMR dev server & bundler |
| **Styling** | Tailwind CSS v4 | Utility-first CSS engine with `@import "tailwindcss";` |
| **Charts** | Recharts 2 | Responsive SVG data visualization charts |
| **Icons** | Lucide React | Modern vector icon set |
| **Backend Core** | Node.js, Express 5 | RESTful API backend web application |
| **Database** | MongoDB, Mongoose 9 | NoSQL database & ODM schema modeling |
| **AI Integration** | OpenAI Node SDK | GPT-4o-mini completion model for query parsing |
| **Authentication** | JSON Web Token (jsonwebtoken), bcryptjs, cookie-parser | Token-based auth with secure cookie refresh |

---

## 🏗️ System Architecture

```text
                         SupportIQ
                             |
              +--------------+--------------+
              |                             |
          React Frontend              Node.js Backend
              |                             |
       +------+------+                +-----+------+
       |      |      |                |            |
   Dashboard Tickets Analytics     Express      MongoDB
       |      |      |                |
       +------+------+                |
              |                       |
         Analyze Query  <-------------+
              |
         AI Processing
              |
        +-----+------+
        |            |
     OpenAI      Fallback
        |            |
        +-----+------+
              |
       Analysis Result
              |
    +---------+----------+
    |         |          |
 Summary  Priority   Sentiment
    |         |          |
    +---------+----------+
              |
       Save as Ticket
              |
          Analytics
```

---

## ⚡ How the AI Fallback System Works

SupportIQ includes a **dual-layer rule-based fallback system** to guarantee zero downtime and reliable demonstrations even if OpenAI credentials or network connections are unavailable:

1. **Server-Side Fallback (OpenAI Failure / Missing Key)**
   - When the backend receives a query analysis request, it attempts to call OpenAI (`gpt-4o-mini`).
   - If `OPENAI_API_KEY` is absent, invalid, rate-limited, or returns unparseable JSON, the server seamlessly executes a keyword-matching rule engine (`getMockAnalysis`).
   - The response includes `isFallback: true`.

2. **Client-Side Fallback (Network / Server Offline)**
   - If the frontend fails to reach the backend, `Analyze.jsx` catches the network error and runs an internal client-side keyword matching algorithm (`getClientFallbackAnalysis`).
   - Analysis results, suggested responses, and ticket creation remain operational locally.

3. **Visual UI Indicator**
   - Whenever fallback mode is triggered, a small `⚡ Fallback analysis` badge is prominently displayed next to the **AI Analysis** card in the UI so users know a local rule engine processed the request.

---

## 🛠️ Prerequisites, Installation & Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://localhost:27017` (or a MongoDB Atlas connection URI)

### 1. Clone & Setup Project
```bash
git clone https://github.com/your-username/SupportIQ.git
cd SupportIQ-main/SupportIQ-main
```

### 2. Install Dependencies
Install dependencies for both frontend and backend server:

```bash
# Install frontend dependencies
npm install

# Install backend server dependencies
cd server
npm install
cd ..
```

### 3. Environment Configuration
Create a `.env` file inside the `server/` directory:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/supportiq
JWT_SECRET=supportiq_super_secret_key_2026
JWT_REFRESH_SECRET=supportiq_super_refresh_secret_key_2026
OPENAI_API_KEY=sk-your-openai-api-key-here
```

*(Note: `OPENAI_API_KEY` is optional. If left blank, SupportIQ will use the built-in fallback analyzer).*

### 4. Running the Application

Open two terminal windows:

**Terminal 1: Start Backend Server**
```bash
cd server
npm start
```
> Server runs at `http://localhost:5000`

**Terminal 2: Start Frontend Application**
```bash
npm run dev
```
> Client runs at `http://localhost:5173`

### 5. Building for Production
To build the frontend production distribution bundle:

```bash
npm run build
```
Outputs static asset files to the `dist/` folder.

---

## 🔑 Environment Variables

| Variable Name | Required | Purpose | Example / Default |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | Port on which the Express server listens | `5000` |
| `MONGODB_URI` | Required | Connection string for MongoDB instance | `mongodb://127.0.0.1:27017/supportiq` |
| `JWT_SECRET` | Required | Secret key used to sign JWT Access Tokens | `supportiq_super_secret_key_2026` |
| `JWT_REFRESH_SECRET` | Required | Secret key used to sign JWT Refresh Tokens | `supportiq_super_refresh_secret_key_2026` |
| `OPENAI_API_KEY` | Optional | OpenAI API key for live AI completions | `sk-proj-...` |
| `VITE_API_BASE_URL` | Optional | Base URL used by frontend API client | `http://localhost:5000` |

---

## 📜 Available Scripts

### Frontend Scripts (`package.json`)
- `npm run dev`: Starts the Vite development server with HMR.
- `npm run build`: Bundles the React application into `dist/` using Vite.
- `npm run preview`: Serves the production build locally for verification.

### Backend Scripts (`server/package.json`)
- `npm start`: Starts the Express server (`node server.js`).
- `npm run dev`: Starts the Express server with file watching (`node --watch server.js`).

---

## 🔌 API Endpoints Table

### Authentication (`/api/auth`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | Register a new agent account (Rate limited: 15 req/15m) |
| `POST` | `/api/auth/login` | No | Authenticate user; returns Access Token and HTTP-Only cookie |
| `POST` | `/api/auth/refresh` | No | Issue new Access Token using valid Refresh Token |
| `POST` | `/api/auth/logout` | No | Revoke Refresh Token and clear authentication cookie |
| `PUT` | `/api/auth/profile` | Yes | Update user full name and email address |

### AI Analysis (`/api/analyze`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/analyze` | Yes | Analyze query text; returns summary, category, intent, priority, sentiment |
| `POST` | `/api/analyze/response` | Yes | Generate polite AI customer response based on query analysis |
| `POST` | `/api/analyze/improve-response` | Yes | Refine and improve an existing customer response |

### Tickets (`/api/tickets`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tickets` | Yes | Fetch all tickets for authenticated user (auto-seeds if 0) |
| `POST` | `/api/tickets` | Yes | Save analyzed query as a new support ticket |
| `PUT` | `/api/tickets/:id/status` | Yes | Update ticket status (`Pending` or `Resolved`) |

### Dashboard & Analytics (`/api/dashboard`, `/api/analytics`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | No | Server health check status |
| `GET` | `/api/dashboard/stats` | Yes | Fetch KPI summary counts, attention alerts, and recent tickets |
| `GET` | `/api/analytics` | Yes | Fetch category, priority, sentiment distributions & resolution rate |

---

## 📁 Directory Structure

```text
SupportIQ-main/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── .gitignore
├── .env.example
├── README.md
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatCard.jsx
│   │   └── TicketCard.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Analyze.jsx
│   │   ├── Tickets.jsx
│   │   ├── Analytics.jsx
│   │   ├── Settings.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   └── services/
│       └── api.js
└── server/
    ├── server.js
    ├── package.json
    ├── package-lock.json
    ├── .gitignore
    ├── .env
    ├── .env.example
    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── analyticsController.js
    │   ├── analyzeController.js
    │   ├── authController.js
    │   ├── dashboardController.js
    │   └── ticketController.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── rateLimiter.js
    │   └── roleMiddleware.js
    ├── models/
    │   ├── Ticket.js
    │   └── User.js
    └── routes/
        ├── analyticsRoutes.js
        ├── analyzeRoutes.js
        ├── authRoutes.js
        ├── dashboardRoutes.js
        └── ticketRoutes.js
```

---

## 🖼️ Screenshots

> *Placeholder section for interface screenshots*

| View | Preview |
| :--- | :--- |
| **Operational Dashboard** | ![Dashboard Screenshot](https://via.placeholder.com/800x450?text=SupportIQ+Dashboard+View) |
| **AI Query Analysis** | ![Analyze Query Screenshot](https://via.placeholder.com/800x450?text=SupportIQ+AI+Analyze+Query) |
| **Ticket Management** | ![Tickets List Screenshot](https://via.placeholder.com/800x450?text=SupportIQ+Tickets+Management) |
| **Analytics & Insights** | ![Analytics Charts Screenshot](https://via.placeholder.com/800x450?text=SupportIQ+Analytics+Charts) |

---

## 🔮 Future Improvements

- **WebSockets / Real-Time Updates**: Instant ticket creation push notifications for live agent teams.
- **Ticket Assignment**: Assign tickets to specific support agents or departments.
- **Multilingual AI Analysis**: Support language detection and automatic translation for international customer queries.
- **Export Analytics**: Export ticket metrics and reports in PDF or CSV formats.
- **Customer Email Integration**: Direct email ingestion to auto-create tickets from incoming emails.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
