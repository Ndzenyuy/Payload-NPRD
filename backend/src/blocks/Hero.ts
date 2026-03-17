import { Block } from "payload";

export const Hero: Block = {
    slug: 'hero',
    labels: {
        singular: 'Hero Block',
        plural: 'Hero Blocks',
    },
    fields: [
        {
            name: 'title',
            label: 'Title',
            type: 'text',
        },
        {
            name: 'text',
            label: 'Text',
            type: 'textarea',
        },
        {
            name: 'primaryButtonLabel',
            label: 'Primary Button Label',
            type: 'text',
        },
        {
            name: 'secondaryButtonLabel',
            label: 'Secondary Button Label',
            type: 'text',
        },
        {
            name: 'backgroundImage',
            label: 'Background Image',
            type: 'upload',
            relationTo: 'media',
        },
    ],
}
