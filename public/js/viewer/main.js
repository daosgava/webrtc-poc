import Viewer from "./Viewer.js";
import RtcApi from "../RtcApi.js";

const signalServer = new WebSocket("ws://localhost:8080/ws");
const videoElement = document.querySelector("video#streamer");

const main = () => {
	const rtcApi = new RtcApi();
	signalServer.addEventListener("open", async () => {
		const viewer = new Viewer({
			videoElement,
			signalServer,
			room: "poc-room",
			rtcApi,
		});

		//await viewer.MakeACall();
	});
};

main();
