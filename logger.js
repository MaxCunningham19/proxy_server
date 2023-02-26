module.exports = class Log {
    constructor() {
        this.log = []
    }

    async block(url) {
        let date_ob = new Date();
        this.log.push(`@${date_ob.getFullYear() + "/" + ("0" + (date_ob.getMonth() + 1)).slice(-2) + "/" + ("0" + date_ob.getDate()).slice(-2) + "-" + date_ob.getHours() + ":" + date_ob.getMinutes() + ":" + date_ob.getSeconds()} BLOCKED: ${url}`)
    }

    async unblock(url) {
        let date_ob = new Date();
        this.log.push(`@${date_ob.getFullYear() + "/" + ("0" + (date_ob.getMonth() + 1)).slice(-2) + "/" + ("0" + date_ob.getDate()).slice(-2) + "-" + date_ob.getHours() + ":" + date_ob.getMinutes() + ":" + date_ob.getSeconds()} UNBLOCKED: ${url}`)
    }

    async visit(url) {
        let date_ob = new Date();
        this.log.push(`@${date_ob.getFullYear() + "/" + ("0" + (date_ob.getMonth() + 1)).slice(-2) + "/" + ("0" + date_ob.getDate()).slice(-2) + "-" + date_ob.getHours() + ":" + date_ob.getMinutes() + ":" + date_ob.getSeconds()} VISITED: ${url}`)
    }

    toString() {
        return this.log.join('\n')
    }

    list(){
        return this.log
    }
}