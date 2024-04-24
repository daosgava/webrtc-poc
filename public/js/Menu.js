class Menu {
	constructor({ videoStreamer, toggleVideoElement, toggleAudioElement }) {
		this.toggleVideoButton = toggleVideoElement;
		this.toggleAudioButton = toggleAudioElement;
		this.videoButtonIcon = toggleVideoElement.childNodes[0];
		this.audioButtonIcon = toggleAudioElement.childNodes[0];
		this.videoStreamer = videoStreamer;
		this.attachClickEvents();

		// Deactivate video and audio by default
		this.isVideoButtonActive = false;
		this.isAudioButtonActive = false;

		this.videoStreamer.setVideoState(this.isVideoButtonActive);
		this.videoStreamer.setAudioState(this.isAudioButtonActive);
		this.changeAudioButtonIcon();
		this.changeVideoButtonIcon();
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
			this.isVideoButtonActive = !this.isVideoButtonActive;
			this.videoStreamer.setVideoState(this.isVideoButtonActive);
			this.changeVideoButtonIcon();
		} catch (error) {
			console.error("Error toggling video.", error);
		}
	}

	handleClickToggleAudio() {
		try {
			this.isAudioButtonActive = !this.isAudioButtonActive;
			this.videoStreamer.setAudioState(this.isAudioButtonActive);
			this.changeAudioButtonIcon("audio");
		} catch (error) {
			console.error("Error toggling audio.", error);
		}
	}

	changeVideoButtonIcon() {
		if (this.isVideoButtonActive) {
			this.videoButtonIcon.classList.remove("fa-video-slash");
			this.videoButtonIcon.classList.add("fa-video");
		} else {
			this.videoButtonIcon.classList.remove("fa-video");
			this.videoButtonIcon.classList.add("fa-video-slash");
		}
	}

	changeAudioButtonIcon() {
		if (this.isAudioButtonActive) {
			this.audioButtonIcon.classList.remove("fa-microphone-slash");
			this.audioButtonIcon.classList.add("fa-microphone");
		} else {
			this.audioButtonIcon.classList.remove("fa-microphone");
			this.audioButtonIcon.classList.add("fa-microphone-slash");
		}
	}
}

export default Menu;
