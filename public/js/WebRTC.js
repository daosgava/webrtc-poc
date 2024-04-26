/* 
	Check the webrtc documentation for more information
	Google - https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
	Mozilla - https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
*/

const SIGNAL_TYPE = {
	OFFER: "offer",
	ANSWER: "answer",
	CANDIDATE: "candidate",
};
const configuration = {
	iceServers: [{
		// TODO: Add TURN server
		urls: "stun:stun.l.google.com:19302"
	}],
};

class WebRTC {
	constructor({ signalServer, room, connectionType }) {
		this.signalServer = signalServer;
		this.room = room;
		this.peerConnection = undefined;
		this.connectionType = connectionType;
		this.createConnection();
	}

	createConnection() {
		if (this.connectionType === "caller") {
			this.createCallerConnection();
		} else {
			this.createReceiverConnection();
		}
		this.sendICECandidates();
		this.listenToCandidates();
		this.listenToConnectionState();
	}

	createCallerConnection() {
		this.peerConnection = new RTCPeerConnection(configuration);
		this.listenToAnswers();
	}

	createReceiverConnection() {
		this.peerConnection = new RTCPeerConnection(configuration);
		this.listenToOffer();
	}

	async createOffer() {
		if (this.connectionType === "receiver") {
			console.error("Only caller can create offer.");
			return;
		}
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

	async createAnswer() {
		if (this.connectionType === "caller") {
			console.error("Only receiver can create answer.");
			return;
		}
		const answer = await this.peerConnection.createAnswer();
		await this.peerConnection.setLocalDescription(answer);
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

	listenToAnswers() {
		this.signalServer.addEventListener("message", (event) => {
			const { message } = JSON.parse(event.data);

			if (message.type === "answer") {
				this.peerConnection.setRemoteDescription(
					new RTCSessionDescription(message.answer),
				);
			}
		});
	}

	listenToOffer() {
		this.signalServer.addEventListener("message", (event) => {
			const { message } = JSON.parse(event.data);

			if (message.type === "offer") {
				this.peerConnection.setRemoteDescription(
					new RTCSessionDescription(message.offer),
				);
				this.addTracksToPeerConnection();
				this.sendICECandidates();
			}
		});
	}

	addTracksToPeerConnection(stream) {
		stream.getTracks().forEach((track) => {
			this.peerConnection.addTrack(track, stream);
		});
	}

	sendICECandidates() {
		this.peerConnection.addEventListener("icecandidate", (event) => {
			if (event.candidate) {
				this.signalServer.send(
					JSON.stringify({
						type: SIGNAL_TYPE.CANDIDATE,
						room: this.room,
						payload: {
							candidate: event.candidate,
						},
					}),
				);
			}
		});
	}

	listenToCandidates() {
		this.signalServer.addEventListener("message", async (event) => {
			const { message } = JSON.parse(event.data);

			if (message.type === "candidate") {
				try {
					await this.peerConnection.addIceCandidate(
						new RTCIceCandidate(message.iceCandidate),
					);
				} catch (e) {
					console.error("Error adding received ice candidate", e);
				}
			}
		});
	}

	listenToConnectionState() {
		this.peerConnection.addEventListener("connectionstatechange", () => {
			if (this.peerConnection.connectionState === "connected") {
				console.log("Connected!");
			}
		});
	}
}

export default WebRTC;
