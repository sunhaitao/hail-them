/* vim: tabstop=2 expandtab */

(function(window) {
  var MessageChannel = window.MessageChannel;
  if (MessageChannel) {
    window.tryContacting = function (aTargetWindow, aData, aEnjoyPort) {
      var channel = new MessageChannel();
      channel.port1.onmessage = function(aMessageEvent) {
        aEnjoyPort(aMessageEvent.ports[0]);
      };
      aTargetWindow.postMessage(['PORT_REQUIRED', aData], '*', [channel.port2]);
    };
    window.addEventListener('load', function() {
      var app = document.querySelector('.content');
      window.addEventListener('message', function (aMessageEvent) {
        if (aMessageEvent.data[0] == 'PORT_REQUIRED') {
          var portToTransportChannel = aMessageEvent.ports[0];
          tryContacting(app.contentWindow, aMessageEvent.data[1], function(port) {
            portToTransportChannel.postMessage(null, [port]);
          });
        }
      });
    });
  } else {
    var mHashOfPortCostumer = {};
    window.tryContacting = function (aTargetWindow, aData, aEnjoyPort) {
      var ownerChannelId = URL.createObjectURL(new Blob());
      mHashOfPortCostumer[ownerChannelId] = aEnjoyPort;
      aTargetWindow.postMessage(['PORT_REQUIRED', aData, ownerChannelId], '*');
    };
    var mHashOfPort = {};
    window.addEventListener('message', function (aMessageEvent) {
      if (aMessageEvent.data[0] == 'PORT_RETURNED') {
        var source = aMessageEvent.source;
        var ownerChannelId = aMessageEvent.data[1];
        var enjoy = mHashOfPortCostumer[ownerChannelId];
        if (enjoy) {
          delete mHashOfPortCostumer[ownerChannelId];
          var port = {
            postMessage:function (aData) {
              source.postMessage(['PORT_MESSAGED', aData, ownerChannelId], '*');
            }
          };
          mHashOfPort[ownerChannelId] = port;
          enjoy(port);
        }
      }
    });
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
    window.addEventListener('load', function() {
      var app = document.querySelector('.content');
      window.addEventListener('message', function (aMessageEvent) {
        if (aMessageEvent.data[0] == 'PORT_REQUIRED') {
          var outerWindow = aMessageEvent.source;
          var channelId = aMessageEvent.data[2];
          tryContacting(app.contentWindow, aMessageEvent.data[1], function(port) {
            var channel = {
              port1:{
                postMessage:function (aData) {
                  outerWindow.postMessage(['PORT_MESSAGED', aData, channelId], '*');
                },
                onmessage:function (aMessageFromOuterFrameEvent) {
                  port.postMessage(aMessageFromOuterFrameEvent.data);
                }
              },
              port2:null
            };
            mHashOfPort[channelId] = channel.port1;
            port.onmessage = function (aMessageFromInnerFrameEvent) {
              channel.port1.postMessage(aMessageFromInnerFrameEvent.data);
            };
            outerWindow.postMessage(['PORT_RETURNED', channelId], '*')
          });
        }
      });
    });
  }

  var mHashOfVessel = {};
  window.hail = function(aServiceUri) {
    var vessel = mHashOfVessel[aServiceUri];
    if (!vessel) {
      vessel = {window:null, controlChannelPort:null, todoList:[]};
      var serviceContainer = document.querySelector('.service-container');
      var serviceFrame = document.createElement('iframe');
      serviceFrame.setAttribute('mozbrowser','');
      serviceContainer.appendChild(serviceFrame);
      serviceFrame.onload = function(aOnloadEvent) {
        vessel.window = serviceFrame.contentWindow;
        tryContacting(vessel.window, {type:'CONTROL'}, function(port) {
          port.onmessage = function(aControlMessageEvent) {
            //TODO: Implement a real control protocol
            console.log(aControlMessageEvent.data);
            this.postMessage('Port returned.');
          };
          vessel.controlChannelPort = port;

          for (var i = 0; i < vessel.todoList.length; i++) {
            var doIt = vessel.todoList[i];
            doIt();
          }
          vessel.todoList = null;
        });
      }
      mHashOfVessel[aServiceUri] = vessel;
      serviceFrame.src = aServiceUri;
    }

    var prerequisite = {};
    var tryPerforming = function() {
      if (prerequisite.callback && prerequisite.port) {
        prerequisite.callback(prerequisite.port);
      }
    };

    var askForPortToServiceChannel = function() {
      tryContacting(vessel.window, {type:'SERVICE'}, function(port) {
        prerequisite.port = port;
        tryPerforming();
      });
    };
    if (!vessel.controlChannelPort) {
      vessel.todoList.push(askForPortToServiceChannel);
    } else {
      askForPortToServiceChannel();
    }

    return {
        'then':function(aCallback) {
            prerequisite.callback = aCallback;
            tryPerforming();
        }
    };
  }
})(window);

