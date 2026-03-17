import 'dotenv/config'
import configPromise from './payload.config'
import { getPayload } from 'payload'

const run = async () => {
    console.log('Connecting to Payload...');
    try {
        const payload = await getPayload({ config: configPromise })
        console.log('Payload initialized. Querying pages...');
        const pages = await payload.find({
            collection: 'pages',
            limit: 1,
        })
        console.log('Pages found:', pages.totalDocs);
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

run();
