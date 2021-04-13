import ConsoleLogger from '../logger/ConsoleLogger';
import ILogger from '../logger/ILogger';
import { ContextualLogger } from '../logger/LoggerWrapper';

export default class DefaultLoggerBuilder {
    static get inst(): DefaultLoggerBuilder {
        if (!DefaultLoggerBuilder._inst) {
            DefaultLoggerBuilder._inst = new DefaultLoggerBuilder();
        }
        return DefaultLoggerBuilder._inst;
    }

    /** @returns console logger with context */
    build(owner: Object): ILogger {
        return new ContextualLogger(owner.constructor.name, ConsoleLogger.inst);
    }

    private constructor() {}
    private static _inst?: DefaultLoggerBuilder;
}
