# 🛡️ License Guard

[![npm version](https://img.shields.io/npm/v/license-guard.svg)](https://www.npmjs.com/package/license-guard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/DebuggingMax/license-guard/actions/workflows/ci.yml/badge.svg)](https://github.com/DebuggingMax/license-guard/actions/workflows/ci.yml)

**License compliance checker for your projects.** Scan dependencies, detect problematic licenses, and ensure your project stays compliant.

Perfect for enterprises, open source maintainers, and anyone who cares about license compliance.

## ✨ Features

- 📦 **Multi-ecosystem support** - npm, pip, Go modules, Cargo
- 🔍 **Smart scanning** - Detects licenses from package metadata and LICENSE files
- ⚠️ **Compliance warnings** - Alerts for GPL in MIT projects, AGPL for SaaS, etc.
- 📊 **Multiple output formats** - Table view for humans, JSON for CI/CD
- 🚦 **CI-friendly exit codes** - Integrates with any pipeline
- 🎯 **Customizable rules** - Allow/deny specific licenses

## 🚀 Quick Start

```bash
# Install globally
npm install -g license-guard

# Scan current directory
license-guard scan

# Scan with specific project license
license-guard scan --license MIT

# Quick check for CI
license-guard check

# JSON output for processing
license-guard scan --format json
```

## 📖 Usage

### Scan Dependencies

```bash
# Scan current directory
license-guard scan

# Scan specific path
license-guard scan /path/to/project

# Specify your project's license for compatibility checking
license-guard scan --license Apache-2.0

# Strict mode - fail on any warning
license-guard scan --strict
```

### Custom Rules

```bash
# Allow specific licenses
license-guard scan --allow LGPL-3.0 --allow MPL-2.0

# Deny specific licenses
license-guard scan --deny AGPL-3.0 --deny GPL-3.0
```

### Output Formats

```bash
# Human-readable table (default)
license-guard scan

# JSON for CI/CD pipelines
license-guard scan --format json
```

### CI Integration

```bash
# Quick compliance check
# Exit code 0: All OK
# Exit code 1: Warnings found (with --strict)
# Exit code 2: Violations found
license-guard check
```

### View License Info

```bash
# Show common license information
license-guard licenses
```

## 🔧 Programmatic API

```javascript
import { scan, checkCompliance } from 'license-guard';

// Scan a project
const results = await scan('./my-project');

// Check compliance
const compliance = checkCompliance(results.dependencies, {
  projectLicense: 'MIT',
  allowList: ['LGPL-3.0'],
  denyList: ['AGPL-3.0']
});

console.log(`Found ${compliance.violations.length} violations`);
```

## 📋 Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success - No issues found |
| 1 | Warnings found (with `--strict` flag) |
| 2 | Violations found - License incompatibility detected |

## 🏗️ CI/CD Examples

### GitHub Actions

```yaml
name: License Check
on: [push, pull_request]

jobs:
  license-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx license-guard check
```

### GitLab CI

```yaml
license-check:
  image: node:20
  script:
    - npm ci
    - npx license-guard check --strict
```

## 🔐 Supported License Types

### ✅ Permissive (Always OK)
MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, Unlicense, CC0-1.0, Zlib

### ⚠️ Weak Copyleft (Review Needed)
LGPL-3.0, MPL-2.0, EPL-2.0, CDDL-1.0

### ❌ Strong Copyleft (May Cause Issues)
GPL-2.0, GPL-3.0, AGPL-3.0

### 🚫 Problematic (Usually Denied)
SSPL-1.0, CC-BY-NC, BSL-1.0

---

## 💼 Pro Features

Need advanced compliance features for your enterprise? **License Guard Pro** includes:

| Feature | Free | Pro |
|---------|------|-----|
| Dependency scanning | ✅ | ✅ |
| License detection | ✅ | ✅ |
| Compliance warnings | ✅ | ✅ |
| JSON/Table output | ✅ | ✅ |
| CI exit codes | ✅ | ✅ |
| **SBOM Generation** (SPDX/CycloneDX) | ❌ | ✅ |
| **License Policy Engine** | ❌ | ✅ |
| **Multi-Project Scanning** | ❌ | ✅ |
| **Compliance Reports** (PDF/HTML) | ❌ | ✅ |
| **Slack/Teams Integration** | ❌ | ✅ |
| **Historical Tracking** | ❌ | ✅ |
| **SSO/SAML Support** | ❌ | ✅ |
| **Priority Support** | ❌ | ✅ |

👉 **[Learn more about Pro features](./docs/ENTERPRISE.md)**

📧 **Contact**: [Open an issue](https://github.com/DebuggingMax/license-guard/issues) for enterprise inquiries

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Clone the repo
git clone https://github.com/DebuggingMax/license-guard.git

# Install dependencies
npm install

# Run tests
npm test
```

## 📄 License

MIT © [DebuggingMax](https://github.com/DebuggingMax)

---

<p align="center">
  Made with ❤️ for the open source community
  <br>
  <a href="https://github.com/sponsors/DebuggingMax">💖 Sponsor this project</a>
</p>
