import VideoStreamer from "./VideoStreamer.js";
import Menu from "./Menu.js";
import CameraSelector from "./CameraSelector.js";
import WebRTC from "./WebRTC.js";
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
	const webRTC = new WebRTC({
		signalServer,
		room: "poc-room",
		connectionType: "caller",
	});

	await webRTC.createOffer();
	addTracksToPeerConnection(videoStreamer.stream)
};

main();
