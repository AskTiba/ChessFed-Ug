# Technical Deep-Dive: ChessFed Uganda

This document contains detailed explanations of the core systems implemented in this project.

## 🏆 The Grand Prix Point Engine

The Grand Prix is not just a field in the database; it's a cumulative scoring system.
- **Data Model:** We use a `GrandPrixPoint` model that uniquely links a `Player` to a `Tournament`. This prevents duplicate points for the same event.
- **Logic:** Points are weighted by placement (e.g., 10, 8, 6, 4, 2). The `app/grand-prix/page.tsx` performs a server-side aggregation (`reduce`) to calculate real-time season totals.
- **National Selection:** The system identifies the "Top 5" performers, creating a competitive path for international representation.

## 🔐 Authentication & Security

We use **NextAuth.js** with the **Prisma Adapter**.
- **Unified Profile:** A user account (`User`) is linked to a federation profile (`Player`). This ensures that only verified members can track their ELO and GP points.
- **Middleware Protection:** Routes like `/dashboard` and `/admin` are globally protected. If an unauthenticated user tries to access them, they are automatically redirected to the sign-in page.

## ♟️ Database Architecture

The schema is built for a complex federation ecosystem:
- **Relational Integrity:** Tournaments are linked to `Sponsors`, `Officials`, and `Players`.
- **Metadata-Rich:** We store tournament history, prize funds, and registration deadlines to ensure transparency for federation members.

## 🎨 Modern Aesthetic Strategy

The UI uses **Tailwind CSS v4** with a focus on "Elite Professionalism":
- **Parallax & Gradients:** High-impact visuals on the landing page and hero sections.
- **High Contrast:** Strong typography and bold spacing to make national rankings and standings feel official and authoritative.

---
*Maintained by Gemini CLI | Supporting Ugandan Chess Excellence.*
