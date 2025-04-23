---
title: 'Attach Server'
category: 'Servers'
order: 2
categoryOrder: 3
---

# Attach Server

If you already have an existing server, you can attach it to your project using
the following steps.

## Required Information

When attaching a server, make sure you have the following details ready:

- **Name**: A unique identifier for your server.
- **Description** _(optional)_: Brief notes about the server or its role.
- **SSH Key**: Choose from your existing SSH keys or upload a new one.
- **IP Address**: The public IP address of the server.
- **Port**: The SSH port (default is usually `22`).
- **Username**: The user with SSH access (commonly `root` or a sudo user).

## Steps to Attach

1. Navigate to the **Servers** section of your dashboard.
2. Click **Attach Server**.
3. Fill in the form with the required information listed above.
4. Click **Attach** to save the server and begin validation.
5. Once connected, your server will be available for deployments and other
   services.

## Notes

- Ensure the SSH key is added to the `~/.ssh/authorized_keys` on the server.
- The user must have permission to run required server scripts and Docker.
- If connection fails, double-check the IP address, SSH key, and firewall rules.

---

Let me know if you want an `add-server.md` as well or want to convert this into
a JSON or CMS-seedable format.
