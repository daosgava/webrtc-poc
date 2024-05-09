import MediaStreamer from "./MediaStreamer.js";
import Menu from "./Menu.js";
import CameraSelector from "./CameraSelector.js";
import Streamer from "./Streamer.js";
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
	const mediaStreamer = new MediaStreamer({
		videoElement,
		placeholder,
	});
	await mediaStreamer.streamToVideo();
	await mediaStreamer.getCameras();

	const streamer = new Streamer({
		stream: mediaStreamer.stream,
		signalServer,
		room: "poc-room",
		videoElement,
	});

	new Menu({
		mediaStreamer,
		streamer,
		toggleVideoElement,
		toggleAudioElement,
		toggleStreamElement,
	});

	new CameraSelector({
		selectElement,
		mediaStreamer,
	});
};

main();
