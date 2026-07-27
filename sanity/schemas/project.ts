import { defineField, defineType } from 'sanity'

/** Reusable bilingual text object — produces { he: string, en: string } */
function bilingualText(name: string, title: string) {
  return defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({
        name: 'he',
        title: 'Hebrew (עברית)',
        type: 'text',
        rows: 4,
      }),
      defineField({
        name: 'en',
        title: 'English',
        type: 'text',
        rows: 4,
      }),
    ],
  })
}

export const project = defineType({
  name: 'project',
  title: 'Portfolio Project',
  type: 'document',

  fields: [
    // ── Core identity ──────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Shown on the portfolio grid. Recommended: 16:9 ratio.',
    }),
    defineField({
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Add tags — e.g. Next.js, Tailwind CSS, Sanity, etc.',
    }),

    // ── Bilingual content ──────────────────────────────────────────────────────
    bilingualText('problem', 'Problem'),
    bilingualText('solution', 'Solution'),
    bilingualText('result', 'Results / Measurable Outcomes'),

    // ── Media ──────────────────────────────────────────────────────────────────
    defineField({
      name: 'gallery',
      title: 'Screenshot Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
            }),
          ],
        },
      ],
      description: 'Upload project screenshots. Displayed in a grid below the text.',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL (YouTube or Vimeo)',
      type: 'url',
      description:
        'Paste the regular watch URL — e.g. https://www.youtube.com/watch?v=abc123',
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live Site URL',
      type: 'url',
      description: 'Link to the deployed project.',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
      media: 'thumbnail',
    },
  },
})
