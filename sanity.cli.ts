import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'dummy123',
    dataset: 'production',
  },
})
