"use client";

export default function GlobalError({
                                        error,
                                        reset,
                                    }: {
    error: Error;
    reset: () => void;
}) {
    return (
        <div style={{ padding: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                Something went wrong
            </h1>

            <p>{error?.message}</p>

            <button
                onClick={() => reset()}
                style={{
                    marginTop: "1rem",
                    padding: "0.5rem 1rem",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    cursor: "pointer",
                }}
            >
                Try again
            </button>
        </div>
    );
}