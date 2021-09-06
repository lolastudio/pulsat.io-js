class Pulsatio {
    constructor(options = {}) {
        this.options = Object.assign(this.default, options)
        this.sendHeartbeat = this.sendHeartbeat.bind(this)
        this.connect = this.connect.bind(this)
        this.connect()
    }

    get default() {
        return {
            port: 4200,
            url: 'http://localhost:4200',
            interval: 30 * 1000,
            interval_timeout: 1.1,
            on: {},
            data: {}
        }
    }

    connect() {
        if (this.options.url) {
            let url = `${this.options.url}/nodes/`
            let data = {
                id: this.options.id,
                ip: this.options.ip,
                interval: this.options.interval,
                hostname: this.options.hostname,
                ...this.options.data
            }

            fetch(url, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: new Headers({ 'content-type': 'application/json' })
            }).then((response) => {
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
                }).catch(err => {
                    setTimeout(this.connect, this.options.interval)
                })
            }).catch(err => {
                setTimeout(this.connect, this.options.interval)
            })
        }
        else {
            console.log('No url');
        }
    }

    sendHeartbeat() {
        let url = `${this.options.url}/nodes/${this.options.id}`
        let data = {
            ip: this.options.ip,
            _message_id: this.last_message_id
        }

        fetch(url, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: new Headers({ 'content-type': 'application/json' })
        }).then((response) => {
            response.json().then((body) => {
                if (body && body._message_id) {
                    this.last_message_id = body._message_id;
                }
                
                if (this.options.on.heartbeat) { this.options.on.heartbeat(body); }
            }).catch(err => {
                if (this.options.on.heartbeat) { this.options.on.heartbeat(); }
            })

            if (response && response.status !== 404) {
                this.disconnected = null
                delete this.disconnected
                this.timeout = setTimeout(this.sendHeartbeat, this.options.interval)
            }
            else {
                this.disconnected = true
                this.connect()
            }
        }).catch(err => {
            this.disconnected = true
            this.connect()
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
