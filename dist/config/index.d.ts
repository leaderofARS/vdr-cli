export declare const config: {
    getApiKey: () => string | undefined;
    setApiKey: (key: string) => void;
    clearApiKey: () => void;
    getNetwork: () => "devnet" | "mainnet";
    setNetwork: (n: "devnet" | "mainnet") => void;
    getFormat: () => "human" | "json" | "quiet";
    isAuthenticated: () => boolean;
};
