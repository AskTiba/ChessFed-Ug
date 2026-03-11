"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide Footer on specific full-screen pages
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminPage = pathname?.startsWith("/admin");
  
  if (isAuthPage || isAdminPage) return null;

  return (
    <footer className="py-16 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <span className="text-2xl font-bold tracking-tighter text-zinc-900 dark:text-white">
              ♟️ ChessFed<span className="text-blue-600">UG</span>
            </span>
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed italic">
              The official digital hub for the Uganda Chess Federation. Dedicated to excellence, transparency, and the growth of chess talent across the nation.
            </p>
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-white mb-6">Federation</h4>
            <ul className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400">
              <li><Link href="/tournaments" className="hover:text-blue-600 transition-colors">Calendar</Link></li>
              <li><Link href="/grand-prix" className="hover:text-blue-600 transition-colors">Grand Prix</Link></li>
              <li><Link href="/rankings" className="hover:text-blue-600 transition-colors">National Rankings</Link></li>
              <li><Link href="/league" className="hover:text-blue-600 transition-colors">League Standings</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-white mb-6">Operations</h4>
            <ul className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400">
              <li><Link href="/clubs" className="hover:text-blue-600 transition-colors">Clubs Directory</Link></li>
              <li><Link href="/admin" className="hover:text-blue-600 transition-colors">Admin Oversight</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">Member Portal</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center md:text-left font-medium">
            © 2026 Chess Federation Uganda. Built by Anthony Ngisiro.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-xs font-bold text-zinc-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Twitter</Link>
            <Link href="#" className="text-xs font-bold text-zinc-400 hover:text-blue-600 transition-colors uppercase tracking-widest">GitHub</Link>
            <Link href="/admin" className="text-xs font-bold text-zinc-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Federation Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
