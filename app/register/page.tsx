"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    // Simulation Mode
    setTimeout(() => {
      alert("Account Created Successfully! (Simulation Mode)");
      router.push("/login");
    }, 1500);
  };

  return (
    <div className="h-screen bg-zinc-950 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans text-white">
      {/* BRAND & NATIONAL HARMONY ACCENTS */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black via-yellow-500 to-red-600 z-50"></div>
      
      {/* Background Glows (Blue primary with National Accents) */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-64 h-64 bg-red-600/5 rounded-full blur-[100px]"></div>
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-zinc-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden relative z-10 h-full max-h-[800px]">
        
        {/* LEFT SIDE: THE JOURNEY */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-zinc-900 to-black relative overflow-hidden border-r border-white/5 order-last lg:order-first">
          {/* Subtle Chess Piece watermark */}
          <div className="absolute bottom-[-10%] right-[-10%] text-[30rem] font-black text-white/[0.02] select-none pointer-events-none italic">
            ♚
          </div>
          
          <div className="relative z-10">
            <Link href="/" className="text-3xl font-black tracking-tighter mb-12 block group">
              ♟️ ChessFed<span className="text-blue-500 group-hover:text-red-600 transition-colors">UG</span>
            </Link>
            
            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-tight mb-6">
              Start Your <br />
              <span className="text-blue-500">Legend</span> <br />
              Today.
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-sm italic">
              "A journey of a thousand ELO points begins with a single registration."
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full bg-black border border-zinc-700"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Proudly Ugandan Athletics</span>
            </div>
            
            <div className="pt-8 border-t border-white/5 flex items-center gap-6">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-blue-600/20" />)}
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                 Join 20+ Affiliated Chess Clubs
               </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: THE FORM */}
        <div className="p-8 md:p-16 flex flex-col justify-center bg-black/20 overflow-y-auto">
          <div className="mb-10 lg:hidden text-center">
            <Link href="/" className="text-2xl font-black tracking-tighter">
              ♟️ ChessFed<span className="text-blue-500">UG</span>
            </Link>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4 italic">
              Member Onboarding
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tight mb-2">Join the Federation</h1>
            <p className="text-zinc-500 text-sm font-medium italic">Create your official player record</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Full Legal Name</label>
              <input
                {...register("name")}
                type="text"
                placeholder="e.g. Anthony Ngisiro"
                className={`w-full px-6 py-4 bg-zinc-950 border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-white placeholder:text-zinc-800`}
              />
              {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Email Address</label>
              <input
                {...register("email")}
                type="email"
                placeholder="player@example.ug"
                className={`w-full px-6 py-4 bg-zinc-950 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-white placeholder:text-zinc-800`}
              />
              {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Password</label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full px-6 py-4 bg-zinc-950 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-white placeholder:text-zinc-800`}
                />
                {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Confirm</label>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full px-6 py-4 bg-zinc-950 border ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'} rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-white placeholder:text-zinc-800`}
                />
                {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase text-sm tracking-[0.2em] shadow-xl shadow-blue-500/20 disabled:opacity-50 group flex items-center justify-center gap-3 mt-4"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  CREATE ACCOUNT
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-zinc-500 italic">
            Already have a profile?{" "}
            <Link href="/login" className="text-white font-black hover:text-blue-500 transition-colors ml-1 underline underline-offset-8">
              Sign In Instead
            </Link>
          </div>
        </div>
      </main>

      {/* Decorative National Pillar */}
      <div className="absolute bottom-8 left-8 hidden lg:flex flex-col gap-1 opacity-20 group">
         <div className="w-12 h-1.5 bg-black rounded-full"></div>
         <div className="w-12 h-1.5 bg-yellow-500 rounded-full"></div>
         <div className="w-12 h-1.5 bg-red-600 rounded-full"></div>
      </div>
    </div>
  );
}
