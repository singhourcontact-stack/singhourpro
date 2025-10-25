Here’s a clear breakdown of all the **work you need to do** on the existing **Singhours React Native app**, based on both the **Specifications_Techniques_SinghoursPro.pdf** and **correctif.md** files:

---

### 🧩 1. Dashboard (Offre Client)

**Goal:** Show real reservation data and clean up placeholders.

* [ ] Connect to **Supabase** and fetch actual upcoming reservations.
* [ ] Display them in the **“Prochaine réservation”** section at the bottom of the dashboard.
* [ ] Remove all dummy or test data currently being displayed.

---

### 🗓️ 2. Calendar / Schedule Blocking (Calendrier professionnel)

**Goal:** Implement full availability and blocking system.

**a. Manual blocking**

* [ ] Allow professionals to **block hours** on specific dates.
* [ ] Blocked hours = **red (unavailable)**.
* [ ] Available hours = **green (default)**.
* [ ] Ensure blocked hours are **not bookable** by clients.

**b. Custom time slots**

* [ ] Show only working-hour ranges (e.g., 9h–12h / 13h–23h or 9h–3h).
* [ ] Allow individual hour blocking inside those ranges.
* [ ] Hide or disable hours outside those ranges.

**c. Google Calendar sync**

* [ ] Integrate with **Google Calendar API** (if feasible).
* [ ] Import existing Google events automatically.
* [ ] Mark imported events as **red (blocked)** in the app.

---

### 📅 3. Reservation System

**Goal:** Link bookings to Supabase and show statuses.

* [ ] Connect reservation logic to **Supabase DB**.
* [ ] Fetch and display bookings by **status**:

  * En attente (pending)
  * Confirmée (confirmed)
  * Nouvelle (new)
* [ ] Ensure all booking data is **live from database**, not static.

---

### 👤 4. Professional Profile

**Goal:** Make profile data dynamic, editable, and synced to Supabase.

**a. Profile picture**

* [ ] Add feature to **upload / change profile photo**.
* [ ] Save photo URLs in Supabase storage + reference in DB.

**b. User information**

* [ ] Ensure all profile fields correctly **save to Supabase**.
* [ ] Add **location system** (Google Maps API or similar).
* [ ] Add **online/offline status toggle** directly on dashboard (below address).
* [ ] Fetch and display **real customer reviews and average rating** from DB.

**c. Portfolio**

* [ ] Add ability for professionals to **upload images** to a portfolio gallery.

---

### ⚙️ 5. Settings / Paramètres

**Goal:** Integrate payment, notifications, and external services.

* [ ] Add payment info fields: **RIB, BIC, fiscal info**.
* [ ] Ensure backend + Supabase tables store these.
* [ ] Integrate with:

  * **PayPal API**
  * **3D Secure payment flow** (and possibly Stripe later).
* [ ] Enable **notification system** when a client books a slot (alert for professional).

---

### 💾 6. Data Saving & Authentication

**Goal:** Make all forms and actions functional.

* [ ] Verify all data saves to correct Supabase tables.
* [ ] Fix buttons that currently don’t work:

  * Modify / Add
  * Logout / Sign up / Login
* [ ] Add **Google Login** integration.
* [ ] Optionally add **Apple Login** (if needed).
* [ ] Add **“Call” button** on login or contact page (if required).

---

### ✅ Summary Table

| Module            | Tasks                                                |
| ----------------- | ---------------------------------------------------- |
| **Dashboard**     | Show upcoming real reservations (Supabase)           |
| **Calendar**      | Manual blocking, custom slots, Google Calendar sync  |
| **Reservations**  | Connect to Supabase, show by status                  |
| **Profile**       | Edit photo/info, toggle online status, add portfolio |
| **Payments**      | Add RIB/BIC/PayPal/3D Secure                         |
| **Notifications** | Alert pros on new reservations                       |
| **Backend/Auth**  | Verify saving, fix buttons, add Google & Apple login |

---