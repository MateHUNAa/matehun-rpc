import type { RpcTransport, NuiMessageData, RpcCallOptions } from "../model/RpcTypes";

export type RpcClientOptions = {
    timeoutMs?: number;
};

type InternalHandler = (data: unknown) => unknown | Promise<unknown>;

const PROXY_ROUTE = "__rpc:proxy";
const RESPONSE_ROUTE = "__rpc:response";

export class RpcClient {
    private readonly timeoutMs: number;
    private readonly handlers = new Map<string, InternalHandler>();
    private messageListener: ((event: MessageEvent) => void) | null = null;

    constructor(
        private readonly transport: RpcTransport,
        options?: RpcClientOptions,
    ) {
        this.timeoutMs = options?.timeoutMs ?? 10000;
        this.ensureMessageListener();
    }

    private ensureMessageListener(): void {
        if (this.messageListener) return;

        this.messageListener = (event: MessageEvent<NuiMessageData>) => {
            const payload = event.data;
            if (!payload?.action) return;

            const { action, data, __rpcId } = payload;
            const handler = this.handlers.get(action);

            if (__rpcId && handler) {
                Promise.resolve()
                    .then(() => handler(data))
                    .then((result) => {
                        this.transport.post(RESPONSE_ROUTE, { __rpcId, data: result });
                    })
                    .catch((err: unknown) => {
                        const message = err instanceof Error ? err.message : String(err);
                        this.transport.post(RESPONSE_ROUTE, { __rpcId, data: { __error: message } });
                    });
                return;
            }

            if (handler) {
                handler(data);
            }
        };

        window.addEventListener("message", this.messageListener);
    }

    register<T = unknown>(action: string, handler: (data: T) => unknown | Promise<unknown>): () => void {
        this.handlers.set(action, handler as InternalHandler);

        return () => {
            this.handlers.delete(action);
        };
    }

    async call<T = unknown>(route: string, payload?: unknown, options?: RpcCallOptions): Promise<T> {
        const ms = options?.timeout ?? this.timeoutMs;

        const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`RPC call to '${route}' timed out after ${ms}ms`)), ms));

        const request = this.transport.post<T>(route, payload, ms);

        const response = await Promise.race([request, timeout]);

        if (!response.success) {
            throw new Error(typeof response.data === "string" ? response.data : String(response.data));
        }

        return response.data;
    }

    async callServer<T = unknown>(route: string, payload?: unknown, options?: RpcCallOptions): Promise<T> {
        return this.call<T>(PROXY_ROUTE, { route, data: payload }, options);
    }

    async send(route: string, payload?: unknown): Promise<void> {
        await this.transport.post(route, payload);
    }

    dispose(): void {
        if (this.messageListener) {
            window.removeEventListener("message", this.messageListener);
            this.messageListener = null;
        }
        this.handlers.clear();
    }
}
