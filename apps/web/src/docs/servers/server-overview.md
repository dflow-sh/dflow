---
title: 'Servers Overview'
category: 'Servers'
order: 1
categoryOrder: 3
---

# Servers Overview

You can manage servers in two ways:

- [**Add Server**](./add-server): Provision a new server using a supported cloud
  provider.
- [**Attach Server**](./attach-server): Connect an existing server you already
  manage.

## Add Server

Use this option to create a new server.

- **Cloud Provider**: Currently, only AWS is supported.
- **Required**: Name, AWS account, security groups, SSH key, AMI, instance type,
  disk size, and region.
- Once created, the server is automatically connected and ready to use.

## Attach Server

Use this option to connect an existing server.

- **Required**: Name, SSH key, IP address, port, and username.
- The server must be accessible via SSH and support Docker.
- Once verified, it becomes available for deployments.
