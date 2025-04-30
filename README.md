# dFlow

Dflow is a self-hosted platform for deploying and managing applications, similar
to Vercel, Railway, or Heroku. dFlow provides automated deployment workflows,
container orchestration, and infrastructure management capabilities while giving
you full control over your infrastructure and data.

## Self Hosting

### Railway

You can deploy dFlow on Railway using the button below.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/NNuPfr?referralCode=I9okFq)

### Docker

You can deploy dFlow as docker-image on your server, follow this guide👇

#### Requirements

1. git
2. docker
3. mongodb
4. redis

#### Process

1. clone dflow

```bash
git clone https://github.com/akhil-naidu/dflow dflow
```

2. change into directory

```bash
cd dflow
```

3. create a mongodb instance

- create mongodb instance on
  [Atlas](https://www.mongodb.com/products/platform/atlas-database),
  [Railway](https://railway.com/dashboard) or
  [ContentQL](https://contentql.io/dashboard/create-new-project) and copy the
  url
- or run mongodb docker-image

```bash
# pull the mongodb docker image
docker pull mongo

# run mongodb with a attached volume & exposing port so we can connect locally
# change the username, password by changing MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD as per your need
docker run -d \
  -v mongo-data:/data/db \
  -p 27017:27017 \
  --name my-mongo \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=secretpassword \
  mongo
```

4. create a redis instance

- create redis instance on
  [Atlas](https://www.mongodb.com/products/platform/atlas-database),
  [Railway](https://railway.com/dashboard) or
  [ContentQL](https://contentql.io/dashboard/create-new-project) and copy the
  url
- or run redis docker-image

> Note: Upstash is not recommended as we're using redis pub/sub & message queues

```bash
# pull the redis docker image
docker pull redis

# run redis with a attached volume & exposing port so we can connect locally
# change password as per your need using the --requirepass flag
docker run -d \
  -v redis-data:/data \
  -p 6379:6379 \
  --name my-redis \
  redis redis-server --requirepass your-password
```

5. trigger docker-image build

> Note: we use PAYLOAD_SECRET to encrypt fields in database, make sure you don't
> lose it.

> Note: NEXT_PUBLIC_WEBSITE_URL should be in this format -> ✅ `mydomain.com`.
> don't use this format ❌ `https://mydomain.com/`

```bash
# pass the mongodb, redis database-url's as build-arguments
# replace NEXT_PUBLIC_WEBSITE_URL with your domain
docker build \
  --build-arg DATABASE_URI="mongodb://username:password@localhost:27017/dflow?authSource=admin" \
  --build-arg REDIS_URI="redis://:password@localhost:6379" \
  --build-arg PAYLOAD_SECRET="1781c9a00336ffa7fdf27ce7" \
  --build-arg NEXT_PUBLIC_WEBSITE_URL="localhost:3000" \
  -t dflow .
```

4. Run the docker-image

```bash
# pass the mongodb, redis database-url's as environment variables
# replace NEXT_PUBLIC_WEBSITE_URL with your domain
docker run -d -p 3000:3000 \
  -e DATABASE_URI="mongodb://username:password@localhost:27017/dflow?authSource=admin" \
  -e REDIS_URI="redis://:password@localhost:6379" \
  -e PAYLOAD_SECRET="1781c9a00336ffa7fdf27ce7"
  -e NEXT_PUBLIC_WEBSITE_URL="localhost:3000"
  dflow
```
