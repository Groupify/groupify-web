var socket = undefined;
var nickname = prompt("Enter your nickname:");

function output(s,t) {
  console.log(s, t);
}

function populateSearchResults(data) {
  var template = $('#sr-temp').html();

  var results = data.map(function(x) {
    return {
      songName: x['name'],
      artist: x['artists'][0]['name'],
      albumArt: x['album']['images'][0]['url'],
      album: x['album']['name'],

    }
  });

  Mustache.parse(template);
  var rendered = Mustache.render(template, {results: results});
  $('#sr-target').html(rendered)


}

$(function() {
  if(socket !==undefined) {
      output("error", "Already connected");
      return;
  }

  var uri = "ws://" + location.host + location.pathname;
  uri = uri.substring(0, uri.lastIndexOf('/'));
  socket = new WebSocket(uri);

  socket.onerror = function(error) {
      output("error", error);
  };

  socket.onopen = function(event) {
      output("opened", "Connected to " + event.currentTarget.url);
      sendMessage("register",{"name":nickname},"client");

  };
  socket.onmessage = function(event) {
      var message = event.data;
      var data = JSON.parse(message);
      console.log(data);
      if(data['action'] == "search-results")
      {
        populateSearchResults(data['data']);
      }
  };

  socket.onclose = function(event) {
      output("closed", "Disconnected: " + event.code + " " + event.reason);
      socket = undefined;
  };










});

var sendMessage = function(action, message, ident) {
    if(socket == undefined) {
        output("error", "Not connected");
        return;
    }

    data = {
        "action": action,
        "data": message,
        "identity": ident
    };

    var text = JSON.stringify(data);
    console.log("Sending: " + text);
    socket.send(text);
};



function search() {
  var query = $("#searchquery").val();
  console.log("Searching for " + query);

  sendMessage("search", {"query":query}, "client");

}
