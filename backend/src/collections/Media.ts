import type { CollectionConfig } from 'payload'
 
export const Media: CollectionConfig = {

  slug: 'media',
 
  access: {

    read: () => true,

    create: () => true,

    update: () => true,

    delete: () => true,

  },
 
  upload: true, // ✅ keep file upload support
 
  fields: [

    {

      name: 'alt',

      type: 'text',

      required: true,

    },

    {

      name: 'imageUrl',

      type: 'text',

      admin: {

        description: 'Optional: Paste an S3 or external image URL',

      },

    },

  ],
 
  hooks: {

    beforeChange: [

      async ({ data, req }) => {

        // ✅ If a file is uploaded → do nothing

        if (req.file) {

          return data

        }
 
        // ✅ If imageUrl is provided → fetch and convert to file

        if (data?.imageUrl) {

          try {

            const res = await fetch(data.imageUrl)
 
            if (!res.ok) {

              throw new Error(`Failed to fetch image: ${res.status}`)

            }
 
            const buffer = await res.arrayBuffer()

            const contentType =

              res.headers.get('content-type') || 'image/jpeg'
 
            // Optional: only allow images

            if (!contentType.startsWith('image/')) {

              throw new Error('URL must point to an image')

            }
 
            return {

              ...data,

              file: {

                data: Buffer.from(buffer),

                mimetype: contentType,

                name:

                  data.imageUrl.split('/').pop() ||

                  `imported-${Date.now()}`,

              },

            }

          } catch (err) {

            console.error('Image import failed:', err)

            throw new Error('Could not import image from URL')

          }

        }
 
        return data

      },

    ],

  },

}
 