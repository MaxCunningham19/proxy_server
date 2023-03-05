const Log = require('./logger')

/*
Manager:class

public methods {
    exists(url:string):bool
    is_blocked(url:string):bool 
    cache(url:string):None
    retrieve(url:string):None
    have_visited(url:string):bool 
    visit(url:string): None
    admin(serverAddress:string, data:string):string
    is_admin(host:string):bool
    get_url(data:string):string
}

This class manages all of the functionality of the management console
*/
module.exports = class Manager {
    /*
    urls:json
    log: class Log

    urls: This stores all information about how many urls have been visied,
    how many times a url has been visited, and if the url is blocked
    url example :
        url:{
            "www.example.com":{
                visits: 7,
                blocked: false
            }
        }
    */
    constructor() {
        this.urls = {}
        this.log = new Log()
    }

    // exists(url:string):bool
    // this returns true if a url is present in the json object
    exists(url) {
        return this.urls[url] != null
    }

    // is_blocked(url:string):bool
    // this returns true if a url is blocked
    is_blocked(url) {
        url = url.replace('www.','')
        if (this.exists(url)) {
            return this.urls[url].blocked
        }
        url = 'www.'+url
        if (this.exists(url)) {
            return this.urls[url].blocked
        }

        return false
    }

    // block(url:string):None
    // this blocks and logs that a url has been blocked
    async block(url) {
        this.log.block(url)
        if (!this.exists(url)) {
            this.urls[url] = {}
            this.urls[url].views = 0
        }
        this.urls[url].blocked = true
    }

    // unblock(url:string):None
    // this unblocks and logs that a url has been unblocked
    async unblock(url) {
        this.log.unblock(url)
        if (!this.exists(url)) {
            this.url[url] = {}
            this.urls[url].views = 0
        }
        this.urls[url].blocked = false
    }

    // cache(url:string):None
    // This logs that a url has been cached
    async cache(url){
        this.log.cache(url)
    }

    // retrieve(url:string):None
    // This logs that a url has been retrieved from cache
    retrieve(url){
        this.log.retrieve(url)
    }

    // blocked():[string]
    // This returns a list of the urls that are currently blocked
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

    // have_visted(url:string):bool
    // This returns true if we have visited a url at least once
    have_visited(url) {
        return this.exists(url) && (this.urls[url].views > 0)
    }

    // visit(urlstring):None
    // This increases the number of recorded views for the website
    // and logs that the website was visited
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

    // visited():[string]
    // this returns an array of the urls that have been visited at least once
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

    // format_date(date_ob:Date.Date):string
    // this returns a formated string of a date YY/MM/DD-HH:MM:SS
    format_date(date_ob) {
        if (date_ob == null) {
            return "UNKNOWN"
        }
        return `${date_ob.getFullYear() + "/" + ("0" + (date_ob.getMonth() + 1)).slice(-2) + "/" + ("0" + date_ob.getDate()).slice(-2) + "-" + date_ob.getHours() + ":" + date_ob.getMinutes() + ":" + date_ob.getSeconds()}`
    }

    // info():string
    // this returns the information stored in this.urls as a string
    // with each url seperated by a '\n'
    info() {
        let information = []
        let keys = Object.keys(this.urls)
        for (let i = 0; i < keys.length; i++) {
            information.push(keys[i] + " -  Blocked: " + (this.urls[keys[i]].blocked ? "TRUE" : "FALSE") + `  Visits: ${this.urls[keys[i]].views}  Last Visited: ${format_date(this.urls[keys[i]].lastV)} `)
        }
        return information.join('\n')
    }

    // logs():[string]
    // this returns the information stored in this.log
    logs() {
        return this.log.toString()
    }

    // make_metrics():string
    // this returns a html element formatting all the
    // information stored in this.urls
    make_metrics() {
        let table = ['<table>\n<tr>\n<th>URL</th>\n<th>No. Visits</th>\n<th>Last Visited</th>\n<th>Is Blocked</th>\n</tr>\n']
        let keys = Object.keys(this.urls)
        for (let i = 0; i < keys.length; i++) {
            table.push(`<tr>\n<td>${keys[i]}</td>\n<td>${this.urls[keys[i]].views}</td>\n<td>${this.urls[keys[i]].lastV}</td>\n<td> ${this.urls[keys[i]].blocked ? "TRUE" : "FALSE"}</td>\n</tr>`)
        }
        table.push('</table>')
        return table.join('\n')
    }

    // make_log():string
    // this returns a html element formatting
    // the logs into a list
    make_log() {
        let list = this.log.list()
        let html = ["<ul>"]
        for (let i = list.length-1; i >=0; i--) {
            html.push(`<li>${list[i]}</li>`)
        }
        html.push('</ul>')
        return html.join('\n')
    }

    // make_blocklist:string
    // this returns a html element formatting
    // the blocked urls into a list
    make_blocklist() {
        let blocked = this.blocked()
        let html = ['<table>']
        for (let i = 0; i < blocked.length; i++) {
            html.push(`<tr>\n<td>${blocked[i]}</td>\n</tr>`)
        }
        html.push('</table>')
        return html.join('\n')
    }

    // admin(serverAddress:string, data:string):string
    // this takes in the host address as well as the http request
    // then it returns a webpage as a string to be returned based on
    // the url
    admin(serverAddress, data) {
        if (!this.is_admin(serverAddress)) {
            return this.admin_error()
        }
        let url = this.get_url(data)
        let page = url.split('admin/')[1].split('/')
        switch (page[0]) {
            case 'logs':
                return this.admin_logs()
            case 'blocklist':
                return this.admin_block()
            case 'metrics':
                return this.admin_metrics()
            case 'block':
                this.block(page[1])
                return this.admin_block()
            case 'unblock':
                this.unblock(page[1])
                return this.admin_block()
            case '':
                return this.admin_home()
            case 'favicon.ico':
                return '<></>'
            default:
                return this.admin_error()
        }
    }

    // admin_block():string
    // this returns a webpage of the blocked urls and a form to
    // block & unblock urls
    admin_block() {
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
            <a href="http://admin/logs">View Logs</a><br>
            <a href="http://admin/blocklist">Edit Blocklist</a><br>
            <a href="http://admin/metrics">View Metrics</a><br>
            </div>
            <div>
                ${this.make_blocklist()}
            </div>
            <form>
                <label for="url">URL:</label><br>
                <input type="text" id="url" name="url"><br>
                <button type="button" onClick="block_url()">BLOCK</button><button type="button" onClick="unblock_url()">UNBLOCK</button>
            </form>
        </body>
        <script>
        function block_url() {
            let url = document.getElementById("url").value;
            fetch("http://admin/block/"+url, {
            headers: {
                'Accept': 'text/html'
            }
            })
            .then(response =>{console.log(response.text())})
            .then(text => console.log(text))
        }
        function unblock_url() {
            let url = document.getElementById("url").value;
            fetch("http://admin/unblock/"+url, {
            headers: {
                'Accept': 'text/html'
            }
            })
            .then(response =>{console.log(response.text())})
            .then(text => console.log(text))
        }
        </script>
        </html>
        `)
    }

    // admin_metrics():string
    // this returns a webpage of all information
    // stored in this.urls
    admin_metrics() {
        return (`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ADMIN CONTROL</title>
        </head>
        <style>
        td {width:40px;}
        </style>
        <body>
            <h1>Proxy Server Metrics</h1><br>
            <a href="http://admin/logs">View Logs</a><br>
            <a href="http://admin/blocklist">Edit Blocklist</a><br>
            <a href="http://admin/metrics">View Metrics</a><br>
            </div>
            <div>
                ${this.make_metrics()}
            </div>
        </body>
        </html>
        `)
    }

    // admin_logs():string
    // this returns a webpage of all the logs stored
    // in this.log
    admin_logs() {
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
            <a href="http://admin/logs">View Logs</a><br>
            <a href="http://admin/blocklist">Edit Blocklist</a><br>
            <a href="http://admin/metrics">View Metrics</a><br>
            </div>
            <div>
                ${this.make_log()}
            </div>
        </body>
        </html>
        `)
    }

    // admin_error():string
    // thsi returns an error webpage
    admin_error() {
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

    // admin_home():string
    // this returns the homepage of the admin console
    admin_home() {
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
            <a href="http://admin/logs">View Logs</a><br>
            <a href="http://admin/blocklist">Edit Blocklist</a><br>
            <a href="http://admin/metrics">View Metrics</a><br>
            </div>
        </body>
        </html>
        `)
    }

    // is_admin(host:string):bool
    // this checks to see if the host is 'admin'
    // this will access the management console
    is_admin(host) {
        return host === "admin"
    }

    // get_url(data:string):string
    // this returns the url from a http request
    get_url(data) {
        return data.split('GET')[1].split('HTTP')[0].trim()
    }
}