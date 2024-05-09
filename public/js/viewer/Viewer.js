import { SIGNAL_TYPE } from "../constants.js";

class Viewer {
	constructor({ signalServer, room, videoElement }) {
		this.signalServer = signalServer;
		this.room = room;
		this.video = videoElement;
		this.room = room;
		this.peerConnection = undefined;
		this.joinRoom();
		this.handleMessage();
	}

	async createConnection() {
		this.peerConnection = await createPeerConnection();
		this.peerConnection.onconnectionstatechange = () => {
			console.log(
				"Connection state changed: ",
				this.peerConnection.connectionState,
			);
			if (this.peerConnection.connectionState === "connected") {
				console.log("🐲: Connection established");
			}
		};

		const stream = new MediaStream();
		this.video.srcObject = stream;

		stream.getTracks().forEach((track) => {
			this.peerConnection.addTrack(track, stream);
		});

		this.peerConnection.ontrack = (event) => {
			const [streams] = event.streams;
			streams.getTracks().forEach((track) => {
				stream.addTrack(track);
			});
		};
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

	async sendOffer() {
		await this.createConnection();
		const offer = await this.peerConnection.createOffer();
		await this.peerConnection.setLocalDescription(offer);;
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
}

export default Viewer;
