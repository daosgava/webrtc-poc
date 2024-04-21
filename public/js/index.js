import VideoStreamer from "./VideoStreamer.js";
import Menu from "./Menu.js";

const main = async () => {
	const videoElement = document.querySelector("video#streamer");
	const placeholderElement = document.querySelector("div#placeholder");
	const selectElement = document.querySelector("select#cameras");
	const videoStreamer = new VideoStreamer({
		videoElement,
		placeholderElement,
		selectElement
	});
	await videoStreamer.streamToVideo();

	const toggleVideoElement = document.querySelector("button#toggle-video");
	const toggleAudioElement = document.querySelector("button#toggle-audio");
	const menu = new Menu({
		videoStreamer,
		toggleVideoElement,
		toggleAudioElement,
	});
	menu.handleClickToggleVideo();
	menu.handleClickToggleAudio();
};

main();
