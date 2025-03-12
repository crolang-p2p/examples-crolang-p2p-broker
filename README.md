# Crolang Broker Complete Example
TODO

## Table of contents
- [Broker Architecture examples](#broker-architecture-examples)
  - [Standalone architecture](#standalone-architecture)
  - [Complete architecture](#complete-architecture)
  - [Architectures comparison](#architectures-comparison)
- [Running the complete example](#running-the-complete-example)
  - [Generating the certificates](#generating-the-certificates)
  - [Executing the docker-compose](#executing-the-docker-compose)
- [License](#license)

## Broker Architecture examples
The Broker service uses a modular approach to allow different architectures to be implemented, from the simplest standalone 
broker to a more complex setup and everything in between.  

Adding more capabilities to the Broker service is as simple as adding environment variables for the Broker execution; 
in the following sections we will see how to run the Broker service in different architectures and what that means for 
your project's capabilities.

Although Crolang is designed to simplify as much as possible the exchange of data among peers, keep in mind that said peers
communication is based on [WebRTC](https://webrtc.org/), which is a complex technology.
In order to reliably connect Crolang Nodes among all different network types, additional setup is required as we will see in the next sections.

### Standalone architecture
Running a single broker instance is the simplest way to use the Crolang Broker.

On a terminal, run the following command:

```bash
docker run --rm --name broker-service -p 8080:8080 alessandrotalmi/broker-service
```
This will run a single Broker instance on the default port 8080 and won't require any additional setup.

![Standalone architecture](./doc/broker_standalone_example.png)

Once the service is running, try connecting to it using any Crolang Node client implementation, using __http://localhost:8080__ as the Broker address.  
As long as the clients are on the same network, they will be able to connect to each other without any additional setup.

Running the project this way uses free STUN servers are used for the WebRTC connections among Crolang Nodes;
by default the project uses [Google's free STUN servers](https://dev.to/alakkadshaw/google-stun-server-list-21n4).

Keep in mind that using only STUN servers may not work in all cases, especially when the clients are behind symmetric NATs.  
To solve this issue, you can use a [TURN server](https://webrtc.org/getting-started/turn-server) (hosted by you or provided by external paid services), which is a more complex but reliable setup.

Depending on your use case, you may be ok with just using STUN servers, but if you need a more reliable setup, you should 
[consider using a TURN server](https://medium.com/@nerdchacha/what-are-stun-and-turn-servers-and-why-do-we-need-them-in-webrtc-9d5b8f96b338).

### Complete architecture
This repository provides an example of a more complex setup in the [docker-compose.yml](./docker-compose.yml) file.  

As you can see, the docker compose file runs the following services:
- A proxy service (to allow the use of multiple Broker replicas)
- Two Broker instances
- A Redis service (required to allow the Broker instances to work properly while not being executed standalone)
- An example webhook extensions server (to show how to extend the Broker service capabilities)
- A STUN/TURN server (coturn) to allow the Crolang Nodes to connect to each other

As you can see by the docker compose, the two Broker instances are executed passing the following additional environment variables:
- __REDIS_URL__  
Specifies the Redis service URL. If this variable is not provided, the Broker assumes it is running standalone without any other Broker replicas.
- __RTC_CONFIGURATION_RESOLVER_WEBHOOK_URL__  
Specifies the URL of the webhook service that resolves the RTC configuration for the Broker; this RTC configuration will 
be sent to the connecting Crolang Node and will be used by it when connecting to other Crolang Nodes.
If this variable is not provided, the Broker will use the default RTC configuration resolver which provides a reference to the 
[Google's free STUN servers](https://dev.to/alakkadshaw/google-stun-server-list-21n4)
- __NODES_AUTHENTICATION_WEBHOOK_URL__  
Specifies the URL of the webhook service that authenticates the connecting Crolang Node; this service will be called when a Crolang Node tries to connect to the Broker.
Independently of whether this variable is provided or not, the Brokers will always allow just one connection per unique Node ID.  
If this variable is not provided, the Broker will allow any Node to connect to it.
- __AUTHORIZE_NODES_COMMUNICATION_WEBHOOK_URL__  
Specifies the URL of the webhook service that authorizes the communication between two Crolang Nodes; this service will 
be called whenever two Crolang Nodes need to exchange messages through the Brokers while try to connect to each other.
If this variable is not provided, the Broker will allow any Node to communicate with any other Node.
- __NODES_VALIDITY_CHECK_WEBHOOK_URL__
Specifies the URL of the webhook service that checks if the nodes currently connected to the Broker are still valid; this service will be called periodically by the Broker.
If this variable is not provided, all the nodes connected to the Broker will always be considered valid.

![Complete architecture](./doc/broker_complete_example.png)

### Architectures comparison
TODO

## Running the complete example
### Generating the certificates
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

This will start all the services:
- proxy
- 2 broker instances
- example webhook extensions server
- redis
- coturn

When connecting from any Crolang Node client implementation, simply use __http://localhost:8080__ as the broker address.

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE.md) file for details.