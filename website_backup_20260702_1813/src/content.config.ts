import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    year: z.string(),
    link: z.url().optional(),
    featured: z.boolean().default(false),
    image: z.string().optional(),
  }),
})

export const collections = { projects }
