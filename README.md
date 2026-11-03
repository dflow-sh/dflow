<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/images/dflow-logo-wordmark-light.svg">
  <source media="(prefers-color-scheme: light)" srcset="public/images/dflow-logo-wordmark-dark.svg">
  <img alt="dFlow logo" src="public/images/dflow-logo-wordmark-dark.svg" width="318px">
</picture>
</p>

<h3 align="center">You can self-host from this repository. We no longer maintain it.</h3>

This is the last public MIT tree of dFlow. You can still clone it and run it
on your own machines. We do not update it, fix it, or support it.

The product we maintain is [dFlow](https://dflow.sh). The licensing change is
explained in
[dFlow today: from open source to an always-free tier](https://dflow.sh/blog/dflow-today-from-open-source-to-an-always-free-tier).

The MIT license in [license.md](./license.md) covers this repository only. It
does not cover dFlow Cloud or private platform source.

## Where to go

- [dflow.sh](https://dflow.sh) for the hosted product, including the always-free tier
- [Documentation](https://dflow.sh/docs)
- [Discord](https://discord.gg/5w7JUQYaAD)
- [X](https://x.com/dflow_sh)

Issues filed here are not a support channel. Use the docs or Discord for the
product we maintain.

## Self-hosting this snapshot

Clone the repository and run `scripts/self-host-setup.sh` as root. The stack
is `docker-compose.yml`. You are on your own after that. We will not ship
fixes for this tree.
