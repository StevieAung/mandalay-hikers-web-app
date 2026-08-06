import { createContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Locale = 'en' | 'my'

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const translations = {
  'nav.trails': ['Trails', 'လမ်းကြောင်းများ'],
  'nav.events': ['Events', 'ခရီးစဉ်များ'],
  'nav.community': ['Community', 'အသိုင်းအဝိုင်း'],
  'nav.search': ['Search trails', 'လမ်းကြောင်းများ ရှာဖွေရန်'],
  'nav.signIn': ['Sign In', 'အကောင့်ဝင်ရန်'],
  'nav.profile': ['Profile', 'ပရိုဖိုင်'],
  'nav.dashboard': ['Dashboard', 'ဒက်ရှ်ဘုတ်'],
  'nav.logout': ['Logout', 'အကောင့်ထွက်ရန်'],
  'nav.current': ['Current', 'လက်ရှိ'],
  'nav.menu': ['Toggle menu', 'မီနူး ဖွင့်/ပိတ်ရန်'],
  'auth.join': ['Join the', 'ပါဝင်လိုက်ပါ'],
  'auth.welcome': ['Welcome', 'ကြိုဆိုပါတယ်'],
  'auth.admin': ['Admin', 'စီမံခန့်ခွဲသူ'],
  'auth.network': ['Trail Network.', 'တောင်တက်အသိုင်းအဝိုင်းသို့။'],
  'auth.back': ['Back Trekker.', 'ပြန်လည်ကြိုဆိုပါတယ်။'],
  'auth.command': ['Command Login.', 'စီမံခန့်ခွဲရန် အကောင့်ဝင်ပါ။'],
  'auth.name': ['Full Name', 'အမည်အပြည့်အစုံ'],
  'auth.email': ['Email Address', 'အီးမေးလ်လိပ်စာ'],
  'auth.password': ['Password', 'စကားဝှက်'],
  'auth.forgot': ['Forgot?', 'မေ့နေပါသလား?'],
  'auth.create': ['Create Explorer Account', 'တောင်တက်သူအကောင့် ဖန်တီးရန်'],
  'auth.enterAdmin': ['Enter Admin Panel', 'စီမံခန့်ခွဲမှုသို့ ဝင်ရန်'],
  'auth.or': ['Or coordinate via', 'သို့မဟုတ်'],
  'auth.already': ['Already trail ready?', 'တောင်တက်ရန် အသင့်ဖြစ်ပြီးသားလား?'],
  'auth.new': ['New to the trails?', 'တောင်တက်မှုအသစ်လား?'],
  'auth.createAccount': ['Create an Account', 'အကောင့်ဖန်တီးရန်'],
  'auth.explorerDefault': ['Explorer by default', 'ပုံမှန် တောင်တက်သူအကောင့်'],
  'auth.adminOnly': ['Admin access only', 'စီမံခန့်ခွဲသူသာ ဝင်ရောက်နိုင်သည်'],
  'auth.region': ['Mandalay Region', 'မန္တလေးတိုင်း'],
  'auth.rugged': ['Rugged.', 'သန်မာသော။'],
  'auth.reliable': ['Reliable.', 'ယုံကြည်စိတ်ချရသော။'],
  'auth.description': [
    'Register as an explorer, then apply for organizer approval when you are ready to lead.',
    'တောင်တက်သူအဖြစ် စာရင်းသွင်းပြီး ဦးဆောင်ရန် အသင့်ဖြစ်သည့်အခါ စီစဉ်သူအဖြစ် လျှောက်ထားပါ။',
  ],
  'auth.adminDescription': [
    'Review organizer applications, moderate community content, and manage Mandalay trails from one command view.',
    'စီစဉ်သူလျှောက်လွှာများကို စစ်ဆေးပြီး အသိုင်းအဝိုင်းအကြောင်းအရာနှင့် မန္တလေးလမ်းကြောင်းများကို စီမံခန့်ခွဲပါ။',
  ],
  'auth.ready': ['Trail Ready', 'တောင်တက်ရန် အသင့်'],
  'footer.copy': [
    '© 2024 Hikers Mandalay. Built for the rugged.',
    '© 2024 Hikers Mandalay။ တောင်တက်သူများအတွက် ဖန်တီးထားသည်။',
  ],
  'footer.privacy': ['Privacy Policy', 'ကိုယ်ရေးအချက်အလက် မူဝါဒ'],
  'footer.safety': ['Safety Guidelines', 'ဘေးကင်းရေး လမ်းညွှန်'],
  'footer.conduct': ['Trail Conduct', 'လမ်းကြောင်း စည်းကမ်း'],
  'card.distance': ['Dist', 'အကွာအဝေး'],
  'card.elevation': ['Elev', 'အမြင့်တက်မှု'],
  'card.registrationClosed': ['Registration Closed', 'စာရင်းပေးသွင်းခြင်း ပိတ်ထားသည်'],
  'card.like': ['Like', 'နှစ်သက်သည်'],
  'home.discover': ['Discover your next', 'သင်၏နောက်ခရီးကို ရှာဖွေပါ'],
  'home.trek': ['Mandalay Trek', 'မန္တလေးတောင်တက်ခရီး'],
  'home.search': ['Search trail names...', 'လမ်းကြောင်းအမည်များ ရှာရန်…'],
  'home.difficulty': ['Difficulty', 'အခက်အခဲ'],
  'home.distance': ['Distance', 'အကွာအဝေး'],
  'home.explore': ['Explore', 'ရှာဖွေရန်'],
  'home.popular': ['Popular Trails', 'လူကြိုက်များသော လမ်းကြောင်းများ'],
  'home.seeAll': ['See all →', 'အားလုံးကြည့်ရန် →'],
  'home.upcoming': ['Upcoming Events', 'လာမည့်ခရီးစဉ်များ'],
  'home.calendar': ['Full calendar →', 'ပြက္ခဒိန်အပြည့်အစုံ →'],
  'home.join': ['Join Hike', 'ခရီးစဉ်တွင် ပါဝင်ရန်'],
  'home.community': ['From the Community', 'အသိုင်းအဝိုင်းမှ'],
  'home.forum': ['Explore forum →', 'ဆွေးနွေးခန်းသို့ →'],
  'trails.heading': ['Discover the Rugged', 'တောတောင်အလှကို ရှာဖွေပါ'],
  'trails.title': ['Mandalay Trails', 'မန္တလေး လမ်းကြောင်းများ'],
  'trails.refine': ['Refine Results', 'ရလဒ်များ စစ်ထုတ်ရန်'],
  'trails.reset': ['Reset All', 'အားလုံး ပြန်သတ်မှတ်ရန်'],
  'trails.duration': ['Duration', 'ကြာချိန်'],
  'trails.season': ['Best Season', 'သင့်တော်သောရာသီ'],
  'trails.allSeasons': ['All Seasons', 'ရာသီအားလုံး'],
  'trails.dry': ['Dry Season', 'ခြောက်သွေ့ရာသီ'],
  'trails.update': ['Update Results', 'ရလဒ်များ အပ်ဒိတ်လုပ်ရန်'],
  'trails.load': ['Load More Trails', 'လမ်းကြောင်းများ ထပ်မံကြည့်ရန်'],
  'trails.loading': ['Loading trails...', 'လမ်းကြောင်းများ ဖတ်နေသည်…'],
  'trails.empty': [
    'No trails match this difficulty.',
    'ဤအခက်အခဲနှင့် ကိုက်ညီသော လမ်းကြောင်း မရှိပါ။',
  ],
  'trails.loadError': ['Could not load trails.', 'လမ်းကြောင်းများကို ဖတ်၍မရပါ။'],
  'events.seasonal': ['Seasonal Expeditions', 'ရာသီအလိုက် ခရီးစဉ်များ'],
  'events.description': [
    'Coordinate with local trekkers for upcoming expeditions across the Shan Hills and the Ayeyarwady plains. Reliability is our terrain.',
    'ရှမ်းတောင်တန်းနှင့် ဧရာဝတီလွင်ပြင်တစ်လျှောက် လာမည့်ခရီးစဉ်များအတွက် ဒေသခံတောင်တက်သူများနှင့် ချိတ်ဆက်ပါ။',
  ],
  'events.create': ['Create Event', 'ခရီးစဉ် ဖန်တီးရန်'],
  'events.apply': ['Apply to Organize', 'စီစဉ်သူအဖြစ် လျှောက်ထားရန်'],
  'events.lead': ['Want to lead a trek?', 'တောင်တက်ခရီးကို ဦးဆောင်ချင်ပါသလား?'],
  'events.leadCopy': [
    'Explorers can apply to become verified organizers. Approval unlocks event creation.',
    'တောင်တက်သူများသည် အတည်ပြုစီစဉ်သူအဖြစ် လျှောက်ထားနိုင်ပါသည်။ အတည်ပြုပြီးနောက် ခရီးစဉ်များ ဖန်တီးနိုင်သည်။',
  ],
  'events.safety': ['Safety is our', 'ဘေးကင်းရေးသည် ကျွန်ုပ်တို့၏'],
  'events.base': ['Base Camp', 'အခြေစိုက်စခန်း'],
  'events.safetyCopy': [
    'Every event on Hikers is vetted for guide certifications and real-time weather monitoring. No one treks alone.',
    'Hikers ရှိ ခရီးစဉ်တိုင်းကို လမ်းပြအရည်အချင်းနှင့် အချိန်နှင့်တပြေးညီ မိုးလေဝသစောင့်ကြည့်မှုဖြင့် စစ်ဆေးထားသည်။',
  ],
  'events.guidelines': ['Read Guidelines', 'လမ်းညွှန်ကို ဖတ်ရန်'],
  'community.field': ['Field Notes', 'ခရီးမှတ်စုများ'],
  'community.title': ['Community Dispatches', 'အသိုင်းအဝိုင်း သတင်းများ'],
  'community.description': [
    'Trip reports, gear advice, route questions, and local hiking knowledge from Mandalay trekkers.',
    'မန္တလေးတောင်တက်သူများထံမှ ခရီးမှတ်တမ်း၊ ကိရိယာအကြံပြုချက်၊ လမ်းကြောင်းမေးခွန်းနှင့် ဒေသဆိုင်ရာအသိပညာများ။',
  ],
  'community.share': ['Share a trail note', 'လမ်းကြောင်းမှတ်စု မျှဝေရန်'],
  'community.subject': ['Subject', 'ခေါင်းစဉ်'],
  'community.placeholder': [
    'What should other hikers know?',
    'အခြားတောင်တက်သူများ ဘာကို သိသင့်ပါသလဲ?',
  ],
  'community.publish': ['Publish Dispatch', 'သတင်းထုတ်ပြန်ရန်'],
  'community.note': [
    'Practical field notes from recent Mandalay hikes, focused on terrain, safety, and timing.',
    'မြေပြင်အခြေအနေ၊ ဘေးကင်းရေးနှင့် အချိန်ကို အဓိကထားသော မကြာသေးမီ မန္တလေးတောင်တက်ခရီးမှ လက်တွေ့မှတ်စုများ။',
  ],
  'community.profile': ['View profile', 'ပရိုဖိုင်ကြည့်ရန်'],
  'detail.region': ['Mandalay Region', 'မန္တလေးတိုင်း'],
  'detail.save': ['Save Trail', 'လမ်းကြောင်း သိမ်းရန်'],
  'detail.saved': ['Saved', 'သိမ်းထားပြီး'],
  'detail.report': ['Report', 'အစီရင်ခံရန်'],
  'detail.copy': [
    'The Yankin Hill Ridge Trail is a favorite among local Mandalay trekkers, offering a perfect blend of spiritual heritage and physical challenge. The trail snakes along the limestone spine of Yankin Hill, passing meditation retreats and ancient pagodas.',
    'ရန်ကင်းတောင်တန်းလမ်းသည် မန္တလေးဒေသခံတောင်တက်သူများ နှစ်သက်သောလမ်းဖြစ်ပြီး ယဉ်ကျေးမှုအမွေအနှစ်နှင့် ကိုယ်ကာယစိန်ခေါ်မှုကို ပေါင်းစပ်ပေးသည်။',
  ],
  'detail.coordinates': ['Coordinates', 'တည်နေရာအမှတ်များ'],
  'detail.gallery': ['Trail Gallery', 'လမ်းကြောင်း ဓာတ်ပုံများ'],
  'detail.rating': ['Community Rating', 'အသိုင်းအဝိုင်း အဆင့်သတ်မှတ်ချက်'],
  'detail.reviews': ['128 reviews', 'သုံးသပ်ချက် ၁၂၈ ခု'],
  'detail.writeReview': ['Write a Review', 'သုံးသပ်ချက် ရေးရန်'],
  'detail.loading': ['Loading trail...', 'လမ်းကြောင်းကို ဖတ်နေသည်…'],
  'detail.notFound': ['This trail could not be found.', 'ဤလမ်းကြောင်းကို ရှာမတွေ့ပါ။'],
  'detail.loadError': ['Could not load this trail.', 'ဤလမ်းကြောင်းကို ဖတ်၍မရပါ။'],
  'detail.unavailable': ['Trail unavailable', 'လမ်းကြောင်း မရနိုင်ပါ'],
  'detail.backToTrails': ['Back to Trails', 'လမ်းကြောင်းများသို့ ပြန်ရန်'],
  'detail.difficulty': ['Difficulty', 'အခက်အခဲ'],
  'detail.distance': ['Distance', 'အကွာအဝေး'],
  'detail.elevation': ['Elevation Gain', 'အမြင့်တက်မှု'],
  'detail.duration': ['Estimated Time', 'ခန့်မှန်းကြာချိန်'],
  'detail.bestSeason': ['Best Season', 'သင့်တော်သောရာသီ'],
  'detail.equipment': ['Equipment', 'လိုအပ်သောပစ္စည်း'],
  'detail.mapAlt': ['Decorative trail map', 'လမ်းကြောင်း အလှပြမြေပုံ'],
  'detail.galleryAlt': ['Mandalay trail scenery', 'မန္တလေး လမ်းကြောင်းရှုခင်း'],
  'review.rating': ['rating', 'အဆင့်သတ်မှတ်ချက်'],
  'review.ratings': ['ratings', 'အဆင့်သတ်မှတ်ချက်များ'],
  'review.averageLabel': ['Average community rating', 'အသိုင်းအဝိုင်း ပျမ်းမျှအဆင့်'],
  'review.empty': [
    'No ratings yet. Be the first to share your experience.',
    'အဆင့်သတ်မှတ်ချက် မရှိသေးပါ။ ပထမဆုံး အတွေ့အကြုံမျှဝေပါ။',
  ],
  'review.yours': ['Your review', 'သင့်သုံးသပ်ချက်'],
  'review.outOfFive': ['out of 5 stars', 'ကြယ် ၅ ပွင့်အနက်'],
  'review.loadMore': ['Load more reviews', 'သုံးသပ်ချက်များ ထပ်ကြည့်ရန်'],
  'review.edit': ['Edit Your Review', 'သင့်သုံးသပ်ချက် ပြင်ရန်'],
  'review.close': ['Close review form', 'သုံးသပ်ချက်ပုံစံ ပိတ်ရန်'],
  'review.scoreLabel': ['Your star rating', 'သင့်ကြယ်အဆင့်'],
  'review.scoreRequired': [
    'Choose a star rating before saving.',
    'မသိမ်းမီ ကြယ်အဆင့်တစ်ခု ရွေးပါ။',
  ],
  'review.textLabel': ['Your review', 'သင့်သုံးသပ်ချက်'],
  'review.optional': ['Optional', 'မဖြစ်မနေ မဟုတ်ပါ'],
  'review.placeholder': [
    'Share trail conditions, timing, views, or advice for other hikers.',
    'လမ်းအခြေအနေ၊ အချိန်၊ ရှုခင်း သို့မဟုတ် အခြားတောင်တက်သူများအတွက် အကြံပြုချက် မျှဝေပါ။',
  ],
  'review.delete': ['Delete review', 'သုံးသပ်ချက် ဖျက်ရန်'],
  'review.cancel': ['Cancel', 'မလုပ်တော့ပါ'],
  'review.save': ['Save review', 'သုံးသပ်ချက် သိမ်းရန်'],
  'review.saving': ['Saving...', 'သိမ်းနေသည်…'],
  'review.deleteConfirm': [
    'Delete your review? This cannot be undone.',
    'သင့်သုံးသပ်ချက်ကို ဖျက်မလား။ ပြန်ယူ၍မရပါ။',
  ],
  'review.createdTitle': ['Review published', 'သုံးသပ်ချက် ထုတ်ဝေပြီး'],
  'review.createdMessage': [
    'Your trail rating is now visible to the community.',
    'သင့်လမ်းကြောင်းအဆင့်ကို အသိုင်းအဝိုင်းက ယခုမြင်နိုင်ပါပြီ။',
  ],
  'review.updatedTitle': ['Review updated', 'သုံးသပ်ချက် ပြင်ဆင်ပြီး'],
  'review.updatedMessage': [
    'Your latest rating and notes have been saved.',
    'သင့်နောက်ဆုံးအဆင့်နှင့် မှတ်စုများကို သိမ်းပြီးပါပြီ။',
  ],
  'review.deletedTitle': ['Review deleted', 'သုံးသပ်ချက် ဖျက်ပြီး'],
  'review.deletedMessage': [
    'Your rating was removed from this trail.',
    'ဤလမ်းကြောင်းမှ သင့်အဆင့်သတ်မှတ်ချက်ကို ဖယ်ရှားပြီးပါပြီ။',
  ],
  'review.saveErrorTitle': ['Could not save review', 'သုံးသပ်ချက် သိမ်း၍မရပါ'],
  'review.saveError': [
    'Please try saving your review again.',
    'သင့်သုံးသပ်ချက်ကို ထပ်မံသိမ်းကြည့်ပါ။',
  ],
  'review.deleteErrorTitle': ['Could not delete review', 'သုံးသပ်ချက် ဖျက်၍မရပါ'],
  'review.deleteError': [
    'Please try deleting your review again.',
    'သင့်သုံးသပ်ချက်ကို ထပ်မံဖျက်ကြည့်ပါ။',
  ],
  'event.featured': ['Featured Trek', 'အထူးပြု ခရီးစဉ်'],
  'event.overview': ['Trek Overview', 'ခရီးစဉ် အကျဉ်းချုပ်'],
  'event.copy': [
    'Experience the spiritual sunrise of Mandalay from the jagged peaks of Yankin Hill. This expedition is designed for those who appreciate the silence of the pre-dawn hours and the reward of panoramic vistas.',
    'ရန်ကင်းတောင်ထိပ်မှ မန္တလေး၏ ဝိညာဉ်ရေးရာနေထွက်ချိန်ကို ခံစားပါ။ ဤခရီးစဉ်သည် နေမထွက်မီ ငြိမ်သက်မှုနှင့် အကျယ်မြင်ကွင်းကို နှစ်သက်သူများအတွက် ဖန်တီးထားသည်။',
  ],
  'event.safetyRequirements': ['Safety Requirements', 'ဘေးကင်းရေး လိုအပ်ချက်များ'],
  'event.equipment': ['Equipment List', 'ကိရိယာစာရင်း'],
  'event.meeting': ['Meeting Point', 'တွေ့ဆုံမည့်နေရာ'],
  'event.cost': ['Cost', 'ကုန်ကျစရိတ်'],
  'event.join': ['Join Event', 'ခရီးစဉ်တွင် ပါဝင်ရန်'],
  'event.joined': ['Joined', 'ပါဝင်ပြီး'],
  'event.save': ['Save to List', 'စာရင်းသို့ သိမ်းရန်'],
  'profile.communityExplorer': ['Community explorer', 'အသိုင်းအဝိုင်း တောင်တက်သူ'],
  'profile.viewCommunity': ['View Community', 'အသိုင်းအဝိုင်းကြည့်ရန်'],
  'profile.completed': ['Completed treks', 'ပြီးစီးခဲ့သော ခရီးများ'],
  'profile.posts': ['Trip posts', 'ခရီးမှတ်တမ်းများ'],
  'profile.saved': ['Saved trails', 'သိမ်းထားသော လမ်းများ'],
  'profile.favorite': ['Favorite Trails', 'နှစ်သက်သော လမ်းကြောင်းများ'],
  'profile.explore': ['Explore trails', 'လမ်းကြောင်းများ ရှာဖွေရန်'],
  'profile.recent': ['Recent Dispatches', 'မကြာသေးမီ သတင်းများ'],
  'profile.allPosts': ['All posts', 'ပို့စ်အားလုံး'],
  'profile.verified': ['Verified organizer', 'အတည်ပြု စီစဉ်သူ'],
  'profile.verifiedSince': ['Verified since', 'အတည်ပြုသည့်နှစ်'],
  'profile.viewEvents': ['View Events', 'ခရီးစဉ်များ ကြည့်ရန်'],
  'profile.hosted': ['Hosted events', 'စီစဉ်ခဲ့သော ခရီးများ'],
  'profile.participants': ['Participants', 'ပါဝင်သူများ'],
  'profile.avgRating': ['Avg. rating', 'ပျမ်းမျှအဆင့်'],
  'profile.upcoming': ['Upcoming Events', 'လာမည့် ခရီးစဉ်များ'],
} as const

export type TranslationKey = keyof typeof translations

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() =>
    localStorage.getItem('hikers_locale') === 'my' ? 'my' : 'en',
  )

  useEffect(() => {
    localStorage.setItem('hikers_locale', locale)
    document.documentElement.lang = locale === 'my' ? 'my' : 'en'
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: TranslationKey) => translations[key][locale === 'my' ? 1 : 0],
    }),
    [locale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
