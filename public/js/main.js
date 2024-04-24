import VideoStreamer from "./VideoStreamer.js";
import Menu from "./Menu.js";
import Select from "./Select.js";
import WebRTC from "./WebRTC.js";

const videoElement = document.querySelector("video#streamer");
const placeholderElement = document.querySelector("div#placeholder");
const toggleVideoElement = document.querySelector("button#toggle-video");
const toggleAudioElement = document.querySelector("button#toggle-audio");
const selectElement = document.querySelector("select#cameras");

const main = async () => {
	const videoStreamer = new VideoStreamer({
		videoElement,
		placeholderElement,
	});
	await videoStreamer.streamToVideo();
	await videoStreamer.getCameras();

	new Menu({
		videoStreamer,
		toggleVideoElement,
		toggleAudioElement,
	});

	new Select({
		selectElement,
		videoStreamer,
	});

	const signalServer = new WebSocket("ws://localhost:8080/ws");
	new WebRTC({
		stream: videoStreamer.stream,
		signalServer,
		room: "poc-room",
	});
};

main();
