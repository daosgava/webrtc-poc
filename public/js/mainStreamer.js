import VideoStreamer from "./VideoStreamer.js";
import Menu from "./Menu.js";
import CameraSelector from "./CameraSelector.js";
import RTCCaller from "./RTCCaller.js";
import Placeholder from "./Placeholder.js";

const videoElement = document.querySelector("video#streamer");
const placeholderElement = document.querySelector("div#placeholder");
const toggleVideoElement = document.querySelector("button#toggle-video");
const toggleAudioElement = document.querySelector("button#toggle-audio");
const selectElement = document.querySelector("select#cameras");

const main = async () => {
	const placeholder = new Placeholder({
		videoElement,
		placeholderElement,
	});
	const videoStreamer = new VideoStreamer({
		videoElement,
		placeholder,
	});
	await videoStreamer.streamToVideo();
	await videoStreamer.getCameras();

	new Menu({
		videoStreamer,
		toggleVideoElement,
		toggleAudioElement,
	});

	new CameraSelector({
		selectElement,
		videoStreamer,
	});

	const signalServer = new WebSocket("ws://localhost:8080/ws");
	signalServer.addEventListener("open", () => {
		console.log("Signal server connected");
		new RTCCaller({
			stream: videoStreamer.stream,
			signalServer,
			room: "poc-room",
			videoElement,
		});
	});
};

main();
