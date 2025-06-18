# examples-crolang-p2p-broker-extensions
Repository containing examples on how to use advanced functionalities of the [CrolangP2P Broker](https://github.com/crolang-p2p/crolang-p2p-broker) for the [CrolangP2P project](https://github.com/crolang-p2p).

## Table of contents
- [The CrolangP2P Project](#the-crolangp2p-project)
- [Standalone architecture](#standalone-architecture)
- [Extended architecture](#extended-architecture)
- [Running the extended architecture example](#running-the-extended-architecture-example)

## The CrolangP2P Project
[CrolangP2P](https://github.com/crolang-p2p) is a simple, robust framework for cross-language peer-to-peer (P2P) connections. 
Clients (“Crolang Nodes”) libraries can be easily integrated into your project and connect using only the ID of the target node, 
exchanging messages directly via P2P or via WebSocket using the [Crolang Broker](https://github.com/crolang-p2p/crolang-p2p-broker) as relay. 
The framework manages the connection and you can focus on what matters most: your project's logic.

- **Simplicity:** Minimal setup—just import the Node library, specify the peer ID, and connect.
- **Cross-language:** [Multiple Node implementations](#available-crolangp2p-node-implementations) allow seamless P2P between different languages.
- **No packet size limits:** Large data exchange is supported.
- **Extensible:** The Broker supports modular extensions for authentication, authorization, message handling, and more.

Nodes connect through the [Crolang Broker](https://github.com/crolang-p2p/crolang-p2p-broker), which acts as a rendezvous point: 
it helps nodes discover each other and establish direct WebRTC connections.

## Standalone architecture
Running a single broker instance is the simplest way to use the Crolang Broker.

This is achieved by simply [running a Docker container using the Broker image](https://github.com/crolang-p2p/crolang-p2p-broker?tab=readme-ov-file#run-the-broker), 
without any additional setup, resulting in a single running instance of the Broker and the STUN server (always on remotely hosted free STUN servers).

![Standalone architecture](./doc/broker_standalone_example.png)
 
Depending on your use case, you may be ok with just using STUN servers, but if you need a more reliable setup, you should 
[consider using a TURN server](https://medium.com/@nerdchacha/what-are-stun-and-turn-servers-and-why-do-we-need-them-in-webrtc-9d5b8f96b338).

## Extended architecture
This repository provides an example of a more complex setup using the [docker-compose.yml](./docker-compose.yml) file.  

As you can see, the docker compose file specifies the following services:
- A proxy service (to allow the use of multiple Broker replicas)
- Two Broker instances
- A Redis service (required to allow multiple Broker instances to work properly while not being executed standalone)
- An example webhook extensions server (to show how to extend the Broker service capabilities)
- A STUN/TURN server (coturn) to allow the Crolang Nodes to connect to each other

![Complete architecture](./doc/broker_complete_example.png)

The detailed usage of variables to extend the Broker service capabilities by using the modules is explained 
in the [Broker's README file](https://github.com/crolang-p2p/crolang-p2p-broker?tab=readme-ov-file#customizing-broker-behaviours-modules).

This repository provides a really simple example of a webhook server; it's implementation can be found in [index.js](./index.js) file.

The example webhook server, other than trivial authentication logic, provides a simple RTC configuration resolver that returns 
credentials for Coturn; said credentials also include a time limitation, ensuring that, even if leaked, said credentials 
will not be used to connect to the TURN server indefinitely, thus increasing the security of the TURN server and preventing 
abuses of your TURN server resources.

Keep in mind that none of these variables are nor required nor related to one another; you can use them independently of
each other and even provide a partial configuration, depending on of what you're trying to achieve.

## Running the extended architecture example

### Generating coturn certificates
In order to run the coturn service, you need to generate some certificates for the coturn service.  

To generate said certificates, run the following command:

```bash
openssl req -x509 -newkey rsa:4096 -keyout coturn-config/turn_server_key.pem -out coturn-config/turn_server_cert.pem -days 365 -nodes
```

This will generate the following files:
- `coturn-config/turn_server_key.pem`
- `coturn-config/turn_server_cert.pem`

The coturn service will use these files to establish a secure connection; the certificates will last for 365 days.

### Executing the docker-compose

After generating the certificates, you can run the complete example.

On a terminal, run the following command:

```bash
docker-compose up --build
```

This will start all the services specified in the [docker-compose.yml](./docker-compose.yml) file.

When connecting from any Crolang Node client implementation, simply use __http://localhost:8080__ as the broker address.
