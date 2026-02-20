import { useMemo, type ReactNode } from "react";
import { FiveMTransport } from "../adapter/FiveMTransport";
import { MockTransport } from "../adapter/MockTransport";
import { RpcClient } from "../service/RpcClient";
import { RpcContext } from "./context";

export type RpcProviderProps = {
    resourceName?: string;
    timeoutMs?: number;
    mock?: MockTransport;
    children: ReactNode;
};

export function RpcProvider({ resourceName, timeoutMs, mock, children }: RpcProviderProps) {
    const client = useMemo(() => {
        const transport =
            mock ??
            new FiveMTransport({
                resourceName,
                timeout: timeoutMs,
            });

        return new RpcClient(transport, { timeoutMs });
    }, [resourceName, timeoutMs, mock]);

    return <RpcContext.Provider value={client}>{children}</RpcContext.Provider>;
}
