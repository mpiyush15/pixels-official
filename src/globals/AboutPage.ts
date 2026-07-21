import { GlobalConfig } from 'payload'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero Section',
          fields: [
            {
              name: 'heroHeadline1',
              type: 'text',
              required: true,
              defaultValue: 'Our mission is to be the world\'s most',
            },
            {
              name: 'heroHighlight',
              type: 'text',
              required: true,
              defaultValue: 'innovative',
            },
            {
              name: 'heroHeadline2',
              type: 'text',
              required: true,
              defaultValue: 'digital agency.',
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
          ],
        },
        {
          label: 'Our Approach',
          fields: [
            {
              name: 'approachTitle1',
              type: 'text',
              defaultValue: 'What',
            },
            {
              name: 'approachHighlight',
              type: 'text',
              defaultValue: 'innovative',
            },
            {
              name: 'approachTitle2',
              type: 'text',
              defaultValue: 'means.',
            },
            {
              name: 'approachText',
              type: 'richText',
            },
          ],
        },
        {
          label: 'Differentiation',
          fields: [
            {
              name: 'differentTitle1',
              type: 'text',
              defaultValue: 'What makes us',
            },
            {
              name: 'differentHighlight',
              type: 'text',
              defaultValue: 'different.',
            },
            {
              name: 'differentCards',
              type: 'array',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'richText',
                },
                {
                  name: 'icon',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'color',
                  type: 'select',
                  options: [
                    { label: 'Purple', value: '#d8b4fe' },
                    { label: 'Teal', value: '#6ee7b7' },
                    { label: 'Pink', value: '#f9a8d4' },
                    { label: 'Orange', value: '#fdba74' },
                  ],
                  defaultValue: '#d8b4fe',
                },
              ],
            },
          ],
        },
        {
          label: 'Delivery',
          fields: [
            {
              name: 'deliverTitle1',
              type: 'text',
              defaultValue: 'How we',
            },
            {
              name: 'deliverHighlight',
              type: 'text',
              defaultValue: 'deliver.',
            },
            {
              name: 'deliverCards',
              type: 'array',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'richText',
                },
                {
                  name: 'icon',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'color',
                  type: 'select',
                  options: [
                    { label: 'Purple', value: '#d8b4fe' },
                    { label: 'Teal', value: '#6ee7b7' },
                    { label: 'Pink', value: '#f9a8d4' },
                    { label: 'Orange', value: '#fdba74' },
                  ],
                  defaultValue: '#d8b4fe',
                },
              ],
            },
            {
              name: 'deliverWideCard',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Custom Development',
                },
                {
                  name: 'description',
                  type: 'richText',
                },
                {
                  name: 'icon',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'color',
                  type: 'select',
                  options: [
                    { label: 'Purple', value: '#d8b4fe' },
                    { label: 'Teal', value: '#6ee7b7' },
                    { label: 'Pink', value: '#f9a8d4' },
                    { label: 'Orange', value: '#fdba74' },
                  ],
                  defaultValue: '#f9a8d4',
                },
              ],
            }
          ],
        },
      ],
    },
  ],
}
