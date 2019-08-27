class Pulsatio {
    constructor(options = {}) {
        let defaults = {
            port: 4200,
            url: 'http://localhost:4200',
            interval: 30 * 1000,
            interval_timeout: 1.1,
            on: {}
        }

        options = Object.assign(defaults, options)
        this.options = options

        this.sendHeartbeat = this.sendHeartbeat.bind(this)
        this.connect = this.connect.bind(this)
        this.connect()
    }

    connect() {
        if (this.options.url) {
            let url = `${this.options.url}/nodes/`
            let data = {
                id: this.options.id,
                ip: this.options.ip,
                interval: this.options.interval,
                hostname: this.options.hostname
            }

            fetch(url, { method: 'POST', json: data }).then((response) => {
                response.json().then((body) => {
                    if (body && body.id) {
                        this.options.id = body.id

                        if (this.options.on.connection) {
                            this.options.on.connection(body)
                        }

                        this.sendHeartbeat()
                    }
                    else {
                        setTimeout(this.connect, this.options.interval)
                    }
                })

            })
        }
    }

    sendHeartbeat() {
        let url = `${this.options.url}/nodes/${this.options.id}`
        let data = {
            ip: this.options.ip
        }

        fetch(url, { method: 'PUT', json: data }).then((response) => {
            if (response && response.status !== 404) {
                this.disconnected = null
                delete this.disconnected
                this.timeout = setTimeout(this.sendHeartbeat, this.options.interval)
            }
            else {
                this.disconnected = true
                this.connect()
            }
        })
    }

    clearNode(node, multiple) {
        if (node) {
            if (multiple === true) {
                let nodes = {}
                for (let n in node) {
                    let copy = Object.assign({}, node[n])
                    copy.timeout = null
                    delete copy.timeout
                    nodes[n] = copy
                }
                return nodes
            }
            else {
                let { timeout, ...ret } = node
                return ret
            }
        }
        else {
            if (multiple === true) { return {} }
            else {
                return undefined
            }
        }
    }
}

module.exports = Pulsatio
