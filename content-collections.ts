import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'

const api = defineCollection({
  name: 'api',
  directory: 'src/docs/api',
  include: '**/*.md',
  schema: z => ({
    title: z.string(),
    category: z.string(),
    order: z.number(), // Order for documents
    categoryOrder: z.number(), // Order for categories
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document)
    return {
      ...document,
      mdx,
      slug: document.title.toLowerCase().replace(/ /g, '-'),
      categorySlug: document.category.toLowerCase().replace(/ /g, '-'),
    }
  },
})

const introduction = defineCollection({
  name: 'introduction',
  directory: 'src/docs/introduction',
  include: '**/*.md',
  schema: z => ({
    title: z.string(),
    category: z.string(),
    order: z.number(),
    categoryOrder: z.number(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document)
    return {
      ...document,
      mdx,
      slug: document.title.toLowerCase().replace(/ /g, '-'),
      categorySlug: document.category.toLowerCase().replace(/ /g, '-'),
    }
  },
})

export default defineConfig({
  collections: [api, introduction],
})
