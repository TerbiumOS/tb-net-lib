// @ts-nocheck definitions are wonky
import type { WispConnectionT, WispConnectionWS } from "./wisp-interfaces";
export function WispConnstatusWrapper(connection: WispConnectionT): void {
    var conn: WispConnectionWS = connection.connection;
    conn.onopen = () => { connection.onopen?.() };
    conn.onclose = () => { connection.onclose?.() };
    conn.onerror = () => { connection.onerror?.() };
    Object.defineProperty(connection, "connected", {
        get() {
          return conn.connected;
        },
        configurable: true,
        enumerable: true
    });
    Object.defineProperty(connection, "connecting", {
        get() {
          return conn.connecting;
        },
        configurable: true,
        enumerable: true
    });
    return void 0;
}