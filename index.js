const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/resolve-rtc-configuration', (req, res) => {
    const { nodeId } = req.body;
    console.log("Received RTC configuration request from node with id: ", nodeId);
    const rtcConfiguration = {
        iceServers: [
            {
                urls: ["stun:openrelay.metered.ca:80"]
            },
            {
                urls: ["turn:openrelay.metered.ca:80"],
                username: "openrelayproject",
                password: "openrelayproject"
            },
            {
                urls: ["turn:openrelay.metered.ca:443"],
                username: "openrelayproject",
                password: "openrelayproject"
            },
            {
                urls: ["turn:openrelay.metered.ca:443?transport=tcp"],
                username: "openrelayproject",
                password: "openrelayproject"
            }
        ],
        iceTransportPolicy: "all",
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
        iceCandidatePoolSize: 10,
        expiresTimestampUTC: Date.now() + 60000 // 1 minute
    };
    console.log("Sending RTC configuration to node with id ", nodeId, ", the configuration will expire in 1 minute");
    res.json({ rtcConfiguration: rtcConfiguration });
});

app.post('/authenticate-node', (req, res) => {
    const { id, data } = req.body;
    console.log("Received authentication request from node with id ", id, ": ", data);
    res.json({ authenticated: true });
});

app.post('/authorize-nodes-communication', (req, res) => {
    const { from, to } = req.body;
    console.log("Received authorization request from node with id ", from, " to communicate with node with id ", to);
    res.json({ authorized: true });
});

app.post('/validity-check', (req, res) => {
    const { connectedNodesIds } = req.body;
    console.log("Received from broker these connected nodes ids: ", connectedNodesIds);
    const invalidNodesIds = connectedNodesIds.filter(nodeId => nodeId === "to-be-disconnected");
    console.log("Sending to broker these invalid nodes ids: ", invalidNodesIds);
    res.json({ invalidNodesIds: invalidNodesIds });
});

app.listen(PORT, () => {
    console.log(`Broker Webhooks Extensions server running on http://localhost:${PORT}`);
});
