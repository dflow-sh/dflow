import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMarkdown } from '@content-collections/markdown'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { z } from "zod"

const introduction = defineCollection({
  name: 'introduction',
  directory: 'src/docs/introduction',
  include: ['*.md', '*.mdx'],
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

const servers = defineCollection({
  name: 'servers',
  directory: 'src/docs/servers',
  include: '**/*.md',
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

const onboarding = defineCollection({
  name: 'onboarding',
  directory: 'src/docs/onboarding',
  include: '**/*.md',
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

const services = defineCollection({
  name: 'services',
  directory: 'src/docs/services',
  include: '**/*.md',
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

const security = defineCollection({
  name: 'security',
  directory: 'src/docs/security',
  include: '**/*.md',
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

const templates = defineCollection({
  name: 'templates',
  directory: 'src/docs/templates',
  include: '**/*.md',
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
    introduction,
    servers,
    onboarding,
    services,
    security,
    templates,
  ],
})
