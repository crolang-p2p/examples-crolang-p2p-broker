# Crolang Broker Complete Example
TODO

## Table of contents
- [Generating the certificates](#generating-the-certificates)
- [Running the complete example](#running-the-complete-example)
- [License](#license)

## Generating the certificates
In order to run the coturn service, you need to generate some certificates.  

To generate said certificates, run the following command:

```bash
openssl req -x509 -newkey rsa:4096 -keyout coturn-config/turn_server_key.pem -out coturn-config/turn_server_cert.pem -days 365 -nodes
```

This will generate the following files:
- `coturn-config/turn_server_key.pem`
- `coturn-config/turn_server_cert.pem`

The coturn service will use these files to establish a secure connection; the certificates will last for 365 days.

## Running the complete example

After generating the certificates, you can run the complete example.

On a terminal, run the following commands:

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