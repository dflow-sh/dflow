## Installation Guide

### Self-host command

Run the dFlow self-host command on your server. This will create all
configuration files required for setup.

```bash
sudo curl -fsSL https://get.dflow.sh | bash
```

### 1. Tailscale Setup

dFlow uses Tailscale for Zero Trust networking — enabling secure SSH and
internal communication via your private tailnet.

You'll be prompted to enter:

- **Tailnet name** Found in the header after logging into
  [Tailscale](https://tailscale.com), e.g., `johndoe.github`

- **Access Control** Update it under **Access Control Tab > JSON editor**. use
  this
  [configuration](https://github.com/dflow-sh/dflow/blob/main/TAILSCALE.md).

- **Auth Key** Create one under **Settings > Personal > Keys**. Enable
  `Reusable` and `Ephemeral`.

- **OAuth Client Key** Go to **Settings > Tailnet > OAuth clients**. Enable all
  `read` scopes and `write` for `Auth Keys`, then create the key.

### 2. Email Configuration

dFlow uses **Traefik** as a reverse proxy. The email you provide will be used to
generate SSL certificates for your domain.

You’ll be asked to:

```bash
Enter your email for SSL certificate generation
>
```

### 3. Domain Configuration

Enable custom domain support for your services:

1. Add a DNS A record:

   - **Type**: A
   - **Name**: `*.up`
   - **Value**: `<your-server-ip>`
   - **Proxy**: OFF

2. When prompted, enter your domain, e.g., `up.johndoe.com`

### 4. JWT Configuration

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
