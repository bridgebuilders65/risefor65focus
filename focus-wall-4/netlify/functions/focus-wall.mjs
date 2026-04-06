import { getStore } from "@netlify/blobs";

const STORE_NAME = "focus-wall";
const DEFAULT_DATA = { entries: [] };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function cleanText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

function normalizeKey(value) {
  return cleanText(value).toLowerCase();
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default async (request) => {
  try {
    const url = new URL(request.url);
    const poll = url.searchParams.get("poll") || "default-wall";
    const store = getStore({ name: STORE_NAME, consistency: "strong" });

    let data = await store.get(poll, { type: "json" });
    if (!data || !Array.isArray(data.entries)) {
      data = { ...DEFAULT_DATA, entries: [] };
      await store.setJSON(poll, data);
    }

    if (request.method === "GET") {
      return json(data);
    }

    if (request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON body." }, 400);
      }

      const action = body?.action;

      if (action === "add") {
        const text = cleanText(body?.text);
        const key = normalizeKey(text);
        if (!text) return json({ error: "Text is required." }, 400);

        const existing = data.entries.find((item) => item.key === key);
        if (existing) {
          existing.count = Number(existing.count || 0) + 1;
          existing.updatedAt = Date.now();
        } else {
          data.entries.unshift({
            id: newId(),
            key,
            text,
            count: 1,
            createdAt: Date.now(),
            updatedAt: Date.now()
          });
        }

        data.entries = data.entries.slice(0, 300);
        await store.setJSON(poll, data);
        return json(data);
      }

      if (action === "like") {
        const entryId = String(body?.id || "").trim();
        if (!entryId) return json({ error: "Entry id is required." }, 400);

        const entry = data.entries.find((item) => item.id === entryId);
        if (!entry) return json({ error: "Entry not found." }, 404);

        entry.count = Number(entry.count || 0) + 1;
        entry.updatedAt = Date.now();
        await store.setJSON(poll, data);
        return json(data);
      }

      return json({ error: "Unknown action." }, 400);
    }

    return json({ error: "Method not allowed." }, 405);
  } catch (error) {
    console.error("Focus wall function error:", error);
    return json({ error: error?.message || "Function crashed" }, 500);
  }
};

export const config = {
  path: "/api/focus-wall"
};
