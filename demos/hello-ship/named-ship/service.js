/* vim: tabstop=2 expandtab */

var shipName = location.hash;
var controlChannelPort;
listenOn(window, function (request, makeChannel, returnPort) {
  var channel;
  switch (request.type) {
    case 'CONTROL':
      channel = makeChannel();
      controlChannelPort = channel.port1;
      controlChannelPort.onmessage = function (aMessageEvent) {};
      returnPort(channel.port2);
      console.log(shipName + ' launched.');
    break;
    case 'SERVICE':
      channel = makeChannel();
      channel.port1.onmessage = function (aMessageEvent) {
        if (aMessageEvent.data == 'HELLO') {
          this.postMessage('This is ' + shipName);
        }
      };
      returnPort(channel.port2);
    break;
  }
});

