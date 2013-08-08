/* vim: tabstop=2 expandtab */

function listenOn(window, handleContact) {
  var MessageChannel = window.MessageChannel;
  if (!MessageChannel) {
    var mHashOfPort = {};
    window.addEventListener('message', function (aMessageEvent) {
      if (aMessageEvent.data[0] == 'PORT_MESSAGED') {
        var data = aMessageEvent.data[1];
        var ownerChannelId = aMessageEvent.data[2];
        var targetPort = mHashOfPort[ownerChannelId];
        if (targetPort && targetPort.onmessage) {
          targetPort.onmessage({data:data});
        }
      }
    });
  }

  window.addEventListener('message', function (aMessageEvent) {
      if (aMessageEvent.data[0] == 'PORT_REQUIRED') {
        var makeChannel;
        var returnPort;
        if (MessageChannel) {
          var portToTransportChannel = aMessageEvent.ports[0];
          makeChannel = function() {
            return new MessageChannel();
          };
          returnPort = function(port) {
            portToTransportChannel.postMessage(null, [port]);
          };
        } else {
          var source = aMessageEvent.source;
          var channelId = aMessageEvent.data[2];
          makeChannel = function () {
            var channel = {
              port1:{
                postMessage:function (aData) {
                  source.postMessage(['PORT_MESSAGED', aData, channelId], '*');
                }
              },
              port2:null
            };
            mHashOfPort[channelId] = channel.port1;
            return channel;
          };
          returnPort = function () {
            source.postMessage(['PORT_RETURNED', channelId], '*');
          };
        }
        handleContact(aMessageEvent.data[1], makeChannel, returnPort);
      }
  });
}

