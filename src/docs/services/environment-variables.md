---
title: 'Environment Variables'
category: 'Services'
order: 5
categoryOrder: 4
---

# Environment Variables

Environment variables let you configure runtime values for your App Service
without hardcoding them into your codebase.

You can:

- Add static values
- Use dynamic reference variables
- Regenerate secret values

> ⚠️ Changes to environment variables **require a redeploy or a service
> restart** to take effect.

---

## ➕ Adding Variables

Click the **`+ Add Variable`** button to define a new environment variable. Each
variable consists of a `KEY` and a `VALUE`.

Values can be:

- **Static values** – hardcoded strings or numbers
- **Reference values** – linked from other services (e.g., databases or domains)
- **Secret values** – auto-generated using the `secret()` helper

---

## 🔁 Reference Variables

Click the `{}` icon next to the value field to access reference suggestions.

Use reference variables to pull values from other services or the platform.

### Format

- `service-name` – name of the service you're referencing
- `VARIABLE_NAME` – exposed environment variable from that service

---

## 🌐 Website Domain Reference

To reference the public domain of another App Service:

Example: `NEXT_PUBLIC_WEBSITE_URL={{ my-service-name.DFLOW_PUBLIC_DOMAIN }}`

---

## 💾 Database Connection References

Use reference variables to inject database URIs from another service.

Supported variable names:

<table>
  <thead>
    <tr>
      <th>Database</th>
      <th>Reference Variable</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>MongoDB</td>
      <td><code>MONGO_URI</code></td>
    </tr>
    <tr>
      <td>PostgreSQL</td>
      <td><code>POSTGRES_URI</code></td>
    </tr>
    <tr>
      <td>MySQL</td>
      <td><code>MYSQL_URI</code></td>
    </tr>
    <tr>
      <td>MariaDB</td>
      <td><code>MARIA_URI</code></td>
    </tr>
    <tr>
      <td>Redis</td>
      <td><code>REDIS_URI</code></td>
    </tr>
  </tbody>
</table>

> 💡 Public connection variables like <code>POSTGRES_PUBLIC_URI</code> are
> disabled by default in reference variables.  
> To enable them, go to the database service and click the **Expose** button
> next to the public connection URL.

### Example

DATABASE_URI=`{{ db-service.POSTGRES_URI }}`

---

## 🔐 Secret Generation

Use `secret()` to create random secrets on the fly.

### Format

- `length` – Number of characters (e.g., `32`, `64`)
- `charset` – Allowed characters (e.g., `"abcABC123"`, `"aA1!"`)

### Example

PAYLOAD_SECRET=`{{ secret(64, "abcdefghijklMNOPQRSTUVWXYZ") }}`

---

## 🧪 Example Usages

<table>
  <thead>
    <tr>
      <th>Type</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Static value</td>
      <td><code>NODE_ENV=production</code></td>
    </tr>
    <tr>
      <td>Domain reference</td>
      <td><code>APP_URL=`{{ my-service.DFLOW_PUBLIC_DOMAIN }}`</code></td>
    </tr>
    <tr>
      <td>Database reference</td>
      <td><code>DB_URI=`{{ database.POSTGRES_URI }}`</code></td>
    </tr>
    <tr>
      <td>Generated secret</td>
      <td><code>JWT_SECRET=`{{ secret(64, "aA1!") }}`</code></td>
    </tr>
    <tr>
      <td>Other service var</td>
      <td><code>EXTERNAL_KEY=`{{ another-service.SOME_KEY }}`</code></td>
    </tr>
  </tbody>
</table>

---

## ✅ Best Practices

- Use reference variables instead of hardcoding secrets or URLs.
- Use `secret()` for secure random generation.
- Redeploy or restart the service after changes.
- Use consistent naming to keep variable references clear.
- Avoid storing secrets in your code or VCS.

---

Environment variables give you secure, configurable access to settings, URLs,
credentials, and more — dynamically tied to your app’s architecture in dFlow.
