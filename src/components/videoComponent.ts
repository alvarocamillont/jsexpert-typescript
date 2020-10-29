import videojs from 'video.js';

export class VideoComponent {
  initializePlayer() {
    const player = videojs('vid');
    const ModalDialog = videojs.getComponent('ModalDialog');
    const modal = new ModalDialog(player, {
      temporary: false,
      uncloseable: true,
    });

    player.addChild(modal);
  }
}
