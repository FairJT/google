import React, { useState } from "react";
import { User, Skill, PortfolioItem, Review, Post, Comment, UserRole } from "../types";
import { Award, Star, CheckCircle2, ShieldCheck, Sparkles, Plus, Image, Trash2, Calendar, Phone, Mail, ToggleLeft, ToggleRight, MapPin, Briefcase, MessageSquare, Heart, Send, Tag, AlertCircle } from "lucide-react";
import { toPersianDigits, formatToman } from "../utils/shamsi";
import ArtistSkillMatrix from "./ArtistSkillMatrix";

const PRESET_POST_IMAGES = [
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1632345031435-8797b2d58045?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=600&auto=format&fit=crop"
];

const TAG_TRANSLATIONS: Record<string, string> = {
  "تجربه": "تجربه و نمونه کار",
  "استخدام": "فرصت شغلی و استخدام",
  "ترند": "ترندهای زیبایی",
  "آموزش": "نکته آموزشی"
};

const TAG_COLORS: Record<string, string> = {
  "تجربه": "bg-indigo-50 text-indigo-700 border-indigo-100",
  "استخدام": "bg-amber-50 text-amber-700 border-amber-100",
  "ترند": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "آموزش": "bg-purple-50 text-purple-700 border-purple-100"
};

const getRoleBadge = (role: UserRole) => {
  switch (role) {
    case "manager":
      return { label: "مدیریت سالن", color: "bg-purple-50 text-purple-700 border-purple-100" };
    case "artist":
      return { label: "آرتیست زیبایی", color: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    case "client":
      return { label: "مشتری عادی", color: "bg-blue-50 text-blue-700 border-blue-100" };
    default:
      return { label: "عضو جامعه", color: "bg-slate-50 text-slate-700 border-slate-100" };
  }
};

interface UserProfileProps {
  currentUser: User;
  profileUser: User; // The user whose profile is being viewed (can be the currentUser or someone else)
  onUpdateCurrentUser: (updated: User) => void;
  onUpdateUsersList: (updatedUsers: User[]) => void;
  allUsers: User[];
  posts: Post[];
  onUpdatePosts: (updatedPosts: Post[]) => void;
}

export default function UserProfile({
  currentUser,
  profileUser,
  onUpdateCurrentUser,
  onUpdateUsersList,
  allUsers,
  posts,
  onUpdatePosts
}: UserProfileProps) {
  const isOwnProfile = currentUser.id === profileUser.id;

  // Local editing states (only used if isOwnProfile)
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(profileUser.bio || "");
  
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("رنگ مو");
  
  const [newPortfolioTitle, setNewPortfolioTitle] = useState("");
  const [newPortfolioDesc, setNewPortfolioDesc] = useState("");
  const [newPortfolioImg, setNewPortfolioImg] = useState("");
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);

  const [newCert, setNewCert] = useState("");

  // Forum local states inside Profile
  const [profileNewPostText, setProfileNewPostText] = useState("");
  const [profileSelectedTag, setProfileSelectedTag] = useState("تجربه");
  const [profilePostImageUrl, setProfilePostImageUrl] = useState("");
  const [profileShowImageSelector, setProfileShowImageSelector] = useState(false);
  const [profileCommentInputs, setProfileCommentInputs] = useState<Record<string, string>>({});
  const [profileTab, setProfileTab] = useState<"resume" | "posts">("resume");

  // Calculate profile strength & construct checklist
  const getProfileStrengthDetails = (user: User) => {
    const checklist = [
      { key: "avatar", label: "عکس پرسنلی رزومه", points: 15, completed: !!(user.avatar && !user.avatar.includes("default")) },
      { key: "bio", label: "درباره من و بیوگرافی تفصیلی", points: 15, completed: !!(user.bio && user.bio.trim().length > 10) },
      { key: "skills", label: "ثبت حداقل ۳ تخصص اصلی", points: 15, completed: !!(user.skills && user.skills.length >= 3) },
      { key: "portfolio", label: "افزودن حداقل ۳ نمونه‌کار در آلبوم", points: 15, completed: !!(user.portfolio && user.portfolio.length >= 3) },
      { key: "experience", label: "تعیین دقیق میزان سابقه کار", points: 15, completed: !!(user.yearsOfExperience !== undefined && user.yearsOfExperience > 0) },
      { key: "certs", label: "بارگذاری مدارک و گواهینامه‌ها", points: 10, completed: !!(user.certifications && user.certifications.length > 0) },
      { key: "phone", label: "ثبت و احراز شماره تماس", points: 15, completed: !!user.phone }
    ];

    const completedPoints = checklist.reduce((sum, item) => sum + (item.completed ? item.points : 0), 0);
    return {
      percentage: Math.min(completedPoints, 100),
      checklist
    };
  };

  const { percentage, checklist } = getProfileStrengthDetails(profileUser);

  // Profile Save Actions
  const handleSaveBio = () => {
    const updated = { ...profileUser, bio: bioText };
    updateUserAcrossState(updated);
    setIsEditingBio(false);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkill: Skill = { name: newSkillName.trim(), category: newSkillCategory };
    const currentSkills = profileUser.skills || [];
    
    // Avoid duplicates
    if (currentSkills.some(s => s.name === newSkill.name)) return;

    const updated = { ...profileUser, skills: [...currentSkills, newSkill] };
    updateUserAcrossState(updated);
    setNewSkillName("");
  };

  const handleRemoveSkill = (skillName: string) => {
    const currentSkills = profileUser.skills || [];
    const updated = { ...profileUser, skills: currentSkills.filter(s => s.name !== skillName) };
    updateUserAcrossState(updated);
  };

  const handleAddPortfolioItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioTitle.trim()) return;

    const defaultImg = newPortfolioImg || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400&auto=format&fit=crop";
    const newItem: PortfolioItem = {
      id: "port-" + Math.random().toString(36).substr(2, 9),
      imageUrl: defaultImg,
      title: newPortfolioTitle.trim(),
      description: newPortfolioDesc.trim()
    };

    const currentPortfolio = profileUser.portfolio || [];
    const updated = { ...profileUser, portfolio: [...currentPortfolio, newItem] };
    updateUserAcrossState(updated);
    
    setNewPortfolioTitle("");
    setNewPortfolioDesc("");
    setNewPortfolioImg("");
    setShowAddPortfolio(false);
  };

  const handleRemovePortfolioItem = (itemId: string) => {
    const currentPortfolio = profileUser.portfolio || [];
    const updated = { ...profileUser, portfolio: currentPortfolio.filter(item => item.id !== itemId) };
    updateUserAcrossState(updated);
  };

  const handleAddCertification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.trim()) return;

    const currentCerts = profileUser.certifications || [];
    if (currentCerts.includes(newCert.trim())) return;

    const updated = { ...profileUser, certifications: [...currentCerts, newCert.trim()] };
    updateUserAcrossState(updated);
    setNewCert("");
  };

  const handleRemoveCertification = (certName: string) => {
    const currentCerts = profileUser.certifications || [];
    const updated = { ...profileUser, certifications: currentCerts.filter(c => c !== certName) };
    updateUserAcrossState(updated);
  };

  // Helper to sync state both for currentUser (if own profile) and main users database
  const updateUserAcrossState = (updated: User) => {
    if (isOwnProfile) {
      onUpdateCurrentUser(updated);
    }
    const updatedList = allUsers.map(u => (u.id === updated.id ? updated : u));
    onUpdateUsersList(updatedList);
  };

  const toggleAvailability = (key: "acceptingRequests" | "openForHiring") => {
    const updated = { 
      ...profileUser, 
      [key]: !profileUser[key] 
    };
    updateUserAcrossState(updated);
  };

  const profilePosts = React.useMemo(() => {
    return posts.filter(p => p.authorId === profileUser.id);
  }, [posts, profileUser.id]);

  const handleProfileCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.id === "guest") {
      alert("کاربر گرامی، برای انتشار پست جدید ابتدا باید وارد حساب کاربری خود شوید یا ثبت‌نام کنید.");
      return;
    }
    if (!profileNewPostText.trim()) return;

    const newPost: Post = {
      id: "post-" + Math.random().toString(36).substr(2, 9),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      content: profileNewPostText,
      image: profilePostImageUrl || undefined,
      tag: profileSelectedTag,
      createdAt: "همین الان",
      likesCount: 0,
      likedBy: [],
      comments: []
    };

    onUpdatePosts([newPost, ...posts]);
    setProfileNewPostText("");
    setProfilePostImageUrl("");
    setProfileShowImageSelector(false);
  };

  const handleProfileLikePost = (postId: string) => {
    if (currentUser.id === "guest") {
      alert("کاربر گرامی، برای لایک کردن پست‌ها ابتدا باید وارد حساب کاربری خود شوید یا ثبت‌نام کنید.");
      return;
    }
    const updated = posts.map(p => {
      if (p.id === postId) {
        const isLiked = p.likedBy.includes(currentUser.id);
        const likedBy = isLiked 
          ? p.likedBy.filter(id => id !== currentUser.id)
          : [...p.likedBy, currentUser.id];
        return {
          ...p,
          likedBy,
          likesCount: likedBy.length
        };
      }
      return p;
    });
    onUpdatePosts(updated);
  };

  const handleProfileDeletePost = (postId: string) => {
    if (confirm("آیا از حذف این پست اطمینان دارید؟")) {
      const updated = posts.filter(p => p.id !== postId);
      onUpdatePosts(updated);
    }
  };

  const handleProfileAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.id === "guest") {
      alert("کاربر گرامی، برای ثبت نظر ابتدا باید وارد حساب کاربری خود شوید یا ثبت‌نام کنید.");
      return;
    }
    const text = profileCommentInputs[postId] || "";
    if (!text.trim()) return;

    const updated = posts.map(p => {
      if (p.id === postId) {
        const newComment: Comment = {
          id: "comment-" + Math.random().toString(36).substr(2, 9),
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar,
          authorRole: currentUser.role,
          content: text,
          createdAt: "همین الان",
          likesCount: 0,
          likedBy: []
        };
        return {
          ...p,
          comments: [...p.comments, newComment]
        };
      }
      return p;
    });

    onUpdatePosts(updated);
    setProfileCommentInputs({ ...profileCommentInputs, [postId]: "" });
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Profile Cover & Header Banner */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="h-44 bg-slate-100 relative">
          <img
            src={profileUser.coverImage || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop"}
            alt="Cover"
            className="w-full h-full object-cover opacity-85"
          />
          {isOwnProfile && (
            <span className="absolute top-3.5 right-3.5 bg-slate-900/70 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-xs">
              پروفایل کاربری اختصاصی شما
            </span>
          )}
        </div>

        {/* Profile Stats Overview */}
        <div className="p-5.5 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16 md:-mt-20">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4.5 text-center md:text-right">
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-md relative z-10 shrink-0"
              />
              <div className="space-y-1.5 pb-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h2 className="text-lg font-bold text-slate-950">{profileUser.name}</h2>
                  {profileUser.role === "artist" && (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      هنرمند زیبایی ممیزی شده
                    </span>
                  )}
                  {profileUser.role === "manager" && (
                    <span className="bg-purple-50 text-purple-700 border border-purple-100 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      مدیر و کارفرمای سالن
                    </span>
                  )}
                  {profileUser.role === "client" && (
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      عضو فعال انجمن
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 font-medium">{profileUser.title}</p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] text-slate-400 font-bold">
                  <span className="flex items-center gap-0.5"><MapPin className="w-3.5 h-3.5 shrink-0" /> {profileUser.city}</span>
                  {profileUser.yearsOfExperience !== undefined && (
                    <span>سابقه: {toPersianDigits(profileUser.yearsOfExperience)} سال کار تخصصی</span>
                  )}
                  {profileUser.rating && (
                    <span className="flex items-center gap-0.5 text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400 shrink-0" /> {toPersianDigits(profileUser.rating)} رضایت
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Toggle Settings for Own Profile */}
            {isOwnProfile && (
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-2 text-xs font-bold self-stretch md:self-auto min-w-[200px]">
                <p className="text-[10px] text-slate-400 pb-1.5 border-b border-slate-200">تنظیمات در دسترس پلتفرم:</p>
                
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-600">پذیرش درخواست نوبت مشتری:</span>
                  <button 
                    onClick={() => toggleAvailability("acceptingRequests")}
                    className="text-slate-700 focus:outline-none"
                  >
                    {profileUser.acceptingRequests ? (
                      <ToggleRight className="w-8 h-8 text-[#6B7A4F] shrink-0" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-300 shrink-0" />
                    )}
                  </button>
                </div>

                {profileUser.role === "artist" && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-600">آماده به کار برای سالن‌ها:</span>
                    <button 
                      onClick={() => toggleAvailability("openForHiring")}
                      className="text-slate-700 focus:outline-none"
                    >
                      {profileUser.openForHiring ? (
                        <ToggleRight className="w-8 h-8 text-[#6B7A4F] shrink-0" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-300 shrink-0" />
                      )}
                    </button>
                  </div>
                )}

                {profileUser.role === "manager" && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-600">در حال استخدام پرسنل:</span>
                    <button 
                      onClick={() => toggleAvailability("openForHiring")}
                      className="text-slate-700 focus:outline-none"
                    >
                      {profileUser.openForHiring ? (
                        <ToggleRight className="w-8 h-8 text-[#6B7A4F] shrink-0" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-300 shrink-0" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Inner Navigation Tabs */}
      <div className="flex border border-slate-150 bg-white p-1.5 rounded-2xl gap-1.5 shadow-2xs my-4">
        <button
          onClick={() => setProfileTab("resume")}
          className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            profileTab === "resume"
              ? "bg-[#6B7A4F] text-white shadow-xs font-extrabold"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>رزومه و جزئیات فنی رزومه</span>
        </button>
        <button
          onClick={() => setProfileTab("posts")}
          className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            profileTab === "posts"
              ? "bg-[#6B7A4F] text-white shadow-xs font-extrabold"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>پست‌ها و مطالب منتشر شده در انجمن ({toPersianDigits(profilePosts.length)})</span>
        </button>
      </div>

      {/* Grid Layout - Details & Profile Strength */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* RIGHT COLUMN: Profile details, Bio, Skills */}
        <div className="lg:col-span-2 space-y-6">
          {profileTab === "resume" ? (
            <>
              {/* Bio / About */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">درباره من و اهداف حرفه‌ای</h3>
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditingBio(!isEditingBio)}
                      className="text-xs text-[#6B7A4F] hover:underline font-bold"
                    >
                      {isEditingBio ? "لغو" : "ویرایش بیو"}
                    </button>
                  )}
                </div>

                {isEditingBio ? (
                  <div className="space-y-3">
                    <textarea
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      rows={4}
                      className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-olive-300 resize-none"
                      placeholder="رزومه، تجارب و افتخارات کاری خود را بنویسید..."
                    />
                    <button
                      onClick={handleSaveBio}
                      className="bg-[#6B7A4F] hover:bg-[#57643F] text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-all cursor-pointer"
                    >
                      ذخیره بیوگرافی
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {profileUser.bio || "بیوگرافی کاری هنوز ثبت نشده است."}
                  </p>
                )}
              </div>

              {/* Technical Radar Chart Matrix for Artists */}
              {profileUser.role === "artist" && (
                <ArtistSkillMatrix
                  currentUser={currentUser}
                  artists={allUsers.filter(u => u.role === "artist")}
                  selectedArtistId={profileUser.id}
                />
              )}

              {/* Specialities / Skills */}
              {(profileUser.role === "artist" || isOwnProfile) && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">مهارت‌ها و لاین‌های فوق‌تخصصی</h3>
                  
                  {/* Skills Chips list */}
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skills && profileUser.skills.length > 0 ? (
                      profileUser.skills.map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-lg"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {skill.name} ({skill.category})
                          {isOwnProfile && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill.name)}
                              className="text-rose-500 hover:text-rose-700 mr-1.5 font-bold cursor-pointer"
                              title="حذف مهارت"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 font-bold">هیچ مهارتی ثبت نشده است.</p>
                    )}
                  </div>

                  {/* Add skill form (own profile) */}
                  {isOwnProfile && (
                    <form onSubmit={handleAddSkill} className="flex gap-2 items-center pt-3 border-t border-slate-100">
                      <input
                        type="text"
                        required
                        placeholder="عنوان مهارت (مثال: آمبره روسی)"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-olive-300"
                      />
                      <select
                        value={newSkillCategory}
                        onChange={(e) => setNewSkillCategory(e.target.value)}
                        className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none cursor-pointer font-bold"
                      >
                        <option value="رنگ مو">رنگ مو</option>
                        <option value="ناخن">لاین ناخن</option>
                        <option value="میکاپ">میکاپ</option>
                        <option value="پوست">پوست و فیشیال</option>
                        <option value="مژه">مژه و ابرو</option>
                      </select>
                      <button
                        type="submit"
                        className="bg-[#6B7A4F] hover:bg-[#57643F] text-white p-2 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
                        title="افزودن تخصص"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Portfolio Item Gallery */}
              {(profileUser.role === "artist" || isOwnProfile) && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">آلبوم تصاویر کارهای عملی و نمونه‌کارها</h3>
                    {isOwnProfile && (
                      <button
                        onClick={() => setShowAddPortfolio(!showAddPortfolio)}
                        className="text-xs bg-[#6B7A4F] hover:bg-[#57643F] text-white font-bold px-3 py-1 rounded-lg transition-all"
                      >
                        {showAddPortfolio ? "بستن فرم" : "افزودن نمونه‌کار"}
                      </button>
                    )}
                  </div>

                  {/* Add Portfolio Form */}
                  {isOwnProfile && showAddPortfolio && (
                    <form onSubmit={handleAddPortfolioItem} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold mb-1">عنوان اثر:</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: فرنچ لمینت ناخن"
                            value={newPortfolioTitle}
                            onChange={(e) => setNewPortfolioTitle(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-none focus:border-olive-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold mb-1">آدرس اینترنتی تصویر نمونه‌کار:</label>
                          <input
                            type="text"
                            placeholder="اختیاری - آدرس مستقیم عکس"
                            value={newPortfolioImg}
                            onChange={(e) => setNewPortfolioImg(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-none focus:border-olive-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-1">توضیحات کوتاه یا تکنیک به کار رفته:</label>
                        <input
                          type="text"
                          placeholder="مثال: استفاده از تاپ شاین کریستالی با تکنیک روسی بدون سوهان زبر"
                          value={newPortfolioDesc}
                          onChange={(e) => setNewPortfolioDesc(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-none focus:border-olive-300"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-[#6B7A4F] hover:bg-[#57643F] text-white text-xs font-bold py-2 rounded-xl transition-all cursor-pointer"
                      >
                        انتشار در آلبوم
                      </button>
                    </form>
                  )}

                  {/* Photo grid */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    {profileUser.portfolio && profileUser.portfolio.length > 0 ? (
                      profileUser.portfolio.map((item) => (
                        <div 
                          key={item.id} 
                          className="group/item relative bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shadow-2xs"
                        >
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full aspect-square object-cover group-hover:scale-105 transition-all duration-300" 
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 p-2.5 text-white transform translate-y-2 group-hover/item:translate-y-0 transition-transform">
                            <h4 className="text-[10px] font-bold truncate">{item.title}</h4>
                            <p className="text-[8px] text-slate-300 truncate mt-0.5">{item.description}</p>
                          </div>

                          {isOwnProfile && (
                            <button
                              type="button"
                              onClick={() => handleRemovePortfolioItem(item.id)}
                              className="absolute top-2 right-2 bg-rose-600/95 hover:bg-rose-700 text-white p-1 rounded-lg shadow-sm transition-all"
                              title="حذف نمونه‌کار"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center p-8 border-2 border-dashed border-slate-150 rounded-xl">
                        <p className="text-xs text-slate-400 font-bold">آلبوم تصاویر هنوز خالی است.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Certifications list */}
              {(profileUser.role === "artist" || isOwnProfile) && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">گواهینامه‌ها، مدارک و افتخارات</h3>
                  
                  <ul className="space-y-2">
                    {profileUser.certifications && profileUser.certifications.length > 0 ? (
                      profileUser.certifications.map((cert, idx) => (
                        <li 
                          key={idx} 
                          className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center justify-between text-xs text-slate-700"
                        >
                          <span className="flex items-center gap-1.5 font-bold text-slate-800">
                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                            {cert}
                          </span>
                          {isOwnProfile && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCertification(cert)}
                              className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                            >
                              حذف مدرک
                            </button>
                          )}
                        </li>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 font-bold">هیچ مدرکی بارگذاری نشده است.</p>
                    )}
                  </ul>

                  {isOwnProfile && (
                    <form onSubmit={handleAddCertification} className="flex gap-2 items-center pt-3 border-t border-slate-100">
                      <input
                        type="text"
                        required
                        placeholder="عنوان مدرک (مثال: دیپلم پلاتینیوم لورآل)"
                        value={newCert}
                        onChange={(e) => setNewCert(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-olive-300"
                      />
                      <button
                        type="submit"
                        className="bg-[#6B7A4F] hover:bg-[#57643F] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        ثبت گواهی‌نامه
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* User Reviews */}
              {profileUser.role === "artist" && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">بازخورد و نظرات مراجعین ممیزی شده</h3>
                  
                  <div className="space-y-3.5">
                    {profileUser.reviews && profileUser.reviews.length > 0 ? (
                      profileUser.reviews.map((rev) => (
                        <div key={rev.id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={rev.reviewerAvatar} alt={rev.reviewerName} className="w-8 h-8 rounded-full object-cover border border-slate-150" />
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">{rev.reviewerName}</h4>
                                <p className="text-[9px] text-slate-400 font-bold">{rev.date}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-0.5 text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-amber-400 stroke-amber-400" : "stroke-slate-300"}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed italic pr-1 border-r-2 border-slate-200">« {rev.comment} »</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center font-bold py-4">هیچ بازخوردی برای این همکار ثبت نشده است.</p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Write Post Form if own profile */}
              {isOwnProfile && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
                  <div className="flex gap-3.5">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-100 shrink-0"
                    />
                    <form onSubmit={handleProfileCreatePost} className="flex-1 space-y-4">
                      <textarea
                        value={profileNewPostText}
                        onChange={(e) => setProfileNewPostText(e.target.value)}
                        placeholder="یک مطلب، تجربه یا فرصت شغلی جدید بنویسید که مستقیماً در تالار همگانی انجمن درج شود..."
                        rows={3}
                        className="w-full text-xs text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 focus:outline-none focus:border-[#6B7A4F] focus:bg-white transition-all resize-none"
                      />

                      {profilePostImageUrl && (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[2/1] max-h-48">
                          <img src={profilePostImageUrl} alt="Attachment" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setProfilePostImageUrl("")}
                            className="absolute top-2.5 right-2.5 bg-slate-900/80 text-white hover:bg-slate-900 px-2.5 py-1 rounded-full transition-all text-[10px]"
                          >
                            حذف تصویر
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                            <Tag className="w-3.5 h-3.5 text-slate-400" />
                            <select
                              value={profileSelectedTag}
                              onChange={(e) => setProfileSelectedTag(e.target.value)}
                              className="bg-transparent text-[11px] text-slate-600 font-bold outline-none cursor-pointer"
                            >
                              <option value="تجربه">تجربه و نمونه کار</option>
                              <option value="ترند">ترند روز</option>
                              <option value="آموزش">آموزش</option>
                              <option value="استخدام">استخدام</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => setProfileShowImageSelector(!profileShowImageSelector)}
                            className="flex items-center gap-1 text-slate-500 hover:text-[#6B7A4F] hover:bg-slate-50 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all"
                          >
                            <Image className="w-3.5 h-3.5" />
                            افزودن تصویر پیش‌فرض
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={!profileNewPostText.trim()}
                          className="bg-[#6B7A4F] hover:bg-[#57643F] disabled:opacity-50 text-white text-[11px] font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          انتشار در تالار گفتگو
                        </button>
                      </div>

                      {profileShowImageSelector && (
                        <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                          <p className="text-[10px] text-slate-400 font-bold">انتخاب یکی از طرح‌های ممیزی شده پیش‌فرض:</p>
                          <div className="grid grid-cols-4 gap-2">
                            {PRESET_POST_IMAGES.map((url, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setProfilePostImageUrl(url);
                                  setProfileShowImageSelector(false);
                                }}
                                className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-[#6B7A4F] transition-all"
                              >
                                <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              )}

              {/* Profile Posts List */}
              <div className="space-y-5">
                {profilePosts.length > 0 ? (
                  profilePosts.map((post) => {
                    const badge = getRoleBadge(post.authorRole);
                    const isLikedByMe = post.likedBy.includes(currentUser.id);

                    return (
                      <div key={post.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
                        {/* Post Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.authorAvatar}
                              alt={post.authorName}
                              className="w-11 h-11 rounded-full object-cover border border-slate-100"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">{post.authorName}</h4>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${badge.color}`}>
                                  {badge.label}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">{post.createdAt}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {post.tag && (
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${TAG_COLORS[post.tag] || "bg-slate-50 text-slate-600"}`}>
                                {TAG_TRANSLATIONS[post.tag] || post.tag}
                              </span>
                            )}
                            {post.authorId === currentUser.id && (
                              <button
                                onClick={() => handleProfileDeletePost(post.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                                title="حذف این پست"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Post Content */}
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{post.content}</p>

                        {/* Post Image */}
                        {post.image && (
                          <div className="rounded-xl overflow-hidden border border-slate-150 max-h-80 bg-slate-50">
                            <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Interaction Bar */}
                        <div className="flex items-center gap-4.5 pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                          <button
                            onClick={() => handleProfileLikePost(post.id)}
                            className={`flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer ${
                              isLikedByMe ? "text-rose-600 font-extrabold" : "hover:text-slate-700"
                            }`}
                          >
                            <Heart className={`w-4.5 h-4.5 ${isLikedByMe ? "fill-rose-600 text-rose-600" : ""}`} />
                            <span>{toPersianDigits(post.likesCount)} پسند</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <MessageSquare className="w-4.5 h-4.5" />
                            <span>{toPersianDigits(post.comments.length)} دیدگاه</span>
                          </div>
                        </div>

                        {/* Comments Block */}
                        <div className="bg-slate-50/55 rounded-xl p-3.5 space-y-3.5">
                          {post.comments.length > 0 && (
                            <div className="space-y-3">
                              {post.comments.map((comment) => (
                                <div key={comment.id} className="text-xs space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-100">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <img
                                        src={comment.authorAvatar}
                                        alt={comment.authorName}
                                        className="w-5.5 h-5.5 rounded-full object-cover border border-slate-100"
                                      />
                                      <span className="font-bold text-slate-900">{comment.authorName}</span>
                                      <span className="text-[8px] text-slate-400 bg-slate-50 border px-1 rounded-full font-normal">
                                        {comment.authorRole === "manager" ? "مدیر" : comment.authorRole === "artist" ? "آرتیست" : "مشتری"}
                                      </span>
                                    </div>
                                    <span className="text-[9px] text-slate-400">{comment.createdAt}</span>
                                  </div>
                                  <p className="text-slate-600 pr-1 border-r border-slate-200 leading-relaxed font-normal">{comment.content}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Comment Input Form */}
                          <form
                            onSubmit={(e) => handleProfileAddComment(post.id, e)}
                            className="flex gap-2"
                          >
                            <input
                              type="text"
                              required
                              value={profileCommentInputs[post.id] || ""}
                              onChange={(e) =>
                                setProfileCommentInputs({
                                  ...profileCommentInputs,
                                  [post.id]: e.target.value
                                })
                              }
                              placeholder="نظر کارشناسی یا بازخورد خود را بنویسید..."
                              className="flex-1 text-xs text-slate-800 placeholder-slate-400 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#6B7A4F]"
                            />
                            <button
                              type="submit"
                              disabled={!(profileCommentInputs[post.id] || "").trim()}
                              className="bg-[#6B7A4F] hover:bg-[#57643F] disabled:opacity-50 text-white px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                            >
                              ثبت
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center space-y-3.5">
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-700">هیچ مطلبی منتشر نشده است</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-1.5 max-w-sm mx-auto leading-normal">
                        {isOwnProfile
                          ? "شما هنوز هیچ پست یا نمونه‌کاری را در تالار گفتگو به اشتراک نگذاشته‌اید. اولین مطلب خود را بنویسید!"
                          : "این همکار ارزشمند هنوز هیچ پستی در انجمن ارسال نکرده است."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* LEFT COLUMN: Profile Strength Meter & Contact Info */}
        <div className="space-y-6">
          
          {/* Strength meter checklist (Only shown to own profile) */}
          {isOwnProfile && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">قدرت و اعتبار رزومه شما</h3>
              </div>

              {/* Progress visual */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>تکمیل کل فیلدها</span>
                  <span className="text-emerald-700 font-extrabold">{toPersianDigits(percentage)}٪</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {percentage === 100 ? (
                  <p className="text-[10px] text-emerald-600 font-bold text-center">تبریک! رزومه شما با بالاترین اعتبار فعال شد. 🎉</p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold leading-normal">با تکمیل موارد باقیمانده، شانس خود را در دریافت درخواست نوبت و استخدام تا ۴ برابر افزایش دهید.</p>
                )}
              </div>

              {/* Checklist details */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                {checklist.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className={`flex items-center gap-1.5 ${item.completed ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border-2 border-slate-200 block shrink-0" />
                      )}
                      {item.label}
                    </span>
                    {!item.completed && (
                      <span className="text-[9.5px] text-slate-400 font-bold bg-slate-50 border border-slate-200 px-1.5 py-0.2 rounded">
                        +{toPersianDigits(item.points)} امتیاز
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact and credentials info card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">اطلاعات ارتباطی و موقعیت</h3>
            
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[9px] font-bold">شماره تلفن تماس:</span>
                  <span className="font-bold font-mono" dir="ltr">{profileUser.phone || "ثبت نشده"}</span>
                </div>
              </div>

              {profileUser.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold">پست الکترونیکی:</span>
                    <span>{profileUser.email}</span>
                  </div>
                </div>
              )}

              {profileUser.salonName && (
                <div className="flex items-center gap-2.5 border-t border-slate-100 pt-3 mt-3">
                  <Award className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold">نام سالن تحت مدیریت:</span>
                    <span className="font-bold text-[#6B7A4F]">{profileUser.salonName}</span>
                    {profileUser.salonLocation && (
                      <p className="text-[10px] text-slate-500 font-normal mt-1 leading-normal">{profileUser.salonLocation}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
