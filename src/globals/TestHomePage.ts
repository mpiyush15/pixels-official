import { GlobalConfig } from 'payload'

export const TestHomePage: GlobalConfig = {
  slug: 'test-home-page',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            {
              name: 'heroPrefix',
              type: 'text',
              defaultValue: 'Creating',
            },
            {
              name: 'heroRotatingAdjectives',
              type: 'array',
              fields: [{ name: 'word', type: 'text' }],
              defaultValue: [
                { word: 'Intelligent Solutions' },
                { word: 'Effective Solutions' },
                { word: 'Exciting Solutions' },
                { word: 'Inspiring Solutions' },
                { word: 'Innovative Solutions' },
                { word: 'Successful Solutions' },
              ],
            },
            {
              name: 'heroSuffix',
              type: 'text',
              defaultValue: 'for',
            },
            {
              name: 'heroRotatingNouns',
              type: 'array',
              fields: [{ name: 'word', type: 'text' }],
              defaultValue: [
                { word: 'Brands.' },
                { word: 'Startups.' },
                { word: 'Campaigns.' },
                { word: 'Communities.' },
                { word: 'Products.' },
                { word: 'Businesses.' },
              ],
            },
            {
              name: 'heroVideo',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Intro',
          fields: [
            {
              name: 'introLabel',
              type: 'text',
              defaultValue: 'What we do',
            },
            {
              name: 'introTitle',
              type: 'text',
              defaultValue: 'Experts in growth.',
            },
            {
              name: 'introDescription',
              type: 'richText',
            },
          ],
        },
        {
          label: 'Services Cards',
          fields: [
            {
              name: 'servicesCards',
              type: 'array',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                },
                {
                  name: 'description',
                  type: 'richText',
                },
                {
                  name: 'backgroundColor',
                  type: 'select',
                  options: [
                    { label: 'Purple', value: '#F2E8FF' },
                    { label: 'Pink', value: '#FFE3EE' },
                    { label: 'Orange', value: '#FFE6D9' },
                    { label: 'Teal', value: '#E3F8F8' },
                  ],
                  defaultValue: '#F2E8FF',
                },
                {
                  name: 'icon',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'link',
                  type: 'text',
                  defaultValue: '/services',
                }
              ],
            },
          ],
        },
        {
          label: 'Logos',
          fields: [
            {
              name: 'logosTitle',
              type: 'text',
              defaultValue: 'Trusted by industry leaders nationwide.',
            },
            {
              name: 'logos',
              type: 'array',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
