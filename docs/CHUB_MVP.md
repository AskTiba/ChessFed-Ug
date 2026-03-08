# ♟️ ChessFed UG - MVP Documentation

This document provides a comprehensive overview of the **ChessFed Uganda** MVP, including functional features, the route map, and instructions for navigating the "Simulation Mode" environment.

---

## 🚀 MVP Feature Summary

The MVP is built as a **High-Fidelity Functional Simulation**. While the backend uses a mock Prisma client (`lib/prisma.ts`), all major user flows are technically "closed loops" using Server Actions and revalidation.

### 1. Public Awareness Hub
*   **Dynamic Calendar:** A real-time browseable list of 2026 events with status (Grand Prix, Open, Youth).
*   **Event Portals:** Dedicated pages for every tournament featuring history, prize breakdowns, and official lists.
*   **Grand Prix Engine:** Cumulative leaderboard tracking season-long performance.
*   **National Rankings:** ELO-based rankings across different categories.
*   **Clubs & League:** A directory of all 20+ official Ugandan clubs and the live National League table.

### 2. Member Experience (Member Portal)
*   **Identity Linking:** Players can link their physical FIDE/National ID to their digital account.
*   **Player Dashboard:** Personal hub showing ELO history, GP points, and registered upcoming events.
*   **Profile Editor:** Ability to manage club affiliations and professional bios.
*   **Tournament Entry:** A secure registration flow with validation (deadlines, profile linking, and fee display).

### 3. Federation Operations (Admin/Club)
*   **Federation Oversight:** A command center for officials to track player counts and event status.
*   **Event Initialization:** Form to publish new tournaments directly to the public calendar.
*   **GP Distribution:** Arbiter-controlled engine to broadcast season points after an event concludes.
*   **Club Management:** Captain-level access to manage 12-man rosters (add/remove players).

---

## 🗺️ Route Map & UI Access

Most routes are linked via the navigation bars, but some administrative or specific action routes require direct access or specific context.

### 🌍 Public Routes
| Route | Description | How to Access in UI |
| :--- | :--- | :--- |
| `/` | Landing Page | Main Entry |
| `/tournaments` | Official Calendar | Navbar "Calendar" |
| `/tournaments/[id]` | Event Portal | Click "View Event Portal" on any tournament card |
| `/tournaments/[id]/live` | Live Center | Red "ENTER LIVE CENTER" button inside an Event Portal |
| `/grand-prix` | GP Standings | Navbar "Grand Prix" |
| `/rankings` | National Rankings | Navbar "Rankings" |
| `/clubs` | Clubs Directory | Link in footer or from League page |
| `/clubs/[id]` | Club Public Page | Click "VIEW ROSTER" on any club card |
| `/league` | League Standings | Link from Home or Clubs page |
| `/national-team` | Selection Squad | Linked from Rankings page |

### 👤 Member Routes (Private - requires login)
| Route | Description | How to Access in UI |
| :--- | :--- | :--- |
| `/dashboard` | Member Portal | Navbar "Member Portal" (Blue Button) |
| `/profile/edit` | Profile Editor | Click "Edit Profile" inside the Dashboard |
| `/profile/link` | Profile Linking | Click "Link Record" (if unlinked) in Dashboard or Reg flow |
| `/tournaments/[id]/register` | Registration Flow | "Secure Your Seat" button inside an Event Portal |

### 🛠️ Administrative Routes (Private - Restricted)
| Route | Description | How to Access in UI |
| :--- | :--- | :--- |
| `/admin` | Admin Dashboard | **Direct URL Only** (Federation Secret) |
| `/admin/tournaments/new` | Create Tournament | "+ NEW TOURNAMENT" button in Admin Dashboard |
| `/admin/grand-prix/distribute`| Assign GP Points | Money/Points Icon next to a tournament in Admin Dashboard |
| `/clubs/[id]/manage` | Roster Management | **Direct URL Only** (Restricted to Captains) |

---

## 🧪 Simulation Notes
*   **Authentication:** Uses NextAuth. For simulation, the app assumes an active session for "Anthony Ngisiro" with Player ID "p1".
*   **Persistence:** Changes (adding players, registering for events) are updated in the local component state and logged to the console via Server Actions. To reset the data to the original seed state, simply refresh the browser.
*   **Mock Store:** All base data is managed in `lib/mock-store.ts`.

---
*Built for the Uganda Chess Federation Community.*
