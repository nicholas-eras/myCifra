// cifra.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class CifraService {
  
  private async getBrowser() {
    const chromium = require('@sparticuz/chromium-min').default;
    const puppeteer = require('puppeteer-core');
    const path = '/home/nicholas/myCifra/back/src/cifra/chromium-pack/chromium';

    return puppeteer.launch({
      args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: chromium.defaultViewport,
      executablePath: path,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  }

  async scrapeCifra(url: string): Promise<any> {
    return url;
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const content = await page.content();
    await browser.close();

    return {
      url,
      htmlLength: content.length,
    };
  }
}
