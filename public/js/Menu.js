class Menu {
	constructor({ stream, toggleVideo, toggleAudio }) {
		this.toggleVideoButton = toggleVideo;
		this.toggleAudioButton = toggleAudio;
		this.stream = stream;
		this.listenToToggleMenu();
	}

	listenToToggleMenu() {
		this.listenToToggleVideo();
		this.listenToToggleAudio();
	}

	listenToToggleVideo() {
		this.toggleVideoButton.addEventListener(
			"click",
			this.handleClickToggleVideo.bind(this),
		);
	}

	handleClickToggleVideo() {
		try {
			const videoTracks = this.stream.getVideoTracks();
			videoTracks.forEach((track) => (track.enabled = !track.enabled));
			this.changeIcon("video");
		} catch (error) {
			console.error("Error toggling video.", error);
		}
	}

	changeIcon(buttonType) {
		if (buttonType === "video") {
			this.toggleVideoButton.childNodes[0].classList.toggle("fa-video");
			this.toggleVideoButton.childNodes[0].classList.toggle(
				"fa-video-slash",
			);
		} else {
			this.toggleAudioButton.childNodes[0].classList.toggle(
				"fa-microphone",
			);
			this.toggleAudioButton.childNodes[0].classList.toggle(
				"fa-microphone-slash",
			);
		}
	}

	listenToToggleAudio() {
		this.toggleAudioButton.addEventListener(
			"click",
			this.handleClickToggleAudio.bind(this),
		);
	}

	handleClickToggleAudio() {
		try {
			const audioTracks = this.stream.getAudioTracks();
			audioTracks.forEach((track) => (track.enabled = !track.enabled));
			this.changeIcon("audio");
		} catch (error) {
			console.error("Error toggling audio.", error);
		}
	}
}

export default Menu;
