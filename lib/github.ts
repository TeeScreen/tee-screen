export async function createIssue({ title, body }: { title: string; body: string }) {
    const token = process.env.GITHUB_TOKEN!;
    const repo = process.env.GITHUB_REPO!;
    const owner = process.env.GITHUB_OWNER!;

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: "POST",
        headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`GitHub issue creation failed: ${text}`);
    }

    return res.json();
}