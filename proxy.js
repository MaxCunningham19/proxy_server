const http = require('http')
const https = require('https')
const net = require('net')
const server = net.createServer()
const cache = require('./cache')
const HTTPS_PORT = 443
const HTTP_PORT = 80
const Manager = require('./manager')

const webcache = new cache()

const application_manager = new Manager()

server.on("connection", (toProxySocket) => {
    toProxySocket.once("data", (data) => {
        let isHTTP = data.toString().indexOf("CONNECT") === -1

        if (isHTTP) {
            let serverAddress = data.toString().split("Host: ")[1].split("\r\n")[0];
            //console.log(serverAddress)
            if (application_manager.is_admin(serverAddress)){
                let file = application_manager.admin(serverAddress,data.toString())
                toProxySocket.write(file, () => {
                    toProxySocket.destroy()
                })
            }
            else if (!application_manager.is_blocked(serverAddress)) {
                application_manager.visit(serverAddress)
                if (webcache.is_valid(serverAddress)) {
                    let file = webcache.get(serverAddress)
                    toProxySocket.write(file, () => {
                        toProxySocket.destroy()
                    })
                } else {
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
                            webcache.cache(incomingdata.join(''), serverAddress)
                            toProxySocket.destroy()
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
            //console.log(serverAddress)
            if (!application_manager.is_blocked(serverAddress)) {
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