/**
 * Legal page copy.
 *
 * The accessibility statement is not optional decoration: Israeli accessibility
 * regulations (תקנות שוויון זכויות לאנשים עם מוגבלות) require a business website
 * to meet IS 5568 and to publish a statement naming an accessibility coordinator
 * and how to reach them. As an agency that sells websites, having one is also a
 * sales asset — clients ask.
 *
 * ⚠️  Review both pages with the business owner before launch, and fill in the
 *     NEXT_PUBLIC_A11Y_CONTACT_NAME / NEXT_PUBLIC_LEGAL_NAME env vars.
 */

import type { Locale } from '@/lib/i18n'

export type LegalSection = {
  heading: string
  paragraphs?: string[]
  list?: string[]
}

export type LegalDocument = {
  title: string
  intro: string
  updatedLabel: string
  sections: LegalSection[]
}

// ── Accessibility statement ──────────────────────────────────────────────────

export const accessibilityStatement: Record<Locale, LegalDocument> = {
  he: {
    title: 'הצהרת נגישות',
    intro:
      'אנחנו רואים בנגישות האתר חלק מהמקצועיות שלנו, ולא תוספת. האתר הזה נבנה מלכתחילה כך שיהיה שמיש עבור כמה שיותר אנשים, כולל משתמשי מקלדת וקוראי מסך.',
    updatedLabel: 'עודכן לאחרונה',
    sections: [
      {
        heading: 'רמת ההנגשה',
        paragraphs: [
          'האתר נבנה בהתאם לתקן הישראלי ת"י 5568 ברמה AA, המבוסס על הנחיות WCAG 2.1 של ארגון W3C.',
          'ההנגשה נבדקה בפועל, במדידה ולא בהערכה: יחסי ניגודיות מחושבים מהצבעים שהדפדפן מציג בפועל, מעבר מלא במקלדת בכל עמוד, ובדיקת הגדלת טקסט עד 200%. הבדיקות מורצות בשתי השפות ובשני מצבי התצוגה, בהיר וכהה.',
        ],
      },
      {
        heading: 'תפריט הנגישות',
        paragraphs: [
          'בפינה התחתונה של כל עמוד יש כפתור נגישות. הוא פותח תפריט שמאפשר להתאים את האתר: הגדלת טקסט עד 200%, מצב ניגודיות גבוהה, הדגשת קישורים, ריווח שורות מוגדל, ועצירת האנימציות בעמוד. ההעדפות נשמרות בדפדפן שלכם ונשארות בכל מעבר בין עמודים.',
          'שלושה דברים שבמכוון אינם בתפריט, כי הם לא עוזרים: "מצב קורא מסך" (קורא המסך שלכם כבר פועל, ואתר שמנסה לעזור לו רק מפריע), היפוך צבעים (הוא הורס את הלוגו ואת צילומי המסך), וסמן עכבר גדול (מערכת ההפעלה שלכם עושה את זה טוב יותר).',
        ],
      },
      {
        heading: 'מה נעשה באתר',
        list: [
          'מבנה כותרות היררכי ותקין בכל עמוד',
          'ניווט מלא באמצעות מקלדת, כולל סימון ברור של מוקד המיקוד',
          'קישור "דילוג לתוכן הראשי" בתחילת כל עמוד',
          'טקסט חלופי לתמונות שנושאות מידע',
          'יחסי ניגודיות שנמדדו ועומדים בדרישות התקן בשני מצבי התצוגה',
          'אפשרות לעצור כל אנימציה אוטומטית בעמוד',
          'הגדלת טקסט עד 200% ללא אובדן תוכן. נמדד בכל העמודים ברוחב 320 ו-375 פיקסלים: אין גלילה אופקית, למעט 4 פיקסלים בעמוד הבית באנגלית ברוחב 320',
          'תמיכה בהעדפת המערכת להפחתת אנימציות, בנוסף לכפתור העצירה',
          'תמיכה מלאה בכיווניות ימין-לשמאל בעברית',
        ],
      },
      {
        heading: 'איך השירות ניתן',
        paragraphs: [
          'השירות ניתן מרחוק בלבד. אין מקום פיזי המשמש לקבלת קהל, ולכן תקנות הנגישות למקום ציבורי אינן חלות כאן.',
          'אם חלק כלשהו באתר אינו נגיש עבורכם, אפשר לפנות בוואטסאפ, בטלפון או במייל ולקבל את אותו מידע או שירות בדרך אחרת. וואטסאפ הוא הערוץ הנוח למי שמתקשה בשיחת טלפון.',
        ],
      },
      {
        heading: 'מגבלות ידועות',
        paragraphs: [
          'ייתכן שתוכן שמוטמע מגורם צד שלישי אינו נגיש במלואו, מכיוון שאינו בשליטתנו. אנחנו פועלים לצמצם שימוש בתוכן כזה.',
          'צילומי המסך של אתרי הלקוחות בעמוד העבודות מוכרזים בשם הפרויקט, אבל התוכן שבתוכם אינו מוקרא - הם תמונות ממשק. התיאור המילולי של כל פרויקט נמצא בטקסט שלצידם.',
        ],
      },
      {
        heading: 'נתקלתם בבעיה?',
        paragraphs: [
          'אם נתקלתם ברכיב באתר שאינו נגיש עבורכם, נשמח שתיידעו אותנו. אנחנו מתחייבים לבחון כל פנייה ולתקן מה שניתן.',
        ],
      },
    ],
  },
  en: {
    title: 'Accessibility Statement',
    intro:
      'We treat accessibility as part of doing the job properly, not as an add-on. This site was built from the start to be usable by as many people as possible, including keyboard and screen-reader users.',
    updatedLabel: 'Last updated',
    sections: [
      {
        heading: 'Conformance level',
        paragraphs: [
          'This site is built to the Israeli standard IS 5568 at level AA, which is based on the W3C WCAG 2.1 guidelines.',
        ],
        // Kept concrete on purpose. "Tested for accessibility" is what every
        // statement says; naming what was measured is what makes it checkable.
      },
      {
        heading: 'How it was checked',
        paragraphs: [
          'Measured rather than estimated: contrast ratios computed from the colours the browser actually paints, a full keyboard pass on every page, and text enlarged to 200%. Every check is run in both languages and in both light and dark mode.',
        ],
      },
      {
        heading: 'The accessibility menu',
        paragraphs: [
          'There is an accessibility button in the bottom corner of every page. It opens a menu that lets you adjust the site: text size up to 200%, a high-contrast mode, highlighted links, increased line spacing, and a control that stops the animations on the page. Your choices are stored in your browser and stay applied as you move between pages.',
          'Three things are deliberately absent, because they do not help: a "screen reader mode" (your screen reader is already running, and a site that tries to assist it only interferes), colour inversion (it destroys the logo and the client screenshots), and a large-cursor toggle (your operating system does that better).',
        ],
      },
      {
        heading: 'What was done',
        list: [
          'A correct, hierarchical heading structure on every page',
          'Full keyboard navigation with a clearly visible focus indicator',
          'A "skip to main content" link at the start of every page',
          'Alternative text for images that carry information',
          'Contrast ratios measured against the standard in both display modes',
          'A control to stop every automatic animation on the page',
          'Text enlargement to 200% with no loss of content. Measured on every page at 320px and 375px: no sideways scrolling, except 4px on the English homepage at 320px',
          'Support for the system-level reduced-motion preference, alongside the stop control',
          'Full right-to-left support in Hebrew',
        ],
      },
      {
        heading: 'How the service is provided',
        paragraphs: [
          'The service is provided remotely. There is no physical location open to the public, so the accessibility regulations governing public premises do not apply here.',
          'If any part of this site is not accessible to you, reach us on WhatsApp, by phone or by email and we will provide the same information or service another way. WhatsApp is the easier channel for anyone who finds a phone call difficult.',
        ],
      },
      {
        heading: 'Known limitations',
        paragraphs: [
          'Third-party embedded content may not be fully accessible, as it is outside our control. We work to keep such content to a minimum.',
          'The client-site screenshots in the portfolio are announced by project name, but what they contain is not read aloud - they are interface images. Each project is described in the text beside them.',
        ],
      },
      {
        heading: 'Found a problem?',
        paragraphs: [
          'If you encounter anything on this site that is not accessible to you, please let us know. We commit to reviewing every report and fixing what we can.',
        ],
      },
    ],
  },
}

// ── Privacy policy ───────────────────────────────────────────────────────────

export const privacyPolicy: Record<Locale, LegalDocument> = {
  he: {
    title: 'מדיניות פרטיות',
    intro: 'המדיניות הזו מסבירה איזה מידע אנחנו אוספים דרך האתר, למה, ומה הזכויות שלכם לגביו.',
    updatedLabel: 'עודכן לאחרונה',
    sections: [
      {
        heading: 'איזה מידע נאסף',
        paragraphs: [
          'אנחנו אוספים רק מידע שאתם מוסרים לנו ביוזמתכם - למשל כשאתם פונים אלינו דרך וואטסאפ, טלפון או אימייל. איננו דורשים הרשמה ואיננו אוספים מידע רגיש.',
        ],
      },
      {
        heading: 'למה משתמשים במידע',
        list: [
          'כדי לחזור אליכם ולענות על הפנייה',
          'כדי להכין הצעת מחיר או אפיון',
          'כדי לנהל את הקשר העסקי במהלך הפרויקט',
        ],
      },
      {
        heading: 'שיתוף עם צדדים שלישיים',
        paragraphs: [
          'איננו מוכרים ואיננו משכירים מידע אישי לאף גורם. מידע עשוי לעבור דרך ספקי תשתית שאנחנו משתמשים בהם לצורך הפעלת האתר ושליחת הודעות, ואלה מחויבים לשמור עליו.',
        ],
      },
      {
        heading: 'מדידה ואנליטיקס',
        paragraphs: [
          'אנחנו עשויים למדוד שימוש באתר באופן אנונימי כדי לשפר אותו. מדידה כזו אינה מזהה אתכם אישית.',
        ],
      },
      {
        heading: 'הזכויות שלכם',
        paragraphs: [
          'על פי חוק הגנת הפרטיות, אתם רשאים לעיין במידע שנשמר עליכם, לבקש את תיקונו ולבקש את מחיקתו. פנייה בנושא תטופל תוך זמן סביר.',
        ],
      },
      {
        heading: 'יצירת קשר בנושא פרטיות',
        paragraphs: ['לכל שאלה בנוגע למדיניות הזו אפשר לפנות אלינו בפרטים שבתחתית העמוד.'],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    intro:
      'This policy explains what information we collect through the site, why, and what rights you have over it.',
    updatedLabel: 'Last updated',
    sections: [
      {
        heading: 'What we collect',
        paragraphs: [
          'We collect only information you choose to give us - for example when you contact us by WhatsApp, phone or email. We do not require registration and we do not collect sensitive information.',
        ],
      },
      {
        heading: 'How we use it',
        list: [
          'To get back to you and answer your enquiry',
          'To prepare a quote or a scope of work',
          'To manage the working relationship during a project',
        ],
      },
      {
        heading: 'Sharing with third parties',
        paragraphs: [
          'We do not sell or rent personal information to anyone. Information may pass through infrastructure providers we use to run the site and send messages, and those providers are obliged to protect it.',
        ],
      },
      {
        heading: 'Measurement and analytics',
        paragraphs: [
          'We may measure site usage anonymously in order to improve it. Such measurement does not identify you personally.',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'Under the Israeli Protection of Privacy Law you may review the information held about you, request that it be corrected, and request that it be deleted. We will handle such requests within a reasonable time.',
        ],
      },
      {
        heading: 'Privacy contact',
        paragraphs: [
          'For any question about this policy, contact us using the details at the foot of the page.',
        ],
      },
    ],
  },
}
