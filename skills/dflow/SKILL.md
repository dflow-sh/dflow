---
name: dflow
description: Use when a person asks what this dFlow CLI can do, which skill to follow, where the docs are, or why this control plane exists. The API is https://k8s.dflow.sh. The motto is that dFlow runs the machines and bills deploys by use. The running cloud at dflow.sh is a different product.
---

# dFlow

This is the dFlow command line and its MCP server. The API is `https://k8s.dflow.sh`. The product word is workspace. A project contains environments. An application runs in one environment. A route gives that application a hostname.

The motto for this control plane: nothing to bring. dFlow runs the machines and bills the deploys you use. Attach a cluster only if you already have one. Billing is not built. The full story, including the running cloud and the public install repository, is `docs/PRODUCT.md`.

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
- Project and environment. `dflow projects:create` and `dflow environments:create` select what they create. `dflow projects:create NAME --environment ENVIRONMENT` creates both and selects both. No environment is invented. `dflow context:use` still saves a workspace, project, and environment when you set them yourself. `--region` on `dflow environments:create`, or on `dflow projects:create --environment`, picks the cluster. The application and its database stay on that cluster.
- Application. Create it, deploy an image, build from GitHub, read logs and events, set env and secrets, roll back a release, and set a route.
- Data. PostgreSQL, disks, tasks, and templates.
- Access. Workspace tokens and operations.

## Docs

Use these skills and `dflow help` for this CLI. The lab manual is `https://docs.k8s.dflow.sh`. `https://docs.dflow.sh` is the running cloud. Do not use it for these commands. The browser client is not available. The public install repository is `dflow-sh/dflow`.
