import { useCallback, useRef, useState } from "react";
import { useRpc } from "./useRpc";
import type { RpcMutationState, RpcCallOptions } from "../model/RpcTypes";

type UseRpcMutationOptions = RpcCallOptions & {
    server?: boolean;
};

type UseRpcMutationResult<TPayload, TResult> = RpcMutationState & {
    mutate: (payload?: TPayload) => Promise<TResult | null>;
    reset: () => void;
};

export function useRpcMutation<TPayload = unknown, TResult = unknown>(
    route: string,
    options?: UseRpcMutationOptions,
): UseRpcMutationResult<TPayload, TResult> {
    const client = useRpc();
    const [state, setState] = useState<RpcMutationState>({
        loading: false,
        error: null,
    });

    const optionsRef = useRef(options);
    optionsRef.current = options;

    const mutate = useCallback(
        async (payload?: TPayload): Promise<TResult | null> => {
            setState({ loading: true, error: null });

            try {
                const opts = optionsRef.current;
                const callOptions = opts?.timeout ? { timeout: opts.timeout } : undefined;

                const result = opts?.server
                    ? await client.callServer<TResult>(route, payload, callOptions)
                    : await client.call<TResult>(route, payload, callOptions);

                setState({ loading: false, error: null });
                return result;
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                setState({ loading: false, error: message });
                return null;
            }
        },
        [route, client],
    );

    const reset = useCallback(() => {
        setState({ loading: false, error: null });
    }, []);

    return {
        ...state,
        mutate,
        reset,
    };
}
