---
title: 'Docker'
category: 'Services'
order: 3
categoryOrder: 4
---

# Docker Service

A Docker-based service allows you to deploy prebuilt container images from any
registry. It's ideal when you want full control over the container runtime,
build, and dependencies.

---

## 🔧 General Tab

Configure core service settings for your Docker container.

### Registry Details

- #### Public / Private:

  Choose whether your image is hosted on a public or private registry.

  > Select the **Private** option to deploy private images. Authentication and
  > access will be handled accordingly.

- #### URL:

  Provide the image URL including name and tag.  
  Example: `hasura/graphql-engine:latest`

- #### Ports:

  - **Host Port**: The external port used to access your app.  
    Example: `80`
  - **Container Port**: The internal port your container listens on.  
    Example: `8080`

  - **Schema**:  
    Define whether the application should be accessed via HTTP or HTTPS.  
    Example: `http`

### Editable Fields

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
      <td><strong>Image Name & Tag</strong></td>
      <td>✅</td>
      <td>e.g., <code>nginx:latest</code>, <code>ghcr.io/your/image:tag</code></td>
    </tr>
    <tr>
      <td><strong>Exposed Port</strong></td>
      <td>✅</td>
      <td>Port your container listens on (e.g., <code>8080</code>)</td>
    </tr>
    <tr>
      <td><strong>Run Options</strong></td>
      <td>✅</td>
      <td>Optional <code>CMD</code> or <code>ENTRYPOINT</code> override</td>
    </tr>
  </tbody>
</table>

You can use any public or private Docker image as long as the registry is
accessible from the dFlow platform.

---

## 🌱 Environment Tab

Manage environment variables injected into your container at runtime.

You can:

- Add new variables
- Edit or delete existing variables

> Restart or redeploy is required for changes to take effect.

> For detailed instructions on setting environment variables, including
> reference variables and secret generation, please refer to the
> [Environment Variables](./environment-variables) documentation.

---

## 📜 Logs Tab

View logs to monitor container behavior and troubleshoot issues.

- **Startup Logs** – See the output from container initialization
- **Runtime Logs** – Real-time logs from your container

Ideal for:

- Debugging app crashes or misconfiguration
- Monitoring service activity

---

## 🚀 Deployments Tab

While Docker services don’t use source code deployments like GitHub-based ones,
you still get:

- **Deployment timeline**
- **Image tag history**
- **Manual tag re-deploy**

> Useful for updating to a new version of your Docker image manually.

---

## 🌐 Domains Tab

Attach custom domains to your Docker-based services.

Includes:

- Adding/removing domains
- SSL certificate management
- DNS health checks

Make sure:

- Your domain points to the correct server IP
- You regenerate SSL certificates if expired

---

## ⚙️ Actions

Docker services support full control from the UI:

- **Deploy** – Pull and launch the latest image version
- **Restart** – Restart the running container
- **Stop** – Gracefully stop the container

> You must trigger a new deploy when updating to a different image tag.

---

## ✅ Summary

Docker Services on dFlow offer a flexible deployment path for teams that rely on
container workflows. Whether you use public registries or manage your own, dFlow
gives you full control over the deployment lifecycle.
