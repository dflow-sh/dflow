---
title: 'Add Server'
category: 'Servers'
order: 1
categoryOrder: 3
---

# Add Server

You can create a new server directly from your dashboard using a supported cloud
provider.

> **Note:** Currently, only **AWS** is supported. Support for Google Cloud
> Platform, Azure, and DigitalOcean is coming soon.

## Required Information

To create a new server, fill in the following details:

- **Name**: A unique name for your server.
- **Description** _(optional)_: Notes about the server or its purpose.
- **AWS Account**: Select from your linked AWS accounts.
- **Security Groups**: Choose security groups to control traffic to the
  instance.
- **SSH Key**: Select an SSH key to be added to the server for remote access.
- **Amazon Machine Image (AMI)**:
  - Example: `Ubuntu Server 24.04 LTS (ami-0e35ddab05955cf57)`
- **Instance Type**:
  - Example: `t3.large` (2 vCPUs, 8 GiB RAM)
- **Disk Size (GiB)**:
  - Default: `80`
- **Region**: Choose the AWS region to launch the instance in.

## Steps to Add a Server

1. Go to the **Servers** section in your dashboard.
2. Click **Add Server**.
3. Choose **AWS** as your cloud provider.
4. Fill out the form with the required details.
5. Click **Create EC2 Instance**.
6. Once the instance is provisioned, it will be automatically connected and
   ready to use.

## Notes

- Ensure that the selected SSH key is valid and accessible.
- The AMI ID may vary based on region — confirm it matches your desired Ubuntu
  version.
- Additional cloud providers will be available soon.

---

Let me know if you also want to split these into categories or auto-generate
sidebars or links for your markdown-based docs site.
