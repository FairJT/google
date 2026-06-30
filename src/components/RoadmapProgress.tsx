import React, { useState } from "react";
import { 
  CheckCircle2, Circle, Clock, Sparkles, Compass, Rocket, ShieldAlert, Zap, Layers, AlertCircle 
} from "lucide-react";
import { toPersianDigits } from "../utils/shamsi";

export default function RoadmapProgress() {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);

  const phases = [
    {
      number: 1,
      title: "فاز ۱: توسعه زیرساخت و هسته پلتفرم",
      duration: "ماه‌های ۱ تا ۳",
      status: "پیاده‌سازی شده در نسخه بتا",
      icon: Layers,
      description: "راه‌اندازی هسته خدمات ابری، طراحی بهینه دیتابیس، ساخت پروفایل کاربران و موتور شبیه‌ساز جستجوی هوشمند.",
      tasks: [
        { name: "راه‌اندازی زیرساخت ابری امن و کانتینرهای مجزا در سرور", completed: true, category: "زیرساخت ابری" },
        { name: "استقرار دیتابیس‌های رابطه‌ای با امنیت و دسترسی بالا", completed: true, category: "زیرساخت ابری" },
        { name: "مدیریت دسترسی‌های کاربری (پنل مشتری، مدیر سالن و آرتیست مستقل)", completed: true, category: "ویژگی‌های اصلی" },
        { name: "مدیریت اطلاعات سالن‌ها همراه با مدال تایید صلاحیت پلتفرم", completed: true, category: "ویژگی‌های اصلی" },
        { name: "تنظیم پروفایل‌های تخصصی آرتیست‌ها با ماتریس مهارتی تایید شده", completed: true, category: "ویژگی‌های اصلی" },
        { name: "موتور نوبت‌دهی اولیه مجهز به تقویم دسترس‌پذیری کارآمد", completed: true, category: "ویژگی‌های اصلی" },
        { name: "شبیه‌ساز پرداخت آنلاین کارت‌های شتاب و صدور رسید دیجیتال", completed: true, category: "ویژگی‌های اصلی" },
        { name: "پیاده‌سازی شبیه‌ساز پیامکی اطلاع‌رسانی نوبت‌ها به مشتریان", completed: true, category: "ویژگی‌های اصلی" },
        { name: "تلفیق هوش مصنوعی برای درک بهتر نیازهای جستجوی کاربران", completed: true, category: "تلفیق هوش مصنوعی" }
      ]
    },
    {
      number: 2,
      title: "فاز ۲: تلفیق هوش مصنوعی و بهینه‌سازی تخصصی",
      duration: "ماه‌های ۴ تا ۶",
      status: "پیاده‌سازی شده در نسخه بتا",
      icon: Sparkles,
      description: "ارتقای قابلیت‌های فنی با هوش مصنوعی پیشرفته، محاسبه پویای قیمت نوبت‌ها بر اساس تقاضا، سیستم ممیزی مهارت و چت‌بات تعاملی سبک‌شناسی.",
      tasks: [
        { name: "آموزش مدل‌های هوش مصنوعی برای پیشنهادهای شخصی‌سازی شده", completed: false, category: "هوش مصنوعی پیشرفته" },
        { name: "پیاده‌سازی جستجوی معنایی فارسی با مدل جمینی ۳.۵ فلش جهت تطابق استایل", completed: true, category: "هوش مصنوعی پیشرفته" },
        { name: "توسعه موتور قیمت‌گذاری پویا بر اساس ضریب ساعت و تعطیلات تقویم خورشیدی ایران", completed: true, category: "هوش مصنوعی پیشرفته" },
        { name: "طراحی الگوریتم ارزیابی اتوماتیک مهارت‌های آرتیست‌ها (بین ۰ تا ۱۰۰)", completed: true, category: "هوش مصنوعی پیشرفته" },
        { name: "ساخت چت‌بات مشاوره هوشمند سبک و استایل «آورا»", completed: true, category: "هوش مصنوعی پیشرفته" },
        { name: "طراحی کاملاً واکنش‌گرا (ریسپانسیو) سازگار با تبلت و موبایل", completed: true, category: "رابط کاربری" },
        { name: "داشبورد هوش تجاری و آمار تحلیلی پیشرفته درآمدی برای مدیران سالن‌ها", completed: true, category: "ابزارهای تجاری" },
        { name: "دستیار کپی‌رایتینگ هوشمند جهت نگارش خودکار کمپین‌های پیامکی تبلیغات", completed: true, category: "ابزارهای تجاری" }
      ]
    },
    {
      number: 3,
      title: "فاز ۳: بهینه‌سازی جامع و ابزارهای آینده",
      duration: "ماه‌های ۷ تا ۸",
      status: "برنامه‌ریزی شده برای آینده",
      icon: Compass,
      description: "توسعه اپلیکیشن‌های بومی موبایل، سیستم حذف خودکار جاهای خالی در تقویم، مشاوره‌های ویدیویی زنده و ادغام‌های اکوسیستم.",
      tasks: [
        { name: "توسعه اپلیکیشن بومی اختصاصی اندروید و iOS", completed: false, category: "ویژگی‌های فردا" },
        { name: "بهینه‌سازی تقویم به منظور فشرده‌سازی خودکار فضاهای پرت نوبت‌دهی", completed: false, category: "ویژگی‌های فردا" },
        { name: "سیستم هوشمند ارتقای پکیج و بیش‌فروشی خدمات مکمل به مشتریان", completed: false, category: "ویژگی‌های فردا" },
        { name: "مشاوره آنلاین تصویری در زمان حقیقی بر بستر Web-RTC", completed: false, category: "ویژگی‌های فردا" },
        { name: "شبیه‌ساز واقعیت افزوده (AR) ميكاپ و استایل مو روی چهره کاربر", completed: false, category: "ویژگی‌های فردا" },
        { name: "یکپارچه‌سازی با نرم‌افزارهای حسابداری برتر و ارسال خودکار به شبکه‌های اجتماعی", completed: false, category: "توسعه اکوسیستم" }
      ]
    },
    {
      number: 4,
      title: "فاز ۴: عرضه عمومی و رفع باگ‌های سیستمی",
      duration: "ماه‌های ۹ تا ۱۰",
      status: "برنامه‌ریزی شده برای آینده",
      icon: ShieldAlert,
      description: "آغاز عرضه آزمایشی عمومی با مشارکت ۵۰ الی ۱۰۰ سالن زیبایی نمونه کشور، تست فشار سیستم، ممیزی‌های امنیتی دقیق و رفع سریع اختلالات.",
      tasks: [
        { name: "عرضه آزمایشی با همکاری سالن‌های زیبایی تراز اول پایتخت", completed: false, category: "مراحل تست" },
        { name: "آزمون فشار زیرساخت و پایداری لود دیتابیس در ترافیک‌های ناگهانی", completed: false, category: "مراحل تست" },
        { name: "ممیزی دقیق رمزنگاری داده‌ها، امنیت API و لاگ‌های تست نفوذ", completed: false, category: "مراحل تست" },
        { name: "بهینه‌سازی کامل سئو (SEO) صفحات و راه‌اندازی وب‌سایت‌های معرفی سالن‌ها", completed: false, category: "پیش‌از راه‌اندازی" },
        { name: "تدوین مستندات، راهنماها و پکیج‌های آموزشی دیجیتال برای آرایشگران", completed: false, category: "پیش‌از راه‌اندازی" }
      ]
    },
    {
      number: 5,
      title: "فاز ۵: ورود رسمی و گسترش در بازار زیبایی",
      duration: "ماه‌های ۱۱ تا ۱۲",
      status: "برنامه‌ریزی شده برای آینده",
      icon: Rocket,
      description: "راه‌اندازی کمپین‌های تبلیغاتی گسترده، همکاری با استایلیست‌های مطرح کشور، سیستم‌های ارجاع مدرن و اشتراک‌های گروهی سالن‌های زنجیره‌ای.",
      tasks: [
        { name: "عرضه فازبندی شده استانی با تمرکز بر کلان‌شهرهای کشور", completed: false, category: "استراتژی ورود" },
        { name: "کمپین‌های روابط عمومی گسترده و حضور پررنگ در رسانه‌ها", completed: false, category: "استراتژی ورود" },
        { name: "انعقاد قراردادهای تبلیغاتی با سلبریتی‌ها و بیوتی‌بلاگرها", completed: false, category: "استراتژی ورود" },
        { name: "طراحی پکیج‌های اشتراک سازمانی چندکاربره ویژه سالن‌های زنجیره‌ای", completed: false, category: "توسعه کسب‌وکار" },
        { name: "پایش همیشگی امنیت تراکنش‌ها و سیستم اتوماتیک ضدتقلب و نوبت‌های فیک", completed: false, category: "رشد پایدار" }
      ]
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300" dir="rtl">
      
      {/* Introduction Card */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 space-y-3 relative overflow-hidden text-right">
        <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-400 animate-bounce" />
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">نقشه راه توسعه تعاملی لجند</h3>
        </div>
        <h4 className="text-xl font-bold text-slate-100">مسیر توسعه نسخه بتای سامانه</h4>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          ببینید پلتفرم ما چگونه گام به گام جلو می‌رود. خوشبختانه بخش عظیمی از اهداف توسعه **فاز ۱ (هسته و زیرساخت)** و **فاز ۲ (هوش مصنوعی تعاملی)** همین حالا در این وب‌اپلیکیشن به صورت کاملاً زنده پیاده‌سازی و قابل تست است!
        </p>
      </section>

      {/* Grid of Phases timeline */}
      <section className="grid md:grid-cols-5 gap-4 text-right">
        {phases.map((ph) => {
          const Icon = ph.icon;
          const isSelected = selectedPhase === ph.number;
          const isImplemented = ph.status === "پیاده‌سازی شده در نسخه بتا";

          return (
            <button
              key={ph.number}
              onClick={() => setSelectedPhase(ph.number)}
              className={`p-5 rounded-2xl border text-right transition-all relative overflow-hidden flex flex-col justify-between min-h-[10rem] cursor-pointer ${
                isSelected
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-950/10 scale-[1.02]"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50/50"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                    isImplemented
                      ? (isSelected ? "bg-indigo-400 text-slate-950 font-bold" : "bg-emerald-50 text-emerald-700 border border-emerald-100")
                      : (isSelected ? "bg-slate-800 text-slate-400 font-bold" : "bg-slate-100 text-slate-500")
                  }`}>
                    فاز {toPersianDigits(ph.number)}
                  </span>
                  <Icon className={`w-4 h-4 ${isSelected ? "text-indigo-400" : "text-slate-400"}`} />
                </div>
                <div>
                  <h5 className="text-xs font-bold leading-tight line-clamp-2">{ph.title}</h5>
                  <p className={`text-[10px] mt-1 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>{ph.duration}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/20 text-[10px] flex items-center gap-1.5">
                {isImplemented ? (
                  <span className="text-emerald-500 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> نسخه زنده
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> برنامه‌ریزی
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </section>

      {/* Selected Phase Detail Board */}
      {selectedPhase && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-350 text-right">
          {/* Phase Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span>جزئیات توسعه فاز {toPersianDigits(selectedPhase)}</span>
                <span>•</span>
                <span>{phases[selectedPhase - 1].duration}</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mt-1">{phases[selectedPhase - 1].title}</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">{phases[selectedPhase - 1].description}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-bold">وضعیت پیشرفت:</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                phases[selectedPhase - 1].status === "پیاده‌سازی شده در نسخه بتا"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-indigo-50 text-indigo-700 border-indigo-100"
              }`}>
                {phases[selectedPhase - 1].status}
              </span>
            </div>
          </div>

          {/* Phase Tasks Checklist */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              چک‌لیست اهداف و اقدامات فاز:
            </h5>
            
            <div className="grid md:grid-cols-2 gap-4">
              {phases[selectedPhase - 1].tasks.map((task, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                    task.completed 
                      ? "bg-emerald-50/20 border-emerald-100 text-slate-800" 
                      : "bg-slate-50/50 border-slate-150 text-slate-500"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
                      {task.category}
                    </span>
                    <p className={`text-xs ${task.completed ? "font-bold text-slate-850" : ""}`}>{task.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info footnote */}
          <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-xs text-slate-600 leading-relaxed flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <strong>توجه توسعه‌دهنده:</strong> بخش‌های پیاده‌سازی شده در قالب پلتفرم به شکل تعاملی و فعال هستند. شما می‌توانید نوبت‌های خود را به صورت زنده ثبت کنید، امتیاز متخصصین را تغییر دهید یا مستقیماً با دستیار هوشمند آورا گفتگو کنید.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
