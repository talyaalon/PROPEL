import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',

  // Sanity allows only one document of this type (singleton pattern)
  __experimental_actions: ['update', 'publish'],

  fields: [
    defineField({
      name: 'whatsappPhone',
      title: 'WhatsApp Phone Number',
      type: 'string',
      description: 'International format without spaces or dashes — e.g. 972501234567',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'projectsCompleted',
      title: 'Projects Completed',
      type: 'number',
      validation: (Rule) => Rule.required().positive().integer(),
    }),
    defineField({
      name: 'activeClients',
      title: 'Active Clients',
      type: 'number',
      validation: (Rule) => Rule.required().positive().integer(),
    }),
    defineField({
      name: 'yearsOfExperience',
      title: 'Years of Experience',
      type: 'number',
      validation: (Rule) => Rule.required().positive().integer(),
    }),
  ],

  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
