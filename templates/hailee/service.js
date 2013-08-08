/* vim: tabstop=2 expandtab */

var controlChannelPort;
listenOn(window, function (request, makeChannel, returnPort) {
  switch (request.type) {
    case 'CONTROL':
      var channel = makeChannel();
      controlChannelPort = channel.port1;
      controlChannelPort.onmessage = function (aMessageEvent) {};
      returnPort(channel.port2); 
    break;
    case 'SERVICE':
      var channel = makeChannel();
      channel.port1.onmessage = function (aMessageEvent) {};
      returnPort(channel.port2);
    break;
  }
});

