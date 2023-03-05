/*     
___  ___             _____                   _             _                     
|  \/  |            /  __ \                 (_)           | |                    
| .  . | __ ___  __ | /  \/_   _ _ __  _ __  _ _ __   __ _| |__   __ _ _ __ ___  
| |\/| |/ _` \ \/ / | |   | | | | '_ \| '_ \| | '_ \ / _` | '_ \ / _` | '_ ` _ \ 
| |  | | (_| |>  <  | \__/\ |_| | | | | | | | | | | | (_| | | | | (_| | | | | | |
\_|  |_/\__,_/_/\_\  \____/\__,_|_| |_|_| |_|_|_| |_|\__, |_| |_|\__,_|_| |_| |_|
                                                      __/ |                      
                                                     |___/                       
______                      _____                                                
| ___ \                    /  ___|                                               
| |_/ / __ _____  ___   _  \ `--.  ___ _ ____   _____ _ __                       
|  __/ '__/ _ \ \/ / | | |  `--. \/ _ \ '__\ \ / / _ \ '__|                      
| |  | | | (_) >  <| |_| | /\__/ /  __/ |   \ V /  __/ |                         
\_|  |_|  \___/_/\_\\__, | \____/ \___|_|    \_/ \___|_|                         
                     __/ |                                                       
                    |___/                                                        
*/

// IMPORTS
const http = require('http')
const net = require('net')
const fs = require('fs')
const server = net.createServer()
const cache = require('./cache')

// global variables
const Manager = require('./manager')
const webcache = new cache()
const application_manager = new Manager()
const HTTPS_PORT = 443
const HTTP_PORT = 80
const DATA_FILE = `${__dirname}/cache_data.csv`

// function used for collecting metrics data
async function store_data(start_time,end_time,file_size,cache) {
    if(file_size===0){
        return
    }
    let difference = end_time-start_time 
    try{
        fs.appendFile(DATA_FILE,`${difference},${file_size*8},${difference===0?"INF":file_size*8/difference},${cache?"YES":"NO"}\n`,()=>{})
    }catch(err){
        console.log(err)
    }
}


function get_url_https(data){
    return data.split('CONNECT')[1].split('HTTP')[0].replace(':443','').trim()
}

server.on("connection", (toProxySocket) => {
    toProxySocket.once("data", (data) => {
        let isHTTP = data.toString().indexOf("CONNECT") === -1

        if (isHTTP) {
            let serverAddress = data.toString().split("Host: ")[1].split("\r\n")[0];
            let url = application_manager.get_url(data.toString())

            // deal with management console
            if (application_manager.is_admin(serverAddress)){
                let file = application_manager.admin(serverAddress,data.toString())
                toProxySocket.write(file, () => {
                    toProxySocket.destroy()
                })
            }
            // deals with non blocked URLs and hosts
            else if (!(application_manager.is_blocked(url) || application_manager.is_blocked(serverAddress))) {
                if (webcache.is_valid(url)) {
                    let file = webcache.get(url)
                    toProxySocket.write(file, () => {
                        toProxySocket.destroy()
                    })
                    application_manager.retrieve(url) // record get from cache
                } else {
                    
                    application_manager.visit(url) // record visit to url
                    var vars = {
                        host: serverAddress,
                        port: HTTP_PORT,
                        path: '/index.html'
                    }
                    // intialise array being used to store the data
                    let incomingdata = [] 
                    // send http request to the destination
                    http.get(vars, function (result) {
                        result.setEncoding('utf8');
                        // every time the server recieves data from the destination
                        // it sends it onto the client and adds it to
                        // the data to be cashed
                        result.on('data', (data) => {
                            incomingdata.push(data)
                            toProxySocket.write(data, () => {
                            })
                        })
                        // when we recieve a FIN packet it caches the webpage
                        // and sends a FIN packet to the client.
                        result.on("close", () => {
                            webcache.cache(incomingdata.join(''), url)
                            toProxySocket.destroy()
                            application_manager.cache(url)
                        })
                    }).on('error', function (err) {
                        //console.log(err)
                    });
                }
            // url or host is blocked
            } else {
                toProxySocket.write(`${serverAddress} or ${url} is blocked`,()=>{toProxySocket.destroy()})
            }
        } else { // is HTTPS
            let serverAddress = data.toString().split("CONNECT")[1].split(" ")[1].split(":")[0];
            let url = get_url_https(data.toString())
            // deals with unblocked urls
            if (!(application_manager.is_blocked(url) || application_manager.is_blocked(serverAddress))) {
                application_manager.visit(url) // log visit to url
                let toServerSocket = net.createConnection(
                    {
                        host: serverAddress,
                        port: HTTPS_PORT
                    }, () => { }
                )
                toProxySocket.write("HTTP/1.1 200 OK\r\n\r\n"); //respond to client
                // set up a connection between the client and destination server 
                toProxySocket.pipe(toServerSocket); 
                toServerSocket.pipe(toProxySocket);

                toProxySocket.on("error", (err) => {
                    console.log(err)
                })
                toServerSocket.on("error", (err) => {
                    console.log(err)
                })
            // url/server is blocked
            } else {
                toProxySocket.write(`${serverAddress} or ${url} is blocked`,()=>{toProxySocket.destroy()})
            }
        }
    })
})

server.on("error", (err) => {
    console.log(err)
})

server.on("close", () => {
    clonsole.log("client disconnected")
})

// start the threaded server on port 9000
server.listen(
    {
        host: "0.0.0.0",
        port: 9000
    }, () => {
        console.log("Server started")
    }
)