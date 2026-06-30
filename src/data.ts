import { Salon, Artist, Service } from "./types";

export const servicesList: Service[] = [
  {
    id: "s1",
    name: "بالیاژ عسلی طلایی و براشینگ حرفه‌ای",
    category: "Hair",
    duration: 150,
    basePrice: 1200000,
    popularity: 9,
    description: "بالیاژ سفارشی و چندبعدی لوکس توسط هیرکالریست‌های ماهر همراه با براشینگ درخشان و ماندگار."
  },
  {
    id: "s2",
    name: "کوپ ژورنالی و هیرکات دقیق باب/پیکسی",
    category: "Hair",
    duration: 60,
    basePrice: 450000,
    popularity: 8,
    description: "کوتاهی موی فوق‌العاده متناسب با فرم چهره شما، با استفاده از تکنیک‌های پیشرفته قیچی خشک."
  },
  {
    id: "s3",
    name: "میکاپ لوکس و گلمور فرش قرمز",
    category: "Makeup",
    duration: 75,
    basePrice: 950000,
    popularity: 9,
    description: "آرایش کامل و بی‌نقص صورت با پرایمرهای آبرسان لوکس، مژه‌های ابریشمی و کانتورینگ حرفه‌ای زاویه‌ساز."
  },
  {
    id: "s4",
    name: "میکاپ ملایم و سافت‌گلم نچرال",
    category: "Makeup",
    duration: 50,
    basePrice: 600000,
    popularity: 7,
    description: "میکاپ سبک با فینیش ابریشمی و شاداب، با تمرکز بر درخشش طبیعی پوست و رنگ‌های ملایم نچرال."
  },
  {
    id: "s5",
    name: "کاشت ناخن ژل‌ایکس اختصاصی لجند",
    category: "Nails",
    duration: 90,
    basePrice: 500000,
    popularity: 10,
    description: "کاشت ناخن با ژل‌های نرم با قد و فرم دلخواه شما، همراه با طراحی مینیمال دست‌ساز سلیقه شما."
  },
  {
    id: "s6",
    name: "مانیکور روسی لوکس الیژین",
    category: "Nails",
    duration: 70,
    basePrice: 350000,
    popularity: 8,
    description: "پدیکور و مانیکور با سوهان برقی دقیق برای مراقبت از کوتیکول، استحکام‌سازی با هاردژل و لاک بادوام."
  },
  {
    id: "s7",
    name: "هیدروفیشیال سه مرحله‌ای جوانساز و درخشان‌کننده",
    category: "Skin",
    duration: 60,
    basePrice: 800000,
    popularity: 9,
    description: "لایه برداری و مکش عمیق منافذ همراه با تغذیه عمقی با هیالورونیک اسید و پپتیدها به همراه ماساژ گوی یخ."
  },
  {
    id: "s8",
    name: "پاکسازی تخصصی پوست با محصولات بیولوژیک رشرش",
    category: "Skin",
    duration: 90,
    basePrice: 1400000,
    popularity: 8,
    description: "پکیج سوپرلاکچری بازسازی پوست شامل فعال‌سازی لنفاوی، سرم‌های غلیظ اختصاصی برای لیفت، فرم‌دهی و شادابی فوق‌العاده."
  }
];

export const artistsList: Artist[] = [
  {
    id: "a1",
    name: "سرنا ونس",
    role: "هیرکالریست ارشد و استایلیست برجسته مو",
    rating: 4.9,
    reviewCount: 142,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
    skills: [
      { skill: "تکنیک بالیاژ مدرن", percentage: 98 },
      { skill: "کوتاهی ژورنالی", percentage: 92 },
      { skill: "ترکیب رنگ‌های پاستلی", percentage: 88 }
    ],
    verified: true,
    score: 96
  },
  {
    id: "a2",
    name: "مارکوس تورن",
    role: "متخصص هیرکات آقایان و استایل موی کلاسیک",
    rating: 4.8,
    reviewCount: 95,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300",
    skills: [
      { skill: "فید‌های دقیق مو", percentage: 96 },
      { skill: "فرمر و حالت‌دهی ریش", percentage: 94 },
      { skill: "استایل بافت مو", percentage: 89 }
    ],
    verified: true,
    score: 93
  },
  {
    id: "a3",
    name: "کلویی دوپونت",
    role: "میکاپ آرتیست بین‌المللی و سلبریتی‌ها",
    rating: 4.95,
    reviewCount: 184,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    skills: [
      { skill: "کانتورینگ فوق پیشرفته", percentage: 99 },
      { skill: "گریم و میکاپ ایربراش", percentage: 95 },
      { skill: "طراحی تخصصی مژه", percentage: 92 }
    ],
    verified: true,
    score: 98
  },
  {
    id: "a4",
    name: "یوکی سایتو",
    role: "مدیر طراحی ناخن و متخصص کاشت ژل",
    rating: 5.0,
    reviewCount: 210,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300",
    skills: [
      { skill: "طراحی دست‌آزاد ناخن", percentage: 100 },
      { skill: "کاشت ژل‌-ایکس", percentage: 97 },
      { skill: "ترمیم و مراقبت کوتیکول", percentage: 94 }
    ],
    verified: true,
    score: 99
  },
  {
    id: "a5",
    name: "دکتر النا رستووا",
    role: "پزشک و متخصص ارشد سلامت پوست",
    rating: 4.85,
    reviewCount: 112,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    skills: [
      { skill: "پاکسازی درمال اینفیوژن", percentage: 95 },
      { skill: "تخلیه سموم لنفاوی", percentage: 93 },
      { skill: "پیلینگ شیمیایی جوانساز", percentage: 90 }
    ],
    verified: true,
    score: 94
  }
];

export const salonsList: Salon[] = [
  {
    id: "sal1",
    name: "خانه زیبایی لجند الیژین، جردن",
    rating: 4.9,
    reviews: 320,
    location: "تهران، خیابان جردن، شماره ۱۰۰",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800",
    description: "شعبه مرکزی ما با طراحی زیست‌دوست مدرن، رایحه‌درمانی آرامش‌بخش اختصاصی، سوئیت‌های خصوصی بی‌صدا و پیشرفته‌ترین روش‌های درمانی مو مجهز به همگام‌سازی ابری.",
    services: [servicesList[0], servicesList[1], servicesList[4], servicesList[6]],
    verified: true
  },
  {
    id: "sal2",
    name: "آتلیه زیبایی لجند، زعفرانیه",
    rating: 4.8,
    reviews: 195,
    location: "تهران، زعفرانیه، خیابان مقدس اردبیلی",
    image: "https://images.unsplash.com/photo-1521590832167-7bcbfeac5552?auto=format&fit=crop&q=80&w=800",
    description: "فضایی دنج و لوکس به سبک لوفت با نور طبیعی بی‌نظیر و ارائه خدمات استایل ژورنالی فوق شخصی‌سازی شده برای سلیقه‌های خاص.",
    services: [servicesList[1], servicesList[2], servicesList[3], servicesList[7]],
    verified: true
  },
  {
    id: "sal3",
    name: "مرکز اسپا و جوانسازی لجند، الهیه",
    rating: 4.95,
    reviews: 410,
    location: "تهران، الهیه، برج‌های دیپلماتیک",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800",
    description: "پناهگاهی وسیع برای احیا و تندرستی پوست و آرامش لوکس شما. مجهز به اتاق‌های بخار گیاهی و پاکسازی‌های ارگانیک سفارشی پوست.",
    services: [servicesList[4], servicesList[5], servicesList[6], servicesList[7]],
    verified: true
  }
];
