const SIGNAL_TYPE = {
	OFFER: "offer",
	ANSWER: "answer",
	CANDIDATE: "candidate",
};
const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}

class WebRTC {
	constructor({ stream, signalServer, room }) {
		this.peerConnection = new RTCPeerConnection(configuration);
		this.stream = stream;
		this.signalServer = signalServer;
		this.room = room;
		this.addTracksToPeerConnection();
		this.sendICECandidates();
		this.createOffer();
		this.listenToIncomingMessages();
	}

	addTracksToPeerConnection() {
		this.stream.getTracks().forEach((track) => {
			this.peerConnection.addTrack(track, this.stream);
		});
	}

	sendICECandidates() {
		this.peerConnection.onicecandidate = (event) => {
			if (event.candidate) {
				this.signalServer.send(JSON.stringify({
					type: SIGNAL_TYPE.CANDIDATE,
					room: this.room,
					payload: {
						candidate: event.candidate,
					},
				}));
			}
		};
	}

	async createOffer() {
		const offer = await this.peerConnection.createOffer();
		await this.peerConnection.setLocalDescription(offer);
		this.signalServer.send(JSON.stringify({
			type: SIGNAL_TYPE.OFFER,
			room: this.room,
			payload: {
				offer: this.peerConnection.localDescription,
			},
		}));
	}

	listenToIncomingMessages() {
		this.signalServer.addEventListener("message", (event) => {
			const { message } = JSON.parse(event.data);

			if (message.type === "answer") {
				this.peerConnection.setRemoteDescription(
					new RTCSessionDescription(message.answer),
				);
			} else if (message.type === "candidate") {
				this.peerConnection.addIceCandidate(
					new RTCIceCandidate(message.candidate),
				);
			}
		});
	}
}

export default WebRTC;
