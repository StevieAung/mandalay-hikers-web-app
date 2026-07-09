import type { CommunityPost, ExplorerProfile, OrganizerProfile, Trail, TrekEvent } from '../types'

export const IMG = {
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpsZ2K9gX4WWURSOBRpzH_4DiTRDaSr-ExuQAcji2YDERZI2T5ieyMMeeAkp_6DNdUOzHo_zDMRrlVPcA5EGHeHfIw7RhiAiZy7-FLwnG2S__O4aXkzcsc3ge6lVndSXzIINrdrheOhdrxKqXZoHZzd77jesfwZtaJPuWvdmxT4lfxep2hK0LHlxQFGZO_hQfZkcoY6pS6ZKKe47-wa9pzR1ECd4O9d10fIOAQOR23e59yKuiwRkdAWY-9K0cxlcmJ_3DMiqXc_AYV',
  mandalayRidge:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCYo58Gtz9x2Q0Tt0RPZk5oC7-lTEDxF8qKQhXecrCKZkB3f0pUEeU-OVLgPaSBbZ-p894ukHu7o32rhpaf8toNwkiaRTnotTGu2chu6PgOrQUEhsllBTZg6dBlm7qs--W39bw4m2lItz4hXq-sTzdjlRmb7rR3gMJmXFb83QJPrgnVjHGhBZSbcqxICdqrEloI4bZDJKp0XZMpedRexFzWXTiO8EyLjtpexe6JD5jkLrKWxqiWL2Crp_GPjyXxOpsEn3L3gcsgQQjs',
  deeDoke:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBEXykyDccUwKCP0p4yj04tkM-JKiWlF8bOzMvcwiiVoER2W8w67IkHW7QXWPVbp-KxD6kpe51OKJjMBrVevhYzqoqYUDhLMDn16oeWob1Zr_qaNFLDY7SXBlG9Z5Gq-HwQ7_P1YHAVJri2KgEcW21ei_kJGMOeoSsC9NYvqWaBF-5s685zKV_k_q2UPyZe0XUuVcBla9k7gwqsK91NUZcWx0MaOhAXTtjoQVPiyBkLlLK-2312hVYTYAU-DFeiP_NzAQUInFwX4Sz-',
  boots:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ4i1IhauoPPQFkwNYIsYLaQowy1iTTxGhAaD1aGmc-EvDW75V7sF4zmPU4n7sbaZIcrWq7BDPM79BgmbduhF6dq_gC8vBIzx2b5zEmEUTsGc28K1NZ3wUyH8ms91GFu8DFqBQUshb81y8lLODMqCaWfbUNlrY7PXhxXOIBcLiCmea38tDxeh8Vz9C7-arwF4OBi9KBZaq46GlFi00MNXd3gpkNk5nHeumj_3MgeAsmc6UAuMIpqwAr51jWa3b7yxCdB6zDv__B4OW',
  lunch:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDf5DhcM3-FG2lq3DtNzulm4rVe9kMApmHu9tpq-u3OAzbc6A7FdIUVibAkcb3shGSVF1qYQhHEU9ChoKMQlZzzi2SBBrfZbZB0UtDNkxUSNfXfO1P5LsYNxASnV1wBdvJv_dfGwM0euvGp7_VOU3WgilLTTR-Qkzbe0CP0Egd6ixVeH40UnwFhIBxNHRStW_jXJ7Bw85513DCbvxC2QBcu22haU4UQGD3Ez1XohDSVpc-INAFWZ6xsog6XC3lhEPOjMaqvbS4lALpx',
  stars:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBZ6iI5WcdGdTkHFLrrYb8bglzMbniVIiF7a-i3s1Ape9Syp3JUCTE5NhlZYBe5gp4q77Fr85MAQCW90aCagm4Ux9Z87-2pMfU0oVptn2LtuqcqXXYAkwTcbGIda_OV5D6Ac8T85x_0j4JmdIVwsDCps36qvT69hKstrEUdWGaTbFdh31jaF2vZzj6px8Cay5-XWMewoyd7G-ONmtH8nTN-twzF_1NJJvZkAad9hDdj0yCYGWo8x_xM1oMlrFbbIbE1obfbzF_lNfWCbAUvRDvKbJuzhZRrK3XgObvndzJsTgNUsJ31Hj',
  topoTable:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDFnbebXzaY8iPZ9FHxcRqZ8wo6ZZWrLQ5Qg7vGzNQrlqo7PkjmODhtYsoaziMlAjp6rEwC4wakeqLoB7NxjvPVH0sv1fUGYN9FWfF-3PUo-MWN3rnzfBOVvm1hbzYdNquc5iMxNZiVQDBS0PJrUEJI4lXIhpBigH_eir1Byh1lU7_fZdTnrdh2eYgMr78c5l0Fb4MgOaSmJnP1RGUWfgF1JUDtjSng40Khd3d71PDrGfFqDjT-NrHgk6TledyY9eOUANXI6gdO5EBg',
  trailA:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB6REZHXF2Q3uowA-lCBCJjY2ZM3MuWPsNTbp800HfJ6V_j-n6IFivf6kUFfRedzyyztkTJlljS7zkp-FkxSPDxdigLLK4jYRlfvapmRrOjJC7sXxfvqy4Wfh22A69ySe8n9b4TVr3QgmQSkZHNTADeVR9CXzCbr7EiotLT4wMxNhEZHJNbP6FMaiAvEEajCPTa-IC4RpYqeJdw--6KlXgAhrGjKMsIO_Hf9U_Ru0DsgKZuUt9sd-vEIxUo9b3wDnjO83e6mZJHE75u',
  trailB:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAZQRspMYwuG9iXEs5I2zXJEOwa2V0uxZ9hE7FQcwXMpuwvOqLta7QpG51TmfTtEkIKmmRmgB0VtRaADRY9sygKezOEPsQ9wOFMLK04BceJMkVRQobPSZqxSvN71eH0SRBqIFvVAEEuvSbmYd1nlTX-g4ezsinXT6h-L4SWtX97-C3HEd5VNIqfh_7hygwRUcEXrAKnYtaVpHYSx8IJjf-iY82M1_-bOECl9K6b2KRVwSl9OV3IUknFbpg3ndGDm6ZNMoElrGX5iqrD',
  trailC:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBu_p-tHMcym_MVb9tX0E058h1-PSvNVBuYnzDSrFAufwtt_l8tmvTuYRCSBs435fXWEcqq96Mt-qroplT1_xEr4fR2b76GSoOtqKvEkXP-AUvBACJI2c1yCA3K4WNqU8CvQBMS1oW9HIGIfkReHk27rvtAtLcrGiR-nm_pXrF4EZk_oD3FWt3QcOcyBVBbdTGjUvKpWqmWLmpEe0zmHPYi2rOmUnK_Ttb6O3fcz3PWKF0UQo-2I_vuR5fXtjgFyFQqxF8svmrwD4rB',
  trailD:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBV64j91FsxBvPs-qFLwHgcr-CKImL_MmqIZy2BwHNoslmCuI64gZKjtNsDgZI5eKr8Jn3zuyloNEzhD7P7hTaX8NE6xr2sw-vQrXrdiL01j8BPJjOfkmGVs1v89B_hoVUDpy6-wpRVYBHTlKVtb9jan25-LJEmIiLquJdSZCptkLDvYSZ_-VqFGyo_79vhvC_J9k13eElFEl7JEdwfKrVGRbZRgJVAStVeXcSaty4RdNrXhkFT8du3lB9bQpva3zhbXu40ybAzGgms',
  trailE:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDfsMjbV0GEDwXeGu_hdrjO0H6EOwwd9wRz2kiDMxS3LGlaPklobC3-OKXcwF1T5y6nH_2cpaO4ZXr22NCVm-bSw9qDS4nWm59jpndd47gkYWq8RcKwOm6khUsincBd65sUkVo5Uw0pQIzQItZOytdQW7dVV33diE41roErAGlva6Y8GE0rRx_Vj7GEDa0xccb-8_xD6sSEaDNxpgEM-wkHx21fpUr2p-UkIQK8KC0KuOZjgzGRRLpla5zHN-0bnO8Maxm-Nwt9Qgtw',
  trailF:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuATKCYsXYUMOcgjoXoyf8XZqOnRpcblECbcvukZuQgYnZug8ehlCYwIKlkQ7w4paw5b6fMY8rg04EsJzpG76aDMYNGmsBxbzbDJM0pyi8-fRQhf84SbiiOvRUvrcs-FPlVA0W058neArDAGPW_bSHKUUfwtkmS4065Ua2rhNHIjUFEOVWOZ9gKTqriDe8qEvfNMWM58ei1EJoIq3xBRe0AiIFtdgAIyZoReUBsTOSoZMjRO8l_42snGUZUIPcr8tnXv0g4JAmTtckbp',
  detailHero:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDwudVzdSPcgysoHJHnSx8jwXKEFX-Hx9ZdrXJB1nCK_UlLXt1-ikUqLdAM_f-mT_JAC6kIEvH2FpYa4Ykrtgj9uwrOZw3U10nu0T1IuL0J9uKSuIGz5_Y0IYi0cTx8iQ276Fmod05gFhHhoSyLabY8hliMbv84_u7Zhx2C1FWmUg8S5Z-gWG6MaktBjgNaYpZsOiQ_BjnhTINrg-nLyCvkj6_OsxTPmnwRYi5hP30FVa_qXLsN53LHwcgT_wPnGsvGag-qUPynqSyP',
  detailGallery1:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDIXpkUmyURP4I974fbRHmZ_-WLXUlobSwC_mhb7iSM7TNg446EaMSbQ_y5OO3mDnGq_mqHQkmYL6JT-4Bj0E38u-y7M4kEseAJGlAs3ZCLs4XBSe9Gy7-89xvG07az-7euS96urtfwH_Ijjt5TwIv9SG84RoggGF9PmDR_3fgCMFISlXJwWEJC9LOBLgLYtHPDh9wcK5gQAwWiSeexzteJN9_EKJyY_RQhbQvME-PSD8CpW9VE6u8YPldhhMIushyQsAV9Py02eG9c',
  detailGallery2:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDSPDMdRzxhNKI9EfhETOYXRUMKO891Xi-SdsuOv3qzSa4O0hHeHAD4IKc4b3JT09xzUeNu8pUQ0-cYEQSJ38t2PV4Y8vFzlXdBSDyewqWI-G0kEizbFP9CiBn1aZH2D2lU2H6OZkE5N3x19ukL9Sb_yIHpscH-8_QrH_qXjAA7SwVZwOt79qHi-zpEwEPRhasZ2b5KOzMxoDhViQsrz9ISpjvaUjgl3h7SXEKgPZYMn_TrTVxRpRpnvum1bSjVM2mmWRpdxk_ELzfU',
  detailGallery3:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBDyrCQJIN9Lwx707ivrxke5AypN0I0mH8OAvzFiyEjAP7iGC7V_0IuF2dHNveKM6JeKKNM2U_mMnifTyujJA8eOfCtF2musx04Dw5J_WBReBnomtQXlCXC-taVqScbceFl5ehJzU0uobuNXSxY_pUdT7b8eoLv5c-L8ZvhnMzRBwHVCa7JF8-ESyFYkXNae3CirH-V7WzC19FparVmrfpyA9ijyjvAhLwkEaeQmwo0CC60UnQX5eMAsqKyt_u-cIkdr-RQYscmbbSc',
  detailMap:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDdXzk1G1XcjfNGkHQv0WaBwPd3DlY_U3SfJLQx0d0a1kVAFT5hsLYwFU2Y1WLEdHb4jZjD4oLC55TA-8yaICguuOg_5QpiMZ3zYatP7ilWmXZoqFbOhdI41AhxYVXNvn4qy5OH_FyabjphFku49bfcuqEIr48X9ynAQC4qlpAX7F-iqeiW8w7i-tA8aetc80M2yq4lghcNV3l9igI4HBt1wjn8hbgLQduwS7ysrtz1QyZaBqVcgUJ0JjWuZhElMeGat_4PHg4_ZDnB',
  eventHero:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBtAZRvkteTlEzgmz6x3iuqyPehA3MAk8Rdkxwjn8rBPPCD3X6lib3n40kg52Pf8ipuoRBa0AeUGIrf-AsHhh3q99rX3Nba1xPrtwiqCJTjXH4Ku6GFnVP-IWnTNCBeXErSQuz3FOgF7mW_2VdIpMPvOSQwtcQrWnsPZhzYrAU9NLjPSJD9YKSF8mdJ6c2eNyytivLwCQMkxHZVPY51PLIi77kN-L4Pldfe9wk5SHZ9CCO1y7KzxCbNf8Gjy-MgbkENYTijAkiWQbsm',
  eventForest:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA1D6uo3OaNhEFojC98P-tbfsbTD6oua95ejljk25eU3u-GKKrLuh7e9MVpz4OTAt1TSwZFUEvWVGzIqghREGInV8lOzSFLRfftaBj6aukU2yAh0qT1CRDYfhtbKJRtHnhXx8z6SeE9ODAOwnk8_IwYbmGFRN29x33913VP6zT2KwonDHnkLehn_SXeX_4zGwHqUNP0xjMG0gExonSBOCVC6sQ8_V4ePCkwVt4Du5HF3cFOSsAwaizWd1TOGoPnW3KKjKhKdle0Znxj',
  auth: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkrRdEBS-pg6XNbUoNmXkoW2xRanyZ_u14-gh-i7bnD4dJ9oFYh9A4QUaM7jJWgiLiDMojUcPNgDBhCrq6pYXyqIB6qsx6idLW7sP8I8c1JNBr6rRJNsVakr_F7OjXz62CGD2770my-3WYyE5kU6Zp0736rdJLznFMHrHo1zbBebXop80572Q37mFTAIEO0GdhZ3jNwe396UNPuI1EyLnh7ycvZRRu2-o9K4Zil-Ck0-63Mu6nmzq1JongEaRf7EMxo3sKxzyBEVmE',
  avatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAHGH-Yb5t43skCTqXmSeT-lNUzeOMK1-9kxdR4dGQQz1i8ZWsGPmE7knuJ0XQgJwEOwpE0zvJr7flS-4Zl_uAek47OF1tDxIGep2uWwwnskX-l9c1nP2i73LRH1CkD1qUjKW9VRYLuoJ0N_VE3HU4AFnn30HauehF27pjJPDSThYsq1ukEwd1wVEFzCo-Tu83fPee8gu3x1rXYWbkm0Sx33SNUrP_uK_y7i7V63HJ3fTvcjBdr0L7IWizw3sJ1Y__68qsW8dTs_WhE',
  guide:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCs9hVx4vuczV7cDSoTcEmgXxYZlgERnueBEnLyoMbBeg35U3p-yiYGWVILagQdOzU-KRXcX2pE2ZnHD7fkK6BhSCFjyV16zr77D5wN1SOodukOrTEAydEe6kwgTxBB5jWT3sBS4CKsjpNori6RXFhxHUuiMGoWiRTGBlBuEarhfA002NQyBRvuWFe3r7Y_l5NmTXjWMwScVCAfz_x5FCFeLyggQfDxpBgUA1V4mPTHVWCYFIMRzUfQhUDBfn-Bui91VnLWDQDv_GRT',
}

export const trails: Trail[] = [
  {
    id: 'yankin-ridge',
    name: 'Yankin Ridge Path',
    badge: 'Open - Easy',
    difficulty: 'Easy',
    distance: '4.2 km',
    elevation: '120 m',
    image: IMG.trailA,
    summary: 'A gentle ascent through ancient limestone paths and morning haze.',
  },
  {
    id: 'dat-taw',
    name: 'Dat Taw Guaint Fall',
    badge: 'Moderate',
    difficulty: 'Moderate',
    distance: '6.8 km',
    elevation: '450 m',
    image: IMG.trailB,
    summary: 'A steep descent leading to a hidden multi-tiered waterfall.',
  },
  {
    id: 'mandalay-peak',
    name: 'Mandalay Peak Loop',
    badge: 'Open - Easy',
    difficulty: 'Easy',
    distance: '2.1 km',
    elevation: '240 m',
    image: IMG.trailC,
    summary: 'The classic 1,729 step climb. Best done before sunrise.',
  },
  {
    id: 'elephant-ridge',
    name: 'Elephant Ridge Peak',
    badge: 'Hard - High Peak',
    difficulty: 'Hard',
    distance: '14.5 km',
    elevation: '980 m',
    image: IMG.trailD,
    summary: 'A technical trek for experienced hikers and early starts.',
  },
  {
    id: 'old-hill-road',
    name: 'Old Hill Station Road',
    badge: 'Moderate',
    difficulty: 'Moderate',
    distance: '8.2 km',
    elevation: '310 m',
    image: IMG.trailE,
    summary: 'Trace the steps of history along this abandoned stone road.',
  },
  {
    id: 'irrawaddy-bank',
    name: 'Irrawaddy Bank Run',
    badge: 'Open - Easy',
    difficulty: 'Easy',
    distance: '10.0 km',
    elevation: '10 m',
    image: IMG.trailF,
    summary: 'A flat scenic trail along the riverbank, built for long walks.',
  },
]

export const homeEvents = [
  [
    'Sunrise Hike at Yankin',
    'A community gathering to witness the first light over the Ayeyarwady plains. Includes meditation session.',
    'Oct 24 - 05:30 AM',
    'wb_sunny',
  ],
  [
    'Dee Doke Cleanup Trek',
    'Helping preserve the falls. We provide equipment and return transport. Trek with a purpose.',
    'Oct 28 - 08:00 AM',
    'eco',
  ],
  [
    'Trail Mapping Workshop',
    'Learn how to use GPS tools and topographic markers to scout new routes near Pyin Oo Lwin.',
    'Nov 02 - 09:00 AM',
    'map',
  ],
] as const

export const events: TrekEvent[] = [
  {
    id: 'yankin-dawn',
    title: 'Yankin Hill Dawn Expedition',
    date: 'Oct 24, 2024',
    time: '05:30 AM',
    image: IMG.eventHero,
    status: 'Open - 8/15 Spots',
    difficulty: 'Advanced',
    text: 'Join our veteran guides for a high-intensity dawn climb. We focus on pace control and topographic navigation.',
  },
  {
    id: 'navigation-workshop',
    title: 'Navigation Workshop',
    date: 'Oct 26',
    time: '09:00 AM',
    image: IMG.topoTable,
    status: 'Full',
    difficulty: 'Workshop',
    text: 'Map reading and manual navigation skills for the deep Mandalay forest.',
  },
  {
    id: 'dat-taw-falls',
    title: 'Dat Taw Guaint Falls',
    date: 'Nov 02',
    time: '06:00 AM',
    image: IMG.mandalayRidge,
    status: 'Moderate - 6/12 Spots',
    difficulty: 'Moderate',
    text: 'A moderate 12km trek featuring vertical descents and limestone terrain.',
  },
  {
    id: 'dee-doke-lagoon',
    title: 'Dee Doke Blue Lagoon',
    date: 'Nov 05',
    time: '07:00 AM',
    image: IMG.eventForest,
    status: 'Open - 2/10 Spots',
    difficulty: 'Easy',
    text: 'Swimming and light trekking. Perfect for community bonding.',
  },
]

export const communityPosts: CommunityPost[] = [
  {
    id: 'rainy-gear',
    authorId: 'kyaw-hiker',
    handle: '@kyaw_hiker',
    title: 'Essential gear for the rainy season...',
    likes: '32 likes',
    image: IMG.boots,
  },
  {
    id: 'yankin-lunch',
    authorId: 'mandalay-treks',
    handle: '@mandalay_treks',
    title: 'Lunch with the Yankin crew today!',
    likes: '54 likes',
    image: IMG.lunch,
  },
  {
    id: 'night-skies',
    authorId: 'star-trekker',
    handle: '@star_trekker',
    title: 'Night skies over the Ridge...',
    likes: '108 likes',
    image: IMG.stars,
  },
  {
    id: 'next-expedition',
    authorId: 'trail-master',
    handle: '@trail_master',
    title: 'Planning the next big expedition.',
    likes: '19 likes',
    image: IMG.topoTable,
  },
]

export const explorerProfiles: ExplorerProfile[] = [
  {
    id: 'kyaw-hiker',
    name: 'Kyaw Hein',
    handle: '@kyaw_hiker',
    avatar: IMG.avatar,
    cover: IMG.boots,
    location: 'Chanayethazan, Mandalay',
    bio: 'Weekend explorer focused on practical gear, wet-season prep, and beginner-friendly Mandalay routes.',
    level: 'Explorer',
    stats: { treks: '24', posts: '12', saved: '18' },
    favoriteTrails: ['Yankin Ridge Path', 'Irrawaddy Bank Run', 'Old Hill Station Road'],
    recentPosts: communityPosts.filter((post) => post.authorId === 'kyaw-hiker'),
  },
  {
    id: 'star-trekker',
    name: 'Thiri Mon',
    handle: '@star_trekker',
    avatar: IMG.stars,
    cover: IMG.stars,
    location: 'Aungmyaythazan, Mandalay',
    bio: 'Night-sky photographer and quiet-route explorer documenting low-light hikes and sunrise descents.',
    level: 'Explorer',
    stats: { treks: '31', posts: '19', saved: '27' },
    favoriteTrails: ['Mandalay Peak Loop', 'Dat Taw Guaint Fall', 'Yankin Ridge Path'],
    recentPosts: communityPosts.filter((post) => post.authorId === 'star-trekker'),
  },
  {
    id: 'trail-master',
    name: 'Aung Min',
    handle: '@trail_master',
    avatar: IMG.topoTable,
    cover: IMG.topoTable,
    location: 'Pyigyidagun, Mandalay',
    bio: 'Route planner collecting field notes, elevation estimates, and local access tips before every group trek.',
    level: 'Explorer',
    stats: { treks: '42', posts: '21', saved: '34' },
    favoriteTrails: ['Elephant Ridge Peak', 'Old Hill Station Road', 'Mandalay Peak Loop'],
    recentPosts: communityPosts.filter((post) => post.authorId === 'trail-master'),
  },
]

export const organizerProfiles: OrganizerProfile[] = [
  {
    id: 'mandalay-treks',
    name: 'Mandalay Treks',
    handle: '@mandalay_treks',
    avatar: IMG.guide,
    cover: IMG.eventHero,
    location: 'Mandalay Region',
    bio: 'Verified local organizer leading small-group dawn hikes, cleanup treks, and practical trail workshops.',
    verifiedSince: '2024',
    specialty: 'Beginner-safe group treks',
    stats: { events: '36', hikers: '428', rating: '4.9' },
    upcomingEvents: events.slice(0, 3),
  },
]
