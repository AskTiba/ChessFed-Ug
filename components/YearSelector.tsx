"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function YearSelector({ currentYear }: { currentYear: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const years = ["2026", "2025", "2024", "2023", "2022"];

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("year", year);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-fit">
      {years.map((year) => (
        <button
          key={year}
          onClick={() => handleYearChange(year)}
          className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${
            currentYear === year
              ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
