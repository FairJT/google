import React from "react";
import { Sparkles, Users, User, ShieldCheck, LogIn, LogOut } from "lucide-react";
import { AppUser } from "../types";

interface HeaderProps {
  currentUser: AppUser | null;
  onOpenLogin: (role?: "client" | "admin" | "artist") => void;
  onLogout: () => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

export default function Header({
  currentUser,
  onOpenLogin,
  onLogout,
  activeTab,
  onChangeTab,
}: HeaderProps) {
  const getRoleBadge = (role: "client" | "admin" | "artist") => {
    switch (role) {
      case "client":
        return { label: "مشتری سالن", color: "bg-emerald-50 text-emerald-700 border-emerald-100" };
      case "admin":
        return { label: "مدیریت ارشد", color: "bg-rose-50 text-rose-700 border-rose-100" };
      case "artist":
        return { label: "آرتیست متخصص", color: "bg-indigo-50 text-indigo-700 border-indigo-100" };
      default:
        return { label: "کاربر", color: "bg-slate-50 text-slate-700 border-slate-100" };
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-slate-900 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-sans font-bold tracking-tight text-slate-950 flex items-center gap-2">
              سالن های زیبایی ابری
            </h1>
            <p className="text-[10px] text-slate-400 font-sans tracking-wide">پلتفرم مدیریت مدرن و نوبت‌دهی هوشمند سالن‌های زیبایی</p>
          </div>
        </div>

        {/* Tab Navigation - Only visible if a user is logged in and needs switcher */}
        {currentUser && (
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onChangeTab("booking")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "booking"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              نوبت‌دهی مشتریان
            </button>
            
            <button
              onClick={() => onChangeTab("dashboard")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              {currentUser.role === "client" ? "داشبورد من" : "داشبورد مدیریت و هنرمندان"}
            </button>

            {currentUser.role === "admin" && (
              <button
                onClick={() => onChangeTab("roadmap")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "roadmap"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                }`}
              >
                نقشه راه توسعه
              </button>
            )}
          </nav>
        )}

        {/* Auth status action area */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl pl-3">
              <img 
                src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"} 
                alt={currentUser.name} 
                className="w-8 h-8 rounded-xl object-cover border border-slate-200"
              />
              <div className="text-right">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">{currentUser.name}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${getRoleBadge(currentUser.role).color}`}>
                    {getRoleBadge(currentUser.role).label}
                  </span>
                </div>
                {currentUser.phone && (
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">{currentUser.phone}</p>
                )}
              </div>
              
              <button
                onClick={onLogout}
                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer mr-2"
                title="خروج از حساب"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1.5 rounded-xl font-bold">
                حالت بازدیدکننده مهمان
              </span>
              <button
                onClick={() => onOpenLogin("client")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                ورود / عضویت
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
