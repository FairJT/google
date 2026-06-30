import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import AuraBot from "./components/AuraBot";
import ClientPortal from "./components/ClientPortal";
import BusinessDashboard from "./components/BusinessDashboard";
import RoadmapProgress from "./components/RoadmapProgress";
import LoginModal from "./components/LoginModal";
import { Booking, AppUser } from "./types";
import { formatToman, toPersianDigits, jalaliToGregorian, getShamsiWeekdayFromString } from "./utils/shamsi";
import { Bell, ChevronLeft, X, LogIn, Lock, ShieldCheck, Sparkles, ArrowRight, Star } from "lucide-react";
import { fetchBookingsFromDb, saveBookingToDb, updateBookingStatusInDb, updateBookingRatingInDb } from "./lib/firebase";

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: "b-default-1",
    salonId: "sal1",
    salonName: "خانه زیبایی لجند الیژین، جردن",
    artistId: "a4",
    artistName: "یوکی سایتو",
    serviceId: "s6",
    serviceName: "مانیکور روسی لوکس الیژین",
    date: "1405/04/09",
    time: "10:30",
    price: 350000,
    status: "Completed",
    createdAt: "2026-06-24T09:00:00.000Z"
  },
  {
    id: "b-default-2",
    salonId: "sal2",
    salonName: "آتلیه زیبایی لجند، زعفرانیه",
    artistId: "a1",
    artistName: "سرنا ونس",
    serviceId: "s1",
    serviceName: "بالیاژ عسلی طلایی و براشینگ حرفه‌ای",
    date: "1405/04/14",
    time: "14:00",
    price: 1200000,
    status: "Confirmed",
    createdAt: "2026-06-28T15:12:00.000Z"
  }
];

export const StarRating = ({ rating, onRate }: { rating?: number; onRate: (r: number) => void }) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-0.5 justify-end" dir="ltr">
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = hoverRating !== null ? starValue <= hoverRating : starValue <= (rating || 0);
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onRate(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(null)}
            className="focus:outline-none transition-transform duration-150 active:scale-125 cursor-pointer p-0.5"
            title={`امتیاز ${toPersianDigits(starValue)} از ۵`}
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                isFilled
                  ? "fill-amber-400 stroke-amber-400"
                  : "stroke-slate-300 hover:stroke-amber-400"
              }`}
            />
          </button>
        );
      })}
      {rating ? (
        <span className="text-[10px] text-amber-600 font-extrabold mr-1 whitespace-nowrap">
          ({toPersianDigits(rating)} از ۵)
        </span>
      ) : (
        <span className="text-[10px] text-slate-400 font-bold mr-1 whitespace-nowrap">
          ثبت امتیاز
        </span>
      )}
    </div>
  );
};

export default function App() {
  // Global States
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem("aura_current_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [currentRole, setCurrentRole] = useState<"client" | "admin" | "artist">(() => {
    const saved = localStorage.getItem("aura_current_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.role;
    }
    return "client";
  });
  
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalInitialRole, setLoginModalInitialRole] = useState<"client" | "admin" | "artist">("client");

  const [activeTab, setActiveTab] = useState<string>("booking");
  const [bookings, setBookings] = useState<Booking[]>(DEFAULT_BOOKINGS);

  // Sync / Load bookings from Firebase Firestore with fallback to local storage
  useEffect(() => {
    async function syncBookings() {
      try {
        const dbBookings = await fetchBookingsFromDb();
        if (dbBookings && dbBookings.length > 0) {
          const mapped: Booking[] = dbBookings.map(b => ({
            id: b.id || Math.random().toString(),
            salonId: b.salonId,
            salonName: b.salonName,
            artistId: b.artistId,
            artistName: b.artistName,
            serviceId: b.serviceId,
            serviceName: b.serviceName,
            date: b.date,
            time: b.time,
            price: b.price,
            status: b.status,
            createdAt: b.createdAt,
            rating: b.rating
          }));
          setBookings(mapped);
          localStorage.setItem("aura_bookings", JSON.stringify(mapped));
        } else {
          // No bookings in Firestore yet. Seed default bookings into Firestore.
          const saved = localStorage.getItem("aura_bookings");
          const localBookings = saved ? JSON.parse(saved) : DEFAULT_BOOKINGS;
          setBookings(localBookings);

          // Seed
          for (const b of localBookings) {
            await saveBookingToDb({
              salonId: b.salonId,
              salonName: b.salonName,
              serviceId: b.serviceId,
              serviceName: b.serviceName,
              price: b.price,
              duration: 45,
              artistId: b.artistId,
              artistName: b.artistName,
              date: b.date,
              time: b.time,
              status: b.status,
              userName: currentUser?.name || "کاربر تستی",
              userPhone: currentUser?.phone || "09121234567",
              createdAt: b.createdAt || new Date().toISOString(),
              rating: b.rating
            });
          }

          // Fetch again to get clean IDs
          const seeded = await fetchBookingsFromDb();
          const mappedSeeded: Booking[] = seeded.map(b => ({
            id: b.id || Math.random().toString(),
            salonId: b.salonId,
            salonName: b.salonName,
            artistId: b.artistId,
            artistName: b.artistName,
            serviceId: b.serviceId,
            serviceName: b.serviceName,
            date: b.date,
            time: b.time,
            price: b.price,
            status: b.status,
            createdAt: b.createdAt,
            rating: b.rating
          }));
          setBookings(mappedSeeded);
          localStorage.setItem("aura_bookings", JSON.stringify(mappedSeeded));
        }
      } catch (err) {
        console.error("Failed to connect or fetch from Firestore, utilizing offline state:", err);
        const saved = localStorage.getItem("aura_bookings");
        if (saved) {
          try {
            setBookings(JSON.parse(saved));
          } catch (e) {
            console.error("Local storage fallback parse error:", e);
          }
        }
      }
    }
    syncBookings();
  }, []);

  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    localStorage.setItem("aura_current_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole("client");
    setActiveTab("booking");
    localStorage.removeItem("aura_current_user");
  };

  const handleOpenLogin = (role: "client" | "admin" | "artist" = "client") => {
    setLoginModalInitialRole(role);
    setLoginModalOpen(true);
  };

  const handleAddBooking = async (newBooking: Booking) => {
    try {
      const docId = await saveBookingToDb({
        salonId: newBooking.salonId,
        salonName: newBooking.salonName,
        serviceId: newBooking.serviceId,
        serviceName: newBooking.serviceName,
        price: newBooking.price,
        duration: 45,
        artistId: newBooking.artistId,
        artistName: newBooking.artistName,
        date: newBooking.date,
        time: newBooking.time,
        status: newBooking.status,
        userName: currentUser?.name || "مشتری مهمان",
        userPhone: currentUser?.phone || "09121234567",
        createdAt: new Date().toISOString()
      });
      const withId = { ...newBooking, id: docId };
      setBookings((prev) => {
        const updated = [withId, ...prev];
        localStorage.setItem("aura_bookings", JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error("Failed to save booking to Firestore, saving locally:", err);
      setBookings((prev) => {
        const updated = [newBooking, ...prev];
        localStorage.setItem("aura_bookings", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      await updateBookingStatusInDb(id, "Cancelled");
    } catch (err) {
      console.error("Failed to cancel booking in Firestore:", err);
    }

    setBookings((prev) => {
      const updated = prev.map(b => b.id === id ? { ...b, status: "Cancelled" as const } : b);
      localStorage.setItem("aura_bookings", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRateBooking = async (id: string, rating: number) => {
    try {
      await updateBookingRatingInDb(id, rating);
    } catch (err) {
      console.error("Failed to update booking rating in Firestore:", err);
    }

    setBookings((prev) => {
      const updated = prev.map(b => b.id === id ? { ...b, rating } : b);
      localStorage.setItem("aura_bookings", JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateBookingStatus = async (id: string, status: "Confirmed" | "Completed" | "Cancelled") => {
    try {
      await updateBookingStatusInDb(id, status);
    } catch (err) {
      console.error(`Failed to update booking status to ${status} in Firestore:`, err);
    }

    setBookings((prev) => {
      const updated = prev.map(b => b.id === id ? { ...b, status } : b);
      localStorage.setItem("aura_bookings", JSON.stringify(updated));
      return updated;
    });
  };

  // Find the nearest upcoming confirmed booking
  const [isAlertDismissed, setIsAlertDismissed] = useState<boolean>(false);

  const getDaysDifference = (shamsiDateStr: string): number => {
    try {
      const parts = shamsiDateStr.split("/");
      if (parts.length !== 3) return -1;
      const jy = parseInt(parts[0]);
      const jm = parseInt(parts[1]);
      const jd = parseInt(parts[2]);
      const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd);
      
      const bookingDate = new Date(gy, gm - 1, gd);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      bookingDate.setHours(0, 0, 0, 0);
      
      const diffTime = bookingDate.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      return -1;
    }
  };

  const getCountdownText = (daysDiff: number): string => {
    if (daysDiff === 0) return "امروز";
    if (daysDiff === 1) return "فردا";
    if (daysDiff === 2) return "پس‌فردا";
    return `${toPersianDigits(daysDiff)} روز دیگر`;
  };

  const upcomingBookings = bookings
    .filter(b => b.status === "Confirmed")
    .map(b => ({
      ...b,
      daysDiff: getDaysDifference(b.date)
    }))
    .filter(b => b.daysDiff >= 0)
    .sort((a, b) => {
      if (a.daysDiff !== b.daysDiff) return a.daysDiff - b.daysDiff;
      return a.time.localeCompare(b.time);
    });

  const nearestBooking = upcomingBookings[0] || null;

  useEffect(() => {
    setIsAlertDismissed(false);
  }, [nearestBooking?.id]);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-slate-900" dir="rtl">
      
      {/* Top Header Navigation */}
      <Header 
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
        activeTab={activeTab} 
        onChangeTab={setActiveTab} 
      />

      {/* Elegant Upcoming Appointment Notification Banner */}
      {nearestBooking && !isAlertDismissed && (
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white border-b border-indigo-800 relative z-30 animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-right">
            <div className="flex items-start md:items-center gap-3">
              <div className="p-2 bg-indigo-800/80 rounded-xl border border-indigo-700/50 shrink-0">
                <Bell className="w-4 h-4 text-indigo-300 animate-bounce" />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span className="bg-rose-500 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    {getCountdownText(nearestBooking.daysDiff)}
                  </span>
                  <span className="font-bold text-indigo-200">نزدیک‌ترین نوبت رزرو شده شما:</span>
                  <span className="font-extrabold text-white text-sm">{nearestBooking.serviceName}</span>
                </div>
                <p className="text-[11px] text-indigo-200 font-medium leading-relaxed">
                  توسط متخصص گرامی <span className="text-white font-bold">{nearestBooking.artistName}</span> در <span className="text-white font-bold">{nearestBooking.salonName}</span> • {getShamsiWeekdayFromString(nearestBooking.date)} {toPersianDigits(nearestBooking.date)} ساعت <span className="font-mono text-white font-bold text-xs bg-indigo-950/60 px-1.5 py-0.5 rounded">{toPersianDigits(nearestBooking.time)}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
              <button
                onClick={() => {
                  setActiveTab("booking");
                  setTimeout(() => {
                    document.getElementById("user-bookings-section")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="bg-white hover:bg-indigo-50 text-indigo-950 text-[10px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border border-indigo-200"
              >
                <span>مشاهده جزئیات نوبت</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsAlertDismissed(true)}
                className="p-2 hover:bg-white/10 rounded-xl text-indigo-300 hover:text-white transition-colors cursor-pointer"
                title="بستن هشدار"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-12 text-right">
        
        {/* Render Booking Portal tab */}
        {activeTab === "booking" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <ClientPortal 
              onAddBooking={handleAddBooking} 
              currentUser={currentUser}
              onOpenLogin={handleOpenLogin}
            />
          </div>
        )}

        {/* Render Dashboard tab */}
        {activeTab === "dashboard" && (
          currentUser ? (
            <BusinessDashboard 
              bookings={bookings} 
              currentUser={currentUser}
              currentRole={currentUser.role} 
              onCancelBooking={handleCancelBooking}
              onRateBooking={handleRateBooking}
              onUpdateBookingStatus={handleUpdateBookingStatus}
            />
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 text-center space-y-8 shadow-sm max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-900">ورود به بخش مدیریت و متخصصین</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                  دسترسی به ابزارهای هوش مصنوعی، قیمت‌گذاری پویا، کمپین‌های تبلیغاتی هوشمند و ارزیابی عملکرد آرتیست‌ها مختص همکاران و مدیران سالن زیبایی لجند می‌باشد.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-right pt-2">
                <div className="border border-slate-150 rounded-2xl p-5 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex flex-col justify-between">
                  <div className="space-y-1.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-2">پنل مدیریت سالن</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      نظارت بر شعبه‌ها، تراکنش‌های مالی، تنظیم ضرایب قیمت‌گذاری هوشمند تقاضا و آمار نوبت‌ها.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenLogin("admin")}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>ورود به عنوان مدیریت</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-300 rotate-180" />
                  </button>
                </div>

                <div className="border border-slate-150 rounded-2xl p-5 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex flex-col justify-between">
                  <div className="space-y-1.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-2">پنل متخصص زیبایی</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      مشاهده برنامه زمان‌بندی روزانه، ماتریس ارزیابی مهارت، امتیاز رضایت مشتریان و اطلاعات خدمات.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenLogin("artist")}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>ورود به عنوان متخصص</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-200 rotate-180" />
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 text-xs text-slate-400 flex items-center justify-center gap-1">
                <span>یا برای ثبت نوبت به</span>
                <button
                  onClick={() => setActiveTab("booking")}
                  className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors underline decoration-dotted"
                >
                  صفحه اصلی نوبت‌دهی مشتریان
                </button>
                <span>بازگردید.</span>
              </div>
            </div>
          )
        )}

        {/* Render Roadmap Progress tab */}
        {activeTab === "roadmap" && (
          <RoadmapProgress />
        )}

      </main>

      {/* Persistent Elegant Brand Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 text-slate-400 py-10 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-right">
            <p className="font-bold text-white text-sm">پلتفرم ابری هوشمند زیبایی لجند (Legend AI)</p>
            <p className="text-slate-500 font-semibold">نسخه ۱.۰.۴ بتا • سامانه پرداخت کارت به کارت و شتاب کاملاً ایمن</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-500 font-semibold text-xs" dir="ltr">
            <span className="text-slate-300">✓ فازهای ۱ و ۲ فعال</span>
            <span>•</span>
            <span>پشتیبانی از پروتکل TLS 1.3</span>
            <span>•</span>
            <span>درگاه شتاب آزمایشی</span>
            <span>•</span>
            <span>همگام با هوش مصنوعی گوگل جمینی</span>
          </div>
        </div>
      </footer>

      {/* Floating Style Consultant AI Assistant */}
      <AuraBot />

      {/* Global Login Modal Portal */}
      <LoginModal 
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRole={loginModalInitialRole}
      />
    </div>
  );
}
