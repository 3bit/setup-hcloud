# setup-hcloud

<p align="left">
  <a href="https://github.com/3bit/setup-hcloud"><img alt="GitHub Actions status" src="https://github.com/3bit/setup-hcloud/workflows/ci/badge.svg"></a>
</p>

This action sets up the [Hetzner Cloud CLI](https://github.com/hetznercloud/cli) for use in actions.


# Usage
There is an optional parameter `hcloud-version` to setup a specific version of hcloud.
The default value for `hcloud-version` is `latest`, which will resolve to the version https://github.com/hetznercloud/cli/releases/latest points to.

The environment variable `HCLOUD_TOKEN` is required for hcloud to work properly. More info can be found [here](https://github.com/hetznercloud/cli/blob/master/README.md).

**Basic usage - setup the latest version:**
```yaml
steps:
- uses: actions/checkout@main
- uses: actions/setup-hcloud@v1
- run: hcloud version
  env:
    HCLOUD_TOKEN: ${{ secrets.HCLOUD_TOKEN }}
```

**Setup specific version:**
```yaml
steps:
- uses: actions/checkout@main
- uses: actions/setup-hcloud@v1
  with:
    hcloud-version: '1.19.1'
- run: hcloud version
  env:
    HCLOUD_TOKEN: ${{ secrets.HCLOUD_TOKEN }}
```

# License
The scripts and documentation in this project are released under the [MIT License](LICENSE)
