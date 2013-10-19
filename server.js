var connect = require('connect'),
    http = require('http'),
    port = 3000;

var app = connect()
    .use(connect.logger('dev'))
    .use(connect.static(__dirname));

http.createServer(app).listen(port);
console.log('server listening on port ' + port);