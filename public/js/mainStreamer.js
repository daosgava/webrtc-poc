import VideoStreamer from "./VideoStreamer.js";
import Menu from "./Menu.js";
import CameraSelector from "./CameraSelector.js";
import RTCCaller from "./RTCCaller.js";
import Placeholder from "./Placeholder.js";

const signalServer = new WebSocket("ws://localhost:8080/ws");
const videoElement = document.querySelector("video#streamer");
const placeholderElement = document.querySelector("div#placeholder");
const toggleVideoElement = document.querySelector("button#toggle-video");
const toggleAudioElement = document.querySelector("button#toggle-audio");
const toggleStreamElement = document.querySelector("button#toggle-stream");
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

	const rtcCaller = new RTCCaller({
		stream: videoStreamer.stream,
		signalServer,
		room: "poc-room",
		videoElement,
	});

	new Menu({
		videoStreamer,
		rtcCaller,
		toggleVideoElement,
		toggleAudioElement,
		toggleStreamElement,
	});

	new CameraSelector({
		selectElement,
		videoStreamer,
	});
};

main();
