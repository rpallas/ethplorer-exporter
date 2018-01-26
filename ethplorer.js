const server = require('express')();
const { register, Gauge, collectDefaultMetrics } = require('prom-client');

const got = require('got');

async function collect() {
  try {
    options = {
      json: true,
      headers: { 'user-agent': `ethplorer-exporter/${pkg.version}` }
    };
    const response = await got('https://api.ethplorer.io/getAddressInfo/0xCa5b4dDA6CF6Ef6b76F289a3aD228b31B327e05d?apiKey=freekey', options);
    return response;
  } catch (error) {
    console.log(`Error: ${error}`);
  }
}

const prefix = 'ethplorer_account_';
const ethBalanceGauge = new Gauge({ name: `${prefix}eth_balance`, help: 'Total balance of either in account', labelNames: ['address'] });
const ethTotalInGauge = new Gauge({ name: `${prefix}eth_totalIn`, help: 'Total either transferred into account', labelNames: ['address'] });
const ethTotalOutGauge = new Gauge({ name: `${prefix}eth_totalOut`, help: 'Total either transferred out of account', labelNames: ['address'] });
const txnTotalGauge = new Gauge({ name: `${prefix}txn_total`, help: 'Total number of transactons for account', labelNames: ['address'] });

function ethMetrics(response) {
  const { address, ETH, countTxs } = response.body;

  ethBalanceGauge.set({ address: address }, ETH.balance);
  ethTotalInGauge.set({ address: address }, ETH.totalIn);
  ethTotalOutGauge.set({ address: address }, ETH.totalOut);
  txnTotalGauge.set({ address: address }, countTxs);

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
