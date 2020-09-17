import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import os from 'os'

export async function run(version: string): Promise<string> {
  let toolPath = tc.find('hcloud', version)
  if (toolPath) {
    core.info(`Found in cache @ ${toolPath}`)
    return toolPath
  }

  core.info(`Attempting to install version ${version}...`)
  try {
    toolPath = await install(version)
  } catch (err) {
    core.debug(err.stack)
    throw new Error(`Failed to install version '${version}': ${err}`)
  }

  return toolPath
}

async function install(version: string): Promise<string> {
  const plat = getPlatform()
  const arch = getArch()
  const zip = plat === 'windows' || plat === 'macos'
  const ext = zip ? 'zip' : 'tar.gz'

  const baseURL = 'https://github.com/hetznercloud/cli/releases/download'
  const url = `${baseURL}/v${version}/hcloud-${plat}-${arch}.${ext}`

  try {
    core.info(`Downloading version ${version} from ${url}`)
    const downloadPath = await tc.downloadTool(url)

    if (!downloadPath) {
      throw new Error(
        `Unable to download hcloud version '${version}' for platform '${plat}' and architecture '${arch}'`
      )
    }

    core.info('Extracting archive...')
    const extPath = await extractArchive(downloadPath, zip)
    core.info(`Successfully extracted hcloud to ${extPath}`)

    core.info('Caching hcloud binary ...')
    const cacheDir = await tc.cacheDir(extPath, 'hcloud', version)
    core.info(`Successfully cached hcloud to ${cacheDir}`)
    return cacheDir
  } catch (err) {
    if (
      err instanceof tc.HTTPError &&
      (err.httpStatusCode === 403 || err.httpStatusCode === 429)
    ) {
      core.info(
        `Received HTTP status code ${err.httpStatusCode}.  This usually indicates the rate limit has been exceeded`
      )
    } else {
      core.info(err.message)
    }
    throw err
  }
}

async function extractArchive(
  archivePath: string,
  zip: boolean
): Promise<string> {
  let extPath: string

  if (zip) {
    extPath = await tc.extractZip(archivePath)
  } else {
    extPath = await tc.extractTar(archivePath)
  }

  return extPath
}

function getPlatform(): string {
  const p = os.platform()
  const mappings = new Map<string, string>([
    ['darwin', 'macos'],
    ['win32', 'windows']
  ])
  return mappings.get(p) || p
}

function getArch(): string {
  const a = os.arch()
  const mappings = new Map<string, string>([
    ['x32', '386'],
    ['x64', 'amd64']
  ])
  return mappings.get(a) || a
}
