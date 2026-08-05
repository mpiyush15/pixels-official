import { CollectionConfig } from 'payload'

export const FeatureCategories: CollectionConfig = {
  slug: 'feature-categories',
  admin: {
    useAsTitle: 'title',
    group: 'Pricing Matrix',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Category Title (e.g. MARKETING)',
    },
    {
      name: 'order',
      type: 'number',
      label: 'Display Order',
      defaultValue: 0,
      admin: {
        description: 'Lower numbers appear first',
      },
    },
  ],
}
