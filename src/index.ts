import cp from 'child_process';

class NgrokProcess<T> {
    pid: number;
    type: string;
    private data: T;

    constructor(type: string, pid: number, data: T) {
        this.pid = pid;
        this.data = data;
        this.type = type;
    }

    getData(): T {
        return this.data;
    }

    setData(data: T) {
        this.data = data;
    }

    setPID(pid: number) {
        this.pid = pid;
    }

    setType(type: string) {
        this.type = type;
    }

    kill() {
        process.kill(this.pid);
    }
}

class Ngrok {
    path: string;

    constructor(path?: string) {
        this.path = path || 'ngrok';
    }

    public setAuthToken(token: string) {
        return new Promise<number>(resolve => {
            const proc = cp.spawn(this.path, ['config', 'add-authtoken', token], {
                stdio: 'ignore'
            });

            proc.on('close', (code) => {
                resolve(code);
            });
        })
    }

    public startTCPTunnel(port: number, authtoken?: string) {
        return new Promise<NgrokProcess<{
            host: string;
            port: number;
            stdout: Buffer;
            stderr: Buffer;
        }>>((resolve, reject) => {
            const prc = new NgrokProcess<{
                port: number;
                host: string;
                stdout: Buffer;
                stderr: Buffer;
            }>('TCP Tunnel', -1, {
                stdout: Buffer.alloc(0),
                stderr: Buffer.alloc(0),
                host: '',
                port
            })

            const proc = cp.spawn(this.path, ['tcp', port.toString(), '--log', 'stdout', ...(authtoken ? ['--authtoken', authtoken] : [])], {
                stdio: 'pipe'
            });

            prc.setPID(proc.pid);

            proc.stdout.on('data', (data) => {
                const dat = prc.getData();

                prc.setData({
                    ...dat,
                    stdout: Buffer.concat([dat.stdout, data])
                })

                const d = data.toString().match(/url=(tcp:\/\/[\S\d.-]+(?:|(?=:\d+)))/);

                if (d) {
                    const [, url] = d
                    const { hostname, port } = new URL(url);

                    prc.setData({
                        ...prc.getData(),
                        host: hostname,
                        port: parseInt(port)
                    })

                    resolve(prc);
                }
            });

            proc.stderr.on('data', (data) => {
                const dat = prc.getData();

                prc.setData({
                    ...dat,
                    stderr: Buffer.concat([dat.stderr, data])
                });
            });

            proc.on('close', (code) => {
                if (code !== 0)
                    reject({
                        code,
                        ...prc.getData()
                    });
            });
        });
    }

    public startHTTPSTunnel(port: number, authtoken?: string) {
        return new Promise<NgrokProcess<{
            host: string;
            port: number;
            stdout: Buffer;
            stderr: Buffer;
            url: URL;
        }>>((resolve, reject) => {
            const prc = new NgrokProcess<{
                port: number;
                host: string;
                stdout: Buffer;
                stderr: Buffer;
                url: URL;
            }>('HTTP Tunnel', -1, {
                stdout: Buffer.alloc(0),
                stderr: Buffer.alloc(0),
                host: '',
                port: 0,
                url: new URL('http://localhost:0')
            })

            const proc = cp.spawn(this.path, ['http', port.toString(), '--log', 'stdout', ...(authtoken ? ['--authtoken', authtoken] : [])], {
                stdio: 'pipe'
            });

            prc.setPID(proc.pid);

            proc.stdout.on('data', (data) => {
                const dat = prc.getData();

                prc.setData({
                    ...dat,
                    stdout: Buffer.concat([dat.stdout, data])
                });

                const d = data.toString().match(/url=(http(?:s):\/\/[\S\d.-]+(?:|(?=:\d+)))/);

                if (d) {
                    const [, url] = d;
                    const u = new URL(url);
                    const { hostname, port } = u;
                    prc.setData({
                        ...prc.getData(),
                        host: hostname,
                        port: port ? parseInt(port) : 443,
                        url: u
                    })

                    resolve(prc)
                }
            });

            proc.stderr.on('data', (data) => {
                const dat = prc.getData();

                prc.setData({
                    ...dat,
                    stderr: Buffer.concat([dat.stderr, data])
                })
            });

            proc.on('close', (code) => {
                if (code !== 0)
                    reject({
                        code,
                        ...prc.getData()
                    })
            });
        });
    }
}

export default Ngrok;