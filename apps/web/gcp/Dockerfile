# Dockerfile for use with CloudRun

FROM gcr.io/distroless/nodejs22-debian11
WORKDIR /atlas

COPY . ./

WORKDIR /atlas/server
CMD ["index.mjs"]
