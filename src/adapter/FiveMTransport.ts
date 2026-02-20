import type { RpcTransport, RpcResponse } from "../model/RpcTypes";

export type FiveMTransportOptions = {
    resourceName?: string;
};

export class FiveMTransport implements RpcTransport {
    private resourceName: string;

    constructor(options?: FiveMTransportOptions) {
        this.resourceName = options?.resourceName ?? (window as any).GetParentResourceName?.() ?? "unknown";
    }

    async post<T = unknown>(route: string, payload?: unknown): Promise<RpcResponse<T>> {
        const res = await fetch(`https://${this.resourceName}/${route}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload ?? {}),
        });

        const json = await res.json();

        return json as RpcResponse<T>;
    }
}
