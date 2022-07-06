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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var axios_1 = __importDefault(require("axios"));
var adm_zip_1 = __importDefault(require("adm-zip"));
var tar_1 = __importDefault(require("tar"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
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
                stdio: 'pipe',
                windowsHide: true,
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
    Ngrok.getLatestDownloadUrl = function () {
        return "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-".concat(process.platform === 'win32' ? 'windows' : process.platform, "-").concat(process.arch === 'x64' ? 'amd64' : process.arch === 'mipsel' ? 'mipsle' : process.platform, ".").concat(['linux', 'freebsd', 'netbsd'].includes(process.platform) ? 'tgz' : 'zip');
    };
    Ngrok.downloadNgrok = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = Ngrok.getLatestDownloadUrl();
                        console.log(url);
                        return [4 /*yield*/, (0, axios_1.default)({
                                method: 'get',
                                url: url,
                                responseType: 'arraybuffer'
                            })];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    Ngrok.decompressNgrok = function (data, type) {
        if (type === void 0) { type = ['linux', 'freebsd', 'netbsd'].includes(process.platform) ? 'tgz' : 'zip'; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (res) { return __awaiter(_this, void 0, void 0, function () {
                        var zip_1, entries, files, fname, file, d;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(type === 'zip')) return [3 /*break*/, 1];
                                    zip_1 = new adm_zip_1.default(data);
                                    entries = zip_1.getEntries();
                                    files = entries.map(function (entry) {
                                        return {
                                            name: entry.name,
                                            data: zip_1.readFile(entry)
                                        };
                                    });
                                    res(files.find(function (f) { return f.name.includes('ngrok'); }).data);
                                    return [3 /*break*/, 6];
                                case 1:
                                    fname = "./ngrok_packed-".concat(Date.now(), ".tgz");
                                    fs_1.default.writeFileSync(fname, data);
                                    try {
                                        fs_1.default.mkdirSync('./ngrok_extract');
                                    }
                                    catch (_b) {
                                        fs_1.default.rmSync('./ngrok_extract', { recursive: true });
                                        fs_1.default.mkdirSync('./ngrok_extract');
                                    }
                                    return [4 /*yield*/, tar_1.default.extract({
                                            C: './ngrok_extract',
                                            file: fname,
                                        })];
                                case 2:
                                    _a.sent();
                                    file = fs_1.default.readdirSync('./ngrok_extract').find(function (f) { return f.includes('ngrok'); });
                                    return [4 /*yield*/, fs_1.default.promises.readFile("./ngrok_extract/".concat(file))];
                                case 3:
                                    d = _a.sent();
                                    return [4 /*yield*/, fs_1.default.promises.rm("./ngrok_extract", { recursive: true })];
                                case 4:
                                    _a.sent();
                                    return [4 /*yield*/, fs_1.default.promises.rm(fname)];
                                case 5:
                                    _a.sent();
                                    res(d);
                                    _a.label = 6;
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    Ngrok.installRaw = function (data, pathname) {
        if (pathname === void 0) { pathname = process.platform === 'win32' ? path_1.default.join(process.env.USERPROFILE, '.ngrok') : path_1.default.join(process.env.HOME, '.ngrok'); }
        if (!fs_1.default.existsSync(pathname)) {
            fs_1.default.mkdirSync(pathname, { recursive: true });
        }
        fs_1.default.writeFileSync(path_1.default.join(pathname, "ngrok".concat(process.platform === 'win32' ? '.exe' : '')), data);
        if (process.platform === 'win32') {
            child_process_1.default.exec('setx PATH "%PATH%;' + pathname + '"');
            child_process_1.default.exec('set PATH "%PATH%;' + pathname + '"');
        }
        else {
            child_process_1.default.exec('export PATH="' + pathname + ':$PATH"');
            console.log("Installation completed. please put `export PATH=\"".concat(pathname, ":$PATH\"` in your ~/.bashrc or similar file."));
        }
    };
    Ngrok.install = function (pathname) {
        return __awaiter(this, void 0, void 0, function () {
            var data, unzipped;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Ngrok.downloadNgrok()];
                    case 1:
                        data = _a.sent();
                        return [4 /*yield*/, Ngrok.decompressNgrok(data)];
                    case 2:
                        unzipped = _a.sent();
                        Ngrok.installRaw(unzipped, pathname);
                        return [2 /*return*/];
                }
            });
        });
    };
    return Ngrok;
}());
exports.default = Ngrok;
//# sourceMappingURL=index.js.map