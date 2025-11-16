import { LoggerFactory } from './logger.factory';
import { DevLogger } from './dev.logger';
import { JsonLogger } from './json.logger';
import { TskvLogger } from './tskv.logger';

describe('LoggerFactory', () => {
  const originalEnv = process.env.LOGGER_TYPE;

  afterEach(() => {
    process.env.LOGGER_TYPE = originalEnv;
  });

  describe('create', () => {
    it('should create DevLogger when LOGGER_TYPE is "dev"', () => {
      process.env.LOGGER_TYPE = 'dev';
      const logger = LoggerFactory.create();
      expect(logger).toBeInstanceOf(DevLogger);
    });

    it('should create JsonLogger when LOGGER_TYPE is "json"', () => {
      process.env.LOGGER_TYPE = 'json';
      const logger = LoggerFactory.create();
      expect(logger).toBeInstanceOf(JsonLogger);
    });

    it('should create TskvLogger when LOGGER_TYPE is "tskv"', () => {
      process.env.LOGGER_TYPE = 'tskv';
      const logger = LoggerFactory.create();
      expect(logger).toBeInstanceOf(TskvLogger);
    });

    it('should create DevLogger by default when LOGGER_TYPE is not set', () => {
      delete process.env.LOGGER_TYPE;
      const logger = LoggerFactory.create();
      expect(logger).toBeInstanceOf(DevLogger);
    });

    it('should create DevLogger for unknown LOGGER_TYPE', () => {
      process.env.LOGGER_TYPE = 'unknown';
      const logger = LoggerFactory.create();
      expect(logger).toBeInstanceOf(DevLogger);
    });
  });
});
