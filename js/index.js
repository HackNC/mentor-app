// User function definitions
var getUserID = function() {
  // this should always return the same value for the same device client.
  var ls = window.localStorage;
  // Storing to memory if
  if (ls.muid){
    //It's already set.  Leave it alone
    return ls.muid;
  } else{
    ls.muid = createGuid();
    return ls.muid;
  }
};

var getUserName = function() {
  var ls = window.localStorage;
  if (ls.userName) {
    return ls.userName;
  }
  return '';
}

var setUserName = function(userName) {
  window.localStorage.userName = userName;
}

var getUserEmail = function() {
  var ls = window.localStorage;
  if (ls.userEmail) {
    return ls.userEmail;
  }
  return '';
}

var setUserEmail = function(userEmail) {
  window.localStorage.userEmail = userEmail;
}

/**
 * Creates a random device ID, most likely will be unique.
 */
var createGuid = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};

// Communication function definitions

var onMessage = function(event){
  alert(event.data);
  var parsed = JSON.parse(event.data);
  var uid = parsed.uid;
  if (parsed.type == 'lockResponse') {//'lock') {
    if (parsed.lockGranted) {
      console.log('lock granted');
      $('#' + uid + ' .btn').addClass('disabled').text('Claimed!');
      var elem = responseTemplate.format(parsed.uid, getUserName(), getUserEmail());
      $('#' + uid + ' .panel-body').append(elem);
    } else {
      console.log('lock rejected');
      $('#' + uid).css('color', 'gray');
      $('#' + uid + ' .btn').addClass('disabled').text('Already claimed...');

      // someone else responded to this request before you
    }
  } else if (parsed.type == 'remove') {

  } else if (parsed.type == 'help') { // 'add') {
    var elem = helpTemplate.format(parsed.uid, parsed.name, parsed.issue, parsed.uid);
    var new_node = $(elem).hide();
    $("#all").prepend(new_node);
    new_node.show('normal');
  }
};

var onOpen = function(event){
  console.log("connection opened")
  ws.send(JSON.stringify(intro));
};

var getResponseLock = function(uid) {
  $('#' + uid + ' .btn').addClass('disabled').text('Checking...');
  var response = {
    'uid': getUserID(),
    'body': {
      'targetUID': uid
    },
    'type': 'helpack'
  };
  ws.send(JSON.stringify(response));
}

var respond = function(uid) {
  ws.send(JSON.stringify(uid));
};

// Form handling
var respondToRequest = function(form, uid) {
  var response = {
    'uid': getUserID(),
    'body': {
      'targetUID': uid,
      'name': $(form).find('#fullname').text(),
      'email': $(form).find('#email').text(),
      'message': $(form).find('#message').text()
    },
    'type': 'respond'
  };
  console.log(response);
  ws.send(JSON.stringify(response));
  $('#' + uid + ' button').addClass('disabled').text('Sent!');
  return false;
}

// View manipulation

var setView = function() {
  for(i = 0; i<elements.length; i++){
    if (elements[i] != current){
      $("#" + elements[i]).hide();
    }
  }
};

var show = function(id) {
  current = id;
  setView();
  $("#" + id).show();
};

/**
 * Initialize the app
 */
var init = function(){
  ws = new WebSocket(wsuri);
  ws.onopen = function(evt){onOpen(evt);};
  ws.onmessage = function(evt){onMessage(evt);};
  setView();
};

// Finally, execute some code.
// Set up instance state.
var elements = ["all", "me", "setup"];
var current = "all";
var ws = null;
var wsuri = "ws://lmc.redspin.net:9000";

// Get identifiers.
var intro = {
  "type":"newmentor", 
  "uid" : getUserID()
};

// Help request template.
var helpTemplate = '<div class="panel panel-default" id="{0}"><div class="panel-body"><h2>"{1}"</h2><p>"{2}"</p><a href="javascript:getResponseLock(\'{0}\');" class="btn btn-primary">Respond To This!</a></div></div>';

// Claim a request template
var responseTemplate = '<form class="form-horizontal" onsubmit="respondToRequest(this, \'{0}\');" action=""><fieldset><div class="form-group"><label for="fullname" class="col-sm-2 control-label">Name:</label><div class="col-sm-10"><input type="text" id="fullname" class="form-control validate" placeholder="Jerry Berry" value="{1}"/></div></div><div class="form-group"><label for="email" class="col-sm-2 control-label">Email:</label><div class="col-sm-10"><input type="email" class="form-control validate" id="email" placeholder="me@company.com" value="{2}"/></div></div></div><div class="form-group"><label class="col-sm-2 control-label" for="responseText">Message </label><div class="col-sm-10"><textarea class="form-control" rows"3" id="responseText">Hey! I\'d be happy to help! Email me.</textarea></div></div><div class="form-group"><div class="col-sm-10 col-sm-offset-2"><button type="submit" class="btn btn-primary">Submit</button></div></div></fieldset></form>'

$(document).ready(function(){
  init();
});

// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match;
    });
  };
}