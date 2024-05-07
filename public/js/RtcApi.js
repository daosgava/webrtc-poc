class RtcApi {
	constructor() {
		this.peerConnection = undefined;
	}

	async getTURNcredentials() {
		const response = await fetch("/turn-credentials", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		});
		return response.json();
	}

	async createPeerConnection() {
		const iceTURNServer = await this.getTURNcredentials();
		const iceServers = [
			{
				urls: "stun:stun.l.google.com:19302",
			},
		];
		iceServers.push(iceTURNServer);
		this.peerConnection = new RTCPeerConnection({ iceServers });
	}

	async createOffer() {
		const offer = await this.peerConnection.createOffer();
		await this.peerConnection.setLocalDescription(offer);
		return offer;
	}

	async setRemoteDescription(answer) {
		const remoteDesc = new RTCSessionDescription(answer);
		await this.peerConnection.setRemoteDescription(remoteDesc);
	}

	async createAnswer(offer) {
		this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
		const answer = await this.peerConnection.createAnswer();
		await this.peerConnection.setLocalDescription(answer);

		return answer;
	}

	async addCandidate(candidate) {
		await this.peerConnection.addIceCandidate(candidate);
	}

	addTracksToPeerConnection(stream) {
		stream.getTracks().forEach((track) => {
			this.peerConnection.addTrack(track, stream);
		});
	}

	setOnTrack(callback) {
		this.peerConnection.addEventListener('track', callback);
	}

	closePeerConnection() {
		if (this.peerConnection) {
			this.peerConnection.close();
			this.peerConnection = undefined;
		}
	}

	onICECandidate(callback) {
		this.peerConnection.onicecandidate = callback;
	}

	watchConnectionState() {
		this.peerConnection.addEventListener("connectionstatechange", () => {
			console.log(
				"Connection state changed",
				this.peerConnection.connectionState,
			);
			if (this.peerConnection.connectionState === "connected") {
				console.log("🐲: Connection established");
			}
		});
	}
}

export default RtcApi;
