# Dental Clinic & Hospital Appointment Booking System

A premium, full-stack dental clinic appointment booking system featuring real-time WhatsApp confirmations, role-based dashboards, and a robust slot-generation engine.

## 🏗 Project Structure

```text
/
├── backend/                  # Node.js, Express, Prisma, PostgreSQL
│   ├── prisma/
│   │   └── schema.prisma     # Database models (PostgreSQL)
│   ├── src/
│   │   ├── middlewares/      # Auth & Error handling
│   │   ├── routes/           # REST APIs (Auth, Doctors, Patients, Appointments, Webhook)
│   │   ├── services/         # WhatsApp integration (Dev & Prod modes)
│   │   ├── utils/            # Prisma client instance
│   │   └── index.ts          # Main Express application
│   ├── .env.example          # Environment variables template
│   └── package.json          
│
├── frontend/                 # React, Vite, Tailwind CSS, React Router
│   ├── src/
│   │   ├── api/              # Axios client wrapper
│   │   ├── components/       # Reusable UI components (shadcn inspired)
│   │   ├── layouts/          # Root layout with premium navbar
│   │   ├── pages/            # Home, BookAppointment, etc.
│   │   ├── App.tsx           # React Router definition
│   │   └── index.css         # Tailwind global styles
│   ├── tailwind.config.js    # Tailwind theme configuration
│   └── package.json          
└── README.md
```

## 🛠 Technologies Used
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Lucide React, Axios, date-fns.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, JSON Web Tokens (JWT), bcryptjs.
- **Database**: PostgreSQL (Designed for robust transactional safety against double-booking).
- **Integrations**: WhatsApp Business Cloud API (with localized `DEVELOPMENT` mock mode).

## 🗄 Database Schema Summary
- **User / ProfilePatient / ProfileDoctor**: Separated base credentials from role-specific profiles.
- **Service & Clinic**: Configurable dental services and clinic details.
- **DoctorAvailability & DoctorBreak**: Defines working hours and breaks for dynamic slot generation.
- **Appointment**: Core table holding state (`PENDING_CONFIRMATION`, `CONFIRMED`, `CANCELLED`), timestamps, and relationships. Enforces unique constraints on `[doctorId, date, startTime]` to prevent double-booking at the database level.

## 🔌 API Summary
- `POST /api/auth/register` & `/login`: JWT Authentication.
- `GET /api/doctors`: Public directory listing.
- `GET /api/appointments/available-slots`: Dynamically calculates available slots by subtracting breaks and existing appointments from base availability.
- `POST /api/appointments/book`: Secure transactional endpoint to book a slot.
- `POST /api/webhooks/whatsapp`: Receives confirmation/cancellation from WhatsApp interactive buttons.

## 💬 WhatsApp Integration Flow
1. Patient books via the frontend wizard.
2. Backend creates appointment as `PENDING_CONFIRMATION`.
3. `WhatsAppService` sends an Interactive Button Message to the patient's phone.
4. Patient clicks "Confirm" or "Cancel" in WhatsApp.
5. WhatsApp sends a webhook to `POST /api/webhooks/whatsapp`.
6. Backend updates the appointment status in the database.

> **Note on WhatsApp Modes:**
> In `.env`, setting `WHATSAPP_MODE="DEVELOPMENT"` bypasses real API calls and prints the mock payload to the backend console. You can manually trigger the webhook endpoint using Postman to simulate a patient replying. To go live, change to `"PRODUCTION"` and fill in the credentials.

## 🚀 How to Run Locally

### 1. Database Setup
Ensure you have **PostgreSQL** installed and running locally, or use a hosted solution like Supabase.
Create a database (e.g., `dental_clinic`).

### 2. Backend Setup
1. Open a terminal and navigate to the backend:
   ```bash
   cd backend
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your details:
   ```bash
   DATABASE_URL="postgresql://postgres:password@localhost:5432/dental_clinic?schema=public"
   ```
3. Push the schema to your database:
   ```bash
   npx prisma db push
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *(Ensure you have a dev script in package.json using `tsx watch src/index.ts` or `nodemon`)*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser to `http://localhost:5173`.

## 🧪 Testing the Flow
1. **Seed**: You will need to manually insert at least one Doctor, one Service, and Doctor Availability into the database to test booking.
2. **Register**: Create a patient account via the API or a frontend form (if built).
3. **Book**: Use the multi-step booking wizard to select a slot.
4. **Confirm**: Check the backend console (in Development mode) to see the WhatsApp payload. Send a POST request to `/api/webhooks/whatsapp` with the mocked payload to simulate a confirmation.
