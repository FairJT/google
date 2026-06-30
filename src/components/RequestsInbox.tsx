import React, { useState } from "react";
import { User, HiringOffer, ClientRequest } from "../types";
import { Inbox, ArrowUpRight, ArrowDownLeft, Check, X, Clock, HelpCircle, Phone, Calendar, UserCheck, DollarSign, ChevronRight, ChevronLeft, CalendarDays } from "lucide-react";
import { toPersianDigits, PERSIAN_MONTHS, jalaliToGregorian, isShamsiWeekend } from "../utils/shamsi";

interface RequestsInboxProps {
  currentUser: User;
  hiringOffers: HiringOffer[];
  onUpdateHiringOffers: (offers: HiringOffer[]) => void;
  clientRequests: ClientRequest[];
  onUpdateClientRequests: (requests: ClientRequest[]) => void;
}

interface ScheduleCalendarViewProps {
  incomingRequests: ClientRequest[];
  onUpdateStatus: (requestId: string, newStatus: "accepted" | "declined") => void;
  getStatusPill: (status: "pending" | "accepted" | "declined") => React.ReactNode;
}

function ScheduleCalendarView({ incomingRequests, onUpdateStatus, getStatusPill }: ScheduleCalendarViewProps) {
  const [year, setYear] = useState(1405);
  const [month, setMonth] = useState(4); // default Tir
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const getDaysInMonth = (y: number, m: number) => {
    if (m >= 1 && m <= 6) return 31;
    if (m >= 7 && m <= 11) return 30;
    const isLeap = (y - 1399) % 4 === 0;
    return isLeap ? 30 : 29;
  };

  const getFirstDayOffset = (y: number, m: number) => {
    const [gy, gm, gd] = jalaliToGregorian(y, m, 1);
    const date = new Date(gy, gm - 1, gd);
    const day = date.getDay(); // 0 is Sunday, ..., 6 is Saturday
    const standardToIr = [1, 2, 3, 4, 5, 6, 0];
    return standardToIr[day];
  };

  const IR_WEEKDAYS_ORDER = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];
  const daysInMonth = getDaysInMonth(year, month);
  const offset = getFirstDayOffset(year, month);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(prev => prev - 1);
    } else {
      setMonth(prev => prev - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(prev => prev + 1);
    } else {
      setMonth(prev => prev + 1);
    }
    setSelectedDay(null);
  };

  const dayCells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) {
    dayCells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    dayCells.push(i);
  }

  const pad = (n: number) => n.toString().padStart(2, "0");
  const getSelectedDateString = (dayNum: number) => `${year}/${pad(month)}/${pad(dayNum)}`;

  // Find requests for selected day
  const selectedDateStr = selectedDay ? getSelectedDateString(selectedDay) : "";
  const selectedDayRequests = incomingRequests.filter(r => r.preferredDate === selectedDateStr);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4.5 space-y-4 shadow-xs text-right font-sans" dir="rtl">
      {/* Calendar Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="font-extrabold text-sm text-[#6B7A4F] tracking-wide">
            {PERSIAN_MONTHS[month - 1]} {toPersianDigits(year)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday Labels (Saturday first) */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
        {IR_WEEKDAYS_ORDER.map((wd, idx) => (
          <div key={idx} className={idx === 6 ? "text-rose-500" : ""}>
            {wd}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {dayCells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-11"></div>;
          }

          const dateStr = `${year}/${pad(month)}/${pad(day)}`;
          const dayReqs = incomingRequests.filter(r => r.preferredDate === dateStr);
          const accepted = dayReqs.filter(r => r.status === "accepted");
          const pending = dayReqs.filter(r => r.status === "pending");

          const isSelected = selectedDay === day;
          const isWeekend = idx % 7 === 6 || idx % 7 === 5; // Friday or Thursday weekend

          return (
            <button
              type="button"
              key={`day-${day}`}
              onClick={() => setSelectedDay(day)}
              className={`h-11 rounded-xl flex flex-col items-center justify-between py-1 transition-all border relative cursor-pointer ${
                isSelected
                  ? "bg-[#6B7A4F]/10 border-[#6B7A4F] text-[#6B7A4F] font-black ring-1 ring-[#6B7A4F]/25 shadow-2xs"
                  : isWeekend
                  ? "border-transparent text-rose-500 bg-slate-50/50 hover:bg-slate-50"
                  : "border-transparent text-slate-700 bg-slate-50/20 hover:bg-slate-50"
              }`}
            >
              <span className="text-xs font-semibold">{toPersianDigits(day)}</span>
              
              {/* Count Indicator */}
              {dayReqs.length > 0 && (
                <div className="flex gap-0.5 justify-center items-center scale-90 mb-0.5">
                  {accepted.length > 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex items-center justify-center text-[7px] text-white font-bold" title={`${accepted.length} نوبت تایید شده`}>
                      {toPersianDigits(accepted.length)}
                    </span>
                  )}
                  {pending.length > 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex items-center justify-center text-[7px] text-white font-bold animate-pulse" title={`${pending.length} نوبت معلق`}>
                      {toPersianDigits(pending.length)}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Agenda View */}
      <div className="border-t border-slate-100 pt-3 mt-1.5 space-y-3">
        {selectedDay ? (
          <>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-[#6B7A4F]" />
                برنامه کاری روز {toPersianDigits(selectedDay)} {PERSIAN_MONTHS[month - 1]} :
              </h4>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                {toPersianDigits(selectedDayRequests.length)} نوبت ثبت شده
              </span>
            </div>

            {selectedDayRequests.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedDayRequests.map((req) => (
                  <div key={req.id} className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-black text-slate-900">{req.clientName}</h5>
                        <p className="text-[9px] text-slate-500 font-bold flex items-center gap-1 mt-0.5" dir="ltr">
                          <span>{req.clientPhone}</span> <Phone className="w-2.5 h-2.5 text-slate-400" />
                        </p>
                      </div>
                      {getStatusPill(req.status)}
                    </div>

                    <div className="bg-white p-2 rounded-lg text-xs text-slate-700 border border-slate-100 space-y-1">
                      <p className="font-bold text-[#6B7A4F]">خدمات: {req.serviceType}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> ساعت حضور: <span className="font-bold text-slate-800">{toPersianDigits(req.preferredTime)}</span>
                      </p>
                      {req.note && (
                        <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100">توضیحات: {req.note}</p>
                      )}
                    </div>

                    {req.status === "pending" && (
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(req.id, "accepted")}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] font-bold py-1 rounded-lg transition-all cursor-pointer"
                        >
                          تایید نوبت
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(req.id, "declined")}
                          className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[9.5px] font-bold py-1 rounded-lg transition-all cursor-pointer"
                        >
                          رد درخواست
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold">هیچ رزرو نوبتی برای این روز ثبت نشده است. روز آزاد کاری شماست! 🌸</p>
              </div>
            )}
          </>
        ) : (
          <div className="p-5 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-[10.5px] text-slate-500 font-bold">📅 جهت مشاهده جزئیات برنامه کاری و تایید سریع نوبت‌ها، روی یکی از روزهای تقویم بالا کلیک کنید.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RequestsInbox({
  currentUser,
  hiringOffers,
  onUpdateHiringOffers,
  clientRequests,
  onUpdateClientRequests
}: RequestsInboxProps) {
  // CALENDAR & PLANNING STATES
  const [calYear, setCalYear] = useState(1405);
  const [calMonth, setCalMonth] = useState(4); // default to Tir
  const [selectedCalDay, setSelectedCalDay] = useState<number | null>(null);
  
  // View mode toggles
  const [managerViewMode, setManagerViewMode] = useState<"list" | "calendar">("calendar");
  const [artistViewMode, setArtistViewMode] = useState<"list" | "calendar">("calendar");

  // Saturday-starting Shamsi Calendar Helpers
  const getDaysInMonth = (y: number, m: number) => {
    if (m >= 1 && m <= 6) return 31;
    if (m >= 7 && m <= 11) return 30;
    const isLeap = (y - 1399) % 4 === 0;
    return isLeap ? 30 : 29;
  };

  const getFirstDayOffset = (y: number, m: number) => {
    const [gy, gm, gd] = jalaliToGregorian(y, m, 1);
    const date = new Date(gy, gm - 1, gd);
    const day = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const standardToIr = [1, 2, 3, 4, 5, 6, 0];
    return standardToIr[day];
  };

  const IR_WEEKDAYS_ORDER = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];

  // FILTER DATA PER ROLE
  // --- Salon Manager ---
  // - Incoming: ClientRequests where targetId === manager's salon or manager's user id
  // - Outgoing: HiringOffers where managerId === currentUser.id
  const managerIncomingRequests = clientRequests.filter(
    r => r.targetType === "salon" && (r.targetId === currentUser.id || r.targetId === "m1" || r.targetId === "m2" || r.targetId === "m3" || r.targetId === "m4" || r.targetId === "m5")
  );
  const managerOutgoingOffers = hiringOffers.filter(o => o.managerId === currentUser.id);

  // --- Artist ---
  // - Incoming Offers: HiringOffers where artistId === currentUser.id
  // - Incoming Requests: ClientRequests where targetId === currentUser.id && targetType === "artist"
  const artistIncomingOffers = hiringOffers.filter(o => o.artistId === currentUser.id);
  const artistIncomingRequests = clientRequests.filter(r => r.targetId === currentUser.id && r.targetType === "artist");

  // --- Client ---
  // - Outgoing Requests: ClientRequests where clientId === currentUser.id
  const clientOutgoingRequests = clientRequests.filter(r => r.clientId === currentUser.id);

  // ACTION HANDLERS
  const handleUpdateOfferStatus = (offerId: string, newStatus: "accepted" | "declined") => {
    const updated = hiringOffers.map(o => {
      if (o.id === offerId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    onUpdateHiringOffers(updated);
    alert(`پیشنهاد همکاری با موفقیت ${newStatus === "accepted" ? "پذیرفته" : "رد"} شد.`);
  };

  const handleUpdateClientRequestStatus = (requestId: string, newStatus: "accepted" | "declined") => {
    const updated = clientRequests.map(r => {
      if (r.id === requestId) {
        return { ...r, status: newStatus };
      }
      return r;
    });
    onUpdateClientRequests(updated);
    alert(`درخواست نوبت مراجع با موفقیت ${newStatus === "accepted" ? "پذیرفته" : "رد"} شد.`);
  };

  const getStatusPill = (status: "pending" | "accepted" | "declined") => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3" /> در انتظار بررسی
          </span>
        );
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
            <Check className="w-3 h-3" /> پذیرفته شده
          </span>
        );
      case "declined":
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
            <X className="w-3 h-3" /> رد شده
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Box Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-2.5">
        <Inbox className="w-5 h-5 text-[#6B7A4F]" />
        <div>
          <h2 className="text-base font-bold text-slate-950">صندوق ورودی و خروجی درخواست‌ها</h2>
          <p className="text-[11px] text-slate-500">لیست کلیه پیشنهادهای همکاری پرسنلی و رزرو نوبت‌های ثبت شده در شبکه شما.</p>
        </div>
      </div>

      {/* VIEW FOR SALON MANAGER */}
      {currentUser.role === "manager" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Incoming: Client Bookings */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <ArrowDownLeft className="w-4 h-4 text-emerald-600 animate-pulse" />
                درخواست‌های نوبت ورودی از طرف مشتریان ({toPersianDigits(managerIncomingRequests.length)})
              </h3>
              
              {/* Toggle views */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg gap-0.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setManagerViewMode("calendar")}
                  className={`px-3 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                    managerViewMode === "calendar"
                      ? "bg-[#6B7A4F] text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  📅 تقویم نوبت‌ها
                </button>
                <button
                  type="button"
                  onClick={() => setManagerViewMode("list")}
                  className={`px-3 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                    managerViewMode === "list"
                      ? "bg-[#6B7A4F] text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  📥 لیست صندوق
                </button>
              </div>
            </div>
            
            {managerViewMode === "calendar" ? (
              <ScheduleCalendarView
                incomingRequests={managerIncomingRequests}
                onUpdateStatus={handleUpdateClientRequestStatus}
                getStatusPill={getStatusPill}
              />
            ) : (
              <div className="space-y-3">
                {managerIncomingRequests.length > 0 ? (
                  managerIncomingRequests.map((req) => (
                    <div key={req.id} className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-2xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{req.clientName}</h4>
                          <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 mt-0.5" dir="ltr">
                            <span>{req.clientPhone}</span> <Phone className="w-3 h-3 text-slate-400" />
                          </p>
                        </div>
                        {getStatusPill(req.status)}
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-700 space-y-1">
                        <p className="font-bold text-[#6B7A4F]">خدمات درخواستی: {req.serviceType}</p>
                        <p className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Calendar className="w-3 h-3" /> تاریخ {toPersianDigits(req.preferredDate)} در ساعت {toPersianDigits(req.preferredTime)}
                        </p>
                        {req.note && (
                          <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-150">توضیحات: {req.note}</p>
                        )}
                      </div>

                      {req.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateClientRequestStatus(req.id, "accepted")}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition-all"
                          >
                            تایید نوبت
                          </button>
                          <button
                            onClick={() => handleUpdateClientRequestStatus(req.id, "declined")}
                            className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold py-1.5 rounded-lg transition-all"
                          >
                            رد درخواست
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
                    <p className="text-[11px] text-slate-400 font-bold">هیچ درخواست نوبت مشتری در یافت نشد.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Outgoing: Hiring Offers Sent to Artists */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4 text-indigo-600" />
              پیشنهادهای استخدامی ارسالی شما به آرتیست‌ها ({toPersianDigits(managerOutgoingOffers.length)})
            </h3>

            <div className="space-y-3">
              {managerOutgoingOffers.length > 0 ? (
                managerOutgoingOffers.map((offer) => (
                  <div key={offer.id} className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">گیرنده: {offer.artistName}</h4>
                      {getStatusPill(offer.status)}
                    </div>
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg leading-relaxed">{offer.message}</p>
                    {offer.offerAmount && (
                      <div className="text-[10px] text-indigo-600 font-bold">مبلغ پیشنهادی: {offer.offerAmount}</div>
                    )}
                    <div className="text-[9px] text-slate-400 font-bold">ثبت شده در: {toPersianDigits(offer.createdAt)}</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-bold">تاکنون پیشنهاد استخدام فعالی ارسال نکرده‌اید.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW FOR ARTISTS */}
      {currentUser.role === "artist" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Incoming: Recruiter Hiring Offers */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowDownLeft className="w-4 h-4 text-purple-600" />
              پیشنهادهای همکاری و استخدام مدیران سالن ({toPersianDigits(artistIncomingOffers.length)})
            </h3>

            <div className="space-y-3">
              {artistIncomingOffers.length > 0 ? (
                artistIncomingOffers.map((offer) => (
                  <div key={offer.id} className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{offer.managerName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold">{offer.salonName}</p>
                      </div>
                      {getStatusPill(offer.status)}
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-700 leading-relaxed space-y-1">
                      <p>{offer.message}</p>
                      {offer.offerAmount && (
                        <p className="text-[10px] text-indigo-600 font-bold pt-1.5 border-t border-slate-150">بسته پیشنهادی: {offer.offerAmount}</p>
                      )}
                    </div>

                    {offer.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateOfferStatus(offer.id, "accepted")}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition-all"
                        >
                          پذیرش و همکاری
                        </button>
                        <button
                          onClick={() => handleUpdateOfferStatus(offer.id, "declined")}
                          className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold py-1.5 rounded-lg transition-all"
                        >
                          رد پیشنهاد
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-bold">هیچ پیشنهاد همکاری از طرف مدیران سالن‌ها دریافت نشده است.</p>
                </div>
              )}
            </div>
          </div>

          {/* Incoming: Client Service Bookings */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <ArrowDownLeft className="w-4 h-4 text-emerald-600 animate-pulse" />
                درخواست‌های نوبت ورودی مشتریان ({toPersianDigits(artistIncomingRequests.length)})
              </h3>

              {/* Toggle views */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg gap-0.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setArtistViewMode("calendar")}
                  className={`px-3 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                    artistViewMode === "calendar"
                      ? "bg-[#6B7A4F] text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  📅 تقویم کاری
                </button>
                <button
                  type="button"
                  onClick={() => setArtistViewMode("list")}
                  className={`px-3 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                    artistViewMode === "list"
                      ? "bg-[#6B7A4F] text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  📥 لیست صندوق
                </button>
              </div>
            </div>

            {artistViewMode === "calendar" ? (
              <ScheduleCalendarView
                incomingRequests={artistIncomingRequests}
                onUpdateStatus={handleUpdateClientRequestStatus}
                getStatusPill={getStatusPill}
              />
            ) : (
              <div className="space-y-3">
                {artistIncomingRequests.length > 0 ? (
                  artistIncomingRequests.map((req) => (
                    <div key={req.id} className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-2xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{req.clientName}</h4>
                          <p className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5" dir="ltr">
                            <span>{req.clientPhone}</span> <Phone className="w-3 h-3 text-slate-400" />
                          </p>
                        </div>
                        {getStatusPill(req.status)}
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-700 space-y-1">
                        <p className="font-bold text-[#6B7A4F]">خدمات درخواستی: {req.serviceType}</p>
                        <p className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Calendar className="w-3 h-3" /> تاریخ {toPersianDigits(req.preferredDate)} در ساعت {toPersianDigits(req.preferredTime)}
                        </p>
                        {req.note && (
                          <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-150">توضیحات: {req.note}</p>
                        )}
                      </div>

                      {req.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateClientRequestStatus(req.id, "accepted")}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition-all"
                          >
                            تایید نوبت
                          </button>
                          <button
                            onClick={() => handleUpdateClientRequestStatus(req.id, "declined")}
                            className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold py-1.5 rounded-lg transition-all"
                          >
                            رد درخواست
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
                    <p className="text-[11px] text-slate-400 font-bold">هیچ درخواست رزرو نوبت دریافت نکردید.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW FOR CLIENTS */}
      {currentUser.role === "client" && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4 text-[#6B7A4F]" />
            درخواست‌های نوبت ارسالی شما به متخصصین زیبایی و سالن‌ها ({toPersianDigits(clientOutgoingRequests.length)})
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientOutgoingRequests.length > 0 ? (
              clientOutgoingRequests.map((req) => (
                <div key={req.id} className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">گیرنده: {req.targetName}</h4>
                    {getStatusPill(req.status)}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-[#6B7A4F]">سرویس: {req.serviceType}</p>
                    <p className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Calendar className="w-3.5 h-3.5" /> تاریخ {toPersianDigits(req.preferredDate)} ساعت {toPersianDigits(req.preferredTime)}
                    </p>
                    {req.note && (
                      <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-150">پیام شما: {req.note}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 p-12 text-center bg-white rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-400 font-bold">شما هیچ درخواست نوبتی ارسال نکرده‌اید.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
