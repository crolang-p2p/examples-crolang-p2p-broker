const express = require('express');
const crypto = require('crypto');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

const TURN_SECRET = "the-secret";
const TTL = 300;  // 5 minutes

app.post('/resolve-rtc-configuration', (req, res) => {
    const { nodeId } = req.body;

    const timestamp = Math.floor(Date.now() / 1000) + TTL;
    const username = `${timestamp}:${nodeId || 'guest'}`;

    const password = crypto.createHmac('sha1', TURN_SECRET)
        .update(username)
        .digest('hex');

    console.log("Received RTC configuration request from node with id: ", nodeId);
    const rtcConfiguration = {
        iceServers: [
            {
                urls: ["stun:localhost:3478"]
            },
            {
                urls: ["turn:localhost:3478"],
                username: username,
                password: password
            },
            {
                urls: ["turn:openrelay.metered.ca:443"],
                username: username,
                password: password
            },
            {
                urls: ["turn:localhost:5349?transport=tcp"],
                username: username,
                password: password
            }
        ],
        iceTransportPolicy: "all",
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
        iceCandidatePoolSize: 10
    };
    console.log("Sending RTC configuration to node with id", nodeId);
    res.json({ rtcConfiguration: rtcConfiguration });
});

app.post('/authenticate-node', (req, res) => {
    const { id, data } = req.body;
    console.log("Received authentication request from node with id", id, ":", data);
    res.json({ authenticated: true });
});

app.post('/authorize-nodes-communication', (req, res) => {
    const { from, to } = req.body;
    console.log("Received authorization request from node with id", from, "to communicate with node with id", to);
    res.json({ authorized: true });
});

app.post('/validity-check', (req, res) => {
    const { connectedNodesIds } = req.body;
    console.log("Received from broker these connected nodes ids:", connectedNodesIds);
    const invalidNodesIds = connectedNodesIds.filter(nodeId => nodeId === "to-be-disconnected");
    console.log("Sending to broker these invalid nodes ids:", invalidNodesIds);
    res.json({ invalidNodesIds: invalidNodesIds });
});

app.post('/authenticated-socket-msg', (req, res) => {
    const { senderId, receiverId, isReceiverConnected } = req.body;
    console.log(senderId, "sent a websocket message to", receiverId, "(is", receiverId, "connected to Broker:", isReceiverConnected, ")");
});

app.listen(PORT, () => {
    console.log(`Broker Webhooks Extensions server running on http://localhost:${PORT}`);
});
