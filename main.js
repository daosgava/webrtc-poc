class VideoStreamer {
	constructor() {
		this.cameras = [];
		this.stream = undefined;
		this.videoElement = document.querySelector("video#video-streamer");
		this.loaderElement = document.querySelector("div.loader");
		this.listElement = document.querySelector("select#cameras");
	}

	async openCamera() {
		try {
			await this.setCameras();
			const constraints = {
				audio: { echoCancellation: true },
				video: {
					width: 1280,
					height: 720,
				},
			};

			this.stream = await navigator.mediaDevices.getUserMedia(
				constraints
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
				(device) => device.kind === "videoinput"
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
			this.loaderElement.style.display = "none";
			this.videoElement.style.display = "flex";
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
			this.handleDevicesChange
		);
	}
}

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
			this.handleClickToggleVideo.bind(this)
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
				"fa-video-slash"
			);
		} else {
			this.toggleAudioButton.childNodes[0].classList.toggle(
				"fa-microphone"
			);
			this.toggleAudioButton.childNodes[0].classList.toggle(
				"fa-microphone-slash"
			);
		}
	}

	listenToToggleAudio() {
		this.toggleAudioButton.addEventListener(
			"click",
			this.handleClickToggleAudio.bind(this)
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

const main = async () => {
	const videoStreamer = new VideoStreamer();
	await videoStreamer.openCamera();

	const toggleVideo = document.querySelector("button#toggle-video");
	const toggleAudio = document.querySelector("button#toggle-audio");
	const menu = new Menu({
		stream: videoStreamer.stream,
		toggleVideo,
		toggleAudio,
	});
	menu.handleClickToggleVideo();
	menu.handleClickToggleAudio();
};

main();
