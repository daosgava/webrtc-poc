import RTCReceiver from "./RTCReceiver.js";

const videoElement = document.querySelector("video#streamer");

const main = async () => {
	const signalServer = new WebSocket("ws://localhost:8080/ws");
	signalServer.addEventListener("open", () => {
		new RTCReceiver({
			videoElement,
			signalServer,
			room: "poc-room",
		});
	});
};

main();
