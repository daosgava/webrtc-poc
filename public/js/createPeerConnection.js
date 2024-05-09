
const getTURNcredentials = async() => {
		const response = await fetch("/turn-credentials", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		});
		return response.json();
	}

const createPeerConnection = async () => {
		const iceTURNServer = await getTURNcredentials();
		const iceServers = [
			{
				urls: "stun:stun.l.google.com:19302",
			},
		];
		iceServers.push(iceTURNServer);
		return new RTCPeerConnection({ iceServers });
	}

export default createPeerConnection;
