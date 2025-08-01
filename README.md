# dFlow

<a href="https://dokploy.com">
    <img src="public/dFlow-architecture.png" alt="dFlow Architecture diagram" align="center" width="100%"  />
</a>

**dFlow** is a self-hosted platform for deploying and managing applications —
similar to Vercel, Railway, or Heroku — but with full control over your
infrastructure and data. It provides automated deployment workflows, container
orchestration, and infrastructure management tools, all within your private
environment.

## 🚀 Self-Hosting Guide

This guide will walk you through setting up and running your own self-hosted
instance of dFlow.

Prefer not to self-host? Try [dFlow Cloud](https://dflow.sh) for a fully managed
experience.

### ✅ Prerequisites

Make sure you have the following:

- Docker installed
- A Tailscale account
- A domain name
- A server (recommended: 2 vCPUs, 8GB RAM)

### 📥 Installation

Run the following command to begin setup. It will guide you through configuring
everything needed for your dFlow instance:

```bash
curl -fsSL https://get.dflow.sh | bash
```

### ⛓️ Tailscale Setup

dFlow uses Tailscale for Zero Trust networking — enabling secure SSH and
internal communication via your private tailnet.

You'll be prompted to enter:

- **Tailnet name** Found in the header after logging into
  [Tailscale](https://tailscale.com), e.g., `johndoe.github`

- **Auth Key** Create one under **Settings > Personal > Keys**. Enable
  `Reusable` and `Ephemeral`.

- **OAuth Client Key** Go to **Settings > Tailnet > OAuth clients**. Enable all
  `read` scopes and `write` for `Auth Keys`, then create the key.

### ✉️ Email Configuration

dFlow uses **Traefik** as a reverse proxy. The email you provide will be used to
generate SSL certificates for your domain.

You’ll be asked to:

```bash
Enter your email for SSL certificate generation
>
```

### 🌐 Domain Configuration

Enable custom domain support for your services:

1. Add a DNS A record:

   - **Type**: A
   - **Name**: `*.up`
   - **Value**: `<your-server-ip>`
   - **Proxy**: OFF

2. When prompted, enter your domain, e.g., `up.johndoe.com`

### 🔑 JWT Configuration

dFlow uses Payload CMS under the hood. A **JWT secret** is required for:

- Authentication
- Encrypting sensitive data like environment variables

> ⚠️ Use a **strong, persistent** secret. Do not change this between
> deployments.

When prompted:

```bash
Enter your JWT secret (keep it safe and consistent)
>
```

Once all configuration steps are complete, the necessary files will be
generated. Follow the remaining prompts in your terminal to launch your instance
of dFlow.

## 🤝 Contributors

Thanks to all who have contributed to dFlow!

<a href="https://github.com/akhil-naidu/dflow/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=akhil-naidu/dflow" />
</a>
