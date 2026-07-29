import { communityPosts, events, homeEvents, trails } from './mockData'
import { useLocale } from '../context/useLocale'
import type { TrailDifficulty } from '../types'

const myTrails = {
  'yankin-ridge': {
    name: 'ရန်ကင်းတောင်တန်း လမ်းကြောင်း',
    badge: 'ဖွင့်လှစ်ထားသည် - လွယ်ကူ',
    difficulty: 'လွယ်ကူ',
    summary:
      'ရှေးဟောင်းထုံးကျောက်လမ်းများနှင့် မနက်ခင်းမြူများကြားမှ သက်သာစွာ တက်ရောက်နိုင်သောလမ်း။',
  },
  'dat-taw': {
    name: 'ဒက်တော ဂွိုင်းရေတံခွန်',
    badge: 'အလယ်အလတ်',
    difficulty: 'အလယ်အလတ်',
    summary: 'အဆင့်များစွာရှိသော ဖုံးကွယ်နေသည့် ရေတံခွန်သို့ ဆင်းသက်ရသောလမ်း။',
  },
  'mandalay-peak': {
    name: 'မန္တလေးတောင် အဝိုင်းလမ်း',
    badge: 'ဖွင့်လှစ်ထားသည် - လွယ်ကူ',
    difficulty: 'လွယ်ကူ',
    summary: '၁,၇၂၉ လှေကားပါဝင်သည့် နာမည်ကြီးတောင်တက်လမ်း။ နေမထွက်မီ သွားရန်သင့်တော်သည်။',
  },
  'elephant-ridge': {
    name: 'ဆင်တောင်တန်းထိပ်',
    badge: 'ခက်ခဲ - တောင်မြင့်',
    difficulty: 'ခက်ခဲ',
    summary: 'အတွေ့အကြုံရှိသောတောင်တက်သူများအတွက် နည်းပညာလိုအပ်သည့် ခရီးစဉ်။',
  },
  'old-hill-road': {
    name: 'တောင်ပေါ်ဘူတာဟောင်းလမ်း',
    badge: 'အလယ်အလတ်',
    difficulty: 'အလယ်အလတ်',
    summary: 'စွန့်ပစ်ထားသော ကျောက်လမ်းတစ်လျှောက် သမိုင်းခြေရာများကို လိုက်လံခံစားပါ။',
  },
  'irrawaddy-bank': {
    name: 'ဧရာဝတီကမ်းနား လမ်းလျှောက်',
    badge: 'ဖွင့်လှစ်ထားသည် - လွယ်ကူ',
    difficulty: 'လွယ်ကူ',
    summary: 'မြစ်ကမ်းတစ်လျှောက် အကြာကြီးလမ်းလျှောက်ရန် သင့်တော်သည့် ညီညာလှပသောလမ်း။',
  },
} as const

const myEvents = {
  'yankin-dawn': {
    title: 'ရန်ကင်းတောင် နေထွက်ခရီးစဉ်',
    status: 'ဖွင့်လှစ်ထားသည် - နေရာ ၈/၁၅',
    difficulty: 'အဆင့်မြင့်',
    text: 'အတွေ့အကြုံရှိ လမ်းပြများနှင့်အတူ နေမထွက်မီ တောင်တက်ခရီးကို ပူးပေါင်းပါ။',
  },
  'navigation-workshop': {
    title: 'လမ်းညွှန်အလုပ်ရုံဆွေးနွေးပွဲ',
    status: 'ပြည့်ပြီး',
    difficulty: 'အလုပ်ရုံဆွေးနွေးပွဲ',
    text: 'မန္တလေးတောနက်အတွင်း မြေပုံဖတ်ခြင်းနှင့် လက်တွေ့လမ်းညွှန်ကျွမ်းကျင်မှုများ။',
  },
  'dat-taw-falls': {
    title: 'ဒက်တော ဂွိုင်းရေတံခွန်',
    status: 'အလယ်အလတ် - နေရာ ၆/၁၂',
    difficulty: 'အလယ်အလတ်',
    text: 'မတ်စောက်သောဆင်းလမ်းများနှင့် ထုံးကျောက်မြေပြင်ပါဝင်သည့် ၁၂ ကီလိုမီတာခရီး။',
  },
  'dee-doke-lagoon': {
    title: 'ဒီဒုတ် ရေကန်ပြာ',
    status: 'ဖွင့်လှစ်ထားသည် - နေရာ ၂/၁၀',
    difficulty: 'လွယ်ကူ',
    text: 'ရေကူးခြင်းနှင့် ပေါ့ပါးသောတောင်တက်မှု။ အသိုင်းအဝိုင်းနှင့် ရင်းနှီးရန် သင့်တော်သည်။',
  },
} as const

const myPosts = {
  'rainy-gear': 'မိုးရာသီအတွက် မရှိမဖြစ်ကိရိယာများ…',
  'yankin-lunch': 'ဒီနေ့ ရန်ကင်းအဖွဲ့နဲ့ နေ့လယ်စာ!',
  'night-skies': 'တောင်တန်းပေါ်က ညကောင်းကင်…',
  'next-expedition': 'နောက်တစ်ကြိမ် ခရီးစဉ်ကြီး စီစဉ်နေသည်။',
} as const

const myHomeEvents = [
  [
    'ရန်ကင်းတောင် နေထွက်ခရီး',
    'ဧရာဝတီလွင်ပြင်ပေါ်မှ ပထမဆုံးအလင်းကို ကြည့်ရှုရန် အသိုင်းအဝိုင်းခရီးစဉ်။ တရားထိုင်ချိန်လည်း ပါဝင်သည်။',
  ],
  [
    'ဒီဒုတ် သန့်ရှင်းရေးခရီး',
    'ရေတံခွန်ကို ထိန်းသိမ်းကာကွယ်ရာတွင် ပါဝင်ကူညီပါ။ ကိရိယာနှင့် အပြန်အလှန်ပို့ဆောင်ရေး ပံ့ပိုးပေးသည်။',
  ],
  [
    'လမ်းကြောင်းမြေပုံ အလုပ်ရုံ',
    'Pyin Oo Lwin အနီး လမ်းကြောင်းသစ်များကို စစ်ဆေးရန် GPS နှင့် မြေမျက်နှာသွင်ပြင် အမှတ်အသားများကို လေ့လာပါ။',
  ],
] as const

export function useLocalizedContent() {
  const { locale } = useLocale()
  if (locale === 'en') return { trails, events, communityPosts, homeEvents }

  return {
    trails: trails.map((trail) => ({
      ...trail,
      difficultyKey: trail.difficulty as TrailDifficulty,
      ...myTrails[trail.id as keyof typeof myTrails],
    })),
    events: events.map((event) => ({ ...event, ...myEvents[event.id as keyof typeof myEvents] })),
    communityPosts: communityPosts.map((post) => ({
      ...post,
      title: myPosts[post.id as keyof typeof myPosts],
    })),
    homeEvents: homeEvents.map(
      ([, , date, icon], index) =>
        [myHomeEvents[index][0], myHomeEvents[index][1], date, icon] as const,
    ),
  }
}
