// app/sso-dev/page.tsx
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

const SSO_SECRET = process.env.PV_SSO_SECRET!;
const PARTNER_KEY = process.env.PV_PARTNER_KEY!;

export default function SSODEVPage() {
    async function runSSO(formData: FormData) {
        "use server";

        const clubId = formData.get("clubId") as string;

        if (!clubId) {
            throw new Error("Missing clubId");
        }

        const token = jwt.sign(
        {
            club_id: '2283',
                email: 'arthur@teescreen.co.uk',
            given_name: 'Arthur',
            family_name: 'Johnson',
        },
        SSO_SECRET,
            { algorithm: 'HS256', expiresIn: '5m' }
    );

        // Exchange token with partner API
        const exchange = await fetch("https://partner.pinvision.app/v1/auth/sso", {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                "x-partner-key": PARTNER_KEY,
            },
            body: JSON.stringify({ token }),
        });

        console.log(exchange);

        if (!exchange.ok) {
            throw new Error(`SSO exchange failed: ${exchange.status}`);
        }

        const { apikey } = await exchange.json();

        // Redirect user to PinVision login
        redirect(`https://pinvision.app/login/sso?apikey=${apikey}`);
    }

    return (
        <div style={{ padding: 40, fontFamily: "sans-serif" }}>
            <h1>PinVision SSO Dev Page</h1>

            <form action={runSSO} style={{ marginTop: 20 }}>
                <label>
                    Club ID:
                    <input
                        name="clubId"
                        type="text"
                        placeholder="Enter clubId"
                        style={{
                            marginLeft: 10,
                            padding: 6,
                            border: "1px solid #ccc",
                            borderRadius: 4,
                        }}
                    />
                </label>

                <button
                    type="submit"
                    style={{
                        marginTop: 20,
                        padding: "10px 20px",
                        background: "#333",
                        color: "#fff",
                        borderRadius: 6,
                        display: "block",
                    }}
                >
                    Run SSO
                </button>
            </form>
        </div>
    );
}
