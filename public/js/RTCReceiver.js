import { SIGNAL_TYPE } from "./constants.js";

const configuration = {
	iceServers: [
		{
			// TODO: Add TURN server
			urls: "stun:stun.l.google.com:19302",
		},
	],
};	

class RTCReceiver {
	constructor({ signalServer, room, videoElement }) {
		this.signalServer = signalServer;
		this.video = videoElement;
		this.room = room;
		this.peerConnection = undefined;
		this.createReceiverConnection();
	}

	createReceiverConnection() {
		this.peerConnection = new RTCPeerConnection(configuration);
		this.joinRoom();
		this.listenToCandidates();
		this.listenToConnectionState();
		this.listenToOffer();
		this.listenToTracks();
	}

	listenToOffer() {
		this.signalServer.addEventListener("message", async (event) => {
			const message = JSON.parse(event.data);
			if (message.type === SIGNAL_TYPE.OFFER) {
				this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.payload.offer));
        		const answer = await this.peerConnection.createAnswer();
        		await this.peerConnection.setLocalDescription(answer);
				this.signalServer.send(
					JSON.stringify({
						type: SIGNAL_TYPE.ANSWER,
						room: this.room,
						payload: {
							answer,
						},
					})
				);
			}
		});
	}

	listenToCandidates() {
		this.signalServer.addEventListener("message", async (event) => {
			const message = JSON.parse(event.data);
			if (message.type === SIGNAL_TYPE.CANDIDATE) {
				try {
					await this.peerConnection.addIceCandidate(message.payload.candidate)
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

	listenToConnectionState() {
		this.peerConnection.addEventListener("connectionstatechange", () => {
			console.log("Connection state changed", this.peerConnection.connectionState);
			if (this.peerConnection.connectionState === "connected") {
				console.log("🐲: Connection established");
			}
		});
	}

	listenToTracks() {	
		this.peerConnection.addEventListener('track', async (event) => {
			const [remoteStream] = event.streams;
			this.video.srcObject = remoteStream;
		});
	}
}

export default RTCReceiver;
