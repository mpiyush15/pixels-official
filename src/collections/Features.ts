import { CollectionConfig } from 'payload'

export const Features: CollectionConfig = {
  slug: 'features',
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
      label: 'Feature Title (e.g. Meta Ads)',
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Icon (Emoji or name)',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Short Description',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'feature-categories',
      required: true,
      label: 'Feature Category',
    },
    {
      name: 'order',
      type: 'number',
      label: 'Display Order',
      defaultValue: 0,
    },
  ],
}
