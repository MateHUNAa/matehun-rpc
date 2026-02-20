import { type MutableRefObject, useEffect, useRef } from "react";
import { useRpc } from "./useRpc";

type NuiHandlerSignature<T> = (data: T) => void;

export function useNuiEvent<T = unknown>(action: string, handler: (data: T) => void): void {
    const client = useRpc();
    const savedHandler: MutableRefObject<NuiHandlerSignature<T>> = useRef(handler);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        return client.register<T>(action, (data) => {
            savedHandler.current(data);
        });
    }, [action, client]);
}
