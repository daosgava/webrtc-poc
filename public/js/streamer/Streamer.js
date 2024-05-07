import { SIGNAL_TYPE } from "../constants.js";

class Streamer {
	constructor({ stream, signalServer, room, rtcApi }) {
		this.stream = stream;
		this.signalServer = signalServer;
		this.room = room;
		this.rtcApi = rtcApi;
		this.offer = undefined;
	}

	async MakeACall() {
		await this.rtcApi.createPeerConnection();
		this.joinRoom();
		this.rtcApi.addTracksToPeerConnection(this.stream);
		this.sendLocalCandidate();
		this.getRemoteCandidate();
		await this.createOffer();
		this.sendOffer();
		this.sendAnswer();
		this.processAnswer();
		this.sendOfferToNewUser();
		this.rtcApi.watchConnectionState();
	}

	changeStreamerState(isActive) {
		if (!isActive) {
			this.rtcApi.closePeerConnection();
		} else {
			this.MakeACall();
		}
	}

	async createOffer() {
		if (!this.offer) {
			this.offer = await this.rtcApi.createOffer();
		}
	}

	sendOffer() {
		const offer = this.offer;
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

	sendAnswer() {
		this.signalServer.addEventListener("message", async (event) => {
			const message = JSON.parse(event.data);
			if (message.type === SIGNAL_TYPE.OFFER) {
				const answer = await this.rtcApi.createAnswer(message.payload.offer);
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
		});
	}

	processAnswer() {
		this.signalServer.addEventListener("message", async (event) => {
			const message = JSON.parse(event.data);
			if (message.type === SIGNAL_TYPE.ANSWER) {
				try {
					await this.rtcApi.setRemoteDescription(message.payload.answer);
				} catch (e) {
					console.error("Error setting remote description", e);
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

	sendOfferToNewUser() {
		this.signalServer.addEventListener("message", async (event) => {
			const message = JSON.parse(event.data);
			if (message.type === SIGNAL_TYPE.JOIN) {
				this.sendOffer();
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
