import type { NetworkManifest } from './manifest.interface';

export class Network {
  host: string;

  constructor(host = '') {
    this.host = host;
  }

  parseManifestURL(manifest: NetworkManifest) {
    const { url, fileResolution, fileResolutionTag, hostTag } = manifest;
    return url
      .replace(fileResolutionTag, fileResolution)
      .replace(hostTag, this.host);
  }

  async fetchFile(url: string) {
    const response = await fetch(url);
    return response.arrayBuffer();
  }
}
