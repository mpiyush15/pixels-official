import type { CollectionConfig } from 'payload'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true, // Anyone can read case studies on the frontend
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Used for the URL (e.g., my-awesome-project)',
      }
    },
    {
      name: 'client',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'text',
    },
    {
      name: 'heroTitle',
      type: 'text',
      required: true,
      admin: {
        description: 'Large bold headline for the case study (e.g., "Helping legal teams get back to what matters.")',
      }
    },
    {
      name: 'services',
      type: 'array',
      fields: [
        {
          name: 'service',
          type: 'text',
        }
      ],
      admin: {
        description: 'List of services provided (e.g., Branding, Art Direction)',
      }
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Grid Thumbnail',
      admin: {
        description: 'This is the image that will appear in the grid on the Home Page and Portfolio page.',
      }
    },
    {
      name: 'brief',
      type: 'richText',
    },
    {
      name: 'challenge',
      type: 'richText',
    },
    {
      name: 'solution',
      type: 'richText',
    },
    {
      name: 'gallery',
      type: 'array',
      admin: {
        description: 'Gallery for The Challenge section'
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        }
      ]
    },
    {
      name: 'solutionGallery',
      type: 'array',
      admin: {
        description: 'Gallery for The Solution section'
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        }
      ]
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        description: 'Legacy content field / Additional rich text',
      }
    },
    {
      name: 'videoSection',
      type: 'group',
      fields: [
        { name: 'showVideo', type: 'checkbox', defaultValue: false, admin: { description: 'Toggle to show or hide the video section' } },
        { name: 'heading', type: 'text', defaultValue: 'Project Walkthrough' },
        { name: 'videoUrl', type: 'text', admin: { description: 'Direct URL to a video file (e.g. MP4 on S3 or external hosting). Not for YouTube links.' } },
        { name: 'videoMedia', type: 'upload', relationTo: 'media', admin: { description: 'Or upload a video directly' } },
        { name: 'posterImage', type: 'upload', relationTo: 'media', admin: { description: 'Optional thumbnail image for the video player' } }
      ]
    },
  ],
}
