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
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                Accept:
                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-GB,en;q=0.9',
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                'Upgrade-Insecure-Requests': '1',
            },
        });

        const html = await response.text();
        const targetObj = new URL(targetUrl);

        // Prevent cross-origin SecurityError when scripts call replaceState/pushState
        // (especially important because the <base> tag changes how relative URLs resolve)
        const historyInterceptor = `
<script>
  (function() {
    const origReplace = history.replaceState;
    const origPush = history.pushState;

    function sanitizeUrl(url) {
      if (!url) return url;
      try {
        // Resolve against the <base> href if relative, or parse directly if absolute
        const resolved = new URL(url, document.baseURI);
        if (resolved.origin !== window.location.origin) {
          return '/api/proxy?url=' + encodeURIComponent(resolved.href);
        }
      } catch (e) {}
      return url;
    }

    history.replaceState = function(state, title, url) {
      return origReplace.call(this, state, title, sanitizeUrl(url));
    };

    history.pushState = function(state, title, url) {
      return origPush.call(this, state, title, sanitizeUrl(url));
    };
  })();
</script>`;

        // Match <head> even if it has attributes (e.g. <head class="...">)
        const modifiedHtml = html.replace(
            /<head[^>]*>/i,
            (match) => `${match}<base href="${targetObj.origin}/" />${historyInterceptor}`
        );

        return new NextResponse(modifiedHtml, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch target URL' }, { status: 500 });
    }
}