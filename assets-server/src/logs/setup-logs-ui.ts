import * as path from 'path';
import * as fs from 'fs';
import type { Express, Request, Response, NextFunction } from 'express';

export function setupLogsUi(httpServer: Express) {
  const isProduction = process.env.NODE_ENV === 'production';
  const logsUiToken = process.env.JWT_SECRET;

  // In production, require token; if not configured, do not expose routes
  if (isProduction && !logsUiToken) {
    return;
  }

  httpServer.use('/logs', (req: Request, res: Response, next: NextFunction) => {
    if (!logsUiToken && !isProduction) {
      // Dev mode without token: allow
      return next();
    }
    const provided = (req.header('x-logs-token') || (req.query.token as string) || '').trim();
    if (provided && logsUiToken && provided === logsUiToken) {
      return next();
    }
    res.status(401).type('text/plain').send('Unauthorized');
  });
  const logsDir = path.join(process.cwd(), 'logs');

  const escapeHtml = (unsafe: string) =>
    unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const ensureInsideLogs = (fileName: string) => {
    const resolved = path.resolve(logsDir, fileName);
    if (!resolved.startsWith(path.resolve(logsDir))) {
      throw new Error('Invalid path');
    }
    return resolved;
  };

  const readTail = async (fullPath: string, maxLines: number) => {
    try {
      const content = await fs.promises.readFile(fullPath, 'utf8');
      const lines = content.split(/\r?\n/);
      return lines.slice(Math.max(0, lines.length - maxLines)).join('\n');
    } catch (e) {
      return `Failed to read file: ${(e as Error).message}`;
    }
  };

  httpServer.get('/logs', async (_req: Request, res: Response) => {
    try {
      const exists = fs.existsSync(logsDir);
      if (!exists) {
        res.type('html').send('<h1>No logs directory found</h1>');
        return;
      }
      const entries = await fs.promises.readdir(logsDir);
      const filesWithStats = await Promise.all(
        entries.map(async (name) => {
          const full = path.join(logsDir, name);
          const stats = await fs.promises.stat(full);
          return { name, stats };
        })
      );
      filesWithStats.sort((a, b) => b.stats.mtimeMs - a.stats.mtimeMs);

      const listItems = filesWithStats
        .map(
          ({ name, stats }) =>
            `<li><a href="/logs/${encodeURIComponent(name)}">${escapeHtml(name)}</a> <small>(${(
              stats.size / 1024
            ).toFixed(1)} KB, ${new Date(stats.mtimeMs).toLocaleString()})</small></li>`
        )
        .join('');

      const latest = filesWithStats[0]?.name;
      const latestPreview = latest
        ? `<h3>Latest: ${escapeHtml(
            latest
          )}</h3><pre style="white-space:pre-wrap;background:#111;color:#eee;padding:12px;border-radius:6px;">${escapeHtml(
            await readTail(ensureInsideLogs(latest), 500)
          )}</pre>`
        : '<p>No log files yet.</p>';

      const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Logs</title>
      <style>
        body{font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, "Apple Color Emoji", "Segoe UI Emoji"; margin: 24px; background:#0b0b0b; color:#e5e5e5}
        a{color:#60a5fa; text-decoration:none}
        a:hover{text-decoration:underline}
      </style>
    </head>
    <body>
      <h1>Logs</h1>
      <p><a href="/logs">Refresh</a></p>
      <ul>${listItems}</ul>
      ${latestPreview}
    </body>
  </html>`;
      res.type('html').send(html);
    } catch (err) {
      res.status(500).send((err as Error).message);
    }
  });

  httpServer.get('/logs/:file', async (req: Request, res: Response) => {
    try {
      const file = req.params.file as string;
      const lines = Number(req.query.lines ?? 1000);
      const fullPath = ensureInsideLogs(file);
      const content = await readTail(fullPath, isFinite(lines) && lines > 0 ? lines : 1000);
      const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(file)}</title>
      <style>
        body{font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, "Apple Color Emoji", "Segoe UI Emoji"; margin: 24px; background:#0b0b0b; color:#e5e5e5}
        a{color:#60a5fa; text-decoration:none}
        a:hover{text-decoration:underline}
        pre{white-space:pre-wrap;background:#111;color:#eee;padding:12px;border-radius:6px}
      </style>
    </head>
    <body>
      <h2><a href="/logs">Logs</a> / ${escapeHtml(file)}</h2>
      <p>
        <a href="/logs/${encodeURIComponent(file)}?lines=100">last 100</a> ·
        <a href="/logs/${encodeURIComponent(file)}?lines=500">last 500</a> ·
        <a href="/logs/${encodeURIComponent(file)}?lines=1000">last 1000</a>
      </p>
      <pre>${escapeHtml(content)}</pre>
    </body>
  </html>`;
      res.type('html').send(html);
    } catch (err) {
      res.status(400).send((err as Error).message);
    }
  });
}
