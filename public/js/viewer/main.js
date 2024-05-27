import Viewer from "./Viewer.js";

const signalServer = new WebSocket("ws://localhost:3000/ws");
const videoElement = document.querySelector("video#streamer");
const messageBox = document.querySelector("div#message-box");
const messageInput = document.querySelector("input#message");
const sendMessageButton = document.querySelector("button#send-message");

const main = async () => {
	signalServer.addEventListener("open", async () => {
		const viewer = new Viewer({
			videoElement,
			signalServer,
			room: "poc-room",
			messageBox,
			messageInput,
			sendMessageButton,
		});
	});
	window.onload = () => {
		if (sessionStorage.getItem("shouldRedirect")) {
			window.location.href = "index.html";
			sessionStorage.removeItem("shouldRedirect");
		}
	};

	window.onbeforeunload = () => {
		sessionStorage.setItem("shouldRedirect", "true");
	};
};

main();
