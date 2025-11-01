Perfect ✅ — here’s a **clean, one-line-per-task checklist** of **everything you need to do** on the existing **Singhours React Native app**, based on both specification files.
You can directly copy this list into Trello, Notion, or GitHub issues for tracking.

---

### 🔧 **SINGHOURS PRO APP — TASK TRACKER LIST**

#### 🧩 Dashboard

1. Remove all fake or test reservation data from the dashboard.
2. Connect the “Prochaine réservation” section to Supabase to display real upcoming reservations.
3. Display only bookings where the date is in the future and status is confirmed or pending.
4. Add an empty state (“Aucune réservation à venir”) when no bookings exist.

---

#### 🗓️ Calendar (Blocage d’horaires)

5. Implement manual blocking of specific hours (red = blocked, green = available).
6. Ensure blocked hours are hidden or unbookable by clients.
7. Display only working hours (e.g., 9h–12h / 13h–23h or 9h–3h) in the calendar view.
8. Allow professionals to block individual hours inside those time ranges.
9. Add option to sync Google Calendar events and mark them as blocked (red).

---

#### 📅 Reservation System

10. Connect the reservation system to Supabase instead of static JSON data.
11. Fetch and display reservations grouped by status: “En attente”, “Confirmées”, “Nouvelles”.
12. Add buttons for professionals to confirm or reject reservations.
13. Ensure all booking updates are written back to the Supabase database.

---

#### 👤 Professional Profile

14. Add feature for user to upload or change profile photo.
15. Save uploaded profile photo URLs to Supabase storage and database.
16. Ensure profile edits (name, phone, etc.) correctly update in Supabase.
17. Add Google Maps or similar API for saving professional’s address and location.
18. Add a visible “Online/Offline” status toggle on the dashboard (not only inside profile edit).
19. Fetch and display real client reviews and average rating from Supabase.
20. Add a photo gallery (portfolio) where professionals can upload work images.

---

#### ⚙️ Settings / Paramètres

21. Add input fields for RIB, BIC, and fiscal information.
22. Connect payment info form to Supabase for saving and retrieving data.
23. Integrate PayPal API for professional account linking or payments.
24. Implement optional 3D Secure payment support (via PayPal or Stripe).
25. Enable notification system when a new client booking is made.

---

#### 💾 Data Saving & Connections

26. Verify that all app data (profile, reservations, availability, etc.) is saved in correct Supabase tables.
27. Fix “Modify”, “Add”, “Logout”, “Sign Up”, and “Login” buttons that don’t currently work.
28. Add Google login functionality on the authentication screen.
29. Add Apple login option (optional, if required by client).
30. Add a “Call” button on login or contact screen to initiate calls to clients.

---

#### 🔔 Notifications

31. Set up push notification system (Expo or FCM) for new reservations.
32. Send notification to professionals when a client books a slot.
33. Save notification logs in a Supabase `notifications` table.

---

#### 🧠 Backend/Database Validation

34. Create or verify Supabase tables: `reservations`, `availability`, `profiles`, `payments`, `portfolio`, `reviews`, and `notifications`.
35. Ensure relationships and data types match app usage (IDs, timestamps, status).
36. Test all Supabase insert/update/delete operations from the app.

---

#### 💄 UI/UX Adjustments

37. Replace all placeholder texts or demo images with live data-driven components.
38. Standardize button designs and color codes (red = blocked, green = available).
39. Add loading states for all API calls (bookings, profile, payments).
40. Add error handling and alert messages for failed Supabase requests.

---

Would you like me to **label these 40 tasks by priority** (High / Medium / Low) and estimate how long each might take (in hours or days) — so you can plan what to work on first and track progress efficiently?
