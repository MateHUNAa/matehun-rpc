import type { RpcTransport, NuiMessageData } from "../model/RpcTypes";

export type RpcClientOptions = {
    timeoutMs?: number;
};

export class RpcClient {
    private timeoutMs: number;
    private handlers = new Map<string, (data: unknown) => void>();
    private messageListener: ((event: MessageEvent) => void) | null = null;

    constructor(
        private transport: RpcTransport,
        options?: RpcClientOptions,
    ) {
        this.timeoutMs = options?.timeoutMs ?? 5000;
    }

    register<T = unknown>(action: string, handler: (data: T) => void): () => void {
        this.handlers.set(action, handler as (data: unknown) => void);

        if (!this.messageListener) {
            this.messageListener = (event: MessageEvent<NuiMessageData>) => {
                const { action: eventAction, data } = event.data;
                const h = this.handlers.get(eventAction);
                if (h) h(data);
            };
            window.addEventListener("message", this.messageListener);
        }

        return () => {
            this.handlers.delete(action);
            if (this.handlers.size === 0 && this.messageListener) {
                window.removeEventListener("message", this.messageListener);
                this.messageListener = null;
            }
        };
    }

    async call<T = unknown>(route: string, payload?: unknown): Promise<T> {
        const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("RPC timeout")), this.timeoutMs));

        const request = this.transport.post<T>(route, payload);

        const response = await Promise.race([request, timeout]);

        if (!response.success) {
            throw new Error(String(response.data));
        }

        return response.data;
    }
}
