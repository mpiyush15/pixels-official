import { GlobalConfig } from 'payload'

export const PricingPage: GlobalConfig = {
  slug: 'pricing-page',
  access: {
    read: () => true, // Anyone can read (frontend needs this)
    update: ({ req: { user } }) => Boolean(user), // Only admins can update
  },
  fields: [

    {
      name: 'plannerSettings',
      type: 'group',
      label: 'Growth Planner (Custom Plan) Settings',
      fields: [
        {
          name: 'goals',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'value', type: 'text', required: true },
            { name: 'basePrice', type: 'number', required: true, defaultValue: 0 },
          ],
        },
        {
          name: 'platforms',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'value', type: 'text', required: true },
            { name: 'cost', type: 'number', required: true, defaultValue: 0 },
          ],
        },
        {
          name: 'contentTypes',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'value', type: 'text', required: true },
            { name: 'cost', type: 'number', required: true, defaultValue: 0 },
          ],
        },
        {
          name: 'industryTemplates',
          type: 'array',
          label: 'AI Industry Recommendations',
          fields: [
            { name: 'industryName', type: 'text', required: true },
            { name: 'recommendedFeatures', type: 'array', fields: [{ name: 'feature', type: 'text' }] },
            { name: 'basePrice', type: 'number', required: true },
          ]
        }
      ],
    }
  ],
}
