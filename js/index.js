    var elements = ["all", "me", "setup"];
    var current = "all";
    var ws = null;
    var wsuri = "ws://lmc.redspin.net:9000";
    var intro = {
      "type":"newmentor", 
      "uid" : getUserID()
    }
    var template = "<div class='card' id='{0}'><div class='card-content black-text'><span class='card-title black-text'>{1}</span><p>{2}</p></div><div class='card-action  light-blue darken-3 text-darken-4'><a onclick=\"respond('{3}')\">Respond To This!</a></div></div>";

    $(document).ready(function(){
      init();
    });

    function onMessage(event){
      //alert(event.data);
      var parsed = JSON.parse(event.data);
      var elem = template.format(parsed.uid, parsed.name, parsed.issue, parsed.uid);
      var new_node = $(elem).hide();
      $("#all").prepend(new_node);
      new_node.show('normal');
    }

    function onOpen(event){
      console.log("connection opened")
      ws.send(JSON.stringify(intro));
    }

    function setView(){
        for(i = 0; i<elements.length; i++){
            if (elements[i] != current){
                $("#" + elements[i]).hide();
            }
        }
    }

    function show(name){
        current = name;
        setView();
        $("#" + name).show();
    }

    function createGuid()
    {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    function init(){
      ws = new WebSocket(wsuri);
      ws.onopen = function(evt){onOpen(evt);};
      ws.onmessage = function(evt){onMessage(evt);};
      setView();
    }

    function respond(uid){
      alert("responding to " + uid);
    }

    function getUserID(){
        // this should always return the same value for the same device client.
        // Cookies for web.
        var ls = window.localStorage;
        // Storing to memory if
        if (ls.muid){
            //It's already set.  Leave it alone
            return ls.muid;
        } else{
            ls.muid = createGuid();
            return ls.muid;
        }
    }
    // First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}