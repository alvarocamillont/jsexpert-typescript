import type { Manifest, NetworkManifest, Video } from './manifest.interface';
import type { Network } from './network';

export class VideoMediaPlayer {
  manifestJSON: Manifest;
  network: Network;

  videoElement: any = null;
  sourceBuffer!: SourceBuffer;
  selected: Video = {};
  videoDuration: number;

  constructor(manifestJSON: Manifest, network: Network) {
    this.manifestJSON = manifestJSON;
    this.network = network;
    this.videoDuration = 0;
  }

  initializeCodec() {
    this.videoElement = document.getElementById('vid');
    if (this.videoElement) {
      const mediaSourceSupported = !!window.MediaSource;
      if (!mediaSourceSupported) {
        alert('Seu browser ou sistema nao tem suporte a MSE!');
        return;
      }

      const codecSupported = MediaSource.isTypeSupported(
        this.manifestJSON.codec,
      );
      if (!codecSupported) {
        alert(`Seu browser nao suporta o codec: ${this.manifestJSON.codec}`);
        return;
      }

      const mediaSource = new MediaSource();
      this.videoElement.src = URL.createObjectURL(mediaSource);
      console.log('this.videoElement.src ', this.videoElement.src);
      mediaSource.addEventListener(
        'sourceopen',
        this.sourceOpenWrapper(mediaSource),
      );
    }
  }

  sourceOpenWrapper(mediaSource: MediaSource) {
    return async () => {
      this.sourceBuffer = mediaSource.addSourceBuffer(this.manifestJSON.codec);
      const selected = (this.selected = this.manifestJSON.intro);
      // evita rodar como "LIVE"
      mediaSource.duration = this.videoDuration;
      await this.fileDownload(selected.url);
    };
  }

  async fileDownload(url = '') {
    const prepareUrl: NetworkManifest = {
      url,
      fileResolution: '360',
      fileResolutionTag: this.manifestJSON.fileResolutionTag,
      hostTag: this.manifestJSON.hostTag,
    };
    const finalUrl = this.network.parseManifestURL(prepareUrl);
    this.setVideoPlayerDuration(finalUrl);
    const data = await this.network.fetchFile(finalUrl);
    return this.processBufferSegments(data);
  }

  setVideoPlayerDuration(finalURL: string) {
    const bars = finalURL.split('/');
    const [name, videoDuration] = bars[bars.length - 1].split('-');
    this.videoDuration += parseInt(videoDuration);
  }
  async processBufferSegments(allSegments: ArrayBuffer) {
    this.sourceBuffer.appendBuffer(allSegments);
    console.log('source', this.sourceBuffer);

    return new Promise((resolve, reject) => {
      const updateEnd = () => {
        this.sourceBuffer.removeEventListener('updateend', updateEnd);
        this.sourceBuffer.timestampOffset = this.videoDuration;
        return resolve();
      };

      this.sourceBuffer.addEventListener('updateend', updateEnd);
      this.sourceBuffer.addEventListener('error', reject);
    });
  }
}
