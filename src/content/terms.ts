import type { Locale } from '@/lib/i18n'
import type { LegalDocument } from './legal'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  TERMS OF USE - DRAFT. NOT REVIEWED BY A LAWYER. NOT PUBLISHED.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Written at the owner's request as a starting point. It is not legal advice,
 *  and it is deliberately impossible for it to reach a production deploy by
 *  accident: `termsArePublished` below is what puts /terms into `sitePaths()`,
 *  and while it is false the route exists on local and preview builds only. On
 *  production the URL answers exactly as it did before this file existed - the
 *  middleware's 404.
 *
 *  It lives in its own module rather than in legal.ts because that file holds
 *  two documents that ARE published and reviewed, and an unreviewed draft
 *  sitting beside them is how one gets published by mistake.
 *
 *  Two placeholders only the owner can fill, marked here rather than guessed:
 *
 *    - The registered business name and number. They come from
 *      NEXT_PUBLIC_LEGAL_NAME / NEXT_PUBLIC_BUSINESS_ID, both still unset, so
 *      no clause below names the legal entity. A lawyer will want one that
 *      does.
 *    - The jurisdiction clause names Israeli courts generally. A lawyer will
 *      usually want a specific district named.
 *
 *  TO PUBLISH: have it reviewed, apply the changes, then set the flag to true.
 *  Nothing else needs to change - the route, the metadata, the schema, the
 *  footer link and the sitemap entry are all already wired to the flag.
 */

export const termsArePublished = false

export const termsOfUse: Record<Locale, LegalDocument> = {
  he: {
    title: 'תנאי שימוש',
    intro:
      'התנאים האלה חלים על השימוש באתר הזה. הם נכתבו בשפה פשוטה ככל האפשר, ולא כתחליף להסכם ההתקשרות - כל פרויקט מתנהל לפי הצעת מחיר והסכם נפרדים שנחתמים מולכם.',
    updatedLabel: 'עודכן',
    sections: [
      {
        heading: 'על מה התנאים האלה חלים',
        paragraphs: [
          'התנאים חלים על הגלישה באתר, על הקריאה בתוכן שבו ועל שליחת פנייה דרך טופס יצירת הקשר. הם אינם חלים על עבודה בתשלום: היקף העבודה, לוח הזמנים, התמורה והבעלות על התוצרים נקבעים בהצעת מחיר ובהסכם שנחתמים בנפרד, ובכל סתירה בין המסמכים - ההסכם החתום גובר.',
        ],
      },
      {
        heading: 'התוכן באתר',
        paragraphs: [
          'התוכן באתר, ובכלל זה תיאורי השירותים, מקרי הבוחן והמאמרים, נועד למסור מידע ולהציג עבודה שבוצעה. הוא אינו ייעוץ מקצועי המותאם לעסק מסוים ואינו הצעה מחייבת. מספרים ותוצאות שמופיעים במקרי הבוחן מתייחסים לאותו פרויקט ולאותו לקוח, ואינם הבטחה לתוצאה דומה אצל מישהו אחר.',
          'אנחנו משתדלים שהמידע יהיה מדויק ומעודכן, אבל הוא עשוי להשתנות בלי הודעה מוקדמת.',
        ],
      },
      {
        heading: 'קניין רוחני',
        paragraphs: [
          'העיצוב, הקוד, הטקסטים והתמונות באתר הזה הם רכושנו או שנעשה בהם שימוש ברשות. אפשר לקרוא, לשתף קישור ולצטט בהיקף סביר תוך מתן קרדיט וקישור למקור. אין להעתיק חלקים מהותיים מהאתר, לשכפל את העיצוב או לעשות שימוש מסחרי בתוכן בלי אישור בכתב.',
          'שמות וסימני מסחר של לקוחות שמופיעים בתיק העבודות שייכים לבעליהם, ומוצגים לצורך תיאור עבודה שבוצעה.',
        ],
      },
      {
        heading: 'קישורים לאתרים אחרים',
        paragraphs: [
          'באתר יש קישורים לאתרים ולמסמכים שאינם שלנו, ובכללם אתרים של לקוחות ומקורות מקצועיים. אין לנו שליטה על התוכן שם ואיננו אחראים לו. קישור אינו המלצה על כל מה שמופיע בעמוד המקושר.',
        ],
      },
      {
        heading: 'פנייה דרך האתר',
        paragraphs: [
          'שליחת פנייה דרך הטופס אינה יוצרת התקשרות ואינה מחייבת אף צד. הפרטים שנמסרים משמשים כדי לחזור אליכם ומטופלים לפי מדיניות הפרטיות של האתר. אין לשלוח דרך הטופס מידע רגיש, סודות מסחריים או פרטים שאתם מעדיפים שלא יישמרו.',
        ],
      },
      {
        heading: 'אחריות',
        paragraphs: [
          'האתר מסופק כפי שהוא. אנחנו לא מתחייבים שיהיה זמין ברציפות או נקי מתקלות, ולא נישא באחריות לנזק עקיף או תוצאתי שנגרם מהסתמכות על תוכן באתר. אחריותנו בכל הנוגע לעבודה בתשלום נקבעת בהסכם ההתקשרות ולא כאן.',
          'אין באמור כדי לגרוע מזכויות שאי אפשר להתנות עליהן לפי דין, ובכלל זה זכויות צרכן.',
        ],
      },
      {
        heading: 'נגישות',
        paragraphs: [
          'האתר נבנה לפי תקן ישראלי 5568 ומתפרסמת לגביו הצהרת נגישות נפרדת. אם נתקלתם במשהו שאינו נגיש, נשמח שתודיעו לנו דרך הפרטים שבהצהרה.',
        ],
      },
      {
        heading: 'שינויים בתנאים',
        paragraphs: [
          'אנחנו רשאים לעדכן את התנאים האלה. הנוסח המחייב הוא זה שמופיע בעמוד, ותאריך העדכון מופיע בראשו. שימוש באתר לאחר עדכון מהווה הסכמה לנוסח המעודכן.',
        ],
      },
      {
        heading: 'דין וסמכות שיפוט',
        paragraphs: [
          'על התנאים האלה חלים דיני מדינת ישראל. סמכות השיפוט בכל מחלוקת נתונה לבתי המשפט המוסמכים בישראל.',
        ],
      },
    ],
  },
  en: {
    title: 'Terms of use',
    intro:
      'These terms apply to your use of this website. They are written as plainly as possible and are not a substitute for an engagement agreement - every project runs under a separate quote and contract signed with you.',
    updatedLabel: 'Updated',
    sections: [
      {
        heading: 'What these terms cover',
        paragraphs: [
          'They cover browsing this site, reading its content, and sending an enquiry through the contact form. They do not cover paid work: scope, timeline, fees and ownership of deliverables are set out in a quote and an agreement signed separately, and where the documents conflict the signed agreement prevails.',
        ],
      },
      {
        heading: 'The content on this site',
        paragraphs: [
          'The content here, including the service descriptions, the case studies and the articles, is published to give information and to show work that was done. It is not professional advice tailored to any particular business, and it is not a binding offer. Figures and outcomes in the case studies describe that project and that client; they are not a promise of a similar result for anyone else.',
          'We try to keep the information accurate and current, but it may change without notice.',
        ],
      },
      {
        heading: 'Intellectual property',
        paragraphs: [
          'The design, code, text and images on this site are ours or used with permission. You may read it, share a link to it, and quote from it in reasonable measure with credit and a link to the source. You may not copy substantial parts of the site, reproduce the design, or make commercial use of the content without written permission.',
          'Client names and marks shown in the portfolio belong to their owners and appear in order to describe work that was carried out.',
        ],
      },
      {
        heading: 'Links to other sites',
        paragraphs: [
          'This site links to sites and documents that are not ours, including client sites and professional sources. We have no control over that content and are not responsible for it. A link is not an endorsement of everything on the page it points to.',
        ],
      },
      {
        heading: 'Contacting us through the site',
        paragraphs: [
          'Sending an enquiry through the form does not create an engagement and does not bind either side. The details you provide are used to get back to you, and are handled under the privacy policy published on this site. Please do not send sensitive information, trade secrets, or anything you would rather was not stored.',
        ],
      },
      {
        heading: 'Liability',
        paragraphs: [
          'The site is provided as it is. We do not undertake that it will be continuously available or free of faults, and we are not liable for indirect or consequential loss arising from reliance on content here. Our liability in respect of paid work is set out in the engagement agreement, not here.',
          'Nothing above limits rights that cannot be contracted out of under applicable law, including consumer rights.',
        ],
      },
      {
        heading: 'Accessibility',
        paragraphs: [
          'This site is built to Israeli standard IS 5568 and publishes a separate accessibility statement. If you find something that is not accessible, please tell us using the details in that statement.',
        ],
      },
      {
        heading: 'Changes to these terms',
        paragraphs: [
          'We may update these terms. The version on this page is the one that applies, and the date it was last updated appears at the top. Continuing to use the site after an update means you accept the updated version.',
        ],
      },
      {
        heading: 'Governing law and jurisdiction',
        paragraphs: [
          'These terms are governed by the laws of the State of Israel. The competent courts in Israel have jurisdiction over any dispute.',
        ],
      },
    ],
  },
}
