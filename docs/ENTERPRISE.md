# 💼 License Guard Pro - Enterprise Features

License Guard Pro is designed for organizations that need comprehensive license compliance management across their software portfolio.

## 🚀 Pro Features

### 📋 SBOM Generation

Generate Software Bill of Materials in industry-standard formats:

- **SPDX** (Software Package Data Exchange) - ISO/IEC 5962:2021 compliant
- **CycloneDX** - OWASP standard for application security
- **Custom JSON** - For internal tooling integration

```bash
# Generate SPDX SBOM
license-guard sbom --format spdx --output sbom.spdx.json

# Generate CycloneDX SBOM
license-guard sbom --format cyclonedx --output sbom.cdx.json
```

### 📜 License Policy Engine

Define organization-wide license policies:

```yaml
# .license-guard-policy.yml
name: "Acme Corp Policy"
version: "1.0"

rules:
  # Always allowed
  allow:
    - MIT
    - Apache-2.0
    - BSD-3-Clause
    - ISC
  
  # Always denied
  deny:
    - AGPL-3.0
    - SSPL-1.0
    - GPL-3.0
  
  # Require approval
  review:
    - LGPL-3.0
    - MPL-2.0

  # Context-specific rules
  contexts:
    production:
      deny:
        - GPL-2.0
        - GPL-3.0
    development:
      allow:
        - GPL-3.0  # OK for dev tools
```

### 🏢 Multi-Project Scanning

Scan entire monorepos or multiple repositories:

```bash
# Scan monorepo
license-guard scan --recursive ./monorepo

# Scan multiple repos
license-guard scan-org --github-org mycompany

# Aggregate results
license-guard aggregate ./reports/*.json --output summary.html
```

### 📊 Compliance Reports

Generate beautiful reports for legal review and audits:

- **PDF Reports** - Professional documents for compliance audits
- **HTML Dashboard** - Interactive web-based reporting
- **Excel Export** - For legal/procurement teams
- **Diff Reports** - Track changes between scans

```bash
# Generate PDF report
license-guard report --format pdf --output compliance-report.pdf

# Generate HTML dashboard
license-guard report --format html --output ./compliance-dashboard/

# Compare two scans
license-guard diff scan-v1.json scan-v2.json --output changes.html
```

### 🔔 Slack/Teams Integration

Real-time notifications for license violations:

```yaml
# .license-guard.yml
notifications:
  slack:
    webhook: $SLACK_WEBHOOK
    channel: "#compliance"
    events:
      - violation
      - new-dependency
  
  teams:
    webhook: $TEAMS_WEBHOOK
    events:
      - violation
```

### 📈 Historical Tracking

Track license compliance over time:

- **Compliance Score** - Track your score over releases
- **Trend Analysis** - See how your license posture evolves
- **Audit Trail** - Full history of all scans and decisions
- **Regression Detection** - Alert when new violations appear

### 🔐 Enterprise Security

- **SSO/SAML Support** - Integrate with your identity provider
- **RBAC** - Role-based access control
- **Audit Logging** - Track all user actions
- **Private Cloud** - Deploy in your own infrastructure

---

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Team** | $99/mo | 10 users, 50 repos, basic reports |
| **Business** | $299/mo | 50 users, unlimited repos, all features |
| **Enterprise** | Custom | Unlimited, SSO, dedicated support, SLA |

All plans include:
- ✅ All Pro features
- ✅ Email support
- ✅ 14-day free trial

---

## 🏁 Getting Started with Pro

### 1. Sign up for a trial

```bash
license-guard pro signup
```

### 2. Activate your license

```bash
license-guard pro activate LICENSE_KEY
```

### 3. Start using Pro features

```bash
license-guard sbom --format spdx
license-guard report --format pdf
```

---

## 📞 Contact Us

- **Sales**: [Open an issue](https://github.com/DebuggingMax/license-guard/issues) with `[Enterprise]` tag
- **Support**: [GitHub Discussions](https://github.com/DebuggingMax/license-guard/discussions)
- **Security**: Please report security issues privately

---

## 🤔 FAQ

### Can I use the free version commercially?

Yes! License Guard is MIT licensed. The free version has no usage restrictions.

### What's the difference between free and Pro?

The free version covers individual developers and small teams. Pro adds enterprise features like SBOM generation, policy management, and compliance reporting.

### Do you offer discounts for startups/non-profits?

Yes! Contact us for special pricing.

### Is there a self-hosted option?

Enterprise plans include the option to deploy License Guard in your own infrastructure.

---

<p align="center">
  <a href="https://github.com/DebuggingMax/license-guard/issues">📧 Contact Sales</a>
  •
  <a href="https://github.com/sponsors/DebuggingMax">💖 Sponsor</a>
</p>
