"use strict";
process.title = 'node-chat';
var webSocketsServerPort = 5668;
var webSocketServer = require('websocket').server;
var http = require('http');
var history = new Array();
var clients = new Array();
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
colors.sort(function(a,b) { return Math.random() > 0.5; } );

/*****/
function vec(){ 
	return [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
}

function mat(){	
	return [
[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], 
[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]];
}


var blockS = [
[ 4, 3, 5, 8, 7, 6, 1, 2, 9 ],
[ 8, 7, 6, 2, 1, 9, 3, 4, 5 ],
[ 2, 1, 9, 4, 3, 5, 7, 8, 6 ],
[ 5, 2, 3, 6, 4, 7, 8, 9, 1 ],
[ 9, 8, 1, 5, 2, 3, 4, 6, 7 ],
[ 6, 4, 7, 9, 8, 1, 2, 5, 3 ], 
[ 7, 5, 4, 1, 6, 8, 9, 3, 2 ],
[ 3, 9, 2, 7, 5, 4, 6, 1, 8 ],
[ 1, 6, 8, 3, 9, 2, 5, 7, 4 ]];

var R_num = new Random(); 
var Grid_R_num = new Random();
var R_exnum = new Random();
var H_Rnum = new Random();

var firstrow, secondrow, firstcol, secondcol, firstgrid, secondgrid, gc = 0;
var carry = new vec();
var blockh = new mat();
var blockc = new mat();
/*
show(blockS);
console.log('-------------------------------');
blockc = generate();
hide();
show(blockh);
*/
function show(miMat){
	for(i=0;i<miMat.length;i++){
		var str = "";
		for(j=0;j<miMat[i].length;j++){
			str += (miMat[i][j]==0?' ':miMat[i][j]) + '\t';
			//str += blockh[i][j] + '\t';
			//str += R_num.nextInt(5) + '\t';
		}
		//console.log(str);
	}
};
function Random(){
	this.nextInt = function (num){ return Math.round(Math.random()*(num-1),0);};
}

function generate(){
	var x = 10 + R_num.nextInt(10);
	//console.log(x);
	for (var y = 0; y < x; y++) {
		for (var a = 0; a < 3; a++) {
			if (a == 0) {
				firstrow = R_num.nextInt(3);
				secondrow = R_num.nextInt(3);
			}

			else if (a == 1) {
				firstrow = 3 + R_num.nextInt(3);
				secondrow = 3 + R_num.nextInt(3);
			}

			else if (a == 2) {
				firstrow = 6 + R_num.nextInt(3);
				secondrow = 6 + R_num.nextInt(3);
			}

			for (i = 0; i < 9; i++) {
				carry[i] = blockS[firstrow][i];
				blockS[firstrow][i] = blockS[secondrow][i];
				blockS[secondrow][i] = carry[i];
			}
		}
		for (var a = 0; a < 3; a++) {

			if (a == 0) {
				firstcol = R_num.nextInt(3);
				secondcol = R_num.nextInt(3);
			}

			else if (a == 1) {
				firstcol = 3 + R_num.nextInt(3);
				secondcol = 3 + R_num.nextInt(3);
			}

			else if (a == 2) {
				firstcol = 6 + R_num.nextInt(3);
				secondcol = 6 + R_num.nextInt(3);
			}

			for (i = 0; i < 9; i++) {
				carry[i] = blockS[i][firstcol];
				blockS[i][firstcol] = blockS[i][secondcol];
				blockS[i][secondcol] = carry[i];
			}
		}
	}
	firstgrid = 1 + Grid_R_num.nextInt(3);
	secondgrid = 1 + Grid_R_num.nextInt(3);
	if ((firstgrid == 1 && secondgrid == 2) || (firstgrid == 2 && secondgrid == 1)) {
		for (var i = 0; i < 3; i++)
			for (var j = 0; j < 9; j++) {
				carry[j] = blockS[i][j];
				blockS[i][j] = blockS[i + 3][j];
				blockS[i + 3][j] = carry[j];
			}
	} else if ((firstgrid == 2 && secondgrid == 3) || (firstgrid == 3 && secondgrid == 2)) {
		for (var i = 3; i < 6; i++)
			for (var j = 0; j < 9; j++) {
				carry[j] = blockS[i][j];
				blockS[i][j] = blockS[i + 3][j];
				blockS[i + 3][j] = carry[j];
			}
	} else if ((firstgrid == 1 && secondgrid == 3) || (firstgrid == 3 && secondgrid == 1)) {
		for (var i = 0; i < 3; i++)
			for (var j = 0; j < 9; j++) {
				carry[j] = blockS[i][j];
				blockS[i][j] = blockS[i + 6][j];
				blockS[i + 6][j] = carry[j];
			}
	}
	var firstnum, secondnum, shuffle;

	shuffle = 3 + R_num.nextInt(6);
	for (var k = 0; k < shuffle; k++) {
		firstnum = 1 + R_exnum.nextInt(9);
		secondnum = 1 + R_exnum.nextInt(9);

		for (var i = 0; i < 9; i++)
			for (var j = 0; j < 9; j++) {
				if (blockS[i][j] == firstnum) {
					blockS[i][j] = secondnum;
					continue;
				}

				if (blockS[i][j] == secondnum) blockS[i][j] = firstnum;
			}
	}
	return blockS;
}

function save(){
	if (gc == 0) blockc = generate();

	gc = 1;

	return blockc;
}

function hide(){
	for (var i = 0; i < 9; i++)
		for (var j = 0; j < 9; j++){
			blockh[i][j] = blockc[i][j];
		}

	var row, column, hidingnum;

	hidingnum = 50 + R_num.nextInt(10);

	for (var i = 0; i < hidingnum; i++) {
		row = H_Rnum.nextInt(9);
		column = H_Rnum.nextInt(9);
		blockh[row][column] = 0;
	}
	return blockh;
}

save();
hide();

var blockGame = new mat();
for (var i = 0; i < 9; i++)
	for (var j = 0; j < 9; j++){
		blockGame[i][j] = blockh[i][j];
	}

/*****/


var server = http.createServer(function(request, response) {
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});


var wsServer = new webSocketServer({
    httpServer: server
});

wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
    var connection = request.accept(null, request.origin); 
    var index = clients.push(connection) - 1;
    var userName = false;
    var userColor = false;

    console.log((new Date()) + ' Connection accepted.');
    // send back chat history
    if (history.length > 0) {
        
    	connection.sendUTF(JSON.stringify( { type: 'history', data: history } ));
    }
    connection.sendUTF(JSON.stringify( { type: 'table', data: blockh } ));
    connection.sendUTF(JSON.stringify({ type:'table2', data: blockGame }));
    // user sent some message
    connection.on('message', function(message) {

    	
        if (message.type === 'utf8') { // accept only text
        	var json = JSON.parse(message.utf8Data);
            if (userName === false) { // first message sent by user is their name
                // remember user name
                userName = json.val;
                // get random color and send it back to the user
                userColor = colors.shift();
                connection.sendUTF(JSON.stringify({ type:'color', data: userColor }));
                console.log((new Date()) + ' User is known as: ' + userName
                            + ' with ' + userColor + ' color.');

            } else { // log and broadcast the message
            	
            	
            	if (json.type == 'msg'){
	                console.log((new Date()) + ' Received Message from '
	                            + userName + ': ' + message.utf8Data);
	
	                // we want to keep history of all sent messages
	                
	                var obj = {
	                    time: (new Date()).getTime(),
	                    text: json.val,
	                    author: userName,
	                    color: userColor
	                };
	                history.push(obj);
	
	                // broadcast message to all connected clients
	                var json = JSON.stringify({ type:'message', data: obj });
	
	                for (var i=0; i < clients.length; i++) {
	                	//clients[i].sendUTF(json2);
	                    clients[i].sendUTF(json);
	                }
            	}
            	if (json.type == 'set'){
            		blockGame[json.i][json.j] = json.val;
            		var json2 = JSON.stringify({ type:'table2', data: blockGame });
            		for (var i=0; i < clients.length; i++) {
	                	clients[i].sendUTF(json2);
	                }
            	}
            }
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");

            clients.splice(index, 1);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });

});