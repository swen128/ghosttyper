export type Result<T, E = string> = Ok<T> | Err<E>;

export interface Ok<T> {
    kind: 'ok';
    value: T;
}

export interface Err<E = string> {
    kind: 'err';
    error: E;
}
