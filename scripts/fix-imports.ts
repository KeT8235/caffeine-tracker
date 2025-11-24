import * as fs from 'fs';
import * as path from 'path';

/**
 * 파일들의 import 경로를 수정하는 함수
 * @param filePath - 수정할 파일 경로
 * @param depth - src 폴더로부터의 깊이 (screens: 2, features: 3)
 */
function fixImports(filePath: string, depth: number): void {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // ui 컴포넌트 import 수정
  const uiPattern = /from ["']\.\/ui\//g;
  if (uiPattern.test(content)) {
    content = content.replace(/from ["']\.\/ui\//g, `from "${'../'.repeat(depth)}components/ui/`);
    modified = true;
  }

  // figma 컴포넌트 import 수정
  const figmaPattern = /from ["']\.\/figma\//g;
  if (figmaPattern.test(content)) {
    content = content.replace(/from ["']\.\/figma\//g, `from "${'../'.repeat(depth)}components/figma/`);
    modified = true;
  }

  // contexts import 수정
  const contextsPattern = /from ["']\.\.\/contexts\//g;
  if (contextsPattern.test(content)) {
    content = content.replace(/from ["']\.\.\/contexts\//g, `from "${'../'.repeat(depth - 1)}contexts/`);
    modified = true;
  }

  // 카페인 관련 컴포넌트 import 수정 (DashboardScreen 등에서)
  const caffeinePattern = /from ["']\.\/Caffeine/g;
  if (caffeinePattern.test(content)) {
    content = content.replace(/from ["']\.\/Caffeine/g, `from "${'../'.repeat(depth)}features/caffeine/Caffeine`);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

/**
 * 디렉토리 내의 모든 .tsx 파일에 대해 import 경로를 수정
 * @param dirPath - 디렉토리 경로
 * @param depth - src 폴더로부터의 깊이
 */
function fixImportsInDirectory(dirPath: string, depth: number): void {
  if (!fs.existsSync(dirPath)) {
    console.warn(`Directory not found: ${dirPath}`);
    return;
  }

  fs.readdirSync(dirPath).forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 재귀적으로 하위 디렉토리 처리
      fixImportsInDirectory(fullPath, depth + 1);
    } else if (file.endsWith('.tsx')) {
      fixImports(fullPath, depth);
    }
  });
}

/**
 * 메인 실행 함수
 */
function main(): void {
  const rootDir = path.resolve(__dirname, '..');

  // screens 폴더 (depth = 2: src/screens)
  const screensDir = path.join(rootDir, 'src', 'screens');
  console.log('Fixing imports in screens...');
  fixImportsInDirectory(screensDir, 2);

  // features 폴더 (depth = 3: src/features/[feature])
  const featuresDir = path.join(rootDir, 'src', 'features');
  console.log('Fixing imports in features...');
  if (fs.existsSync(featuresDir)) {
    fs.readdirSync(featuresDir).forEach((feature) => {
      const featureDir = path.join(featuresDir, feature);
      if (fs.statSync(featureDir).isDirectory()) {
        fixImportsInDirectory(featureDir, 3);
      }
    });
  }

  // components/common 폴더 (depth = 3: src/components/common)
  const commonDir = path.join(rootDir, 'src', 'components', 'common');
  console.log('Fixing imports in components/common...');
  fixImportsInDirectory(commonDir, 3);

  console.log('\n✅ Import paths fixed successfully!');
}

// 스크립트 실행
if (require.main === module) {
  main();
}

export { fixImports, fixImportsInDirectory };
