export type RpcResponse<T> = {
    success: boolean;
    data: T;
};

export interface RpcTransport {
    post<T = unknown>(route: string, payload?: unknown): Promise<RpcResponse<T>>;
}

export type NuiMessageData<T = unknown> = {
    action: string;
    data: T;
};
