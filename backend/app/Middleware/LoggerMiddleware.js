const Logger = use('Logger');

class LoggerMiddleware {
  async handle({ request, response }, next) {
    const requestStart = process.hrtime();

    response.response.on('finish', () => {
      const [sec, nanosec] = process.hrtime(requestStart);
      const responseTime = (sec * 1e9 + nanosec) / 1000000;
      Logger.info(`${request.method()} ${request.url()} ${response.response.statusCode} - ${responseTime} ms`);
    });

    await next();
  }
}

module.exports = LoggerMiddleware;
