# Overview

Use this document to understand dokku basics quickly, but in the end the source
of truth is the dokku documentation

## Dokku Basic Commands

List of Dokku commands to install a Github project with Docker File

The above set of commands are very basic commands that can be used to install a
Github project with Docker File.

- `dokku app:create name`
- `dokku ports:set name http:80:3000`
- `dokku letsencypt:enable name`
- `dokku git:sync --build test https://github.com/tonykhbo/hello-world-nextjs main`

### Note

In the above example,

1. dokku letsencypt plugin was installed
2. dokku letsencypt plugin was configured globally with user email
3. the github repository was public

## Required Parameters

So from the above example, what are the required parameters

1. During the installation of dFlow, we should ensure `letsencypt` plugin is
   installed
2. while user is creating the service, which is not a database, we should take
   1. port number => default 3000
   2. ensure if user need https or not => default yes
   3. github url and branch => default main
