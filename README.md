# Crolang Broker Complete Example
TODO

## Table of contents
- [Broker Architecture examples](#broker-architecture-examples)
  - [Standalone architecture](#standalone-architecture)
  - [Extended architecture](#extended-architecture)
  - [Architectures comparison](#architectures-comparison)
- [Running the extended example](#running-the-extended-example)
  - [Generating coturn certificates](#generating-coturn-certificates)
  - [Executing the docker-compose](#executing-the-docker-compose)
- [Modules](#modules)
- [License](#license)

## Broker Architecture examples
The Broker service uses a modular approach to allow different architectures to be implemented, from the simplest standalone 
Broker to a more complex setup.  

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

### Extended architecture
This repository provides an example of a more complex setup in the [docker-compose.yml](./docker-compose.yml) file.  

As you can see, the docker compose file specifies the following services:
- A proxy service (to allow the use of multiple Broker replicas)
- Two Broker instances
- A Redis service (required to allow the Broker instances to work properly while not being executed standalone)
- An example webhook extensions server (to show how to extend the Broker service capabilities)
- A STUN/TURN server (coturn) to allow the Crolang Nodes to connect to each other

![Complete architecture](./doc/broker_complete_example.png)

The two Broker instances are executed passing the following additional environment variables:
- __REDIS_URL__
- __RTC_CONFIGURATION_RESOLVER_WEBHOOK_URL__
- __NODES_AUTHENTICATION_WEBHOOK_URL__
- __AUTHORIZE_NODES_COMMUNICATION_WEBHOOK_URL__
- __NODES_VALIDITY_CHECK_WEBHOOK_URL__

The detailed usage of said variables is explained in the [Modules](#modules) section but, as a general guideline:  
- the Redis URL allows the execution of multiple Broker instances, enabling horizontal scaling
- the webhook URLs allow to specify custom endpoints to customize the Broker behavior is key aspects of a Crolang Node's 
lifecycle; in particular, the RTC webhook defines the logic for retrieving valid RTC configurations that will be used by a 
Crolang Node in order to connect to your STUN/TURN server (coturn in this example).

This repository provides a really simple example of a webhook server; it's implementation can be found in [index.js](./index.js) file.  

Through the use of the webhook services, you can customize the Broker behavior transparently by providing your custom business logic 
using your REST server(s) without the need to modify the Broker service itself.

Keep in mind that none of these variables are nor required nor related to one another; you can use them independently of
each other and even provide a partial configuration, depending on of what you're trying to achieve.

If you need to customize the behaviour of the Broker service without using the webhooks,
feel free to fork the [Broker's repository](https://github.com/crolang/broker) and modify the code as you see fit.

### Architectures comparison
This table summarizes the differences between the standalone and extended architectures:

|                                    | Standalone                                                                                                                          | Extended                                                                                                                                                                                           |
|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Simplicity                         | As simple as it can get. Just by running the Broker service you're ready to go                                                      | Requires additional setup to customize logic and enhance nodes connectivity                                                                                                                        |
| Horizontal scalability             | No horizontal scalability                                                                                                           | Allows to add multiple Broker  instances without an impact on the Nodes that will always see the  Broker as just one entity                                                                        |
| Nodes connectivity capabilities    | Nodes will connect among each other  as long as their networks allow them to resolve the connection by just  using the STUN servers | Nodes will always connect among each  other bypassing networks limitations by using a combination of STUN and  TURN servers; credentials fo said servers will be provided by the provided endpoint |
| Nodes authentication to the Broker | As long as no other Node with the same ID is connected, the connecting Node will always be authenticated successfully               | The limit on ID duplicates will be maintained but the custom  authentication logic provided by the endpoint will be enforced                                                                       |
| Nodes communication authorization  | Two connected Nodes will always be able to exchange messages through the Broker in order to establish their connection              | Two connected Nodes will be able to exchange messages through the Broker in order to establish their connection only if the custom logic provided by the endpoint will allow them to               |
| Nodes validity through lifecycle   | Nodes connected to the Broker will always be considered valid                                                                       | The Broker will periodically check for its connected nodes validity by using the custom logic provided by the endpoint (e.g. a Node gets banned and needs to be disconnected)                      |

## Running the extended example
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

## Modules
TODO

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

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE.md) file for details.