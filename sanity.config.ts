'use client'

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig, type PluginOptions} from 'sanity'
import {structureTool} from 'sanity/structure'
import {colorInput} from '@sanity/color-input'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'

// Base plugins that work in all environments
const basePlugins: PluginOptions[] = [
  structureTool({structure}),
  visionTool({defaultApiVersion: apiVersion}),
  colorInput(),
]

// Conditionally import markdown plugin
// This avoids CSS import issues during CLI operations like `sanity schema extract`
let plugins: PluginOptions[] = basePlugins
let markdownLoaded = false
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { markdownSchema } = require('sanity-plugin-markdown')
  plugins = [...basePlugins, markdownSchema()]
  markdownLoaded = true
} catch {
  // Markdown plugin failed to load (likely in CLI context due to CSS import)
  // We'll add a fallback type definition below
}

// Fallback markdown type for CLI context (when the full plugin can't load)
const markdownFallbackType = {
  name: 'markdown',
  title: 'Markdown',
  type: 'text',
}

// Extend schema with fallback if markdown plugin didn't load
const extendedSchema = markdownLoaded
  ? schema
  : { ...schema, types: [...schema.types, markdownFallbackType] }

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema: extendedSchema,
  plugins,
})
