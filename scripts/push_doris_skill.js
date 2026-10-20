const { execSync } = require('child_process');
const fs = require('fs');
const repoPath = 'C:\\Users\\doris\\AppData\\Local\\Temp\\doris_skill_repo';

if (fs.existsSync(repoPath)) {
  fs.copyFileSync('skills/doris/SKILL.md', repoPath + '\\SKILL.md');
  execSync(`git -C "${repoPath}" add SKILL.md`);
  execSync(`git -C "${repoPath}" commit -m "Update Doris skill with Active Chrome Permission Protocol"`);
  execSync(`git -C "${repoPath}" push origin main`);
  console.log('[✓] Successfully pushed to https://github.com/Dorisautomate/Doris!');
}
