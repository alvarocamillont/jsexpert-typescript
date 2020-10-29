import videojs from 'video.js';

export class VideoComponent {
  modal!: videojs.ModalDialog;

  initializePlayer() {
    const player = videojs('vid');
    const ModalDialog = videojs.getComponent('ModalDialog');
    const modal = new ModalDialog(player, {
      temporary: false,
      uncloseable: true,
    });

    player.addChild(modal);
    player.on('play', () => modal.close);

    this.modal = modal;
  }

  configureModal(selected: Array<any>) {
    const modal = this.modal;
    modal.on('modalopen', this.getModalTemplate(selected, modal));
    modal.open();
  }

  getModalTemplate(options: Array<any>, modal: videojs.ModalDialog) {
    return () => {
      const [option1, option2] = options;
      const htmlTemplate = `
        <div class="overlay">
          <div class="videoButtonWrapper">
            <button class="btn btn-dark" id="${option1}" >
              ${option1}
            </button>
            <button class="btn btn-dark" id="${option2}" >
              ${option2}
            </button>
          </div>
        </div>
      `;
      modal.contentEl().innerHTML = htmlTemplate;
    };
  }
}
