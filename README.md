# dFlow

Dflow is a self-hosted platform for deploying and managing applications, similar
to Vercel, Railway, or Heroku. dFlow provides automated deployment workflows,
container orchestration, and infrastructure management capabilities while giving
you full control over your infrastructure and data.

## 🚀 Self-Hosting dFlow with Docker Compose

This guide walks you through setting up and running your own self-hosted
instance of dFlow, a powerful workflow management platform, using Docker Compose
and Tailscale.

### ✅ Prerequisites

- Docker
- Docker Compose
- A Tailscale account

### 🧭 Setup Instructions

#### 1. Clone the repository

```bash
git clone https://github.com/akhil-naidu/dflow/
cd dflow
```

#### 2. Tailscale Setup

1. Login to [tailscale](https://tailscale.com) and go to the Admin Console.
2. Update Access controls
   ```
   {
     "tagOwners": {
       "tag:customer-machine": ["autogroup:admin"],
       "tag:dflow-proxy":      ["autogroup:admin"],
       "tag:dflow-support":    ["autogroup:admin"],
     },
     "grants": [
       {
         "src": ["autogroup:admin"],
         "dst": ["tag:customer-machine"],
         "ip":  ["*"],
       },
       {
         "src": ["tag:dflow-proxy"],
         "dst": ["tag:customer-machine"],
         "ip":  ["*"],
       },
       {
         "src": ["tag:dflow-support"],
         "dst": ["tag:customer-machine"],
         "ip":  ["*"],
       },
     ],
     "ssh": [
       {
         "action": "accept",
         "src":    ["autogroup:admin", "tag:dflow-support"],
         "dst":    ["tag:customer-machine"],
         "users":  ["autogroup:admin", "root"],
       },
     ],
   }
   ```
3. Create Keys
   1. Go to settings.
   2. Navigate to Personal Settings > Keys
      1. Generate auth key
   3. Navigate to Tailnet Settings > OAuth clients
      1. Generate OAuth client with all read permissions and write permission
         for auth keys.

#### 3. DNS Configuration

Setup DNS records with your provider:

```
  Type: A,
  Name: *.subdomain
  Value: <your-server-ip>
  Proxy: OFF
```

#### 4. Configure Environment Variables

- Create .env file & add the requried variables.

  ```
  # mongodb
  MONGO_INITDB_ROOT_USERNAME=admin
  MONGO_INITDB_ROOT_PASSWORD=password
  MONGO_DB_NAME=dFlow

  # config-generator
  WILD_CARD_DOMAIN=up.example.com
  JWT_TOKEN=your-jwt-token

  # dFlow app
  NEXT_PUBLIC_WEBSITE_URL=dflow.up.example.com
  DATABASE_URI=mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@mongodb:27017/${MONGO_DB_NAME}?authSource=admin
  PAYLOAD_SECRET=your-secret

  NEXT_PUBLIC_PROXY_DOMAIN_URL=https://dflow-traefik.up.example.com
  NEXT_PUBLIC_PROXY_CNAME=cname.up.example.com

  # tailscale
  TAILSCALE_AUTH_KEY=tskey-auth-xxxx
  TAILSCALE_OAUTH_CLIENT_SECRET=tskey-client-xxxx
  TAILSCALE_TAILNET=your-tailnet-name

  # Better stack - For telemetry
  NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN=bstk-xxx
  NEXT_PUBLIC_BETTER_STACK_INGESTING_URL=https://logs.betterstack.com

  # resend - For email configurations
  RESEND_API_KEY=re_12345
  RESEND_SENDER_EMAIL=no-reply@up.example.com
  RESEND_SENDER_NAME=dFlow System
  ```

#### 5. Build the Docker image

```
source .env
docker build \
  --build-arg NEXT_PUBLIC_WEBSITE_URL=$NEXT_PUBLIC_WEBSITE_URL \
  --build-arg DATABASE_URI=$DATABASE_URI \
  --build-arg REDIS_URI=$REDIS_URI \
  --build-arg PAYLOAD_SECRET=$PAYLOAD_SECRET \
  --build-arg TAILSCALE_AUTH_KEY=$TAILSCALE_AUTH_KEY \
  --build-arg TAILSCALE_OAUTH_CLIENT_SECRET=$TAILSCALE_OAUTH_CLIENT_SECRET \
  --build-arg TAILSCALE_TAILNET=$TAILSCALE_TAILNET \
  --build-arg NEXT_PUBLIC_PROXY_DOMAIN_URL=$NEXT_PUBLIC_PROXY_DOMAIN_URL \
  --build-arg NEXT_PUBLIC_PROXY_CNAME=$NEXT_PUBLIC_PROXY_CNAME \
  --build-arg NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN=$NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN \
  --build-arg NEXT_PUBLIC_BETTER_STACK_INGESTING_URL=$NEXT_PUBLIC_BETTER_STACK_INGESTING_URL \
  --build-arg RESEND_API_KEY=$RESEND_API_KEY \
  --build-arg RESEND_SENDER_EMAIL=$RESEND_SENDER_EMAIL \
  --build-arg RESEND_SENDER_NAME=$RESEND_SENDER_NAME \
  -t dflow .
```

#### 6. Traefik Setup

1. Create `traefik.yaml` file at the root directory.
2. Change the email

   ```
   entryPoints:
     web:
       address: ":80"
     websecure:
       address: ":443"

   providers:
     file:
       directory: /etc/traefik/dynamic
       watch: true

   certificatesResolvers:
     letsencrypt:
       acme:
         email: johndoe@example.com
         storage: /etc/traefik/acme.json
         httpChallenge:
           entryPoint: web  # Used for app-specific domains

   api:
     dashboard: false
     insecure: false  # ⚠️ Secure this in production

   log:
     level: INFO
   ```

3. Create and secure `acme.json`:
   ```bash
   touch acme.json
   chmod 600 acme.json
   ```

#### 7. Start the Docker Compose Stack

```
docker compose --env-file .env up -d
```

#### 8. Final Configuration

Make a `POST` request to complete initial setup:

```
http://<YOUR_SERVER_IP>:9999/configuration
```

## 🤝 Contributors

<a href="https://github.com/akhil-naidu/dflow/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=akhil-naidu/dflow" />
</a>
