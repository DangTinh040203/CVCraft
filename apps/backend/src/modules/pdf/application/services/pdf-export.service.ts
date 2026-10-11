import {
  Injectable,
  InternalServerErrorException,
  Logger,
  type OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer, { type Browser, type HTTPRequest } from 'puppeteer';

import { Env } from '@/libs/configs/env.config';

export interface PrintPayload {
  templateKey: string;
  format?: Record<string, unknown> | null;
  resume: Record<string, unknown>;
}

/** Global the FE /print page reads its data from (see apps/client/app/print). */
const PRINT_DATA_KEY = '__CRAFTCV_PRINT__';
/** Set by the /print page once the template and its fonts have rendered. */
const READY_SELECTOR = '[data-print-ready="true"]';
const RENDER_TIMEOUT_MS = 20_000;

@Injectable()
export class PdfExportService implements OnModuleDestroy {
  private readonly logger = new Logger(PdfExportService.name);
  private browserPromise: Promise<Browser> | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleDestroy() {
    if (this.browserPromise) {
      const browser = await this.browserPromise.catch(() => null);
      await browser?.close();
    }
  }

  /**
   * Renders the resume through the FE's /print route in headless Chromium and
   * prints it. The page's own `@page` rule decides the paper size.
   */
  async render(payload: PrintPayload): Promise<Uint8Array> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    const renderUrl = this.renderUrl();

    try {
      await page.setRequestInterception(true);
      page.on('request', (req) => this.filterRequest(req, renderUrl.origin));

      // Hand the data to the page before any of its scripts run
      await page.evaluateOnNewDocument(
        (key, data) => {
          (window as unknown as Record<string, unknown>)[key] = data;
        },
        PRINT_DATA_KEY,
        payload,
      );

      await page.goto(new URL('/print', renderUrl).toString(), {
        waitUntil: 'networkidle0',
        timeout: RENDER_TIMEOUT_MS,
      });
      await page.waitForSelector(READY_SELECTOR, {
        timeout: RENDER_TIMEOUT_MS,
      });
      await page.evaluate(() => document.fonts.ready);

      return await page.pdf({
        printBackground: true,
        // Mandatory: otherwise Puppeteer ignores the page's @page size
        preferCSSPageSize: true,
      });
    } catch (error) {
      this.logger.error('PDF render failed', error);
      throw new InternalServerErrorException('Could not generate the PDF');
    } finally {
      await page.close().catch(() => undefined);
    }
  }

  /**
   * Only the FE app itself may load scripts/documents. Images and fonts may
   * come from anywhere (avatars, font CDNs). Everything else is blocked so
   * resume content can't make the server fetch arbitrary URLs.
   */
  private filterRequest(req: HTTPRequest, allowedOrigin: string) {
    const url = req.url();
    const type = req.resourceType();

    const sameOrigin = url.startsWith(`${allowedOrigin}/`) || url === allowedOrigin;
    const isInline = url.startsWith('data:') || url.startsWith('blob:');
    const isAsset = type === 'image' || type === 'font';

    if (sameOrigin || isInline || (isAsset && url.startsWith('https://'))) {
      void req.continue();
    } else {
      void req.abort();
    }
  }

  private renderUrl(): URL {
    return new URL(
      this.configService.get<string>(Env.PDF_RENDER_URL) ??
        this.configService.getOrThrow<string>(Env.FRONTEND_ORIGIN),
    );
  }

  /** One long-lived browser; a new page per request avoids cold starts. */
  private getBrowser(): Promise<Browser> {
    if (!this.browserPromise) {
      this.browserPromise = puppeteer
        .launch({
          headless: true,
          args: ['--no-sandbox', '--disable-dev-shm-usage'],
        })
        .then((browser) => {
          browser.on('disconnected', () => {
            this.logger.warn('Chromium disconnected, will relaunch on demand');
            this.browserPromise = null;
          });
          this.logger.log('Chromium launched for PDF export');
          return browser;
        })
        .catch((error: unknown) => {
          this.browserPromise = null;
          throw error;
        });
    }
    return this.browserPromise;
  }
}
