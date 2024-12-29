# 
# Filename: Dockerfile
# Author: Franz Chuquirachi
# Created: 2024-12-26
# Reference: https://docs.docker.com/guides/python/containerize/
# Copyright © 2024 Franz Arthur Chuquirachi Rosales. All rights reserved.
#

# Use official Microsoft Python image from the Docker Hub: https://hub.docker.com/r/microsoft/devcontainers-python
FROM mcr.microsoft.com/devcontainers/python:0-3.8

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

WORKDIR /threecad

# Create a non-privileged user that the app will run under.
# See https://docs.docker.com/go/dockerfile-user-best-practices/
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.cache/pip to speed up subsequent builds.
# Leverage a bind mount to requirements.txt to avoid having to copy them into
# into this layer.
RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=requirements.txt,target=requirements.txt \
    python -m pip install -r requirements.txt

# Switch to the non-privileged user to run the application.
USER appuser

# Expose the port that the application listens on.
# EXPOSE 8000
# EXPOSE 5173

# Copy the source code into the container.
COPY . .

# Run the application.
# CMD ["python", "server/server.py"]