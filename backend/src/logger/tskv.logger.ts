import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class TskvLogger implements LoggerService {
  private formatMessage(level: string, message: any, ...optionalParams: any[]) {
    const timestamp = new Date().toISOString();
    let logLine = `timestamp=${timestamp}\tlevel=${level}\tmessage=${message}`;

    // Добавляем дополнительные параметры
    if (optionalParams && optionalParams.length > 0) {
      optionalParams.forEach((param, index) => {
        if (typeof param === 'object') {
          Object.entries(param).forEach(([key, value]) => {
            logLine += `\t${key}=${value}`;
          });
        } else {
          logLine += `\tparam${index}=${param}`;
        }
      });
    }

    return logLine;
  }

  log(message: any, ...optionalParams: any[]) {
    console.log(this.formatMessage('log', message, ...optionalParams));
  }

  error(message: any, ...optionalParams: any[]) {
    console.error(this.formatMessage('error', message, ...optionalParams));
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(this.formatMessage('warn', message, ...optionalParams));
  }

  debug(message: any, ...optionalParams: any[]) {
    console.debug(this.formatMessage('debug', message, ...optionalParams));
  }

  verbose(message: any, ...optionalParams: any[]) {
    console.info(this.formatMessage('verbose', message, ...optionalParams));
  }
}
