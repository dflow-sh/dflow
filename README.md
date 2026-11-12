# dflow

`dflow` is the command line for the dFlow platform. One command installs it. `dflow upgrade` replaces that binary later. You do not install Go.

## Install

```bash
curl -fsSL https://github.com/dflow-sh/dflow/releases/latest/download/install.sh | sh
```

The script checks SHA-256 and writes `~/.local/bin/dflow`. It adds that directory to `PATH` only when the shell config does not already contain it.

## Update

```bash
dflow upgrade --check
dflow upgrade
```

`dflow upgrade --check` prints the current version and the latest version. It does not download a binary. A checksum that does not match leaves the installed CLI in place.

## Sign in

The public server is `https://k8s.dflow.sh`. Leave `--api` off.

```bash
dflow auth:register --email you@example.com
dflow login --email you@example.com
dflow whoami
dflow workspaces:list
```

The password is typed at a prompt. Signup creates a personal workspace. `dflow workspaces:create NAME` creates another workspace you can invite people into.

`dflow version` prints the release. A binary built from source prints `dev`, and `dflow upgrade` refuses it.

The recipe files in `templates/` are Umami and Hasura. The previous public tree stays on the branch `archive/mit-snapshot`.
