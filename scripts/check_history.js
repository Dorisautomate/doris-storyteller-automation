const fs = require('fs');

['Default', 'Profile 2'].forEach(p => {
  const hFile = 'C:/Users/doris/AppData/Local/Google/Chrome/User Data/' + p + '/History';
  if (fs.existsSync(hFile)) {
    const content = fs.readFileSync(hFile).toString('binary');
    const regex = /https:\/\/flow\.google\.com\/[a-zA-Z0-9\/\-_]+/g;
    const matches = content.match(regex) || [];
    console.log(p, 'matches:', [...new Set(matches)]);
  }
});
