import { TwoColumn } from '@/blocks/TwoColumn'
import { Hero } from '@/blocks/Hero'
import { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  access: {
    read: ({ req }) => {
      console.log('Pages read access check:', req.user ? 'User present' : 'No user');
      return true;
    },
    create: () => true,
  },
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      defaultValue: 'New Page',
      required: true,
    },
    {
      name: 'slug',
      label: 'Slug',
    type: 'text',
      defaultValue: 'new-page',
      required: true,
    },
    {
      name: 'layout',
      label: 'Layout',
      type: 'blocks',
        blocks: [
          Hero,
          TwoColumn,
      ],
      },
  ],
}
