# Prune Containers Action

Will use the GitHub API to delete old untagged docker images on ghcr.io

## Params

- container-name: name of the container. Ex: ghcr.io/lannonbr/test-image, `test-image` would be the container name.

## Env

- GITHUB_TOKEN: default github token as part of actions workflow. Make sure that the `contents` and `packages` permissions are both set to true.
