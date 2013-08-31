var Suits  = [ "P", "K", "C", "B" ];			// Пики, трефы, черви, бубны
var Values = [ 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "D", "K", "T" ];
var Constants = { visualSteps: 20, visualDelay: 300, dxOpen: 50, dxPack: 5 };

////////////////////////////////////////////////////////////////////////////////////////////////

function randInt(n) {				// Возвращает случайное целое число от 0 до n-1
	return Math.floor(Math.random() * n);
}

function arrayToStr(arr) {
	var str = "";
	for (var i=0; i<arr.length; i++)
		str += arr[i].toString() + " ";
	return str + "(" + arr.length + ")";
}

function getLeftOpenPosition(idx) {
	return {left: ($(window).width()/2)-200-idx*Constants.dxOpen, top:100};
}

function getRightOpenPosition(idx) {
	return {left: ($(window).width()/2)+50+idx*Constants.dxOpen, top:100};
}

function getLeftPackPosition(idx) {
	return {left: 10+idx*Constants.dxPack, top: $(window).height()-260};
}

function getRightPackPosition(idx) {
	return {left: $(window).width()-160-idx*Constants.dxPack, top: $(window).height()-260};
}

function setZIndexes(arr) {
	for (var i=0; i<arr.length; i++)
		arr[i].div.css("zIndex", i);
}

function setZIndexesInverse(arr) {
	for (var i=0; i<arr.length; i++)
		arr[i].div.css("zIndex", arr.length-i-1);
}

////////////////////////////////////////////////////////////////////////////////////////////////

function Card(suit,value) {
	this.suit = suit;
	this.value = value;
	this.valueStr = Values[value];
	this.div = {};
}

function Pack() {
	this.cards = [];
	for (var i=0; i<Suits.length; i++)
		for (var j=0; j<Values.length; j++) {
			var y = new Card(Suits[i], j);
			this.cards.push(y);
		}
}

function Game() {
	this.pack1 = [];	// Закрытые карты игрока 1 
	this.pack2 = [];	// Закрытые карты игрока 2
	this.open1 = [];	// Открытые карты игрока 1
	this.open2 = [];	// Открытые карты игрока 2
	this.alertWasShown = false;
	this.winner = 0;
}

Card.prototype.toString = function() {
	return this.suit + this.valueStr
}

Card.prototype.fileName = function() {
	return "img/Cards/" + this.valueStr + this.suit + ".jpg";
}

Card.prototype.stateOpen = function() {
	this.div.css("background", "url('" + this.fileName() +"') no-repeat");
}

Card.prototype.stateClose = function() {
	this.div.css("background", "url('img/card.png') no-repeat");
}

// Раздать карты двум игрокам поровну, случайным образом

Game.prototype.deal = function() {
	this.alertWasShown = false;
	this.winner = 0;
	var all = (new Pack()).cards;
	this.pack1 = [];
	this.pack2 = [];
	while (all.length > 0) {
		var card = all.splice(randInt(all.length), 1)[0];
		this.pack1.push(card);
		card = all.splice(randInt(all.length), 1)[0];
		this.pack2.push(card);
	}
}

Game.prototype.onResize = function() {
	for (var i=0; i<this.pack1.length; i++)
		this.pack1[i].div.offset(getLeftPackPosition(i));
	for (var i=0; i<this.pack2.length; i++)
		this.pack2[i].div.offset(getRightPackPosition(i));
	for (var i=0; i<this.open1.length; i++)
		this.open1[i].div.offset(getLeftOpenPosition(i));
	for (var i=0; i<this.open2.length; i++)
		this.open2[i].div.offset(getRightOpenPosition(i));
}

Game.prototype.pack1shift = function(count) {
	for (var i=0; i<this.pack1.length; i++)
		moveElement(this.pack1[i].div, getLeftPackPosition(i+count));
}

Game.prototype.pack2shift = function(count) {
	for (var i=0; i<this.pack2.length; i++)
		moveElement(this.pack2[i].div, getRightPackPosition(i+count));
}

Game.prototype.open1shift = function(count) {
	for (var i=0; i<this.open1.length; i++)
		moveElement(this.open1[i].div, getLeftOpenPosition(i+count));
}

Game.prototype.open2shift = function(count) {
	for (var i=0; i<this.open2.length; i++)
		moveElement(this.open2[i].div, getRightOpenPosition(i+count));
}

Game.prototype.alertIfGameOver = function() {
	if (this.alertWasShown || this.winner==0) return;
	this.alertWasShown = true;
	document.getElementById("go").disabled = true;
	if (this.winner==1) alert("Вы проиграли :(");
	else if (this.winner==2) alert("Вы выиграли!");
	else if (this.winner==3) alert("Ничья! WOW!");
	else throw new Error("Unknown winner: " + this.winner);	
}

Game.prototype.createCardsDivs = function() {
	var that = this;
	var i=0, j=0;
	setTimeout(function rep() {
		var pos = getLeftPackPosition(i);
		var div = createCardDiv(pos);
		that.pack1[i].div = div;
		that.pack1[i].stateClose();
		$("#content").append(div);
		if (++i < that.pack1.length)
			setTimeout(rep, 40);
	}, 40);
	setTimeout(function rep() {
		var pos = getRightPackPosition(j);
		var div = createCardDiv(pos);
		that.pack2[j].div = div;
		that.pack2[j].stateClose();
		$("#content").append(div);
		if (++j < that.pack2.length)
			setTimeout(rep, 40);
	}, 40);
}

Game.prototype.openCards = function(doOpen) {
	var that = this;
	if (this.pack1.length==0 && this.pack2.length==0) {
		this.winner = 3;
		that.alertIfGameOver();
		return;			// Вероятность низкая, но это возможно
	}
	if (this.pack1.length > 0) {
		var c = this.pack1.pop();
		if (doOpen)
			c.stateOpen();
		g.open1shift(1);
		var pos = getLeftOpenPosition(0);
		moveElement(c.div,pos,function(){that.alertIfGameOver()});
		this.open1.unshift(c);
	}
	else
		this.winner = 2;
	if (this.pack2.length > 0) {
		var c = this.pack2.pop();
		if (doOpen)
			c.stateOpen();
		g.open2shift(1);
		var pos = getRightOpenPosition(0);
		moveElement(c.div,pos,function(){that.alertIfGameOver()});
		this.open2.unshift(c);
	}
	else
		this.winner = 1;
	setZIndexesInverse(this.open1);
	setZIndexesInverse(this.open2);
}

Game.prototype.moveOpenedTo1 = function() {
	var that = this;
	var opened = this.open1.concat(this.open2);
	this.pack1shift(opened.length);
	this.pack1 = opened.concat(this.pack1);
	setZIndexes(this.pack1);
	for (var i=0; i<opened.length; i++) {
		var pos = getLeftPackPosition(i);
		var o = opened[i];
		o.stateClose();
		moveElement(o.div, pos, function(){that.alertIfGameOver()});
	}
	this.clearOpenedCards();
	if (this.pack2.length == 0)
		this.winner = 1;
}

Game.prototype.moveOpenedTo2 = function() {
	var that = this;
	var opened = this.open2.concat(this.open1);
	this.pack2shift(opened.length);
	this.pack2 = opened.concat(this.pack2);
	setZIndexes(this.pack2);
	for (var i=0; i<opened.length; i++) {
		var pos = getRightPackPosition(i);
		var o = opened[i];
		o.stateClose();
		moveElement(o.div, pos, function(){that.alertIfGameOver()});
	}
	this.clearOpenedCards();
	if (this.pack1.length == 0)
		this.winner = 2;
}

Game.prototype.clearOpenedCards = function() {
	this.open1 = [];
	this.open2 = [];
}

// 0, если карты равны
// 1, если карта игрока №1 больше
// 2, если карта игрока №2 больше

Game.prototype.compareTopCards = function() {
	var top1 = this.open1[0].value;
	var top2 = this.open2[0].value;
	if (top1 > top2) 		return 1;
	else if (top1 < top2)	return 2;
	else					return 0;
}

Game.prototype.go = function() {
	var that = this;
	document.getElementById("go").disabled = true;
	if (this.pack1.length == 0 || this.pack2.length == 0) return;

	this.openCards(true);
	setTimeout(function rep() {
		if (that.winner == 1) that.moveOpenedTo1();
		if (that.winner == 2) that.moveOpenedTo2();
		if (that.winner > 0)  return;

		var cmp = that.compareTopCards();
		if (cmp == 1)
			that.moveOpenedTo1();
		else if (cmp == 2)
			that.moveOpenedTo2();
		else {
			that.openCards(false);
			that.openCards(true);
			setTimeout(rep, 3000);
		}
		document.getElementById("go").disabled = false;
	}, 1500);
}

////////////////////////////////////////////////////////////////////////////////////////////////

var g = new Game();

$(document).ready(function() {
	$(window).resize(function() {
		console.log("resize");
		g.onResize();
	});
});

function button_NewGame() {
	document.getElementById("new").disabled = true;
	$(".card").remove();
	g.deal();
	g.createCardsDivs();
	document.getElementById("go").disabled = false;
	setTimeout(function(){
		document.getElementById("new").disabled = false;
	}, 1500);
}

function button_Go() {
	g.go();
}

function button_Debug() {
	g.openCards(true);
}

function button_Debug2() {
	g.openCards(false);
}

function moveElement(elem,newPos,onMoved) {
	var pos = elem.position();
	var dx = (newPos.left-pos.left)  / Constants.visualSteps;
	var dy = (newPos.top-pos.top)    / Constants.visualSteps;
	var delay = Constants.visualDelay / Constants.visualSteps;
	var i = 0;
	setTimeout(function() {
    	i++;
    	pos.left += dx;
    	pos.top += dy;
    	elem.offset(pos);
    	if (i < Constants.visualSteps)
        	setTimeout(arguments.callee, delay);
        else if (typeof onMoved !== "undefined")
        	setTimeout(onMoved, delay*2);
	}, delay);
}

function createCardDiv(pos) {
	var div = $("<div/>", { class: "card", offset: pos } );
	div.css("position", "absolute");	// Иначе в IE будет position: relative
	return div;
}
