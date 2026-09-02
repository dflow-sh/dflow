# Contributing to this repository

Thank you for considering a contribution. This public repository publishes
**self-host install artifacts** (Docker Compose, Dockerfiles, and installer
docs). It is not the dFlow Cloud source, and Cloud does not ship from this repo.
Platform source is not open source.

We welcome fixes and improvements to the install path, not contributions to the
private cloud platform.

## Project overview

dFlow is a platform for deploying, managing, and scaling git apps, Docker
images, and databases on your own infrastructure.

## Contribution process

1. Fork the repository
2. Clone your forked repository locally
3. Copy `.env.example` to `.env` and fill in the required values if you are
   exercising a local install.
4. Create a new branch for your fix
   `git checkout -b {feature/fix}/your-feature-name`
5. Make your changes (Dockerfiles, Compose, installer scripts, or docs in this
   repo).
6. Ensure your change works as expected.
7. Push your branch to your forked repo:
   `git push origin {feature/fix}/your-feature-name`
8. Open a Pull Request (PR) against the main branch.

## Need help?

- Open an issue if you find a bug in the self-host install path.
- Join the [Discord community](https://discord.gg/XTZcmmUG) for general
  questions.

## License

By contributing, you agree that your contributions will be licensed under the
same license as this repository. That license applies only to this public
install repo. It does not license dFlow Cloud or the private platform source.

Thank you for helping keep the self-host install path accurate.
