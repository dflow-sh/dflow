---
title: 'Attach Server'
category: 'Servers'
order: 4
categoryOrder: 3
---

# Attach Server

Already have an existing server? You can connect it to your project by providing
the following information.

---

## Required Information

### **Name**

A unique name to identify your server within the dashboard.

> Example: `my-production-server`

### **Description** _(optional)_

Add brief notes to explain the server’s role or usage.

> Example: `Handles background jobs for billing service`

### **SSH Key**

Select from your saved SSH keys or upload a new one to enable access.

> The public key will be used to authenticate with your server via SSH. You can
> manage keys in the [SSH Keys](/docs/ssh-keys) section.

### **IP Address**

Provide the server's public IP address (IPv4).

> This is the address our system will use to connect via SSH.

### **Port**

The SSH port used to connect to the server.

> Default is `22`. If your server uses a custom port, specify it here.

### **Username**

The system user account that has SSH access (must have sudo privileges).

> Common usernames include `root`, `ubuntu`, or `ec2-user`.

---

## Notes

- Ensure the selected SSH key is added to the `~/.ssh/authorized_keys` file on
  your server.
- The SSH user must have permissions to install packages, run Docker, and
  execute setup scripts.
- If the connection fails, double-check:
  - The IP address is correct and publicly accessible.
  - The firewall allows SSH access on the specified port.
  - The correct SSH key is selected.

---

Need help setting up SSH? Refer to our [SSH Access Guide](/docs/ssh-access) for
step-by-step instructions.
