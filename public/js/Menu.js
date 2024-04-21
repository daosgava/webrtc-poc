class Menu {
	constructor({ videoStreamer, toggleVideoElement, toggleAudioElement }) {
		this.toggleVideoButton = toggleVideoElement;
		this.toggleAudioButton = toggleAudioElement;
		this.videoStreamer = videoStreamer;
		this.attachClickEvents();
	}

	attachClickEvents() {
		this.toggleVideoButton.addEventListener(
			"click",
			this.handleClickToggleVideo.bind(this),
		);
		this.toggleAudioButton.addEventListener(
			"click",
			this.handleClickToggleAudio.bind(this),
		);
	}

	handleClickToggleVideo() {
		try {
			this.videoStreamer.toggleVideo();
			this.changeIcon("video");
		} catch (error) {
			console.error("Error toggling video.", error);
		}
	}

	handleClickToggleAudio() {
		try {
			this.videoStreamer.toggleAudio();
			this.changeIcon("audio");
		} catch (error) {
			console.error("Error toggling audio.", error);
		}
	}

	changeIcon(buttonType) {
		if (buttonType === "video") {
			this.changeVideoButtonIcon();
		} else {
			this.changeAudioButtonIcon();
		}
	}

	changeVideoButtonIcon() {
		this.toggleVideoButton.childNodes[0].classList.toggle("fa-video");
		this.toggleVideoButton.childNodes[0].classList.toggle("fa-video-slash");
	}

	changeAudioButtonIcon() {
		this.toggleAudioButton.childNodes[0].classList.toggle("fa-microphone");
		this.toggleAudioButton.childNodes[0].classList.toggle(
			"fa-microphone-slash",
		);
	}
}

export default Menu;
