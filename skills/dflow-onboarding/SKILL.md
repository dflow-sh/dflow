---
name: dflow-onboarding
description: Use when taking a person from no dFlow account to a URL with the dflow CLI at https://k8s.dflow.sh. Signup, a private personal workspace, project, environment, context, image deploy, and a platform route.
---

# Account to a URL

Run the existing `dflow` binary. Do not call the Kubernetes API and do not read a kubeconfig. This skill names the commands. `dflow help` shows the flags.

The default API is `https://k8s.dflow.sh`. Pass `--output json` and read `status`, `code`, `message`, and `request_id`. Text errors are `error: code: message`. Text mode does not require a request id. Do not retry a failed deploy.

The path, in order: create an account, create a project, create an environment, deploy, and create a route so the app has a URL. Creating the project selects it. Creating the environment selects it. `dflow context:use` still saves a workspace, project, and environment when the person wants to set them.

Agents install this skill with `npx skills add dflow-sh/dflow --skill dflow-onboarding`. The full set is `npx skills add dflow-sh/dflow`: `dflow`, `dflow-cli`, and `dflow-mcp` sit beside this skill.

## Steps

1. Account. `dflow auth:register --email EMAIL`. The CLI prints `a password must be 12 to 128 characters`, then `Password:` and `Re-enter password:`. The password is typed at the prompt. Do not pass `--password`. Do not write the password into a tool log, a chat log, or the repository. `dflow login --google` and `dflow login --github` are a later sign-in when the server has that provider. They are not this signup step and they are not MCP tools. Signup creates one personal workspace. That workspace is private. `dflow invites:create` into it returns `a personal workspace is private` and exits 6. Create another workspace with `dflow workspaces:create NAME` before the project, then invite into that workspace. A personal workspace can hold a project. An invite still cannot. An API token cannot create a workspace. After signup, the saved login is a user.

2. Project. `dflow projects:create NAME` in the workspace the person intends to use. `dflow projects:create NAME --environment ENVIRONMENT` creates that environment too and selects both. `--region` on that command pins the environment's cluster. Otherwise create the environment in the next step.

3. Environment. `dflow environments:create NAME` in that project. That command selects the environment. Do not deploy before this step.

4. Deploy. `dflow apps:create NAME`, then `dflow apps:deploy NAME --image IMAGE`. Read `status` from `--output json`. Deploy status `failed`: Stop. Show the message. Do not request a route.

5. Route. `dflow apps:route:set NAME` with no `--host` asks for the platform hostname. Do not invent a custom domain unless the person asked for one. `dflow apps:route:show NAME` prints `host`. Route returns a hostname: Stop. That hostname is the URL.

`dflow context:use --project PROJECT --environment ENVIRONMENT` still saves that pair. `dflow context:use NAME` switches a saved login. `dflow context:use --api URL` saves the default server. `--project` and `--environment` on another command apply to that command and are not saved.

## When a step fails

| What happened | What the agent does |
| --- | --- |
| Password shorter than 12 characters | Stop. Tell the person the password must be 12 to 128 characters. Do not send the password to the tool log. The command exits 1 and does not call the API. |
| `a personal workspace is private` | Create another workspace. Invite into that workspace. |
| More than one workspace at login | Print the ids. Do not pick one. Ask which workspace, or use the one the person named. |
| More than one project or environment and none is selected | Print the names. Do not pick. Run `dflow projects:use` or `dflow environments:use`, or `dflow context:use` when the person wants to set the scope by hand. |
| Deploy status `failed` | Stop. Show the message. Do not request a route. |
| Route returns a hostname | Stop. That hostname is the URL. |

The invite token is shown once by the CLI. Give it to the person. Do not store it in the repository and do not write it into a chat log.
