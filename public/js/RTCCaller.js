import { SIGNAL_TYPE } from "./constants.js";

const configuration = {
	iceServers: [
		{
			// TODO: Add TURN server
			urls: "stun:stun.l.google.com:19302",
		},
	],
};

class RTCCaller {
	constructor({ stream, signalServer, room, videoElement }) {
		this.stream = stream;
		this.signalServer = signalServer;
		this.room = room;
		this.video = videoElement;
		this.peerConnection = undefined;
		this.createCallerConnection();
	}

	createCallerConnection() {
		this.peerConnection = new RTCPeerConnection(configuration);
		this.addTracksToPeerConnection();
		this.joinRoom();
		this.sendICECandidates();
		this.createOffer();
		this.listenToAnswers();
		this.listenToConnectionState();
	}

	async createOffer() {
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

	listenToAnswers() {
		this.signalServer.addEventListener("message", async (event) => {
			const message = JSON.parse(event.data);
			console.log("Message received", message);
			if (message.type === SIGNAL_TYPE.ANSWER) {
				const remoteDesc = new RTCSessionDescription(message.payload.answer);
				await this.peerConnection.setRemoteDescription(remoteDesc);
			}
		});
	}

	addTracksToPeerConnection() {
		console.log("Adding tracks to peer connection", this.stream);
		this.stream.getTracks().forEach((track) => {
			this.peerConnection.addTrack(track, this.stream);
		});
	}

	sendICECandidates() {
		this.peerConnection.onicecandidate = event => {
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
		};
	}

	listenToCandidates() {
		this.signalServer.addEventListener("message", async (event) => {
			const { message } = JSON.parse(event.data);

			if (message.type === SIGNAL_TYPE.CANDIDATE) {
				try {
					await this.peerConnection.addIceCandidate(message.iceCandidate);
				} catch (e) {
					console.error("Error adding received ice candidate", e);
				}
			}
		});
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

	listenToConnectionState() {
		this.peerConnection.addEventListener("connectionstatechange", () => {
			if (this.peerConnection.connectionState === "connected") {
				console.log("Connected!");
				this.addTracksToPeerConnection();
			}
		});
	}
}

export default RTCCaller;
