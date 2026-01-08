// مثال في JavaScript
const ws = new WebSocket('ws://localhost:8000/ws/chart/BTCUSDT');

ws.onopen = () => {
    ws.send(JSON.stringify({
        timeframe: "1m",
        market: "crypto",
        indicators: [
            {
                name: "rsi",
                type: "momentum",
                params: { period: 14 }
            },
            {
                name: "ema",
                type: "trend",
                params: { period: 20 }
            }
        ]
    }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
};