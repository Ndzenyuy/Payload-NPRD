import axios from 'axios';
import { RenderBlocks } from '@/utils/RenderBlocks'
import React from 'react'
import Navbar from '@/blocks/navbar'

export default function Page({page, header}) {
    if (!page) {
        return (
            <div className="container">
                <h1>Page not found</h1>
                <p>Could not load page data. Please check the backend connection and logs.</p>
            </div>
        )
    }

    return (
      <div>
        <Navbar {...header} />
        <main>
            <RenderBlocks layout={page?.layout || []} />
        </main>
      </div>
    );
}

// Server-side: use PAYLOAD_API_URL in Docker (backend:3001); fallback for local dev
function getPayloadUrl() {
    return process.env.PAYLOAD_API_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || '';
}

export async function getStaticPaths() {
    const payloadUrl = getPayloadUrl();
    console.log('Fetching paths from:', payloadUrl);
    try {
        const pageReq = await axios(
          `${payloadUrl}/api/pages?limit=100&depth=1`,
        );
        const pageData = pageReq.data;

        const paths = pageData.docs.map(({ slug, id }) => ({
            params: {
                slug: slug !== 'index' ? slug.split('/') : [],
            },
        }))

        return {
            paths,
            fallback: 'blocking',
        }
    } catch (error) {
        console.error('Error fetching paths:', error.message, error.response?.status);
        return {
            paths: [],
            fallback: 'blocking',
        }
    }
}

export async function getStaticProps({params}) {
    const slug = params?.slug ? params.slug.join('/') : 'index';
    const payloadUrl = getPayloadUrl();

    try {
        // fetch page
        const pageReq = await axios(
          `${payloadUrl}/api/pages?where[slug][equals]=${slug}&limit=1&depth=10`,
        );
        const pageData = pageReq.data.docs[0];

        // fetch header
        const headerReq = await axios(
          `${payloadUrl}/api/globals/header?depth=2`,
        );
        const headerData = headerReq.data;

        return {
          props: {
            page: pageData || null,
            header: headerData || null, 
          },
        revalidate: 300, // 5min ISR

        };
    } catch (error) {
        console.error('Error in getStaticProps:', error.message, error.response?.status);
        return {
            props: {
                page: null,
                header: null,
            },
            revalidate: 60, // Retry sooner on error
        }
    }
}


// export async function getStaticProps (ctx) { 
//     const slug = ctx.params?.slug || 'index';
//     const preview = ctx.preview || false;

//     // fetch page
//     const pageReq = await axios(`api/pages?where[slug][equals]=${slug}`);
//     const pageData = pageReq.data.docs[0];

//     return {
//         props: {
//             page: pageData,
//         },
//     }
// }