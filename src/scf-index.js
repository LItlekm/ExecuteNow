'use strict';

/**
 * ExecuteNow AI Proxy - 腾讯云 SCF 版本
 * 用于代理智谱GLM和Google Gemini API调用
 */

// CORS 白名单
const ALLOWED_ORIGINS = new Set([
    "https://litlekm.github.io"
]);

// 生成 CORS 响应头
function getCorsHeaders(origin) {
    const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "";
    return {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Vary": "Origin",
        "Content-Type": "application/json"
    };
}

// 创建响应
function createResponse(statusCode, body, origin) {
    return {
        statusCode,
        headers: getCorsHeaders(origin),
        body: typeof body === 'string' ? body : JSON.stringify(body)
    };
}

// 主处理函数
exports.main_handler = async (event, context) => {
    // 获取请求信息
    const httpMethod = event.httpMethod || event.requestContext?.http?.method || 'GET';
    const path = event.path || event.requestContext?.http?.path || '/';
    const origin = event.headers?.origin || event.headers?.Origin || "";

    // 处理 OPTIONS 预检请求
    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: getCorsHeaders(origin),
            body: ''
        };
    }

    // 路由检查
    if (path !== '/api/ai/steps' || httpMethod !== 'POST') {
        return createResponse(404, { error: "Not Found" }, origin);
    }

    // 来源检查
    if (!ALLOWED_ORIGINS.has(origin)) {
        return createResponse(403, { error: "Forbidden origin" }, origin);
    }

    // 解析请求体
    let body;
    try {
        body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
    } catch (e) {
        body = {};
    }

    const provider = (body.provider || "zhipu").toString().trim().toLowerCase();
    const taskName = (body.taskName || "").toString().trim();
    const stepCountText = (body.stepCountText || "5-8").toString().trim();
    const temperature = typeof body.temperature === "number" ? body.temperature : 0.7;

    if (!taskName) {
        return createResponse(400, { error: "taskName required" }, origin);
    }

    // 构建 prompt
    const prompt = `请为任务"${taskName}"生成${stepCountText}个具体可执行的步骤。
要求：
1. 每个步骤都是简短的行动指令（不超过100字符）
2. 步骤从简单到复杂递进
3. 步骤要足够具体，能立即执行
4. 只返回步骤内容，每行一个步骤，不需要编号`;

    let resp;
    try {
        if (provider === "gemini") {
            const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
            if (!GEMINI_API_KEY) {
                return createResponse(500, { error: "missing_server_key", provider }, origin);
            }

            resp = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-goog-api-key": GEMINI_API_KEY
                    },
                    body: JSON.stringify({
                        contents: [{ role: "user", parts: [{ text: prompt }] }],
                        generationConfig: { temperature, maxOutputTokens: 1024 }
                    })
                }
            );
        } else if (provider === "zhipu") {
            const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
            if (!ZHIPU_API_KEY) {
                return createResponse(500, { error: "missing_server_key", provider }, origin);
            }

            resp = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${ZHIPU_API_KEY}`
                },
                body: JSON.stringify({
                    model: "glm-4.5-air",
                    messages: [{ role: "user", content: prompt }],
                    temperature
                })
            });
        } else {
            return createResponse(400, { error: "unsupported_provider", provider }, origin);
        }

        if (!resp.ok) {
            const detail = await resp.text();
            return createResponse(502, {
                error: "upstream_failed",
                provider,
                status: resp.status,
                detail
            }, origin);
        }

        const data = await resp.json();
        const content = (provider === "gemini")
            ? (data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n") || "")
            : (data?.choices?.[0]?.message?.content || "");

        const steps = content
            .split("\n")
            .map(s => s.replace(/^\d+\.\s*/, "").trim())
            .filter(Boolean);

        return createResponse(200, { provider, steps }, origin);

    } catch (err) {
        return createResponse(500, {
            error: "internal_error",
            message: err.message
        }, origin);
    }
};
