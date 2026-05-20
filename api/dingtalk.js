const crypto = require('crypto');

// 钉钉机器人配置
const WEBHOOK_BASE = 'https://oapi.dingtalk.com/robot/send?access_token=542302a849715b40b344ebf816b6c29b5bdb7d365c66a8a90981c2d9b15c5894';
const SECRET = 'SEC0d44e2519dcf06485de21f985b593de806ce480f9803b9548c5e4666d00ed7e4';

function getSignedUrl() {
  const timestamp = Date.now();
  const strToSign = `${timestamp}\n${SECRET}`;
  const sign = encodeURIComponent(
    crypto.createHmac('sha256', SECRET).update(strToSign).digest('base64')
  );
  return `${WEBHOOK_BASE}&timestamp=${timestamp}&sign=${sign}`;
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    const url = getSignedUrl();

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msgtype: 'markdown',
        markdown: {
          title: '520奶茶订单',
          text: `### 🧋 520奶茶订单来啦！\n\n` +
                `- **姓名**：${data.name}\n` +
                `- **地址**：${data.address}\n` +
                `- **手机号**：${data.phone}\n` +
                `- **类型**：${data.type}\n` +
                `- **甜度**：${data.sweet || '未选'}\n` +
                `- **冰度**：${data.ice || '未选'}\n` +
                `- **提交时间**：${data.time}\n`
        }
      })
    });

    const result = await response.json();
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
