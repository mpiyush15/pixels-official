import { CollectionConfig } from 'payload'

export const Plans: CollectionConfig = {
  slug: 'plans',
  admin: {
    useAsTitle: 'name',
    group: 'Pricing Matrix',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Plan Name',
    },
    {
      name: 'description',
      type: 'text',
      label: 'Short Description',
    },
    {
      name: 'isRecommended',
      type: 'checkbox',
      label: 'Highlight as Recommended',
      defaultValue: false,
    },
    {
      type: 'row',
      fields: [
        { name: 'monthlyPrice', type: 'number', required: true },
        { name: 'quarterlyPrice', type: 'number', required: true },
        { name: 'annualPrice', type: 'number', required: true },
      ]
    },
    {
      name: 'planFeatures',
      type: 'array',
      label: 'Features included in this Plan',
      fields: [
        {
          name: 'feature',
          type: 'relationship',
          relationTo: 'features',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          label: 'Value (e.g. 8, Yes, Included, —)',
          defaultValue: 'Yes',
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      label: 'Display Order',
      defaultValue: 0,
    },
  ],
}
