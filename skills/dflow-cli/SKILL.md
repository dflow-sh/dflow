---
name: dflow-cli
description: Use when an agent runs dflow, deploys or lists an application, creates a token, or calls the dFlow lab API. Covers --output json, the context to select, exit codes, confirm flags, and the one-time token secret. The account-to-URL path is dflow-onboarding.
---

# dflow for agents

Run `dflow` from the installed CLI. In this source repository, before it is installed, that binary is `./bin/dflow` from the repository root. Do not call the Kubernetes API and do not read a kubeconfig.

A new person with no account follows `dflow-onboarding`. Signup creates one personal workspace. That workspace is private. `dflow invites:create` into it returns `a personal workspace is private`. Do not start signup from a workspace API token. An API token cannot create a workspace. After signup, the saved login is a user.

When the host speaks MCP, follow `dflow-mcp`. Prefer MCP tools when the host is MCP; otherwise use this CLI with `--output json`. A password is not an MCP argument.

`dflow help` shows the flags. Do not invent a flag.

## Every call

```text
dflow --context NAME --output json resource:verb
```

`--output json` is the form an agent parses. It prints the API body. Do not parse the text table or the aligned labels.

Pass `--context` on every command that uses a saved login. When the caller is an API token, that token is required for projects, environments, applications, databases, routes, and logs. A signed-in user uses the saved login from `dflow-onboarding` instead. A platform owner token can run `workspaces:list` and `tokens:create`. On the other commands it exits 2 with `forbidden`.

## Output

Success is one JSON document on stdout. Failure with `--output json` is also one JSON document on stdout:

```json
{"error":{"code":"forbidden","message":"forbidden","request_id":"req_123"}}
```

The exit code is still set. Read `code`, `message`, and `request_id`. Do not look for the error on stderr when `--output json` is set.

| Exit | What to do |
| --- | --- |
| 0 | Use the document. |
| 1 | The command is wrong. Fix the flag or the missing context. |
| 2 | The token is missing, rejected, or not allowed. |
| 3 | This token cannot see that name or id. |
| 4 | That name already exists. |
| 5 | The operation failed or was cancelled. Read `message`. |
| 6 | A precondition failed. |
| 7 | The wait ended. Call `operations:inspect ID`. |
| 10 | The API could not be reached. |

## Waiting and deletes

`--wait` defaults to true and blocks. Pass `--wait=false`, then `operations:inspect ID`, when the agent should return before the work finishes.

| Command | Required flag | Value |
| --- | --- | --- |
| `apps:delete NAME` | `--confirm-name` | application name |
| `db:delete NAME` | `--confirm-name` | service name |
| `tokens:revoke ID` | `--confirm` | display prefix |

Without the flag, the command waits for a person to type.

## Secrets

`tokens:create` returns the secret once, in the JSON field `token`. Store it outside the repository. Do not write it into a file in git, a pull request, or a chat log. A later command cannot show it again.

A password is typed at the `Password:` prompt. It is not a flag and it is not an MCP argument. Do not write it into a chat log.

`projects:create` and `environments:create` accept `--idempotency-key`. Repeat the same key and the same body to get the original result.
