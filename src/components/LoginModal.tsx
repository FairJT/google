import React, { useState } from "react";
import { User, ShieldCheck, Sparkles, Smartphone, Lock, Eye, EyeOff, CheckCircle, ArrowRight, X } from "lucide-react";
import { AppUser } from "../types";
import { artistsList } from "../data";
import { toPersianDigits } from "../utils/shamsi";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AppUser) => void;
  initialRole?: "client" | "admin" | "artist";
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess, initialRole = "client" }: LoginModalProps) {
  const [activeRole, setActiveRole] = useState<"client" | "admin" | "artist">(initialRole);
  
  // Client login states
  const [phone, setPhone] = useState("");
  const [clientName, setClientName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [clientStep, setClientStep] = useState<"phone" | "otp">("phone");

  // Admin states
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Artist states
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [artistPassword, setArtistPassword] = useState("");

  // Error and UI states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // Handler for Client Phone submit
  const handleClientPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phone.startsWith("09") || phone.length !== 11) {
      setError("شماره موبایل وارد شده معتبر نیست. نمونه معتبر: 09123456789");
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setClientStep("otp");
      setOtpSent(true);
      // Default fill for easy testing
      setOtpCode("1234");
    }, 800);
  };

  // Handler for Client OTP code submit
  const handleClientOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otpCode !== "1234") {
      setError("کد تأیید نادرست است. کد آزمایشی ورود ۱۲۳۴ می‌باشد.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      const user: AppUser = {
        id: "c-user-" + Math.floor(Math.random() * 1000),
        name: clientName.trim() || "کاربر مهمان لجند",
        phone: phone,
        role: "client",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
      };
      
      setTimeout(() => {
        onLoginSuccess(user);
        resetState();
        onClose();
      }, 1000);
    }, 800);
  };

  // Handler for Admin Login
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!adminEmail.includes("@") || adminEmail === "") {
      setError("ایمیل کاربری معتبر نیست.");
      return;
    }
    if (adminPassword.length < 4) {
      setError("رمز عبور باید حداقل ۴ کاراکتر باشد.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // accept any credentials for demo convenience, but validate structure
      setSuccess(true);
      const user: AppUser = {
        id: "admin-1",
        name: "سرکار خانم الیزابت",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"
      };
      setTimeout(() => {
        onLoginSuccess(user);
        resetState();
        onClose();
      }, 1000);
    }, 800);
  };

  // Handler for Artist Login
  const handleArtistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedArtistId) {
      setError("لطفاً حساب متخصص خود را انتخاب کنید.");
      return;
    }
    if (artistPassword.length < 4) {
      setError("رمز عبور باید حداقل ۴ کاراکتر باشد.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      const artist = artistsList.find(a => a.id === selectedArtistId);
      const user: AppUser = {
        id: artist?.id || "artist-1",
        name: artist?.name || "متخصص زیبایی لجند",
        role: "artist",
        artistId: artist?.id,
        avatar: artist?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
      };
      setTimeout(() => {
        onLoginSuccess(user);
        resetState();
        onClose();
      }, 1000);
    }, 800);
  };

  const handleDemoFill = (roleType: "client" | "admin" | "artist") => {
    setError("");
    if (roleType === "client") {
      setClientName("مهسا احمدی");
      setPhone("09121234567");
      setClientStep("phone");
    } else if (roleType === "admin") {
      setAdminEmail("admin@aura.ir");
      setAdminPassword("1234");
    } else if (roleType === "artist") {
      setSelectedArtistId(artistsList[0].id);
      setArtistPassword("1234");
    }
  };

  const resetState = () => {
    setPhone("");
    setClientName("");
    setOtpSent(false);
    setOtpCode("");
    setClientStep("phone");
    setAdminEmail("");
    setAdminPassword("");
    setSelectedArtistId("");
    setArtistPassword("");
    setError("");
    setSuccess(false);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-150 animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-950 to-slate-900 p-6 text-white relative">
          <button 
            onClick={() => { resetState(); onClose(); }} 
            className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors bg-white/10 p-1.5 rounded-xl cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="space-y-1 text-right pr-2">
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-bold">ورود به پلتفرم لجند</span>
            <h3 className="text-lg font-bold">درگاه یکپارچه ورود اعضا</h3>
            <p className="text-xs text-slate-400">نقش کاربری خود را انتخاب کرده و وارد شوید.</p>
          </div>
        </div>

        {/* Role tabs */}
        <div className="flex border-b border-slate-100 p-2 bg-slate-50">
          <button
            onClick={() => { setActiveRole("client"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeRole === "client" 
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="w-4 h-4" />
            مشتری سالن
          </button>
          <button
            onClick={() => { setActiveRole("admin"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeRole === "admin" 
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            مدیریت ارشد
          </button>
          <button
            onClick={() => { setActiveRole("artist"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeRole === "artist" 
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            آرتیست سالن
          </button>
        </div>

        {/* Modal Body / Forms */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle className="w-8 h-8 fill-emerald-50" />
              </div>
              <h4 className="text-base font-bold text-slate-900">ورود با موفقیت انجام شد</h4>
              <p className="text-xs text-slate-500 font-medium">به پلتفرم ابری هوشمند لجند خوش آمدید...</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Error Alert banner */}
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-900 rounded-xl p-3 text-xs leading-relaxed font-semibold">
                  {error}
                </div>
              )}

              {/* CLIENT FORM */}
              {activeRole === "client" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {clientStep === "phone" ? (
                    <form onSubmit={handleClientPhoneSubmit} className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-1.5">نام و نام خانوادگی:</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: مهسا احمدی"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-indigo-500 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-1.5">شماره تلفن همراه:</label>
                        <div className="relative">
                          <input
                            type="tel"
                            required
                            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-11 pl-4 text-xs outline-none focus:border-indigo-500 text-left font-mono font-bold"
                          />
                          <Smartphone className="w-4 h-4 text-slate-400 absolute right-4 top-3.5" />
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2"
                      >
                        {loading ? "در حال ارسال..." : "ارسال پیامک کد تأیید"}
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleClientOtpSubmit} className="space-y-3.5">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        کد تأیید به شماره <strong className="text-slate-800">{toPersianDigits(phone)}</strong> ارسال شد. (برای راحتی ورود از کد <strong className="text-indigo-600 font-bold">۱۲۳۴</strong> استفاده کنید)
                      </p>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-1.5">کد تایید ۴ رقمی:</label>
                        <input
                          type="text"
                          required
                          maxLength={4}
                          placeholder="----"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-indigo-500 text-center font-mono font-bold tracking-widest"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setClientStep("phone")}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-3 rounded-xl font-bold transition-all cursor-pointer"
                        >
                          تغییر شماره همراه
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-3 rounded-xl font-bold transition-all cursor-pointer"
                        >
                          {loading ? "در حال تأیید..." : "تأیید و ورود"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* ADMIN FORM */}
              {activeRole === "admin" && (
                <form onSubmit={handleAdminSubmit} className="space-y-3.5 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1.5">پست الکترونیک:</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@aura.ir"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-indigo-500 text-left font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1.5">رمز عبور عبور:</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-4 pl-11 text-xs outline-none focus:border-indigo-500 text-left font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2"
                  >
                    {loading ? "در حال تأیید مشخصات..." : "ورود امن به پنل مدیریت سالن"}
                  </button>
                </form>
              )}

              {/* ARTIST FORM */}
              {activeRole === "artist" && (
                <form onSubmit={handleArtistSubmit} className="space-y-3.5 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1.5">انتخاب متخصص زیبایی:</label>
                    <select
                      value={selectedArtistId}
                      onChange={(e) => setSelectedArtistId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="">انتخاب متخصص...</option>
                      {artistsList.map(artist => (
                        <option key={artist.id} value={artist.id}>{artist.name} ({artist.role})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1.5">کلمه عبور متخصص:</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••"
                        value={artistPassword}
                        onChange={(e) => setArtistPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-4 pl-11 text-xs outline-none focus:border-indigo-500 text-left font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2"
                  >
                    {loading ? "در حال بررسی نوبت‌ها..." : "ورود به حساب کاربری آرتیست"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick-fill section for demo validation */}
          {!success && (
            <div className="border-t border-slate-100 pt-4 mt-6 text-right">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">ورود آسان تستی پلتفرم:</span>
              <button
                type="button"
                onClick={() => handleDemoFill(activeRole)}
                className="w-full border border-dashed border-indigo-200 bg-indigo-50/30 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 text-[11px] font-bold py-2 rounded-xl transition-all cursor-pointer text-center"
              >
                تکمیل سریع فیلدهای تستی ({activeRole === "client" ? "مشتری" : activeRole === "admin" ? "مدیر" : "متخصص"})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
