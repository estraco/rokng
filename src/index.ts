import cp from 'child_process';
import axios from 'axios';
import Adm from 'adm-zip';
import tar from 'tar';
import fs from 'fs';
import path from 'path';

export class NgrokProcess<T> {
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

    static async waitForData(tunnel: NgrokProcess<{
        host: string;
        port: number;
        stdout: Buffer;
        stderr: Buffer;
    }>, delay = 100): Promise<{
        host: string;
        port: number;
        stdout: Buffer;
        stderr: Buffer;
    }> {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (tunnel.getData().host) {
                    clearInterval(interval);
                    resolve(tunnel.getData());
                }
            }, delay);
        });
    }

}

export default class Ngrok {
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
                stdio: 'pipe',
                windowsHide: true,
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

    static getLatestDownloadUrl(): string {
        return `https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-${process.platform === 'win32' ? 'windows' : process.platform}-${process.arch === 'x64' ? 'amd64' : process.arch === 'mipsel' ? 'mipsle' : process.platform}.${(['linux', 'freebsd', 'netbsd'] as NodeJS.Platform[]).includes(process.platform) ? 'tgz' : 'zip'}`;
    }

    static async downloadNgrok(): Promise<Buffer> {
        const url = Ngrok.getLatestDownloadUrl();
        console.log(url);

        const { data } = await axios({
            method: 'get',
            url,
            responseType: 'arraybuffer'
        })

        return data;
    }

    static async decompressNgrok(data: Buffer, type: 'zip' | 'tgz' = (['linux', 'freebsd', 'netbsd'] as NodeJS.Platform[]).includes(process.platform) ? 'tgz' : 'zip') {
        return new Promise<Buffer>(async res => {
            if (type === 'zip') {
                const zip = new Adm(data);

                const entries = zip.getEntries();

                const files = entries.map(entry => {
                    return {
                        name: entry.name,
                        data: zip.readFile(entry)
                    }
                });

                res(files.find(f => f.name.includes('ngrok')).data as Buffer);
            } else {
                const fname = `./ngrok_packed-${Date.now()}.tgz`;
                fs.writeFileSync(fname, data);
                try {
                    fs.mkdirSync('./ngrok_extract');
                } catch {
                    fs.rmSync('./ngrok_extract', { recursive: true });
                    fs.mkdirSync('./ngrok_extract');
                }

                await tar.extract({
                    C: './ngrok_extract',
                    file: fname,
                });

                const file = fs.readdirSync('./ngrok_extract').find(f => f.includes('ngrok'));

                const d = await fs.promises.readFile(`./ngrok_extract/${file}`);

                await fs.promises.rm(`./ngrok_extract`, { recursive: true });
                await fs.promises.rm(fname);

                res(d);
            }
        });
    }

    static installRaw(data: Buffer, pathname: string = process.platform === 'win32' ? path.join(process.env.USERPROFILE, '.ngrok') : path.join(process.env.HOME, '.ngrok')): void {
        if (!fs.existsSync(pathname)) {
            fs.mkdirSync(pathname, { recursive: true });
        }

        fs.writeFileSync(path.join(pathname, `ngrok${process.platform === 'win32' ? '.exe' : ''}`), data);

        if (process.platform === 'win32') {
            cp.exec('setx PATH "%PATH%;' + pathname + '"');
            cp.exec('set PATH "%PATH%;' + pathname + '"');
        } else {
            cp.exec('export PATH="' + pathname + ':$PATH"');
            console.log(`Installation completed. please put \`export PATH="${pathname}:$PATH"\` in your ~/.bashrc or similar file, then run \`source {file}\` with {file} replaced with the file you edited.`);
        }
    }

    static async install(pathname?: string) {
        const data = await Ngrok.downloadNgrok();

        const unzipped = await Ngrok.decompressNgrok(data);

        Ngrok.installRaw(unzipped, pathname);
    }

    static get isInstalled(): boolean {
        if (process.platform === 'win32') {
            const data = cp.execSync('where ngrok');
            return data.toString().includes('ngrok.exe');
        } else {
            const data = cp.execSync('which ngrok');
            return data.toString().includes('ngrok');
        }
    }
}
