const { createLogger, transports, format } = require("winston");
const { combine, timestamp, simple, colorize, printf } = format;

const WinstonDaily = require('winston-daily-rotate-file');


const printFormat = printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level} : ${message}`;
});

const logFormat = {
    file: combine(
        timestamp({
            format: "YYYY-MM-DD HH:mm:dd"
        }),
        printFormat,
    ),
    console: combine(
        colorize(),
        simple()
    )
};

const opts = {
    file: new WinstonDaily({
        datePattern: 'YYYY-MM-DD',
        dirname: "./app/logs",
        filename: '%DATE%.log',
        maxFiles: 30,
        zippedArchive: true,
        level: "info",
        format: logFormat.file,
    }),
    console: new transports.Console({
        level: "info",
        format: logFormat.console,
    }),
}

const logger = createLogger({
    transports: [opts.file],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(opts.console);
}


// log 처리
const log = (response, url) => {
    if (response.error) {
        logger.error(
            `${url.method} ${url.path} ${url.status} "Response: { success: ${response.success}, ${response.error} }"`
        );
    }
    else {
        logger.info(
            `${url.method} ${url.path} ${url.status} "Response: { success: ${response.success}, msg: ${response.msg} }"`
        );
    }
};

module.exports = { logger, log };