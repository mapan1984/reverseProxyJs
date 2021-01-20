const net = require('net')

class PipeServer {
    constructor(host, port) {
        this.port = port

        this.next = null
        this.dataCache = []
        this.pipeCache = []

        this.ondata = false

        this.server = null
        this.socket = null
        this.retrying = false
    }

    pleasePipeData(data) {
        if (data) {
            this.pipeCache.push(data)
        }
        if (this.socket) {
            while (this.pipeCache.length > 0) {
                if (this.socket) {
                    this.socket.write(this.pipeCache.shift())
                }
            }
        }
    }

    dealPipeDataCache() {
        console.log('dealPipeDataCache ing...')

        this.pleasePipeData()

        setTimeout(this.dealPipeDataCache.bind(this), 1000)
    }

    dealDataCache() {
        console.log('dealDataCache ing...')

        if (this.next) {
            while (this.dataCache.length > 0) {
                if (this.ondata) {
                    return
                } else {
                    if (this.next) {
                        this.next.pleasePipeData(this.dataCache.shift())
                    }
                }
            }
        }

        setTimeout(this.dealDataCache.bind(this), 1000)
    }

    listen() {
        this.server = net.createServer()

        this.server.listen(this.port, () => {
            console.log('ServerSocket start listen ', this.server.address())
        })

        this.server.on('connection', socket => {
            this.socket = socket
            this.socket.setKeepAlive(true, 60000)

            this.socket.on('data', data => {
                this.ondata = true

                this.dataCache.push(data)

                if (this.next) {
                    while (this.dataCache.length > 0) {
                        if (this.next) {
                            this.next.pleasePipeData(this.dataCache.shift())
                        }
                    }
                }

                this.ondata = false
            })
        })

        this.server.on('error', err => {
            console.error('ServerSocket error: ', err)
        })

        this.server.on('close', () => {
            console.warn('ServerSocket closed')
        })
    }
}

module.exports = PipeServer

