import { BaseNetworkObject } from "./request-generator";
export type ConnectionPossibleStates = "connected" | "connecting" | "disconnected" | "error" | undefined;
export interface BaseConnectionObjectT {
    ws_server: string;
    state: ConnectionPossibleStates;
    connected: boolean;
    connecting?: boolean | undefined;
}
export class BaseConnectionObject extends BaseNetworkObject implements BaseConnectionObjectT {
    constructor(
        public ws_server: string,
        public state: ConnectionPossibleStates = undefined,
        public connected: boolean = false,
        public connecting?: boolean | undefined
    ) {
        super();
    };
    setState(newState: ConnectionPossibleStates): void {
        this.state = newState;
    };
    getState(): ConnectionPossibleStates {
        return this.state;
    };
    setConnStatus(connected: boolean, connecting?: boolean): void {
        this.connected = connected;
        if (typeof connecting != "undefined") this.connecting = connecting;
    };
    getConnectStatus(): boolean {
        return this.connected;
    };
    getConnectingStatus(): (boolean | undefined) {
        return this.connecting;
    }
}