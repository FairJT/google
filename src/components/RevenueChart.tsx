import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Booking } from "../types";
import { formatToman, toPersianDigits } from "../utils/shamsi";
import { BarChart3, Calendar, TrendingUp, DollarSign } from "lucide-react";

interface RevenueChartProps {
  bookings: Booking[];
}

export default function RevenueChart({ bookings }: RevenueChartProps) {
  const [viewType, setViewType] = useState<"daily" | "monthly">("daily");

  // Calculate active revenues (Confirmed or Completed)
  const activeBookings = useMemo(() => {
    return bookings.filter(b => b.status === "Confirmed" || b.status === "Completed");
  }, [bookings]);

  // Daily revenue processing (Last 9 days of Tir 1405: 04/01 to 04/09)
  const dailyData = useMemo(() => {
    // Baseline values for Tir 01 to Tir 09
    const baseDaily: Record<string, number> = {
      "1405/04/01": 2400000,
      "1405/04/02": 3100000,
      "1405/04/03": 1800000,
      "1405/04/04": 4200000,
      "1405/04/05": 2900000,
      "1405/04/06": 1500000, // Weekend/Offday baseline
      "1405/04/07": 3800000,
      "1405/04/08": 4500000,
      "1405/04/09": 3200000
    };

    // Add dynamic bookings to active days
    activeBookings.forEach(b => {
      const date = b.date;
      if (date && date.startsWith("1405/04/")) {
        if (baseDaily[date] !== undefined) {
          baseDaily[date] += b.price;
        } else {
          // If a new date in Tir is used, initialize it
          baseDaily[date] = b.price;
        }
      }
    });

    // Convert to array and format for Recharts
    return Object.entries(baseDaily)
      .map(([date, amount]) => {
        const dayNum = date.split("/")[2];
        return {
          dateKey: date,
          label: `${toPersianDigits(dayNum)} تیر`,
          amount,
          displayAmount: formatToman(amount)
        };
      })
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [activeBookings]);

  // Monthly revenue processing (Last 6 months: Bahman to Tir)
  const monthlyData = useMemo(() => {
    // Baseline values
    const baseMonthly: Record<string, { label: string; amount: number; order: number }> = {
      "11": { label: "بهمن", amount: 48000000, order: 1 },
      "12": { label: "اسفند", amount: 65000000, order: 2 }, // High season
      "01": { label: "فروردین", amount: 35000000, order: 3 },
      "02": { label: "اردیبهشت", amount: 52000000, order: 4 },
      "03": { label: "خرداد", amount: 58000000, order: 5 },
      "04": { label: "تیر", amount: 44000000, order: 6 } // Current month
    };

    // Add dynamic bookings of current year 1405 to respective months
    activeBookings.forEach(b => {
      const parts = b.date.split("/");
      if (parts.length === 3) {
        const month = parts[1];
        if (baseMonthly[month] !== undefined) {
          baseMonthly[month].amount += b.price;
        }
      }
    });

    return Object.entries(baseMonthly)
      .map(([monthKey, data]) => ({
        monthKey,
        label: data.label,
        amount: data.amount,
        order: data.order,
        displayAmount: formatToman(data.amount)
      }))
      .sort((a, b) => a.order - b.order);
  }, [activeBookings]);

  // Summary statistics
  const totalPeriodRevenue = useMemo(() => {
    if (viewType === "daily") {
      return dailyData.reduce((sum, item) => sum + item.amount, 0);
    } else {
      return monthlyData.reduce((sum, item) => sum + item.amount, 0);
    }
  }, [viewType, dailyData, monthlyData]);

  const maxRevenueItem = useMemo(() => {
    const data = viewType === "daily" ? dailyData : monthlyData;
    if (data.length === 0) return null;
    return [...data].sort((a, b) => b.amount - a.amount)[0];
  }, [viewType, dailyData, monthlyData]);

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-850 p-3 rounded-xl shadow-xl text-right text-xs text-white space-y-1">
          <p className="font-bold text-slate-300">{data.label}</p>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="font-mono text-emerald-400 font-extrabold">{toPersianDigits(data.amount.toLocaleString())}</span>
            <span className="text-[10px] text-slate-400">تومان</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm text-right" dir="rtl">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-950">گزارش و تحلیل هوشمند درآمد سالن</h3>
          </div>
          <p className="text-xs text-slate-400">
            نمایش بصری درآمد فاکتورهای تایید شده و تکمیل‌شده مراجعین بر اساس دوره زمانی
          </p>
        </div>

        {/* View Switch Toggles */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center self-start sm:self-center">
          <button
            onClick={() => setViewType("daily")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewType === "daily"
                ? "bg-white text-indigo-950 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              درآمد روزانه
            </span>
          </button>
          <button
            onClick={() => setViewType("monthly")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewType === "monthly"
                ? "bg-white text-indigo-950 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              درآمد ماهانه
            </span>
          </button>
        </div>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl">
        <div className="space-y-1 border-b sm:border-b-0 sm:border-l border-slate-150 pb-3 sm:pb-0 sm:pl-4">
          <span className="text-[10px] font-bold text-slate-400">مجموع درآمد دوره انتخابی</span>
          <div className="flex items-center gap-1">
            <h4 className="text-base font-extrabold text-slate-900">{formatToman(totalPeriodRevenue)}</h4>
            <span className="text-[9px] font-bold text-slate-400">تومان</span>
          </div>
        </div>

        <div className="space-y-1 border-b sm:border-b-0 sm:border-l border-slate-150 pb-3 sm:pb-0 sm:pl-4">
          <span className="text-[10px] font-bold text-slate-400">نقطه اوج درآمد (پیک دوره)</span>
          <div className="flex items-center gap-1" v-if="maxRevenueItem">
            <h4 className="text-sm font-bold text-emerald-600">
              {maxRevenueItem ? maxRevenueItem.label : "—"}
            </h4>
            <span className="text-xs font-semibold text-slate-700">
              ({maxRevenueItem ? formatToman(maxRevenueItem.amount) : "—"})
            </span>
          </div>
        </div>

        <div className="space-y-1 flex flex-col justify-center">
          <span className="text-[10px] font-bold text-slate-400">وضعیت رشد مالی</span>
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-extrabold">
            <DollarSign className="w-3.5 h-3.5 stroke-[2.5px]" />
            <span>رشد پیوسته سالانه بالای ۱۴٪</span>
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="w-full h-72 md:h-80 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={viewType === "daily" ? dailyData : monthlyData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "monospace" }}
              tickFormatter={(v) => toPersianDigits((v / 1000000).toFixed(1)) + "M"}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
            <Bar
              dataKey="amount"
              radius={[8, 8, 0, 0]}
              maxBarSize={viewType === "daily" ? 28 : 45}
            >
              {(viewType === "daily" ? dailyData : monthlyData).map((entry, index) => {
                // Highlight the last/active bar (e.g. Tir or 04/09) with Indigo, and others with softer tones
                const isActive = viewType === "daily" ? entry.dateKey === "1405/04/09" : entry.monthKey === "04";
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isActive ? "url(#colorActive)" : "url(#colorStandard)"}
                  />
                );
              })}
            </Bar>
            
            {/* Gradient Definitions for premium look */}
            <defs>
              <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.95} />
              </linearGradient>
              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.95} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold border-t border-slate-100 pt-4">
        <span>* کلیه محاسبات بر مبنای واحد پولی تومان انجام می‌پذیرد.</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block"></span>
          سایر روزها
          <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block mr-3"></span>
          امروز/ماه جاری
        </span>
      </div>

    </div>
  );
}
