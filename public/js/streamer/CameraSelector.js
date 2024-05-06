class CameraSelector {
    constructor({ selectElement, mediaStreamer }) {
        this.select = selectElement;
        this.mediaStreamer = mediaStreamer;

        this.addCamerasToSelect();
        this.listenToSelectChange();
    }

    listenToSelectChange() {
        this.select.addEventListener("change", async () => {
            await this.mediaStreamer.streamToVideo(this.select.value);
            this.mediaStreamer.updateVideoState();
            this.mediaStreamer.updateAudioState();
        });
    }

    addCamerasToSelect(cameraId) {
		const selectedCameraId = cameraId || this.mediaStreamer.cameras[0].deviceId;

		this.select.innerHTML = "";

		this.mediaStreamer.cameras.forEach((camera) => {
			if (!camera.deviceId) return;

			const cameraOption = document.createElement("option");
			cameraOption.label = camera.label;
			cameraOption.value = camera.deviceId;
			cameraOption.selected = camera.deviceId === selectedCameraId;
			this.select.add(cameraOption);
		});
	}
}

export default CameraSelector;
