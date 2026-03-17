"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const conf_1 = __importDefault(require("conf"));
const store = new conf_1.default({
    projectName: 'sipheron',
    defaults: {
        network: 'devnet',
        defaultFormat: 'human'
    }
});
exports.config = {
    getApiKey: () => store.get('apiKey'),
    setApiKey: (key) => store.set('apiKey', key),
    clearApiKey: () => store.delete('apiKey'),
    getNetwork: () => store.get('network'),
    setNetwork: (n) => store.set('network', n),
    getFormat: () => store.get('defaultFormat'),
    isAuthenticated: () => !!store.get('apiKey')
};
