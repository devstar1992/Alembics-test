const ethers = require("ethers");

class ReconnectableEthers {
    /** 
     * Constructs the class
    */
    constructor() {
        this.provider = undefined;
        this.config   = undefined;
        
        this.KEEP_ALIVE_CHECK_INTERVAL = 1000;

        this.keepAliveInterval = undefined;
        this.pingTimeout       = undefined;
    }

    /**
     * Load assets.
     * @param {Object} config Config object.
     */
    load(config) {
        this.config = config;
        this.provider = new ethers.providers.WebSocketProvider(this.config["PROVIDER_ADDRESS"])
      
        
        this.defWsOpen    = this.provider._websocket.onopen;
        this.defWsClose   = this.provider._websocket.onclose;

        this.provider._websocket.onopen    = (event) => this.onWsOpen(event);
        this.provider._websocket.onclose   = (event) => this.onWsClose(event);
    }

    /**
     * Check class is loaded.
     * @returns Bool
     */
    isLoaded() {
        if (!this.provider) return false;
        return true;
    }

    /**
     * Triggered when provider's websocket is open.
     */
    onWsOpen(event) {
        console.log("Connected to the WS!");
        this.keepAliveInterval = setInterval(() => { 
            if (
                this.provider._websocket.readyState === 0 ||
                this.provider._websocket.readyState === 1
            ) return;

            this.provider._websocket.close();
        }, this.KEEP_ALIVE_CHECK_INTERVAL)
        if (this.defWsOpen) this.defWsOpen(event);
    }

    /**
     * Triggered on websocket termination.
     * Tries to reconnect again.
     */
    onWsClose(event) {
        console.log("WS connection lost! Reconnecting...");
        clearInterval(this.keepAliveInterval)
        this.load(this.config);

        if (this.defWsClose) this.defWsClose(event);
    }
}

module.exports = ReconnectableEthers;