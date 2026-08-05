import { GlobalConfig } from 'payload'

export const PaymentSettings: GlobalConfig = {
  slug: 'payment-settings',
  access: {
    read: ({ req: { user } }) => Boolean(user), // Only admins can read (Prevents frontend leak)
    update: ({ req: { user } }) => Boolean(user), // Only admins can update
  },
  fields: [
    {
      name: 'razorpayKeyId',
      type: 'text',
      required: true,
      label: 'Razorpay Key ID',
    },
    {
      name: 'razorpayKeySecret',
      type: 'text',
      required: true,
      label: 'Razorpay Key Secret',
      admin: {
        description: 'Keep this secret. It will not be exposed to the frontend.',
      },
    },
  ],
}
