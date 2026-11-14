---
name: dflow
description: Use when a person asks what this dFlow CLI can do, which skill to follow, or where the docs are. The API is https://k8s.dflow.sh. This is not the cloud product.
---

# dFlow

This is the dFlow command line and its MCP server. The API is `https://k8s.dflow.sh`. The product word is workspace. A project contains environments. An application runs in one environment. A route gives that application a hostname.

Do not call the Kubernetes API. Do not read a kubeconfig. `dflow-server` installs a cluster. A developer does not use it to deploy an application.

Install the CLI:

```bash
curl -fsSL https://github.com/dflow-sh/dflow/releases/latest/download/install.sh | sh
```

Install the agent skills from the same repository:

```bash
npx skills add dflow-sh/dflow
```

| Skill | When to use it |
| --- | --- |
| `dflow-onboarding` | The person has no account. Signup through a hostname. |
| `dflow-cli` | Run a command, read JSON, or delete something. |
| `dflow-mcp` | The host speaks MCP. |

## What a developer can do

- Account. Register, sign in, and recover a password. The password is typed at the prompt.
- Workspace. The personal workspace is private. Create another workspace before inviting someone.
- Project and environment. Select both with `dflow context:use` before a deploy. `--region` on `dflow environments:create` picks the cluster. The application and its database stay on that cluster.
- Application. Create it, deploy an image, build from GitHub, read logs and events, set env and secrets, roll back a release, and set a route.
- Data. PostgreSQL, disks, tasks, and templates.
- Access. Workspace tokens and operations.

## Docs

This CLI's docs site has no public hostname yet. Use these skills and `dflow help`. Do not use the cloud product's docs for these commands. The browser client is not available.
