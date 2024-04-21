class VideoStreamer {
	constructor({
		videoElement,
		placeholderElement,
		selectElement,
	}) {
		this.videoElement = videoElement;
		this.placeholderElement = placeholderElement;
		this.selectElement = selectElement;
		this.cameras = [];
		this.stream = undefined;
	}

	async streamToVideo() {
		try {
			const constraints = {
				audio: { echoCancellation: true },
				video: {},
			};

			this.stream = await navigator.mediaDevices.getUserMedia(
				constraints,
			);

			// Safari doesn't get devices until getUserMedia is called
			await this.getCameras();

			this.setVideoSource();
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
			console.log({devices})
			this.cameras = videoCameras;
			this.addCamerasToSelectElement();
		} catch (error) {
			console.error("Error querying media devices.", error);
		}
	}

	addCamerasToSelectElement() {
		if (!this.cameras) {
			console.warn("No cameras found.");
			return;
		}

		this.selectElement.innerHTML = "";

		this.cameras.forEach((camera) => {
			if (!camera.deviceId) return;

			const cameraOption = document.createElement("option");
			cameraOption.label = camera.label;
			cameraOption.value = camera.deviceId;
			this.selectElement.add(cameraOption);
		});
	}

	setVideoSource() {
		this.videoElement.srcObject = this.stream;
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
		this.placeholderElement.innerHTML = '<i class="fa-solid fa-camera"></i>';
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

	handleDevicesChange() {
		updateCameraList();
	}

	listenDeviceChanges() {
		navigator.mediaDevices.addEventListener(
			"devicechange",
			this.handleDevicesChange,
		);
	}
}

export default VideoStreamer;
