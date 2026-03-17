## Try It Right Now — No Account Required

```bash
npm install -g @sipheron/vdr-cli

# Verify any document instantly
sipheron verify ./your-document.pdf

# Anchor any document to Solana
sipheron anchor ./your-document.pdf
```

Works on devnet immediately. No signup. No API key.
No blockchain knowledge required.

---

# SipHeron VDR CLI

Anchor and verify documents on Solana from your terminal. No account required.

## Commands

### `sipheron anchor <file>`
Anchor a document's fingerprint to the Solana blockchain.
```bash
sipheron anchor ./contract.pdf
```

### `sipheron verify <file|hash>`
Verify a document's authenticity against its blockchain anchor.
```bash
sipheron verify ./contract.pdf
sipheron verify a3f4b2c...
```

### `sipheron status <hash>`
Check the blockchain confirmation status of an anchor.

### `sipheron login`
Authenticate with your SipHeron API key to use mainnet and manage records.

### `sipheron list`
List your anchored documents.

### `sipheron certificate <id>`
Download the PDF notarization certificate for an anchor.

## Options

- `-f, --format <format>`: Output format (`human`, `json`, `quiet`)
- `-n, --network <network>`: Target network (`devnet`, `mainnet`)
- `--onchain`: Anchor directly on-chain using local Solana keypair (`~/.config/solana/id.json`)
