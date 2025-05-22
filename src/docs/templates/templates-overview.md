---
title: 'Templates Overview'
category: 'Templates'
order: 1
categoryOrder: 6
---

# Templates

Templates allow you to define and reuse groups of services—such as applications,
databases, and Docker containers—so you can deploy full stacks quickly and
consistently.

---

## 🧱 What is a Template?

A **template** is a collection of services (apps, images, databases) bundled
together with a defined **deployment order**. You can use templates to:

- Standardize application stacks (e.g., Node.js + MongoDB)
- Quickly spin up new environments
- Share deployable setups with your team

---

## ✨ Supported Service Types

Each template can include a mix of the following:

### 🔗 GitHub Repository

Deploy code directly from a GitHub repo.

- **Example**: A Next.js app from `https://github.com/user/project`
- You can specify the branch and buildpack (if applicable)

### 🐳 Docker Image

Use any Docker image from a registry.

- **Example**: `nginx:latest`, `myregistry.com/user/image:tag`
- Useful for custom or third-party services

### 🗄️ Databases

Templates can include pre-configured databases:

- **MongoDB**
- **PostgreSQL**
- **MySQL**
- **MariaDB**
- **Redis**

Each database is deployed with sensible defaults and can be customized
post-deployment.

---

## ⚙️ Deployment Order

You can define the **order** in which services are deployed.

> This is useful when an app depends on a database being ready before starting.

- Drag and drop services to rearrange their deployment priority.
- The deployment engine will respect this order.

**Example:**

1. `MongoDB`
2. `my-app` (GitHub repo)

---

## ➕ Creating a Template

1. Go to the **Templates** section.
2. Click **➕ New Template**.
3. Add services:
   - Choose between GitHub, Docker image, or a database
   - Provide required details like repo URL, image name, or DB type
4. Arrange the deployment order as needed.
5. Click **💾 Save Template**
6. Give your template a name and optional description.
7. Click **💾 Create**

Your template is now ready to be used for deployment.

---

## 🚀 Using a Template

Once saved, templates can be reused to deploy a full stack in one click.

> In future releases, public and shared templates will be available to speed up
> onboarding and promote best practices.

---

## 📦 Example Template

**Template Name:** `Node App + MongoDB`

**Services:**

<table>
  <thead>
    <tr>
      <th>Order</th>
      <th>Type</th>
      <th>Name</th>
      <th>Source / Image</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Database</td>
      <td>MongoDB</td>
      <td>mongo:latest</td>
    </tr>
    <tr>
      <td>2</td>
      <td>GitHub Repo</td>
      <td>Web App</td>
      <td>https://github.com/user/node-app</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Docker Image</td>
      <td>NGINX Proxy</td>
      <td>nginx:alpine</td>
    </tr>
  </tbody>
</table>

---

## ✅ Summary

- Templates bundle multiple services together for repeatable deployments.
- Supports GitHub repos, Docker images, and common databases.
- Services can be **ordered** to respect dependencies.
- Templates can be reused, shared, and updated anytime.

> Need help building your first template? Jump into the **Templates** tab and
> try it out!
