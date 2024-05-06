import { SIGNAL_TYPE } from "../constants.js";

class Viewer {
	constructor({ signalServer, room, videoElement, rtcApi }) {
		this.signalServer = signalServer;
		this.room = room;
		this.video = videoElement;
		this.room = room;
		this.peerConnection = undefined;
		this.stream = new MediaStream();
		this.video.srcObject = this.stream;
		this.rtcApi = rtcApi;
		this.MakeACall();
	}

	async MakeACall() {
		await this.rtcApi.createPeerConnection();
		this.rtcApi.watchConnectionState();
		this.addTracksToStream();
		this.joinRoom();
		this.getRemoteCandidate();
		this.sendLocalCandidate();
		this.sendAnswer();
	}

	changeViewerState(isActive) {
		if (!isActive) {
			this.rtcApi.closePeerConnection();
		} else {
			this.MakeACall();
		}
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

	joinRoom() {
		this.signalServer.send(
			JSON.stringify({
				type: SIGNAL_TYPE.JOIN,
				room: this.room,
			}),
		);
	}

	addTracksToStream() {
		const callback = (event) => {
			const [streams] = event.streams;
			streams.getTracks().forEach((track) => {
				this.stream.addTrack(track);
			});
		};

		this.rtcApi.setOnTrack(callback);
	}

	sendLocalCandidate() {
		const callback = (event) => {
			if (event.candidate) {
				console.log("Sending local candidate");
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
}

export default Viewer;
