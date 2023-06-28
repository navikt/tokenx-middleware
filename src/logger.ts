export interface Logger {
    error(message: string): void;
    error(message: string, error: Error): void;
    info(message: string): void;
}
