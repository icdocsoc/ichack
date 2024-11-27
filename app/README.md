# Running the app locally

# Setup

Make sure docker and bun are installed!
Run bun install if necessary
If you have pulled in new changes (perhaps the server has been updated), then make sure to build the new server image (or any other image that may have changed)

```bash
# building the new server image (replace server with any other container where needed)
docker compose up -d --build server
```

## Starting up the Docker containers

Here we are starting up the postgres and server containers; the server requires postgres so we need to start them both up

```bash
# start up postgres
# -d : detached mode; container will run in the background and the command prompt is returned to the user.
docker compose up -d postgres

# start up server in detached mode
docker compose up -d server
```

## Development Server

Start the development server on http://localhost:3000:

```bash
# running the app in development mode + hot reload changes
bun run dev:admin
```

## Checking Logs

Since we opened the containers in detached mode, if we want to view the logs, we have to run the following:

```bash
# viewing the server logs
docker compose logs server

# viewing the postgres logs
docker compose logs postgres
```

## Removing the Docker containers

Here, we are stopping and removing the containers that were created by the up commands earlier.

```bash
docker compose down
```

## Testing

To run the tests, run the following command:

```bash
bun run test
```
