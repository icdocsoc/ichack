---
created: 2024-07-05
authors:
 - Nishant
---
Docker [website](https://www.docker.com) and [Docker Hub](https://hub.docker.com)

This is an amazing tool every web developer needs to know. Getting into explaining what this is here is way too difficult and long, so it is upto you to research and understand what this is. But here is a brief understanding of it:

## Understanding our `Dockerfile`
A Dockerfile is a special file that contains commands that build **Docker images**. These images don't actually do anything, they only serve as a recipe for doing something. 

E.g. [`postgres:16`](https://github.com/docker-library/postgres/blob/3a94d965ecbe08f4b1b255d3ed9ccae671a7a984/16/bookworm/Dockerfile) is a Dockerfile that is published publicly for anyone to use. We use this image to start a **Docker container**. This container is a little machine that executes the process (here, psql) which we interact with. There are multiple parameters we supply when spinning up the container that makes this happen, which you can research or infer.

Coming to our `Dockerfile`, we need to instruct Docker on the exact recipe to start running the frontend web applications and the server, of course. If you look at our `Dockerfile`, you will see a `base` target. We specify that our container will be a little tiny Linux machine that will have bun installed inside of it. We copy all the files from the system onto the image and install all the dependencies.

> [!note]
> The reason why we copy all the package.json files first before everything else is for how Docker caching works. Feel free to research more on that if you're curious.

There are multiple targets from this single Dockerfile, i.e. we build can build multiple images from here. E.g. to build the server image, we execute the `build:server` script and then copy over the files to a different path `/prod/server` and run the `index.js` file that starts the server. Similarly, you can infer for the other docker images.

## Docker Compose
You can start docker containers by giving it an image with the `docker run` command. Imagine our application and this is what we have to do every time we start the application:

```bash
docker run \
  --name postgres \
  -e POSTGRES_USER= \
  ...
  -p '5432:5432' \
  postgres:16

docker run \
  --name server \
  -p '5000:3000' \
  ichack25-server:latest

...
```

and executing separate commands of shutting them down everytime. Tedious right? Hence, use Docker Compose. If you have a look at `docker-compose.yaml`, you will see how we start all our containers and we can do this by simply executing `docker compose up` and shutting them down is simple as `docker compose down`.

You see many services like `server`, `postgres`, and `admin`. Each of these are container configuration for the images provided (either by the `build` property or the `image` property). The server container runs the server on port 3000, which is mapped to 5000. The postgres container runs the postgres instance on port 5432, which is mapped to 5432, etc.

## Docker volumes
Volumes are needed when the file system inside the container needs to mounted to your laptop's file system. But why do we need them? Imagine that you started the `postgres` image as a container and you wrote some SQL commands and how you have some data in it. You close the container because your work is done and the next day you restart the container. But where is that data? We have to start all over again every time we close the container. Tedious, right? Not just tedious, but very wrong.

It would be amazing if we say "Any data changes on the `posgres` container, put that exact data in my system, so the next time I open the container, the container will start with the data from the other container". That's where **Docker volumes** come into play. In `docker-compose.yaml`, under `postgres` service, you'll see that `volumes: 'postgres_data:/var/lib/postgresql/data'` meaning that "The `/var/lib/postgresql/data/` folder from inside the container should be mounted onto my system (anywhere) and I'll call it `postgres_data`"

This is also particularly helpful when we need to COPY a file from our filesystem to the image that doesn't belong to us. E.g. in `nginx`, we have to provide our config file and we can do that easily by mounting our `nginx.conf` file to where it should be located inside the container. 

The development version, `dev.docker-compose.yaml` file heavily relies on volumes. This causes multiple permission issues so you might need to use `sudo` to delete folders like `.nuxt` or `.output`. You can manage your volumes with `docker volume [cmd]`.

## Docker Networks
Docker runs on a sub-network in your own PC. `ifconfig` will return a `docker0` running on a private class B IP, `172.16.0.0 - 172.31.255.255`. When running the compose files, they form a little sub-sub network where each container can talk to another container by simply using their service name. The `nginx.conf` file is a great example of this. In this network, there is a [[DNS record management|DNS]] that resolves the names into their IPs inside the bridge. Understanding this was crucial to fix [[Nuxt|Nuxt's SSR]] problem. [This video](https://www.youtube.com/watch?v=bKFMS5C4CG0) helped Nishant understand it. 