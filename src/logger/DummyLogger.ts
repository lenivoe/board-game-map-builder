import ILogger from './ILogger';

export default class DummyLogger implements ILogger {
    debug(..._msg: any[]): void {}
    info(..._msg: any[]): void {}
    warn(..._msg: any[]): void {}
    err(..._msg: any[]): void {}
}
