# ethplorer-exporter

A prometheus exporter for <https://api.ethplorer.io>. Provides Prometheus metrics from the API endpoint of Ethplorer, such as account balance, transactions, tokens etc.

# Developing

- Set the address of the ethereum account in `.env`:

```
ETHPLORER_EXPORTER_ADDRESS=your-address-here
```

- Build the image:

```
docker build -t ethplorer-exporter:latest .
```

- Run it while listening on localhost:9100:

```
docker run --rm -p 127.0.0.1:9101:9101 ethplorer-exporter:latest
```

- Run it interactively:

```
docker run --rm -it --entrypoint=/bin/bash -p 127.0.0.1:9101:9101 -v ${PWD}:/usr/src/app ethplorer-exporter:latest
```

- Then to launch:

```
npm start
```

# Prometheus Compose

- Set the address of the ethereum account in `.env`:

```
ETHPLORER_EXPORTER_ADDRESS=your-address-here
```

- In the `prometheus-compose` directory, run:

```
docker-compose up
```

- Go to <http://localhost:3000>.  Log in as `admin/admin`. 
  - Select the "prometheus" data source.
- The Prometheus interface can be accessed at <http://localhost:9090>

# Links

- ethplorer API - <https://api.ethplorer.io>
- ethplorer API docs - https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API
- Prometheus exporters - <https://prometheus.io/docs/instrumenting/writing_exporters/>
