---
title: 'Add Server (AWS)'
category: 'Servers'
order: 3
categoryOrder: 3
---

# Add Server (AWS)

You can provision a new server using your connected AWS account. This section
explains each required field when creating a server through AWS.

---

## Fields

### **Name**

A unique name for your server. This name will appear in your dashboard and helps
you easily identify the instance among multiple servers.

### **Description** _(optional)_

Optional notes to describe the server’s purpose or environment, such as
"Production DB Server" or "Dev Backend Node".

### **AWS Account**

Select the AWS account you want to use.

> You must first connect an AWS account through the
> [**Integrations**](/docs/integrations/aws) section before this appears.

### **SSH Key**

Choose an SSH key to enable remote access to the server via terminal.

> The selected key will be automatically added to the server's authorized SSH
> keys. Make sure the private key is securely stored on your local system.

### **Security Groups**

Select existing security groups that define inbound and outbound traffic rules
for the server.

> If no security groups are available, create them in your AWS account under EC2
> settings.

### **Amazon Machine Image (AMI)**

A pre-configured OS image to launch the instance.  
We use a default recommended image:  
`Ubuntu Server 24.04 LTS (ami-0e35ddab05955cf57)`

> You can customize this if your workflow requires a different AMI ID. Make sure
> the AMI is available in the region you choose.

### **Instance Type**

Select the EC2 instance size. Example:  
`t3.large` — includes 2 vCPUs and 8 GiB RAM.

> Choose based on your app’s compute and memory requirements.

### **Disk Size (GiB)**

The amount of storage in GiB to allocate to the server.  
Default is `80 GiB`.

> Adjust this based on your application’s storage needs.

### **Region**

Choose the AWS region in which the server should be deployed.

> This determines where the physical server will be located and may affect
> latency and compliance.

---

Once all fields are completed, click **Create EC2 Instance** to launch the
server.

---

Looking to connect AWS? Read the [AWS Integration Guide](/docs/integrations/aws)
for setup instructions.
