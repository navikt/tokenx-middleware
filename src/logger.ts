export interface Logger {
    error(message: string, error: Error): void;
    error(message: string, error: string): void;
    debug(message: string): void;
}
