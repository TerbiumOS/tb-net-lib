import { NetManager, type NetConnection } from "./net-base/net-manager";
export { NetManager, type NetConnection };

interface ConnectionMethods {
    onConnectionOpen: (callback: (() => void) | (() => Promise<void>)) => void;
    onConnectionClose: (callback: (() => void) | (() => Promise<void>)) => void;
    onConnectionError: (callback: (() => void) | (() => Promise<void>)) => void;
    get: (url: string, options?: { headers: Record<string, string> }) => Promise<Response>
}
interface CastAsWithListeners {
    [key: string]: unknown,
    active: ConnectionMethods
}

const BlankActive: ConnectionMethods = {
    onConnectionOpen: (): void => {},
    onConnectionClose: (): void => {},
    onConnectionError: (): void => {},
    get: (): Promise<Response> => Promise.resolve(new Response())
}

/**
 * Network Manager for managing multiple proxy methods.
 * @class
 */
export default class NetMan {
    [key: string]: ConnectionMethods | NetConnection | any;
    default_server: string;
    active_network: string;
    connected_networks: Record<string, NetConnection>;
    active: ConnectionMethods = BlankActive
    /**
     * Initializes a new network manager instance
     */
    constructor() {
        this.default_server = "wss://wispserver.dev/wisp/";
        this.active_network = "";
        this.connected_networks = {};
    };
    /**
     * Sets the active network used by the network connection
     * @param {string} name The name of the network to use as the active network
     * @returns {void}
     */
    setActiveNetwork(name: keyof typeof this.connected_networks): void {
        if (name in this.connected_networks) {
            this.active_network = name;
            this.active = this[name] as ConnectionMethods;
        } else console.error(`NetMan: No such network named "${name}" exists! Maybe it hasn't been created yet?`);
    };
    /**
     * Returns the current active network used by the Network Manager instance
     * @returns {String} The active network
     */
    getActiveNetwork(): string {
        return this.active_network;
    }
    /**
     * Returns the current active network the network manager instance is using unless there is none present
     * @returns {Object} The current conection
     */
    resolveActiveNetwork(): NetConnection | undefined {
        if (this.active_network) return this.connected_networks[this.active_network];
        else console.error("NetMan: Could not resolve the current active network. Maybe you forgot to call (instance).setActiveNetwork?"); return void 0;
    }
    /**
     * Connect a new network and attach it to the network manager instance
     * @param {string} name The name that will be given to the new connection
     * @param {string} type The type of connection to open (such as wisp)
     * @param {string} [server=this.default_server] The server URL to connct to
     * @returns {void}
     */
    connectNetwork(name: string, type: string, server: string = this.default_server): void {
        if (name in this.connected_networks) {
            console.error(`NetMan: A network connection named "${name}" already exists! Try deleting it first with (instance).disconnectNetwork("${name}")`);
            return;
        }
        try {
            var newConn: NetConnection = NetManager.create(type, server);
            this.connected_networks[name] = newConn;
            // for the love of god dont touch this unless you know what exactly youre doing
            (this as CastAsWithListeners)[name] = {
                onConnectionOpen: (callback: (() => void) | (() => Promise<void>)): void => {this.connected_networks[name].onopen = callback },
                onConnectionClose: (callback: (() => void) | (() => Promise<void>)): void => { this.connected_networks[name].onclose = callback },
                onConnectionError: (callback: (() => void) | (() => Promise<void>)): void => { this.connected_networks[name].onerror = callback },
                get: this.connected_networks[name].get
            } satisfies ConnectionMethods;
        } catch(err) {
            console.error(`NetMan: Error occured whilist adding network`);
            console.error(err instanceof Error ? err.stack : err);
        };
    };
    /**
     * Disconnects the current network from the list of availible networks
     * @param {string} name The name of the network connection to disconnect
     * @returns {void}
     */
    disconnectNetwork(name: keyof typeof this.connected_networks): void {
        if (name in this.connected_networks) {
            try {
                var netDisc = this.connected_networks[name];
                // @ts-expect-error no interface
                netDisc.connection!.ws.close(1000);
                delete this.connected_networks[name];
            } catch(err) {
                console.error(`NetMan: Error occured whilist removing a network`);
                console.error(err instanceof Error ? err.stack : err);
            }
        } else console.error(`NetMan: Could not find a network named "${name}"! Maybe it has already been deleted?`); return;
    };
    /**
     * Disconnects the active network in use by the network manager instance
     * @returns {void}
     */
    disconnectActiveNetwork(): void {
        if (this.connected_networks[this.active_network]) {
            try {
                var netDisc = this.connected_networks[this.active_network];
                // @ts-expect-error
                netDisc.connection.ws.close(1000);
                delete this.connected_networks[this.active_network];
                this.active_network = "";
            } catch(err) {
                console.error(`NetMan: Error occured whilist removing the active network`);
                console.error(err instanceof Error ? err.stack : err);
            }
        } else console.error(`NetMan: Could not find the active network to delete! Maybe it hasn't been set as the active network?`); return;
    }
    get get() {
        let resolved = this.resolveActiveNetwork()?.get
        if (resolved) return resolved;
        else {
            console.error("NetMan: Could not resolve the GET request function from the active network. Maybe you forgot to call (instance).setActiveNetwork?");
            return () => Promise.resolve(new Response(null, { status: 424 }));
        }
    }
}