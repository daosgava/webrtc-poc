class VideoStreamer {
	constructor({
		videoElement,
		placeholderElement,
	}) {
		this.videoElement = videoElement;
		this.placeholderElement = placeholderElement;
		this.cameras = [];
		this.stream = undefined;
		this.listenDeviceChanges();
		this.listenToVideoDataLoaded();
	}

	async streamToVideo(selectedCameraId = "") {
		try {
			const constraints = {
				audio: { echoCancellation: true },
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
			this.togglePlaceholderVisibility();
			this.changePlaceholderIcon();
		});
	}

	togglePlaceholderVisibility() {
		this.placeholderElement.classList.toggle("hidden");
		this.videoElement.classList.toggle("hidden");
	}

	changePlaceholderIcon() {
		this.placeholderElement.innerHTML = '<i class="fa-solid fa-user-astronaut"></i>';
	}

	toggleVideo() {
		const videoTracks = this.stream.getVideoTracks();
		videoTracks.forEach((track) => (track.enabled = !track.enabled));
		this.togglePlaceholderVisibility();
	}

	toggleAudio() {
		const audioTracks = this.stream.getAudioTracks();
		audioTracks.forEach((track) => (track.enabled = !track.enabled));
	}

	resetVideoStream() {
		this.cameras = [];
		this.stream = undefined;
	}

	listenDeviceChanges() {
		navigator.mediaDevices.addEventListener(
			"devicechange",
			() => this.getCameras(),
		);
	}
}

export default VideoStreamer;
