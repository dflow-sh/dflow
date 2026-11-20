---
name: dflow-mcp
description: Use when an agent calls dFlow through MCP. The hosted server is https://k8s.dflow.sh/mcp. A bearer token, no password, and a confirmation before a delete.
---

# dFlow MCP

Prefer MCP when the host already speaks MCP. Otherwise follow `dflow-cli` and pass `--output json`. A password is not an MCP argument.

The hosted server is `https://k8s.dflow.sh/mcp`. Each request sends `Authorization: Bearer` with a token from `dflow tokens:create` or from the saved login. MCP does not start Google or GitHub sign-in. Those logins stay on the CLI. There is no long-lived server session. A missing bearer token returns `unauthenticated` and does not call the API.

Signup is not an MCP tool. A new person follows `dflow-onboarding` on the CLI. The token secret is shown once. Do not write it into a chat log or a repository.

A local `dflow-mcp` process can speak stdio with `DFLOW_API=https://k8s.dflow.sh` and `DFLOW_TOKEN`. Give a person the hosted URL. The npm package is not published yet.

## What the tools cover

Call `tools/list` for the names. Do not invent a tool.

The tools cover workspaces, projects, environments, applications, image deploys with optional CPU and memory, GitHub builds, a local directory build, restart without a new release, logs, events, env, secrets, routes, PostgreSQL, a Valkey cache, disks, tasks, templates, recipe checks, tokens, members, and operations.

These are not tools: a password, signup, logout, Google or GitHub sign-in, an invite, `environments_delete`, `dflow clusters:register`, and every `dflow-server` command. There is no Kubernetes, shell, or exec tool.

## How a call behaves

A read times out at 30 seconds. A deploy or other change returns when the API accepts it. It does not wait until the operation succeeds. Call `operations_wait` with the operation id. It returns the phases, the last log lines, and the final URL or failure class. `operations_inspect` still reads one operation. Stop when that status is `failed`.

`apps_env_set` replaces the whole variable map. `db_credentials` reveals a connection once. `github_token_set` stores a GitHub token for a private repository. An API token cannot store that GitHub token. The value is not printed back.

The personal workspace is private. An API token cannot create a workspace.

## Confirmation

A delete or revoke returns `validation` and does not call the API when the confirmation is missing or empty. Ask the person, then pass the value they named.

| Tool | Argument | Must equal |
| --- | --- | --- |
| `apps_delete` | `confirm_name` | application name |
| `db_delete` | `confirm_name` | service name |
| `volumes_delete` | `confirm_name` | volume name |
| `tokens_revoke` | `confirmation` | display prefix |
| `apps_route_delete` | `confirm_host` | that host |
| `members_remove` | `confirm_email` | that member's email |
