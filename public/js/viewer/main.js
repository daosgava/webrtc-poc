import Viewer from "./Viewer.js";
import RtcApi from "../RtcApi.js";

const signalServer = new WebSocket("ws://localhost:8080/ws");
const videoElement = document.querySelector("video#streamer");
const callButtonElement = document.querySelector("button#call");
const dropButtonElement = document.querySelector("button#drop");

const main = () => {
	const rtcApi = new RtcApi();
	signalServer.addEventListener("open", () => {
		const viewer = new Viewer({
			videoElement,
			signalServer,
			room: "poc-room",
			rtcApi,
		});

		callButtonElement.addEventListener("click", () => {
			viewer.changeViewerState(true);
		});

		dropButtonElement.addEventListener("click", () => {
			viewer.changeViewerState(false);
		});
	});
};

main();
