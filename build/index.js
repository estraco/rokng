"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = __importDefault(require("child_process"));
var NgrokProcess = /** @class */ (function () {
    function NgrokProcess(type, pid, data) {
        this.pid = pid;
        this.data = data;
        this.type = type;
    }
    NgrokProcess.prototype.getData = function () {
        return this.data;
    };
    NgrokProcess.prototype.setData = function (data) {
        this.data = data;
    };
    NgrokProcess.prototype.setPID = function (pid) {
        this.pid = pid;
    };
    NgrokProcess.prototype.setType = function (type) {
        this.type = type;
    };
    NgrokProcess.prototype.kill = function () {
        process.kill(this.pid);
    };
    return NgrokProcess;
}());
var Ngrok = /** @class */ (function () {
    function Ngrok(path) {
        this.path = path || 'ngrok';
    }
    Ngrok.prototype.setAuthToken = function (token) {
        var _this = this;
        return new Promise(function (resolve) {
            var proc = child_process_1.default.spawn(_this.path, ['config', 'add-authtoken', token], {
                stdio: 'ignore'
            });
            proc.on('close', function (code) {
                resolve(code);
            });
        });
    };
    Ngrok.prototype.startTCPTunnel = function (port, authtoken) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var prc = new NgrokProcess('TCP Tunnel', -1, {
                stdout: Buffer.alloc(0),
                stderr: Buffer.alloc(0),
                host: '',
                port: port
            });
            var proc = child_process_1.default.spawn(_this.path, __spreadArray(['tcp', port.toString(), '--log', 'stdout'], (authtoken ? ['--authtoken', authtoken] : []), true), {
                stdio: 'pipe'
            });
            prc.setPID(proc.pid);
            proc.stdout.on('data', function (data) {
                var dat = prc.getData();
                prc.setData(__assign(__assign({}, dat), { stdout: Buffer.concat([dat.stdout, data]) }));
                var d = data.toString().match(/url=(tcp:\/\/[\S\d.-]+(?:|(?=:\d+)))/);
                if (d) {
                    var url = d[1];
                    var _a = new URL(url), hostname = _a.hostname, port_1 = _a.port;
                    prc.setData(__assign(__assign({}, prc.getData()), { host: hostname, port: parseInt(port_1) }));
                    resolve(prc);
                }
            });
            proc.stderr.on('data', function (data) {
                var dat = prc.getData();
                prc.setData(__assign(__assign({}, dat), { stderr: Buffer.concat([dat.stderr, data]) }));
            });
            proc.on('close', function (code) {
                if (code !== 0)
                    reject(__assign({ code: code }, prc.getData()));
            });
        });
    };
    Ngrok.prototype.startHTTPSTunnel = function (port, authtoken) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var prc = new NgrokProcess('HTTP Tunnel', -1, {
                stdout: Buffer.alloc(0),
                stderr: Buffer.alloc(0),
                host: '',
                port: 0,
                url: new URL('http://localhost:0')
            });
            var proc = child_process_1.default.spawn(_this.path, __spreadArray(['http', port.toString(), '--log', 'stdout'], (authtoken ? ['--authtoken', authtoken] : []), true), {
                stdio: 'pipe'
            });
            prc.setPID(proc.pid);
            proc.stdout.on('data', function (data) {
                var dat = prc.getData();
                prc.setData(__assign(__assign({}, dat), { stdout: Buffer.concat([dat.stdout, data]) }));
                var d = data.toString().match(/url=(http(?:s):\/\/[\S\d.-]+(?:|(?=:\d+)))/);
                if (d) {
                    var url = d[1];
                    var u = new URL(url);
                    var hostname = u.hostname, port_2 = u.port;
                    prc.setData(__assign(__assign({}, prc.getData()), { host: hostname, port: port_2 ? parseInt(port_2) : 443, url: u }));
                    resolve(prc);
                }
            });
            proc.stderr.on('data', function (data) {
                var dat = prc.getData();
                prc.setData(__assign(__assign({}, dat), { stderr: Buffer.concat([dat.stderr, data]) }));
            });
            proc.on('close', function (code) {
                if (code !== 0)
                    reject(__assign({ code: code }, prc.getData()));
            });
        });
    };
    return Ngrok;
}());
exports.default = Ngrok;
//# sourceMappingURL=index.js.map