# dflow

This repository is the **public install and release home** for the `dflow` CLI used with the new dFlow control plane (the private `dflow-sh/new` source tree). It is not the old `dflow.sh` / `app.dflow.sh` product.

One command installs the CLI. `dflow upgrade` replaces that binary later. You do not install Go.

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

Point the CLI at the new platform API. The lab default is `https://k8s.dflow.sh`. Leave `--api` off when that is already your default.

```bash
dflow auth:register --email you@example.com
dflow login
dflow whoami
dflow workspaces:list
```

`dflow login` asks for the email, then `Password:`. `dflow login --email you@example.com` skips the email question. The password is not shown. Ctrl+C leaves the prompt. `dflow auth:register` prints that a password is 12 to 128 characters before it asks. Signup creates a personal workspace. `dflow workspaces:create NAME` creates another workspace you can invite people into.

`dflow version` prints the release. A binary built from source prints `dev`, and `dflow upgrade` refuses it.

The recipe files in `templates/` are Umami and Hasura reference copies for this CLI.

## License

This repository's install script, README, and public templates are under the MIT License. See [LICENSE](./LICENSE).

The previous public application tree (unrelated to this install page) stays on the branch [`legacy`](https://github.com/dflow-sh/dflow/tree/legacy). Platform source is not published here.
