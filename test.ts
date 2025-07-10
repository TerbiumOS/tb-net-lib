import NetMan from "./src/index";
var network = new NetMan();
network.connectNetwork("main", "wisp", "wss://terbiumon.top/wisp/");
network.connectNetwork("main2", "wisp", "wss://wisp.mercurywork.shop/wisp/");
network.useActiveSwitch();
network.main.onConnectionOpen(async function() {
    network.main2.onConnectionOpen(async function() {
        var response = await network.get("http://httpbin.org:80/get", {
            headers: {
                "Accept": "application/json"
            }
        });
        var data = await response.text();
        console.log(data);
        var response = await network.get("http://httpbin.org:80/get", {
            headers: {
                "Accept": "application/json"
            }
        });
        var data = await response.text();
        console.log(data);
    })
})