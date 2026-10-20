const crypto = require('crypto');
const fs = require('fs');

function decryptCookies() {
  const data = JSON.parse(fs.readFileSync('scripts/extracted_encrypted_cookies.json', 'utf8'));
  const aesKey = Buffer.from(data.aes_key_hex, 'hex');

  const decryptedList = [];

  for (const row of data.profile2_cookies) {
    const [host_key, name, path, is_secure, is_httponly, expires_utc, samesite, hexVal] = row;
    if (!hexVal) continue;
    const buf = Buffer.from(hexVal, 'hex');

    const prefix = buf.subarray(0, 3).toString('utf8');
    let value = '';

    if (prefix === 'v10' || prefix === 'v11') {
      const iv = buf.subarray(3, 15);
      const ciphertext = buf.subarray(15, buf.length - 16);
      const tag = buf.subarray(buf.length - 16);

      try {
        const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
        decipher.setAuthTag(tag);
        let dec = decipher.update(ciphertext, null, 'utf8');
        dec += decipher.final('utf8');
        value = dec;
      } catch (err) {
        continue;
      }
    } else {
      value = buf.toString('utf8');
    }

    if (value) {
      const isSec = Boolean(is_secure) || name.startsWith('__Secure-') || name.startsWith('__Host-');
      if (host_key.startsWith('.')) {
        decryptedList.push({
          name,
          value,
          domain: host_key,
          path: path || '/',
          secure: isSec
        });
      } else {
        decryptedList.push({
          name,
          value,
          url: 'https://' + host_key + (path || '/'),
          secure: isSec
        });
      }
    }
  }

  console.log(`[✓] Filtered and validated ${decryptedList.length} cookies!`);
  fs.writeFileSync('scripts/profile2_cookies.json', JSON.stringify(decryptedList, null, 2));
}

decryptCookies();
