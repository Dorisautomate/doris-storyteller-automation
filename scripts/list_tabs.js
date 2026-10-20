const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const list = JSON.parse(data);
      console.log('Open targets count:', list.length);
      list.forEach(t => console.log(`[${t.type}] "${t.title}" -> ${t.url}`));
    } catch(e) {
      console.error('JSON parse error:', e);
    }
  });
}).on('error', console.error);
