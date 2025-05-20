---
title: 'SSH Keys'
category: 'Security'
order: 2
categoryOrder: 5
---

# SSH Keys

SSH keys are a secure and efficient way to access your servers without using a
password. They provide encrypted authentication between your local machine and
the server, ensuring that only authorized users can connect.

This section allows you to **add**, **edit**, or **delete** SSH keys that will
be used to access your infrastructure.

## What is an SSH Key?

An SSH key pair consists of:

- A **public key** — stored on the server.
- A **private key** — stored securely on your local machine and never shared.

When you try to connect, the server uses the public key to challenge your
private key and grant access if they match.

## Adding an SSH Key

You can add an SSH key to your account in two ways:

### 1. Paste Your Public Key

If you’ve already generated an SSH key pair on your local machine (using
`ssh-keygen` or similar tools), you can copy the contents of your public key
(usually found at `~/.ssh/id_rsa.pub` or `~/.ssh/id_ed25519.pub`) and paste it
into the form.

### 2. Generate a New Key Pair

You can also generate a new key pair directly from the UI:

- **Generate RSA Key**: 2048-bit RSA keys are widely supported and secure for
  most use cases.
- **Generate ED25519 Key**: A newer and faster algorithm, suitable for modern
  systems.

Once generated:

- The **Public Key** will be stored and used for server access.
- The **Private Key** will be displayed once — **copy and store it securely**,
  as you will not be able to access it again.

### SSH Key Form Fields

- **Name**: A label to help you identify the key (e.g., "John's MacBook",
  "DevOps Laptop").
- **Description** (optional): Any notes about the key (e.g., used for
  deployments only).
- **Public Key**: The actual public key string used to authenticate with your
  server.
- **Private Key** (if generated): The corresponding private key shown once —
  keep it safe.

> ⚠️ **Important:** Never share your private key. Losing your private key means
> losing access, and leaking it could expose your server to attacks.

## Managing SSH Keys

- You can **edit** the name or description of any key.
- You can **delete** any key that is no longer needed.
- Deleting a key immediately revokes access for any server using it.

> **Tip:** Rotate keys regularly and remove unused ones to enhance security.

---

Once your SSH keys are added, you can use them when adding or attaching servers
to allow secure, password-less login.
