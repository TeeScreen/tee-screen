import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json({ error: 'Missing target URL' }, { status: 400 });
    }

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
        });

        const html = await response.text();
        const targetObj = new URL(targetUrl);

        // Inject a <base> tag so relative paths resolve to the real domain
        const modifiedHtml = html.replace(
            '<head>',
            `<head><base href="${targetObj.origin}/" />`
        );

        return new NextResponse(modifiedHtml, {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch target URL' }, { status: 500 });
    }
}