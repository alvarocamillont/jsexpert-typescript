import type { Manifest, NetworkManifest, Video } from './manifest.interface';
import type { Network } from './network';
import type { VideoComponent } from './videoComponent';

export class VideoMediaPlayer {
  manifestJSON: Manifest;
  network: Network;

  videoElement: any = null;
  sourceBuffer!: SourceBuffer;
  selected: Video = {};
  videoDuration: number;
  videoComponent: VideoComponent;
  activeItem: Video = {};
  selections: Array<string> = [];

  constructor(
    manifestJSON: Manifest,
    network: Network,
    videoComponent: VideoComponent,
  ) {
    this.manifestJSON = manifestJSON;
    this.network = network;
    this.videoDuration = 0;
    this.videoComponent = videoComponent;
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
      setInterval(this.waitForQuestion.bind(this), 200);
    };
  }

  async currentFileResolution() {
    const LOWEST_RESOLUTION = '144';
    const prepareUrl: NetworkManifest = {
      url: this.manifestJSON.finalizar.url as string,
      fileResolution: LOWEST_RESOLUTION,
      fileResolutionTag: this.manifestJSON.fileResolutionTag,
      hostTag: this.manifestJSON.hostTag,
    };

    const url = this.network.parseManifestURL(prepareUrl);
    return this.network.getProperResolution(url);
  }

  async nextChunk(data: 'violao' | 'guitarra' | 'finalizar') {
    const selected = this.manifestJSON[data];
    this.selected = {
      ...selected,
      // ajusta o tempo que o modal vai aparecer
      at: parseInt(this.videoElement.currentTime + selected.at),
    };

    this.manageLag(this.selected);

    this.videoElement.play();

    await this.fileDownload(selected.url);
  }

  clickOption(event: any) {
    const target = event.target.id;

    if (
      target === 'violao' ||
      target === 'guitarra' ||
      target === 'finalizar'
    ) {
      this.nextChunk(target);
    }
  }

  waitForQuestion() {
    const currentTime = parseInt(this.videoElement.currentTime);
    const option = this.selected.at === currentTime;

    if (!option) return;
    if (this.activeItem.url === this.selected.url) return;

    if (this.selected.options) {
      this.videoComponent.configureModal(this.selected.options);
      const [option1, option2] = this.selected.options;
      document
        .getElementById(option1)
        ?.addEventListener('click', this.clickOption.bind(this));
      document
        .getElementById(option2)
        ?.addEventListener('click', this.clickOption.bind(this));
      this.activeItem = this.selected;
    }
  }

  async fileDownload(url = '') {
    const fileResolution = await this.currentFileResolution();
    const prepareUrl: NetworkManifest = {
      url,
      fileResolution,
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
    this.videoDuration += parseFloat(videoDuration);
  }
  async processBufferSegments(allSegments: ArrayBuffer) {
    this.sourceBuffer.appendBuffer(allSegments);

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

  manageLag(selected: Video) {
    const url = selected.url as string;
    if (!!~this.selections.indexOf(url)) {
      if (selected.at) selected.at += 5;
      return;
    }
    this.selections.push(url);
  }
}
