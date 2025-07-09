export interface BaseNetworkObjectT {
    get(url: string, port?: number): Promise<Response>,
    onopen(): void,
    onclose(): void,
    onerror(): void
}
export class BaseNetworkObject implements BaseNetworkObjectT {
    get!: (url: string) => Promise<Response>;
    onopen!: () => void;
    onclose!: () => void;
    onerror!: () => void;
    constructor() {
        this.get = (_url: string, _port?: number) => Promise.resolve(new Response());
        this.onopen = () => void 0;
        this.onclose = () => void 0;
        this.onerror = () => void 0;
    }
}