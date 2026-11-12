const path = require('node:path');
const fs = require('node:fs');
const backend = path.resolve(__dirname, '../chucky-server');
const dotenv = require(require.resolve('dotenv', { paths: [backend] }));
const config = dotenv.parse(fs.readFileSync(path.join(backend, '.env')));
const usersProxy = {
    target: 'http://127.0.0.1:' + (config.PORT || 4000),
    changeOrigin: true,
    bypass(req, res) {
      const local = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
      const host = req.headers.host || '';
      if (!local || !/^(localhost|127\.0\.0\.1|\[::1\])(:[0-9]+)?$/i.test(host) ||
          req.headers['sec-fetch-site'] === 'cross-site' ||
          (req.headers.origin && req.headers.origin !== 'http://' + host)) {
        res.writeHead(403); res.end(); return false;
      }
      req.headers['x-panel-users-key'] = config.PANEL_USERS_KEY;
    }
};
module.exports = { '/api/admin/products': usersProxy, '/api/admin/products/**': usersProxy, '/api/admin/floating-buttons': usersProxy, '/api/admin/floating-buttons/**': usersProxy, '/api/admin/users': usersProxy, '/api/admin/users/**': usersProxy, '/api/admin/comments/**': usersProxy };
