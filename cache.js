const fs = require('fs')
const MS_PER_MINUTE = 60000
const REFRESH_RATE_MINUTES = 5

/* 
Cacher : class
DES: cacher controls all caching actions of the application including 
reading and writing files, controling when a cache has become invalid ect.

Public Methods:

 - cache(webpage:string, hostname:string) : none
 - is_valid(hostname:string) : Boolean
 - get(hostname: string) : string
*/
module.exports = class Cacher {
    /* 
        web_cache : json object
        DES: stores hostnames which store the filepath of the webpage
        and the time it was last updated

        Example :
        web_cache: {
            www.example.com: {
                filename: "Users/user/currentDirectory/cache/www.example.com.html",
                updated: Date("12/12/12-12:12:12")
            }
        }

        The pre_cache is the same object as the web_cache but can be initalised by the user.
    */
    constructor(pre_cache) {
        this.web_cache = {}
        if (pre_cache) {
            this.web_cache = pre_cache
        }
    }

    // makefilename(hostname:string):string
    // This function takes a hostname (url being accessed) and
    // returns a formated path to where this webpage should be stored.
    make_filename(hostname) {
        hostname = hostname.split('http://').join('')
        hostname = hostname.split('www.').join('')
        hostname = hostname.split('/').join('_')
        return `${__dirname}/cache/${hostname}` 
    }

    // cache(webpage:string, hostname: string): None
    // This function takes a webpage and a hostname (url) and
    // stores the webpage that correspondes to that url.
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

    // get_filename(hostname:string):string
    // This returns the filepath of the location of the cached webpage 
    // if it exists.
    get_filename(hostname) {
        if (this.is_valid(hostname)) {
            return this.web_cache[hostname].filename
        }
        return `${__dirname}/static/error.html`
    }

    // is_valid(hostname:string):bool
    // This returns true if the url exists in the web_cache.
    is_valid(hostname) {
        if (this.exists(hostname) && (this.web_cache[hostname].updated >= Date.now() - (MS_PER_MINUTE * REFRESH_RATE_MINUTES))) {
            return true
        }
        return false
    }

    // get(hostname: string):string
    // this returns the file stored in the cache if it exists.
    // Otherwise it returns an error page
    get(hostname) {
        try {
            if (this.is_valid(hostname)) {
                var file = fs.readFileSync(`${this.get_filename(hostname)}`, { encoding: 'utf8', flag: 'r' });
                return file
            }
        }
        catch (error) {
        }
        var file = fs.readFileSync(`${__dirname}/static/error.html`, { encoding: 'utf8', flag: 'r' });
        return file
    }

    // exists(hostname: string):bool
    // returns true if a hostname/url exists in the cache
    exists(hostname){
        return Object.keys(this.web_cache).includes(hostname)
    }

}

