import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const commitMsgPath = resolve(root, '.commit-msg');
const pkgPath = resolve(root, 'package.json');

function git(...args) {
  return execFileSync('git', args, { cwd: root, stdio: 'pipe', encoding: 'utf8' }).trim();
}

function gitInherit(...args) {
  execFileSync('git', args, { cwd: root, stdio: 'inherit' });
}

// 1. Read package.json version
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const versionTag = pkg.version ? `v${pkg.version}` : null;

// 1.5 Sync public/version.json to match package.json
if (versionTag) {
  const versionJsonPath = resolve(root, 'public', 'version.json');
  writeFileSync(versionJsonPath, JSON.stringify({ version: versionTag }, null, 2) + '\n');
}

// 2. Stage all changes
gitInherit('add', '-A');

// 3. Check if there are staged changes to commit
let hasStagedChanges = false;
try {
  execFileSync('git', ['diff', '--cached', '--quiet'], { cwd: root });
} catch {
  hasStagedChanges = true;
}

if (hasStagedChanges) {
  if (existsSync(commitMsgPath)) {
    const msg = readFileSync(commitMsgPath, 'utf8').trim();
    if (!msg) {
      console.error('Error: .commit-msg is empty.');
      process.exit(1);
    }
    gitInherit('commit', '-F', commitMsgPath);
    unlinkSync(commitMsgPath);
  } else {
    const fallbackMsg = versionTag ? `chore: release ${versionTag}` : 'chore: update';
    gitInherit('commit', '-m', fallbackMsg);
  }
} else if (existsSync(commitMsgPath)) {
  unlinkSync(commitMsgPath);
}

// 4. Create version tag if it doesn't exist yet
let createdNewTag = false;
if (versionTag) {
  try {
    git('rev-parse', '-q', '--verify', `refs/tags/${versionTag}`);
  } catch {
    gitInherit('tag', versionTag);
    createdNewTag = true;
    console.log(`Created tag ${versionTag}`);
  }
}

// 5. Push branch (and new tag if created)
if (createdNewTag && versionTag) {
  gitInherit('push', 'origin', 'main', versionTag);
} else {
  gitInherit('push', 'origin', 'main');
}
