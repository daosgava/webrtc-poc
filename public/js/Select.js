class Select {
    constructor({ selectElement, videoStreamer }) {
        this.select = selectElement;
        this.videoStreamer = videoStreamer;

        this.addCamerasToSelect();
        this.listenToSelectChange();
    }

    listenToSelectChange() {
        this.select.addEventListener("change", async () => {
            // TODO: Implement camera change
            console.log("Camera change is not implemented yet.");
        });
    }

    addCamerasToSelect(cameraId) {
		const selectedCameraId = cameraId || this.videoStreamer.cameras[0].deviceId;

		this.select.innerHTML = "";

		this.videoStreamer.cameras.forEach((camera) => {
			if (!camera.deviceId) return;

			const cameraOption = document.createElement("option");
			cameraOption.label = camera.label;
			cameraOption.value = camera.deviceId;
			cameraOption.selected = camera.deviceId === selectedCameraId;
			this.select.add(cameraOption);
		});
	}
}

export default Select;
