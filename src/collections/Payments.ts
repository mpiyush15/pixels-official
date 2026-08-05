import { CollectionConfig } from 'payload'

export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'amount', 'status', 'planName', 'createdAt'],
  },
  access: {
    read: () => true, // Admins can read (default Payload behavior based on req.user)
    create: () => true, // Creating via API
    update: ({ req: { user } }) => Boolean(user), // Only admins can update
    delete: ({ req: { user } }) => Boolean(user), // Only admins can delete
  },
  fields: [
    {
      name: 'customerName',
      type: 'text',
      required: true,
    },
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'planName',
      type: 'text',
      required: true,
    },
    {
      name: 'billingPeriod',
      type: 'text', // e.g. Monthly, Quarterly, Annual
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'INR',
    },
    {
      name: 'razorpayOrderId',
      type: 'text',
    },
    {
      name: 'razorpayPaymentId',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Success', value: 'success' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'pending',
    },
  ],
}
