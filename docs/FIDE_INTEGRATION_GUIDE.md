# FIDE Chess Rankings Integration Guide

This document explains how to implement a high-performance, professional FIDE player rankings and search system using **React**, **TypeScript**, **TanStack Query (React Query)**, and **Tailwind CSS**.

## 1. Reliable Data Sources

FIDE does not provide a free, public REST API for all developers. For this implementation, we use community-maintained mirrors that are fast, support CORS, and update monthly.

| Source | Purpose | URL |
| :--- | :--- | :--- |
| **Fly.io FIDE Mirror** | Federation Rankings (Bulk data) | `https://fide-players.fly.dev/players/players.json` |
| **Lichess FIDE API** | Individual Player Lookup | `https://lichess.org/api/fide/player/{fideId}` |

---

## 2. Professional Tech Stack

### Why TanStack Query?
- **Caching:** FIDE data only updates once a month. React Query caches results locally so navigation is instant.
- **Loading/Error States:** Provides built-in `isLoading`, `isError`, and `isFetching` states.
- **Retry Logic:** Automatically retries failed requests (useful for flaky third-party APIs).
- **Stale Time:** Configured to 1 hour since chess ratings don't change by the minute.

---

## 3. Implementation Steps

### Step A: Configuration (`main.tsx`)
Initialize the `QueryClient` with sensible defaults for slow-changing data.

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 Hour cache
      gcTime: 1000 * 60 * 60 * 24, // 24 Hours garbage collection
      retry: 2,
    },
  },
});

// Wrap the app
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### Step B: Data Interfaces (TypeScript)
Define robust interfaces to handle all time controls and optional player assets.

```typescript
interface PlayerInfo {
  id: number;
  name: string;
  federation: string;
  year: number;
  inactive: boolean;
  standard: number;
  rapid?: number;   // Optional Rapid rating
  blitz?: number;   // Optional Blitz rating
  title?: string;   // FIDE Title (GM, IM, etc.)
  photo?: {
    medium: string; // URL to player photo
  };
}
```

### Step C: Fetching Rankings (Table)
Use `useQuery` to fetch country-specific lists.

```tsx
async function fetchRankings(country: string) {
  const res = await fetch(`https://fide-players.fly.dev/players/players.json?country=${country}&_sort_desc=rating&_size=100`);
  if (!res.ok) throw new Error("API Error");
  const data = await res.json();
  return data.rows;
}

// Inside Component
const { data: players, isLoading } = useQuery({
  queryKey: ["fide-rankings", "UGA"],
  queryFn: () => fetchRankings("UGA"),
});
```

### Step D: Comprehensive Player Search
Use the `enabled` property to trigger searches only when the user submits an ID. Displaying all ratings provides a complete player profile.

```tsx
const { data: player, isFetching } = useQuery({
  queryKey: ["fide-player", submittedId],
  queryFn: () => fetchPlayerById(submittedId!),
  enabled: !!submittedId,
});
```

---

## 4. Key Logic & UI Features

### 1. Filtering Active/Inactive
FIDE uses the `flag` field to indicate status. In the mirror API:
- `flag === "i"`: **Inactive** player.
- `flag !== "i"`: **Active** player.

### 2. Time Control Display
Always provide separate cards or sections for **Standard**, **Rapid**, and **Blitz** ELOs, as players often have significantly different strengths across speeds.

### 3. Conditional Asset Rendering
Check for `photo` and `title` availability before rendering to ensure the UI doesn't break for players without images or titles:
```tsx
{player.photo?.medium && <img src={player.photo.medium} />}
{player.title && <span className="title-badge">{player.title}</span>}
```

---

## 5. UI Best Practices
1.  **Skeleton States:** Use `animate-pulse` during `isLoading`.
2.  **Visual Indicators:** Show a small "Refreshing..." spinner when `isFetching` is true (background update).
3.  **Data Cards:** Group player details into clear, bordered cards for mobile responsiveness.
4.  **Badges:** Use distinct colors for different rating categories (e.g., Blue for Standard, Purple for Rapid, Orange for Blitz).

---

## 6. Maintenance Note
Since these are scraper-based mirrors, the endpoints might occasionally change. If the API returns a 404, check the official FIDE download page to see if their file structure has changed, which usually triggers an update in the community mirrors.
