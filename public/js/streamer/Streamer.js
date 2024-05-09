import { SIGNAL_TYPE } from "../constants.js";
import createPeerConnection from "../createPeerConnection.js";

class Streamer {
	constructor({ stream, signalServer, room }) {
		this.stream = stream;
		this.signalServer = signalServer;
		this.room = room;
		this.offer = undefined;
		this.peerConnection = undefined;
		this.isBroadcasting = false;
		this.joinRoom();
		this.handleMessage();
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
		this.peerConnection.onconnectionstatechange = () => {
			console.log(
				"Connection state changed: ",
				this.peerConnection.connectionState,
			);
			if (this.peerConnection.connectionState === "connected") {
				console.log("🐲: Connection established");
			}
		};
		this.stream.getTracks().forEach((track) => {
			this.peerConnection.addTrack(track, this.stream);
		});
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
			const message = JSON.parse(event.data);;
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
}

export default Streamer;
