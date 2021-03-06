String.prototype.hashCode = function(){
  var hash = 0;
  if (this.length == 0) return hash;
  for (i = 0; i < this.length; i++) {
    char = this.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

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

var onOpen = function(event){
  console.log("connection opened")
  ws.send(JSON.stringify(intro));
};

var onMessage = function(event){
  console.log(event.data);
  var parsed = JSON.parse(event.data);
  var uid = parsed.uid;
  if (parsed.type == 'lock') {
    if (parsed.status == 'granted') {
      lockGranted(uid);
    } else if (parsed.status == 'denied') {
      lockDenied(uid);
    } else if (parsed.status == 'released') {
      lockReleased(uid);
    } else {
      console.log('Unhandled event:');
      console.log(parsed);
    }
  } else if (parsed.type == 'remove') {
    removeRequest(uid);
  } else if (parsed.type == 'add') {
    addRequest(uid, parsed.name, parsed.issue, parsed.skills.toString());
  } else {
    // unhandled message
  }
};

var lockGranted = function(uid) {
  console.log('lock granted');
  $('#' + uid + ' .btn').addClass('disabled').text('Claimed!');
  var elem = responseTemplate.format(uid, getUserName(), getUserEmail());
  $('#' + uid + ' .panel-body').append(elem);
};

var lockDenied = function(uid) {
  console.log('lock denied');
  $('#' + uid).css('color', 'lightgray');
  $('#' + uid + ' .btn').addClass('disabled').text('Already claimed...');
  // someone else responded to this request before you
};

var lockReleased = function(uid) {
  $('#' + uid).css('color', '');
  $('#' + uid + ' .btn').removeClass('disabled').text('Respond to this!');
  // TODO: test this...
};

var removeRequest = function(uid) {
  console.log('remove ' + uid);
  $('#' + uid).remove();
};

var addRequest = function(uid, name, issue, skills) {
  console.log('add request');
  console.log(skills);
  var sk = "";
  for(i=0;i<skills.length;i++){
    if(skills[i] == ','){
      sk = sk + " / ";
    } else {
      sk = sk + skills[i];
    }
  }
  var elem = helpTemplate.format(uid, name, issue, sk);
  var new_node = $(elem).hide();
  $("#all").prepend(new_node);
  new_node.show('normal');
}

var getResponseLock = function(uid) {
  console.log('get lock...');
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
  setUserName($(form).find('#fullname').val());
  setUserEmail($(form).find('#email').val());
  var response = {
    'uid': getUserID(),
    'body': {
      'targetUID': uid,
      'name': getUserName(),
      'email': getUserEmail(),
      'message': $(form).find('#responseText').val()
    },
    'type': 'respond'
  };
  console.log(response);
  ws.send(JSON.stringify(response));
  $('#' + uid + ' button').addClass('disabled').text('Sent! ');
  return false;
}

var cancelResponse = function(uid) {
  console.log('cancel ' + uid);
  var response = {
    'uid': getUserID(),
    'body': {
      'uid': uid
    },
    'type': 'cancel'
  };
  ws.send(JSON.stringify(response));
  $('#' + uid + ' form').remove();
  return false;
}
var deleteMsg = function(did){
  console.log("delete" + did);
  var response = {
    "uid" : did,
    "type" : "remove"
  };
  ws.send(JSON.stringify(response));
}

var createNewMentor = function(form) {
  console.log('create mentor ' + form);
  console.log(form);
  setUserName($(form).find('#fullname').val());
  setUserEmail($(form).find('#email').val());
  return false;
};

// View manipulation

var setView = function() {
  for(i = 0; i<elements.length; i++){
    if (elements[i] != current){
      $('#' + elements[i]).hide();
    }
  }
};

var show = function(id, event) {
  current = id;
  setView();
  $('#' + id).show();
  event.preventDefault();
  event.stopPropagation();
  $('#toolbar-dropdown').click();
};

/**
 * Initialize the app
 */
var init = function(){
  ws = new WebSocket(wsuri);
  ws.onopen = function(evt) {
    onOpen(evt);
  };
  ws.onmessage = function(evt) {
    onMessage(evt);
  };
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
var helpTemplate = '<div class="panel panel-default" id="{0}"><div class="panel-body"><h2>{1}</h2><p>{2}</p><p>{3}</p><a href="javascript:getResponseLock(\'{0}\');" class="btn btn-primary">Respond To This!</a></div></div>';

// Claim a request template
var responseTemplate = '<form class="form-horizontal" onsubmit="respondToRequest(this, \'{0}\');" action=""><fieldset><div class="form-group"><label for="fullname" class="col-sm-2 control-label">Name:</label><div class="col-sm-10"><input type="text" id="fullname" class="form-control validate" placeholder="Jerry Berry" value="{1}"/></div></div><div class="form-group"><label for="email" class="col-sm-2 control-label">Email:</label><div class="col-sm-10"><input type="email" class="form-control validate" id="email" placeholder="me@company.com" value="{2}"/></div></div></div><div class="form-group"><label class="col-sm-2 control-label" for="responseText">Message </label><div class="col-sm-10"><textarea class="form-control" rows"3" id="responseText">Hey! I\'d be happy to help! Email me.</textarea></div></div><div class="form-group"><div class="col-sm-10 col-sm-offset-2"><button type="submit" class="btn btn-primary">Send</button><button type="button" onclick="cancelResponse(\'{0}\');" class="btn btn-danger">Cancel Edit</button><button type="reset" class="btn btn-warning" value="Reset" onclick="deleteMsg(\'{0}\')">Delete Message</button></div></div></fieldset></form>'

$(document).ready(function(){
  // var pass = document.cookie;
  // if (pass == ""){
  //   pass = prompt("Mentors Only! Password:" , "n/a");
  // }
  // if (pass.hashCode() == "-306314302"){
  //   document.cookie = pass;
  //   $("#page").show();
  //   //init();
  //   //if you are looking at this code, this solution isn't foolproof.
  //   //If you would like to break this code, simply set a breakpoint and then redefine the hashCode prototype to return the correct string for any input.
  //   //Don't do that.
  // }
  // else{
  //   alert("Rejected");
  // }
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