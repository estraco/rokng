/// <reference types="node" />
declare class NgrokProcess<T> {
    pid: number;
    type: string;
    private data;
    constructor(type: string, pid: number, data: T);
    getData(): T;
    setData(data: T): void;
    setPID(pid: number): void;
    setType(type: string): void;
    kill(): void;
}
declare class Ngrok {
    path: string;
    constructor(path?: string);
    setAuthToken(token: string): Promise<number>;
    startTCPTunnel(port: number, authtoken?: string): Promise<NgrokProcess<{
        host: string;
        port: number;
        stdout: Buffer;
        stderr: Buffer;
    }>>;
    startHTTPSTunnel(port: number, authtoken?: string): Promise<NgrokProcess<{
        host: string;
        port: number;
        stdout: Buffer;
        stderr: Buffer;
        url: URL;
    }>>;
}
export default Ngrok;
