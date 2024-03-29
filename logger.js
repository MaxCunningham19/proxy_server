
/*
Log:class
This class manages recording and logging all vistis to websites,
caches, retrivals, blocking, and unblocking

public methods (ALL)

DES: contains a list of strings storing all the logged information
*/
module.exports = class Log {
    // log:[string]
    // log stores all logged actions 
    constructor() {
        this.log = []
    }

    format_date(date_ob){
        return `@${date_ob.getFullYear() + "/" + ("0" + (date_ob.getMonth() + 1)).slice(-2) + "/" + ("0" + date_ob.getDate()).slice(-2) + "-" + date_ob.getHours() + ":" + date_ob.getMinutes() + ":" + date_ob.getSeconds()}`
    }
    
    // block(url:string):None
    // Stores when a url is blocked
    async block(url) {
        let date_ob = new Date();
        this.log.push(`${this.format_date(date_ob)} BLOCKED: ${url}`)
    }

    // unblock(url:string):None
    // Stores whenever a url is blocked
    async unblock(url) {
        let date_ob = new Date();
        this.log.push(`${this.format_date(date_ob)} UNBLOCKED: ${url}`)
    }

    // visit(url:string):None
    // Stores when ever a url is visited
    async visit(url) {
        let date_ob = new Date();
        this.log.push(`${this.format_date(date_ob)} VISITED: ${url}`)
    }

    // retrieve(url:string):None
    // stores when a webpage is retirved from cache
    async retrieve(url){
        let date_ob = new Date();
        this.log.push(`${this.format_date(date_ob)} RETRIEVED: ${url}`)
    }

    // cache(url:string):None
    // stores when a url is added to the cache
    async cache(url){
        let date_ob = new Date();
        this.log.push(`${this.format_date(date_ob)} CACHED: ${url}`)
    }

    // toString():string
    // returns the logs as a single string with '\n' between them
    toString() {
        return this.log.join('\n')
    }

    // list():[string]
    // returns the entire log
    list(){
        return this.log
    }
}