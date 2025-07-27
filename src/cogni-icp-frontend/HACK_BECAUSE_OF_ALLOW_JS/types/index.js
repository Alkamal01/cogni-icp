// Define blockchain-related constants
export const BLOCKCHAIN_NETWORKS = {
    XION_MAINNET: 'xion-mainnet',
    XION_TESTNET: 'xion-testnet',
    ETHEREUM_MAINNET: '1',
    ETHEREUM_GOERLI: '5'
};
// Define transaction types
export var TransactionType;
(function (TransactionType) {
    TransactionType["PAYMENT"] = "payment";
    TransactionType["NFT_MINT"] = "nft_mint";
    TransactionType["TOKEN_TRANSFER"] = "token_transfer";
})(TransactionType || (TransactionType = {}));
