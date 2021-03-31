import ConsoleLogger from './ConsoleLogger';
import ILogger from './ILogger';
import { CacheableLogger, ContextualLogger } from './LoggerWrapper';

export default class DefaultLoggerBuilder {
    /** @returns cacheable console logger with context */
    static build(owner: Object): ILogger {
        return new CacheableLogger(new ContextualLogger(owner.constructor.name, ConsoleLogger.inst));
    }
}
