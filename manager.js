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

    make_log(){
        let list = this.log.list()
        let html = ["<ul>"]
        for(let i=0;i<list.length;i++){
            html.push(`<li>${list[i]}</li>`)
        }
        html.push('</ul>')
        return html.join('\n')
    }

    admin_html(){
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
            ${this.make_log()}
        </body>
        </html>
        `)
    }

    is_admin(url){
        return url==="admin"||url==="admin/"
    }
}