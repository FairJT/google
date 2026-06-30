import React, { useState, useEffect } from "react";
import { User, Post, HiringOffer, ClientRequest } from "./types";
import { seedUsers, seedPosts } from "./data";
import CommunityFeed from "./components/CommunityFeed";
import HiringMarketplace from "./components/HiringMarketplace";
import RequestsInbox from "./components/RequestsInbox";
import Leaderboard from "./components/Leaderboard";
import UserProfile from "./components/UserProfile";
import AuthPage from "./components/AuthPage";
import AIAssistant from "./components/AIAssistant";
import { 
  Sparkles, Users, Award, MessageSquare, Search, Inbox, UserCircle, 
  Briefcase, Star, Settings, RefreshCw, Bell, LogOut, MapPin, Check, LogIn
} from "lucide-react";
import { toPersianDigits } from "./utils/shamsi";

export default function App() {
  // Central State for all users in memory
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("legendin_users");
    return saved ? JSON.parse(saved) : seedUsers;
  });

  // Real logged-in user state. Loaded from localStorage or defaulted to null
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUserId = localStorage.getItem("legendin_logged_in_user_id");
    if (savedUserId) {
      const found = allUsers.find(u => u.id === savedUserId);
      if (found) return found;
    }
    return null; // Prompt login by default if no session is active
  });

  // Guest & Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authActionWarning, setAuthActionWarning] = useState<string | null>(null);

  const guestUser: User = {
    id: "guest",
    name: "کاربر مهمان",
    role: "client",
    phone: "",
    email: "guest@legendin.ir",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop",
    title: "مهمان لجندین",
    city: "تهران",
    bio: "در حال بررسی بازار کار زیبایی لجندین...",
    skills: [],
    certifications: [],
    portfolio: [],
    reviews: [],
    openForHiring: false,
    acceptingRequests: false
  };

  const isGuest = currentUser === null;
  const effectiveUser = currentUser || guestUser;

  const GuestViewPlaceholder = ({ title, description, icon: Icon }: { title: string, description: string, icon: any }) => (
    <div className="bg-white border border-slate-200/85 rounded-2xl p-8 md:p-12 text-center max-w-xl mx-auto my-8 space-y-6 shadow-xs animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-[#6B7A4F]/10 text-[#6B7A4F] flex items-center justify-center mx-auto shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-black text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto font-bold">{description}</p>
      </div>
      <button
        onClick={() => {
          setAuthActionWarning(`برای استفاده از این بخش ابتدا باید وارد حساب خود شوید.`);
          setIsAuthModalOpen(true);
        }}
        className="bg-[#6B7A4F] hover:bg-[#57643F] text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
      >
        <LogIn className="w-4 h-4" />
        ورود یا عضویت سریع
      </button>
    </div>
  );

  // Track the user whose profile is currently being inspected in the profile tab
  const [profileUser, setProfileUser] = useState<User>(() => {
    const savedUserId = localStorage.getItem("legendin_logged_in_user_id");
    if (savedUserId) {
      const found = allUsers.find(u => u.id === savedUserId);
      if (found) return found;
    }
    return allUsers.find(u => u.role === "manager") || allUsers[0];
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"feed" | "hiring" | "leaderboard" | "inbox" | "profile" | "assistant">("feed");

  // In-memory posts state
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem("legendin_posts");
    return saved ? JSON.parse(saved) : seedPosts;
  });

  // In-memory hiring offers (Manager -> Artist)
  const [hiringOffers, setHiringOffers] = useState<HiringOffer[]>(() => {
    const saved = localStorage.getItem("legendin_offers");
    return saved ? JSON.parse(saved) : [
      {
        id: "offer-default-1",
        managerId: "m1",
        managerName: "مریم رادمنش",
        salonName: "خانه زیبایی لجند",
        artistId: "a3",
        artistName: "غزل نیکو",
        message: "سلام غزل عزیز، کارهای دیزاین ناخن شما واقعاً بی نظیره. تمایل دارید به صورت پاره‌وقت با لاین جدید زعفرانیه ما همکاری کنید؟",
        offerAmount: "۱۰ میلیون تومان ثابت + ۴۰٪ درصد پورسانت مراجعین",
        status: "pending",
        createdAt: "1405/04/08"
      }
    ];
  });

  // In-memory client requests (Client -> Artist/Salon)
  const [clientRequests, setClientRequests] = useState<ClientRequest[]>(() => {
    const saved = localStorage.getItem("legendin_client_requests");
    return saved ? JSON.parse(saved) : [
      {
        id: "req-default-1",
        clientId: "c1",
        clientName: "الناز افشار",
        clientPhone: "۰۹۱۲۰۰۰۰۰۰۳",
        targetId: "a1",
        targetName: "سرنا ونس (موسوی)",
        targetType: "artist",
        serviceType: "بالیاژ روسی طلایی",
        preferredDate: "1405/04/14",
        preferredTime: "11:30",
        note: "موهام تا شونه‌مه و دکلره پایه ۹ داره، برای احیا و رنگساژ جدید مزاحمتون میشم.",
        status: "pending",
        createdAt: "1405/04/09"
      }
    ];
  });

  // PERSIST STATE TO LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem("legendin_users", JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem("legendin_posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("legendin_offers", JSON.stringify(hiringOffers));
  }, [hiringOffers]);

  useEffect(() => {
    localStorage.setItem("legendin_client_requests", JSON.stringify(clientRequests));
  }, [clientRequests]);

  // Synchronize when the currentUser gets edited (e.g. updating profile details)
  const handleUpdateCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setProfileUser(updatedUser);
    const updatedUsersList = allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    setAllUsers(updatedUsersList);
  };

  const handleUpdateUsersList = (updatedList: User[]) => {
    setAllUsers(updatedList);
    if (currentUser) {
      const freshCurrentUser = updatedList.find(u => u.id === currentUser.id);
      if (freshCurrentUser) {
        setCurrentUser(freshCurrentUser);
      }
    }
    const freshProfileUser = updatedList.find(u => u.id === profileUser.id);
    if (freshProfileUser) {
      setProfileUser(freshProfileUser);
    }
  };

  // Helper to count pending inbox messages for badge notifications
  const getPendingInboxCount = () => {
    if (!currentUser) return 0;
    if (currentUser.role === "manager") {
      return clientRequests.filter(
        r => r.targetType === "salon" && r.status === "pending"
      ).length;
    } else if (currentUser.role === "artist") {
      const incomingOffers = hiringOffers.filter(o => o.artistId === currentUser.id && o.status === "pending").length;
      const incomingRequests = clientRequests.filter(r => r.targetId === currentUser.id && r.targetType === "artist" && r.status === "pending").length;
      return incomingOffers + incomingRequests;
    } else {
      // Clients don't have incoming pending, but we can show their total requests
      return clientRequests.filter(r => r.clientId === currentUser.id).length;
    }
  };

  const pendingCount = getPendingInboxCount();

  // LOGIN & REGISTER HANDLERS
  const handleLoginSuccess = (user: User) => {
    localStorage.setItem("legendin_logged_in_user_id", user.id);
    setCurrentUser(user);
    setProfileUser(user);
    setActiveTab("feed"); // Go to community feed after login
  };

  const handleRegisterSuccess = (updatedUsersList: User[], loggedInUser: User) => {
    setAllUsers(updatedUsersList);
    localStorage.setItem("legendin_logged_in_user_id", loggedInUser.id);
    setCurrentUser(loggedInUser);
    setProfileUser(loggedInUser);
    setActiveTab("feed");
  };

  const handleLogout = () => {
    if (confirm("آیا برای خروج از حساب کاربری اطمینان دارید؟")) {
      localStorage.removeItem("legendin_logged_in_user_id");
      setCurrentUser(null);
    }
  };

  // RESET ALL SIMULATION DATA TO ORIGINAL SEED STATES
  const handleResetData = () => {
    if (confirm("آیا تمایل دارید تمام وضعیت‌های برنامه را به حالت اولیه بازگردانید؟ (این کار اطلاعات محلی شما را پاک می‌کند)")) {
      localStorage.removeItem("legendin_users");
      localStorage.removeItem("legendin_logged_in_user_id");
      localStorage.removeItem("legendin_posts");
      localStorage.removeItem("legendin_offers");
      localStorage.removeItem("legendin_client_requests");
      window.location.reload();
    }
  };

  // 1. HEADER & GUEST REDIRECTS FOR GUEST USER STATE - RENDER RESPONSIVE INTERFACE DIRECTLY
  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col font-sans selection:bg-[#6B7A4F]/25 text-slate-800 antialiased text-right" dir="rtl">
      
      {/* ========================================================= */}
      {/* RESPONSIVE HEADER (Unified Desktop & Mobile Header) */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          {/* Right section: Branding & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6B7A4F] flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                لجندین <span className="text-[#6B7A4F] text-[9.5px] bg-[#6B7A4F]/10 px-2 py-0.5 rounded-md font-extrabold">شبکه بازار کار زیبایی</span>
              </h1>
              <p className="text-[9px] text-slate-400 font-bold hidden sm:block mt-0.5">بزرگترین مجتمع فوق‌تخصصی اشتراک رزومه و استخدام آرتیست‌های زیبایی</p>
            </div>
          </div>

          {/* Left section: Logged-in User Profile / Guest login & Log out */}
          <div className="flex items-center gap-3">
            
            {/* Quick Reset Data Button (Helper for reviewers) */}
            <button
              onClick={handleResetData}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer text-xs flex items-center gap-1"
              title="پاکسازی و بازنشانی به داده‌های اولیه"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[9px] font-bold">بازنشانی دیتابیس</span>
            </button>

            {isGuest ? (
              <button
                onClick={() => {
                  setAuthActionWarning(null);
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6B7A4F] hover:bg-[#57643F] text-white text-xs font-black shadow-md transition-all cursor-pointer active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>ورود / عضویت</span>
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-xl p-1 px-2.5">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    onClick={() => {
                      setProfileUser(currentUser);
                      setActiveTab("profile");
                    }}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 cursor-pointer active:scale-95 transition-transform"
                  />
                  <div className="text-right hidden sm:block">
                    <h4 className="text-[10.5px] font-black text-slate-800 leading-tight">{currentUser.name}</h4>
                    <p className="text-[8.5px] text-[#6B7A4F] font-bold">
                      {currentUser.role === "manager" ? "مدیر سالن" : currentUser.role === "artist" ? "آرتیست زیبایی" : "مشتری عادی"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-150 bg-rose-50/50 hover:bg-rose-550/10 hover:border-rose-300 text-rose-700 text-[10.5px] font-black transition-all cursor-pointer active:scale-95"
                  title="خروج از حساب کاربری"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </>
            )}
          </div>

        </div>
      </header>

      {/* ========================================================= */}
      {/* DESKTOP NAVIGATION BAR (Hidden on Mobile) */}
      {/* ========================================================= */}
      <nav className="hidden lg:block bg-white border-b border-slate-200 py-1 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-1 px-4">
          <button
            onClick={() => setActiveTab("feed")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "feed"
                ? "bg-[#6B7A4F]/10 text-[#6B7A4F]"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            خوراک انجمن (Home)
          </button>

          <button
            onClick={() => setActiveTab("hiring")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "hiring"
                ? "bg-[#6B7A4F]/10 text-[#6B7A4F]"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Search className="w-4 h-4" />
            دایرکتوری استخدام آرتیست‌ها
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "leaderboard"
                ? "bg-[#6B7A4F]/10 text-[#6B7A4F]"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Award className="w-4 h-4" />
            برترین‌های هفته
          </button>

          <button
            onClick={() => setActiveTab("assistant")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "assistant"
                ? "bg-[#6B7A4F]/10 text-[#6B7A4F]"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#6B7A4F]" />
            دستیار هوشمند لجندین
          </button>

          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative cursor-pointer ${
              activeTab === "inbox"
                ? "bg-[#6B7A4F]/10 text-[#6B7A4F]"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Inbox className="w-4 h-4" />
            صندوق درخواست‌ها
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8.5px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                {toPersianDigits(pendingCount)}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (isGuest) {
                setProfileUser(guestUser);
                setActiveTab("profile");
              } else {
                setProfileUser(currentUser!);
                setActiveTab("profile");
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "profile" && profileUser.id === effectiveUser.id
                ? "bg-[#6B7A4F]/10 text-[#6B7A4F]"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <UserCircle className="w-4 h-4" />
            رزومه و پروفایل من
          </button>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* MAIN LAYOUT WRAPPER */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-6 pb-24 lg:pb-12">
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* SIDEBAR: Personal Card info (Desktop Only) */}
          <aside className="lg:col-span-1 space-y-5 text-right hidden lg:block">
            
            {isGuest ? (
              <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#6B7A4F]/10 flex items-center justify-center mx-auto text-[#6B7A4F]">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-slate-800">خوش آمدید به لجندین</h3>
                  <p className="text-[9.5px] text-[#6B7A4F] font-extrabold leading-normal">شبکه اشتراک رزومه و استخدام آرتیست‌های زیبایی</p>
                </div>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">برای ثبت پیشنهادهای کاریابی، ثبت نوبت و انتشار رزومه شخصی به ما بپیوندید.</p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-[#6B7A4F] hover:bg-[#57643F] text-white text-[11px] font-black shadow-md transition-all cursor-pointer active:scale-95"
                >
                  ورود / عضویت سریع
                </button>
              </div>
            ) : (
              /* Short Profile Widget */
              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="h-16 bg-[#6B7A4F]/20 relative">
                  {currentUser && currentUser.coverImage && (
                    <img src={currentUser.coverImage} alt="Cover" className="w-full h-full object-cover opacity-30" />
                  )}
                </div>
                
                <div className="p-4 relative flex flex-col items-center text-center">
                  <img
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm -mt-10 mb-2.5 cursor-pointer hover:opacity-90"
                    onClick={() => {
                      if (currentUser) {
                        setProfileUser(currentUser);
                        setActiveTab("profile");
                      }
                    }}
                  />
                  
                  <h3 className="text-sm font-black text-slate-900 hover:text-[#6B7A4F] cursor-pointer" onClick={() => {
                    if (currentUser) {
                      setProfileUser(currentUser);
                      setActiveTab("profile");
                    }
                  }}>{currentUser?.name}</h3>
                  <p className="text-[9.5px] text-slate-400 font-bold mt-0.5">{currentUser?.title}</p>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-center gap-1 font-bold">
                    <MapPin className="w-3 h-3 text-[#6B7A4F]" />
                    {currentUser?.city}
                  </p>

                  <div className="w-full border-t border-slate-100 mt-4 pt-3.5 space-y-2 text-right text-xs">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                      <span>درخواست‌های معلق:</span>
                      <span className="text-[#6B7A4F]">{toPersianDigits(pendingCount)} مورد</span>
                    </div>
                    
                    {currentUser && currentUser.role === "artist" && currentUser.rating && (
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                        <span>امتیاز رضایت مشتری:</span>
                        <span className="text-amber-600 flex items-center gap-0.5 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                          {toPersianDigits(currentUser.rating)} از ۵
                        </span>
                      </div>
                    )}

                    {currentUser && currentUser.role === "manager" && currentUser.salonName && (
                      <div className="bg-slate-50 rounded-lg p-2 mt-2 border border-slate-100">
                        <p className="text-[8.5px] text-[#6B7A4F] font-black">مدیر فنی مجموعه:</p>
                        <p className="text-[9.5px] text-slate-700 font-bold truncate mt-0.5">{currentUser.salonName}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* AI Assistant Promo Sidebar Card */}
            <div className="bg-gradient-to-br from-emerald-500/5 via-white to-slate-50/50 border border-[#6B7A4F]/20 rounded-2xl p-4.5 shadow-xs text-right space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#6B7A4F]/10 rounded-lg text-[#6B7A4F]">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </span>
                <span className="text-[10.5px] font-black text-[#57643F]">دستیار هوشمند لجندین</span>
              </div>
              <p className="text-[9.5px] text-slate-500 leading-relaxed font-semibold">
                {currentUser?.role === "manager" 
                  ? "تحلیل خودکار نوبت‌ها، لود کاری آرتیست‌ها و برآورد زنده سود مالی کل سالن!"
                  : "به دنبال مدل خاص ناخن زیر ۲ میلیون تومان هستید؟ بهترین آرتیست‌ها و ترندها را بیابید!"}
              </p>
              <button
                onClick={() => setActiveTab("assistant")}
                className="w-full py-2 bg-[#6B7A4F] hover:bg-[#57643F] text-white text-[9.5px] font-black rounded-lg transition-all active:scale-95 cursor-pointer shadow-3xs"
              >
                شروع گفتگو با مشاور AI ⚡
              </button>
            </div>

            {/* Quick Community Stats Widget */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-xs space-y-3.5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">جامعه آماری بازار کار</h4>
              
              <div className="space-y-2.5 text-xs text-slate-600 font-bold">
                <div className="flex justify-between">
                  <span>آرتیست‌های عضو:</span>
                  <span className="text-slate-900">{toPersianDigits(allUsers.filter(u => u.role === "artist").length)} نفر</span>
                </div>
                <div className="flex justify-between">
                  <span>مدیران سالن‌ها:</span>
                  <span className="text-slate-900">{toPersianDigits(allUsers.filter(u => u.role === "manager").length)} نفر</span>
                </div>
                <div className="flex justify-between">
                  <span>کل پست‌های انجمن:</span>
                  <span className="text-slate-900">{toPersianDigits(posts.length)} پست</span>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN TAB CONTENT AREA */}
          <section className="lg:col-span-3 space-y-6">
            {activeTab === "feed" && (
              <CommunityFeed
                currentUser={effectiveUser}
                posts={posts}
                onUpdatePosts={setPosts}
                allUsers={allUsers}
              />
            )}

            {activeTab === "hiring" && (
              <HiringMarketplace
                currentUser={effectiveUser}
                allUsers={allUsers}
                onUpdateUsers={handleUpdateUsersList}
                hiringOffers={hiringOffers}
                onAddHiringOffer={(newOffer) => setHiringOffers([newOffer, ...hiringOffers])}
                clientRequests={clientRequests}
                onAddClientRequest={(newReq) => setClientRequests([newReq, ...clientRequests])}
              />
            )}

            {activeTab === "leaderboard" && (
              <Leaderboard
                allUsers={allUsers}
                onSelectArtist={(artist) => {
                  setProfileUser(artist);
                  setActiveTab("profile");
                }}
                onChangeTab={(tab) => setActiveTab(tab as any)}
              />
            )}

            {activeTab === "assistant" && (
              <AIAssistant
                currentUser={effectiveUser}
                allUsers={allUsers}
                clientRequests={clientRequests}
              />
            )}

            {activeTab === "inbox" && (
              isGuest ? (
                <GuestViewPlaceholder 
                  title="صندوق درخواست‌ها و پیام‌ها" 
                  description="برای ارسال پیام، مدیریت درخواست‌های نوبت‌دهی سالن و پیشنهادهای کاریابی، لطفاً ابتدا وارد حساب کاربری خود شوید."
                  icon={Inbox}
                />
              ) : (
                <RequestsInbox
                  currentUser={effectiveUser}
                  hiringOffers={hiringOffers}
                  onUpdateHiringOffers={setHiringOffers}
                  clientRequests={clientRequests}
                  onUpdateClientRequests={setClientRequests}
                />
              )
            )}

            {activeTab === "profile" && (
              (isGuest && profileUser.id === "guest") ? (
                <GuestViewPlaceholder 
                  title="رزومه و پروفایل من" 
                  description="جهت ایجاد رزومه حرفه‌ای، ثبت مهارت‌ها، درج گواهی‌نامه‌ها و دریافت پیشنهادات استخدامی ابتدا باید حساب کاربری بسازید."
                  icon={UserCircle}
                />
              ) : (
                <UserProfile
                  currentUser={effectiveUser}
                  profileUser={profileUser}
                  onUpdateCurrentUser={handleUpdateCurrentUser}
                  onUpdateUsersList={handleUpdateUsersList}
                  allUsers={allUsers}
                  posts={posts}
                  onUpdatePosts={setPosts}
                />
              )
            )}
          </section>

        </div>
      </main>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION TAB BAR (Visible only on Mobile) */}
      {/* ========================================================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab("feed")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "feed" ? "text-[#6B7A4F] font-black scale-105" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[8px] font-black">خوراک</span>
        </button>

        <button
          onClick={() => setActiveTab("hiring")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "hiring" ? "text-[#6B7A4F] font-black scale-105" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[8px] font-black">استخدام</span>
        </button>

        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "leaderboard" ? "text-[#6B7A4F] font-black scale-105" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[8px] font-black">برترین‌ها</span>
        </button>

        <button
          onClick={() => setActiveTab("assistant")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "assistant" ? "text-[#6B7A4F] font-black scale-105" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <Sparkles className="w-5 h-5 text-[#6B7A4F]" />
          <span className="text-[8px] font-black">دستیار</span>
        </button>

        <button
          onClick={() => setActiveTab("inbox")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all relative cursor-pointer ${
            activeTab === "inbox" ? "text-[#6B7A4F] font-black scale-105" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <Inbox className="w-5 h-5" />
          <span className="text-[8px] font-black">صندوق</span>
          {pendingCount > 0 && (
            <span className="absolute top-0.5 right-2 bg-rose-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {toPersianDigits(pendingCount)}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            if (isGuest) {
              setProfileUser(guestUser);
              setActiveTab("profile");
            } else {
              setProfileUser(currentUser!);
              setActiveTab("profile");
            }
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "profile" && profileUser.id === effectiveUser.id ? "text-[#6B7A4F] font-black scale-105" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <UserCircle className="w-5 h-5" />
          <span className="text-[8px] font-black">پروفایل من</span>
        </button>
      </nav>

      {/* ========================================================= */}
      {/* BEAUTIFUL AUTHENTICATION MODAL (Popup AuthPage) */}
      {/* ========================================================= */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-fade-in text-right" dir="rtl">
          <div className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="space-y-0.5 text-right">
                <h3 className="text-xs font-black text-slate-800">ورود و عضویت در لجندین</h3>
                {authActionWarning ? (
                  <p className="text-[10px] text-amber-600 font-extrabold flex items-center gap-1 mt-1 justify-end">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {authActionWarning}
                  </p>
                ) : (
                  <p className="text-[10.5px] text-slate-400 font-bold mt-1">برای دسترسی به تمام امکانات وارد حساب خود شوید.</p>
                )}
              </div>
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setAuthActionWarning(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer text-sm font-black"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Auth Scrollable area */}
            <div className="flex-1 overflow-y-auto p-2">
              <AuthPage 
                allUsers={allUsers}
                onLoginSuccess={(user) => {
                  handleLoginSuccess(user);
                  setIsAuthModalOpen(false);
                  setAuthActionWarning(null);
                }}
                onRegisterSuccess={(updatedUsersList, loggedInUser) => {
                  handleRegisterSuccess(updatedUsersList, loggedInUser);
                  setIsAuthModalOpen(false);
                  setAuthActionWarning(null);
                }}
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
