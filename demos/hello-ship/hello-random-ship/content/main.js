/* vim: tabstop=2 expandtab */

function log(text) {
  var div = document.createElement('div');
  var output = text;
  for (var i = 1; i < arguments.length; i++) {
    output = output + ' ' + arguments[i];
  }
  div.textContent = output;
  document.body.appendChild(div);
}

function send(port, data) {
  log('C2S:', data);
  port.postMessage(data);
}

navigator
.hail('../random-ship/index.htm')
.then(function (portToShip) {
  portToShip.onmessage = function (aMessageEvent) {
    log('S2C:', aMessageEvent.data);
  }
  send(portToShip, 'HELLO');
});

