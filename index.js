const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/resolve-rtc-configuration', (req, res) => {
    const { nodeId } = req.body;
    console.log("Received RTC configuration request from node with id: ", nodeId);
    const rtcConfiguration = null;
    console.log("Sending RTC configuration to node with id ", nodeId, ": ", rtcConfiguration);
    res.json({ rtcConfiguration });
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
    res.json({ invalidNodesIds });
});

app.listen(PORT, () => {
    console.log(`Broker Webhooks Extensions server running on http://localhost:${PORT}`);
});
