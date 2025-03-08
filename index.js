const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/validity-check', (req, res) => {
    const { connectedNodesIds } = req.body;

    console.log("Received from broker these connected nodes ids: ", connectedNodesIds);

    const invalidNodesIds = connectedNodesIds.filter(nodeId => nodeId === "to-be-disconnected");

    console.log("Sending to broker these invalid nodes ids: ", invalidNodesIds);

    res.json({ invalidNodesIds });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
