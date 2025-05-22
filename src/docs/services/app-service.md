---
title: 'App'
category: 'Services'
order: 2
categoryOrder: 4
---

# App

An App Service lets you deploy your application directly from a connected code
repository. It supports multiple Git-based providers and is ideal for continuous
deployment setups.

---

## 🔧 General Tab

This tab provides a detailed overview of your service configuration.

### 🧩 Source Provider Tabs

- **GitHub** – ✅ Enabled (default selected)
- **GitLab** – 🚫 Disabled _(coming soon)_
- **Bitbucket** – 🚫 Disabled _(coming soon)_

### Source Provider Tab Fields (GitHub example)

- #### Account (✅ Editable)

  Select from your connected GitHub accounts. This defines which GitHub identity
  you’re using to deploy the application. You must connect at least one GitHub
  account before creating an App Service.

- #### Repository (❌ Not Editable)

  The repository selected from your GitHub account. This field is auto-populated
  after choosing the account and is linked through the GitHub App. It ensures
  the app stays connected to your source code.

- #### Branch (❌ Not Editable)

  The branch used for deployments. This is typically `main` or `master`, but may
  vary depending on your repo’s setup. It is selected automatically when you
  connect a repo.

- #### Build Path (✅ Editable)

  The directory path inside your repository where your application code lives.
  For most repositories, this is the root (`/`), but you can specify a subfolder
  if needed (e.g., `/apps/web`).

- #### Port (✅ Editable)

  The port your application listens on at runtime. This is necessary for us to
  expose and route traffic correctly to your app. Default is `3000`, but you can
  change it based on your framework’s requirements.

- #### Builder (✅ Editable)
  Choose how your app is built. You can use the default **Railpack** builder for
  zero-config setup, or select **Dockerfile** to provide custom build steps
  using your own Dockerfile.

### Builder Options

- **Railpack (Default)**: Uses a zero-config, optimized builder setup
- **Dockerfile**: Custom build using a `Dockerfile` in your repository

> ⚠️ Changes to editable fields will trigger a redeployment.

---

## 🌱 Environment Tab

Manage environment variables for your App Service here.

You can:

- Add new environment variables
- Edit existing ones
- Delete unused variables

> Changes require a redeploy or service restart to take effect.

> For detailed information on configuring environment variables, including usage
> of reference variables and secret generation, please see the
> [Environment Variables](./environment-variables) documentation.

---

## 📜 Logs Tab

View logs to understand what's happening under the hood.

You’ll find:

- **Build Logs** – Output from the build process on each deployment
- **Runtime Logs** – Real-time logs from your application

Useful for:

- Debugging build or startup failures
- Monitoring app behavior

---

## 🚀 Deployments Tab

Track the full history of your deployments.

Includes:

- Timeline of all deployments
- Git commit hashes
- Deploy initiator details
- Individual build logs

> Coming soon: the ability to roll back to a previous commit.

---

## 🌐 Domains Tab

Manage domains attached to this service.

Features:

- Add or remove domains
- View and regenerate SSL certificates
- Check DNS status

> Ensure your DNS points to the correct server IP for successful linkage.

---

## ⚙️ Actions

Located at the top-right of your service view:

- **Deploy** – Redeploys the service using the latest configuration
- **Restart** – Restarts the currently running version
- **Stop** – Stops the deployed instance

> These actions are always available for App Services.

---

## ✅ Summary

App Services in dFlow offer powerful integration with your development workflow.
From connecting a repo on GitHub, GitLab, or Bitbucket to deploying and managing
the full lifecycle, everything is streamlined for rapid iteration and stable
operations.
