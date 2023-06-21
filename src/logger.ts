export interface Logger {
    error(message: string): void;
    error(message: string, error: Error): void;
    debug(message: string): void;
    info(message: string): void;
}
