class VideoStreamer {
	constructor({ videoElement, placeholderElement }) {
		this.videoElement = videoElement;
		this.placeholderElement = placeholderElement;
		this.cameras = [];
		this.stream = undefined;
		this.isAudioActive = true;
		this.isVideoActive = true;
		this.listenDeviceChanges();
		this.listenToVideoDataLoaded();
	}

	async streamToVideo(selectedCameraId = "") {
		try {
			const constraints = {
				audio: { echoCancellation: true, noiseSuppression: true },
				video: {
					deviceId: selectedCameraId,
				},
			};

			this.stream = await navigator.mediaDevices.getUserMedia(
				constraints,
			);

			this.videoElement.srcObject = this.stream;
		} catch (error) {
			console.error("Error opening video camera.", error);
		}
	}

	async getCameras() {
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			const videoCameras = devices.filter(
				(device) => device.kind === "videoinput",
			);

			this.cameras = videoCameras;
		} catch (error) {
			console.error("Error querying media devices.", error);
		}
	}

	listenToVideoDataLoaded() {
		this.videoElement.addEventListener("loadedmetadata", () => {
			this.changePlaceholderVisibility();
			this.showAvatarIcon();
		});
	}

	changePlaceholderVisibility() {
		if (this.isVideoActive) {
			this.placeholderElement.classList.add("hidden");
			this.videoElement.classList.remove("hidden");
		} else {
			this.placeholderElement.classList.remove("hidden");
			this.videoElement.classList.add("hidden");
		}
	}

	showAvatarIcon() {
		this.placeholderElement.children[0].classList.remove("fa-spinner");
		this.placeholderElement.children[0].classList.remove("fa-spin");
		this.placeholderElement.children[0].classList.add("fa-user-astronaut");
	}

	showLoadingIcon() {
		this.placeholderElement.children[0].classList.remove("fa-user-astronaut");
		this.placeholderElement.children[0].classList.add("fa-spinner");
		this.placeholderElement.children[0].classList.add("fa-spin");
	}

	setVideoState(isActive) {
		this.isVideoActive = isActive;
		this.changeVideoState();
	}

	changeVideoState() {
		this.stream
			.getVideoTracks()
			.forEach((track) => (track.enabled = this.isVideoActive));

		this.changePlaceholderVisibility();
	}

	setAudioState(isActive) {
		this.isAudioActive = isActive;
		this.changeAudioState();
	}

	changeAudioState() {
		this.stream
			.getAudioTracks()
			.forEach((track) => (track.enabled = this.isAudioActive));
	}

	resetVideoStream() {
		this.cameras = [];
		this.stream = undefined;
	}

	listenDeviceChanges() {
		navigator.mediaDevices.addEventListener("devicechange", () =>
			this.getCameras(),
		);
	}
}

export default VideoStreamer;
