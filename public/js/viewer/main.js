import Viewer from "./Viewer.js";

const signalServer = new WebSocket("ws://localhost:8080/ws");
const videoElement = document.querySelector("video#streamer");

const main = async () => {
	signalServer.addEventListener("open", async () => {
		const viewer = new Viewer({
			videoElement,
			signalServer,
			room: "poc-room",
		});
	});
};

main();
