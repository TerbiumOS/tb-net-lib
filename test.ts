import NetMan from "./src/index";
var network = new NetMan();
network.connectNetwork("main", "wisp", "wss://terbiumon.top/wisp/");
network.setActiveNetwork("main");
network.active.onConnectionError(console.log)
network.active.onConnectionOpen(async function() {
    var response = await network.get("http://www.example.com:80");
    var data = await response.text();
    console.log(data);
})