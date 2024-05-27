class MediaStreamer {
	constructor({ videoElement, placeholder }) {
		this.videoElement = videoElement;
		this.placeholder = placeholder;
		this.cameras = [];
		this.stream = undefined;
		this.isAudioActive = true;
		this.isVideoActive = true;
	}

	async streamToVideo(cameraId) {
		try {
			// TODO - Add cameraId to constraints
			const deviceId = cameraId || undefined;
			const constraints = {
				audio: false,
				video: true,
			};

			this.stream = await navigator.mediaDevices.getUserMedia(
				constraints,
			);
			this.listenDeviceChanges();
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

	setVideoState(isActive) {
		this.isVideoActive = isActive;
		this.updateVideoState();
	}

	updateVideoState() {
		this.stream
			.getVideoTracks()
			.forEach((track) => (track.enabled = this.isVideoActive));

		this.placeholder.changePlaceholderVisibility(this.isVideoActive);
	}

	setAudioState(isActive) {
		this.isAudioActive = isActive;
		this.updateAudioState();
	}

	updateAudioState() {
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

export default MediaStreamer;
