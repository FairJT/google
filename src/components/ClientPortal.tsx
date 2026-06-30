import React, { useState } from "react";
import { 
  Search, SlidersHorizontal, Sparkles, MapPin, Calendar as CalendarIcon, 
  Clock, CheckCircle, ArrowRight, Star, Heart, RefreshCw, Smartphone, CreditCard, ShieldAlert 
} from "lucide-react";
import { Salon, Artist, Service, Booking } from "../types";
import { salonsList, artistsList, servicesList } from "../data";
import { formatToman, toPersianDigits, isShamsiWeekend, PERSIAN_MONTHS } from "../utils/shamsi";
import PersianDatePicker from "./PersianDatePicker";

interface ClientPortalProps {
  onAddBooking: (booking: Booking) => void;
  currentUser: any;
  onOpenLogin: (role?: "client" | "admin" | "artist") => void;
}

export default function ClientPortal({ onAddBooking, currentUser, onOpenLogin }: ClientPortalProps) {
  // Local states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Semantic search results state
  const [semanticResults, setSemanticResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Booking Flow
  const [bookingStep, setBookingStep] = useState<"none" | "package" | "date" | "confirm">("none");
  const [selectedDate, setSelectedDate] = useState("1405/04/12"); // ۱۲ تیر ۱۴۰۵
  const [selectedTime, setSelectedTime] = useState("14:30");
  const [addBlowout, setAddBlowout] = useState(false);
  const [addTreatment, setAddTreatment] = useState(false);
  
  // Pricing states
  const [dynamicMultiplier, setDynamicMultiplier] = useState(1.0);
  const [dynamicPrice, setDynamicPrice] = useState(0);
  const [pricingReason, setPricingReason] = useState("نرخ پایه استاندارد اعمال شد.");
  const [pricingLoading, setPricingLoading] = useState(false);

  // Notification / Success simulation
  const [notification, setNotification] = useState<{ type: string; msg: string } | null>(null);

  // Categories
  const categories = ["All", "Hair", "Makeup", "Nails", "Skin"];
  const categoryNames: Record<string, string> = {
    All: "همه خدمات",
    Hair: "خدمات مو",
    Makeup: "میکاپ و آرایش",
    Nails: "خدمات ناخن",
    Skin: "مراقبت پوست"
  };

  // Run Semantic AI Search
  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSemanticResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch("/api/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, salons: salonsList, artists: artistsList }),
      });
      if (response.ok) {
        const data = await response.json();
        setSemanticResults(data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search and restore regular listing
  const handleClearSearch = () => {
    setSearchQuery("");
    setSemanticResults([]);
  };

  // Fetch AI Dynamic Pricing for current setup
  const updateDynamicPricing = async (service: Service, time: string, isWeekend: boolean) => {
    setPricingLoading(true);
    try {
      const response = await fetch("/api/dynamic-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: service.name,
          basePrice: service.basePrice,
          popularity: service.popularity,
          timeOfDay: parseInt(time.split(":")[0]) >= 12 && parseInt(time.split(":")[0]) < 17 ? "Peak Afternoon" : "Regular",
          dayOfWeek: isWeekend ? "Weekend" : "Weekday"
        })
      });
      if (response.ok) {
        const data = await response.json();
        setDynamicMultiplier(data.multiplier || 1.0);
        setDynamicPrice(data.finalPrice || service.basePrice);
        setPricingReason(data.reason || "محاسبه هوشمند نرخ به پایان رسید.");
      }
    } catch (err) {
      setDynamicPrice(service.basePrice);
      setPricingReason("محاسبه نرخ استاندارد بر اساس قیمت پایه انجام شد.");
    } finally {
      setPricingLoading(false);
    }
  };

  const handleStartBooking = (salon: Salon, service: Service) => {
    setSelectedSalon(salon);
    setSelectedService(service);
    // Find a matching artist who does this category
    const artist = artistsList.find(a => 
      a.skills.some(s => s.skill.toLowerCase().includes(service.category.toLowerCase()))
    ) || artistsList[0];
    setSelectedArtist(artist);
    setBookingStep("package");
    setDynamicPrice(service.basePrice);
    setAddBlowout(false);
    setAddTreatment(false);
    updateDynamicPricing(service, selectedTime, false);
  };

  const handleCompleteBooking = () => {
    if (!selectedSalon || !selectedArtist || !selectedService) return;

    let finalCost = dynamicPrice;
    if (addBlowout) finalCost += 150000;
    if (addTreatment) finalCost += 100000;

    const newBooking: Booking = {
      id: "b-" + Math.floor(Math.random() * 10000),
      salonId: selectedSalon.id,
      salonName: selectedSalon.name,
      artistId: selectedArtist.id,
      artistName: selectedArtist.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name + (addBlowout ? " + براشینگ تخصصی" : "") + (addTreatment ? " + ماسک کراتین" : ""),
      date: selectedDate,
      time: selectedTime,
      price: finalCost,
      status: "Confirmed",
      createdAt: new Date().toISOString()
    };

    onAddBooking(newBooking);
    setBookingStep("none");
    
    // Simulate notification trigger
    setNotification({
      type: "sms",
      msg: `تأیید شد! نوبت شما برای خدمت «${newBooking.serviceName}» در ${newBooking.salonName} با متخصص ${newBooking.artistName} در تاریخ ${toPersianDigits(newBooking.date)} ساعت ${toPersianDigits(newBooking.time)} با موفقیت ثبت شد. مبلغ: ${formatToman(finalCost)}.`
    });

    // Auto fade notification
    setTimeout(() => {
      setNotification(null);
    }, 10000);
  };

  // Filter salons by category
  const filteredSalons = salonsList.filter(salon => {
    if (selectedCategory === "All") return true;
    return salon.services.some(s => s.category === selectedCategory);
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-300" dir="rtl">
      
      {/* Interactive SMS Notification Simulator */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 max-w-sm bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3.5 animate-in slide-in-from-top duration-300">
          <div className="p-2 bg-slate-850 rounded-xl text-indigo-400">
            <Smartphone className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans tracking-wide font-semibold text-indigo-400 uppercase">پیامک تأیید نوبت</span>
              <span className="text-[9px] font-sans text-slate-500">هم‌اکنون</span>
            </div>
            <p className="text-xs text-slate-200 font-sans leading-relaxed text-right">{notification.msg}</p>
          </div>
        </div>
      )}

      {/* Semantic Search Panel */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-800 relative overflow-hidden text-right">
        {/* Decorative background aura */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-slate-500/10 rounded-full blur-3xl -mr-20 -mb-20 pointer-events-none"></div>

        <div className="max-w-2xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-750 text-indigo-400 px-3 py-1 rounded-full text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            قدرتمند شده با هوش مصنوعی جمینی
          </div>
          <h2 className="text-2xl md:text-3xl font-sans font-bold tracking-tight leading-none text-slate-50">
            کدام استایل با سلیقه و روحیه شما هماهنگ است؟
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            استایل رویایی، روش دلخواه یا نوع پوست خود را بنویسید. هوش مصنوعی ما مهارت‌های متخصصین و نظرات سالن‌ها را بررسی کرده و بهترین گزینه‌ها را به شما پیشنهاد می‌دهد.
          </p>

          <form onSubmit={handleSemanticSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="مثال: به دنبال یک هیرکالریست با تجربه برای آمبره عسلی یا فیشیال آرامش‌بخش هستم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-indigo-500 outline-none rounded-xl py-3.5 pr-11 pl-4 text-xs text-white placeholder-slate-500 transition-colors text-right"
              />
              <Search className="w-4 h-4 text-slate-500 absolute right-4 top-4" />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="bg-indigo-600 text-white font-semibold px-6 py-3.5 rounded-xl text-xs hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : "جستجوی هوشمند"}
            </button>
          </form>

          {/* Prompt chips */}
          <div className="flex flex-wrap gap-2 pt-2 items-center">
            <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider font-bold">پیشنهادها:</span>
            <button
              type="button"
              onClick={() => { setSearchQuery("میکاپ طبیعی ملایم با ماندگاری بالا"); }}
              className="text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/50 px-2.5 py-1 rounded-lg transition-colors font-medium"
            >
              "میکاپ طبیعی ملایم"
            </button>
            <button
              type="button"
              onClick={() => { setSearchQuery("طراحی ژورنالی ناخن با دیزاین دستی مینیمال"); }}
              className="text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/50 px-2.5 py-1 rounded-lg transition-colors font-medium"
            >
              "طراحی ژورنالی ناخن"
            </button>
            <button
              type="button"
              onClick={() => { setSearchQuery("هیدروفیشیال و پاکسازی عمیق منافذ پوست"); }}
              className="text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/50 px-2.5 py-1 rounded-lg transition-colors font-medium"
            >
              "پاکسازی عمیق فیشیال"
            </button>
          </div>
        </div>
      </section>

      {/* Semantic Matches Block */}
      {searchQuery && (
        <section className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 md:p-8 space-y-6 text-right">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-sans font-bold text-indigo-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              پیشنهادهای رتبه‌بندی شده با هوش مصنوعی ({toPersianDigits(semanticResults.length || 0)})
            </h3>
            <button
              onClick={handleClearSearch}
              className="text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-100 bg-white px-2.5 py-1 rounded-lg font-semibold"
            >
              مشاهده همه سالن‌ها
            </button>
          </div>

          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs text-slate-500 font-sans">در حال دریافت و تحلیل هوشمندانه داده‌ها با هوش مصنوعی جمینی...</p>
            </div>
          ) : semanticResults.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {semanticResults.map((res: any, idx: number) => {
                // Find matching item in local data arrays to book
                const originalSalon = salonsList.find(s => s.name.toLowerCase().includes(res.name.toLowerCase()));
                const originalArtist = artistsList.find(a => a.name.toLowerCase().includes(res.name.toLowerCase()));
                
                return (
                  <div key={idx} className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-4 text-right">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-sans font-semibold tracking-wide text-indigo-600">
                          {res.type === "salon" ? "سالن منتخب" : "متخصص منتخب"}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{res.name}</h4>
                      </div>
                      <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-sans font-bold border border-indigo-100">
                        <Star className="w-3.5 h-3.5 fill-indigo-500 stroke-indigo-500" />
                        {toPersianDigits(res.matchScore)}٪ تطابق استایل
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                      « {res.matchReason} »
                    </p>

                    {originalSalon && (
                      <button
                        onClick={() => handleStartBooking(originalSalon, originalSalon.services[0])}
                        className="w-full bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <span>رزرو پکیج در {originalSalon.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-300 rotate-180" />
                      </button>
                    )}

                    {originalArtist && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <img src={originalArtist.image} alt={originalArtist.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                          <div>
                            <p className="text-xs font-bold text-slate-850">{originalArtist.role}</p>
                            <p className="text-[10px] text-slate-500">امتیاز ارزیابی: {toPersianDigits(originalArtist.score)} از ۱۰۰</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartBooking(salonsList[0], salonsList[0].services.find(s => s.category === "Hair") || salonsList[0].services[0])}
                          className="w-full bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                          <span>رزرو پکیج با {originalArtist.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-300 rotate-180" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              پاسخی یافت نشد. لطفاً از فیلترهای سنتی دسته‌بندی استفاده کنید.
            </div>
          )}
        </section>
      )}

      {/* Traditional Navigation / Explore */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-600" />
          <h3 className="text-xs font-sans font-bold tracking-wider text-slate-400">
            جستجو بر اساس دسته‌بندی خدمات
          </h3>
        </div>
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {categoryNames[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Salons and Packages Grid */}
      <div className="grid lg:grid-cols-3 gap-8 text-right">
        
        {/* Salon Listings */}
        <div className="lg:col-span-2 space-y-8">
          <div className="border-r-4 border-indigo-600 pr-4 py-1">
            <h4 className="text-lg font-sans font-bold text-slate-950">شعب رسمی و خانه‌های زیبایی لجند</h4>
            <p className="text-xs text-slate-400 mt-1">امکانات فوق مدرن و خدمات سفارشی تایید شده تحت نظارت پزشک متخصص</p>
          </div>
          
          <div className="space-y-8">
            {filteredSalons.map((salon) => (
              <div 
                key={salon.id} 
                className="bg-white border border-slate-100 rounded-[28px] overflow-hidden shadow-[0_4px_20px_-4px_rgba(148,163,184,0.12)] hover:shadow-[0_20px_40px_-8px_rgba(99,102,241,0.12)] hover:border-indigo-100 transition-all duration-500 group"
              >
                {/* Salon Cover Image */}
                <div className="h-56 md:h-64 relative overflow-hidden">
                  <img 
                    src={salon.image} 
                    alt={salon.name} 
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-90"></div>
                  
                  {/* Status Badges on Image */}
                  <div className="absolute top-4 right-4 bg-indigo-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl text-[10px] font-bold tracking-wide shadow-sm flex items-center gap-1.5 border border-indigo-700/50">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" /> 
                    <span>عضو رسمی پلتفرم لجند</span>
                  </div>

                  <div className="absolute bottom-4 right-6 left-6 flex justify-between items-end">
                    <div className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-bold text-slate-800 shadow-sm flex items-center gap-1 border border-slate-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                      <span>{toPersianDigits(salon.rating)}</span>
                      <span className="text-slate-400 font-normal">({toPersianDigits(salon.reviews)} نظر)</span>
                    </div>
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-7 md:p-8 space-y-6">
                  <div className="space-y-2">
                    <h5 className="text-xl font-bold text-slate-950 leading-tight group-hover:text-indigo-600 transition-colors duration-300">
                      {salon.name}
                    </h5>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" /> 
                      <span>{salon.location}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl bg-slate-50/50 p-4 rounded-2xl border border-slate-100/70 italic">
                    {salon.description}
                  </p>

                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs tracking-wide font-extrabold text-slate-400 uppercase">پکیج‌ها و منوی خدمات لوکس در دسترس</p>
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-lg font-bold">قیمت‌گذاری هوشمند فعال</span>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-5">
                      {salon.services.map((srv) => (
                        <div 
                          key={srv.id} 
                          className="relative bg-white border border-slate-100 rounded-[24px] p-5.5 hover:border-indigo-100 hover:shadow-[0_20px_40px_-12px_rgba(99,102,241,0.1)] transition-all duration-300 flex flex-col justify-between group/service overflow-hidden"
                        >
                          {/* Accent hover glow bar */}
                          <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-l from-indigo-500 to-indigo-600 opacity-0 group-hover/service:opacity-100 transition-opacity duration-300"></div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex gap-1.5 items-center">
                                <span className="text-[9px] bg-slate-50 text-slate-600 border border-slate-200/60 px-2.5 py-1 rounded-lg font-extrabold">{categoryNames[srv.category]}</span>
                                {srv.popularity >= 9 ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-600 bg-amber-50/70 border border-amber-100/50 px-2 py-0.5 rounded-lg">
                                    <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-400" />
                                    <span>محبوب</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-indigo-600 bg-indigo-50/40 border border-indigo-100/30 px-2 py-0.5 rounded-lg">
                                    <span>تقاضای بالا</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[13px] font-sans font-black text-indigo-600 bg-indigo-50/60 border border-indigo-100/40 px-3 py-1 rounded-xl">{formatToman(srv.basePrice)}</span>
                            </div>
                            
                            <h6 className="text-sm font-extrabold text-slate-900 group-hover/service:text-indigo-600 transition-colors duration-300 leading-snug">
                              {srv.name}
                            </h6>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {srv.description}
                            </p>
                          </div>
                          
                          <div className="mt-5 pt-3.5 border-t border-slate-100/80 flex items-center justify-between">
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                              <Clock className="w-4 h-4 text-slate-300" />
                              <span>{toPersianDigits(srv.duration)} دقیقه</span>
                            </div>
                            <button
                              onClick={() => handleStartBooking(salon, srv)}
                              className="text-[11px] font-extrabold text-white bg-slate-900 hover:bg-indigo-600 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-[0_4px_12px_-3px_rgba(15,23,42,0.15)] hover:shadow-[0_4px_16px_-3px_rgba(99,102,241,0.3)] active:scale-95"
                            >
                              <span>رزرو سریع نوبت</span>
                              <ArrowRight className="w-3.5 h-3.5 rotate-180 transition-transform duration-300 group-hover/service:-translate-x-1" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Artist Profiles with Skill Matrix */}
        <div className="space-y-6">
          <h4 className="text-base font-sans font-bold text-slate-900">متخصصین برجسته و همکار</h4>
          <div className="space-y-4">
            {artistsList.map((artist) => (
              <div key={artist.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-right">
                <div className="flex items-center gap-4">
                  <img src={artist.image} alt={artist.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-100" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[9px] text-slate-400 font-bold">پروفایل متخصص</h5>
                    <h6 className="text-sm font-bold text-slate-900 truncate">{artist.name}</h6>
                    <p className="text-xs text-slate-500 truncate">{artist.role}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs border-y border-slate-100 py-2">
                  <span className="text-slate-500 font-bold">امتیاز ارزیابی سامانه:</span>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">{toPersianDigits(artist.score)} از ۱۰۰</span>
                </div>

                {/* Skill Matrix */}
                <div className="space-y-2.5">
                  <p className="text-[9px] tracking-wider font-bold text-slate-400">ماتریس مهارت‌های تایید شده:</p>
                  {artist.skills.map((sk, sIdx) => (
                    <div key={sIdx} className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-700 font-medium">
                        <span>{sk.skill}</span>
                        <span className="font-sans font-semibold">{toPersianDigits(sk.percentage)}٪</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-l from-indigo-500 to-indigo-600 rounded-full" 
                          style={{ width: `${sk.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Dialog Modal */}
      {bookingStep !== "none" && selectedSalon && selectedService && selectedArtist && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 text-right">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] tracking-wide text-indigo-400 font-bold">تنظیم هوشمند نوبت و افزونه‌ها</span>
                <h3 className="text-lg font-bold">{selectedService.name}</h3>
                <p className="text-xs text-slate-400">{selectedSalon.name}</p>
              </div>
              <button
                onClick={() => setBookingStep("none")}
                className="text-slate-400 hover:text-white border border-slate-800 bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold"
              >
                بستن
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              
              {/* Steps Tab Tracker */}
              <div className="flex items-center justify-center gap-1.5 border-b border-slate-100 pb-4" dir="ltr">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${bookingStep === "package" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>۱. خدمات سفارشی</span>
                <span className="text-slate-300 text-[10px]">&gt;</span>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${bookingStep === "date" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>۲. زمان‌بندی شمسی</span>
                <span className="text-slate-300 text-[10px]">&gt;</span>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${bookingStep === "confirm" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>۳. تایید نهایی</span>
              </div>

              {bookingStep === "package" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <p className="text-[10px] tracking-wider font-bold text-slate-400">متخصص اختصاص یافته به شما:</p>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                      <img src={selectedArtist.image} alt={selectedArtist.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <h6 className="text-xs font-bold text-slate-850">{selectedArtist.name}</h6>
                        <p className="text-[10px] text-slate-500">{selectedArtist.role} • رضایت {toPersianDigits(selectedArtist.rating)} از ۵</p>
                      </div>
                    </div>
                  </div>

                  {/* Service Customizer / Package Builder */}
                  <div className="space-y-3">
                    <p className="text-[10px] tracking-wide font-bold text-slate-400">افزونه‌های لوکس پیشنهادی:</p>
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50/50 cursor-pointer text-right">
                        <input
                          type="checkbox"
                          checked={addBlowout}
                          onChange={(e) => setAddBlowout(e.target.checked)}
                          className="mt-1 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 ml-2"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>براشینگ و استایل تخصصی مو</span>
                            <span className="text-indigo-600 font-bold">+{formatToman(150000)}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">افزودن ۳۰ دقیقه حالت‌دهی و فر کردن یا لخت کردن ژورنالی موها.</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50/50 cursor-pointer text-right">
                        <input
                          type="checkbox"
                          checked={addTreatment}
                          onChange={(e) => setAddTreatment(e.target.checked)}
                          className="mt-1 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 ml-2"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>ماسک آب‌رسان قوی خاویار</span>
                            <span className="text-indigo-600 font-bold">+{formatToman(100000)}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">ماسک بازسازی‌کننده عمیق و آبرسان کلاژن و خاویار برای لطافت بی‌نظیر مو.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {bookingStep === "date" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Real-time Dynamic pricing simulator control */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3 text-right">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] tracking-wide font-bold text-indigo-400">قیمت‌گذاری پویای تقاضا</span>
                      {pricingLoading ? (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" /> در حال تحلیل قیمت...
                        </span>
                      ) : (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded font-bold">
                          ضریب تقاضا: {toPersianDigits(dynamicMultiplier)}x
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300">قیمت با احتساب تقاضای زمان نوبت:</span>
                      <span className="text-lg font-bold text-white">{formatToman(dynamicPrice)}</span>
                    </div>

                    <p className="text-[11px] text-indigo-300 leading-relaxed bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                      وضعیت: <span className="text-slate-100">{pricingReason}</span>
                    </p>
                  </div>

                  {/* Shamsi Calendar Inputs integrated */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">انتخاب تاریخ از تقویم خورشیدی:</label>
                      <PersianDatePicker
                        value={selectedDate}
                        onChange={(newVal, isW) => {
                          setSelectedDate(newVal);
                          updateDynamicPricing(selectedService, selectedTime, isW);
                        }}
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">انتخاب ساعت:</label>
                        <input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => {
                            setSelectedTime(e.target.value);
                            const parts = selectedDate.split("/");
                            let isW = false;
                            if (parts.length === 3) {
                              isW = isShamsiWeekend(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
                            }
                            updateDynamicPricing(selectedService, e.target.value, isW);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500 text-center font-bold"
                        />
                      </div>

                      {/* Quick availability slots picker */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400">ساعت‌های پیشنهادی پرتقاضا:</p>
                        <div className="grid grid-cols-2 gap-2" dir="ltr">
                          {["09:00", "11:30", "14:30", "16:00"].map((t) => (
                            <button
                              type="button"
                              key={t}
                              onClick={() => {
                                setSelectedTime(t);
                                const parts = selectedDate.split("/");
                                let isW = false;
                                if (parts.length === 3) {
                                  isW = isShamsiWeekend(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
                                }
                                updateDynamicPricing(selectedService, t, isW);
                              }}
                              className={`py-2 text-xs rounded-lg border text-center transition-all ${
                                selectedTime === t
                                  ? "bg-indigo-600 border-indigo-600 text-white font-bold shadow-sm"
                                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                              }`}
                            >
                              {toPersianDigits(t)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {bookingStep === "confirm" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-right">
                    <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                      <span className="text-slate-500">خدمت اصلی</span>
                      <span className="font-bold text-slate-900">{selectedService.name}</span>
                    </div>
                    {addBlowout && (
                      <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                        <span className="text-slate-500">براشینگ و استایل مو</span>
                        <span className="font-bold text-slate-900">{formatToman(150000)}</span>
                      </div>
                    )}
                    {addTreatment && (
                      <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                        <span className="text-slate-500">ماسک کلاژن و خاویار</span>
                        <span className="font-bold text-slate-900">{formatToman(100000)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                      <span className="text-slate-500">تاریخ و ساعت رزرو</span>
                      <span className="font-bold text-slate-900">{toPersianDigits(selectedDate)} در ساعت {toPersianDigits(selectedTime)}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                      <span className="text-slate-500">هنرمند متخصص</span>
                      <span className="font-bold text-slate-900">{selectedArtist.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2">
                      <span className="font-bold text-slate-800">جمع کل هزینه نوبت:</span>
                      <span className="font-bold text-lg text-indigo-600">
                        {formatToman(dynamicPrice + (addBlowout ? 150000 : 0) + (addTreatment ? 100000 : 0))}
                      </span>
                    </div>
                  </div>

                  {/* Payment Simulator */}
                  <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 justify-end">
                      شبیه‌ساز درگاه پرداخت کارت‌های بانکی شتاب
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                    </span>
                    <div className="grid grid-cols-3 gap-2" dir="ltr">
                      <div className="col-span-2 bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs text-center font-bold text-slate-750">
                        ۶۰۳۷ ۹۹۱۹ •••• ۴۲۴۲
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs text-center font-bold text-slate-750">
                        ۱۴۰۹
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans text-right">
                      این درگاه پرداخت آزمایشی برای تایید نهایی نوبت در بستر شتاب توسعه داده شده است. امنیت کارت شما توسط سامانه تضمین می‌شود.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {bookingStep === "package" && (
                <>
                  <div></div>
                  <button
                    onClick={() => setBookingStep("date")}
                    className="bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm mr-auto"
                  >
                    <span>تنظیم تقویم و ساعت</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </>
              )}

              {bookingStep === "date" && (
                <>
                  <button
                    onClick={() => setBookingStep("package")}
                    className="text-slate-600 hover:text-slate-900 text-xs font-bold"
                  >
                    بازگشت به خدمات افزونه
                  </button>
                  <button
                    onClick={() => setBookingStep("confirm")}
                    className="bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>بررسی نهایی رزرو</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </>
              )}

              {bookingStep === "confirm" && (
                <>
                  <button
                    onClick={() => setBookingStep("date")}
                    className="text-slate-600 hover:text-slate-900 text-xs font-bold"
                  >
                    بازگشت به تقویم
                  </button>
                  {currentUser ? (
                    <button
                      onClick={handleCompleteBooking}
                      className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/15 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      ثبت و پرداخت نهایی نوبت
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenLogin("client")}
                      className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/15 transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
                    >
                      ورود به حساب مشتری و ثبت نوبت
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
