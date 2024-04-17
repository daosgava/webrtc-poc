import VideoStreamer from "./VideoStreamer.js";
import Menu from "./Menu.js";

const main = async () => {
	const videoStreamer = new VideoStreamer();
	await videoStreamer.openCamera();
	const menu = new Menu({
		stream: videoStreamer.stream,
		toggleVideo: document.querySelector("button#toggle-video"),
		toggleAudio: document.querySelector("button#toggle-audio"),
	});
	menu.handleClickToggleVideo();
	menu.handleClickToggleAudio();
};

main();
