export interface BaseNetworkObjectT {
    get(url: string, options?: { headers: Record<string, string> }): Promise<Response>,
    post(url: string, options?: { headers: Record<string, string>, body: string }): Promise<Response>
    onopen(): void,
    onclose(): void,
    onerror(): void
}
export class BaseNetworkObject implements BaseNetworkObjectT {
    get!: (url: string) => Promise<Response>;
    post!: (url: string) => Promise<Response>
    onopen!: () => void;
    onclose!: () => void;
    onerror!: () => void;
    constructor() {
        this.get = (_url: string, _options?: object) => Promise.resolve(new Response());
        this.post = (_url: string, _options?: object) => Promise.resolve(new Response());
        this.onopen = () => void 0;
        this.onclose = () => void 0;
        this.onerror = () => void 0;
    }
}