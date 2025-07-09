// @ts-ignore
import * as payloads from "wisp-payload-gen";
import type { WispConnectionT } from "./wisp-interfaces";
import { BaseNetworkObject, type BaseNetworkObjectT } from "../request-generator"; // reuse

function Preamble_ContentParser(line: string | undefined): ({ code: number, text: string }) {
    const match = line?.match(/^HTTP\/\d\.\d\s+(\d{3})\s+(.*)$/);
    if (!match) throw new Error("Invalid HTTP status line");

    const [, statusCode, statusText] = match;
    return {
        code: parseInt(statusCode, 10),
        text: statusText.trim()
    };
}
function Headers_ContentParser(headersRaw: string) {
    const headers = headersRaw.split(/\r?\n/);
    const { code, text } = Preamble_ContentParser(headers.shift());
    var headerObj = new Headers();
    for (const header of headers) {
        const index = header.indexOf(":");
        if (index > -1) {
            const key = header.substring(0, index).trim();
            const value = header.substring(index + 1).trim();
            headerObj.append(key, value);
        }
    }
    return {
        headers: headerObj,
        status: code,
        statusText: text
    };
}
function ContentParser(rawData: string) {
    const [ headers, body = "" ] = rawData.split("\r\n\r\n");
    return new Response(body, {
        ...Headers_ContentParser(headers)
    });
}

export function WispRequestWrapper(connection: WispConnectionT): BaseNetworkObjectT {
    var conn = connection.connection;
    var base: BaseNetworkObjectT = new BaseNetworkObject();

    base.get = function(url: string, port?: number): Promise<Response> {
        return new Promise<Response>((res, rej) => {
            var stream = conn.create_stream((new URL(url)).hostname, port || 80);
            var accumulated: string = "";
            stream.onmessage = (data) => {
                let text = new TextDecoder().decode(data);
                accumulated += text;
            };
            stream.onclose = (reason) => {
                // @ts-ignore
                if (reason == 0x02) {
                    res(ContentParser(accumulated));
                } else {
                    // @ts-ignore
                    rej("0x"+reason.toString(16).toUpperCase());
                }
            };
            let payload = payloads.get(url);
            stream.send(new TextEncoder().encode(payload));
        })
    }

    return base;
}