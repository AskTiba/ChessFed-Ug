# Global Search Implementation Deep Dive

This guide explains the **Dual-State Pattern** used in this project to create high-performance, cached global search functionality. Use this if your implementation is not triggering correctly or is behaving unexpectedly.

---

## 1. The Core Problem
Most search implementations fail because they try to fetch data as the user types (leading to too many API calls) or they don't handle the "empty state" correctly when the component first loads.

## 2. The Solution: Dual-State Pattern

In `FideRankingsPage.tsx`, we separate **what the user is typing** from **what the API is searching for**.

### The Implementation Logic

```tsx
// 1. "Transient" state for the input field (updates every keystroke)
const [searchInput, setSearchInput] = useState("");

// 2. "Locked" state for the actual query (only updates on Submit)
const [submittedId, setSubmittedId] = useState<string | null>(null);

// 3. The Query (React Query / TanStack Query)
const { data, isLoading, isError } = useQuery({
  queryKey: ["search-key", submittedId], // Cache is unique to the submitted value
  queryFn: () => fetchDataById(submittedId!),
  enabled: !!submittedId, // ⚡ CRITICAL: Prevents search from running on page load
});

// 4. The Trigger
const handleSearch = (e: React.FormEvent) => {
  e.preventDefault();
  if (searchInput.trim()) {
    setSubmittedId(searchInput.trim()); // This "activates" the query
  }
};
```

---

## 3. Troubleshooting: Why isn't it working?

If your search is "not working," check these common technical hurdles:

### A. The "Auto-Run" Bug
**Symptoms:** The search runs immediately on page load with an empty ID, causing a 404 error.
**Fix:** You **must** include `enabled: !!submittedId`. This tells TanStack Query: "Do not run this function until `submittedId` has a truthy value."

### B. The "Query Key" Identity
**Symptoms:** You search for ID `123`, then `456`, but the data doesn't update or shows old data.
**Fix:** Ensure the `queryKey` includes the `submittedId`. 
*   ❌ `queryKey: ["search"]` (Static key, won't trigger re-fetch)
*   ✅ `queryKey: ["search", submittedId]` (Dynamic key, triggers re-fetch when ID changes)

### C. Error Handling Strategy
**Symptoms:** The UI just hangs or crashes when a user enters an invalid ID.
**Fix:** Explicitly throw errors in your `fetch` function. `fetch()` does **not** throw on 404s by default.

```tsx
async function fetchDataById(id: string) {
  const response = await fetch(`https://api.example.com/${id}`);
  if (!response.ok) {
    // This message is what appears in (error as Error).message
    throw new Error("Resource not found"); 
  }
  return response.json();
}
```

---

## 4. Professional UI Patterns

### The "Stale While Re-fetching" State
When searching for a second ID, the old data stays on screen while the new data loads. Users might find this confusing. 
**Pro-tip:** Use `isFetching` to show a subtle "Updating..." indicator.

```tsx
<button disabled={isFetching}>
  {isFetching ? <Loader className="animate-spin" /> : "Search"}
</button>
```

### The "Enter to Search" Experience
Always wrap your input in a `<form onSubmit={handleSearch}>`. This ensures the search triggers when the user presses **Enter**, which is standard professional UX behavior.

---

## 5. Quick Reference Template

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export function GlobalSearch() {
  const [input, setInput] = useState("");
  const [queryId, setQueryId] = useState<string | null>(null);

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ['search', queryId],
    queryFn: () => fetch(`https://api.url/${queryId}`).then(res => res.json()),
    enabled: !!queryId,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); setQueryId(input); }}>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button type="submit">Search</button>
      
      {isFetching && <p>Loading...</p>}
      {isError && <p>Error: {error.message}</p>}
      {data && <ResultsView data={data} />}
    </form>
  );
}
```
