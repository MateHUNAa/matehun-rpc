import type { RpcTransport, RpcResponse, MockHandler } from "../model/RpcTypes";

export type MockTransportOptions = {
    latency?: number;
};

export class MockTransport implements RpcTransport {
    private readonly handlers = new Map<string, MockHandler>();
    private readonly latency: number;

    constructor(options?: MockTransportOptions) {
        this.latency = options?.latency ?? 50;
    }

    on<T = unknown>(route: string, handler: MockHandler<T>): () => void {
        this.handlers.set(route, handler as MockHandler);

        return () => {
            this.handlers.delete(route);
        };
    }

    async post<T = unknown>(route: string, payload?: unknown, _timeout?: number): Promise<RpcResponse<T>> {
        if (this.latency > 0) {
            await new Promise((resolve) => setTimeout(resolve, this.latency));
        }

        const handler = this.handlers.get(route);

        if (!handler) {
            return {
                success: false,
                data: `[MockTransport] No handler registered for '${route}'` as unknown as T,
            };
        }

        try {
            const result = await Promise.resolve(handler(payload));
            return { success: true, data: result as T };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return {
                success: false,
                data: `[MockTransport] Handler error on '${route}': ${message}` as unknown as T,
            };
        }
    }
}
