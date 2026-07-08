import { createServer as createViteServer } from 'vite';
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;

function loadDotEnv() {
  const envPath = path.join(root, '.env');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnv();

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 4174);
const resolvedApiKey = process.env.OPENAI_API_KEY || '';
const resolvedBaseUrl = (process.env.OPENAI_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
const resolvedModel = process.env.CODEX_MODEL || 'deepseek-chat';

const systemPrompt = [
  '你是食品安全科研助手。',
  '用户主要是食品安全专业研究生。',
  '默认使用简洁、专业的中文回答。',
  '优先帮助用户完成文献调研、实验设计、数据分析、法规比对、风险评估和论文写作。',
  '不要编造法规条文、实验数据或参考文献。',
  '遇到法规限值、最新研究或高风险判断时，如不确定，要明确提醒用户进一步核实。'
].join(' ');

async function generateReply(message) {
  const response = await fetch(`${resolvedBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resolvedApiKey}`,
    },
    body: JSON.stringify({
      model: resolvedModel,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.4,
      stream: false,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data,
    };
  }

  const reply =
    data?.choices?.[0]?.message?.content ||
    '抱歉，这次没有生成有效回复。';

  return {
    ok: true,
    reply,
  };
}

const vite = await createViteServer({
  root,
  server: { middlewareMode: true },
  appType: 'spa',
});

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/api/chat') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(
        JSON.stringify({
          ok: true,
          message: 'This endpoint accepts POST requests only.',
        }),
      );
      return;
    }

    if (req.method === 'POST' && req.url === '/api/chat') {
      if (!resolvedApiKey) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Missing OPENAI_API_KEY on server' }));
        return;
      }

      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }

      const parsed = JSON.parse(body || '{}');
      const message = typeof parsed.message === 'string' ? parsed.message.trim() : '';

      if (!message) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Missing message' }));
        return;
      }

      const result = await generateReply(message);

      if (!result.ok) {
        res.writeHead(result.status, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: result.data }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ reply: result.reply }));
      return;
    }

    vite.middlewares(req, res, () => {
      res.statusCode = 404;
      res.end('Not Found');
    });
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown server error',
      }),
    );
  }
});

server.listen(port, host, () => {
  console.log(`Food Safety Assistant running at http://${host}:${port}`);
});
