/* vim: tabstop=2 expandtab */

var nameList = ['Enterpise', 'Defiant', 'Voyager'];
var controlChannelPort;
listenOn(window, function (request, makeChannel, returnPort) {
  var channel;
  switch (request.type) {
    case 'CONTROL':
      channel = makeChannel();
      controlChannelPort = channel.port1;
      controlChannelPort.onmessage = function (aMessageEvent) {};
      returnPort(channel.port2);
    break;
    case 'SERVICE':
      channel = makeChannel();
      var shipName = nameList[Math.floor(Math.random() * nameList.length)];
      navigator
      .hail('../named-ship/service.htm#' + shipName)
      .then(function (portToShip) {
        portToShip.onmessage = function (aMessageEvent) {
          channel.port1.postMessage(aMessageEvent.data);
        };
        channel.port1.onmessage = function (aMessageEvent) {
          portToShip.postMessage(aMessageEvent.data);
        };
        returnPort(channel.port2);
      });
    break;
  }
});

