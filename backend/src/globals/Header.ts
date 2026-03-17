import { GlobalConfig } from 'payload'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        {
            name: 'label',
            type: 'text',
            required: true,
        },
        {
            name: 'type',
            type: 'radio',
            options: [
                { label: 'Internal', value: 'reference' },
                { label: 'External', value: 'custom' },
            ],
            defaultValue: 'reference',
        },
        {
            name: 'reference',
            type: 'relationship',
            relationTo: 'pages',
            admin: {
                condition: (_, { type }) => type === 'reference',
            },
        },
        {
            name: 'url',
            type: 'text',
            admin: {
                condition: (_, { type }) => type === 'custom',
            },
        },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
  ],
}
