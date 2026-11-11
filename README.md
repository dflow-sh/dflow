# dflow

`dflow` is the command line for the dFlow platform. One command installs it. `dflow upgrade` replaces that binary later. You do not install Go.

## Install

```bash
curl -fsSL https://github.com/dflow-sh/dflow/releases/latest/download/install.sh | sh
```

That command downloads `install.sh` from the latest release. The latest release is still `v0.4.4` until `v1.0.0` is published, so the new installer is not served yet. After `v1.0.0` is latest, the script checks SHA-256 and writes `~/.local/bin/dflow`. It adds that directory to `PATH` only when the shell config does not already contain it.

## Update

```bash
dflow upgrade --check
dflow upgrade
```

`dflow upgrade --check` prints the current version and the latest version. It does not download a binary. A checksum that does not match leaves the installed CLI in place.

## Next

`dflow version` prints the release. `dflow login` saves an API address and a token. From there you create an application and deploy it.

The recipe files in `templates/` are Umami and Hasura. The previous public tree stays on the branch `archive/mit-snapshot`.
