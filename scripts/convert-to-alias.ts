import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 상대 경로를 @ alias 경로로 변환
 */
function convertToAlias(filePath: string, fileDepth: number): void {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // components/ui 경로 변환
  const uiPatterns = [
    /from ["']\.\.\/\.\.\/\.\.\/components\/ui\//g,
    /from ["']\.\.\/\.\.\/components\/ui\//g,
    /from ["']\.\.\/components\/ui\//g,
    /from ["']\.\/ui\//g,
  ];

  uiPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, `from "@/components/ui/`);
      modified = true;
    }
  });

  // components/common 경로 변환
  const commonPatterns = [
    /from ["']\.\.\/\.\.\/\.\.\/components\/common\//g,
    /from ["']\.\.\/\.\.\/components\/common\//g,
    /from ["']\.\.\/components\/common\//g,
  ];

  commonPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, `from "@/components/common/`);
      modified = true;
    }
  });

  // components/figma 경로 변환
  const figmaPatterns = [
    /from ["']\.\.\/\.\.\/\.\.\/components\/figma\//g,
    /from ["']\.\.\/\.\.\/components\/figma\//g,
    /from ["']\.\.\/components\/figma\//g,
    /from ["']\.\/figma\//g,
  ];

  figmaPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, `from "@/components/figma/`);
      modified = true;
    }
  });

  // contexts 경로 변환
  const contextsPatterns = [
    /from ["']\.\.\/\.\.\/\.\.\/contexts\//g,
    /from ["']\.\.\/\.\.\/contexts\//g,
    /from ["']\.\.\/contexts\//g,
  ];

  contextsPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, `from "@/contexts/`);
      modified = true;
    }
  });

  // features 경로 변환
  const featuresPatterns = [
    /from ["']\.\.\/\.\.\/\.\.\/features\//g,
    /from ["']\.\.\/\.\.\/features\//g,
    /from ["']\.\.\/features\//g,
  ];

  featuresPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, `from "@/features/`);
      modified = true;
    }
  });

  // screens 경로 변환
  const screensPatterns = [
    /from ["']\.\.\/\.\.\/screens\//g,
    /from ["']\.\.\/screens\//g,
    /from ["']\.\/screens\//g,
  ];

  screensPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, `from "@/screens/`);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Converted: ${path.relative(process.cwd(), filePath)}`);
  }
}

/**
 * 디렉토리 내의 모든 .tsx 파일 변환
 */
function convertDirectory(dirPath: string, depth: number = 0): void {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  fs.readdirSync(dirPath).forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      convertDirectory(fullPath, depth + 1);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      convertToAlias(fullPath, depth);
    }
  });
}

/**
 * 메인 실행 함수
 */
function main(): void {
  const rootDir = path.resolve(__dirname, '..');
  const srcDir = path.join(rootDir, 'src');

  console.log('🔄 Converting relative imports to @ alias...\n');

  convertDirectory(srcDir);

  console.log('\n✅ All imports converted to @ alias successfully!');
}

// 스크립트 실행
main();

export { convertToAlias, convertDirectory };
