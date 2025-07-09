import { BaseConnectionObject } from "../connection-generator";
import { WispConnectionWrapper } from "./wisp-connection-wrapper";
import { WispRequestWrapper } from "./wisp-request-wrappers";
import { WispConnstatusWrapper } from "./wisp-connstatus-wrapper";
import type { WispConnectionT, WispConnectionWS } from "./wisp-interfaces";

export class Connection extends BaseConnectionObject implements WispConnectionT {
    connection: WispConnectionWS;
    constructor(server_url: string) {
        super(server_url);
        this.connection = WispConnectionWrapper(server_url);
        Object.assign(this, WispRequestWrapper(this));
        WispConnstatusWrapper(this);
    }
}
