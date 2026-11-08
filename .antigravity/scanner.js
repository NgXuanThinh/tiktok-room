import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const targetDirs = ['server', 'src', 'preview'];

function getJsFiles(dir) {
  const fullPath = path.join(projectRoot, dir);
  if (!fs.existsSync(fullPath)) return [];
  const results = [];
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  for (const entry of entries) {
    const res = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      results.push(...getJsFiles(res));
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.mjs'))) {
      results.push(res.replace(/\\/g, '/'));
    }
  }
  return results;
}

function parseFile(relPath) {
  const absPath = path.resolve(projectRoot, relPath);
  const content = fs.readFileSync(absPath, 'utf8');
  const lines = content.split('\n');

  const imports = [];
  const functions = [];

  // 1. Detect imports
  const importRegex = /(?:import\s+(?:.*?from\s+)?['"](.*?)['"]|require\(['"](.*?)['"]\))/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importTarget = match[1] || match[2];
    if (importTarget) {
      imports.push(importTarget);
    }
  }

  // 2. Scan functions line by line with brace matching
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip comments
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;

    let fnName = null;
    let params = '';
    let startLine = i + 1;

    // Pattern A: standard function / export function / async function
    const fnMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)/);
    // Pattern B: const/let/var func = (params) => or function(params)
    const arrowMatch = line.match(/(?:export\s+)?(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?(?:\(([^)]*)\)|([a-zA-Z0-9_$]+))\s*=>/);
    // Pattern C: class methods: methodName(params) {
    const methodMatch = line.match(/^\s*(?:async\s+)?(?:get\s+|set\s+)?(?:static\s+)?([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*\{/);

    if (fnMatch) {
      fnName = fnMatch[1];
      params = fnMatch[2].trim();
    } else if (arrowMatch) {
      fnName = arrowMatch[1];
      params = (arrowMatch[2] || arrowMatch[3] || '').trim();
    } else if (methodMatch && !['if', 'for', 'while', 'switch', 'catch'].includes(methodMatch[1])) {
      fnName = methodMatch[1];
      params = methodMatch[2].trim();
    }

    if (fnName) {
      // Find end line by tracking braces
      let braceDepth = 0;
      let foundStartBrace = false;
      let endLine = startLine;

      for (let j = i; j < lines.length; j++) {
        const currentLine = lines[j];
        for (let k = 0; k < currentLine.length; k++) {
          const char = currentLine[k];
          if (char === '{') {
            braceDepth++;
            foundStartBrace = true;
          } else if (char === '}') {
            braceDepth--;
            if (foundStartBrace && braceDepth <= 0) {
              endLine = j + 1;
              break;
            }
          }
        }
        if (foundStartBrace && braceDepth <= 0) break;
      }

      // Avoid duplicates
      if (!functions.some(f => f.name === fnName && f.startLine === startLine)) {
        functions.push({
          name: fnName,
          params,
          startLine,
          endLine: Math.max(endLine, startLine)
        });
      }
    }
  }

  return {
    filePath: relPath,
    absolutePath: absPath.replace(/\\/g, '/'),
    imports,
    functions
  };
}

const allFiles = targetDirs.flatMap(getJsFiles);
const scanResult = {
  scannedAt: new Date().toISOString(),
  files: allFiles.map(parseFile)
};

const outputPath = path.join(projectRoot, '.antigravity', 'scan_result.json');
fs.writeFileSync(outputPath, JSON.stringify(scanResult, null, 2), 'utf8');
console.log(`Scan completed. Scanned ${scanResult.files.length} files. Output saved to .antigravity/scan_result.json`);
