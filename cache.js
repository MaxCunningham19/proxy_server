const { send } = require('process')
const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
const { isAbsolute } = require('path')

const app = require('express')()
const MS_PER_MINUTE = 60000
const REFRESH_RATE_MINUTES = 5

module.exports = class Cacher {
    constructor(pre_cache){
        this.web_cache = {}
        if (pre_cache){
            this.web_cache = pre_cache
        }
    }
    
    make_filename(hostname) {
        return `${__dirname}/cache/${hostname}.html`
    }
    
    async cache(webpage, hostname) {
        var filename = this.make_filename(hostname)
        fs.writeFile(filename, webpage, err => {
            if (err) {
                console.error(err)
                return
            }
            this.web_cache[hostname] = { filename: filename, updated: Date.now() }
        })
    }
    
    get_filename(hostname) {
        if (this.is_valid(hostname)) {
            return this.web_cache[hostname].filename
        }
        return `${__dirname}/static/error.html`
    }
    
    is_valid(hostname) {
        if (this.web_cache[hostname] === undefined) {
            return false
        }
        if (this.web_cache[hostname].updated < Date.now() - MS_PER_MINUTE * REFRESH_RATE_MINUTES) {
            return false
        }
        return true
    }
    
    get(hostname) {
        try {
            if (this.is_valid(hostname)){
                var file = fs.readFileSync(`${this.get_filename(hostname)}`, { encoding: 'utf8', flag: 'r' });
                return file
            }
        }
        catch (error) {
        }
        var file = fs.readFileSync(`${__dirname}/static/error.html`, { encoding: 'utf8', flag: 'r' });
        return file
    }
    
}

