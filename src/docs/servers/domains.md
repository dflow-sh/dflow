---
title: 'Domains'
category: 'Servers'
order: 5
categoryOrder: 3
---

# Domains

Domains help you route traffic to your services from a human-readable URL like
`api.example.com`. You can manage domains at both the **Server** and **Service**
levels.

---

## 🖥️ Server-Level Domains

You can add and manage subdomains on any server through the **Domains** tab.

### ➕ Adding a Subdomain

1. Go to the **Domains** tab on your server.
2. Click **➕ Add Subdomain**.
3. Enter the subdomain name (e.g., `api.example.com`).
4. Click the **ℹ️ Info** button next to the domain to view its DNS records.

### 📄 DNS Record Details

After creating a domain, you’ll need to update your DNS provider (e.g., GoDaddy,
Namecheap, Hostinger) with the following records:

<table>
  <thead>
    <tr>
      <th>Type</th>
      <th>Name</th>
      <th>Content</th>
      <th>TTL</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>A / CNAME / TXT</td>
      <td>Provided</td>
      <td>Provided</td>
      <td>Default or 300</td>
    </tr>
  </tbody>
</table>

> These records ensure your domain points to the correct server IP.

After updating your DNS provider, click **🔄 Sync Domain** to verify the domain
and enable it for use.

You can add **multiple subdomains** to the same server.

---

## 📦 Service-Level Domains

When a service (like **App** or **Docker**) is deployed, it will automatically
generate domains based on the server’s subdomains.

### 🛠 Default Format

- If your server has multiple subdomains, the service will be accessible at each
  one.
- Example:
  - Server subdomain: `api.example.com`
  - App service: `web-app.api.example.com`

### ✏️ Customizing Service Domain Names

To change the `service-name` part of a domain:

1. Go to the **Domains** tab of the **Service**.
2. Click the domain you want to customize.
3. In the **Host** input field, enter the new prefix.
4. The domain will update to use the new name.

> For example, changing `Host` to `web-app` on a subdomain
> `service-name.api.example.com` will result in `web-app.api.example.com`.

---

## ✅ Summary

- Add and manage domains at the **server** level.
- Each **service** gets its own domain using the format
  `service-name.sub-domain`.
- You can **customize** the domain name per service via the **Host** field.
- Don’t forget to **sync** your DNS settings for the domain to go live.
