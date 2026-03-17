<div align="center">
  <img src="./sipheron_vdap_logo.png" alt="SipHeron VDR Logo" width="300" />
  <h1>SipHeron VDR CLI</h1>
  <p><strong>Anchor and verify documents on the Solana blockchain directly from your terminal.</strong></p>
  
  <p>
    <a href="https://www.npmjs.com/package/@sipheron/vdr-cli"><img src="https://img.shields.io/npm/v/@sipheron/vdr-cli?color=blue&style=for-the-badge" alt="NPM Version" /></a>
    <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/@sipheron/vdr-cli?style=for-the-badge" alt="Node.js" /></a>
    <a href="https://github.com/leaderofARS/vdr-cli/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@sipheron/vdr-cli?style=for-the-badge" alt="License" /></a>
  </p>
</div>

<hr />

**SipHeron VDR CLI** brings the immutable power of the Solana blockchain to your terminal. Authenticate, anchor, and mathematically verify the integrity of your documents instantly without them ever leaving your machine.

---

## 🚀 Try It Right Now — No Account Required

You don't need a SipHeron account to verify or anchor documents on the Solana devnet. Try it immediately:

```bash
# 1. Install globally
npm install -g @sipheron/vdr-cli

# 2. Verify any document instantly
sipheron verify ./your-document.pdf

# 3. Anchor a document to Solana
sipheron anchor ./your-document.pdf
```

*Works on devnet immediately. No signup. No API key. No blockchain knowledge required.*

---

## 📦 Installation

Install globally via NPM or Yarn:

```bash
npm install -g @sipheron/vdr-cli
# or 
yarn global add @sipheron/vdr-cli
```

---

## 🛠️ Usage & Commands

The CLI is designed to be intuitive and powerful, capable of running in zero-knowledge modes where your files are perfectly secure.

### `sipheron anchor <file>`
Anchor a document's cryptographic fingerprint to the Solana blockchain.
```bash
sipheron anchor ./contract.pdf
sipheron anchor ./contract.pdf --name "Partnership Agreement" --tag "legal"
sipheron anchor ./contract.pdf --onchain # Anchor directly using your local Solana wallet
```

### `sipheron verify <file|hash>`
Verify a document's authenticity against its blockchain anchor. The CLI hashes your document locally and queries the blockchain.
```bash
sipheron verify ./contract.pdf
sipheron verify a3f4b2c...
```

### `sipheron status <hash>`
Check the blockchain confirmation status, block number, and timestamp of an anchor.
```bash
sipheron status a3f4b2c...
```

---

## 🔒 Advanced (Hosted Features)

Unlock mainnet anchoring, dashboard analytics, and certified PDF generation by creating a free account at [sipheron.com](https://sipheron.com).

### `sipheron login`
Authenticate your session using your SipHeron API secret key.
```bash
sipheron login
```

### `sipheron list`
List all documents and records you have previously anchored.
```bash
sipheron list
sipheron list --limit 10 --status confirmed
```

### `sipheron certificate <id>`
Download a beautiful, cryptographic PDF notarization certificate for any anchored document.
```bash
sipheron certificate <anchor-id> --out ./certificate.pdf
```

### `sipheron whoami`
View your current authentication status and organization details.

### `sipheron logout`
Securely remove your local API session keys.

---

## ⚙️ Options & Formatting

All commands support flexible output formatting, making the CLI perfect for bash scripting and CI/CD pipelines.

- `-f, --format <format>`: Swap output layout (`human`, `json`, `quiet`). **Quiet** mode suppresses all text and exits with `0` (authentic/success) or `1` (mismatch/error).
- `-n, --network <network>`: Target Solana network (`devnet`, `mainnet`). Defaults to `devnet`.

**Example: Automated CI Pipeline Check**
```bash
if sipheron verify release.tar.gz --format quiet; then
  echo "Release is authentic!"
else
  echo "Release tampered with!"
  exit 1
fi
```

---

## 🛡️ Security & Privacy Promise

**The SipHeron CLI respects Absolute Privacy.** 
At no point does your file ever leave your physical device. The CLI *only* computes the mathematical `SHA-256` digest locally using standard crypto streams. The only payload transmitted to the REST API and the Solana RPC Network is the resulting obscure 64-character hash string.

## 📄 License
This project is open-source and licensed under the MIT License.
