import VideoStreamer from "./VideoStreamer.js";
import Menu from "./Menu.js";
import Select from "./Select.js";

const main = async () => {
	const videoElement = document.querySelector("video#streamer");
	const placeholderElement = document.querySelector("div#placeholder");
	const videoStreamer = new VideoStreamer({
		videoElement,
		placeholderElement,
	});
	await videoStreamer.streamToVideo();
	await videoStreamer.getCameras();

	const toggleVideoElement = document.querySelector("button#toggle-video");
	const toggleAudioElement = document.querySelector("button#toggle-audio");
	const menu = new Menu({
		videoStreamer,
		toggleVideoElement,
		toggleAudioElement,
	});
	
	const selectElement = document.querySelector("select#cameras");
	const select = new Select({
		selectElement,
		videoStreamer
	});
};

main();
