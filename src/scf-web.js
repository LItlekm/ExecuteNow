/**
 * ExecuteNow AI Proxy - 腾讯云 SCF Web函数版本
 * 使用函数URL直接提供HTTP服务
 */

const http = require('http');

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

// 发送响应
function sendResponse(res, statusCode, body, origin) {
    const headers = getCorsHeaders(origin);
    res.writeHead(statusCode, headers);
    res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

// 解析请求体
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const origin = req.headers.origin || "";

    // 处理 OPTIONS 预检请求
    if (req.method === 'OPTIONS') {
        const headers = getCorsHeaders(origin);
        res.writeHead(204, headers);
        res.end();
        return;
    }

    // 路由检查 - 支持根路径和 /api/ai/steps
    const validPaths = ['/', '/api/ai/steps'];
    if (!validPaths.includes(url.pathname) || req.method !== 'POST') {
        sendResponse(res, 404, { error: "Not Found" }, origin);
        return;
    }

    // 来源检查
    if (!ALLOWED_ORIGINS.has(origin)) {
        sendResponse(res, 403, { error: "Forbidden origin" }, origin);
        return;
    }

    // 解析请求体
    const body = await parseBody(req);
    const provider = (body.provider || "zhipu").toString().trim().toLowerCase();
    const taskName = (body.taskName || "").toString().trim();
    const stepCountText = (body.stepCountText || "5-8").toString().trim();
    const temperature = typeof body.temperature === "number" ? body.temperature : 0.7;

    if (!taskName) {
        sendResponse(res, 400, { error: "taskName required" }, origin);
        return;
    }

    // 构建 prompt
    const prompt = `请为任务"${taskName}"生成${stepCountText}个具体可执行的步骤。
要求：
1. 每个步骤都是简短的行动指令（不超过100字符）
2. 步骤从简单到复杂递进
3. 步骤要足够具体，能立即执行
4. 只返回步骤内容，每行一个步骤，不需要编号`;

    try {
        let apiResponse;

        if (provider === "gemini") {
            const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
            if (!GEMINI_API_KEY) {
                sendResponse(res, 500, { error: "missing_server_key", provider }, origin);
                return;
            }

            apiResponse = await fetch(
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
                sendResponse(res, 500, { error: "missing_server_key", provider }, origin);
                return;
            }

            apiResponse = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
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
        } else if (provider === "deepseek") {
            const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
            if (!DEEPSEEK_API_KEY) {
                sendResponse(res, 500, { error: "missing_server_key", provider }, origin);
                return;
            }

            apiResponse = await fetch("https://api.deepseek.com/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [{ role: "user", content: prompt }],
                    temperature
                })
            });
        } else {
            sendResponse(res, 400, { error: "unsupported_provider", provider }, origin);
            return;
        }

        if (!apiResponse.ok) {
            const detail = await apiResponse.text();
            sendResponse(res, 502, {
                error: "upstream_failed",
                provider,
                status: apiResponse.status,
                detail
            }, origin);
            return;
        }

        const data = await apiResponse.json();
        const content = (provider === "gemini")
            ? (data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n") || "")
            : (data?.choices?.[0]?.message?.content || "");

        const steps = content
            .split("\n")
            .map(s => s.replace(/^\d+\.\s*/, "").trim())
            .filter(Boolean);

        sendResponse(res, 200, { provider, steps }, origin);

    } catch (err) {
        sendResponse(res, 500, {
            error: "internal_error",
            message: err.message
        }, origin);
    }
});

// 监听 9000 端口（腾讯云 Web函数要求）
server.listen(9000, () => {
    console.log('Server running on port 9000');
});
