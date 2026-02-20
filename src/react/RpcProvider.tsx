import { useMemo, type ReactNode } from "react";
import { FiveMTransport } from "../adapter/FiveMTransport";
import { RpcClient } from "../service/RpcClient";
import { RpcContext } from "./context";

export type RpcProviderProps = {
    resourceName: string;
    timeoutMs?: number;
    children: ReactNode;
};

export function RpcProvider({ resourceName, timeoutMs, children }: RpcProviderProps) {
    const client = useMemo(() => {
        const transport = new FiveMTransport({ resourceName });
        return new RpcClient(transport, { timeoutMs });
    }, [resourceName, timeoutMs]);

    return <RpcContext.Provider value={client}>{children}</RpcContext.Provider>;
}
