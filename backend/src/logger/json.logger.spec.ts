import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;

  beforeEach(() => {
    logger = new JsonLogger();
  });

  describe('log', () => {
    it('should log message in JSON format', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.log('Test message');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const loggedOutput = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(loggedOutput);

      expect(parsed).toHaveProperty('timestamp');
      expect(parsed.level).toBe('log');
      expect(parsed.message).toBe('Test message');

      consoleSpy.mockRestore();
    });

    it('should log with optional parameters', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.log('Test message', { key: 'value' });

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const loggedOutput = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(loggedOutput);

      expect(parsed.level).toBe('log');
      expect(parsed.message).toBe('Test message');
      // Проверяем, что дополнительные параметры присутствуют в объекте
      expect(parsed).toHaveProperty('0');

      consoleSpy.mockRestore();
    });

    it('should include ISO timestamp', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.log('Test message');

      const loggedOutput = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(loggedOutput);

      expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      consoleSpy.mockRestore();
    });
  });

  describe('error', () => {
    it('should log error in JSON format', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      logger.error('Error message');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const loggedOutput = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(loggedOutput);

      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('Error message');

      consoleSpy.mockRestore();
    });

    it('should log error with stack trace', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      logger.error('Error message', 'Stack trace here');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const loggedOutput = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(loggedOutput);

      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('Error message');

      consoleSpy.mockRestore();
    });
  });

  describe('warn', () => {
    it('should log warning in JSON format', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      logger.warn('Warning message');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const loggedOutput = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(loggedOutput);

      expect(parsed.level).toBe('warn');
      expect(parsed.message).toBe('Warning message');

      consoleSpy.mockRestore();
    });
  });

  describe('debug', () => {
    it('should log debug in JSON format', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      logger.debug('Debug message');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const loggedOutput = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(loggedOutput);

      expect(parsed.level).toBe('debug');
      expect(parsed.message).toBe('Debug message');

      consoleSpy.mockRestore();
    });
  });

  describe('verbose', () => {
    it('should log verbose in JSON format', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      logger.verbose('Verbose message');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const loggedOutput = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(loggedOutput);

      expect(parsed.level).toBe('verbose');
      expect(parsed.message).toBe('Verbose message');

      consoleSpy.mockRestore();
    });
  });

  describe('JSON format validation', () => {
    it('should produce valid JSON for all log levels', () => {
      const methods: Array<{
        method: keyof JsonLogger;
        expectedLevel: string;
      }> = [
        { method: 'log', expectedLevel: 'log' },
        { method: 'error', expectedLevel: 'error' },
        { method: 'warn', expectedLevel: 'warn' },
        { method: 'debug', expectedLevel: 'debug' },
        { method: 'verbose', expectedLevel: 'verbose' },
      ];

      methods.forEach(({ method, expectedLevel }) => {
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'debug').mockImplementation();
        jest.spyOn(console, 'info').mockImplementation();

        logger[method]('Test message');

        let loggedOutput: string | undefined;
        if (method === 'log') {
          loggedOutput = (console.log as jest.Mock).mock.calls[0][0];
        } else if (method === 'error') {
          loggedOutput = (console.error as jest.Mock).mock.calls[0][0];
        } else if (method === 'warn') {
          loggedOutput = (console.warn as jest.Mock).mock.calls[0][0];
        } else if (method === 'debug') {
          loggedOutput = (console.debug as jest.Mock).mock.calls[0][0];
        } else if (method === 'verbose') {
          loggedOutput = (console.info as jest.Mock).mock.calls[0][0];
        }

        expect(() => JSON.parse(loggedOutput!)).not.toThrow();
        const parsed = JSON.parse(loggedOutput!);
        expect(parsed.level).toBe(expectedLevel);

        jest.restoreAllMocks();
      });
    });
  });
});
