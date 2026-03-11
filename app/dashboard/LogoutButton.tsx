"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
    >
      Sign Out
    </button>
  );
}
