import Ngrok from '.';
import net from 'net';
import http from 'http';
import axios from 'axios';

const ngrok = new Ngrok();

// ngrok.setAuthToken('token');

function testTCP() {
    return new Promise<void>(async (resolve, reject) => {
        try {
            console.log("testTCP");

            const server = new net.Server();

            server.on('connection', (socket) => {
                socket.once('data', (data) => {
                    console.log(data.toString());

                    socket.end('nerd 🤓', () => setTimeout(() => {
                        server.close();

                        tunnel.kill();

                        resolve();
                    }, 1000));
                });
            });

            server.listen(8080);

            const tunnel = await ngrok.startTCPTunnel(8080);

            console.log(tunnel);

            const socket = new net.Socket();

            socket.once('connect', () => {
                socket.write('Hello from client 1');
            });

            socket.on('data', (data) => {
                console.log(`Client 1 received: ${data}`);
            });

            socket.on('error', (err) => {
                console.log(err);
            });

            socket.connect(tunnel.getData());
        } catch (e) {
            reject(e);
        }
    });
}

function testHTTP() {
    return new Promise<void>(async (resolve, reject) => {
        try {
            console.log("testHTTP");

            const server = new http.Server();

            server.once('request', (_, res) => {
                console.log("request");

                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                res.end('nerd 🤓', () => setTimeout(() => {
                    server.close();
                    tunnel.kill();

                    resolve();
                }, 1000));
            });

            server.listen(8081, () => {
                console.log('Server 2 listening on port 8081');
            });

            const tunnel = await ngrok.startHTTPSTunnel(8081);

            console.log(tunnel);

            const { url } = tunnel.getData();

            axios({
                url: url.toString(),
                method: 'GET',
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                }
            }).then(response => {
                console.log(response.data);
            });
        } catch (e) {
            reject(e);
        }
    });
}

async function testAll() {
    await testTCP().catch(e => console.error(e));
    await testHTTP().catch(e => console.error(e));
}

testAll();