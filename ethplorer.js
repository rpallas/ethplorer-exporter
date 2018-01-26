const server = require('express')();
const got = require('got');
const { register, Gauge, collectDefaultMetrics } = require('prom-client');

const pkg = require('./package.json');

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

const ethBalanceGauge = gauge('eth_balance', 'Total balance of either in account');
const ethTotalInGauge = gauge('eth_totalIn', 'Total either transferred into account');
const ethTotalOutGauge = gauge('eth_totalOut', 'Total either transferred out of account');
const txnTotalGauge = gauge('txn_total', 'Total number of transactons for account');
const tokenBalanceGauge = gauge('token_balance_usd', 'Overall token balance for account');

function gauge(name, help) {
  return new Gauge({ name: `ethplorer_account_${name}`, help: help, labelNames: ['address'] })
}

function accountMetrics(response) {
  const { address, ETH, countTxs, tokens } = response.body;

  ethBalanceGauge.set({ address: address }, ETH.balance);
  ethTotalInGauge.set({ address: address }, ETH.totalIn);
  ethTotalOutGauge.set({ address: address }, ETH.totalOut);
  txnTotalGauge.set({ address: address }, countTxs);
  tokenBalanceGauge.set({ address: address }, tokens.reduce(tokenBalanceReducer, 0));
}

function tokenBalanceReducer (acc, token) {
  return acc += token.tokenInfo.price
    ? (Number(token.balance) * token.tokenInfo.price.rate) / Number(`1e${token.tokenInfo.decimals}`)
    : 0;
}

server.get('/metrics', (req, res) => {
  collect().then((response) => {
    accountMetrics(response);
    res.set('Content-Type', register.contentType);
    res.end(register.metrics());
  }).catch(console.log);
});

collectDefaultMetrics();

const port = 3000;
console.log(`Server listening to ${port}, metrics exposed on /metrics endpoint`);
server.listen(port);
