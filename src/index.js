export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const ALLOWED_ORIGINS = new Set([
      "https://litlekm.github.io"
    ]);

    const origin = request.headers.get("Origin") || "";
    const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "";

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname !== "/api/ai/steps" || request.method !== "POST") {
      return new Response("Not Found", { status: 404, headers: corsHeaders });
    }

    if (!allowOrigin) {
      return new Response("Forbidden origin", { status: 403, headers: corsHeaders });
    }

    if (!env.GEMINI_API_KEY) {
      return Response.json({ error: "missing_server_key" }, { status: 500, headers: corsHeaders });
    }

    const body = await request.json().catch(() => ({}));
    const taskName = (body.taskName || "").toString().trim();
    const stepCountText = (body.stepCountText || "5-8").toString().trim();
    const temperature = typeof body.temperature === "number" ? body.temperature : 0.7;

    if (!taskName) {
      return Response.json({ error: "taskName required" }, { status: 400, headers: corsHeaders });
    }

    const prompt = `请为任务"${taskName}"生成${stepCountText}个具体可执行的步骤。
要求：
1. 每个步骤都是简短的行动指令（不超过100字符）
2. 步骤从简单到复杂递进
3. 步骤要足够具体，能立即执行
4. 只返回步骤内容，每行一个步骤，不需要编号`;

    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens: 1024 }
        })
      }
    );

    if (!resp.ok) {
      const detail = await resp.text();
      return Response.json(
        { error: "gemini_failed", status: resp.status, detail },
        { status: 502, headers: corsHeaders }
      );
    }

    const data = await resp.json();
    const content =
      data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n") || "";

    const steps = content
      .split("\n")
      .map(s => s.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);

    return Response.json({ steps }, { headers: corsHeaders });
  }
};
