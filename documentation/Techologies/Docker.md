---
title: Docker
date: 2024-07-05
---
Docker [website](https://www.docker.com) and [Docker Hub](https://hub.docker.com)

This is an amazing tool every web developer needs to know. Getting into explaining what this is here is way too difficult and long, so it is upto you to research and understand what this is.

In brief, this tool is essentially creating small little machines in your system and executing a small process. The process runs on your machine which you can see. 

## Docker Compose

Now when you need to use multiple Docker Images, it is much better to use docker compose. This spins up the required containers and starts running them altogether.

## Basic concept

If you see `docker-compose.yaml` file in the code base, you will see many services like `server`, `postgres`, and `admin`. Each of these are container configuration for the images provided (either by the `build` property or the `image` property). The server container runs the server on port 3000, which is mapped to 5000. The postgres container runs the postgres instance on port 5432, which is mapped to 5432, etc.

You can now communicate between all services together. They have one command to start all processes `docker compose up` and one command to destroy everything `docker compose down`. 