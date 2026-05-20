"use client";

import { useState, useEffect } from "react";

interface YearWheelPickerProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  years?: string[];
}

export default function YearWheelPicker({
  selectedYear,
  onYearChange,
  years = ["2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027"],
}: YearWheelPickerProps) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = years.indexOf(selectedYear);
    return idx !== -1 ? idx : years.indexOf("2026");
  });

  useEffect(() => {
    const idx = years.indexOf(selectedYear);
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
  }, [selectedYear, years]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      const nextIdx = currentIndex - 1;
      setCurrentIndex(nextIdx);
      onYearChange(years[nextIdx]);
    }
  };

  const handleNext = () => {
    if (currentIndex < years.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      onYearChange(years[nextIdx]);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handlePrev();
    } else if (e.deltaY > 0) {
      handleNext();
    }
  };

  const prevYearValue = currentIndex > 0 ? years[currentIndex - 1] : null;
  const activeYearValue = years[currentIndex];
  const nextYearValue = currentIndex < years.length - 1 ? years[currentIndex + 1] : null;

  return (
    <div className="flex flex-col items-center justify-center bg-zinc-900/90 dark:bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-3 w-36 shadow-2xl relative overflow-hidden backdrop-blur-2xl select-none group">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-blue-600/10 opacity-50 pointer-events-none"></div>

      {/* Up Arrow Button */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className="text-zinc-500 hover:text-white disabled:opacity-20 transition-colors py-1 w-full flex justify-center cursor-pointer active:scale-95"
        title="Previous Year"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Wheel Container */}
      <div
        onWheel={handleWheel}
        className="flex flex-col items-center my-2 space-y-2.5 w-full cursor-ns-resize py-1"
        title="Scroll or Click to change year"
      >
        {/* Previous Year (Dimmed) */}
        <div
          onClick={handlePrev}
          className={`text-xs font-bold text-zinc-600 dark:text-zinc-500 hover:text-zinc-400 cursor-pointer transition-all transform scale-90 ${
            !prevYearValue ? "opacity-0 pointer-events-none" : ""
          }`}
        >
          {prevYearValue || "—"}
        </div>

        {/* Active Year (Glowing, Large) */}
        <div className="text-xl font-black text-white bg-blue-600/20 border border-blue-500/40 px-5 py-1.5 rounded-2xl shadow-lg shadow-blue-500/20 transform scale-110 transition-all flex items-center gap-1.5">
          <span>{activeYearValue}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
        </div>

        {/* Next Year (Dimmed) */}
        <div
          onClick={handleNext}
          className={`text-xs font-bold text-zinc-600 dark:text-zinc-500 hover:text-zinc-400 cursor-pointer transition-all transform scale-90 ${
            !nextYearValue ? "opacity-0 pointer-events-none" : ""
          }`}
        >
          {nextYearValue || "—"}
        </div>
      </div>

      {/* Down Arrow Button */}
      <button
        type="button"
        onClick={handleNext}
        disabled={currentIndex === years.length - 1}
        className="text-zinc-500 hover:text-white disabled:opacity-20 transition-colors py-1 w-full flex justify-center cursor-pointer active:scale-95"
        title="Next Year"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
