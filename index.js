export default async function handler(request) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    // Validate if URL parameter exists
    if (!targetUrl) {
        return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
            status: 400,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    try {
        // Fetch the actual target URL
        const response = await fetch(targetUrl, {
            redirect: 'follow', // Automatically follows 301/302 redirects
            headers: {
                // Mimic a standard browser to prevent blocking from file hosts
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': targetUrl
            }
        });

        // Get the final URL after any redirects (This is what your frontend expects as 'redirectUrl')
        const finalRedirectUrl = response.url;

        // Return the extracted redirect URL to your frontend
        return new Response(JSON.stringify({ 
            redirectUrl: finalRedirectUrl 
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch target URL', 
            details: error.message 
        }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
