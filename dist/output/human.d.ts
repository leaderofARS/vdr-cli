export declare const human: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
    label: (key: string, value: string) => void;
    divider: () => void;
    blank: () => void;
    authentic: (anchor: {
        timestamp: string;
        blockNumber: number;
        transactionSignature: string;
        network: string;
    }) => void;
    mismatch: () => void;
    notFound: () => void;
    anchorResult: (result: {
        id: string;
        hash: string;
        transactionSignature: string;
        blockNumber: number;
        timestamp: string;
        status: string;
        verificationUrl: string;
        network: string;
    }) => void;
};
