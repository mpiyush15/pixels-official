import type { GlobalConfig } from 'payload'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'headingWord1', type: 'text', required: true, defaultValue: 'Building' },
        { name: 'headingLine1Rest', type: 'text', required: true, defaultValue: ' Software,' },
        { name: 'headingLine2', type: 'text', required: true, defaultValue: 'AI Systems &' },
        { name: 'headingLine3', type: 'text', required: true, defaultValue: 'Digital Products' },
        { name: 'subheading', type: 'textarea', required: true, defaultValue: 'Building strong, scalable, and intelligent systems for the modern era.' },
        { 
          name: 'heroImage', 
          type: 'upload', 
          relationTo: 'media', 
          label: 'Hero Image',
        },
      ]
    },
    {
      name: 'brands',
      type: 'array',
      label: 'Brands Marquee',
      defaultValue: [
        { name: 'ATUT Tech' },
        { name: 'VAIBHAV BIOTECH' },
        { name: 'ABHANGG COTTON' },
        { name: 'PLANTS MALL' }
      ],
      fields: [
        { name: 'name', type: 'text', required: true }
      ]
    },
    {
      name: 'intro',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', required: true, defaultValue: 'WHO WE ARE' },
        { name: 'headingLine1', type: 'text', required: true, defaultValue: 'Engineering systems for ' },
        { name: 'headingHighlight', type: 'text', required: true, defaultValue: 'Growth.' },
        {
          name: 'paragraphs',
          type: 'array',
          defaultValue: [
            { text: 'Pixels Digital Solutions is a software engineering team that helps ambitious companies build products, automate operations, and scale faster.' },
            { text: 'We design and develop custom software, SaaS platforms, AI automation, and enterprise systems that solve real-world problems and unlock new avenues for growth.' },
            { text: 'By combining engineering excellence with business understanding, we build products that are scalable, secure, and ready for the future.' }
          ],
          fields: [
            { name: 'text', type: 'textarea', required: true }
          ]
        }
      ]
    },
    {
      name: 'solutions',
      type: 'group',
      fields: [
        { name: 'headingLine1', type: 'text', required: true, defaultValue: 'Solutions we ' },
        { name: 'headingHighlight', type: 'text', required: true, defaultValue: 'build.' },
        {
          name: 'cards',
          type: 'array',
          defaultValue: [
            { title: 'Custom Software\nDevelopment', description: 'Tailored systems built for your unique business workflows, internal operations and digital transformation initiatives', theme: 'white' },
            { title: 'E-commerce\nPlatforms', description: 'Scalable ecommerce ecosystems with payments, inventory management and third-party integrations', theme: 'yellow' },
            { title: 'API Integrations', description: 'Connect your software ecosystem through secure APIs, automation and seamless data synchronization', theme: 'white' },
            { title: 'SaaS Product\nDevelopment', description: 'Multi-tenant SaaS platforms engineered for scalability, subscriptions and long-term growth', theme: 'yellow' },
            { title: 'AI Agents &\nAutomation', description: 'Intelligent AI systems that automate operations, customer communication and repetitive workflows', theme: 'white' },
            { title: 'ERP & Business\nSystems', description: 'Enterprise platforms for managing finance, inventory, operations, HR and business processes', theme: 'yellow' },
            { title: 'WhatsApp & Communication\nSystems', description: 'Customer communication pipelines, automated notifications, and alert systems.', theme: 'white' },
            { title: 'Product Strategy &\nConsulting', description: 'From idea validation to architecture and launch, we help you succeed in building digital products.', theme: 'yellow' },
            { title: 'Mobile Application\nDevelopment', description: 'Cross-platform mobile applications designed for performance, scaling, and customer engagement.', theme: 'white' }
          ],
          fields: [
            { name: 'title', type: 'textarea', required: true, admin: { description: 'Use new lines (Enter) for line breaks.' } },
            { name: 'description', type: 'textarea', required: true },
            { 
              name: 'theme', 
              type: 'select', 
              options: [
                { label: 'White', value: 'white' },
                { label: 'Yellow', value: 'yellow' }
              ],
              defaultValue: 'white',
              required: true
            }
          ]
        }
      ]
    },
    {
      name: 'aiAutomation',
      type: 'group',
      fields: [
        { name: 'headingLine1', type: 'textarea', required: true, defaultValue: 'Artificial Intelligence &\nBusiness ' },
        { name: 'headingHighlight', type: 'text', required: true, defaultValue: 'Automation.' },
        { name: 'subheading', type: 'textarea', required: true, defaultValue: 'AI and machine learning tools that automate business workflows and processes.' },
        {
          name: 'cards',
          type: 'array',
          defaultValue: [
            { title: 'AI Agents &\nWorkflows', description: 'Intelligent systems that automate tasks, analyze data, and run business operations.', theme: 'white' },
            { title: 'Conversational AI\n& Chatbots', description: 'Build customer support systems and intelligent assistants that engage customers 24/7.', theme: 'dark' },
            { title: 'AI Enhanced\nApplications', description: 'Enhance digital experiences with recommendation engines, intelligent search, and personalization.', theme: 'white' }
          ],
          fields: [
            { name: 'title', type: 'textarea', required: true, admin: { description: 'Use new lines for line breaks.' } },
            { name: 'description', type: 'textarea', required: true },
            { 
              name: 'theme', 
              type: 'select', 
              options: [
                { label: 'White', value: 'white' },
                { label: 'Dark', value: 'dark' }
              ],
              defaultValue: 'white',
              required: true
            }
          ]
        }
      ]
    },
    {
      name: 'ourWork',
      type: 'group',
      fields: [
        { name: 'headingLine1', type: 'text', required: true, defaultValue: 'Our ' },
        { name: 'headingHighlight', type: 'text', required: true, defaultValue: 'Work.' },
        {
          name: 'projects',
          type: 'relationship',
          relationTo: 'case-studies',
          hasMany: true,
          admin: {
            description: 'Select case studies to feature on the home page.',
          },
        }
      ]
    }
  ],
}
