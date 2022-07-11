"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = __importDefault(require("."));
var net_1 = __importDefault(require("net"));
var http_1 = __importDefault(require("http"));
var axios_1 = __importDefault(require("axios"));
var ngrok = new _1.default();
// ngrok.setAuthToken('token');
function testTCP() {
    var _this = this;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var server_1, tunnel_1, socket_1, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log("testTCP");
                    server_1 = new net_1.default.Server();
                    server_1.on('connection', function (socket) {
                        socket.once('data', function (data) {
                            console.log(data.toString());
                            socket.end('nerd 🤓', function () { return setTimeout(function () {
                                server_1.close();
                                tunnel_1.kill();
                                resolve();
                            }, 1000); });
                        });
                    });
                    server_1.listen(8080);
                    return [4 /*yield*/, ngrok.startTCPTunnel(8080)];
                case 1:
                    tunnel_1 = _a.sent();
                    console.log(tunnel_1);
                    socket_1 = new net_1.default.Socket();
                    socket_1.once('connect', function () {
                        socket_1.write('Hello from client 1');
                    });
                    socket_1.on('data', function (data) {
                        console.log("Client 1 received: ".concat(data));
                    });
                    socket_1.on('error', function (err) {
                        console.log(err);
                    });
                    socket_1.connect(tunnel_1.getData());
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    reject(e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
}
function testHTTP() {
    var _this = this;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var server_2, tunnel_2, url, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log("testHTTP");
                    server_2 = new http_1.default.Server();
                    server_2.once('request', function (_, res) {
                        console.log("request");
                        res.writeHead(200, {
                            'Content-Type': 'text/plain'
                        });
                        res.end('nerd 🤓', function () { return setTimeout(function () {
                            server_2.close();
                            tunnel_2.kill();
                            resolve();
                        }, 1000); });
                    });
                    server_2.listen(8081, function () {
                        console.log('Server 2 listening on port 8081');
                    });
                    return [4 /*yield*/, ngrok.startHTTPSTunnel(8081)];
                case 1:
                    tunnel_2 = _a.sent();
                    console.log(tunnel_2);
                    url = tunnel_2.getData().url;
                    (0, axios_1.default)({
                        url: url.toString(),
                        method: 'GET',
                        headers: {
                            'ngrok-skip-browser-warning': 'true',
                        }
                    }).then(function (response) {
                        console.log(response.data);
                    });
                    return [3 /*break*/, 3];
                case 2:
                    e_2 = _a.sent();
                    reject(e_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
}
// async function testAll() {
//     await testTCP().catch(e => console.error(e));
//     await testHTTP().catch(e => console.error(e));
// }
// testAll();
if (!_1.default.isInstalled)
    _1.default.install().then(function () {
        console.log('ngrok installed');
    });
//# sourceMappingURL=test.js.map