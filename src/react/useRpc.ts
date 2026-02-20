import { useContext } from "react";
import { RpcContext } from "./context";

export function useRpc() {
    const client = useContext(RpcContext);

    if (!client) {
        throw new Error("useRpc must be used inside RpcProvider");
    }

    return client;
}
