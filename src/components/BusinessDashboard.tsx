import React, { useState } from "react";
import { 
  TrendingUp, Users, DollarSign, Calendar, Sparkles, RefreshCw, AlertTriangle, 
  Settings, Percent, Mail, MessageSquare, ChevronRight, CheckCircle, BarChart3, 
  HelpCircle, Heart, Award, Star, Clock, User, Smartphone, ShieldCheck, Trash2, Gift, X
} from "lucide-react";
import PersianDatePicker from "./PersianDatePicker";
import RevenueChart from "./RevenueChart";
import ArtistSkillMatrix from "./ArtistSkillMatrix";
import { Artist, Booking, AppUser } from "../types";
import { artistsList, servicesList } from "../data";
import { formatToman, toPersianDigits } from "../utils/shamsi";

interface BusinessDashboardProps {
  bookings: Booking[];
  currentUser: AppUser;
  currentRole: "client" | "admin" | "artist";
  onCancelBooking: (id: string) => Promise<void>;
  onRateBooking: (id: string, rating: number) => Promise<void>;
  onUpdateBookingStatus: (id: string, status: "Confirmed" | "Completed" | "Cancelled") => Promise<void>;
}

export default function BusinessDashboard({ 
  bookings, 
  currentUser, 
  currentRole,
  onCancelBooking,
  onRateBooking,
  onUpdateBookingStatus
}: BusinessDashboardProps) {

  // Campaign Helper states
  const [prompt, setPrompt] = useState("تخفیف ویژه ۲۰ درصدی بالیاژ مو برای جشنواره تابستانه");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audience, setAudience] = useState("Active hair color seekers");

  // Date picker states for filtering bookings per role
  const [clientFilterDate, setClientFilterDate] = useState<string>("");
  const [showClientDatePicker, setShowClientDatePicker] = useState<boolean>(false);

  const [artistFilterDate, setArtistFilterDate] = useState<string>("");
  const [showArtistDatePicker, setShowArtistDatePicker] = useState<boolean>(false);

  const [adminFilterDate, setAdminFilterDate] = useState<string>("");
  const [showAdminDatePicker, setShowAdminDatePicker] = useState<boolean>(false);

  // Dynamic pricing tester states
  const [testService, setTestService] = useState(servicesList[0]);
  const [testTime, setTestTime] = useState("14:30");
  const [testDay, setTestDay] = useState("Weekend");
  const [pricingResult, setPricingResult] = useState<any | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Artist evaluation score override tool
  const [activeArtists, setActiveArtists] = useState<Artist[]>(artistsList);
  const [selectedArtistToScore, setSelectedArtistToScore] = useState<Artist | null>(null);
  const [newScore, setNewScore] = useState(95);

  // Admin interactive filters
  const [adminSearch, setAdminSearch] = useState("");
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>("All");

  // Run dynamic pricing test
  const handleTestPricing = async () => {
    setPricingLoading(true);
    try {
      const response = await fetch("/api/dynamic-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: testService.name,
          basePrice: testService.basePrice,
          popularity: testService.popularity,
          timeOfDay: parseInt(testTime.split(":")[0]) >= 12 && parseInt(testTime.split(":")[0]) < 17 ? "Peak Afternoon" : "Regular",
          dayOfWeek: testDay
        })
      });
      if (response.ok) {
        const data = await response.json();
        setPricingResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPricingLoading(false);
    }
  };

  // Generate marketing material using AI assistant
  const handleGenerateCampaign = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Write a high-converting, premium marketing SMS and Email copy in Persian for target list segment "${audience}" based on this prompt idea: "${prompt}". Highlight the luxurious experience of Aura Salon. Keep it concise, extremely professional, polite (احترام فارسی) and beautifully formatted.`
            }
          ]
        })
      });
      if (response.ok) {
        const data = await response.json();
        setGeneratedMessage(data.content || "");
      }
    } catch (err) {
      console.error(err);
      setGeneratedMessage("خطا در برقراری ارتباط با مدل هوش مصنوعی. لطفاً مجدداً تلاش کنید.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save updated artist score
  const handleUpdateArtistScore = () => {
    if (!selectedArtistToScore) return;
    setActiveArtists((prev) => 
      prev.map(a => a.id === selectedArtistToScore.id ? { ...a, score: newScore } : a)
    );
    setSelectedArtistToScore(null);
  };

  // Local rating controller inside Dashboard
  const [hoverRatingMap, setHoverRatingMap] = useState<{ [key: string]: number | null }>({});

  const renderDashboardStars = (bookingId: string, currentRating?: number) => {
    const hoverRating = hoverRatingMap[bookingId] !== undefined ? hoverRatingMap[bookingId] : null;

    return (
      <div className="flex items-center gap-0.5 justify-end" dir="ltr">
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = hoverRating !== null ? starValue <= hoverRating : starValue <= (currentRating || 0);
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onRateBooking(bookingId, starValue)}
              onMouseEnter={() => setHoverRatingMap(prev => ({ ...prev, [bookingId]: starValue }))}
              onMouseLeave={() => setHoverRatingMap(prev => ({ ...prev, [bookingId]: null }))}
              className="focus:outline-none transition-transform duration-100 active:scale-125 cursor-pointer p-0.5"
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
        {currentRating ? (
          <span className="text-[10px] text-amber-600 font-extrabold mr-1 whitespace-nowrap">
            ({toPersianDigits(currentRating)} / ۵)
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 font-semibold mr-1 whitespace-nowrap">
            ثبت امتیاز
          </span>
        )}
      </div>
    );
  };


  // ==========================================
  // CLIENT (CUSTOMER) ROLE IMPLEMENTATION
  // ==========================================
  if (currentRole === "client") {
    // Filter bookings belonging to this customer
    const clientBookings = bookings.filter(b => b.userPhone === currentUser.phone);
    const filteredClientBookings = clientFilterDate 
      ? clientBookings.filter(b => b.date === clientFilterDate)
      : clientBookings;
    
    // Summary Stats
    const confirmedCount = clientBookings.filter(b => b.status === "Confirmed").length;
    const completedBookings = clientBookings.filter(b => b.status === "Completed");
    const totalSpent = completedBookings.reduce((sum, b) => sum + b.price, 0);
    const beautyPoints = completedBookings.length * 120; // 120 Club Points per service

    // Generate custom beauty recommendations based on customer history
    const getAiRecommendations = () => {
      const pastServices = clientBookings.map(b => b.serviceName);
      const recommendations = [];

      if (pastServices.some(s => s.includes("فیشیال") || s.includes("پوست") || s.includes("پاکسازی"))) {
        recommendations.push({
          title: "کوکتل رطوبت‌رسانی عمیق و سرم هیالورونیک اسید",
          desc: "با توجه به دریافت سرویس فیشیال، متخصصین لجند پیشنهاد می‌کنند برای افزایش ماندگاری و درخشش سلول‌های تازه، از ماسک سرد هیدروژلی در خانه استفاده کنید.",
          salon: "شبه فرمانیه و نیاوران",
          badge: "پوست و شادابی"
        });
      }
      if (pastServices.some(s => s.includes("بالیاژ") || s.includes("رنگ") || s.includes("کراتین"))) {
        recommendations.push({
          title: "پلکس‌تراپی و کراتین سرد جهت احیای ساقه مو",
          desc: "جهت تثبیت تناژ رنگ مو و بالیاژ گران‌قیمت شما، متخصصین ما انجام یک دوره کراتین عمیق اولاپلکس را در ۲ هفته آینده برای بازیابی ضخامت مو توصیه می‌کنند.",
          salon: "تمام شعب لجند",
          badge: "مو و زیبایی"
        });
      }
      if (pastServices.some(s => s.includes("کاشت") || s.includes("ژلیش") || s.includes("ناخن"))) {
        recommendations.push({
          title: "اسپای لوکس پا و پارافین‌تراپی درمانی",
          desc: "برای هیدراته نگه داشتن پوست دست و پا پس از کاشت ناخن مدرن، ماساژ با روغن آرگان و پارافین گرم بهترین گزینه‌ است.",
          salon: "شعبه زعفرانیه",
          badge: "ناخن و اسپا"
        });
      }

      // Default recommendations
      recommendations.push({
        title: "ماساژ لیفتینگ ارگانیک صورت با گوی یخ",
        desc: "پکیج اختصاصی درخشش لجند (Legend Signature Glow) برای بازیابی کلاژن و درخشش آنی پیش از مجالس مهم شما طراحی شده است.",
        salon: "تمام شعب لجند",
        badge: "پکیج اختصاصی"
      });

      return recommendations;
    };

    return (
      <div className="space-y-10 animate-in fade-in duration-300 text-right" dir="rtl">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md">
          <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                عضو رسمی باشگاه زیبایی لجند (Legend Club)
              </span>
              <h2 className="text-xl md:text-2xl font-bold">خوش آمدید، {currentUser.name} گرامی ✨</h2>
              <p className="text-xs text-slate-300">نظارت بر نوبت‌ها، تاریخچه مالی، ارزیابی متخصصین و پیشنهادات اختصاصی هوش مصنوعی شما.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 px-4.5 py-3 rounded-2xl shrink-0 text-center space-y-1">
              <p className="text-[10px] text-slate-300 font-semibold">تلفن همراه فعال:</p>
              <p className="text-md font-mono font-extrabold text-indigo-200">{toPersianDigits(currentUser.phone || "09121234567")}</p>
            </div>
          </div>
        </div>

        {/* Customer Stats Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">اعتبار پرداخت شده تا کنون</span>
              <DollarSign className="w-4 h-4 text-emerald-600 animate-pulse" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">{formatToman(totalSpent)}</h4>
            <p className="text-[10px] text-slate-400 font-semibold">بابت خدمات تکمیل شده شما</p>
          </div>

          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">امتیازات کلوپ زیبایی</span>
              <Gift className="w-4 h-4 text-indigo-600" />
            </div>
            <h4 className="text-lg font-bold text-indigo-600 font-mono">{toPersianDigits(beautyPoints)} امتیاز</h4>
            <p className="text-[10px] text-emerald-600 font-bold">امکان تبدیل به کدهای تخفیف خرید</p>
          </div>

          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">نوبت‌های رزرو شده فعال</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">{toPersianDigits(confirmedCount)} نوبت</h4>
            <p className="text-[10px] text-slate-400 font-semibold">خدمات در انتظار مراجعه شما</p>
          </div>

          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-2 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">تعداد مراجعات نهایی</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">{toPersianDigits(completedBookings.length)} درمان نهایی</h4>
            <p className="text-[10px] text-slate-400 font-semibold">سابقه مراجعات موفق به شعب لجند</p>
          </div>
        </section>

        {/* Client Active Bookings Dashboard Panel */}
        <section className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">برنامه زمان‌بندی شخصی شما</h4>
              <h3 className="text-lg font-bold text-slate-950 mt-1">
                {clientFilterDate ? `نوبت‌های تاریخ ${toPersianDigits(clientFilterDate)}` : "نوبت‌های فعال و تاریخچه خدمات شما"} ({toPersianDigits(filteredClientBookings.length)} نوبت)
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {clientFilterDate && (
                <button
                  onClick={() => setClientFilterDate("")}
                  className="flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-850 bg-rose-50 border border-rose-100 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  حذف فیلتر تاریخ ({toPersianDigits(clientFilterDate)})
                </button>
              )}
              <button
                onClick={() => setShowClientDatePicker(!showClientDatePicker)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                  showClientDatePicker || clientFilterDate
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                {clientFilterDate ? `تاریخ: ${toPersianDigits(clientFilterDate)}` : "فیلتر بر اساس تاریخ شمسی"}
              </button>
            </div>
          </div>

          {showClientDatePicker && (
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="w-full max-w-sm">
                <PersianDatePicker
                  value={clientFilterDate || "1405/04/09"}
                  onChange={(newVal) => {
                    setClientFilterDate(newVal);
                    setShowClientDatePicker(false);
                  }}
                />
              </div>
            </div>
          )}

          {clientBookings.length > 0 ? (
            filteredClientBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      <th className="pb-3 text-right">خدمت / پکیج مِتُد</th>
                      <th className="pb-3 text-right">سالن زیبایی</th>
                      <th className="pb-3 text-right">متخصص ممیزی شده</th>
                      <th className="pb-3 text-right">تاریخ و ساعت نوبت</th>
                      <th className="pb-3 text-right">مبلغ پرداختی</th>
                      <th className="pb-3 text-right">وضعیت نوبت</th>
                      <th className="pb-3 text-left">عملیات / ثبت امتیاز رضایت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClientBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 font-bold text-slate-850">{b.serviceName}</td>
                        <td className="py-3.5 text-slate-600 font-medium">{b.salonName}</td>
                        <td className="py-3.5 text-slate-600 font-semibold">{b.artistName}</td>
                        <td className="py-3.5 text-slate-600 font-semibold font-mono">
                          {toPersianDigits(b.date)} در {toPersianDigits(b.time)}
                        </td>
                        <td className="py-3.5 font-semibold text-slate-900">{formatToman(b.price)}</td>
                        <td className="py-3.5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            b.status === "Confirmed"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                              : b.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}>
                            {b.status === "Confirmed" ? "تأیید شده" : b.status === "Completed" ? "انجام شده" : "لغو شده"}
                          </span>
                        </td>
                        <td className="py-3.5 text-left">
                          {b.status === "Confirmed" && (
                            <button
                              onClick={() => {
                                if(confirm("آیا از لغو نوبت انتخاب شده اطمینان کامل دارید؟ لغو در کمتر از ۲۴ ساعت مشمول جریمه امتیاز باشگاه می‌شود.")) {
                                  onCancelBooking(b.id);
                                }
                              }}
                              className="text-[10px] font-bold text-rose-700 hover:text-rose-900 border border-rose-100 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              لغو نوبت رزرو
                            </button>
                          )}
                          {b.status === "Completed" && (
                            renderDashboardStars(b.id, b.rating)
                          )}
                          {b.status === "Cancelled" && (
                            <span className="text-[10px] text-slate-400 font-semibold">بدون عملیات</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl space-y-3">
                <p>هیچ نوبتی برای تاریخ {toPersianDigits(clientFilterDate)} ثبت نشده است.</p>
                <button
                  onClick={() => setClientFilterDate("")}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors cursor-pointer"
                >
                  نمایش همه نوبت‌ها
                </button>
              </div>
            )
          ) : (
            <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl space-y-3">
              <p>شما هیچ نوبت رزرو شده‌ای در حساب کاربری خود ندارید.</p>
              <p className="text-[10px] text-slate-400">پکیج مورد علاقه خود را انتخاب کنید تا پس از هماهنگی هوش مصنوعی، در اینجا نمایش داده شود.</p>
            </div>
          )}
        </section>

        {/* AI Care Advisor Section */}
        <section className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="space-y-1 relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              توصیه هوشمند متخصص ممیزی‌شده (Legend AI Consultant)
            </span>
            <h3 className="text-lg font-bold text-slate-100">سفارشی‌سازی روتین مراقبت بعد از خدمات شما</h3>
            <p className="text-xs text-slate-300 leading-relaxed">سیستم هوش مصنوعی لجند با آنالیز خدمات دریافت شده شما، بهترین روتین‌های تقویتی و زمان بهینه مراجعات بعدی را پیشنهاد می‌کند.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            {getAiRecommendations().map((rec, idx) => (
              <div key={idx} className="bg-slate-850 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-indigo-950 text-indigo-300 text-[9px] px-2.5 py-0.5 rounded-full border border-indigo-800 font-bold">{rec.badge}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{rec.salon}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{rec.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{rec.desc}</p>
                </div>
                <div className="border-t border-slate-800/60 pt-3 flex items-center justify-between text-[10px] text-slate-400">
                  <span>روتین تایید شده توسط ممیز فنی لجند</span>
                  <button 
                    onClick={() => alert("درخواست رزرو این پیشنهاد هوش مصنوعی با موفقیت ثبت شد! مشاورین با شما تماس خواهند گرفت.")}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    رزرو سریع این پیشنهاد
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }


  // ==========================================
  // ARTIST (SPECIALIST) ROLE IMPLEMENTATION
  // ==========================================
  if (currentRole === "artist") {
    // Filter bookings assigned to this specialist
    const artistBookings = bookings.filter(b => b.artistId === currentUser.id || b.artistName === currentUser.name);
    const filteredArtistBookings = artistFilterDate 
      ? artistBookings.filter(b => b.date === artistFilterDate)
      : artistBookings;

    // Filter artist stats
    const todayShamsi = "1405/04/09"; // Mock current day to match UI shamsi
    const artistConfirmed = artistBookings.filter(b => b.status === "Confirmed");
    const artistCompleted = artistBookings.filter(b => b.status === "Completed");

    // Calculate rating score
    const ratedBookings = artistCompleted.filter(b => b.rating !== undefined);
    const avgRating = ratedBookings.length > 0 
      ? (ratedBookings.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBookings.length).toFixed(1)
      : "۵.۰"; // Default premium rating
    
    // Earned commission mock: e.g. 50% commission of the completed services
    const totalEarnings = artistCompleted.reduce((sum, b) => sum + (b.price * 0.5), 0);

    // Find the corresponding artist skill profile from list
    const artistProfile = activeArtists.find(a => a.id === currentUser.id) || artistsList[0];

    return (
      <div className="space-y-10 animate-in fade-in duration-300 text-right" dir="rtl">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md">
          <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img 
                src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"} 
                alt={currentUser.name} 
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
              />
              <div className="space-y-1.5">
                <span className="inline-block bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  هنرمند تایید شده سالن زیبایی لجند
                </span>
                <h2 className="text-xl md:text-2xl font-bold">همکار گرامی، جناب/سرکار {currentUser.name} ⭐️</h2>
                <p className="text-xs text-indigo-200">برنامه زمان‌بندی روزانه، بازخورد و ثبت رضایت‌ مشتریان و پرونده ممیزی مهارتی خود را بررسی کنید.</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-4 rounded-2xl shrink-0 text-center space-y-1">
              <p className="text-[10px] text-slate-300 font-semibold">شناسه پرسنلی سیستم:</p>
              <p className="text-sm font-mono font-extrabold text-indigo-200">{currentUser.id || "artist-1"}</p>
            </div>
          </div>
        </div>

        {/* Artist Stats Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">کارمزد انباشته شما این ماه</span>
              <DollarSign className="w-4 h-4 text-indigo-600 animate-pulse" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">{formatToman(totalEarnings + 4800000)}</h4>
            <p className="text-[10px] text-emerald-600 font-bold">↑ شامل ۵۰٪ پورسانت پایه خدمات</p>
          </div>

          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">میانگین امتیاز رضایت مشتریان</span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">{toPersianDigits(avgRating)} از ۵.۰</h4>
            <p className="text-[10px] text-slate-400 font-semibold">بر اساس بازخورد مستقیم در سیستم</p>
          </div>

          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">نوبت‌های فعالِ باقی‌مانده</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">{toPersianDigits(artistConfirmed.length)} نوبت فعال</h4>
            <p className="text-[10px] text-indigo-600 font-semibold">برنامه خدمات روزهای آینده</p>
          </div>

          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">شاخص ممیزی فنی سیستم</span>
              <Award className="w-4 h-4 text-slate-400" />
            </div>
            <h4 className="text-lg font-bold text-indigo-600 font-mono">{toPersianDigits(artistProfile.score)} / ۱۰۰</h4>
            <p className="text-[10px] text-slate-400 font-semibold">ارزیابی فنی مدیریت کل</p>
          </div>
        </section>

        {/* Schedule List */}
        <section className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-[10px] font-bold text-indigo-600 tracking-wider">برنامه کارتابل مراجعه مشتریان شما</h4>
              <h3 className="text-lg font-bold text-slate-950 mt-1">
                {artistFilterDate ? `مراجعین تاریخ ${toPersianDigits(artistFilterDate)}` : "برنامه مراجعین و خدمات زمان‌بندی شده"} ({toPersianDigits(filteredArtistBookings.length)} نوبت)
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {artistFilterDate && (
                <button
                  onClick={() => setArtistFilterDate("")}
                  className="flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-850 bg-rose-50 border border-rose-100 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  حذف فیلتر تاریخ ({toPersianDigits(artistFilterDate)})
                </button>
              )}
              <button
                onClick={() => setShowArtistDatePicker(!showArtistDatePicker)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                  showArtistDatePicker || artistFilterDate
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                {artistFilterDate ? `تاریخ: ${toPersianDigits(artistFilterDate)}` : "فیلتر بر اساس تاریخ شمسی"}
              </button>
            </div>
          </div>

          {showArtistDatePicker && (
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="w-full max-w-sm">
                <PersianDatePicker
                  value={artistFilterDate || "1405/04/09"}
                  onChange={(newVal) => {
                    setArtistFilterDate(newVal);
                    setShowArtistDatePicker(false);
                  }}
                />
              </div>
            </div>
          )}

          {artistBookings.length > 0 ? (
            filteredArtistBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      <th className="pb-3 text-right">نام مشتری</th>
                      <th className="pb-3 text-right">شماره تماس</th>
                      <th className="pb-3 text-right">نوع خدمت مورد نیاز</th>
                      <th className="pb-3 text-right">تاریخ و ساعت نوبت</th>
                      <th className="pb-3 text-right">مبلغ فاکتور</th>
                      <th className="pb-3 text-right">وضعیت نوبت</th>
                      <th className="pb-3 text-left">عملیات کارشناس</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredArtistBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 font-bold text-slate-850">{"userName" in b ? b.userName : "مشتری گرامی"}</td>
                        <td className="py-3.5 text-slate-600 font-semibold font-mono">{"userPhone" in b ? toPersianDigits(b.userPhone as string) : "بدون شماره"}</td>
                        <td className="py-3.5 font-bold text-indigo-600">{b.serviceName}</td>
                        <td className="py-3.5 text-slate-600 font-semibold font-mono">
                          {toPersianDigits(b.date)} در {toPersianDigits(b.time)}
                        </td>
                        <td className="py-3.5 font-semibold text-slate-900">{formatToman(b.price)}</td>
                        <td className="py-3.5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            b.status === "Confirmed"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                              : b.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}>
                            {b.status === "Confirmed" ? "تأیید شده" : b.status === "Completed" ? "انجام شده" : "لغو شده"}
                          </span>
                        </td>
                        <td className="py-3.5 text-left">
                          {b.status === "Confirmed" && (
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => {
                                  if(confirm("آیا کار مشتری به پایان رسیده و مایلید این نوبت را به عنوان انجام‌شده ذخیره کنید؟")) {
                                    onUpdateBookingStatus(b.id, "Completed");
                                  }
                                }}
                                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                              >
                                تکمیل نهایی خدمت
                              </button>
                              <button
                                onClick={() => {
                                  if(confirm("آیا مایلید به دلیل فوریت‌های کاری این نوبت را لغو نمایید؟ سیستم پیامک هماهنگی به مشتری ارسال خواهد کرد.")) {
                                    onUpdateBookingStatus(b.id, "Cancelled");
                                  }
                                }}
                                className="text-[10px] font-bold text-rose-700 hover:text-rose-900 border border-rose-100 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-xl transition-colors cursor-pointer"
                                title="لغو نوبت"
                              >
                                لغو
                              </button>
                            </div>
                          )}
                          {b.status === "Completed" && (
                            <div className="flex items-center gap-1.5 justify-end">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              {b.rating ? (
                                <span className="text-[10px] text-amber-600 font-extrabold font-sans">امتیاز داده شده: ({toPersianDigits(b.rating)}/۵)</span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">بدون ثبت نظر</span>
                              )}
                            </div>
                          )}
                          {b.status === "Cancelled" && (
                            <span className="text-[10px] text-rose-500 font-bold">لغو شده</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl space-y-3">
                <p>هیچ نوبتی برای تاریخ {toPersianDigits(artistFilterDate)} ثبت نشده است.</p>
                <button
                  onClick={() => setArtistFilterDate("")}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors cursor-pointer"
                >
                  نمایش همه مراجعین
                </button>
              </div>
            )
          ) : (
            <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl">
              امروز هیچ برنامه خدماتی ثبت شده‌ای برای شما در سیستم وجود ندارد. از استراحت خود لذت ببرید!
            </div>
          )}
        </section>

        {/* Dynamic Radar Skill Matrix Chart */}
        <ArtistSkillMatrix currentUser={currentUser} artists={activeArtists} />

        {/* Skill report evaluation audit */}
        <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 text-right">
          <div>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2.5 py-0.5 rounded-full border border-indigo-100 font-bold">جزئیات پرونده پرسنلی همکاران</span>
            <h4 className="text-base font-bold text-slate-900 mt-2">پرونده ارزیابی کیفیت مهارت‌های شما</h4>
            <p className="text-xs text-slate-500 mt-1">این اطلاعات توسط سیستم ممیزی کیفی شعبه‌های لجند صادر شده و مستقیماً بر اولویت‌بندی اختصاص مشتریان و ضرایب پاداش شما تاثیرگذار است.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              {artistProfile.skills.map((skill, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{skill.skill}</span>
                    <span>{toPersianDigits(skill.percentage)}٪</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${skill.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-150 p-6 rounded-2xl space-y-4">
              <h5 className="text-sm font-bold text-slate-900">پیشنهادات مدیر فنی جهت ارتقای جایگاه پرسنلی:</h5>
              <ul className="text-xs text-slate-600 space-y-3 leading-relaxed list-disc pr-4">
                <li>ثبت‌نام در کارگاه متدهای جدید رنگ مو در کالج لجند شعبه زعفرانیه.</li>
                <li>افزایش تعامل کلامی محترمانه با مشتریان در انتهای خدمات جهت ثبت رای دهی.</li>
                <li>حضور منظم در سالن حداقل ۱۵ دقیقه پیش از زمان شروع نوبت اول صبح مراجعین.</li>
              </ul>
              <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl text-[10px] text-indigo-800 leading-relaxed font-semibold">
                <strong>توجه کارمزد:</strong> با کسب امتیاز ممیزی بالاتر از ۹۵، ضریب پاداش عملکرد شما در ماه آینده ۵ درصد افزایش خواهد یافت.
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }


  // ==========================================
  // MASTER ADMIN ROLE IMPLEMENTATION
  // ==========================================
  // Calculations for Admin Analytics
  const salonRevenue = bookings.reduce((sum, b) => sum + b.price, 0) + 18450000; // Mock base + live
  const totalBookingsCount = bookings.length + 142; // Mock base + live

  // Filter Bookings for Admin table
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.serviceName.toLowerCase().includes(adminSearch.toLowerCase()) || 
                          b.artistName.toLowerCase().includes(adminSearch.toLowerCase()) ||
                          ("userName" in b ? (b as any).userName.toLowerCase().includes(adminSearch.toLowerCase()) : false);
    const matchesStatus = adminStatusFilter === "All" || b.status === adminStatusFilter;
    const matchesDate = !adminFilterDate || b.date === adminFilterDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-300" dir="rtl">
      
      {/* Analytics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-right">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400">درآمد کل سالن</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <h4 className="text-xl font-bold text-slate-900">{formatToman(salonRevenue)}</h4>
          <p className="text-[10px] text-emerald-600 font-bold">↑ +۱۴.۲٪ رشد ماه جاری</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400">تعداد کل نوبت‌ها</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <h4 className="text-xl font-bold text-slate-900">{toPersianDigits(totalBookingsCount)} نوبت</h4>
          <p className="text-[10px] text-emerald-600 font-bold">↑ +۱۸ مشتری فعال امروز</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400">کارایی تقاضای پویا</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <h4 className="text-xl font-bold text-slate-900">۹۲.۴٪</h4>
          <p className="text-[10px] text-slate-400 font-bold">حذف فضاهای خالی تقویم</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400">وضعیت موجودی مواد</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mt-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            مواد پاکسازی اولاپلکس رو به اتمام
          </h4>
          <p className="text-[10px] text-slate-500 font-semibold">سفارش خودکار در موجودی ۱۵٪ صادر شد</p>
        </div>
      </section>

      {/* Revenue Graph Report */}
      <RevenueChart bookings={bookings} />

      {/* ADMIN ALL BOOKINGS MANAGER PANEL */}
      <section className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm text-right">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-[10px] font-bold text-rose-600 tracking-widest uppercase">پنل هماهنگ‌کننده پذیرش سالن</h4>
            <h3 className="text-lg font-bold text-slate-950 mt-1">
              {adminFilterDate ? `مدیریت نوبت‌های مراجعین تاریخ ${toPersianDigits(adminFilterDate)}` : "مدیریت جامع پذیرش و نوبت‌های مراجعین کل سالن"} ({toPersianDigits(filteredBookings.length)} نوبت)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {adminFilterDate && (
              <button
                onClick={() => setAdminFilterDate("")}
                className="flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-850 bg-rose-50 border border-rose-100 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-3 h-3" />
                حذف فیلتر تاریخ ({toPersianDigits(adminFilterDate)})
              </button>
            )}
            <button
              onClick={() => setShowAdminDatePicker(!showAdminDatePicker)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                showAdminDatePicker || adminFilterDate
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {adminFilterDate ? `تاریخ: ${toPersianDigits(adminFilterDate)}` : "فیلتر تاریخ شمسی"}
            </button>
            <input
              type="text"
              placeholder="جستجوی متخصص، خدمت، نام..."
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl outline-none focus:border-indigo-500 font-semibold w-52"
            />
            <select
              value={adminStatusFilter}
              onChange={(e) => setAdminStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl outline-none focus:border-indigo-500 font-bold"
            >
              <option value="All">همه وضعیت‌ها</option>
              <option value="Confirmed">تایید شده</option>
              <option value="Completed">انجام شده</option>
              <option value="Cancelled">لغو شده</option>
            </select>
          </div>
        </div>

        {showAdminDatePicker && (
          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="w-full max-w-sm">
              <PersianDatePicker
                value={adminFilterDate || "1405/04/09"}
                onChange={(newVal) => {
                  setAdminFilterDate(newVal);
                  setShowAdminDatePicker(false);
                }}
              />
            </div>
          </div>
        )}

        {filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  <th className="pb-3 text-right">خدمت / پکیج</th>
                  <th className="pb-3 text-right">مشتری</th>
                  <th className="pb-3 text-right">تلفن مشتری</th>
                  <th className="pb-3 text-right">متخصص ممیزی شده</th>
                  <th className="pb-3 text-right">سالن</th>
                  <th className="pb-3 text-right">تاریخ / ساعت</th>
                  <th className="pb-3 text-right">مبلغ پرداختی</th>
                  <th className="pb-3 text-right">وضعیت</th>
                  <th className="pb-3 text-left">تغییر وضعیت نوبت / عملیات مدیریت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 font-bold text-slate-850">{b.serviceName}</td>
                    <td className="py-3.5 font-bold text-slate-900">{"userName" in b ? (b as any).userName : "مهمان سایت"}</td>
                    <td className="py-3.5 text-slate-600 font-semibold font-mono">{"userPhone" in b ? toPersianDigits((b as any).userPhone) : "بدون شماره"}</td>
                    <td className="py-3.5 text-slate-600 font-semibold">{b.artistName}</td>
                    <td className="py-3.5 text-slate-500 font-medium">{b.salonName}</td>
                    <td className="py-3.5 text-slate-600 font-semibold font-mono">{toPersianDigits(b.date)} در {toPersianDigits(b.time)}</td>
                    <td className="py-3.5 font-semibold text-slate-900">{formatToman(b.price)}</td>
                    <td className="py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        b.status === "Confirmed"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                          : b.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}>
                        {b.status === "Confirmed" ? "تأیید شده" : b.status === "Completed" ? "انجام شده" : "لغو شده"}
                      </span>
                    </td>
                    <td className="py-3.5 text-left">
                      <div className="flex items-center gap-1.5 justify-end">
                        {b.status === "Confirmed" && (
                          <>
                            <button
                              onClick={() => onUpdateBookingStatus(b.id, "Completed")}
                              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-2 py-1 rounded-lg cursor-pointer"
                            >
                              اتمام خدمت
                            </button>
                            <button
                              onClick={() => onUpdateBookingStatus(b.id, "Cancelled")}
                              className="text-[10px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-2 py-1 rounded-lg cursor-pointer"
                            >
                              لغو نوبت
                            </button>
                          </>
                        )}
                        {b.status === "Completed" && (
                          <div className="flex items-center gap-1 justify-end">
                            {renderDashboardStars(b.id, b.rating)}
                          </div>
                        )}
                        {b.status === "Cancelled" && (
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, "Confirmed")}
                            className="text-[10px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-1 rounded-lg cursor-pointer"
                          >
                            احیای مجدد نوبت
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl space-y-3">
            <p>هیچ نوبتی با شرایط جستجو و فیلترهای اعمال شده در سیستم پذیرش سالن یافت نشد.</p>
            {(adminSearch || adminStatusFilter !== "All" || adminFilterDate) && (
              <button
                onClick={() => {
                  setAdminSearch("");
                  setAdminStatusFilter("All");
                  setAdminFilterDate("");
                }}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors cursor-pointer"
              >
                پاک کردن همه فیلترها و نمایش کل نوبت‌ها
              </button>
            )}
          </div>
        )}
      </section>

      {/* Analytics Chart & Dynamic pricing builder */}
      <section className="grid lg:grid-cols-3 gap-8 text-right">
        
        {/* SVG Analytics Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase">شاخص‌های عملکرد خانه زیبایی لجند</h4>
              <h5 className="text-base font-bold text-slate-950">نرخ نوبت‌های تکمیل شده در طول هفته</h5>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-500 font-semibold">
              <span className="w-3 h-3 bg-indigo-600 rounded-full"></span> ساعت پیک شلوغ
              <span className="w-3 h-3 bg-slate-200 rounded-full"></span> ظرفیت خالی
            </div>
          </div>

          {/* Polished SVG Bar Chart (arranged Saturday to Friday for Persian calendar representation) */}
          <div className="h-64 flex items-end justify-between gap-2.5 pt-4 px-2 border-b border-slate-100" dir="rtl">
            {[
              { day: "شنبه", rate: 88, bookings: 31 },
              { day: "یکشنبه", rate: 55, bookings: 18 },
              { day: "دوشنبه", rate: 40, bookings: 12 },
              { day: "سه‌شنبه", rate: 68, bookings: 22 },
              { day: "چهارشنبه", rate: 82, bookings: 28 },
              { day: "پنج‌شنبه", rate: 95, bookings: 34 },
              { day: "جمعه", rate: 98, bookings: 38 }
            ].map((d, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 px-1.5 py-0.5 rounded">
                  {toPersianDigits(d.rate)}٪
                </div>
                {/* SVG representation of Bar */}
                <div className="w-full bg-slate-100 rounded-t-lg h-44 flex flex-col justify-end overflow-hidden relative">
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-600 rounded-t-lg transition-all duration-500"
                    style={{ height: `${d.rate}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-slate-500">{d.day}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            توجه: روزهای پنج‌شنبه و جمعه به دلیل اوج مراجعه، با ضریب تقاضای بالا (Surge Multiplier) به صورت پویا محاسبه می‌شوند تا توازن زمانی سالن حفظ گردد.
          </p>
        </div>

        {/* Real-time Dynamic Pricing Calculator Sandbox */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-indigo-100">
              <Sparkles className="w-3 h-3 text-indigo-500" /> الگوریتم هوشمند قیمت‌گذاری پویا
            </div>
            <h4 className="text-sm font-bold text-slate-900">شبیه‌ساز قیمت‌گذاری تقاضا</h4>
            <p className="text-xs text-slate-500">تاثیر ساعت، روزهای تعطیل و فاکتورهای تقاضا را بر روی نوبت‌های مشتریان به صورت آنی تست کنید.</p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1.5">انتخاب خدمت:</label>
              <select
                value={testService.id}
                onChange={(e) => {
                  const srv = servicesList.find(s => s.id === e.target.value);
                  if (srv) setTestService(srv);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-semibold"
              >
                {servicesList.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({formatToman(s.basePrice)})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1.5">روز مراجعه:</label>
                <select
                  value={testDay}
                  onChange={(e) => setTestDay(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="Weekday">روز عادی (تقاضای متوسط)</option>
                  <option value="Weekend">آخر هفته / پنج‌شنبه و جمعه (اوج تقاضا)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1.5">ساعت مراجعه:</label>
                <select
                  value={testTime}
                  onChange={(e) => setTestTime(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="09:00">صبح (عادی)</option>
                  <option value="14:00">۱۴:۰۰ (شلوغی پیک)</option>
                  <option value="19:00">غروب (معمولی)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleTestPricing}
              disabled={pricingLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {pricingLoading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : "اجرای محاسبات قیمت هوش مصنوعی"}
            </button>
          </div>

          {pricingResult && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 animate-in slide-in-from-bottom-2 duration-250">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-indigo-600 uppercase">
                  وضعیت پیک: {pricingResult.demandLevel === "Surge" ? "بسیار شلوغ" : pricingResult.demandLevel === "High" ? "شلوغ" : "معمولی"}
                </span>
                <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  ضریب نهایی: {toPersianDigits(pricingResult.multiplier)}x
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-2.5">
                <span className="text-xs text-slate-500 font-medium">قیمت پویای نهایی:</span>
                <span className="text-md font-bold text-slate-900">{formatToman(pricingResult.finalPrice)}</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                علت: {pricingResult.reason}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Artist Evaluation & Scoring Matrix Tool */}
      <section className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm text-right">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 tracking-widest">توسعه مهارت متخصصین لجند</h4>
          <h5 className="text-lg font-bold text-slate-950 mt-1">ارزیابی عملکرد و ممیزی مهارت‌های آرتیست‌ها</h5>
          <p className="text-xs text-slate-500 mt-1">سیستم اتوماتیک لجند مهارت‌های آرتیست‌ها را بر اساس تعداد مشتریان راضی، کیفیت کار خروجی و دوره‌های ثبت شده، در قالب نمره مهارت (score) مدلسازی می‌کند.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeArtists.map((artist) => (
            <div key={artist.id} className="border border-slate-150 bg-white rounded-2xl p-4 hover:border-slate-300 hover:shadow-sm transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img src={artist.image} alt={artist.name} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                  <div>
                    <h6 className="text-xs font-bold text-slate-900">{artist.name}</h6>
                    <p className="text-[10px] text-slate-500">{artist.role}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-155 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">امتیاز ارزیابی سامانه:</span>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{toPersianDigits(artist.score)} از ۱۰۰</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedArtistToScore(artist);
                  setNewScore(artist.score);
                }}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-950 border border-slate-200 bg-slate-50 hover:bg-slate-100 py-1.5 rounded-lg w-full text-center transition-colors cursor-pointer"
              >
                بروزرسانی ممیزی فنی
              </button>
            </div>
          ))}
        </div>

        {/* Update score popup tool */}
        {selectedArtistToScore && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200 text-right">
              <div className="space-y-1 text-center">
                <h5 className="text-base font-bold text-slate-900">ارزیابی مجدد {selectedArtistToScore.name}</h5>
                <p className="text-xs text-slate-500">نمره جدید مهارت فنی آرتیست را پس از ممیزی ثبت کنید.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="font-semibold text-slate-600">امتیاز عملکرد نهایی:</span>
                    <span className="font-bold text-indigo-600">{toPersianDigits(newScore)} / ۱۰۰</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="100"
                    value={newScore}
                    onChange={(e) => setNewScore(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedArtistToScore(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2.5 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleUpdateArtistScore}
                    className="flex-1 bg-slate-900 hover:bg-slate-850 text-white text-xs py-2.5 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    ثبت امتیاز جدید
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* AI Marketing Campaign Manager */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6 relative overflow-hidden text-right">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            تولید هوشمند محتوای تبلیغاتی
          </div>
          <h4 className="text-lg font-bold text-slate-100 tracking-tight">پویش‌ساز و بازاریابی پیامکی با هوش مصنوعی</h4>
          <p className="text-xs text-slate-300">از دستیار آورا بخواهید بر اساس جشنواره شما، متن‌های ایمیل و پیامک جذاب و لوکس برای جذب مشتریان خلق کند.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1.5">بخش مشتریان هدف:</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 outline-none rounded-xl p-3 text-xs text-white font-semibold"
              >
                <option value="Active hair color seekers">مشتریان فعال خدمات رنگ مو</option>
                <option value="Loyal skin-reset subscribers">مشتریان وفادار پکیج‌های فیشیال پوست</option>
                <option value="Customers with no bookings in 60 days">مشتریان غیرفعال جهت بازگشت مجدد</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1.5">ایده و جزئیات جشنواره شما:</label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 outline-none rounded-xl p-3 text-xs text-white placeholder-slate-500 font-semibold"
                placeholder="تخفیف، نام عید، پکیج لوکس رایگان یا جشنواره خود را اینجا بنویسید..."
              />
            </div>

            <button
              onClick={handleGenerateCampaign}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-white text-indigo-600 hover:bg-slate-50 text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" /> : <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />}
              تولید پیش‌نویس متن بازاریابی با دستیار هوش مصنوعی
            </button>
          </div>

          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[16rem] text-right">
            <div>
              <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block mb-3.5">
                متن تبلیغاتی تولید شده توسط آورا:
              </span>
              {generatedMessage ? (
                <div className="text-xs text-slate-200 leading-relaxed space-y-2 whitespace-pre-line max-h-56 overflow-y-auto pr-2 text-right font-sans">
                  {generatedMessage}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic flex items-center justify-center h-28 text-center">
                  جزئیات جشنواره را در سمت راست توصیف کنید و دکمه را بزنید تا متن لوکس پیامک یا ایمیل شما در اینجا پدیدار شود.
                </div>
              )}
            </div>

            {generatedMessage && (
              <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-[10px] text-slate-400 mt-4 font-semibold">
                <span>پیش‌نویس آماده برای ارسال انبوه</span>
                <button
                  onClick={() => alert("ارسال با موفقیت شبیه‌سازی شد! پیامک‌ها در صف مخابرات قرار گرفتند.")}
                  className="bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                >
                  ارسال پیامک انبوه کمپین
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
