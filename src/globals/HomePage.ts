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
        { name: 'headingLine1', type: 'text', required: true, defaultValue: 'Creating' },
        { 
          name: 'animatedLines', 
          type: 'array',
          defaultValue: [
            { gradientText: 'Exciting Solutions', trailingText: 'for Campaigns.' },
            { gradientText: 'Inspiring Solutions', trailingText: 'for Communities.' },
            { gradientText: 'Innovative Solutions', trailingText: 'for Products.' }
          ],
          fields: [
            { name: 'gradientText', type: 'text', required: true },
            { name: 'trailingText', type: 'text', required: true }
          ]
        },
        { 
          name: 'heroImage', 
          type: 'upload', 
          relationTo: 'media', 
          label: 'Hero Image',
          admin: { description: 'Upload a background image for the Hero section' } 
        },
        { name: 'subheading', type: 'textarea', required: true, defaultValue: 'Building strong, scalable, and intelligent systems for the modern era.' },
        {
          name: 'ctaButtons',
          type: 'array',
          label: 'Hero CTA Buttons',
          defaultValue: [
            { label: 'Talk to the team', url: '/contact', style: 'primary' },
            { label: 'View our work', url: '/portfolio', style: 'secondary' }
          ],
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
            { 
              name: 'style', 
              type: 'select', 
              options: [
                { label: 'Primary (Solid Purple)', value: 'primary' },
                { label: 'Secondary (Outline/Glass)', value: 'secondary' }
              ],
              defaultValue: 'primary',
              required: true
            }
          ]
        },
        {
          name: 'stats',
          type: 'array',
          defaultValue: [
            { value: '10+', label: 'Projects Delivered' },
            { value: '4+', label: 'Industries Served' },
            { value: '2', label: 'Products Built' }
          ],
          fields: [
            { name: 'value', type: 'text', required: true },
            { name: 'label', type: 'text', required: true }
          ]
        },
        {
          name: 'brands',
          type: 'array',
          defaultValue: [
            { name: 'VAIBHAV BIOTECH' },
            { name: 'REPLYSYS' },
            { name: 'MITRA' },
            { name: 'UCHAL PORTAL' },
            { name: 'PIXELS' }
          ],
          fields: [
            { name: 'name', type: 'text', required: true }
          ]
        }
      ]
    },
    {
      name: 'whatWeDo',
      type: 'group',
      fields: [
        { name: 'heading', type: 'textarea', required: true, defaultValue: 'Engineering solutions\nthat scale with your vision.' },
        { name: 'subheading', type: 'textarea', required: true, defaultValue: 'We combine modern technologies with deep domain understanding to build secure, scalable and future-ready digital systems.' },
        {
          name: 'cards',
          type: 'array',
          defaultValue: [
            { title: "Custom Software Development", description: "Tailored systems, web applications, ERPs and enterprise platforms.", iconName: "Box" },
            { title: "AI Agents & Automation", description: "Intelligent automation that streamlines operations and accelerates growth.", iconName: "BrainCircuit" },
            { title: "SaaS Product Development", description: "Multi-tenant SaaS platforms built for scalability, performance and growth.", iconName: "Monitor" },
            { title: "E-commerce Solutions", description: "End-to-end e-commerce systems with powerful integrations.", iconName: "ShoppingCart" }
          ],
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea', required: true },
            { name: 'iconName', type: 'text', required: true, admin: { description: 'Icon identifier like Box, BrainCircuit, Monitor, ShoppingCart' } }
          ]
        }
      ]
    },
    {
      name: 'howWeWork',
      type: 'group',
      fields: [
        { name: 'heading', type: 'textarea', required: true, defaultValue: 'Strategy. Design.\nDevelop. Deliver.' },
        {
          name: 'steps',
          type: 'array',
          defaultValue: [
            { stepNumber: "01", title: "Discover", description: "We understand your goals, challenges and opportunities.", iconName: "Search" },
            { stepNumber: "02", title: "Plan", description: "We design the right solution architecture and roadmap.", iconName: "PenTool" },
            { stepNumber: "03", title: "Build", description: "We engineer with clean code, modern tools and best practices.", iconName: "Code" },
            { stepNumber: "04", title: "Deliver", description: "We launch, support and scale as you grow.", iconName: "Rocket" }
          ],
          fields: [
            { name: 'stepNumber', type: 'text', required: true },
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea', required: true },
            { name: 'iconName', type: 'text', required: true }
          ]
        }
      ]
    },
    {
      name: 'featuredWork',
      type: 'group',
      fields: [
        { name: 'heading', type: 'textarea', required: true, defaultValue: 'Real projects.\nReal impact.' },
        {
          name: 'projects',
          type: 'relationship',
          relationTo: 'case-studies',
          hasMany: true,
          maxDepth: 2,
          admin: {
            description: 'Select up to 4 case studies to feature on the home page.',
          },
        }
      ]
    },
    {
      name: 'capabilities',
      type: 'group',
      fields: [
        { name: 'heading', type: 'textarea', required: true, defaultValue: 'Engineering software with\nbusiness understanding.' },
        { name: 'subheading', type: 'textarea', required: true, defaultValue: "We don't just write code. We build systems that solve real business problems with strategy, engineering and long-term vision." },
        {
          name: 'items',
          type: 'array',
          defaultValue: [
            { title: "ERP & Enterprise Systems", description: "Comprehensive platforms managing accounts, inventory, and operations." },
            { title: "SaaS Platforms", description: "Multi-tenant cloud applications built for scalability and performance." },
            { title: "AI & Automation", description: "Intelligent agents and workflows that accelerate business growth.", badge: "Beta", badgeColor: "bg-orange-100 text-orange-600" },
            { title: "Ecommerce Systems", description: "End-to-end scalable online stores with powerful integrations." },
            { title: "Government Portals", description: "Secure role-based management built for complex workflows." },
            { title: "Custom Software", description: "Tailored systems engineered specifically for your unique needs.", badge: "Strong Portfolio", badgeColor: "bg-green-100 text-green-700" }
          ],
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea', required: true },
            { name: 'badge', type: 'text' },
            { name: 'badgeColor', type: 'text' }
          ]
        }
      ]
    },
    {
      name: 'cta',
      type: 'group',
      fields: [
        { name: 'heading', type: 'textarea', required: true, defaultValue: "Let's build something\nmeaningful together." },
        { name: 'subheading', type: 'textarea', required: true, defaultValue: "Have an idea or project in mind? Let's discuss how we can help you build, automate and scale." }
      ]
    }
  ],
}
