#!/usr/bin/env node

import { existsSync, mkdirSync, cpSync, readdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf8'));
const SKILLS_SRC = resolve(__dirname, '..', 'skills');
const AGENTS_SRC = resolve(__dirname, '..', 'agents');
const PROJECT_DIR = process.cwd();

const TARGETS = [
  { name: 'Claude Code',   dir: '.claude/skills',           detect: '.claude' },
  { name: 'Cursor',        dir: '.cursor/skills',           detect: '.cursor' },
  { name: 'Codex CLI',     dir: '.codex/skills',            detect: '.codex' },
  { name: 'Kiro',          dir: '.kiro/steering',            detect: '.kiro' },
  { name: 'Trae',          dir: '.trae/rules',               detect: '.trae' },
  { name: 'Antigravity',   dir: '.antigravity/skills',       detect: '.antigravity' },
  { name: 'VS Code',       dir: '.github/superpowers',       detect: '.github/copilot-instructions.md' },
];

function countDirs(dir) {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory()).length;
}

function showHelp() {
  console.log(`
  superpowers-zh v${PKG.version} — AI 编程超能力中文版

  用法：
    npx superpowers-zh          安装 skills 到当前项目
    npx superpowers-zh --help   显示帮助
    npx superpowers-zh --version 显示版本

  说明：
    自动检测当前项目使用的 AI 编程工具：
    Claude Code / Cursor / Codex / Kiro / Trae / Antigravity / VS Code
    将 ${countDirs(SKILLS_SRC)} 个 skills 安装到对应目录。
    如果未检测到任何工具，默认安装到 .claude/skills/。

  项目：https://github.com/jnMetaCode/superpowers-zh
`);
}

function install() {
  console.log(`\n  superpowers-zh v${PKG.version} — AI 编程超能力中文版\n`);
  console.log(`  源: ${countDirs(SKILLS_SRC)} 个 skills`);
  console.log(`  目标项目: ${PROJECT_DIR}\n`);

  let installed = 0;

  for (const target of TARGETS) {
    const detectPath = resolve(PROJECT_DIR, target.detect);
    const dest = resolve(PROJECT_DIR, target.dir);

    if (existsSync(detectPath)) {
      mkdirSync(dest, { recursive: true });
      cpSync(SKILLS_SRC, dest, { recursive: true });
      const count = countDirs(dest);
      console.log(`  ✅ ${target.name}: ${count} 个 skills -> ${dest}`);
      installed++;

      if (target.name === 'Claude Code' && existsSync(AGENTS_SRC)) {
        const agentsDest = resolve(PROJECT_DIR, '.claude', 'agents');
        mkdirSync(agentsDest, { recursive: true });
        cpSync(AGENTS_SRC, agentsDest, { recursive: true });
      }
    }
  }

  if (installed === 0) {
    const dest = resolve(PROJECT_DIR, '.claude', 'skills');
    mkdirSync(dest, { recursive: true });
    cpSync(SKILLS_SRC, dest, { recursive: true });
    console.log(`  ✅ 默认安装: ${countDirs(dest)} 个 skills -> ${dest}`);
  }

  console.log('\n  安装完成！重启你的 AI 编程工具即可生效。\n');
}

const arg = process.argv[2];
if (arg === '--help' || arg === '-h') {
  showHelp();
} else if (arg === '--version' || arg === '-v') {
  console.log(PKG.version);
} else {
  install();
}
