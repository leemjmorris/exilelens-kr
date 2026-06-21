import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const fail = (message) => {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
};
const pass = (message) => console.log(`PASS ${message}`);
const requireFile = (relativePath) => {
  const absolutePath = join(root, relativePath);
  if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
    fail(`${relativePath} 파일이 없습니다.`);
    return false;
  }
  pass(`${relativePath} 존재`);
  return true;
};
const requireDir = (relativePath) => {
  const absolutePath = join(root, relativePath);
  if (!existsSync(absolutePath) || !statSync(absolutePath).isDirectory()) {
    fail(`${relativePath} 디렉터리가 없습니다.`);
    return false;
  }
  pass(`${relativePath} 존재`);
  return true;
};

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

if (pkg.name === 'exilelens-kr') pass('package name sane');
else fail(`package name이 예상과 다릅니다: ${pkg.name}`);

if (pkg.productName === 'ExileLens KR') pass('productName sane');
else fail(`productName이 예상과 다릅니다: ${pkg.productName}`);

if (pkg.main === 'out/main/index.js') pass('main entry sane');
else fail(`main entry가 예상과 다릅니다: ${pkg.main}`);

if (pkg.build?.appId === 'kr.exilelens.overlay') pass('electron-builder appId sane');
else fail('electron-builder appId가 없습니다/예상과 다릅니다.');

if (pkg.build?.asar === true) pass('asar packaging enabled');
else fail('asar packaging이 켜져 있지 않습니다.');

requireFile(pkg.main);
requireFile('out/preload/index.cjs');
requireFile('out/renderer/index.html');

const mainBundle = readFileSync(join(root, pkg.main), 'utf8');
if (mainBundle.includes('../preload/index.cjs')) pass('main bundle preload path uses index.cjs');
else fail('main bundle이 존재하지 않는 preload 파일을 참조할 수 있습니다. index.cjs를 참조해야 합니다.');

const hotkeysSource = readFileSync(join(root, 'src/main/hotkeys/registerHotkeys.ts'), 'utf8');
if (/register\(['"]Escape['"]/.test(hotkeysSource)) {
  fail('Escape 전역 단축키 등록 코드가 발견되었습니다.');
} else {
  pass('Escape globalShortcut 미등록');
}

if (existsSync(join(root, 'release'))) {
  requireDir('release');
  const zipName = `${pkg.productName}-${pkg.version}-x64.zip`;
  if (existsSync(join(root, 'release', zipName))) {
    requireFile(`release/${zipName}`);
  } else {
    console.warn(`WARN release/${zipName} zip 파일이 없습니다. npm run dist를 실행하지 않은 경우 정상입니다.`);
  }
  if (existsSync(join(root, 'release/win-unpacked'))) {
    requireDir('release/win-unpacked');
    requireFile('release/win-unpacked/ExileLens KR.exe');
    const asarPath = join(root, 'release/win-unpacked/resources/app.asar');
    if (existsSync(asarPath)) {
      const { createRequire } = await import('node:module');
      const require = createRequire(import.meta.url);
      const asar = require('@electron/asar');
      const asarFiles = asar.listPackage(asarPath);
      if (asarFiles.includes('\\out\\preload\\index.cjs')) pass('packaged asar preload index.cjs 존재');
      else fail('packaged asar에 out/preload/index.cjs가 없습니다.');
      if (asarFiles.includes('\\out\\preload\\index.js') || asarFiles.includes('\\out\\preload\\index.mjs')) fail('packaged asar에 잘못된 preload index.js/index.mjs가 있습니다.');
      else pass('packaged asar stale preload 없음');
    } else {
      fail('release/win-unpacked/resources/app.asar 파일이 없습니다.');
    }
  } else {
    console.warn('WARN release는 있지만 release/win-unpacked는 없습니다. dist(zip)만 실행한 경우 정상일 수 있습니다.');
  }
} else {
  console.warn('WARN release 디렉터리가 없습니다. npm run package 또는 npm run dist 후 재실행하면 패키지 산출물도 확인합니다.');
}

if (process.exitCode) process.exit(process.exitCode);
