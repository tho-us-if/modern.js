import fs from 'fs';
import path from 'path';

import {
  killApp,
  getPort,
  modernBuild,
  modernServe,
} from '../../../utils/modernTestUtils';

const appDir = path.resolve(__dirname, '../');

function existsSync(filePath: string) {
  return fs.existsSync(path.join(appDir, 'dist', filePath));
}

describe('test build', () => {
  let port = 8080;
  let buildRes: any;
  let app: any;
  beforeAll(async () => {
    port = await getPort();

    buildRes = await modernBuild(appDir);

    app = await modernServe(appDir, port, {
      cwd: appDir,
    });
  });

  afterAll(async () => {
    await killApp(app);
  });

  test(`should get right alias build!`, async () => {
    expect(buildRes.code === 0).toBe(true);
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
    expect(htmlWithDoc.includes('== COMMENT BY APP but inline ==')).toBe(false);
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
    const partialPlaceholder = encodeURIComponent('<!--<?- partials.top ?>-->');
    expect(new RegExp(partialPlaceholder).test(normalHtml)).toBe(false);
  });

  test('should injected partial html content to html', async () => {
    const htmlWithDoc = fs.readFileSync(
      path.join(appDir, 'dist', 'html/sub/index.html'),
      'utf-8',
    );

    expect(
      /<head class="head"><script>window.abc="hjk"<\/script>/.test(htmlWithDoc),
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
