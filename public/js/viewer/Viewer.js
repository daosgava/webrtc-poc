import { SIGNAL_TYPE } from "../constants.js";
import createPeerConnection from "../createPeerConnection.js";

class Viewer {
	constructor({
		signalServer,
		room,
		videoElement,
		messageBox,
		messageInput,
		sendMessageButton,
	}) {
		this.signalServer = signalServer;
		this.room = room;
		this.video = videoElement;
		this.room = room;
		this.messageBox = messageBox;
		this.messageInput = messageInput;
		this.sendMessageButton = sendMessageButton;
		this.peerConnection = undefined;
		this.dataChannel = undefined;
		this.joinRoom();
		this.handleMessage();
		this.handleClickSendMessage();
		this.handleEnterSendMessage();
	}

	async createConnection() {
		const stream = new MediaStream();
		this.video.srcObject = stream;

		this.peerConnection = await createPeerConnection();
		this.watchConnectionState();
		this.handleOnTrack(stream);
		this.handleICECandidate();
	}

	async sendOffer() {
		await this.createConnection();
		const offer = await this.peerConnection.createOffer();
		await this.peerConnection.setLocalDescription(offer);
		console.log("Sending offer");
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
		this.receiveDataChannel();
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

	addCandidate(candidate) {
		try {
			this.peerConnection?.addIceCandidate(candidate);
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

	handleOnTrack(stream) {
		this.peerConnection.ontrack = (event) => {
			const [streams] = event.streams;
			streams.getTracks().forEach((track) => {
				stream.addTrack(track);
			});
		};
	}

	createMessageBubble(message, isLocal) {
		const messageContainer = document.createElement("div");
		messageContainer.classList.add(
			"flex",
			`${isLocal ? "justify-end" : "justify-start"}`,
			"w-full",
			"mb-2",
		);
		const newMessage = document.createElement("p");
		newMessage.classList.add(
			`${isLocal ? "text-end" : "text-start"}`,
			`bg-${isLocal ? "blue" : "slate"}-400`,
			"text-white",
			"rounded-xl",
			"p-1",
			"max-w-[60%]",
			"w-auto",
		);
		newMessage.textContent = message;
		messageContainer.append(newMessage);

		return messageContainer;
	}

	receiveDataChannel() {
		this.peerConnection.ondatachannel = (event) => {
			this.dataChannel = event.channel;

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
		};
	}

	handleClickSendMessage() {
		this.sendMessageButton.addEventListener("click", () => {
			if (!this.dataChannel) {
				console.error("Data channel not established.");
				return;
			}
			this.dataChannel.send(this.messageInput.value);

			const newMessage = this.createMessageBubble(
				this.messageInput.value,
				true,
			);
			this.messageBox.append(newMessage);
			this.messageInput.value = "";
		});
	}

	handleEnterSendMessage() {
		this.messageInput.addEventListener("keydown", (event) => {
			if (event.key === "Enter") {
				this.sendMessageButton.click();
			}
		});
	}
}

export default Viewer;
