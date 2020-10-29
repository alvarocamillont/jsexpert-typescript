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

  async getProperResolution(url: string) {
    const startMs = Date.now();
    const response = await fetch(url);
    await response.arrayBuffer();
    const endMs = Date.now();
    const durationInMs = endMs - startMs;
    const LOWEST_RESOLUTION = '144';

    const resolutions = [
      {
        start: 3001,
        end: 20000,
        resolution: '144',
      },
      {
        start: 901,
        end: 3000,
        resolution: '360',
      },
      {
        start: 0,
        end: 900,
        resolution: '720',
      },
    ];

    const item = resolutions.find((item) => {
      return item.start <= durationInMs && item.end >= durationInMs;
    });

    return item?.resolution ?? LOWEST_RESOLUTION;
  }
}
