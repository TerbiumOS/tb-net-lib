import NetMan from "./src/index";
var network = new NetMan();
network.connectNetwork("main", "wisp", "wss://terbiumon.top/wisp/");
network.setActiveNetwork("main");
network.active.onConnectionError(console.log)
network.active.onConnectionOpen(async function() {
    var response = await network.get("http://httpbin.org:80/headers");
    var data = await response.text();
    console.log(data);
})