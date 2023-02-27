const Log = require('./logger')

const BLOCKED = "blocked"
const VIEWS = "views"
const LASTVIEW = "update"


module.exports = class Manager {
    constructor() {
        this.urls = {}
        this.log = new Log()
    }

    exists(url) {
        return this.urls[url] != null
    }

    is_blocked(url) {
        if (this.exists(url)) {
            return this.urls[url].blocked
        }
        return false
    }

    block(url) {
        this.log.block(url)
        if (!this.exists(url)) {
            this.urls[url] = {}
            this.urls[url].views = 0
        }
        this.urls[url].blocked = true
    }

    unblock(url) {
        this.log.unblock(url)
        if (!this.exists(url)) {
            this.url[url] = {}
            this.urls[url].views = 0
        }
        this.urls[url].blocked = false
    }

    blocked() {
        let list = Object.keys(this.urls)
        let blockedURLs = []
        for (let i = 0; i < list.length; i++) {
            if (this.is_blocked(list[i])) {
                blockedURLs.push(list[i])
            }
        }
        return blockedURLs
    }

    have_visited(url) {
        return this.exists(url) && (this.urls[url].views > 0)
    }

    async visit(url) {
        this.log.visit(url)
        if (!this.have_visited(url)) {
            this.urls[url] = {}
            this.urls[url].blocked = false
            this.urls[url].views = 0
        }
        this.urls[url].views = this.urls[url].views + 1
        this.urls[url].lastV = new Date()
    }

    visited() {
        let list = Object.keys(this.urls)
        let visitedURLs = []
        for (let i = 0; i < list.length; i++) {
            if (this.have_visited(list[i])) {
                visitedURLs.push(list[i])
            }
        }
        return visitedURLs
    }

    format_date(date_ob){
        if (date_ob == null){
            return "UNKNOWN"
        }
        return `${date_ob.getFullYear() + "/" + ("0" + (date_ob.getMonth() + 1)).slice(-2) + "/" + ("0" + date_ob.getDate()).slice(-2) + "-" + date_ob.getHours() + ":" + date_ob.getMinutes() + ":" + date_ob.getSeconds()}`
    }

    info() {
        let information = []
        let keys = Object.keys(this.urls)
        for (let i = 0; i < keys.length; i++) {
            information.push(keys[i] + " -  Blocked: " + (this.urls[keys[i]].blocked ? "TRUE" : "FALSE") + `  Visits: ${this.urls[keys[i]].views}  Last Visited: ${format_date(this.urls[keys[i]].lastV)} `)
        }
        return information.join('\n')
    }

    logs() {
        return this.log.toString()
    }

    make_metrics(){
        let table = ['<table>\n<tr>\n<th>URL</th>\n<th>No. Visits</th>\n<th>Last Visited</th>\n<th>Is Blocked</th>\n</tr>\n']
        let keys = Object.keys(this.urls)
        for (let i = 0; i < keys.length; i++) {
            table.push(`<tr>\n<td>${keys[i]}</td>\n<td>${this.urls[keys[i]].views}</td>\n<td>${this.urls[keys[i]].lastV}</td>\n<td>${this.urls[keys[i]].blocked}</td>\n</tr>`)
        }
        table.push('</table>')
        return table.join('\n')
    }

    make_log(){
        let list = this.log.list()
        let html = ["<ul>"]
        for(let i=0;i<list.length;i++){
            html.push(`<li>${list[i]}</li>`)
        }
        html.push('</ul>')
        return html.join('\n')
    }

    make_blocklist(){
        let blocked = this.blocked()
        let html = ['<table>']
        for (let i=0;i<blocked.length;i++){
            html.push(`<tr>\n<td>${blocked[i]}</td>\n</tr>`)
        }
        html.push('</table>')
        return html.join('\n')
    }

    admin(serverAddress, data){
        if (serverAddress === 'admin'){
            return this.admin_home()
        }
        switch(serverAddress){
            case 'adminlogs':
                return this.admin_logs()
            case 'adminblocklist':
                return this.admin_block()
            case 'adminmetrics':
                return this.admin_metrics()
            default:
                return this.admin_error()
        }
    }

    admin_block(){
        return (`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ADMIN CONTROL</title>
        </head>
        <body>
            <h1>Edit BlockList</h1><br>
            <a href="http://adminlogs">View Logs</a><br>
            <a href="http://adminblocklist">Edit Blocklist</a><br>
            <a href="http://adminmetrics">View Metrics</a><br>
            </div>
            <div>
                ${this.make_blocklist()}
            </div>
        </body>
        </html>
        `)
    }

    admin_metrics(){
        return (`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ADMIN CONTROL</title>
        </head>
        <body>
            <h1>Proxy Server Metrics</h1><br>
            <a href="http://adminlogs">View Logs</a><br>
            <a href="http://adminblocklist">Edit Blocklist</a><br>
            <a href="http://adminmetrics">View Metrics</a><br>
            </div>
            <div>
                ${this.make_metrics()}
            </div>
        </body>
        </html>
        `)
    }

    admin_logs(){
        return (`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ADMIN CONTROL</title>
        </head>
        <body>
            <h1>Proxy Server Logs</h1><br>
            <a href="http://adminlogs">View Logs</a><br>
            <a href="http://adminblocklist">Edit Blocklist</a><br>
            <a href="http://adminmetrics">View Metrics</a><br>
            </div>
            <div>
                ${this.make_log()}
            </div>
        </body>
        </html>
        `)
    }

    admin_error(){
        return (`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Error</title>
        </head>
        <body>
            <h1>Error Page Does Not Exist</h1>
        </body>
        </html>
        `)
    }

    admin_home(){
        return (`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ADMIN CONTROL</title>
        </head>
        <body>
            <h1>Admin Control</h1>
            <div>
            <a href="http://adminlogs">View Logs</a><br>
            <a href="http://adminblocklist">Edit Blocklist</a><br>
            <a href="http://adminmetrics">View Metrics</a><br>
            </div>
        </body>
        </html>
        `)
    }

    is_admin(url){
        return url==="admin"||url==="adminlogs"||url==='adminblocklist'||url==='adminmetrics'
    }
}