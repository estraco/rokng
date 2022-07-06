# Ngrok-v3
This package is the unofficial wraper of [ngrok](https://ngrok.com) in a simple to use API.

## Install
```sh
npm install ngrok-v3
```

## Usage
```ts
import { Ngrok } from 'ngrok-v3';


async function main() {
    // check if ngrok is installed
    const installed = Ngrok.isInstalled;

    // if ngrok isn't installed, install it
    if (!installed) {
        Ngrok.install();
    }

    // start a TCP tunnel to port 8080
    const tunnel = await Ngrok.startTCPTunnel(8080);

    // get tunnel data
    const tunnelData = tunnel.getData();

    // get tunnel host and port
    const { host, port } = tunnelData;

    console.log(`Tunnel is up at ${host}:${port}`);

    // stop the tunnel
    tunnel.kill();

    // start an HTTPS tunnel to port 443
    const tunnel2 = await Ngrok.startHTTPSTunnel(443);

    // get tunnel data
    const tunnel2Data = await tunnel2.getData();

    // get tunnel host and port
    const { host: host2, port: port2 } = tunnel2Data;

    console.log(`Tunnel 2 is up at ${host2}:${port2}`);

    // stop the tunnel
    tunnel.kill();
}

main();
```