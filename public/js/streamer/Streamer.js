import { SIGNAL_TYPE } from "../constants.js";
import createPeerConnection from "../createPeerConnection.js";

class Streamer {
	constructor({
		stream,
		signalServer,
		room,
		messageBox,
		messageInput,
		sendMessageButton,
	}) {
		this.stream = stream;
		this.signalServer = signalServer;
		this.room = room;
		this.offer = undefined;
		this.peerConnection = undefined;
		this.isBroadcasting = false;
		this.messageBox = messageBox;
		this.messageInput = messageInput;
		this.sendMessageButton = sendMessageButton;
		this.joinRoom();
		this.handleMessage();
		this.handleClickSendMessage();
	}

	async changeStreamerState(isActive) {
		this.peerConnection?.close();
		this.peerConnection = undefined;
		if (isActive) {
			this.isBroadcasting = true;
			await this.sendOffer();
		}
	}

	async createConnection() {
		this.peerConnection = await createPeerConnection();
		this.watchConnectionState();
		this.addStreamToPeerConnection();
		this.handleICECandidate();
		this.createDataChannel();
	}

	async sendOffer() {
		await this.createConnection();
		const offer = await this.peerConnection.createOffer();
		await this.peerConnection.setLocalDescription(offer);
		this.signalServer.send(
			JSON.stringify({
				type: SIGNAL_TYPE.OFFER,
				room: this.room,
				payload: {
					offer,
				},
			}),
		);
	}

	async sendAnswer(offer) {
		await this.createConnection();
		await this.peerConnection.setRemoteDescription(offer);
		const answer = await this.peerConnection.createAnswer();
		await this.peerConnection.setLocalDescription(answer);
		this.createDataChannel()
		this.signalServer.send(
			JSON.stringify({
				type: SIGNAL_TYPE.ANSWER,
				room: this.room,
				payload: {
					answer,
				},
			}),
		);
	}

	handleMessage() {
		this.signalServer.addEventListener("message", (event) => {
			const message = JSON.parse(event.data);
			if (message.type === SIGNAL_TYPE.JOIN && this.isBroadcasting) {
				this.sendOffer();
			}
			if (message.type === SIGNAL_TYPE.OFFER) {
				this.sendAnswer(message.payload.offer);
			}
			if (message.type === SIGNAL_TYPE.ANSWER) {
				this.addAnswer(message.payload.answer);
			}
			if (message.type === SIGNAL_TYPE.CANDIDATE) {
				this.addCandidate(message.payload.candidate);
			}
		});
	}

	async addAnswer(answer) {
		if (!this.peerConnection.currentRemoteDescription) {
			await this.peerConnection.setRemoteDescription(answer);
		}
	}

	joinRoom() {
		this.signalServer.send(
			JSON.stringify({
				type: SIGNAL_TYPE.JOIN,
				room: this.room,
				payload: {},
			}),
		);
	}

	async addCandidate(candidate) {
		try {
			await this.peerConnection?.addIceCandidate(candidate);
		} catch (e) {
			console.error("Error adding received ice candidate", e);
		}
	}

	watchConnectionState() {
		this.peerConnection.onconnectionstatechange = () => {
			console.log(
				"Connection state changed: ",
				this.peerConnection.connectionState,
			);
			if (this.peerConnection.connectionState === "connected") {
				console.log("🐲: Connection established");
			}
		};
	}

	addStreamToPeerConnection() {
		this.stream.getTracks().forEach((track) => {
			this.peerConnection.addTrack(track, this.stream);
		});
	}

	handleICECandidate() {
		this.peerConnection.onicecandidate = async (event) => {
			if (event.candidate) {
				this.signalServer.send(
					JSON.stringify({
						type: SIGNAL_TYPE.CANDIDATE,
						room: this.room,
						payload: {
							candidate: event.candidate.toJSON(),
						},
					}),
				);
			}
		};
	}

	createMessageBubble( message, isLocal ) {
		const messageContainer = document.createElement("div");
		messageContainer.classList.add("flex", `${isLocal ? "justify-end" : "justify-start"}`, "w-full", "mb-2");
		const newMessage = document.createElement("p");
		newMessage.classList.add(`${isLocal ? "text-end" : "text-start"}`, `bg-${isLocal ? "blue" : "slate"}-400`, "text-white", "rounded-xl",  "p-1", "max-w-[60%]", "w-auto");
		newMessage.textContent = message;
		messageContainer.append(newMessage);

		return messageContainer;
	}

	createDataChannel() {
		this.dataChannel = this.peerConnection.createDataChannel("chat");
		this.dataChannel.onmessage = (event) => {
			const newMessage = this.createMessageBubble(event.data, false);
			this.messageBox.append(newMessage);
		};
		this.dataChannel.onopen = () => {
			this.messageBox.innerHTML = "";
			this.messageInput.disabled = false;
			this.messageInput.focus();
			this.sendMessageButton.disabled = false;
		};
		this.dataChannel.onclose = () => {
			this.messageInput.disabled = true;
			this.sendMessageButton.disabled = true;
		};
	}

	handleClickSendMessage() {
		this.sendMessageButton.addEventListener("click", () => {
			if (!this.dataChannel) {
				console.error("Data channel not established.");
				return;
			}
			this.dataChannel.send(this.messageInput.value);

			const newMessage = this.createMessageBubble(this.messageInput.value, true);
			this.messageBox.append(newMessage);
			this.messageInput.value = "";
		});
	}
}

export default Streamer;
