// @ts-expect-error no types
import { client as wisp } from "@mercuryworkshop/wisp-js/client";
import type { WispConnectionWS } from "./wisp-interfaces";
export function WispConnectionWrapper(wsurl: string): WispConnectionWS {
    var conn: WispConnectionWS = new wisp.ClientConnection(wsurl);
    return conn;
}