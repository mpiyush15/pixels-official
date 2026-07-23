import type { GlobalConfig } from 'payload'

export const Navbar: GlobalConfig = {
  slug: 'navbar',
  access: {
    read: () => true, // Anyone can read the navbar data
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Upload the logo for the navigation bar (transparent PNG recommended).',
      },
    },
    {
      name: 'links',
      type: 'array',
      admin: {
        description: 'Navigation links displayed in the center of the navbar.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            description: 'URL (e.g. /services or https://google.com)',
          },
        },
      ],
    },
    {
      name: 'ctaButton',
      type: 'group',
      admin: {
        description: 'Call to action button settings.',
      },
      fields: [
        {
          name: 'showButton',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Toggle to show or hide the call-to-action button.',
          },
        },
        {
          name: 'label',
          type: 'text',
          defaultValue: 'Talk to us',
        },
        {
          name: 'url',
          type: 'text',
          defaultValue: '/contact',
        },
      ],
    },
  ],
}
