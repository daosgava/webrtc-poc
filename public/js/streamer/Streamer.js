import { SIGNAL_TYPE } from "../constants.js";

class Streamer {
	constructor({ stream, signalServer, room, rtcApi }) {
		this.stream = stream;
		this.signalServer = signalServer;
		this.room = room;
		this.rtcApi = rtcApi;
	}

	async MakeACall() {
		this.joinRoom();
		await this.rtcApi.createPeerConnection();
		this.rtcApi.addTracksToPeerConnection(this.stream);
		this.rtcApi.watchConnectionState();
		this.sendOffer();
		this.sendLocalCandidate();
		this.getRemoteCandidate();
		this.processAnswer();
	}

	changeStreamerState(isActive) {
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

	joinRoom() {
		this.signalServer.send(
			JSON.stringify({
				type: SIGNAL_TYPE.JOIN,
				room: this.room,
				payload: {},
			}),
		);
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
