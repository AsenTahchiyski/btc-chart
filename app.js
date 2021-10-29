// Parse data.json
async function getRawData() {
  const json = await fetch('./data.json');
  const parsed = await json.json();
  return parsed.XXBTZEUR;
}

// Transform Kraken to D3 data format
function transformData(item) {
  return {
    x: item[2] * 1000,
    y: parseFloat(item[0])
  }
}

// Set up Kraken web socket
async function startWebSocketConnection(onUpdate) {
  const socket = new WebSocket('wss://ws.kraken.com');

  socket.onmessage = msg => {
    const responseData = JSON.parse(msg.data);

    if (responseData.event === 'heartbeat' ||
      !Array.isArray(responseData[1])) {
      return;
    }

    onUpdate(responseData[1]);
  }

  const subscribe = socket => {
    const payload = {
      event: "subscribe",
      subscription: {
        name: "trade"
      },
      pair: ["XBT/EUR"]
    };

    socket.send(JSON.stringify(payload));
  }

  var interval =
    setInterval(() => {
      if (socket.readyState) {
        subscribe(socket);
        clearInterval(interval);
      }
    }, 500);

  window.onbeforeunload = () => {
    socket.close();
  }
}

// Fetch price history
async function getInitialData() {
  const url = 'https://api.kraken.com/0/public/Trades?pair=XBTEUR';
  const corsProxy = 'http://cors.io/?';
  const response = await fetch(corsProxy + url,
  // const response = await fetch('https://api.kraken.com/0/public/Trades?pair=XBTEUR',
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': navigator.userAgent
      }
    });

  return await response.json();
}

// Update chart with new data
updateChart = data => {
  const updateDataSet = [];
  for (const item of data) {
    updateDataSet.push(this.transformData(item));
  }

  this.chartData = [...this.chartData.splice(updateDataSet.length), ...updateDataSet];
  chart.update(this.chartData);
}

async function main() {
  // const chartDataRaw = await getRawData();
  const chartDataRaw = await getInitialData();
  this.chartData = chartDataRaw.map(item => this.transformData(item));

  chart.create(chartData);

  await startWebSocketConnection(this.updateChart)
}

const chart = new LineChartUpdatable();
let chartData = [];
main();
