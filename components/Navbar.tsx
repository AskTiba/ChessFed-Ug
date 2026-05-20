"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Hide Navbar on specific full-screen pages
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminPage = pathname?.startsWith("/admin");
  
  if (isAuthPage || isAdminPage) return null;

  const navLinks = [
    { href: "/calendar", label: "Calendar" },
    { href: "/tournaments", label: "Tournaments" },
    { href: "/grand-prix", label: "Grand Prix" },
    { href: "/rankings", label: "Rankings" },
    { href: "/league", label: "League" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-zinc-900 dark:text-white">
              ♟️ ChessFed<span className="text-blue-600">UG</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {status === "loading" ? (
              <div className="w-24 h-9 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-full"></div>
            ) : session?.user ? (
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-blue-600 transition-colors">
                  {session.user.name?.split(' ')[0]}
                </span>
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 border-2 border-transparent group-hover:border-blue-400 transition-all">
                  {session.user.name?.substring(0, 1) || "P"}
                </div>
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
              >
                Member Portal
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-3 text-base font-medium rounded-xl ${
                  pathname === link.href
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 px-3">
              {session?.user ? (
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {session.user.name?.substring(0, 1) || "P"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{session.user.name}</p>
                    <p className="text-xs text-zinc-500">Go to Dashboard</p>
                  </div>
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  className="block w-full text-center px-5 py-3 text-base font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  Member Portal
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
