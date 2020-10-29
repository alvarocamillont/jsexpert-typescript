import type { Manifest } from './components/manifest.interface';
import { Network } from './components/network';
import { VideoComponent } from './components/videoComponent';
import { VideoMediaPlayer } from './components/videoPlayer';

export async function main() {
  const MANIFEST_URL = 'manifest.json';
  const localHost = ['127.0.0.1', 'localhost'];
  const isLocal = !!~localHost.indexOf(window.location.hostname);
  const manifestJSON: Manifest = await (await fetch(MANIFEST_URL)).json();
  const host = isLocal ? manifestJSON.localHost : manifestJSON.productionHost;
  const videoComponent = new VideoComponent();
  const network = new Network(host);
  const videoPlayer = new VideoMediaPlayer(manifestJSON, network);
  videoPlayer.initializeCodec();
  videoComponent.initializePlayer();
}

window.onload = main;
