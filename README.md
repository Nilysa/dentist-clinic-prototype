# DentOS React Prototype

This is the polished, feature-first prototype for the Dental Clinic Management System.

## Run

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Build / Present

```bash
npm run build
npm run preview
```

Open the local preview URL shown by Vite. If you want to open `dist/index.html` directly by double-clicking it, `vite.config.ts` sets `base: "./"` so built assets use relative paths.

## Demo Flow

1. Login as `Secretary`.
2. Add a new appointment from the dashboard.
3. Open `Appointments` and click a patient row to move status from waiting to in-room to completed.
4. Open `Patients` and review medical alerts and treatment history.
5. Switch role to `Dentist`, save a clinical note and prescription.
6. Switch role to `Manager`, review reports and toggle staff access.
7. Switch role to `Patient`, request an appointment.
8. Open `Notifications` to send reminder messages.

## Prototype Notes

- Data is fake and stored in React state for the current browser session.
- Actions update shared data across screens.
- The visual style follows the Framer mockups in `framer-images`.
- This is intentionally product-focused, not Jira/story-focused.
