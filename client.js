const config = require('./config')
const AliveSocket = require('./lib/aliveSocket')


const serverAddr = config.serverAddr
const serverPort = config.serverPort
const localIp = config.localIp
const localPort = config.localPort


let proxyClient = new AliveSocket(serverAddr, serverPort).connect()
let localClient = new AliveSocket(localIp, localPort).connect()

proxyClient.on('data', (data) => {
    localClient.write(data)
})

localClient.on('data', (data) => {
    proxyClient.write(data)
})
