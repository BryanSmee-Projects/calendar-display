import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const urlParam = searchParams.get('url');
    const idParam = searchParams.get('id');

    let targetUrl = urlParam;

    if (idParam) {
        const envVarName = `CALENDAR_${idParam.toUpperCase()}_URL`;
        let envUrl = process.env[envVarName];

        if (!envUrl && process.env.CALENDAR_SOURCES) {
            try {
                const sources = JSON.parse(process.env.CALENDAR_SOURCES);
                const source = sources.find((s: any) => s.id === idParam);
                if (source) {
                    envUrl = source.url;
                }
            } catch (e) {
                console.error('Failed to parse CALENDAR_SOURCES', e);
            }
        }

        if (envUrl) {
            targetUrl = envUrl;
        }
    }

    if (!targetUrl) {
        return NextResponse.json({ error: 'Missing url or id parameter' }, { status: 400 });
    }

    try {
        const response = await fetch(targetUrl);
        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch calendar: ${response.statusText}` }, { status: response.status });
        }

        const text = await response.text();
        return new NextResponse(text, {
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.error('Error fetching calendar:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
