import { CollectionConfig } from 'payload'

export const Proposals: CollectionConfig = {
  slug: 'proposals',
  admin: {
    useAsTitle: 'businessName',
    defaultColumns: ['businessName', 'name', 'email', 'estimatedPrice', 'createdAt'],
  },
  access: {
    read: () => true, // Admins can read
    create: () => true, // Anyone can create a proposal via API
    update: ({ req: { user } }) => Boolean(user), // Only admins can update
    delete: ({ req: { user } }) => Boolean(user), // Only admins can delete
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
    },
    {
      name: 'businessName',
      type: 'text',
      required: true,
    },
    {
      name: 'estimatedPrice',
      type: 'number',
      admin: {
        description: 'The estimated price shown to the user at the time of submission',
      }
    },
    {
      name: 'configuration',
      type: 'json',
      admin: {
        description: 'The complete selected configuration JSON',
      }
    },
    {
      name: 'industry',
      type: 'text',
    },
  ],
}
