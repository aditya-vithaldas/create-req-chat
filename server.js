import "dotenv/config";

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4173);
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiLiveModel = process.env.GEMINI_LIVE_MODEL || "gemini-3.1-flash-live-preview";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function createGeminiLiveToken() {
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: geminiApiKey });
  const token = await ai.authTokens.create({
    config: {
      uses: 1,
      expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      newSessionExpireTime: new Date(Date.now() + 60 * 1000),
      liveConnectConstraints: {
        model: geminiLiveModel,
        config: {
          sessionResumption: {},
          temperature: 0.7,
          responseModalities: ["AUDIO"]
        }
      },
      httpOptions: { apiVersion: "v1alpha" }
    }
  });

  return token.name;
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const pathParts = requestedPath.split("/").filter(Boolean);
  if (pathParts.some((part) => part.startsWith("."))) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const safePath = normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath);

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type": mimeTypes[extname(filePath)] || "application/octet-stream"
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

const server = createServer(async (request, response) => {
  if (request.method === "POST" && request.url === "/api/gemini-live-token") {
    try {
      const accessToken = await createGeminiLiveToken();
      sendJson(response, 200, {
        access_token: accessToken,
        model: geminiLiveModel,
        expires_in_seconds: 1800
      });
    } catch (error) {
      sendJson(response, 500, {
        error: error.message || "Unable to create Gemini Live token."
      });
    }
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
    response.end("Method not allowed");
    return;
  }

  await serveStatic(request, response);
});

server.listen(port, () => {
  console.log(`Create Req Chat running at http://localhost:${port}`);
});
