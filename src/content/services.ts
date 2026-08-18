import type { Locale } from '@/lib/i18n'
import type { Bilingual } from '@/content/projects'

/**
 * The dedicated service pages - one per money query.
 *
 * The live-site SEO audit found one page carrying four services: the homepage
 * title-targeted two queries at once, and "מערכות ניהול לעסק" and "בניית חנות
 * אונליין" had literally zero occurrences anywhere on the site - while the
 * portfolio holds shipped work for both. These pages exist because the work
 * exists; each one puts its query in the title and H1 and stands on the case
 * studies as proof.
 *
 * The copy rule is the site's rule: no invented numbers, no claims the
 * portfolio cannot back. Every "מה זה נותן" line describes what the linked
 * systems actually do, in the language of the approved case-study narratives.
 */

export type ServicePage = {
  /** URL segment under /services/ */
  slug: string
  /** The search phrase this page exists for - goes in the title and H1. */
  title: Bilingual
  metaTitle: Bilingual
  metaDescription: Bilingual
  eyebrow: Bilingual
  intro: Bilingual
  body: Bilingual
  outcomesTitle: Bilingual
  outcomes: Bilingual[]
  proofTitle: Bilingual
  proofBody: Bilingual
  /** Slugs into projects.ts - the evidence. */
  proofSlugs: string[]
  whatsappMessage: Bilingual
}

export const servicePages: ServicePage[] = [
  {
    slug: 'automation',
    title: { he: 'אוטומציה לעסקים', en: 'Business automation' },
    metaTitle: {
      he: 'אוטומציה לעסקים - מערכות שמחליפות עבודה ידנית | PROPEL',
      en: 'Business automation - replace the manual work | PROPEL',
    },
    metaDescription: {
      he: 'כל תהליך שאתם עושים ידנית פעמיים ביום הוא תהליך שאפשר להפסיק לעשות. אנחנו בונים מערכות שמחליפות את הדף, העט והאקסל - הזמנות, קריאות שירות ותמחור.',
      en: 'Any process you do by hand twice a day is a process you can stop doing. We build systems that replace the paper, the pen and the spreadsheet - orders, work orders and pricing.',
    },
    eyebrow: { he: 'שירות', en: 'Service' },
    intro: {
      he: 'כל תהליך שאתם עושים ידנית פעמיים ביום הוא תהליך שאפשר להפסיק לעשות.',
      en: 'Any process you do by hand twice a day is a process you can stop doing.',
    },
    body: {
      he: 'אוטומציה לא מתחילה בתוכנה - היא מתחילה בשאלה איפה הזמן שלכם הולך לאיבוד. הזמנה שמוקראת בטלפון למטבח, קריאת שירות שחיה בוואטסאפ, מחירון שמחושב מחדש באקסל אחרי כל שינוי - כל אחד מאלה הוא מערכת שכבר בנינו למישהו. אנחנו ממפים את התהליך כפי שהוא באמת, בונים את המערכת שמחליפה את החלק הידני, ומחברים אותה למה שכבר יש לכם.',
      en: 'Automation does not start with software - it starts with asking where your time actually goes. An order read out loud to the kitchen, a work order living in WhatsApp, a price list recalculated in Excel after every change - each of these is a system we have already built for someone. We map the process as it really is, build the system that replaces the manual part, and connect it to what you already have.',
    },
    outcomesTitle: { he: 'מה זה נותן', en: 'What it gives you' },
    outcomes: [
      {
        he: 'תהליך שרץ בלי הקלדה כפולה - הנתון נכנס פעם אחת ומגיע לכל מקום שצריך',
        en: 'A process with no double entry - the data goes in once and reaches everywhere it needs to',
      },
      {
        he: 'תמונה אחת של מה קורה עכשיו, במקום להתקשר ולשאול',
        en: 'One picture of what is happening now, instead of calling to ask',
      },
      {
        he: 'היסטוריה מתועדת - עבודה רשומה היא עבודה שאפשר למדוד ולשפר',
        en: 'A documented history - recorded work can be measured and improved',
      },
      {
        he: 'חיבור למערכות הקיימות שלכם במקום החלפה שלהן',
        en: 'Integration with the systems you already run instead of replacing them',
      },
    ],
    proofTitle: { he: 'מערכות שבנינו', en: 'Systems we built' },
    proofBody: {
      he: 'שלוש מערכות בשימוש יומיומי אמיתי - לא פיילוטים ולא הדגמות.',
      en: 'Three systems in real daily use - not pilots, not demos.',
    },
    proofSlugs: ['air-manage', 'bom-recipes', 'jcafe-kosher'],
    whatsappMessage: {
      he: 'היי PROPEL, אשמח לדבר על אוטומציה לעסק שלי.',
      en: 'Hi PROPEL, I would like to talk about automating my business.',
    },
  },
  {
    slug: 'management-systems',
    title: { he: 'מערכות ניהול לעסק', en: 'Business management systems' },
    metaTitle: {
      he: 'מערכות ניהול לעסק בהתאמה אישית | PROPEL',
      en: 'Custom business management systems | PROPEL',
    },
    metaDescription: {
      he: 'מערכת ניהול שנבנית סביב התהליך שלכם - קריאות שירות, תמחור, עץ מוצר - במקום להכריח את העסק להתאים את עצמו לתוכנת מדף.',
      en: 'A management system built around your process - work orders, pricing, bill of materials - instead of forcing the business to fit off-the-shelf software.',
    },
    eyebrow: { he: 'שירות', en: 'Service' },
    intro: {
      he: 'כשהעבודה לא רשומה - היא לא נמדדת, ואי אפשר לשפר אותה.',
      en: 'Work that is not recorded is not measured - and cannot be improved.',
    },
    body: {
      he: 'תוכנת מדף מכריחה את העסק להתאים את עצמו אליה; מערכת שנבנית עבורכם מתאימה את עצמה לעסק. אנחנו בונים מערכות ניהול סביב התהליך האמיתי - מי פותח קריאה, מי מבצע, מה נסגר ומתי; איך מחיר של חומר גלם מתגלגל לעץ המוצר - ומקפידים על הדבר שקובע אם מערכת פנימית חיה או מתה: שיהיה קל יותר לעבוד איתה מאשר בלעדיה.',
      en: 'Off-the-shelf software forces the business to fit it; a system built for you fits the business. We build management systems around the real process - who opens a call, who executes, what closed and when; how a raw-material price cascades through the product tree - and we hold to the thing that decides whether an internal system lives or dies: it must be easier to work with than without.',
    },
    outcomesTitle: { he: 'מה זה נותן', en: 'What it gives you' },
    outcomes: [
      {
        he: 'מחזור חיים מלא לכל משימה - פתיחה, הקצאה, ביצוע, סגירה מתועדת',
        en: 'A full life cycle for every task - opened, assigned, executed, closed with a record',
      },
      {
        he: 'המנהל רואה את כל הפתוח במסך אחד במקום לרדוף אחרי עדכונים',
        en: 'The manager sees everything open on one screen instead of chasing updates',
      },
      {
        he: 'חישובים שמתעדכנים לבד - שינוי אחד מתגלגל לכל מקום שהוא נוגע בו',
        en: 'Calculations that update themselves - one change cascades everywhere it touches',
      },
      {
        he: 'ייבוא מהאקסל הקיים - המערכת מתחילה ממה שכבר יש, לא מאפס',
        en: 'Import from the existing Excel - the system starts from what exists, not from zero',
      },
    ],
    proofTitle: { he: 'מערכות שבנינו', en: 'Systems we built' },
    proofBody: {
      he: 'מערכת קריאות שירות בשימוש יומיומי בארגון, ומערכת תמחור שמחליפה אקסל שלם.',
      en: 'A work-order system in daily organisational use, and a costing system replacing an entire spreadsheet.',
    },
    proofSlugs: ['air-manage', 'bom-recipes'],
    whatsappMessage: {
      he: 'היי PROPEL, אשמח לדבר על מערכת ניהול לעסק שלי.',
      en: 'Hi PROPEL, I would like to talk about a management system for my business.',
    },
  },
  {
    slug: 'ecommerce',
    title: { he: 'בניית חנות אונליין', en: 'Online store development' },
    metaTitle: {
      he: 'בניית חנות אונליין לעסק | PROPEL',
      en: 'Online store development for business | PROPEL',
    },
    metaDescription: {
      he: 'חנות אונליין שמחוברת לתפעול האמיתי - מלאי, תמחור והזמנות שמגיעות ישר למטבח או למחסן, לא לתיבת מייל שמישהו צריך לזכור לבדוק.',
      en: 'An online store wired to real operations - stock, pricing, and orders that reach the kitchen or the warehouse directly, not an inbox someone has to remember to check.',
    },
    eyebrow: { he: 'שירות', en: 'Service' },
    intro: {
      he: 'חנות אונליין היא לא עמוד עם כפתור תשלום - היא החיבור בין מה שהלקוח רואה למה שהעסק עושה.',
      en: 'An online store is not a page with a pay button - it is the connection between what the customer sees and what the business does.',
    },
    body: {
      he: 'ההזמנה היא רק ההתחלה. השאלות שקובעות אם החנות עובדת הן מה קורה אחריה: איך המטבח יודע מה להכין, איך המלאי יורד, מי מעדכן מחיר ואיפה. בנינו חנות דו-לשונית לרשת עם שישה סניפים - עם מסכי מלקט, מסכי מטבח, וסנכרון דו-כיווני עם מערכת ה-ERP - ובדיקות אוטומטיות שרצות על מסלול ההזמנה בכל עדכון, כי במסחר ההבדל בין באג לבין יום מכירות אבוד הוא אותו הבדל.',
      en: 'The order is only the beginning. The questions that decide whether a store works are what happens after it: how the kitchen knows what to make, how stock comes down, who updates a price and where. We built a bilingual store for a six-branch chain - picker screens, kitchen displays, two-way ERP sync - with automated tests running the ordering path on every update, because in commerce the difference between a bug and a lost day of sales is no difference at all.',
    },
    outcomesTitle: { he: 'מה זה נותן', en: 'What it gives you' },
    outcomes: [
      {
        he: 'הזמנה שמגיעה ישר לביצוע - בלי הקראות בטלפון ובלי העברות ידניות',
        en: 'Orders that reach fulfilment directly - no phone read-outs, no manual handoffs',
      },
      {
        he: 'מלאי ומחירים במקור אמת אחד - מה שהלקוח רואה זה מה שנכון',
        en: 'Stock and prices in one source of truth - what the customer sees is what is true',
      },
      {
        he: 'תשלום מאובטח ושתי שפות ממשק כשצריך',
        en: 'Secure checkout, and a bilingual interface where the audience needs one',
      },
      {
        he: 'מסלול ההזמנה מכוסה בבדיקות אוטומטיות - שינוי קוד לא שובר את היכולת לשלם',
        en: 'The ordering path is covered by automated tests - a code change cannot break checkout',
      },
    ],
    proofTitle: { he: 'מה בנינו', en: 'What we built' },
    proofBody: {
      he: 'רשת מסעדות כשרה עם שישה סניפים בתאילנד, שתי שפות ומטבח שמקבל את ההזמנה ישר.',
      en: 'A kosher restaurant chain - six branches in Thailand, two languages, and a kitchen that receives the order directly.',
    },
    proofSlugs: ['jcafe-kosher'],
    whatsappMessage: {
      he: 'היי PROPEL, אשמח לדבר על חנות אונליין לעסק שלי.',
      en: 'Hi PROPEL, I would like to talk about an online store for my business.',
    },
  },
]

export function getServicePage(slug: string): ServicePage | undefined {
  return servicePages.find((service) => service.slug === slug)
}

export function getServiceSlugs(): string[] {
  return servicePages.map((service) => service.slug)
}

export function serviceTitle(service: ServicePage, lang: Locale): string {
  return service.title[lang]
}
