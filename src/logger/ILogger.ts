export default interface ILogger {
    debug(...msg: any[]): void;
    info(...msg: any[]): void;
    warn(...msg: any[]): void;
    err(...msg: any[]): void;
}
