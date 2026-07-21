import { GlobalConfig } from 'payload';

export const ServicesPage: GlobalConfig = {
  slug: 'services-page',
  admin: {
    group: 'Pages',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { 
          name: 'title', 
          type: 'text', 
          required: true, 
          defaultValue: 'Our Services',
          admin: { description: 'Wrap text in *asterisks* to highlight it in purple (e.g. We are innovating *Exciting Solutions* for Campaigns)' }
        },
        { name: 'subtitle', type: 'textarea', required: true, defaultValue: 'Comprehensive digital solutions to help your business thrive online' },
        { name: 'heroImage', type: 'upload', relationTo: 'media', admin: { description: 'Large hero image shown at the top of the page' } }
      ]
    },
    {
      name: 'serviceCategories',
      type: 'array',
      admin: {
        description: 'Categories to group services on the main Services Hub page',
      },
      fields: [
        { 
          name: 'categoryName', 
          type: 'text', 
          required: true, 
          admin: { description: 'e.g., Development & Technology' } 
        },
        {
          name: 'services',
          type: 'relationship',
          relationTo: 'services',
          hasMany: true,
          required: true,
          admin: {
            description: 'Select the services to display under this category',
          }
        }
      ]
    },
    {
      name: 'pricingPlans',
      type: 'array',
      admin: {
        description: 'Pricing plans displayed at the bottom of the page',
      },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'price', type: 'number', required: true },
        { name: 'duration', type: 'text', defaultValue: 'month' },
        { name: 'description', type: 'textarea' },
        { name: 'popular', type: 'checkbox', defaultValue: false, label: 'Highlight as Popular' },
        {
          name: 'features',
          type: 'array',
          fields: [
            { name: 'feature', type: 'text', required: true }
          ]
        }
      ]
    }
  ]
};
