import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/plugins/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'propel',
  title: 'PROPEL CMS',

  projectId: 'dummy123',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(), // GROQ query explorer — remove in production if desired
  ],

  schema: {
    types: schemaTypes,
  },
})
