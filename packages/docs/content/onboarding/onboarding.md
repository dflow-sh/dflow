---
title: 'Onboarding Guide'
category: 'Onboarding'
order: 1
categoryOrder: 2
---

# dFlow Onboarding Guide

Welcome to **dFlow**! This guide walks you through the full onboarding process
to get your services deployed smoothly.

---

## Step 1: Add SSH Keys

> ⚠️ **Important:** Make sure to securely save your private key when adding it. 
> If you lose it or disconnect from the server, you may not be able to reconnect without it.
> It's recommended to store it in a secure password manager or local vault.

The first step in the onboarding process is to set up your SSH keys. These keys
are essential for establishing secure connections between dFlow and your
servers.

### Option 1: Use Existing SSH Keys

If you already have an SSH key pair, you can manually enter your:

- **Name**: A label to identify this key.
- **Description** _(optional)_: Brief notes about this key.
- **Public Key**: Your `.pub` key content.
- **Private Key**: The matching private key (this remains encrypted and is
  stored securely).

### Option 2: Generate New SSH Keys

If you don’t have an SSH key pair, you can generate one directly from the
dashboard using:

- **Generate RSA Key**  
  Creates a 2048-bit RSA key pair.

- **Generate ED25519 Key**  
  Creates a secure, modern ED25519 key pair.

After generation, your public and private keys will be automatically filled into
the respective fields.

> **Tip:** For best security and compatibility, we recommend using ED25519 keys
> unless you require RSA.

Once your SSH key is added, proceed to the next step in the onboarding process.

---

## Step 2: Add Server

After setting up your SSH keys, the next step is to add a server. You can either
create a new one through your cloud provider or attach an existing server.

---

### Option 1: Create Your Own Server

Currently, dFlow supports **AWS** for creating new servers. Additional providers
like Google Cloud, Azure, and DigitalOcean will be supported in the future.

### Required Details

- **Name**: A unique name for your server.
- **Description** _(optional)_: Notes about the server.
- **AWS Account**: Select from your linked AWS accounts.
- **Security Groups**: Choose which groups to apply.
- **SSH Key**: Select a previously added SSH key.
- **Amazon Machine Image (AMI)**:  
  _Example_: `Ubuntu Server 24.04 LTS (ami-0e35ddab05955cf57)`
- **Instance Type**:  
  _Example_: `t3.large (2 vCPUs, 8 GiB RAM)`
- **Disk Size (GiB)**:  
  _Default_: `80`
- **Region**: Select your desired AWS region.

Click **Create EC2 Instance** to spin up and automatically connect your new
server.

---

### Option 2: Attach an Existing Server

Already have a server? You can attach it manually by providing:

- **Name**
- **Description**
- **SSH Key**: Select from your added SSH keys
- **IP Address**
- **Port**
- **Username**

Make sure the SSH key is added to your server’s `~/.ssh/authorized_keys`.

Once connected, your server will be ready for further configuration in the
onboarding process.

---

## Step 3: Dokku & Tools Installation

Once your server is connected, the next step is to install **Dokku** and related
tools to manage deployments, plugins, and SSL certificates.

### 1. Select a Server

Choose the server where you want to install Dokku from the list of added or
created servers.

### 2. Dokku Installation

Click to begin the automatic installation of **Dokku**, a powerful platform for
managing app deployments via Git.

### 3. Plugin Configuration

Dokku requires several plugins to support your deployment workflow. This step
installs all necessary plugins, including:

- Git deployment support
- Environment variable management
- Persistent storage support
- SSL integration

### 4. Builder Installation

The required **build-tool** will be installed to handle the build and deployment
of your applications effectively.

### 5. SSL Configuration

To enable automatic SSL certificate generation, provide a global email address:

- **Email**: Used for Let's Encrypt certificate registration and renewal
  notices.

You can also enable:

- **Auto Generate SSL Certificates**:  
  A background cron job will handle automatic certificate creation and renewal.

Click **Save Changes** once all configurations are complete. Your server will
now be fully prepared for app deployments using dFlow.

---

## Step 4: Configure Your Domain

Adding a domain allows you to serve your apps with a custom URL and enables
HTTPS support through Let's Encrypt.

### Add a Domain

To link a domain to your deployment:

1. **Domain Name**: Enter your full domain (e.g., `app.example.com`).
2. **DNS Configuration**:
   - Point your domain’s A record to your server’s public IP address.
   - Ensure the DNS propagation is complete for the SSL certificate to be
     issued.

### SSL Support

If SSL was configured during the Dokku setup step:

- **Let's Encrypt** will automatically issue a certificate for the added domain.
- Certificates will be renewed automatically using the configured cron job.

### Managing Domains

You can manage your domains from the **Domains** section in the dashboard. This
includes:

- Adding new domains
- Viewing linked services
- Regenerating SSL certificates
- Removing unused domains

Once your domain is configured and DNS is correctly set up, your app will be
live and accessible via HTTPS!

---

## Step 5: Install GitHub App

To enable repository access and automated deployments, you need to install the
**dFlow GitHub App**.

This step allows you to seamlessly deploy services from your GitHub
repositories.

### Steps to Install

1. Click **Install GitHub App** from the onboarding interface.
2. You’ll be redirected to GitHub to authorize the app.
3. Choose one of the following:
   - **All repositories**: Give dFlow access to all of your GitHub repositories.
   - **Only select repositories**: Limit access to specific repositories.
4. Confirm the installation.

### Why This Is Needed

Installing the GitHub App allows dFlow to:

- Access your codebase for deployment
- Automatically pull and build changes
- Manage deploy keys and webhooks

> 🔐 dFlow only accesses the repositories you grant permission to — and only for
> the purpose of deployment.

Once connected, you can start linking repositories to your services in dFlow and
enable CI/CD automation with ease.

---

## ✅ You're All Set!

You’ve successfully completed the onboarding process. You can now deploy and
manage services using dFlow 🚀
