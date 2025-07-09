import type { BaseConnectionObjectT } from "../connection-generator";
export interface WispConnectionStream {
    hostname: string,
    port: number,
    ws: WebSocket,
    buffer_size: number,
    stream_id: number,
    connection: WispConnectionWS,
    stream_type: number,
    send_buffer: Uint8Array[],
    open: boolean,
    onopen: (data?: Uint8Array) => void,
    onclose: (data?: Uint8Array) => void,
    onerror: (data?: Uint8Array) => void,
    onmessage: (data?: Uint8Array) => void,
    send: (data?: Uint8Array) => void,
}
export interface WispConnectionWS {
    wisp_url: string,
    max_buffer_size: number | null,
    active_streams: Record<number, WispConnectionStream>,
    connected: boolean,
    connecting: boolean,
    next_stream_id: number,
    ws: WebSocket,
    create_stream(hostname: string, port: number, type?: "tcp" | "udp"): WispConnectionStream;
    close_stream(stream: WispConnectionStream, reason: number): void;
    on_ws_close(): void;
    on_ws_msg(event: MessageEvent): void;
}
export interface WispConnectionT extends BaseConnectionObjectT {
    connection: WispConnectionWS
}