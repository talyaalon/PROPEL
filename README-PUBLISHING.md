# PROPEL — חבילת פרסום לשלוש הכתבות הראשונות

שש קבצי MDX, שלוש כתבות בשתי שפות, מוכנים ל-`content/blog/`. המסמך הזה מסביר מה צריך להיות בקוד כדי שהם יעבדו במלואם.

---

## 1. מה יש בחבילה

```
content/blog/
├── he/
│   ├── branch-leakage-case-study.mdx
│   ├── wordpress-vs-custom-code-true-cost.mdx
│   └── accessibility-plugin-is-not-enough.mdx
└── en/
    ├── branch-leakage-case-study.mdx
    ├── wordpress-vs-custom-code-true-cost.mdx
    └── accessibility-plugin-is-not-enough.mdx
```

ה-slug זהה בשתי השפות בכוונה — זה מה שהופך את ה-hreflang ההדדי לטריוויאלי ומונע עמודים יתומים, שזה אחד מקריטריוני הקבלה שהגדרת.

**כתבת דליפת הסניפים היא הגרסה המאונונימיזציה** — בלי שם המותג, בלי מספר הסניפים, בלי שמות הערים. אפשר לפרסם אותה היום בלי לבקש אישור מאף אחד.

---

## 2. סכמת הפרונטמאטר

שבעת השדות המקוריים לא השתנו. נוספו שדות אופציונליים שהפייפליין צריך לתמוך בהם — כולם עם ברירת מחדל, כך ששום דבר לא נשבר אם תבחר לדלג עליהם.

```ts
// lib/blog/schema.ts
import { z } from "zod";

export const postFrontmatter = z.object({
  // חובה — כפי שהוגדר בפייפליין המקורי
  title: z.string().min(1).max(70),
  description: z.string().min(50).max(160),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  readingTime: z.number().int().positive(),
  draft: z.boolean(),

  // אופציונלי — SEO מורחב
  author: z.string().default("PROPEL"),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  lang: z.enum(["he", "en"]).optional(),
  keywords: z.array(z.string()).default([]),
  ogTitle: z.string().max(60).optional(),
  ogDescription: z.string().max(110).optional(),
  related: z.array(z.string()).default([]),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
});

export type PostFrontmatter = z.infer<typeof postFrontmatter>;
```

**הערה על `updated`:** גוגל מציג `dateModified` בתוצאות. אל תעדכן אותו על תיקון פסיק — רק כשהתוכן באמת השתנה. עדכון מלאכותי הוא סיגנל שגוי ולא מועיל לדירוג.

---

## 3. JSON-LD

שני סכמות לכל כתבה. ה-`faq` בפרונטמאטר קיים בדיוק בשביל השנייה.

```tsx
// app/[locale]/blog/[slug]/page.tsx
const SITE = "https://propel.co.il";

const articleLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  inLanguage: locale,
  datePublished: post.date,
  dateModified: post.updated ?? post.date,
  author:    { "@type": "Organization", name: "PROPEL", url: SITE },
  publisher: { "@type": "Organization", name: "PROPEL", url: SITE },
  mainEntityOfPage: `${SITE}/${locale}/blog/${post.slug}`,
  keywords: post.keywords.join(", "),
};

const faqLd = post.faq.length
  ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faq.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    }
  : null;
```

**כלל אחד לא לשבור:** תשובות ה-FAQ חייבות להופיע גם כטקסט גלוי בעמוד, לא רק ב-JSON-LD. גוגל מטפל בסכמה שלא מגובה בתוכן נראה כהפרה. הדרך הפשוטה היא לרנדר בתחתית כל כתבה סקשן "שאלות נפוצות" מתוך אותו מערך.

---

## 4. hreflang ו-canonical

```tsx
export async function generateMetadata({ params: { locale, slug } }) {
  const post = await getPost(locale, slug);
  const url = `${SITE}/${locale}/blog/${slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: url,
      languages: {
        he: `${SITE}/he/blog/${slug}`,
        en: `${SITE}/en/blog/${slug}`,
        "x-default": `${SITE}/he/blog/${slug}`,
      },
    },
    openGraph: {
      title: post.ogTitle ?? post.title,
      description: post.ogDescription ?? post.description,
      type: "article",
      locale: locale === "he" ? "he_IL" : "en_US",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      url,
    },
    twitter: { card: "summary_large_image" },
  };
}
```

`x-default` מצביע לעברית כי זה קהל היעד העיקרי.

---

## 5. עיצוב ו-RTL — הדברים שנשברים בפועל

הכתבות מכילות עברית עם מונחים לטיניים משובצים (`httpOnly`, `Tab`, `alt`, WCAG). זה בדיוק המקום שבו טיפוגרפיה RTL נשברת.

- **בלוקי קוד תמיד LTR.** `pre, code { direction: ltr; text-align: left; unicode-bidi: isolate; }`
- **קוד inline בתוך משפט עברי** — `unicode-bidi: isolate` ולא `embed`. בלי זה סימני פיסוק קופצים לצד הלא נכון.
- **רוחב שורה** — `max-width: 68ch` לעברית. עברית צפופה יותר מלטינית ושורה ארוכה מדי הופכת ללא קריאה מהר יותר.
- **גובה שורה** — לפחות `1.75` לגוף הטקסט בעברית עם Assistant. פחות מזה נראה דחוס.
- **תבליטים ורשימות** — השתמש ב-`padding-inline-start`, לא `padding-left`. אותו דבר לציטוטים ולגבולות.
- **ה-blockquote בכתבת הנגישות** — ודא שהגבול יושב ב-`border-inline-start`, אחרת הוא יופיע בצד הלא נכון בעברית.

---

## 6. תוכנית קישור פנימי

הקישורים כבר כתובים בתוך הקבצים דרך `related` ודרך ה-CTA בסוף. מה שצריך להוסיף בקוד:

| מאיפה | לאן | למה |
|---|---|---|
| עמוד שירות "בניית מערכות" | דליפת סניפים | הוכחת עומק הנדסי |
| עמוד שירות "הגירה מוורדפרס" | וורדפרס מול קוד | הכתבה היא ההנמקה המלאה |
| עמוד שירות SEO / נגישות | תוסף נגישות | תפיסת חיפוש |
| כל כתבה | `/contact` | כבר קיים בסוף כל קובץ |

**אזהרה אחת:** אל תניח את כתבת דליפת הסניפים ליד תיק העבודות של J-Cafe ואל תקשר ביניהם. אתר שמציג רשת מסעדות רב-סניפית לצד כתבה על "רשת רב-סניפית" עושה את החיבור בשביל הקורא, והאנונימיזציה מתבטלת. אם בשלב כלשהו תרצה שהיא כן תשב שם — אז ממילא עדיף לקבל אישור ולפרסם את הגרסה המלאה עם השם.

---

## 7. תמונות OG

שלוש תמונות, 1200×630, בסגנון המותג — קרם, שחור מט, אפור צפחה, Assistant לעברית ו-DM Sans לאנגלית. אם אתה מייצר אותן דינמית עם `next/og`, הטקסט לכל אחת:

| slug | עברית | אנגלית |
|---|---|---|
| `branch-leakage-case-study` | הזמנה שנחתה בסניף הלא נכון | The order that landed in the wrong kitchen |
| `wordpress-vs-custom-code-true-cost` | מה באמת משלמים בשלוש שנים | What you actually pay over three years |
| `accessibility-plugin-is-not-enough` | תוסף נגישות הוא לא הנגשה | A widget is not an accessible site |

הכיתוב המשני בכל אחת: `PROPEL · propel.co.il`.

---

## 8. צ'קליסט לפני commit

- [ ] `pnpm build` עובר — MDX נבנה בלי שגיאות פרסינג
- [ ] כל שישה העמודים נטענים ב-`/he/blog/[slug]` וב-`/en/blog/[slug]`
- [ ] hreflang הדדי — כל עמוד מצביע לתאום שלו ולעצמו
- [ ] JSON-LD עובר ולידציה ב-Rich Results Test, שתי הסכמות
- [ ] תשובות ה-FAQ מרונדרות כטקסט נראה, לא רק בסכמה
- [ ] `description` בכל קובץ בין 50 ל-160 תווים — בדוק איך זה נחתך בתצוגה מקדימה
- [ ] קוד inline לא שובר את כיוון הטקסט בעברית, במובייל ובדסקטופ
- [ ] axe על שישה עמודי הכתבות — אפס violations (כתבה שמדברת על נגישות ונכשלת בבדיקה היא הנזק היחיד שאין ממנו דרך חזרה)
- [ ] Lighthouse מובייל על עמוד כתבה: Performance ≥ 95
- [ ] כל הכתבות מופיעות ב-`sitemap.xml` עם `lastModified` אמיתי
- [ ] הקישורים ל-`/he/contact` ו-`/en/contact` לא שבורים

---

## 9. שתי הערות שכדאי לקרוא לפני שאתה מפרסם

**כתבת הנגישות היא נכס הליד החזק ביותר, והמסוכן ביותר לנסח לא נכון.** אנשים מגיעים אליה בפאניקה אחרי שקיבלו מכתב. השארתי בה שתי הסתייגויות מפורשות שזה לא ייעוץ משפטי, ולא נקבתי בסף הפטור הכלכלי במספר — הוא מתעדכן, וכתבה שנוקבת במספר שגוי היא חשיפה שלך, לא של הקורא. אם תרצה להוסיף מספר, אמת אותו מול מורשה נגישות ולא מול מקור באינטרנט.

**כתבת דליפת הסניפים היא נכס המכירות האמיתי מבין השלוש.** היא לא מנסה למכור כלום, וזה בדיוק מה שמוכר: לקוח פוטנציאלי מבין תוך שתי פסקאות שהוא לא מדבר עם מישהו שמרכיב תבניות. שים אותה ראשונה בעמוד הבלוג.
