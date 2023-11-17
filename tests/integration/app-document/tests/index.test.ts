import fs from 'fs';
import path from 'path';
import puppeteer, { Browser, Page } from 'puppeteer';

import {
  launchApp,
  killApp,
  getPort,
  modernBuild,
  launchOptions,
} from '../../../utils/modernTestUtils';
import { printFileTogether } from '../../../utils/printDir';
// import { SequenceWait } from '../../../utils/testInSequence';
import { curSequence as curSequenceWait } from './test.sequence';

const appDir = path.resolve(__dirname, '../');

function existsSync(filePath: string) {
  return fs.existsSync(path.join(appDir, 'dist', filePath));
}
describe('test dev and build', () => {
  // const curSequenceWait = new SequenceWait();
  // curSequenceWait.add('test-dev');

  describe('test build', () => {
    let buildRes: any;
    beforeAll(async () => {
      console.log('===> test build will runs', new Date().getTime()); //             1700196173103
      // console.log('===> test build finished', new Date().getTime()); //           1700196177633
      // console.log('===> test dev beforeAll: start', new Date().getTime()); //     1700196177633
      // console.log('===> test dev beforeAll: wait test-dev finished'); //          1700196179635
      // console.log('dev build 1', new Date().getTime()); //                        1700196177617
      // console.log('===> test dev afterall: ', new Date().getTime());
      // console.log('===> test rem dev beforeAll: start', new Date().getTime()); // 1700196174370
      // console.log('\n===> test rem dev beforeAll waitUntil: ');
      // build app
      buildRes = await modernBuild(appDir);
    });
    afterAll(() => {
      console.log('===> test build finished', new Date().getTime());

      curSequenceWait.done('test-dev');
    });

    test(`should get right alias build!`, async () => {
      console.log('dev build 1', new Date().getTime());
      if (buildRes.code !== 0) {
        console.log('\n===> build failed, stdout: ', buildRes.stdout);
        console.log('\n===> build failed, stderr: ', buildRes.stderr);
      }
      expect(buildRes.code).toEqual(0);
      expect(existsSync('route.json')).toBe(true);
      expect(existsSync('html/test/index.html')).toBe(true);
      expect(existsSync('html/sub/index.html')).toBe(true);
    });

    test('should have the test html and the correct content', async () => {
      const htmlNoDoc = fs.readFileSync(
        path.join(appDir, 'dist', 'html/test/index.html'),
        'utf-8',
      );
      expect(htmlNoDoc.includes('<div id="root"><!--<?- html ?>--></div>'));
    });

    test('should have the sub html and the correct content', async () => {
      console.log('dev test 2', new Date().getTime());
      const htmlWithDoc = fs.readFileSync(
        path.join(appDir, 'dist', 'html/sub/index.html'),
        'utf-8',
      );
      expect(htmlWithDoc.includes('<div id="root"><!--<?- html ?>--><h1'));
    });

    test('should has comment in Head', async () => {
      const htmlWithDoc = fs.readFileSync(
        path.join(appDir, 'dist', 'html/sub/index.html'),
        'utf-8',
      );

      expect(htmlWithDoc.includes('<!-- COMMENT BY APP -->')).toBe(true);
      expect(htmlWithDoc.includes('== COMMENT BY APP in inline ==')).toBe(true);
      expect(htmlWithDoc.includes('== COMMENT BY APP but inline ==')).toBe(
        false,
      );
    });

    test('should has style in Head', async () => {
      const htmlWithDoc = fs.readFileSync(
        path.join(appDir, 'dist', 'html/sub/index.html'),
        'utf-8',
      );

      expect(htmlWithDoc.includes('.logo-spin>div:last-child')).toBe(true);
    });

    test('should has lang property in html', async () => {
      const htmlWithDoc = fs.readFileSync(
        path.join(appDir, 'dist', 'html/sub/index.html'),
        'utf-8',
      );

      expect(htmlWithDoc.includes(`html lang="cn"`)).toBe(true);
    });

    test('should has dir property in body', async () => {
      const htmlWithDoc = fs.readFileSync(
        path.join(appDir, 'dist', 'html/sub/index.html'),
        'utf-8',
      );

      expect(htmlWithDoc.includes(`body dir="ltr"`)).toBe(true);
    });

    test('should has class property in root div', async () => {
      const htmlWithDoc = fs.readFileSync(
        path.join(appDir, 'dist', 'html/sub/index.html'),
        'utf-8',
      );

      expect(htmlWithDoc.includes(`div id="root" class="root"`)).toBe(true);
    });

    test('should has class property in root div', async () => {
      const htmlWithDoc = fs.readFileSync(
        path.join(appDir, 'dist', 'html/sub/index.html'),
        'utf-8',
      );

      expect(htmlWithDoc.includes(`head class="head"`)).toBe(true);
    });

    test('when not set partial html should normal', async () => {
      const normalHtml = fs.readFileSync(
        path.join(appDir, 'dist', 'html/differentProperities/index.html'),
        'utf-8',
      );
      const partialPlaceholder = encodeURIComponent(
        '<!--<?- partials.top ?>-->',
      );
      expect(new RegExp(partialPlaceholder).test(normalHtml)).toBe(false);
    });

    test('should injected partial html content to html', async () => {
      console.log('dev test -1', new Date().getTime());
      const htmlWithDoc = fs.readFileSync(
        path.join(appDir, 'dist', 'html/sub/index.html'),
        'utf-8',
      );

      expect(
        /<head class="head"><script>window.abc="hjk"<\/script>/.test(
          htmlWithDoc,
        ),
      ).toBe(true);
      expect(
        /<head[\s\S]*<script>console.log\("abc"\)<\/script>[\s\S]*<\/head>/.test(
          htmlWithDoc,
        ),
      ).toBe(true);

      expect(
        /<body[\s\S]*<script>console.log\(abc\)<\/script>[\s\S]*<\/body>/.test(
          htmlWithDoc,
        ),
      ).toBe(true);
    });
  });

  describe('test dev', () => {
    let app: any;
    let appPort: number;
    let errors;
    let browser: Browser;
    let page: Page;
    beforeAll(async () => {
      console.log('\n===> test dev beforeAll: start', new Date().getTime()); // 1700191835047
      // 打印 .mordernjs 目录
      // printFileTogether(path.join(__dirname, '../node_modules/.modern-js'));
      await curSequenceWait.waitUntil('test-dev');
      // 再打印一次
      // printFileTogether(path.join(__dirname, '../node_modules/.modern-js'));
      console.log(
        '\n===> test dev beforeAll: wait test-dev finished',
        new Date().getTime(),
      );
      appPort = await getPort();
      app = await launchApp(appDir, appPort, {}, {});
      errors = [];
      browser = await puppeteer.launch(launchOptions as any);
      page = await browser.newPage();
      page.on('pageerror', error => {
        errors.push(error.message);
      });
    });
    afterAll(async () => {
      await killApp(app);
      await page.close();
      await browser.close();
      console.log('===> test dev afterall: ', new Date().getTime());
      curSequenceWait.done('test-rem');
    });

    test(`should render page test correctly`, async () => {
      console.log('dev test 1');
      // printFileTogether(path.join(__dirname, '../node_modules/.modern-js'));

      await page.goto(`http://localhost:${appPort}/test`, {
        waitUntil: ['networkidle0'],
      });

      const root = await page.$('#root');
      const targetText = await page.evaluate(el => el?.textContent, root);
      expect(targetText?.trim()).toEqual('A');
      expect(errors.length).toEqual(0);
    });

    test(`should render page sub correctly`, async () => {
      console.log('dev test 2');
      printFileTogether(path.join(__dirname, '../node_modules/.modern-js'));

      await page.goto(`http://localhost:${appPort}/sub`, {
        waitUntil: ['networkidle0'],
      });

      await page.waitForSelector('#root a');
      const root = await page.$('#root');
      const targetText = await page.evaluate(el => el?.textContent, root);
      expect(targetText?.trim()).toEqual('去 A去 B');
      expect(errors.length).toEqual(0);
    });

    test(`should render page sub route a correctly`, async () => {
      console.log('dev test 3');
      printFileTogether(path.join(__dirname, '../node_modules/.modern-js'));
      await page.goto(`http://localhost:${appPort}/sub/a`, {
        waitUntil: ['networkidle0'],
      });

      await page.waitForSelector('#root a');
      const root = await page.$('#root');
      const targetText = await page.evaluate(el => el?.textContent, root);
      expect(targetText?.trim()).toEqual('去 A去 B');
      expect(errors.length).toEqual(0);
    });
  });

  describe('fix rem', () => {
    beforeAll(async () => {
      console.log(
        '\n===> test rem dev beforeAll: start ',
        new Date().getTime(),
      );
      console.log(
        '===> rem sequence ins: ',
        curSequenceWait.sequenceResolveList.keys(),
      );
      await curSequenceWait.waitUntil('test-rem');
      console.log(
        '\n===> test rem dev beforeAll waitUntil: ',
        new Date().getTime(),
      );
      // printFileTogether(path.join(__dirname, '../node_modules/.modern-js'));
      await modernBuild(appDir, ['-c', 'modern-rem.config.ts']);
      // printFileTogether(path.join(__dirname, '../node_modules/.modern-js'));
    });

    test('should add rem resource correct', async () => {
      console.log('\n===> test rem 1', new Date().getTime());
      // printFileTogether(path.join(__dirname, '../node_modules/.modern-js'));
      const htmlNoDoc = fs.readFileSync(
        path.join(appDir, 'dist-1', 'html/test/index.html'),
        'utf-8',
      );
      expect(htmlNoDoc.includes('/static/js/convert-rem.'));
    });
  });
});
