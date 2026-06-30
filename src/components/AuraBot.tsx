import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare, X, Bot, User } from "lucide-react";
import { Message } from "../types";
import { toPersianDigits } from "../utils/shamsi";

export default function AuraBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content: "سلام! من **آورا** هستم، دستیار هوشمند و مشاور تخصصی استایل و خدمات زیبایی شما. سلیقه، سبک مورد علاقه یا سوالات خود را درباره انواع رنگ مو، بالیاژ، هیدروفیشیال پوست یا کاشت ناخن ژورنالی بپرسید. چطور می‌توانم امروز به زیبایی شما الهام ببخشم؟",
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "یک رنگ بالیاژ بلوند عسلی شیک پیشنهاد بده",
    "کدام فیشیال برای پوست خشک و حساس مناسب است؟",
    "طرح‌های ترند ناخن مینیمال امسال چیست؟",
    "چگونه قیمت‌گذاری پویای لجند به نفع من کار می‌کند؟"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text) return;

    if (!textToSend) setInput("");

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from style assistant");
      }

      const data = await response.json();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: data.content,
        timestamp: new Date().toLocaleTimeString("fa-IR", { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: "در برقراری ارتباط با پایگاه داده هوشمند سبک‌شناسی مشکلی پیش آمده است. لطفاً اطمینان حاصل کنید که کلید `GEMINI_API_KEY` در بخش تنظیمات فعال باشد و مجدداً تلاش فرمایید.",
        timestamp: new Date().toLocaleTimeString("fa-IR", { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-stone-900 to-stone-850 hover:from-stone-850 hover:to-stone-800 text-white px-5 py-4 shadow-2xl transition-all hover:scale-105 active:scale-95 group border border-stone-800 rounded-full cursor-pointer font-sans"
        dir="rtl"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
        </span>
        <MessageSquare className="w-5 h-5 group-hover:rotate-6 transition-transform" />
        <span className="text-xs font-semibold">مشاوره زیبایی آورا</span>
      </button>

      {/* Slide-out Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end" dir="rtl" onClick={() => setIsOpen(false)}>
          <div 
            className="w-full max-w-lg bg-stone-50 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 relative border-r border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 text-right">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-stone-950 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">مشاور هوشمند آورا</h3>
                  <p className="text-[10px] text-stone-400">راهنمای تخصصی سبک، مِتُد و خدمات زیبایی</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-stone-800 rounded-lg transition-colors text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-[85%] ${
                    m.role === "user" ? "mr-auto flex-row-reverse" : "ml-auto"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                      m.role === "user"
                        ? "bg-stone-200 border-stone-300 text-stone-800"
                        : "bg-stone-900 border-stone-800 text-white"
                    }`}
                  >
                    {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className="space-y-1">
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed text-right ${
                        m.role === "user"
                          ? "bg-stone-900 text-white rounded-tl-none shadow-sm"
                          : "bg-white text-stone-800 border border-stone-200/80 rounded-tr-none shadow-sm"
                      }`}
                    >
                      {/* Simplistic formatting helper for markdown bold */}
                      {m.content.split("\n").map((line, idx) => (
                        <p key={idx} className="mb-1.5 last:mb-0">
                          {line.split("**").map((part, pIdx) =>
                            pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-stone-950">{part}</strong> : part
                          )}
                        </p>
                      ))}
                    </div>
                    <span className={`text-[9px] text-stone-400 block ${m.role === "user" ? "text-left" : "text-right"}`}>
                      {toPersianDigits(m.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 ml-auto max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 text-white flex items-center justify-center shrink-0 animate-spin">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-white text-stone-500 border border-stone-200 p-4 rounded-2xl rounded-tr-none shadow-sm text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    <span className="text-[10px] mr-1">در حال بررسی و طراحی استایل...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Chips */}
            <div className="p-4 bg-stone-100 border-t border-stone-200/80 text-right">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-2">موضوعات پیشنهادی مشاوره استایل:</span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto" dir="rtl">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-[11px] bg-white hover:bg-stone-200 text-stone-700 border border-stone-200/80 px-2.5 py-1 rounded-lg transition-colors text-right cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-white border-t border-stone-200/80">
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl p-2 focus-within:border-stone-400 transition-colors">
                <input
                  type="text"
                  placeholder="رنگ پیشنهادی مو، نوع پوست، ایده ناخن..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-xs text-stone-800 text-right"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="p-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4 rotate-180" />
                </button>
              </div>
              <p className="text-[9px] text-stone-400 mt-2 text-center">
                قدرتمند شده با هوش مصنوعی جمینی ۳.۵ • حریم خصوصی تضمین شده است
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
