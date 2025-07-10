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

    base.get = function(url: string, options?: { headers?: Record<string, string> }): Promise<Response> {
        return new Promise<Response>((res, rej) => {
            var urlObj: URL = new URL(url);
            var stream = conn.create_stream(
                urlObj.hostname,
                urlObj.port ? parseInt(url.split("/")[2].split(":")[1]) : 80
            );
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
            let payload = payloads.get(url, { ...(options?.headers || {}), "User-Agent": "TerbiumNetMan/1.0 (+https://github.com/TerbiumOS/tb-net-lib)"});
            stream.send(new TextEncoder().encode(payload));
        })
    }

    // TODO: Get this to implement headers properly
    base.post = function(url: string, options?: { headers?: Record<string, string>, body?: string }): Promise<Response> {
        return new Promise<Response>((res, rej) => {
            var urlObj: URL = new URL(url);
            var stream = conn.create_stream(
                urlObj.hostname,
                urlObj.port ? parseInt(url.split("/")[2].split(":")[1]) : 80
            );
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
            let payload = payloads.post(url, options?.body || "", { ...(options?.headers || {}), "User-Agent": "TerbiumNetMan/1.0 (+https://github.com/TerbiumOS/tb-net-lib)"}, options?.headers?.["Content-Type"] || undefined);
            stream.send(new TextEncoder().encode(payload));
        })
    };

    return base;
}