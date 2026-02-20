export type RpcResponse<T> = {
    success: boolean;
    data: T;
};

export interface RpcTransport {
    post<T = unknown>(route: string, payload?: unknown, timeout?: number): Promise<RpcResponse<T>>;
}

export type NuiMessageData<T = unknown> = {
    action: string;
    data: T;
    __rpcId?: string;
};

export type RpcCallOptions = {
    timeout?: number;
};

export type RpcQueryState<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
};

export type RpcQueryOptions = RpcCallOptions & {
    enabled?: boolean;
};

export type RpcMutationState = {
    loading: boolean;
    error: string | null;
};

export type MockHandler<T = unknown> = (payload: unknown) => T | Promise<T>;
