I have identified and fixed the issue.

The error `COPY failed: stat app/dist: file does not exist` occurred because the frontend build process was configured to output files to a directory named `build`, but the Dockerfile was trying to copy from a `dist` directory.

I have corrected the `Dockerfile` to copy from the correct `build` directory.

Please try running the command again:

```shell
docker compose up --build -d
```