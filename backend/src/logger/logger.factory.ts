import { DevLogger } from './dev.logger';
import { JsonLogger } from './json.logger';
import { TskvLogger } from './tskv.logger';

export class LoggerFactory {
  static create() {
    const loggerType = process.env.LOGGER_TYPE || 'dev';

    switch (loggerType) {
      case 'json':
        return new JsonLogger();
      case 'tskv':
        return new TskvLogger();
      case 'dev':
      default:
        return new DevLogger();
    }
  }
}
