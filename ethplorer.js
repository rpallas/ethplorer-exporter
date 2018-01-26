const server = require('express')();
const { register, Gauge, collectDefaultMetrics } = require('prom-client');

const got = require('got');

async function collect() {
  try {
    const response = await got('https://api.ethplorer.io/getAddressInfo/0xCa5b4dDA6CF6Ef6b76F289a3aD228b31B327e05d?apiKey=freekey', { json: true });
    return response;
  } catch (error) {
    console.log(`Error: ${error}`);
  }
}

const prefix = 'ethplorer_account_';
const ethBalanceGauge = new Gauge({ name: `${prefix}eth_balance`, help: 'Total balance of either in account', labelNames: ['address'] });
const ethTotalInGauge = new Gauge({ name: `${prefix}eth_totalIn`, help: 'Total either transferred into account', labelNames: ['address'] });
const ethTotalOutGauge = new Gauge({ name: `${prefix}eth_totalOut`, help: 'Total either transferred out of account', labelNames: ['address'] });

function ethMetrics(response) {
  const { address, ETH } = response.body;

  ethBalanceGauge.set({ address: address }, ETH.balance);
  ethTotalInGauge.set({ address: address }, ETH.totalIn);
  ethTotalOutGauge.set({ address: address }, ETH.totalOut);

  console.log(JSON.stringify(ethTotalOutGauge.get()));
}

server.get('/metrics', (req, res) => {
  collect().then((response) => {
    ethMetrics(response);
    res.set('Content-Type', register.contentType);
    res.end(register.metrics());
  });
});

// Enable collection of default metrics
collectDefaultMetrics();
// console.log(collectDefaultMetrics.metricsList);

console.log('Server listening to 3000, metrics exposed on /metrics endpoint');
server.listen(3000);
