import { CollectionConfig } from 'payload';

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'The name of the service (e.g., Website Development)',
      }
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL slug (e.g., website-development)',
      }
    },
    {
      name: 'icon',
      type: 'text',
      required: true,
      admin: {
        description: 'The name of the Lucide icon to use on the Index Hub card (e.g., Code, Search, BarChart, PenTool)',
      }
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Short description for the Index Hub card',
      }
    },
    // --- DETAILS PAGE CONTENT ---
    {
      name: 'heroDescription',
      type: 'textarea',
      admin: {
        description: 'Long description for the top of the Details Page',
      }
    },
    {
      name: 'howWeWork',
      type: 'array',
      fields: [{ name: 'item', type: 'text' }],
      admin: { description: 'Quick stats for the right-hand card in Hero' }
    },
    {
      name: 'whoThisIsFor',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        { 
          name: 'color', 
          type: 'select', 
          options: [
            { label: 'Purple', value: 'bg-purple-400' },
            { label: 'Green', value: 'bg-emerald-400' },
            { label: 'Pink', value: 'bg-pink-300' }
          ],
          defaultValue: 'bg-purple-400'
        }
      ],
    },
    {
      name: 'whatWeHelpSolve',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true }
      ]
    },
    {
      name: 'whyUs',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true }
      ],
      admin: { description: 'The dark immersive card section' }
    },
    {
      name: 'builtForDelivery',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true }
      ]
    },
    {
      name: 'coreCapabilities',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true }
      ]
    },
    {
      name: 'deliverySteps',
      type: 'array',
      fields: [
        { name: 'stepNumber', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        { name: 'highlight', type: 'text', admin: { description: 'Small italicized text' } }
      ]
    },
    {
      name: 'faqs',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true }
      ]
    },
    {
      name: 'techStack',
      type: 'array',
      fields: [
        {
          name: 'technology',
          type: 'text',
          required: true,
        }
      ],
    },
    {
      name: 'relatedProjects',
      type: 'relationship',
      relationTo: 'case-studies',
      hasMany: true,
    }
  ],
};
