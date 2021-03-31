import ILogger from './ILogger';

abstract class LoggerWrapper implements ILogger {
    constructor(readonly logger: ILogger) {}
    abstract debug(...msg: any[]): void;
    abstract info(...msg: any[]): void;
    abstract warn(...msg: any[]): void;
    abstract err(...msg: any[]): void;
}

/** добавляет ко всем сообщениям префикс - контекст */
export class ContextualLogger extends LoggerWrapper {
    constructor(readonly context: string, logger: ILogger) {
        super(logger);
    }

    debug(...msg: any[]): void {
        this.logger.debug(`${this.context}:`, ...msg);
    }
    info(...msg: any[]): void {
        this.logger.info(`${this.context}:`, ...msg);
    }
    warn(...msg: any[]): void {
        this.logger.warn(`${this.context}:`, ...msg);
    }
    err(...msg: any[]): void {
        this.logger.err(`${this.context}:`, ...msg);
    }
}

/** кеширует аргументы до их вывода */
export class CacheableLogger extends LoggerWrapper {
    debug(...msg: any[]): void {
        this.logger.debug(CacheableLogger.cache(msg));
    }
    info(...msg: any[]): void {
        this.logger.info(CacheableLogger.cache(msg));
    }
    warn(...msg: any[]): void {
        this.logger.warn(CacheableLogger.cache(msg));
    }
    err(...msg: any[]): void {
        this.logger.err(CacheableLogger.cache(msg));
    }

    private static cache(msg: any[]): [] {
        return JSON.parse(JSON.stringify(msg));
    }
}
