var Loading = function(settings){
	this._init();
	this._setSettings(settings);
}

var lProto = Loading.prototype;

lProto._init = function(){
	this._initProperties();
	this._setDefaults();
	//this._initBasics();
}

lProto._setSettings = function(s){
	if(!s) s = {};
	
	var pub = this.settings;
	var pri = this._settings;
	
	if(s.autostart)
		pri.autostart = !!s.autostart;
	if(s.selector)
		pri.selector = s.selector;

	delete s.selector;
	delete s.autostart;
	
	pri.color = this._parseColor(pub.color);
	pri.fadeColor = pub.fadeColor ? this._parseColor(pub.fadeColor) : pri.color.slice(0);
	pri.fadeColor[3] = 0;
	
	pri.bgColor = this._parseColor(pub.bgColor);
	
	Object.assign(pub, s);
	
}

lProto._setDefaults = function(){
	var pub = this.settings;
	var pri = this._settings;
	var st = this._state;
	
	st.coofline = 0;
	st.coofrotate = 0;
	st.coofgap = 0;
	st.linetype = 0;
	st.rotatetype = 0;
	st.gaptype = 0;
	st.angle = 0;
	st.side = 0;
	st.timeline = 0;
	st.timegap = 0;
	st.timerotate = -175;
	
	pub.scale = 1;
	pub.color = '#fef565';
	pub.fadeColor = '#ff3500';
	pub.speed = 1;
	pub.bgColor = '#000';
	
	pri.cpoint = 0;
	pri.linetypescount = 2;
	pri.rotatetypescount = 2;
	pri.anglescount = 3;
	pri.sides = pri.linetypescount*pri.anglescount;
	pri.gapwidth = 3;
	pri.gaptime = 2000;
	pri.gaptimeout = 100;
	pri.maxlength = 250;
	pri.fastrotatetime = 525;
	pri.slowrotatetime = 175;
	pri.shortlinetime = 350;
	pri.longlinetime = 350;
	pri.shortlinelength = 50;
	pri.longlinelength = 60;
	pri.linewidth = 5;
	pri.precision = 1000;
	pri.fastrotateangle = Math.PI/3-Math.PI*2/(pri.sides*9);
	pri.slowrotateangle = Math.PI*2/(pri.sides*9);
	pri.canvas = {};
	pri.timingf = function(t,b,c,d){
		///?linear
		return c*t/d + b;
	}
	
	pri.speed = 1;
	pri.gappeed = 1;
}

lProto._configCanvas = function(){
	var pri = this._settings;
	//var cw = (pri.longlinelength - pri.shortlinelength)*2 + pri.shortlinelength + 10;	//triangles only
	var cw = this.settings.scale*(2*this.__calcCanvasRadius()+10); //Advanced
	pri.canvas.width = cw;
	pri.canvas.height = cw;
	pri.canvas.cx = cw/2;
	pri.canvas.cy = cw/2;
	this._canvas.width = cw;
	this._canvas.height = cw;
}

lProto._createContainer = function(){
	let d = document.createElement('div');
	let din = document.createElement('div');
	
	d.appendChild(din);
	return d;
}

lProto._createCanvas = function(){
	var c = document.createElement('canvas');
	return c;
}

lProto._gradient = function(p1,p2,carr){
	var grd = this._ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
	for(let i=0;i<carr.length;i++)
		grd.addColorStop(i/(carr.length-1), carr[i]);
	//grd.addColorStop(1, c2);
	return grd;
}

lProto._addPoint = function(){

	var pri = this._settings;
	var st = this._state;
	var lng = pri.cpoint % pri.linetypescount;
	var p = pri.cpoint % pri.anglescount;
	var pi = Math.PI;
	var pi2 = pi*2;
	
	p = (((p-1)+pri.anglescount)%pri.anglescount);
	lng = (((lng-1)+pri.linetypescount)%pri.linetypescount);
	
	var animationProgress = pri.cpoint % (pri.linetypescount*pri.anglescount*pri.rotatetypescount);
	
	var angleTick = this.__calcSumOfAngles()/pri.anglescount;
	var lineLength = this.__calcLineWidth(lng);
	var ang = (Math.PI-angleTick)*p;
	var x,y;
	
	if(!animationProgress){
		var hl = lineLength/2;
		var a = angleTick/2;
		x = -hl;
		y = -hl/(1/Math.tan(a));
	}
	else{
		var lp = this._points[this._points.length-1];
		var mx = +((ang/(1/2*pi) > 1) && (ang/(3/2*pi) < 1)) * -2 + 1;
		var my = +(ang/pi > 1) * -2 + 1;
		mx = my = 1;
		var a = ang%(pi*2);
		x = lp.x + Math.cos(a)*lineLength*mx;
		y = lp.y + Math.sin(a)*lineLength*my;
	}
	
	var npt = {x:x,y:y};
	this._points.push(npt);
	pri.cpoint++;
	
	st.linetype = (st.linetype + 1)%pri.linetypescount;
	
	//debugger;
	
	return npt;
}

lProto._removePoint = function(){
	return this._points.shift();
}

lProto._rotate = function(){
	
	var pri = this._settings;
	var st = this._state;
	
	var ra = this.__calcRotation(st.rotatetype);
	
	st.angle += ra;
	
	st.rotatetype = (st.rotatetype+1)%pri.rotatetypescount;
}

lProto._switchGap = function(){
	
	var st = this._state;
	st.gaptype = 1-st.gaptype;
	
}

lProto.play = function(){
	this._start(true);
}



lProto._clear = function(){
	this._ctx.clearRect(0,0,this._canvas.width,this._canvas.height);
}

lProto._draw = function(){
	
	this._configCanvas();
	this._clear();
	this._render();
	
}

lProto._start = function(f){
	if(f){
		this._configCanvas();
		this._addPoint();
		this._addPoint();
		this.__time = performance.now();
	}
	requestAnimationFrame((timestamp)=>{
		this._animate(timestamp);
	});
}

lProto._stop = function(){
	///!TODO: stop animation
}

lProto._pause = function(){
	///!TODO: pause animation
}

lProto._calc = function(td){
	
	//td = 1000/60;///*
	
	var tdc = td*this.settings.speed;
	
	var st = this._state;
	var pri = this._settings;
	
	st.timeline += tdc;
	var cp = this.__checkLineCoof(()=>{
		this._addPoint();
	});
	
	st.timerotate += tdc;
	var cr = this.__checkRotateCoof(()=>{
		this._rotate();
	});
	
	st.timegap += tdc;
	var cg = this.__checkGapCoof(()=>{
		this._switchGap();
	});
	
}

lProto._render = function(){
	
	var st = this._state;
	var pri = this._settings;
	
	var last = this._points.length-1;
	var totalLength = 0;
	var lineType = st.linetype;
	
	var angle = st.angle + this.__calcRotation(st.rotatetype)*st.coofrotate;
	var cnt = {x:pri.canvas.cx, y:pri.canvas.cy};
	var angTick = this.__calcSumOfAngles()/pri.anglescount;
	var lIn = angTick/2;
	var lPl = Math.PI-angTick;
	
	let t1;
	let t2;
	let t3;
	let t4;
	
	let i;
	
	this.__arr.splice(0);
	
	for(i=last;i>0;i--){
		
		let coof = 1;
		if(last === i)
			coof = st.coofline;
		
		let pt = (pri.cpoint-(last-i)-1)%pri.anglescount;
		
		let p1 = this._points[i];
		let p2 = this._points[i-1];
		
		// Calculate Line Points
		let la1 = (pt *lPl + lIn)%(Math.PI*2);
		let la2 = (la1-lPl)%(Math.PI*2);
		la1 = la2+(la1-la2)*coof;
		
		let w1 = pri.linewidth/Math.sin(lIn);
		let w2 = w1;
		w1 = pri.linewidth/Math.sin(lIn+lPl*coof);
		
		var s1 = this._rotateLine(w1,la1);
		var s2 = this._rotateLine(w2,la2);
		
		t1 = t2;
		t4 = t3;
		if(!t1 || !t4){
			t1 = {x:p2.x+(p1.x-p2.x)*coof, y:p2.y + (p1.y-p2.y)*coof};
			t4 = {x:t1.x+s1.x, y:t1.y+s1.y};
		}
		t2 = {x:p2.x, y:p2.y};
		t3 = {x:t2.x+s2.x, y:t2.y+s2.y};
		
		let lw = this.__calcLineWidth(lineType);
		
		var c1 = this._calcColor(totalLength);
		var c2 = this._calcColor(totalLength+lw*coof);
		var gr = this._gradient(t4, t3, [c1, c2]);
		
		
		// Calculate Gap
		var ggr = null;
		if(!st.gaptype){
			let lag = ((pt-1+pri.anglescount)%pri.anglescount*lPl + Math.PI/2)%(Math.PI*2);
			let wg = pri.gapwidth;
			var sg = this._rotateLine(wg,lag);
			var snmg = this._rotateLine(pri.linewidth,lag);
			var fColor = this._copyColor(pri.bgColor);
			fColor[3] = 0;
			var gpn = {x:t1.x-sg.x, y:t1.y-sg.y};
			var gpx = {x:t1.x+snmg.x, y:t1.y+snmg.y};
			var gapp = {x:gpn.x+(gpx.x-gpn.x)*st.coofgap, y:gpn.y+(gpx.y-gpn.y)*st.coofgap};
			ggr = this._gradient(gapp, {x:gapp.x+sg.x, y:gapp.y+sg.y}, [this._stringifyColor(fColor), this._stringifyColor(pri.bgColor), this._stringifyColor(fColor)]);
		}
		
		
		this.__arr.push({t1:t1, t2:t2, t3:t3, t4:t4, gradient:gr, gapgradient: ggr});
		
		
		
		totalLength += lw*coof;
		lineType = ((lineType-1)+pri.linetypescount)%pri.linetypescount;
		
		if(totalLength > pri.maxlength)
			break;
	}
	
	if(i)
		this._points.splice(0,i-1);
	
	
	for(let i=this.__arr.length-1;i>=0;i--){
		var p = this.__arr[i];
		this._renderLine(cnt,p.t1,p.t2,p.t3,p.t4,angle,(w)=>{
			this._renderLineGradient(p.gradient);
			//this._clipShape();
			if(p.gapgradient)
				this._renderLineGradient(p.gapgradient);
			//this._renderPoint({x:t1.x, y:t1.y}, {x:t1.x+sg.x, y:t1.y+sg.y});
		});
	}
	
}

lProto._rotateLine = function(len,ang){
	return {x:len*Math.cos(ang), y:len*Math.sin(ang)};
}

lProto._renderStroke = function(c){
	return;
	this._ctx.strokeStyle = c;
	this._ctx.lineWidth = 0.67;
	this._ctx.stroke();
}

lProto._renderPoint = function(p1,p2){
	var ctx = this._ctx;
	ctx.moveTo(p1.x,p1.y);
	ctx.lineTo(p2.x,p2.y);
	ctx.stroke();
}

lProto._renderLine = function(cnt,p1,p2,p3,p4,angle,cb){
	var ctx = this._ctx;
	ctx.save();
	ctx.translate(cnt.x, cnt.y);
	ctx.rotate(angle);
	ctx.beginPath();
	ctx.scale(this.settings.scale,this.settings.scale);
	ctx.moveTo((p2.x),(p2.y));
	ctx.lineTo((p3.x),(p3.y));
	ctx.lineTo((p4.x),(p4.y));
	ctx.lineTo((p1.x),(p1.y));
	ctx.closePath();
	if(cb) cb();
	ctx.restore();
}

lProto._clipShape = function(){
	this._ctx.clip();
}

lProto._renderLineGradient = function(gradient){
	var ctx = this._ctx;
	ctx.fillStyle = gradient;
	ctx.fill();
}

lProto._calcColor = function(len){
	var maxLength = this._settings.maxlength;
	var color = this._settings.color;
	var fcolor = this._settings.fadeColor;
	var coof = (maxLength-len)/maxLength;
	var opac = fcolor[3] + (color[3]-fcolor[3]) * coof;
	var nr = fcolor[0] + (color[0]-fcolor[0]) * coof;
	var ng = fcolor[1] + (color[1]-fcolor[1]) * coof;
	var nb = fcolor[2] + (color[2]-fcolor[2]) * coof;
	return 'rgba('+nr+','+ng+','+nb+','+opac+')';
}

lProto._animate = function(timestamp){
	
	//console.log(timestamp);
	
	var td = timestamp - this.__time;
	this.__time = timestamp;
	
	this._draw();
	
	this._start();
	
	this._calc(td);
	/*
	requestAnimationFrame((timestamp)=>{
		this._animate(timestamp);
	});
	*/
}

lProto._copyColor = function(c){
	var arr = [];
	for(let i=0;i<c.length;i++)
		arr.push(c[i]);
	return arr;
}

lProto._stringifyColor = function(c){
	return 'rgba('+c[0]+', '+c[1]+', '+c[2]+', '+c[3]+')';
}

lProto._parseColor = function(c){
	var colorArr = [];
	if(c.charAt(0) == '#'){
		c = c.substr(1);
		var cc = 0;
		if(c.length < 6){
			var tc = '';
			for(let i=0;i<3 && i<c.length;i++)
				tc += c[i]+c[i];
			c = tc;
		}
		while(c.length < 8)
			c += 'ff';
		for(let i=0;i<c.length;i+=2)
			colorArr.push(parseInt(c.substr(i,2),16));
		colorArr[colorArr.length-1] /= 255;
	}
	else if(c.indexOf("rgb")+1){
		var fb = c.indexOf("(")+1;
		var lb = c.indexOf(")");
		c = c.substr(fb,lb-fb).substr(',');
		c.splice(4);
		for(let i=0;i<c.length;i++)
			colorArr.push(parseInt(c[i]));
		while(colorArr.length < 4)
			colorArr.push(1);
	}
	else{
		throw new Error("Bad Color Format");
	}
	return colorArr;
}


lProto._initProperties = function(){
	
	this.settings = {};
	
	this._points = [];
	this._state = {};
	this._settings = {};
	this._canvas = this._createCanvas();
	this._ctx = this._canvas.getContext('2d');
	this._container = this._createContainer();
	this._canvasContainer = this._container.children[0];
	this.__autostart = null;
	this.__selector = null;
	this.__arr = [];
	
	this._canvasContainer.appendChild(this._canvas);
	
	Object.defineProperty(this,'DOM',{
		get:function(){
			return this._container;
		}
	});
}

lProto.__calcTime = function(mn,mx,count,ind){
	return mn + (mx-mn)*ind/(count-1);
}

lProto.__calcCanvasRadius = function(){
	var pri = this._settings;
	var w = -pri.shortlinelength/2;
	var i = 0;
	var a = 0;
	var ap = Math.PI - this.__calcSumOfAngles()/pri.anglescount;
	while(a < Math.PI/2){
		var nw = this.__calcLineWidth(i);
		w += nw*Math.cos(a);
		a += ap;
		i++;
	}
	return w;
}

lProto.__round = function(x){
	//return x;
	var pr = this._settings.precision;
	return Math.round(x*pr)/pr;
};

lProto.__calcSumOfAngles = function(){
	return (this._settings.anglescount-2)*Math.PI;
}

lProto.__calcLineWidth = function(i){
	var pri = this._settings;
	return pri.shortlinelength + (((pri.linetypescount-1)-(i%pri.linetypescount))/(pri.linetypescount-1))*(pri.longlinelength-pri.shortlinelength);
}

lProto.__calcRotation = function(i){
	var pri = this._settings;
	return pri.slowrotateangle + (((pri.rotatetypescount-1)-(i%pri.rotatetypescount))/(pri.rotatetypescount-1))*(pri.fastrotateangle-pri.slowrotateangle);
}

lProto.__checkGapCoof = function(cb){
	var pri = this._settings;
	var st = this._state;
	
	var ltm;
	var lc = 0;
	
	do{
		ltm = st.gaptype ? pri.gaptimeout : pri.gaptime;
		if(st.timegap >= ltm){
			st.timegap -= ltm;
			cb();
			//st.linetype = (st.linetype+1)%pri.linetypescount;
			lc++;
			continue;
		}
		break
	}while(true);
	
	st.coofgap = st.timegap/ltm;
	return lc;
}

lProto.__checkLineCoof = function(cb){
	
	var pri = this._settings;
	var st = this._state;
	
	var ltm;
	var lc = 0;
	
	do{
		ltm = this.__calcTime(pri.shortlinetime, pri.longlinetime, pri.linetypescount, st.linetype);
		if(st.timeline >= ltm){
			st.timeline -= ltm;
			cb();
			//st.linetype = (st.linetype+1)%pri.linetypescount;
			lc++;
			continue;
		}
		break
	}while(true);
	
	st.coofline = st.timeline/ltm;
	return lc;
}

lProto.__checkRotateCoof = function(cb){
	
	var pri = this._settings;
	var st = this._state;
	
	var ltm;
	var lc = 0;
	
	do{
		ltm = this.__calcTime(pri.slowrotatetime, pri.fastrotatetime, pri.rotatetypescount, st.rotatetype);
		if(st.timerotate >= ltm){
			st.timerotate -= ltm;
			cb();
			//st.rotatetype = (st.rotatetype+1)%pri.rotatetypescount;
			lc++;
			continue;
		}
		break
	}while(true);
	
	st.coofrotate = st.timerotate/ltm;
	return lc;
}
