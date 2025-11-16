import { TskvLogger } from './tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;

  beforeEach(() => {
    logger = new TskvLogger();
  });

  describe('log', () => {
    it('should log message in TSKV format', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.log('Test message');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const loggedOutput = consoleSpy.mock.calls[0][0];

      expect(loggedOutput).toContain('timestamp=');
      expect(loggedOutput).toContain('level=log');
      expect(loggedOutput).toContain('message=Test message');

      consoleSpy.mockRestore();
    });

    it('should format TSKV with tab separators', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.log('Test message');

      const loggedOutput = consoleSpy.mock.calls[0][0];
      expect(loggedOutput).toMatch(/timestamp=.*\tlevel=.*\tmessage=/);

      consoleSpy.mockRestore();
    });

    it('should log with object parameters', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.log('Test message', { userId: '123', action: 'create' });

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const loggedOutput = consoleSpy.mock.calls[0][0];

      expect(loggedOutput).toContain('userId=123');
      expect(loggedOutput).toContain('action=create');

      consoleSpy.mockRestore();
    });

    it('should log with primitive parameters', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.log('Test message', 'param1', 'param2');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const loggedOutput = consoleSpy.mock.calls[0][0];

      expect(loggedOutput).toContain('param0=param1');
      expect(loggedOutput).toContain('param1=param2');

      consoleSpy.mockRestore();
    });

    it('should include ISO timestamp', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.log('Test message');

      const loggedOutput = consoleSpy.mock.calls[0][0];
      expect(loggedOutput).toMatch(
        /timestamp=\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      );

      consoleSpy.mockRestore();
    });
  });

  describe('error', () => {
    it('should log error in TSKV format', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      logger.error('Error message');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const loggedOutput = consoleSpy.mock.calls[0][0];

      expect(loggedOutput).toContain('level=error');
      expect(loggedOutput).toContain('message=Error message');

      consoleSpy.mockRestore();
    });
  });

  describe('warn', () => {
    it('should log warning in TSKV format', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      logger.warn('Warning message');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const loggedOutput = consoleSpy.mock.calls[0][0];

      expect(loggedOutput).toContain('level=warn');
      expect(loggedOutput).toContain('message=Warning message');

      consoleSpy.mockRestore();
    });
  });

  describe('debug', () => {
    it('should log debug in TSKV format', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      logger.debug('Debug message');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const loggedOutput = consoleSpy.mock.calls[0][0];

      expect(loggedOutput).toContain('level=debug');
      expect(loggedOutput).toContain('message=Debug message');

      consoleSpy.mockRestore();
    });
  });

  describe('verbose', () => {
    it('should log verbose in TSKV format', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      logger.verbose('Verbose message');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const loggedOutput = consoleSpy.mock.calls[0][0];

      expect(loggedOutput).toContain('level=verbose');
      expect(loggedOutput).toContain('message=Verbose message');

      consoleSpy.mockRestore();
    });
  });

  describe('TSKV format validation', () => {
    it('should have all required fields for each log level', () => {
      const methods: Array<{
        method: keyof TskvLogger;
        expectedLevel: string;
        consoleMethod: string;
      }> = [
        { method: 'log', expectedLevel: 'log', consoleMethod: 'log' },
        { method: 'error', expectedLevel: 'error', consoleMethod: 'error' },
        { method: 'warn', expectedLevel: 'warn', consoleMethod: 'warn' },
        { method: 'debug', expectedLevel: 'debug', consoleMethod: 'debug' },
        { method: 'verbose', expectedLevel: 'verbose', consoleMethod: 'info' },
      ];

      methods.forEach(({ method, expectedLevel, consoleMethod }) => {
        jest.restoreAllMocks();
        const consoleSpy = jest
          .spyOn(
            console,
            consoleMethod as 'log' | 'error' | 'warn' | 'debug' | 'info',
          )
          .mockImplementation();

        logger[method]('Test message');

        const loggedOutput = consoleSpy.mock.calls[0][0];
        expect(loggedOutput).toMatch(/timestamp=/);
        expect(loggedOutput).toMatch(`level=${expectedLevel}`);
        expect(loggedOutput).toContain('message=Test message');
      });
    });

    it('should use tabs as separators', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.log('Message', { key1: 'value1', key2: 'value2' });

      const loggedOutput = consoleSpy.mock.calls[0][0];
      const parts = loggedOutput.split('\t');

      expect(parts.length).toBeGreaterThan(2);
      parts.forEach((part) => {
        expect(part).toMatch(/^[^=]+=.*/);
      });

      consoleSpy.mockRestore();
    });
  });
});
