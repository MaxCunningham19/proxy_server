const http = require('http')
const https = require('https')
const net = require('net')
const server = net.createServer()
const cache = require('./cache')
const HTTPS_PORT = 443
const HTTP_PORT = 80

const GET = "GET http://www.example.com/ HTTP/1.1 Cache-Control: max-age=0 Upgrade-Insecure-Requests: 1 User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7 Accept-Encoding: gzip, deflate Accept-Language: en-GB,en-US;q=0.9,en;q=0.8"

const webcache = new cache({ servicea: { filename: "/Users/maxcunningham/Desktop/College_Year_22_23/adv_computer_networks/ass1/cache/servicea.html", updated: Date.now() } })

server.on("connection", (toProxySocket) => {
    toProxySocket.once("data", (data) => {
        let isHTTP = data.toString().indexOf("CONNECT") === -1

        if (isHTTP) {

            let serverAddress = data.toString().split("Host: ")[1].split("\r\n")[0];
            console.log(serverAddress)
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
                        webcache.cache(incomingdata.join(''),serverAddress)
                        toProxySocket.destroy()
                    })
                }).on('error', function (err) {
                    //console.log(err)
                });
            }
        } else { // is HTTPS
            let serverAddress = data.toString().split("CONNECT")[1].split(" ")[1].split(":")[0];
            console.log(serverAddress)
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