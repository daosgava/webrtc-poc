import { SIGNAL_TYPE } from "../constants.js";

class Streamer {
	constructor({ stream, signalServer, room, rtcApi }) {
		this.stream = stream;
		this.signalServer = signalServer;
		this.room = room;
		this.rtcApi = rtcApi;
	}

	async MakeACall() {
		await this.rtcApi.createPeerConnection();
		this.rtcApi.addTracksToPeerConnection(this.stream);
		this.rtcApi.watchConnectionState();
		this.joinRoom();
		this.sendLocalCandidate();
		this.getRemoteCandidate();
		this.sendOffer();
		this.processAnswer();
	}

	changeStreamerState(isActive) {
		console.log("Streamer state changed", isActive);
		if (!isActive) {
			this.rtcApi.closePeerConnection();
		} else {
			this.MakeACall();
		}
	}

	async sendOffer() {
		const offer = await this.rtcApi.createOffer();

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

	processAnswer() {
		this.signalServer.addEventListener("message", async (event) => {
			const message = JSON.parse(event.data);
			if (message.type === SIGNAL_TYPE.ANSWER) {
				await this.rtcApi.setRemoteDescription(message.payload.answer);
			}
		});
		
	}
	listenToAnswers() {
		this.signalServer.addEventListener("message", async (event) => {
			const message = JSON.parse(event.data);
			if (message.type === SIGNAL_TYPE.ANSWER && !this.peerConnection.remoteDescription) {
				const remoteDesc = new RTCSessionDescription(message.payload.answer);
				await this.peerConnection.setRemoteDescription(remoteDesc);
			}
		});
	}

	sendLocalCandidate() {
		const callback = (event) => {
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
		}

		this.rtcApi.onICECandidate(callback);
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

	getRemoteCandidate() {
		this.signalServer.addEventListener("message", async (event) => {
			const message = JSON.parse(event.data);
			if (message.type === SIGNAL_TYPE.CANDIDATE) {
				try {
					await this.rtcApi.addCandidate(
						message.payload.candidate,
					);
				} catch (e) {
					console.error("Error adding received ice candidate", e);
				}
			}
		});
	}
}

export default Streamer;
