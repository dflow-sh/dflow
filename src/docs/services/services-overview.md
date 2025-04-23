---
title: 'Service Overview'
category: 'Services'
order: 1
categoryOrder: 4
---

# Service Overview

Services are the core units of deployment and management within dFlow. Whether
it's a backend API, a database, or a containerized app, each service is
represented with detailed configuration, environment, logs, deployment history,
and domain settings.

dFlow currently supports the following service types:

- **GitHub Service** – Deploy directly from a GitHub repository.
- **Database Service** – Managed or self-hosted databases.
- **Docker Service** – Deploy prebuilt Docker containers.

---

## 🔀 Tab Overview

Each service view contains multiple tabs. Their behavior changes slightly
depending on the service type.

---

### 🔧 General Tab

This tab provides a detailed overview of your service configuration, with
different behaviors depending on the service type.

---

#### 🧩 GitHub-Based Service

When your service is connected via GitHub, the following tabbed options are
available under the **General** section:

##### Source Provider Tabs

- **GitHub** – ✅ Enabled (default selected)
- **GitLab** – 🚫 Disabled _(coming soon)_
- **Bitbucket** – 🚫 Disabled _(coming soon)_

##### GitHub Tab Fields

<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Editable</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Account</strong></td>
      <td>✅</td>
      <td>Select from your connected GitHub accounts</td>
    </tr>
    <tr>
      <td><strong>Repository</strong></td>
      <td>❌</td>
      <td>Linked repository (auto-selected via GitHub App)</td>
    </tr>
    <tr>
      <td><strong>Branch</strong></td>
      <td>❌</td>
      <td>Branch used for deployments (auto-selected)</td>
    </tr>
    <tr>
      <td><strong>Build Path</strong></td>
      <td>✅</td>
      <td>Folder containing the app code (default: <code>/</code>)</td>
    </tr>
    <tr>
      <td><strong>Port</strong></td>
      <td>✅</td>
      <td>Port your app listens on (default: <code>3000</code>)</td>
    </tr>
    <tr>
      <td><strong>Builder</strong></td>
      <td>✅</td>
      <td>Select how the app is built</td>
    </tr>
  </tbody>
</table>

###### Builder Options

- **Railpack (Default)**: Uses a zero-config, optimized builder setup
- **Dockerfile**: Custom build using a `Dockerfile` in your repo

> Changes to any of the editable fields will require a redeploy.

---

#### 🐳 Docker Service

For Docker-based services, you can update the following:

- **Image Name & Tag** – e.g., `nginx:latest`, `ghcr.io/your/image:tag`
- **Exposed Port** – Port the container exposes (e.g., `8080`)
- **Run Options** – Custom `CMD` or `ENTRYPOINT` args if needed

Use this setup if you're managing your builds outside dFlow and pulling from an
external Docker registry.

---

#### 🗄️ Database Service

This section is **read-only** for database services (e.g., MongoDB, PostgreSQL,
MySQL).

View-only fields:

- **Database Type** – e.g., PostgreSQL, MongoDB
- **Host & Port**
- **Username & Password** – Obscured for security
- **Connection String** – Full DSN for external use

> You cannot modify database config from here, as databases are managed by
> dFlow.

---

---

### 🌱 Environment Tab

Manage environment variables for your services.

#### What You Can Do:

- **Add New Variables**
- **Edit Existing Variables**
- **Delete Unused Ones**

> Changes here require a **Deploy** or **Restart** to apply.

#### Notes:

- GitHub & Docker Services: Full access.
- Database Services: May be unavailable if system-managed.

---

### 📜 Logs Tab

Real-time logging output based on service type.

- **GitHub Services**:
  - Build Logs (on every deployment)
  - Runtime Logs
- **Docker Services**:
  - Container logs
- **Database Services**:
  - Connection logs or health checks

> Use this to debug crashes, inspect build errors, or monitor app output.

---

### 🚀 Deployments Tab

Track your service’s deployment history.

- **Deployment Timeline** – Shows who deployed and when
- **Commit Hashes** (GitHub service)
- **Logs per Deployment**
- **Rollback Options** (coming soon)

> For GitHub: redeploy old commits manually  
> For Docker: redeploy specific tags

---

### 🌐 Domains Tab

Attach or manage domains related to this service.

- **Add Domain**
- **Link Domain to Service**
- **SSL Certificate Status**
- **Regenerate Certificate**
- **Remove Domain**

> Make sure your DNS is properly configured to point to your server’s IP.

---

## ⚙️ Service Actions

Located at the top-right of the service detail page:

- **Deploy** – Triggers a fresh deployment using the latest config
- **Restart** – Restarts the currently deployed instance
- **Stop** – Halts the service (Docker/GitHub only)

> Not all services support all actions. For example, databases can’t be
> restarted manually if system-managed.

---

## 🔍 Service Type Behavior Comparison

<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>GitHub</th>
      <th>Docker</th>
      <th>Database</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Editable Config</td>
      <td>✅</td>
      <td>✅</td>
      <td>❌</td>
    </tr>
    <tr>
      <td>View Logs</td>
      <td>✅</td>
      <td>✅</td>
      <td>⚠️ Limited</td>
    </tr>
    <tr>
      <td>Manage Env Vars</td>
      <td>✅</td>
      <td>✅</td>
      <td>⚠️ Limited</td>
    </tr>
    <tr>
      <td>Deployment Logs</td>
      <td>✅</td>
      <td>✅</td>
      <td>❌</td>
    </tr>
    <tr>
      <td>Domain Configuration</td>
      <td>✅</td>
      <td>✅</td>
      <td>❌</td>
    </tr>
    <tr>
      <td>Deploy / Restart</td>
      <td>✅</td>
      <td>✅</td>
      <td>❌</td>
    </tr>
  </tbody>
</table>

## ✅ Summary

The dFlow Services tab provides all the tools to monitor, configure, and control
deployments across various infrastructure components. Each service type has
tailored behavior, ensuring safety, simplicity, and flexibility depending on
your stack.
