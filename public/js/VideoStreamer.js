class VideoStreamer {
	constructor() {
		this.cameras = [];
		this.stream = undefined;
		this.videoElement = document.querySelector("video#video-streamer");
		this.loaderElement = document.querySelector("div#loader");
		this.listElement = document.querySelector("select#cameras");
	}

	async openCamera() {
		try {
			await this.setCameras();
			const constraints = {
				audio: { echoCancellation: true },
				video: {},
			};

			this.stream = await navigator.mediaDevices.getUserMedia(
				constraints,
			);
			this.setVideoSource();
		} catch (error) {
			console.error("Error opening video camera.", error);
		}
	}

	async setCameras() {
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			const videoCameras = devices.filter(
				(device) => device.kind === "videoinput",
			);

			this.cameras = videoCameras;
			this.updateCameraList();
		} catch (error) {
			console.error("Error querying media devices.", error);
		}
	}

	updateCameraList() {
		if (!this.cameras) {
			console.warn("No cameras found.");
			return;
		}

		this.listElement.innerHTML = "";

		this.cameras.forEach((camera) => {
			if (!camera.deviceId) return;

			const cameraOption = document.createElement("option");
			cameraOption.label = camera.label;
			cameraOption.value = camera.deviceId;
			this.listElement.add(cameraOption);
		});
	}

	setVideoSource() {
		this.videoElement.srcObject = this.stream;
		this.videoElement.addEventListener("loadedmetadata", () => {
			this.loaderElement.classList.toggle("hidden");
			this.videoElement.classList.toggle("hidden");
		});
	}

	silenceVideo() {
		const videoTracks = this.stream.getVideoTracks();
		videoTracks.forEach((track) => (track.enabled = false));
	}

	silenceAudio() {
		const videoTracks = this.stream.getAudioTracks();
		videoTracks.forEach((track) => (track.enabled = false));
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
