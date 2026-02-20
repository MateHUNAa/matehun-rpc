import { useCallback, useEffect, useRef, useState } from "react";
import { useRpc } from "./useRpc";
import type { RpcQueryState, RpcQueryOptions } from "../model/RpcTypes";

type UseRpcQueryResult<T> = RpcQueryState<T> & {
    refetch: () => Promise<void>;
};

export function useRpcQuery<T = unknown>(
    route: string,
    payload?: unknown,
    options?: RpcQueryOptions & { server?: boolean },
): UseRpcQueryResult<T> {
    const client = useRpc();
    const [state, setState] = useState<RpcQueryState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const payloadRef = useRef(payload);
    payloadRef.current = payload;

    const optionsRef = useRef(options);
    optionsRef.current = options;

    const fetchData = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
            const opts = optionsRef.current;
            const callOptions = opts?.timeout ? { timeout: opts.timeout } : undefined;

            const result = opts?.server
                ? await client.callServer<T>(route, payloadRef.current, callOptions)
                : await client.call<T>(route, payloadRef.current, callOptions);

            setState({ data: result, loading: false, error: null });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setState((prev) => ({ ...prev, loading: false, error: message }));
        }
    }, [route, client]);

    useEffect(() => {
        if (options?.enabled === false) return;
        fetchData();
    }, [fetchData, options?.enabled]);

    return {
        ...state,
        refetch: fetchData,
    };
}
