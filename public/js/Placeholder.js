class Placeholder {
	constructor({ videoElement, placeholderElement }) {
		this.videoElement = videoElement;
		this.placeholderElement = placeholderElement;
		this.listenToVideoDataLoaded();
	}

	listenToVideoDataLoaded() {
		this.videoElement.addEventListener("loadedmetadata", () => {
			this.changePlaceholderVisibility();
			this.showAvatarIcon();
		});
	}

	changePlaceholderVisibility(isVideoActive) {
		if (isVideoActive) {
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
		this.placeholderElement.children[0].classList.remove(
			"fa-user-astronaut",
		);
		this.placeholderElement.children[0].classList.add("fa-spinner");
		this.placeholderElement.children[0].classList.add("fa-spin");
	}
}

export default Placeholder;
