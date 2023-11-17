import fs from 'fs';
import path from 'path';

import { modernBuild } from '../../../utils/modernTestUtils';
// import { printFileTogether } from '../../../utils/printDir';
import { curSequence as curSequenceWait } from './test.sequence';

const appDir = path.resolve(__dirname, '../');

jest.setTimeout(1000 * 60 * 3);

describe('test build', () => {
  beforeAll(async () => {
    console.log('\n===> test rem dev beforeAll: start ', new Date().getTime());
    curSequenceWait.waitUntil('test-rem');
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
