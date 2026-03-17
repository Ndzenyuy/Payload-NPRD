import { Block } from 'payload'

export const TwoColumn: Block = {
  slug: 'two-column',
  labels: {
    singular: 'Two Column Block',
    plural: 'Two Column Blocks',
  },
  fields: [
    {
      name: 'heading',
      label: 'Heading',
      type: 'text',
    },
    {
      name: 'text',
      label: 'Text',
      type: 'textarea',
    },
    {
      name: 'image',
      label: 'Image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Reverse', value: 'reverse' },
      ],
    },
  ],
}
