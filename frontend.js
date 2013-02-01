// frontend.js
$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');

    // my color assigned by the server
    var myColor = false;
    
    // my name sent to the server
    var myName = false;

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'el explorador no soporta \'t '
                                    + 'websockets.'} ));
        input.hide();
        $('span').hide();
        return;
    }

    // open connection

    connection = new WebSocket('ws://localhost:5668');
    //var connection = new WebSocket('http://keizerberos.chat-server.jit.su:80');

    connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled').val('').focus();
        status.text('Elige tu nombre:');
    };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        content.html($('<p>', { text: 'problema con la conexión '
                                    + 'la conexión con el servidor finalizó.</p>' } ));
        console.log(error);
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
    	
        try {
            var json = JSON.parse(message.data);
           // console.log(json.data);    
        } catch (e) {
            console.log('JSON desconocido: ', message.data);
            return;
        }

        // NOTE: if you're not sure about the JSON structure
        // check the server source code above
        if (json.type === 'color') { // first response from the server with user's color
            myColor = json.data;

    		$('#mainTable').show();
            status.text(myName + ': ').css('color', myColor);
            input.removeAttr('disabled').focus();
            // from now user can start sending messages
        } else if (json.type === 'history') { // entire message history
            // insert every single message to the chat window
            for (var i=0; i < json.data.length; i++) {
                addMessage(json.data[i].author, json.data[i].text,
                           json.data[i].color, new Date(json.data[i].time));
            }
            slideScrollbar();
        } else if (json.type === 'message') { // it's a single message
            input.removeAttr('disabled'); // let the user write another message
            addMessage(json.data.author, json.data.text,
                       json.data.color, new Date(json.data.time));
            slideScrollbar();
        } else if (json.type === 'table') { // it's a single message
        	generateScene2(json.data);
        } else if (json.type === 'table2') { // it's a single message
        	updateScene(json.data);
        } else {
            console.log('Hmm..., json desconocido: ', json);
        }
    };

    /**
     * Send mesage when user presses Enter key
     */
   
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msgtext = $(this).val();
            // send the message as an ordinary text
            
            var msg = {
					type:"msg",
					val:msgtext
			};
            
            connection.send(JSON.stringify(msg));
            $(this).val('');
            // disable the input field to make the user wait until server
            // sends back response
            //input.attr('disabled', 'disabled');

            // we know that the first message sent from a user their name
            if (myName === false) {
                myName = msgtext;
            }
        }
    });

    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function() {
        if (connection.readyState !== 1) {
            status.text('Error');
            input.attr('disabled', 'disabled').val('Imposible comunicarse'
                                                 + 'con el servidor.');
        }
    }, 5000);
    function addMessage(author, message, color, datetime) {
        content.append('<p><span style="color:' + color + '">' + author + '</span> @ ' +
                      + (datetime.getHours() < 10 ? '0' + datetime.getHours() : datetime.getHours()) + ':'
                      + (datetime.getMinutes() < 10 ? '0' + datetime.getMinutes() : datetime.getMinutes())
                      + ': ' + message + '</p>');
    }
    
    var scrollbar = $('.chat > section:first').tinyscrollbar();
    
    function slideScrollbar() {
        scrollbar.update();
        scrollbar.move(Math.max(0, content.find('> p').length - 9) * 18);
    }
    
});




