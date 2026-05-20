"use client";

import { useRouter } from "next/navigation";
import YearWheelPicker from "./YearWheelPicker";

export default function CalendarYearFilter({ initialYear }: { initialYear: string }) {
  const router = useRouter();

  const handleYearChange = (year: string) => {
    router.push(`/calendar?year=${year}`);
  };

  return <YearWheelPicker selectedYear={initialYear} onYearChange={handleYearChange} />;
}
