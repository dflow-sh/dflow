<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/images/dflow-logo-wordmark-light.svg">
  <source media="(prefers-color-scheme: light)" srcset="public/images/dflow-logo-wordmark-dark.svg">
  <img alt="dFlow logo" src="public/images/dflow-logo-wordmark-dark.svg" width="318px">
</picture>
</p>

<h3 align="center" style="text-wrap: balance;">Open-source alternative to Railway, Vercel and Heroku</h3>

<p align="center">Host and Scale Apps, Databases &
Storage in your own cloud. Automated deployment workflows, container
orchestration, and infrastructure management tools, all within your private
network.</p>

<p align="center"><a href="https://dflow.sh/sign-up?source=github">Cloud</a> · <a href="https://dflow.sh/try-demo">Try live demo</a></p>

<a href="https://dflow.sh">
    <img src="public/dFlow-architecture.png" alt="dFlow Architecture diagram" align="center" width="100%"  />
</a>

<br/>
<br/>

## Features

- **Deploy Anything**: Deploy any Public/Private Git repository, Docker image
  and Databases (Postgres, MongoDB, MySQL, MariaDB, Redis).
- **Works on your Cloud**: dFlow can be run on any cloud. AWS, GCP, Azure,
  DigitalOcean, Hetzner and even your Private Machine.
- **Private Networking**: Zero trust support using Tailscale end-to-end
  encryption. No SSH-Keys required.
- **Role Based Access Control**: Create an unlimited number of custom roles and
  permissions for admin and end users.
- **Templates**: Kick start your deployments with ready made popular Open Source
  Templates
- **White Labeling**: Full customization with your branding, domains, and more.

**[See more on our website](https://dflow.sh)**.

<br/>

## Self-Hosting Guide

This guide will walk you through setting up and running your own self-hosted
instance of dFlow.

**Requirements**

Make sure you have the following:

| OS/Tools          | Recommended  | Minimum |
| ----------------- | ------------ | ------- |
| Ubuntu            | 24.04, 22.04 | LTS     |
| CPU               | 2vCPU        | 1vCPU   |
| RAM               | 8GB          | 2GB     |
| Docker            | N/A.         | N/A.    |
| Tailscale Account | N/A.         | N/A.    |
| Domain            | N/A.         | N/A.    |

<br/>

## Installation

Run the following command to begin setup. It will guide you through configuring
everything needed for your dFlow instance:

```bash
# run command as root user
sudo curl -fsSL https://get.dflow.sh | bash
```

Follow our [Installation Guide](./INSTALLATION_GUIDE.md) for more details

<br/>

## Contributing

Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting a Pull
request to the project.

<br/>

## Community support

For general help using dFlow, please refer to
[the official dFlow documentation](https://dflow.sh/docs). For additional help,
you can use one of these channels to ask a question:

- [Discord](https://discord.gg/5w7JUQYaAD) (For live discussion with the
  Community and dFlow team)
- [GitHub](https://github.com/dflow-sh/dflow) (Bug reports, Contributions)
- [Twitter](https://twitter.com/strapijs) (Get the news fast)
- [YouTube Channel](https://www.youtube.com/@paas-dflow-sh) (Learn from Video
  Tutorials)

<br/>

## Try live demo

See for yourself what's under the hood by getting access to a
[hosted dFlow instance](https://dflow.sh/try-demo).

<br/>

## License

See the [LICENSE](./license.md) file for licensing information.

<br/>

## 🤝 Contributors

Thanks to all who have contributed to dFlow!

<a href="https://github.com/akhil-naidu/dflow/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=akhil-naidu/dflow" />
</a>
