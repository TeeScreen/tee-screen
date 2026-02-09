import { NextResponse } from "next/server";
import { createIssue } from "@/lib/github";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const title = formData.get("title") as string;
        const steps = formData.get("steps") as string;
        const expected = formData.get("expected") as string;
        const actual = formData.get("actual") as string;
        const environment = formData.get("environment") as string;
        const extra = formData.get("extra") as string;

        // Create GitHub issue only
        const issue = await createIssue({
            title,
            body: `
### Steps to Reproduce
${steps}

### Expected
${expected}

### Actual
${actual}

### Environment
${environment}

### Extra Notes
${extra}

---
Submitted via in-app bug reporter
            `,
        });

        return NextResponse.json({
            success: true,
            issueUrl: issue.html_url,
        });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}