---
title: 'Security'
category: 'Security'
order: 1
categoryOrder: 5
---

# Security

The **Security** section helps you manage secure access to your servers and
infrastructure through **SSH Keys** and **Security Groups**. Both are essential
for maintaining control and protection over deployed services.

## SSH Keys

SSH keys provide a secure and password-less way to access your servers. When you
launch or attach a server, a public SSH key is injected into the instance,
allowing only authorized users to connect via SSH.

- **Why Use SSH Keys?**
  - More secure than traditional password login.
  - Prevents brute-force attacks.
  - Allows automation and scripting access without human interaction.

You can:

- **Add** a new SSH key (paste your public key into the system).
- **Edit** the label of an existing SSH key for clarity.
- **Delete** keys that are no longer needed.

> **Tip**: Make sure your private key is stored securely and never shared. To
> connect, the public key must exist in the server’s `~/.ssh/authorized_keys`
> file for the user you’re connecting as (typically `root` or a sudo user).

## Security Groups

Security groups act as virtual firewalls that control traffic to and from your
server instances.

- **Inbound rules** specify which traffic is allowed to reach your server.
- **Outbound rules** define what traffic your server is allowed to send out.

You typically configure security groups in your cloud provider’s dashboard
(e.g., AWS Console), and then select them during server setup.

> **Note**: Security groups must be created beforehand in your provider account.
> You can select one or more security groups when adding or editing a server.

### Common Use Cases

<table>
  <thead>
    <tr>
      <th>Use Case</th>
      <th>Rule Type</th>
      <th>Port</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Allow SSH access</td>
      <td>Inbound</td>
      <td>22</td>
      <td>Required for server management</td>
    </tr>
    <tr>
      <td>Allow web traffic</td>
      <td>Inbound</td>
      <td>80/443</td>
      <td>For HTTP and HTTPS access</td>
    </tr>
    <tr>
      <td>Allow database access</td>
      <td>Inbound</td>
      <td>5432</td>
      <td>Only from trusted IPs</td>
    </tr>
  </tbody>
</table>

Properly managing security groups ensures that your infrastructure is locked
down, only allowing necessary traffic and minimizing exposure to threats.

---

Manage your SSH keys and assign appropriate security groups from the
**Security** tab in the dashboard.
