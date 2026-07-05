import { defineCollection, z } from "astro:content";

const services = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    price: z.number(),
    duration: z.number(),
    category: z.string(),
    order: z.number(),
    image: z.string().optional(),
    description: z.string().optional(),
    benefits: z.array(z.string()).optional(),
  }),
});

const team = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    title: z.string(),
    order: z.number(),
    image: z.string().optional(),
    qualifications: z.array(z.string()).optional(),
    specialties: z.array(z.string()).optional(),
    bio: z.string().optional(),
  }),
});

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    author: z.string(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const gallery = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    category: z.string(),
    image: z.string().optional(),
    before: z.string().optional(),
    after: z.string().optional(),
    description: z.string().optional(),
    featured: z.boolean().optional(),
    order: z.number().optional(),
  }),
});

export const collections = { services, team, blog, gallery };
