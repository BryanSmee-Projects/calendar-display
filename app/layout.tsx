import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "OpenCal Viewer",
    description: "A modern calendar viewer",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
