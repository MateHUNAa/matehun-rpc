import { createContext } from "react";
import { RpcClient } from "../service/RpcClient";

export const RpcContext = createContext<RpcClient | null>(null);
