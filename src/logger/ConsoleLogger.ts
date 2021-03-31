import ILogger from './ILogger';

/** глобальный логгер с выводом в консоль браузера */
export default class ConsoleLogger implements ILogger {
    static get inst(): ConsoleLogger {
        if (!ConsoleLogger._inst) {
            ConsoleLogger._inst = new ConsoleLogger();
        }
        return ConsoleLogger._inst;
    }

    debug(...msg: any[]): void {
        console.debug('[DEBUG]', ...msg);
    }
    info(...msg: any[]): void {
        console.info('[INFO]', ...msg);
    }
    warn(...msg: any[]): void {
        console.warn('[WARN]', ...msg);
    }
    err(...msg: any[]): void {
        console.error('[DEBUG]', ...msg);
    }

    private constructor() {}
    private static _inst?: ConsoleLogger;
}
