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
const server = net.createServer()
const cache = require('./cache')
const HTTPS_PORT = 443
const Manager = require('./manager')

const webcache = new cache()

const application_manager = new Manager()

function get_url_https(data){
    return data.split('CONNECT')[1].split('HTTP')[0].replace(':443','').trim()
}

server.on("connection", (toProxySocket) => {
    toProxySocket.once("data", (data) => {
        let isHTTP = data.toString().indexOf("CONNECT") === -1

        if (isHTTP) {
            let serverAddress = data.toString().split("Host: ")[1].split("\r\n")[0];
            let url = application_manager.get_url(data.toString())
            if (application_manager.is_admin(serverAddress)){
                let file = application_manager.admin(serverAddress,data.toString())
                toProxySocket.write(file, () => {
                    toProxySocket.destroy()
                })
            }
            else if (!(application_manager.is_blocked(url) || application_manager.is_blocked(serverAddress))) {
                if (webcache.is_valid(url)) {
                    let file = webcache.get(url)
                    toProxySocket.write(file, () => {
                        toProxySocket.destroy()
                    })
                    application_manager.retrive(url)
                } else {
                    application_manager.visit(url)

                    var vars = {
                        host: serverAddress,
                        port: 80,
                        path: '/index.html'
                    }
                    let incomingdata = []
                    http.get(vars, function (result) {
                        result.setEncoding('utf8');
                        result.on('data', (data) => {
                            incomingdata.push(data)
                            toProxySocket.write(data, () => {
                            })
                        })
                        result.on("close", () => {
                            webcache.cache(incomingdata.join(''), url)
                            toProxySocket.destroy()
                            application_manager.cache(url)
                        })
                    }).on('error', function (err) {
                        //console.log(err)
                    });
                }
            } else {
                toProxySocket.write(`${serverAddress} is blocked`,()=>{toProxySocket.destroy()})
            }
        } else { // is HTTPS
            let serverAddress = data.toString().split("CONNECT")[1].split(" ")[1].split(":")[0];
            let url = get_url_https(data.toString())
            if (!(application_manager.is_blocked(url) || application_manager.is_blocked(serverAddress))) {
                application_manager.visit(serverAddress)
                let toServerSocket = net.createConnection(
                    {
                        host: serverAddress,
                        port: HTTPS_PORT
                    }, () => { }
                )
                toProxySocket.write("HTTP/1.1 200 OK\r\n\r\n");
                toProxySocket.pipe(toServerSocket);
                toServerSocket.pipe(toProxySocket);

                toProxySocket.on("error", (err) => {
                    console.log(err)
                })
                toServerSocket.on("error", (err) => {
                    console.log(err)
                })
            } else {
                toProxySocket.write(`${serverAddress} is blocked`,()=>{toProxySocket.destroy()})
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


server.listen(
    {
        host: "0.0.0.0",
        port: 9000
    }, () => {
        console.log("Server started")
    }
)