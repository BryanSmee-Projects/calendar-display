import App from "../App";
import { CalendarSource } from "../types";

export const dynamic = 'force-dynamic';

export default function Home() {
    let initialSources: CalendarSource[] | undefined;
    let initialProxyUrl: string | undefined;

    if (process.env.CALENDAR_SOURCES) {
        console.log("Found CALENDAR_SOURCES env var:", process.env.CALENDAR_SOURCES);
        try {
            const parsedSources = JSON.parse(process.env.CALENDAR_SOURCES);
            // Sanitize sources: remove URL to prevent exposure to client
            initialSources = parsedSources.map((s: CalendarSource) => ({
                ...s,
                url: '' // Clear URL, client will use ID to fetch via API
            }));
            console.log("Parsed and sanitized initialSources:", initialSources);
        } catch (e) {
            console.error("Failed to parse CALENDAR_SOURCES env var", e);
        }
    } else {
        console.log("CALENDAR_SOURCES env var NOT found");
    }

    if (process.env.PROXY_URL) {
        initialProxyUrl = process.env.PROXY_URL;
    }

    return <App initialSources={initialSources} initialProxyUrl={initialProxyUrl} />;
}
