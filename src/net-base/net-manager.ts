import type { BaseConnectionObjectT } from "./adapters/connection-generator";
import type { BaseNetworkObjectT } from "./adapters/request-generator";
import * as NetworkAdapters from "./adapters/adapters";

type NetConnectorConstructor = new (ws_server: string) => BaseConnectionObjectT & BaseNetworkObjectT;

const NetConnectors: Record<string, NetConnectorConstructor> = {
    wisp: NetworkAdapters.WispAdapter.Connection
}

export type NetConnection = BaseConnectionObjectT & BaseNetworkObjectT;

export class NetManager {
    static create(
        net_type: keyof typeof NetConnectors,
        ws_server: string
    ): NetConnection {
        let Connector = NetConnectors[net_type];
        if (!Connector) {
            throw new Error(`[INTERNAL] NetMan: Unsupported network type "${net_type}"`);
        }
        return new Connector(ws_server);
    }
};