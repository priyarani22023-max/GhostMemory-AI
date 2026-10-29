/**
 * GhostMemory AI - Express Server & Development Proxy
 * Handles Cloudflare Workers AI routes both at /.netlify/functions/* and /api/*
 * and mounts the Vite React frontend.
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { cloudflareAiService, DEFAULT_GEMMA_MODEL } from './src/server/cloudflareAiService.ts';
import {
  GenerateStoryPayload,
  RememberPayload,
  ReimaginePayload,
} from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrap() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware: JSON payload with safe limits
  app.use(express.json({ limit: '2mb' }));

  // CORS headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-cloudflare-account-id, x-cloudflare-api-token, x-cloudflare-ai-model'
    );
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Extract client overrides if provided in headers
  const extractOverrides = (req: Request) => {
    return {
      accountId: (req.headers['x-cloudflare-account-id'] as string) || undefined,
      apiToken: (req.headers['x-cloudflare-api-token'] as string) || undefined,
      model: (req.headers['x-cloudflare-ai-model'] as string) || undefined,
    };
  };

  // Router for both Netlify Functions and /api routes
  const functionRouter = express.Router();

  // ==========================================
  // GET /health
  // ==========================================
  functionRouter.get('/health', async (req: Request, res: Response) => {
    try {
      const overrides = extractOverrides(req);
      const health = await cloudflareAiService.checkHealth(overrides);
      res.setHeader('Content-Type', 'application/json');
      res.json(health);
    } catch (err: unknown) {
      res.setHeader('Content-Type', 'application/json');
      res.json({
        status: 'error',
        provider: 'Cloudflare Workers AI',
        configuredModel: DEFAULT_GEMMA_MODEL,
        modelAvailable: false,
        isConfigured: false,
        error: err instanceof Error ? err.message : 'Unknown server health check error',
      });
    }
  });

  // ==========================================
  // POST /generate-story
  // ==========================================
  functionRouter.post('/generate-story', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const body = req.body as GenerateStoryPayload;
      if (!body.prompt || typeof body.prompt !== 'string' || !body.prompt.trim()) {
        res.json({
          success: false,
          content: '',
          model: body.model || DEFAULT_GEMMA_MODEL,
          provider: 'Cloudflare Workers AI',
          error: 'Please provide a story premise or prompt.',
        });
        return;
      }

      if (body.prompt.trim().length > 5000) {
        res.json({
          success: false,
          content: '',
          model: body.model || DEFAULT_GEMMA_MODEL,
          provider: 'Cloudflare Workers AI',
          error: 'Story prompt is too long. Please keep it under 5,000 characters.',
        });
        return;
      }

      const overrides = extractOverrides(req);
      if (body.model) overrides.model = body.model;

      const result = await cloudflareAiService.generateStory(body, overrides);
      res.json(result);
    } catch (err: unknown) {
      res.json({
        success: false,
        content: '',
        model: DEFAULT_GEMMA_MODEL,
        provider: 'Cloudflare Workers AI',
        error: err instanceof Error ? err.message : 'Internal story generation error',
      });
    }
  });

  // ==========================================
  // POST /remember
  // ==========================================
  functionRouter.post('/remember', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const body = req.body as RememberPayload;
      if (!body.memories || typeof body.memories !== 'string' || !body.memories.trim()) {
        res.json({
          success: false,
          content: '',
          model: body.model || DEFAULT_GEMMA_MODEL,
          provider: 'Cloudflare Workers AI',
          error: 'Please describe at least one cherished memory.',
        });
        return;
      }

      if (body.memories.trim().length > 5000) {
        res.json({
          success: false,
          content: '',
          model: body.model || DEFAULT_GEMMA_MODEL,
          provider: 'Cloudflare Workers AI',
          error: 'Memories text is too long. Please keep it under 5,000 characters.',
        });
        return;
      }

      const overrides = extractOverrides(req);
      if (body.model) overrides.model = body.model;

      const result = await cloudflareAiService.generateRemembrance(body, overrides);
      res.json(result);
    } catch (err: unknown) {
      res.json({
        success: false,
        content: '',
        model: DEFAULT_GEMMA_MODEL,
        provider: 'Cloudflare Workers AI',
        error: err instanceof Error ? err.message : 'Internal remembrance tribute error',
      });
    }
  });

  // ==========================================
  // POST /reimagine
  // ==========================================
  functionRouter.post('/reimagine', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const body = req.body as ReimaginePayload;
      if (!body.originalText || typeof body.originalText !== 'string' || !body.originalText.trim()) {
        res.json({
          success: false,
          content: '',
          model: body.model || DEFAULT_GEMMA_MODEL,
          provider: 'Cloudflare Workers AI',
          error: 'Please provide original diary text to reimagine.',
        });
        return;
      }

      if (body.originalText.trim().length > 5000) {
        res.json({
          success: false,
          content: '',
          model: body.model || DEFAULT_GEMMA_MODEL,
          provider: 'Cloudflare Workers AI',
          error: 'Original text is too long. Please keep it under 5,000 characters.',
        });
        return;
      }

      const overrides = extractOverrides(req);
      if (body.model) overrides.model = body.model;

      const result = await cloudflareAiService.reimagineDiary(body, overrides);
      res.json(result);
    } catch (err: unknown) {
      res.json({
        success: false,
        content: '',
        model: DEFAULT_GEMMA_MODEL,
        provider: 'Cloudflare Workers AI',
        error: err instanceof Error ? err.message : 'Internal diary reimagining error',
      });
    }
  });

  // Mount at both /.netlify/functions and /api
  app.use('/.netlify/functions', functionRouter);
  app.use('/api', functionRouter);

  // Catch-all for API & Netlify functions so they NEVER fall through to Vite SPA index.html!
  app.all(['/.netlify/functions/*', '/api/*'], (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({
      status: 'error',
      error: `Endpoint not found: ${req.path}`,
      troubleshooting: 'Check function routing in netlify/functions/ or server.ts.',
    });
  });

  // ==========================================
  // Vite Frontend Middleware / Static Serve
  // ==========================================
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GhostMemory AI] Running on port ${PORT}`);
    console.log(`[GhostMemory AI] Endpoints mounted: /.netlify/functions/* & /api/*`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start GhostMemory AI server:', err);
  process.exit(1);
});
