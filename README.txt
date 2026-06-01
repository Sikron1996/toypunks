ToyPunks ready mint site

1) Open app.js
2) Replace PASTE_CONTRACT_ADDRESS_HERE with your deployed NFT collection contract address
3) Set RPC_URL if your contract is not on Ethereum mainnet
4) Set MAX_SUPPLY and MINT_PRICE_ETH if needed
5) Upload to Vercel/GitHub like before

Expected contract function:
- mint(uint256 quantity) payable
- totalSupply() view returns (uint256)

If your contract uses another function name like publicMint(uint256), change ABI and writeContract.mint(...) in app.js.
