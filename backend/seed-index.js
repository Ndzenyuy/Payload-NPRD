
async function seedIndex() {
    try {
        console.log('Checking for index page...');
        const checkRes = await fetch('http://localhost:3000/api/pages?where[slug][equals]=index');
        const checkData = await checkRes.json();
        
        if (checkData.totalDocs > 0) {
            console.log('Index page already exists.');
            return;
        }

        console.log('Creating index page...');
        const createRes = await fetch('http://localhost:3000/api/pages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Home Page',
                slug: 'index',
                layout: [
                    {
                        blockType: 'hero',
                        title: 'Welcome to the Home Page',
                    }
                ]
            })
        });

        if (!createRes.ok) {
            const errorText = await createRes.text();
            throw new Error(`Failed to create page: ${createRes.status} ${errorText}`);
        }

        console.log('Index page created successfully.');

    } catch (error) {
        console.error('Error seeding index page:', error.message);
    }
}

seedIndex();
