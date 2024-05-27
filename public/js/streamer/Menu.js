const COLORS = {
	gray: ["gray", "teal"],
	green: ["green", "lime"],
};
const generateClasses = (color) => [
	`from-${color[0]}-500`,
	`to-${color[1]}-500`,
	`hover:from-${color[0]}-600`,
	`hover:to-${color[1]}-600`,
];

class Menu {
	constructor({
		mediaStreamer,
		streamer,
		toggleVideoElement,
		toggleAudioElement,
		toggleStreamElement,
	}) {
		this.toggleVideoButton = toggleVideoElement;
		this.toggleAudioButton = toggleAudioElement;
		this.toggleStreamButton = toggleStreamElement;
		this.videoButtonIcon = toggleVideoElement.querySelector("i");
		this.audioButtonIcon = toggleAudioElement.querySelector("i");
		this.mediaStreamer = mediaStreamer;
		this.streamer = streamer;
		this.attachClickEvents();

		// Deactivate video and audio by default
		this.isVideoButtonActive = false;
		this.isAudioButtonActive = false;
		this.isStreamButtonActive = false;

		this.mediaStreamer.setVideoState(this.isVideoButtonActive);
		this.mediaStreamer.setAudioState(this.isAudioButtonActive);
		this.updateAudioButtonIcon();
		this.updateVideoButtonIcon();
		this.updateStreamButton();
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
		this.toggleStreamButton.addEventListener(
			"click",
			this.handleClickToggleStream.bind(this),
		);
	}

	handleClickToggleVideo() {
		try {
			this.isVideoButtonActive = !this.isVideoButtonActive;
			this.mediaStreamer.setVideoState(this.isVideoButtonActive);
			this.updateVideoButtonIcon();
		} catch (error) {
			console.error("Error toggling video.", error);
		}
	}

	handleClickToggleAudio() {
		try {
			this.isAudioButtonActive = !this.isAudioButtonActive;
			this.mediaStreamer.setAudioState(this.isAudioButtonActive);
			this.updateAudioButtonIcon();
		} catch (error) {
			console.error("Error toggling audio.", error);
		}
	}

	handleClickToggleStream() {
		try {
			this.isStreamButtonActive = !this.isStreamButtonActive;
			this.streamer.changeStreamerState(this.isStreamButtonActive);
			this.updateStreamButton();
		} catch (error) {
			console.error("Error toggling stream.", error);
		}
	}

	updateVideoButtonIcon() {
		if (this.isVideoButtonActive) {
			this.videoButtonIcon.classList.remove("fa-video-slash");
			this.videoButtonIcon.classList.add("fa-video");
		} else {
			this.videoButtonIcon.classList.remove("fa-video");
			this.videoButtonIcon.classList.add("fa-video-slash");
		}
	}

	updateAudioButtonIcon() {
		if (this.isAudioButtonActive) {
			this.audioButtonIcon.classList.remove("fa-microphone-slash");
			this.audioButtonIcon.classList.add("fa-microphone");
		} else {
			this.audioButtonIcon.classList.remove("fa-microphone");
			this.audioButtonIcon.classList.add("fa-microphone-slash");
		}
	}

	updateStreamButton() {
		if (this.isStreamButtonActive) {
			this.toggleStreamButton.classList.remove(
				...generateClasses(COLORS.gray),
			);
			this.toggleStreamButton.classList.add(
				...generateClasses(COLORS.green),
			);
		} else {
			this.toggleStreamButton.classList.remove(
				...generateClasses(COLORS.green),
			);
			this.toggleStreamButton.classList.add(
				...generateClasses(COLORS.gray),
			);
		}
	}
}

export default Menu;
