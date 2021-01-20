const config = require('./config')
const PipeServer = require('./lib/pipeServer')


const remotePort = config.remotePort
const serverPort = config.serverPort


// proxyServer 接收代理客户端请求
let proxyServer = new PipeServer('0.0.0.0', serverPort)

// remoteServer 接收外部请求
const remoteServer = new PipeServer('0.0.0.0', remotePort)

proxyServer.next = remoteServer
remoteServer.next = proxyServer

proxyServer.listen()
proxyServer.dealDataCache()
proxyServer.dealPipeDataCache()

remoteServer.listen()
remoteServer.dealDataCache()
remoteServer.dealPipeDataCache()
