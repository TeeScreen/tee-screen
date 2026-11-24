"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function GlobalError({
                                        error,
                                        reset,
                                    }: GlobalErrorProps) {
    useEffect(() => {
        console.error("Global application error:", error);
    }, [error]);

    return (
        <html lang="en">
        <body
            style={{
                margin: 0,
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily:
                    "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                backgroundColor: "#f8fafc",
                color: "#0f172a",
                padding: "2rem",
            }}
        >
        <div
            style={{
                width: "100%",
                maxWidth: "500px",
                background: "#ffffff",
                borderRadius: "12px",
                padding: "2rem",
                boxShadow:
                    "0 1px 3px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.08)",
                textAlign: "center",
            }}
        >
            <h1
                style={{
                    margin: 0,
                    marginBottom: "1rem",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                }}
            >
                Something went wrong
            </h1>

            <p
                style={{
                    marginBottom: "1.5rem",
                    color: "#475569",
                    lineHeight: 1.5,
                }}
            >
                An unexpected error occurred. Please try again.
            </p>

            {process.env.NODE_ENV !== "production" && (
                <pre
                    style={{
                        textAlign: "left",
                        overflowX: "auto",
                        background: "#f1f5f9",
                        padding: "1rem",
                        borderRadius: "8px",
                        marginBottom: "1rem",
                        fontSize: "0.875rem",
                    }}
                >
                            {error?.message}
                        </pre>
            )}

            <button
                onClick={reset}
                type="button"
                style={{
                    padding: "0.75rem 1.25rem",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontWeight: 600,
                }}
            >
                Try Again
            </button>
        </div>
        </body>
        </html>
    );
}