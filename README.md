# dflow

`dflow` is the command line for the dFlow platform. One command installs it. `dflow upgrade` replaces that binary later. You do not install Go.

## Install

```bash
curl -fsSL https://github.com/dflow-sh/dflow/releases/latest/download/install.sh | sh
```

That command downloads `install.sh` from the latest GitHub release. The script checks SHA-256 and writes `~/.local/bin/dflow`. It adds that directory to `PATH` only when the shell config does not already contain it.

## Update

```bash
dflow upgrade --check
dflow upgrade
```

`dflow upgrade --check` prints the current version and the latest version. It does not download a binary. A checksum that does not match leaves the installed CLI in place.

## Next

`dflow version` prints the release. `dflow login` saves an API address and a token. From there you create an application and deploy it.

The recipe files in `templates/` are Umami and Hasura.

## License

This repository's install script, README, and public templates are under the MIT License. See [LICENSE](./LICENSE).

The previous public application tree stays on the branch [`legacy`](https://github.com/dflow-sh/dflow/tree/legacy). Platform source is not published here.
