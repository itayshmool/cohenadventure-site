export type Lang = 'he' | 'en';

export const DICT = {
  he: {
    enquire: 'תיאום', viewTrip: 'המסלול', readReview: 'ביקורת',
    heroKicker: 'משלחות שטח · מ־2008', heroTitle: 'לצאת מהמסלול.',
    heroSub: 'ניווט שטח ברמת משלחת אל הפינות הפראיות של כדור הארץ. רודבוק, נקודות ציון וקבוצות קטנות — אתם רק צריכים לרכוב.',
    heroCta: 'פתיחת הרודבוק', scroll: 'גלול',
    journeysKicker: 'רודבוק · מסלולים', journeysTitle: 'שטחים נבחרים',
    journeysSub: 'כל מסלול מתועד בנקודות ציון, גובה ודרגת קושי. גללו את הרודבוק.',
    lElev: 'גובה', lDist: 'מרחק', lGrade: 'דרגה',
    reviewsKicker: 'מבחני שטח', reviewsTitle: 'מבחני דרכים',
    videosKicker: 'וידאו', videosTitle: 'טכניקה מהשטח',
    videosSub: 'סרטוני הדרכה מהמסלול — שליטה, ניווט וטיפול. לחצו לצפייה.', videosChannel: 'לערוץ היוטיוב המלא',
    trainingKicker: 'הדרכות שטח', trainingTitle: 'ללמוד לרכוב נכון.',
    trainingSub: 'קורסי רכיבת שטח בהדרכת צביקה כהן — מדריך מוסמך עם עשרות שנות ניסיון באבק.', courseCta: 'לפרטים',
    journalKicker: 'יומן שדה', journalTitle: 'מהמסלול',
    journalViewAll: 'לכל הכתבות', journalArchiveTitle: 'יומן השדה המלא',
    journalArchiveSub: 'כל סיפורי המסע, ההדרכות והשטח — מהראשון ועד האחרון.',
    journalCount: 'כתבות', viewCards: 'כרטיסים', viewList: 'רשימה', backHome: 'חזרה לעמוד הבית',
    aboutKicker: 'המדריך', aboutTitle: 'צביקה כהן',
    aboutP1: 'אני צביקה כהן — מדריך רכיבת שטח מוסמך, עורך מבחני דרכים וחובב טבע שהתאהב באופנועים לפני עשרים שנה ומאז לא ירד מהאוכף.',
    aboutP2: 'אני מדריך רכיבת שטח מתקדמת ומוביל מסעות אופנוע ברחבי הארץ והעולם — עם ליווי אישי, ידע מקומי והרבה אבק.',
    aboutStat1: 'שנות ניסיון', aboutStat2: 'מדינות', aboutStat3: 'קבוצות קטנות', guideCaption: 'צביקה כהן · מדריך שטח מוסמך',
    contactKicker: 'תכנון מסלול', contactTitle: 'המסלול הבא מתחיל בשיחה',
    fName: 'שם מלא', fEmail: 'דוא״ל', fTrip: 'מסלול', fMsg: 'הודעה', fSubmit: 'שליחת פנייה',
    backTrips: 'חזרה למסלולים', itinKicker: 'רודבוק · יום־אחר־יום', itinTitle: 'יום־אחר־יום',
    mapCue: 'פרטים מלאים נשלחים לאחר ההרשמה', readMore: 'להמשך קריאה', watchOn: 'צפייה ביוטיוב',
    tripCtaTitle: 'מוכנים לצאת לדרך?', tripCtaSub: 'מקומות מוגבלים בכל יציאה. השאירו פרטים ונחזור אליכם.',
    enquireTrip: 'תיאום המסלול', copyright: '© 2026 צביקה כהן השטח',
    footBlurb: 'ניווט שטח ברמת משלחת אל השטחים הפראיים של כדור הארץ. רודבוק, קבוצות קטנות, ליווי מומחה.',
    brandTag: 'צביקה כהן השטח',
    minRead: 'דק׳ קריאה',
  },
  en: {
    enquire: 'Enquire', viewTrip: 'Route', readReview: 'Review',
    heroKicker: 'Off-road expeditions · Since 2008', heroTitle: 'Leave the road.',
    heroSub: 'Expedition-grade off-road navigation into the planet’s wildest corners. Roadbooks, waypoints and small groups — all you do is ride.',
    heroCta: 'Open the roadbook', scroll: 'Scroll',
    journeysKicker: 'Roadbook · routes', journeysTitle: 'Featured terrains',
    journeysSub: 'Every route logged with waypoints, elevation and grade. Scroll the roadbook.',
    lElev: 'ELEV', lDist: 'DIST', lGrade: 'GRADE',
    reviewsKicker: 'Field tests', reviewsTitle: 'Bike reviews',
    videosKicker: 'Video', videosTitle: 'Field technique',
    videosSub: 'Trail-shot tutorials on control, navigation and maintenance. Tap to watch.', videosChannel: 'Visit the YouTube channel',
    trainingKicker: 'Off-road training', trainingTitle: 'Learn to ride it right.',
    trainingSub: 'Off-road riding courses led personally by Zvika Cohen — a certified instructor with decades of dirt under his wheels.', courseCta: 'Details',
    journalKicker: 'Field journal', journalTitle: 'From the trail',
    journalViewAll: 'View all stories', journalArchiveTitle: 'The full field journal',
    journalArchiveSub: 'Every trip report, training log and trail story — first to last.',
    journalCount: 'stories', viewCards: 'Cards', viewList: 'List', backHome: 'Back to home',
    aboutKicker: 'The guide', aboutTitle: 'Zvika Cohen',
    aboutP1: 'I’m Zvika Cohen — a certified off-road riding instructor, motorcycle road-test editor and nature lover who fell for bikes twenty years ago and never got out of the saddle.',
    aboutP2: 'I teach advanced off-road riding and lead two-wheel expeditions across Israel and the world — with personal guiding, deep local knowledge and plenty of dust.',
    aboutStat1: 'Years riding', aboutStat2: 'Countries', aboutStat3: 'Small groups', guideCaption: 'Zvika Cohen · Certified off-road instructor',
    contactKicker: 'Plan a route', contactTitle: 'The next route starts with a conversation',
    fName: 'Full name', fEmail: 'Email', fTrip: 'Route', fMsg: 'Message', fSubmit: 'Send enquiry',
    backTrips: 'Back to routes', itinKicker: 'Roadbook · day-by-day', itinTitle: 'Day by day',
    mapCue: 'Full details shared after booking', readMore: 'Read more', watchOn: 'Watch on YouTube',
    tripCtaTitle: 'Ready to hit the trail?', tripCtaSub: 'Limited places per departure. Leave your details and we’ll be in touch.',
    enquireTrip: 'Enquire about this route', copyright: '© 2026 Cohen Adventure',
    footBlurb: 'Expedition-grade off-road navigation into the wildest terrain on earth. Roadbooks, small groups, expert guiding.',
    brandTag: 'ZVIKA COHEN · OFF-ROAD',
    minRead: 'min read',
  },
} as const;

export type Dict = (typeof DICT)['he'];

export const NAV = [
  { href: '#roadbook', he: 'רודבוק', en: 'Roadbook' },
  { href: '#reviews', he: 'מבחנים', en: 'Reviews' },
  { href: '#training', he: 'הדרכות', en: 'Training' },
  { href: '#videos', he: 'וידאו', en: 'Video' },
  { href: '#journal', he: 'יומן', en: 'Journal' },
  { href: '#about', he: 'אודות', en: 'About' },
];

export function footCols(lang: Lang) {
  const he = lang === 'he';
  return [
    { head: he ? 'מסלולים' : 'ROUTES', items: he ? ['מרוקו', 'יוון', 'כל המסלולים'] : ['Morocco', 'Greece', 'All routes'] },
    { head: he ? 'למידה' : 'LEARN', items: he ? ['הדרכות שטח', 'וידאו', 'מבחני שטח', 'יומן שדה'] : ['Off-road training', 'Video', 'Field tests', 'Field journal'] },
    { head: he ? 'החברה' : 'COMPANY', items: he ? ['אודות', 'המדריך', 'צור קשר'] : ['About', 'The guide', 'Contact'] },
  ];
}

export const SOCIALS = [
  { key: 'youtube', href: 'https://www.youtube.com/user/cohenmotoable/videos', label: 'YouTube' },
  { key: 'instagram', href: 'https://www.instagram.com/cohenadventure/', label: 'Instagram' },
  { key: 'facebook', href: 'https://www.facebook.com/cohen100', label: 'Facebook' },
] as const;

// Duotone gradient fallbacks (used when a CMS item has no image).
export const PAL: Record<string, [string, string]> = {
  terra: ['#7a3418', '#c0603a'], sand: ['#5a4326', '#c9a56a'], amber: ['#6a4a08', '#c99418'],
  steel: ['#26323d', '#5f6f7e'], snow: ['#3a4650', '#8ea3b2'], dusk: ['#402238', '#8a4a5e'],
  forest: ['#233126', '#4e6b4a'], rust: ['#5e2a15', '#a34b2a'], slate: ['#2a2622', '#5a4f45'],
};
export const PAL_KEYS = Object.keys(PAL);

export function gradeBlocks(n: number): string[] {
  return Array.from({ length: 5 }, (_, i) => (i < n ? 'var(--amber)' : 'var(--line-strong)'));
}
