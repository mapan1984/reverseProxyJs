const net = require('net')

class AliveSocket {
    constructor(host, port) {
        this.host = host
        this.port = port

        this.socket = null
        this.retrying = false
    }

    connect() {
        this.socket = net.createConnection(this.port, this.host)
        this.socket.host = this.host
        this.socket.port = this.port

        this.socket.on('connect', () => {
            console.log(`socket ${this.socket.host}:${this.socket.port} connected`)
            this.retrying = false
        })

        this.socket.on('error', (err) => { // 当错误发生时触发。'close' 事件也会紧接着该事件被触发
            console.error(`socket ${this.socket.host}:${this.socket.port} error: `, err)
            this.socket.destroy(err)
            this.retrying = false
        })

        this.socket.on('close', (hadErr) => { // 一旦 socket 完全关闭就发出该事件。参数 had_error 是 boolean 类型，表明 socket 被关闭是否取决于传输错误。
            if (hadErr) {
                console.error(`socket ${this.socket.host}:${this.socket.port} closed with error`)
            } else {
                console.warn(`socket ${this.socket.host}:${this.socket.port} closed`)
            }
            this.reconnect()
        })

        this.socket.on('end', () => { // 当 socket 的另一端发送一个 FIN 包的时候触发，从而结束 socket 的可读端
            console.error(`socket ${this.socket.host}:${this.socket.port} end`)
            this.reconnect()
        })

        this.socket.setKeepAlive(true, 60000)

        return this.socket
    }

    reconnect() {
        if (!this.retrying) {
            this.retrying = true
            console.log(`socket ${this.host}:${this.port} reconnecting...`)
            setTimeout(() => {
                this.socket.connect(this.port, this.host)
            }, 500)
        }
    }
}

module.exports = AliveSocket

if (require.main == module) {
    let socket = new AliveSocket('127.0.0.1', '8000').connect()

    socket.on('data', (data) => {
        console.log(data)
    })
}
