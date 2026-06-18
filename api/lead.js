/**
 * Serverless function: receives landing-page form submissions and creates a
 * lead (person) in the folk CRM, adding them to the "bottle_nephew_leads" group.
 *
 * The folk API key is read from the FOLK_API_KEY environment variable and is
 * NEVER exposed to the browser.
 */

const FOLK_API_URL = "https://api.folk.app/v1/people";

// folk group "bottle_nephew_leads"
const FOLK_GROUP_ID = "grp_3e4e2b1d-3070-4a63-86c3-6d5d16b1aedf";

function clean(value, max) {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    return max ? trimmed.slice(0, max) : trimmed;
}

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed." });
    }

    const apiKey = process.env.FOLK_API_KEY;
    if (!apiKey) {
        console.error("FOLK_API_KEY is not configured.");
        return res
            .status(500)
            .json({ error: "Lead capture is not configured. Please try again later." });
    }

    let body = req.body;
    if (typeof body === "string") {
        try {
            body = JSON.parse(body || "{}");
        } catch (e) {
            return res.status(400).json({ error: "Invalid request body." });
        }
    }
    body = body || {};

    const name = clean(body.name, 1000);
    const email = clean(body.email, 254);
    const phone = clean(body.phone, 30);
    const message = clean(body.message, 5000);
    const source = clean(body.source, 100) || "Book a demo form";

    if (!email && !phone) {
        return res
            .status(400)
            .json({ error: "Please provide an email or phone number." });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Please provide a valid email address." });
    }

    const person = { groups: [{ id: FOLK_GROUP_ID }] };
    if (name) person.fullName = name;
    if (email) person.emails = [email];
    if (phone) person.phones = [phone];

    const descriptionParts = [
        `Source: ${source} (nephew-in-a-bottle landing page)`,
    ];
    if (message) descriptionParts.push(`Message: ${message}`);
    person.description = descriptionParts.join("\n").slice(0, 5000);

    try {
        const folkRes = await fetch(FOLK_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(person),
        });

        if (!folkRes.ok) {
            const detail = await folkRes.text();
            console.error("folk API error", folkRes.status, detail);
            return res
                .status(502)
                .json({ error: "We couldn't save your details. Please try again." });
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("Failed to reach folk API", err);
        return res
            .status(502)
            .json({ error: "We couldn't save your details. Please try again." });
    }
};
