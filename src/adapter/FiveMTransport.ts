import type { RpcTransport, RpcResponse } from "../model/RpcTypes";

export type FiveMTransportOptions = {
    resourceName?: string;
    timeout?: number;
};

export class FiveMTransport implements RpcTransport {
    private readonly resourceName: string;
    private readonly timeout: number;

    constructor(options?: FiveMTransportOptions) {
        this.resourceName = options?.resourceName ?? (window as any).GetParentResourceName?.() ?? "unknown";
        this.timeout = options?.timeout ?? 10000;
    }

    async post<T = unknown>(route: string, payload?: unknown, timeout?: number): Promise<RpcResponse<T>> {
        const controller = new AbortController();
        const ms = timeout ?? this.timeout;
        const timer = setTimeout(() => controller.abort(), ms);

        try {
            const res = await fetch(`https://${this.resourceName}/${route}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload ?? {}),
                signal: controller.signal,
            });

            if (!res.ok) {
                return {
                    success: false,
                    data: `HTTP ${res.status}: ${res.statusText}` as unknown as T,
                };
            }

            const json = await res.json();
            return json as RpcResponse<T>;
        } catch (err: unknown) {
            if (err instanceof DOMException && err.name === "AbortError") {
                return {
                    success: false,
                    data: `RPC call to '${route}' timed out after ${ms}ms` as unknown as T,
                };
            }

            const message = err instanceof Error ? err.message : String(err);

            return {
                success: false,
                data: `RPC transport error on '${route}': ${message}` as unknown as T,
            };
        } finally {
            clearTimeout(timer);
        }
    }
}
