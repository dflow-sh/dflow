import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMarkdown } from '@content-collections/markdown'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { z } from 'zod'

const createDocCollection = (name: string, directory: string) =>
  defineCollection({
    name,
    directory: `../../packages/core/src/docs/${directory}`,
    include: '**/*.{md,mdx}',
    schema: z.object({
      title: z.string(),
      category: z.string(),
      order: z.number(),
      categoryOrder: z.number(),
    }),
    transform: async (document, context) => {
      const html = await compileMarkdown(context, document, {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ],
      })

      return {
        ...document,
        html,
        slug: document.title.toLowerCase().replace(/ /g, '-'),
        categorySlug: document.category.toLowerCase().replace(/ /g, '-'),
      }
    },
  })

export default defineConfig({
  collections: [
    createDocCollection('introduction', 'introduction'),
    createDocCollection('servers', 'servers'),
    createDocCollection('onboarding', 'onboarding'),
    createDocCollection('services', 'services'),
    createDocCollection('security', 'security'),
    createDocCollection('templates', 'templates'),
  ],
})
