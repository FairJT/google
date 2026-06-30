import React, { useState, useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Artist, AppUser } from "../types";
import { artistsList } from "../data";
import { toPersianDigits } from "../utils/shamsi";
import { Award, ShieldAlert, Sparkles, User, HelpCircle } from "lucide-react";

interface ArtistSkillMatrixProps {
  currentUser: AppUser;
  artists?: Artist[];
}

// Fixed skill profiles across 6 core beauty categories
const ARTIST_METRICS_DATABASE: Record<string, {
  hairColor: number;
  hairCut: number;
  makeup: number;
  nails: number;
  skinCare: number;
  lashes: number;
}> = {
  "a1": { hairColor: 98, hairCut: 92, makeup: 40, nails: 25, skinCare: 30, lashes: 60 },
  "a2": { hairColor: 65, hairCut: 96, makeup: 50, nails: 15, skinCare: 45, lashes: 20 },
  "a3": { hairColor: 30, hairCut: 45, makeup: 99, nails: 35, skinCare: 70, lashes: 92 },
  "a4": { hairColor: 15, hairCut: 20, makeup: 30, nails: 100, skinCare: 25, lashes: 40 },
  "a5": { hairColor: 10, hairCut: 15, makeup: 55, nails: 30, skinCare: 95, lashes: 50 }
};

const CATEGORIES_TRANSLATIONS = [
  { key: "hairColor", label: "رنگ و لایت تخصصی" },
  { key: "hairCut", label: "کوپ و استایل مو" },
  { key: "makeup", label: "میکاپ و کانتورینگ" },
  { key: "nails", label: "کاشت و دیزاین ناخن" },
  { key: "skinCare", label: "پاکسازی و سلامت پوست" },
  { key: "lashes", label: "اکستنشن مژه و ابرو" }
];

export default function ArtistSkillMatrix({ currentUser, artists = artistsList }: ArtistSkillMatrixProps) {
  // Try to find the active logged-in artist ID, default to first artist (a1)
  const defaultArtistId = currentUser.role === "artist" ? (currentUser.id || "a1") : "a1";
  const [selectedArtistId, setSelectedArtistId] = useState<string>(defaultArtistId);
  const [compareArtistId, setCompareArtistId] = useState<string>("");

  const currentArtist = useMemo(() => {
    return artists.find(a => a.id === selectedArtistId) || artists[0];
  }, [selectedArtistId, artists]);

  const compareArtist = useMemo(() => {
    if (!compareArtistId) return null;
    return artists.find(a => a.id === compareArtistId) || null;
  }, [compareArtistId, artists]);

  // Construct Radar Chart Data
  const chartData = useMemo(() => {
    const mainMetrics = ARTIST_METRICS_DATABASE[selectedArtistId] || { hairColor: 50, hairCut: 50, makeup: 50, nails: 50, skinCare: 50, lashes: 50 };
    const compMetrics = compareArtistId ? (ARTIST_METRICS_DATABASE[compareArtistId] || null) : null;

    return CATEGORIES_TRANSLATIONS.map(cat => {
      const result: any = {
        subject: cat.label,
        [currentArtist.name]: mainMetrics[cat.key as keyof typeof mainMetrics]
      };
      if (compMetrics && compareArtist) {
        result[compareArtist.name] = compMetrics[cat.key as keyof typeof compMetrics];
      }
      return result;
    });
  }, [selectedArtistId, compareArtistId, currentArtist, compareArtist]);

  return (
    <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm text-right" dir="rtl">
      
      {/* Header and Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Award className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-base font-bold text-slate-950">ماتریس مهارتی و ارزیابی چندبعدی متخصصین</h3>
          </div>
          <p className="text-xs text-slate-500">
            نمودار راداری ارزیابی شایستگی‌های فنی در ۶ گروه خدمات تخصصی خانه زیبایی لجند
          </p>
        </div>

        {/* Dynamic Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400">آرتیست هدف:</span>
            <select
              value={selectedArtistId}
              onChange={(e) => setSelectedArtistId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl text-slate-700 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              {artists.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.id === currentUser.id ? "شما" : a.role.split(" ")[0]})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400">مقایسه همکاران (اختیاری):</span>
            <select
              value={compareArtistId}
              onChange={(e) => setCompareArtistId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl text-slate-700 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="">— بدون مقایسه —</option>
              {artists.filter(a => a.id !== selectedArtistId).map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-center">
        {/* Radar Chart Panel */}
        <div className="lg:col-span-7 flex justify-center items-center h-80 relative select-none">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#475569", fontSize: 10, fontWeight: 700 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "#94a3b8", fontSize: 8, fontFamily: "monospace" }}
              />
              
              {/* Target artist radar area */}
              <Radar
                name={currentArtist.name}
                dataKey={currentArtist.name}
                stroke="#4f46e5"
                fill="#818cf8"
                fillOpacity={0.4}
              />

              {/* Compare artist radar area */}
              {compareArtist && (
                <Radar
                  name={compareArtist.name}
                  dataKey={compareArtist.name}
                  stroke="#10b981"
                  fill="#34d399"
                  fillOpacity={0.35}
                />
              )}
              
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: "bold" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Stats Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              خلاصه وضعیت شایستگی فنی {currentArtist.name}
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              بر اساس امتیازات کارگاهی، ارزیابی رتبه‌بندی کیفی مراجعین، و ممیزی فنی صادر شده توسط هیئت نظارت لجند.
            </p>

            <div className="space-y-2.5 pt-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">شاخص کل مهارت (اورال):</span>
                <span className="font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  {toPersianDigits(currentArtist.score)} / ۱۰۰
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">رضایت مراجعین متناظر:</span>
                <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-1">
                  ⭐️ {toPersianDigits(currentArtist.rating)} ({toPersianDigits(currentArtist.reviewCount)} نظر)
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">سطح پرسنلی سیستم:</span>
                <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  {currentArtist.role.split(" و ")[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Guidelines info */}
          <div className="border border-indigo-50 border-dashed p-4 rounded-2xl bg-indigo-50/20 text-right flex gap-3">
            <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-slate-900">چگونه رتبه خود را ارتقا دهید؟</h5>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                ارزیابی راداری مهارت‌ها هر فصل بر اساس تعداد نوبت‌های موفق فاقد شکایت، سرعت عمل در خدمات بدون فدا کردن کیفیت، و دوره‌های مهارتی تکمیلی به‌روزرسانی می‌شود.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
