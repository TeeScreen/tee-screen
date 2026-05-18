'use client';

import { useState } from 'react';

interface MotionEvent {
    id: number;
    timestamp: string;
    imageUrl: string;
}

const STATIC_EVENTS: MotionEvent[] = [
    { id: 1, timestamp: '11:30 AM', imageUrl: '/assets/demo/snapshot-1.png' },
    { id: 2, timestamp: '11:42 AM', imageUrl: '/assets/demo/snapshot-2.png' },
    { id: 3, timestamp: '01:24 PM', imageUrl: '/assets/demo/snapshot-3.png' },
];

export default function DemoCameraPage() {
    const [step, setStep] = useState<'idle' | 'password' | 'connecting' | 'connected'>('idle');
    const [password, setPassword] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<MotionEvent | null>(null);

    const handleConnectClick = () => {
        setStep('password');
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'teescreencamera') {
            setStep('connecting');
            setTimeout(() => setStep('connected'), 2500);
        } else {
            alert('Incorrect password');
        }
    };

    return (
        <div style={{ fontFamily: 'system-ui', padding: 20 }}>
            <h1 style={{ marginBottom: 16 }}>Demo Camera - Sturminster</h1>

            {step === 'idle' && (
                <button
                    onClick={handleConnectClick}
                    style={{
                        padding: '10px 18px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#4f46e5',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    Connect to Camera
                </button>
            )}

            {step === 'password' && (
                <form
                    onSubmit={handlePasswordSubmit}
                    style={{
                        padding: 20,
                        borderRadius: 12,
                        background: '#1a1a1d',
                        color: '#fff',
                        maxWidth: 400,
                    }}
                >
                    <label style={{ display: 'block', marginBottom: 8 }}>Enter Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: 6,
                            border: '1px solid #444',
                            marginBottom: 12,
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '8px 16px',
                            borderRadius: 6,
                            border: 'none',
                            background: '#4f46e5',
                            color: '#fff',
                            cursor: 'pointer',
                        }}
                    >
                        Submit
                    </button>
                </form>
            )}

            {step === 'connecting' && (
                <div
                    style={{
                        padding: 20,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #1a1a1d, #2a2a2e)',
                        color: '#fff',
                        textAlign: 'center',
                        maxWidth: 400,
                    }}
                >
                    <p style={{ fontSize: 16, marginBottom: 8 }}>Connecting to camera…</p>
                    <div
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: '#4f46e5',
                            margin: '0 auto',
                            animation: 'pulse 1s infinite',
                        }}
                    />
                    <style>{`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.5); opacity: 0.5; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
                </div>
            )}

            {step === 'connected' && (
                <div style={{ display: 'flex', gap: 20 }}>
                    {/* Video */}
                    <div style={{ flex: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span
                  style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: '#16a34a',
                      animation: 'blink 1s infinite',
                  }}
              />
                            <strong style={{ color: '#16a34a' }}>Live</strong>
                        </div>
                        <video
                            src="/assets/demo/demo-video.mp4"
                            autoPlay
                            playsInline
                            muted
                            loop
                            style={{
                                width: '100%',
                                aspectRatio: '16/9',
                                background: '#000',
                                borderRadius: 8,
                            }}
                        />
                        <style>{`
              @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
              }
            `}</style>
                    </div>

                    {/* Alerts */}
                    <div style={{ flex: 1 }}>
                        <h2 style={{ marginBottom: 12 }}>Motion Alerts</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {STATIC_EVENTS.map((event) => (
                                <button
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 8,
                                        borderRadius: 6,
                                        border: '1px solid #ddd',
                                        background: '#fafafa',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            background: '#dc2626',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            marginRight: 10,
                                        }}
                                    >
                                        !
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'left' }}>
                                        <strong>Motion detected</strong>
                                        <div style={{ fontSize: 13, color: '#555' }}>{event.timestamp}</div>
                                    </div>
                                    <img
                                        src={event.imageUrl}
                                        alt="Motion snapshot"
                                        style={{
                                            width: 80,
                                            height: 60,
                                            objectFit: 'cover',
                                            borderRadius: 4,
                                            marginLeft: 10,
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Popup */}
            {selectedEvent && (
                <div
                    onClick={() => setSelectedEvent(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            background: '#fff',
                            padding: 20,
                            borderRadius: 8,
                            maxWidth: '90%',
                            maxHeight: '90%',
                        }}
                    >
                        <h3 style={{ marginTop: 0 }}>Motion at {selectedEvent.timestamp}</h3>
                        <img
                            src={selectedEvent.imageUrl}
                            alt="Motion snapshot"
                            style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 6 }}
                        />
                        <div style={{ marginTop: 12, textAlign: 'right' }}>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    border: 'none',
                                    background: '#4f46e5',
                                    color: '#fff',
                                    cursor: 'pointer',
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
