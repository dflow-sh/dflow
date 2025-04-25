---
title: 'Database'
category: 'Services'
order: 4
categoryOrder: 4
---

# Database Service

dFlow provides managed database services that are ready to use with minimal
configuration. These databases are provisioned automatically, and credentials
are generated securely. The interface allows you to view connection details,
monitor basic activity, and review deployment information where applicable.

---

## 🛠️ General

This section displays the configuration and credentials of your database
instance. All fields are **read-only** and managed by dFlow.

### 🔐 Internal Credentials

<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Value</th>
      <th>Editable</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Username</strong></td>
      <td><code>payload-mongo</code></td>
      <td>❌</td>
    </tr>
    <tr>
      <td><strong>Password</strong></td>
      <td><code>a7840b972f0a756e5f22c7fe5a436c07</code></td>
      <td>❌</td>
    </tr>
    <tr>
      <td><strong>Port</strong></td>
      <td><code>27017</code></td>
      <td>❌</td>
    </tr>
    <tr>
      <td><strong>Host</strong></td>
      <td><code>dokku-mongo-payload-mongo</code></td>
      <td>❌</td>
    </tr>
    <tr>
      <td><strong>Internal URL</strong></td>
      <td><code>mongodb://payload-mongo:a7840b972f0a756e5f22c7fe5a436c07@dokku-mongo-payload-mongo:27017/payload_mongo</code></td>
      <td>❌</td>
    </tr>
  </tbody>
</table>

### 🌐 External Credentials

To expose your database to the internet, you can define a custom port. This
feature is useful for development tools or external connections. **This setting
is currently disabled** in the UI.

<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Description</th>
      <th>Editable</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Enter Port</strong></td>
      <td>Define a port to make your database externally accessible. Ensure the port is not already in use.</td>
      <td>❌</td>
    </tr>
  </tbody>
</table>

> ℹ️ All credentials are managed by dFlow. For security reasons, editing is
> disabled.

---

## 📜 Logs

Monitor basic activity for your database service. These logs help confirm uptime
and connectivity.

- **Connection Logs** – Shows connection attempts and authentication activity.
- **Health Checks** – Displays results of internal monitoring pings.

> Advanced logging such as query tracking is not currently supported.

---

## 🚀 Deployments

Track the full history of your deployments.

Includes:

- Timeline of all deployments
- Git commit hashes
- Deploy initiator details
- Individual build logs

> Coming soon: the ability to roll back to a previous commit.

---

## ⚙️ Actions

While most database management is automated, you can manually trigger basic
control actions.

<table>
  <thead>
    <tr>
      <th>Action</th>
      <th>Description</th>
      <th>Available</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Restart</strong></td>
      <td>Restarts the database container</td>
      <td>✅</td>
    </tr>
    <tr>
      <td><strong>Stop</strong></td>
      <td>Stops the database service</td>
      <td>✅</td>
    </tr>
  </tbody>
</table>

> Use these actions if your service becomes unresponsive or needs to be
> temporarily paused.
