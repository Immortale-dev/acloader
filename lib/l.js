(function(gr){

	"use strict"

	var Loading = function(settings){
		this._init();
		this.setSettings(settings);
	}

	var lProto = Loading.prototype;

	lProto._init = function(){
		this._initProperties();
		this._setDefaults();
		this._initGL();
	}

	lProto.setSettings = function(s){
		if(!s) s = {};
		
		this._disableConf = true;
		
		var pub = this.settings;
		var pri = this._settings;
		
		if(s.autostart)
			pri.autostart = !!s.autostart;
		if(s.selector)
			pri.selector = s.selector;

		delete s.selector;
		delete s.autostart;

		pub = Object.assign(pub, s);
		
		this._disableConf = false;
		
		this._configCanvas();
	}
	
	lProto._clearState = function(){
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
	}

	lProto._setDefaults = function(){
		
		var pub = this.settings;
		var pri = this._settings;
		var st = this._state;
		
		this._clearState();
		
		pub.scale = 1;
		pub.speed = 1;
		
		pub.color = '#fef565';
		pub.fadeColor = '#ff3500';
		pub.gapColor = 'rgba(0,0,0,0)';
		
		pri.shift = {x:0,y:0};
		pri.cpoint = 0;
		pri.linetypescount = 2;
		pri.rotatetypescount = 2;
		pri.anglescount = 3;
		pri.sides = pri.linetypescount*pri.anglescount;
		pri.gapwidth = 3;
		pri.gaptime = 2100;
		pri.gaptimeout = 0;
		pri.maxlength = 250;
		pri.fastrotatetime = 525;
		pri.slowrotatetime = 175;
		pri.shortlinetime = 350;
		pri.longlinetime = 350;
		pri.shortlinelength = 50;
		pri.longlinelength = 62;
		pri.linewidth = 6;
		pri.fastrotateangle = Math.PI/3-Math.PI*2/(pri.sides*9);
		pri.slowrotateangle = Math.PI*2/(pri.sides*9);
		pri.canvas = {};
		pri.tf = function(t,d){
			///?linear timing function
			return t/d;
		}
		
		pri.speed = 1;
		pri.gappeed = 1;
	}

	lProto._configCanvas = function(){
		var pri = this._settings;
		var ro = this.__calcCanvasRadius();
		var sr = (pri.shift.x**2+pri.shift.y**2)**0.5;
		var cw = this.settings.scale*2*(ro.r+sr);
		pri.canvas.width = cw;
		pri.canvas.height = cw;
		pri.canvas.cx = cw/2;
		pri.canvas.cy = cw/2;
		this._canvas.width = cw;
		this._canvas.height = cw;
		this._tmp = ro.arr;
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
		
		x = this._tmp[animationProgress].x;
		y = this._tmp[animationProgress].y;
		
		var npt = {x:x,y:y};
		this._points.push(npt);
		pri.cpoint++;
		
		st.linetype = (st.linetype + 1)%pri.linetypescount;
		
		return npt;
	}

	lProto._removePoints = function(i){
		if(!i)
			return;
		return this._points.splice(0,i-1);
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
		if(this._played && !this._paused)
			return;
		this.__time = performance.now();
		this._played = true;
		this._paused = false;
		if(!this._playing)
			this._start(!this._inited);
	}

	lProto._draw = function(){
		
		//this._configCanvas();
		this._render();
		
	}

	lProto._start = function(f){
		if(f){
			this._configCanvas();
			this._addPoint();
			this._addPoint();
			this._inited = true;
		}
		if(this._played){
			this._playing = true;
			requestAnimationFrame((timestamp)=>{
				this._animate(timestamp);
			});
			return;
		}
		this._playing = false;
	}

	lProto.stop = function(){
		this._played = false;
		this._paused = false;
		this._inited = false;
		this._clearState();
		this._removePoints(this._points.length+1);
		this._settings.cpoint = 0;
	}

	lProto.pause = function(){
		this._played = false;
		this._paused = true;
	}

	lProto._step = function(td){
		
		//td = 1000/60;
		
		var tdc = td*this.settings.speed;
		
		var st = this._state;
		var pri = this._settings;
		
		if(pri.shortlinetime || pri.longlinetime)
			st.timeline += tdc;
		var cp = this.__checkLineCoof(()=>{
			this._addPoint();
		});
		
		if(pri.fastrotatetime || pri.slowrotatetime)
			st.timerotate += tdc;
		var cr = this.__checkRotateCoof(()=>{
			this._rotate();
		});
		
		if(pri.gaptime || pri.gaptimeout)
			st.timegap += tdc;
		var cg = this.__checkGapCoof(()=>{
			this._switchGap();
		});
		
	}

	lProto._prepare = function(){
		
		var gl = this.gl;
		var g = this._gl;
		
		g.prepare();

		gl.uniformMatrix3fv(g.a.uniforms.matrix, false, this._matrix);
		gl.uniform2f(g.a.uniforms.resolution, gl.canvas.width, gl.canvas.height);
		
	}

	lProto._render = function(){
		
		this._calc();
		this._prepare();
		this._gl.render();
	}

	lProto._calc = function(){
		
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
		
		this.__arr.position.splice(0);
		this.__arr.color.splice(0);
		
		let linew = pri.linewidth;
		let gapw = pri.gapwidth;
		
		for(i=last;i>0;i--){
			
			let coof = 1;
			if(last === i)
				coof = st.coofline;
			
			
			let p1 = this._points[i];
			let p2 = this._points[i-1];
			
			// Calculate Line Points
			let pt = (pri.cpoint-(last-i)-1)%pri.anglescount;
			let la1 = (pt *lPl + lIn)%(Math.PI*2);
			let la2 = (la1-lPl)%(Math.PI*2);
			la1 = la2+(la1-la2)*coof;
			
			let w1 = linew/Math.sin(lIn);
			let w2 = w1;
			w1 = linew/Math.sin(lIn+lPl*coof);
			
			var s1 = rotateLine(w1,la1);
			var s2 = rotateLine(w2,la2);
			
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

			if(!st.gaptype){
				// Calculate With Gap
				let gow = gapw + linew;
				let cgm1 = copyColor(pri.gapColor);
				let cgm2 = copyColor(pri.gapColor);
				let cg1 = copyColor(pri.gapColor), 
					cg2 = copyColor(pri.gapColor),
					cg3 = copyColor(pri.gapColor),
					cg4 = copyColor(pri.gapColor);
				let nogs = false;
				let noge = false;
				let bgt4;
				let bgt3;
				let bgt2;
				let bgt1;
				
				cg1[3] = cg2[3] = cg3[3] = cg4[3] = 0;
				
				if(gow * st.coofgap > gapw){
					let gappos = gow * st.coofgap - gapw;
					let gapc = gappos/linew;
					bgt4 = {x:t1.x+(t4.x-t1.x)*gapc, y:t1.y+(t4.y-t1.y)*gapc};
					bgt3 = {x:t2.x+(t3.x-t2.x)*gapc, y:t2.y+(t3.y-t2.y)*gapc};
					
					this.__arr.position.push(t1.x,t1.y, t2.x,t2.y, bgt3.x,bgt3.y, bgt3.x,bgt3.y, bgt4.x,bgt4.y, t1.x,t1.y);
					this.__arr.color.push(c1[0],c1[1],c1[2],c1[3], c2[0],c2[1],c2[2],c2[3], c2[0],c2[1],c2[2],c2[3], c2[0],c2[1],c2[2],c2[3], c1[0],c1[1],c1[2],c1[3], c1[0],c1[1],c1[2],c1[3]);
				
					cg1 = copyColor(c1);
					cg2 = copyColor(c2);
				}
				else{
					let gappos = gow * st.coofgap;
					let gapc = gappos/gapw;
					if(gapc > 0.5)
						gapc = 1-gapc;
					else
						nogs = true;
					gapc*=2;
					cg1[3] = gapc * pri.gapColor[3] * c1[3];
					cg2[3] = gapc * pri.gapColor[3] * c2[3];
					cg1 = blendColor(c1,cg1,gapc);
					cg2 = blendColor(c2,cg2,gapc);
				}
				if(gow * st.coofgap + gapw < gow){
					let gappos = gow * st.coofgap;
					let gapc = gappos/linew;
					bgt1 = {x:t1.x+(t4.x-t1.x)*gapc, y:t1.y+(t4.y-t1.y)*gapc};
					bgt2 = {x:t2.x+(t3.x-t2.x)*gapc, y:t2.y+(t3.y-t2.y)*gapc};
					
					this.__arr.position.push(bgt1.x,bgt1.y, bgt2.x,bgt2.y, t3.x,t3.y, t3.x,t3.y, t4.x,t4.y, bgt1.x,bgt1.y);
					this.__arr.color.push(c1[0],c1[1],c1[2],c1[3], c2[0],c2[1],c2[2],c2[3], c2[0],c2[1],c2[2],c2[3], c2[0],c2[1],c2[2],c2[3], c1[0],c1[1],c1[2],c1[3], c1[0],c1[1],c1[2],c1[3]);
				
					cg4 = copyColor(c1);
					cg3 = copyColor(c2);
				}
				else{
					let gappos = gow - gow * st.coofgap;
					let gapc = gappos/gapw;
					if(gapc > 0.5)
						gapc = 1-gapc;
					else
						noge = true;
					gapc*=2;
					cg4[3] = gapc * pri.gapColor[3] * c1[3];
					cg3[3] = gapc * pri.gapColor[3] * c2[3];
					
					cg4 = blendColor(c1,cg4,gapc);
					cg3 = blendColor(c2,cg3,gapc);
				}
				
				
				let gps1 = bgt4 || t1;
				let gps2 = bgt3 || t2;
				let gps3 = bgt2 || t3;
				let gps4 = bgt1 || t4;
				if(nogs || noge){
					this.__arr.position.push(gps1.x,gps1.y, gps2.x,gps2.y, gps3.x,gps3.y, gps3.x,gps3.y, gps4.x,gps4.y, gps1.x,gps1.y);
					this.__arr.color.push(cg1[0],cg1[1],cg1[2],cg1[3], cg2[0],cg2[1],cg2[2],cg2[3], cg3[0],cg3[1],cg3[2],cg3[3], cg3[0],cg3[1],cg3[2],cg3[3], cg4[0],cg4[1],cg4[2],cg4[3], cg1[0],cg1[1],cg1[2],cg1[3]);
				}
				else{
					let gappos = gow * st.coofgap - gapw/2;
					let gapc = gappos/linew;
					let gpsm1 = {x:t1.x+(t4.x-t1.x)*gapc, y:t1.y+(t4.y-t1.y)*gapc};
					let gpsm2 = {x:t2.x+(t3.x-t2.x)*gapc, y:t2.y+(t3.y-t2.y)*gapc};
					
					cgm1[3] = c1[3] * pri.gapColor[3];
					cgm2[3] = c2[3] * pri.gapColor[3];
					
					this.__arr.position.push(gps1.x,gps1.y, gps2.x,gps2.y, gpsm2.x,gpsm2.y, gpsm2.x,gpsm2.y, gpsm1.x,gpsm1.y, gps1.x,gps1.y);
					this.__arr.color.push(cg1[0],cg1[1],cg1[2],cg1[3], cg2[0],cg2[1],cg2[2],cg2[3], cgm2[0],cgm2[1],cgm2[2],cgm2[3], cgm2[0],cgm2[1],cgm2[2],cgm2[3], cgm1[0],cgm1[1],cgm1[2],cgm1[3], cg1[0],cg1[1],cg1[2],cg1[3]);
				
					this.__arr.position.push(gpsm1.x,gpsm1.y, gpsm2.x,gpsm2.y, gps3.x,gps3.y, gps3.x,gps3.y, gps4.x,gps4.y, gpsm1.x,gpsm1.y);
					this.__arr.color.push(cgm1[0],cgm1[1],cgm1[2],cgm1[3], cgm2[0],cgm2[1],cgm2[2],cgm2[3], cg3[0],cg3[1],cg3[2],cg3[3], cg3[0],cg3[1],cg3[2],cg3[3], cg4[0],cg4[1],cg4[2],cg4[3], cgm1[0],cgm1[1],cgm1[2],cgm1[3]);
				}
			}
			else{		
				// WO Gap
				this.__arr.position.push(t1.x,t1.y, t2.x,t2.y, t3.x,t3.y, t3.x,t3.y, t4.x,t4.y, t1.x,t1.y);
				this.__arr.color.push(c1[0],c1[1],c1[2],c1[3], c2[0],c2[1],c2[2],c2[3], c2[0],c2[1],c2[2],c2[3], c2[0],c2[1],c2[2],c2[3], c1[0],c1[1],c1[2],c1[3], c1[0],c1[1],c1[2],c1[3]);
			}
			
			totalLength += lw*coof;
			lineType = ((lineType-1)+pri.linetypescount)%pri.linetypescount;
			
			if(totalLength > pri.maxlength)
				break;
		}
		
		this._removePoints(i);
		this._computeMatrix(cnt,angle,this.settings.scale);
	}

	lProto._computeMatrix = function(cnt,angle,scale){

		var translationMatrix = m3.translation(cnt.x, cnt.y);
		var rotationMatrix = m3.rotation(angle);
		var scaleMatrix = m3.scaling(this.settings.scale, this.settings.scale);

		var matrix = m3.multiply(translationMatrix, rotationMatrix);
		matrix = m3.multiply(matrix, scaleMatrix);
		
		return this._matrix = matrix;
	}

	lProto._calcColor = function(len){
		var maxLength = this._settings.maxlength;
		var color = this._settings.color;
		var fcolor = this._settings.fadeColor;
		var coof = (maxLength-len)/maxLength;
		return blendColor(fcolor, color, coof);
	}

	lProto._animate = function(timestamp){
		
		var td = timestamp - this.__time;
		this.__time = timestamp;
		
		this._draw();
		
		this._start();
		
		this._step(td);
	}

	lProto._initProperties = function(){
		
		var pub = {};
		var pri = {};
		
		var _this = this;
		
		this.settings = pub;
		
		this._points = [];
		this._state = {};
		this._settings = pri;
		this._canvas = createCanvas();
		this.gl = this._canvas.getContext('experimental-webgl');

		this._container = createContainer();
		this._canvasContainer = this._container.children[0];
		this._paused = false;
		this.__autostart = null;
		this.__selector = null;
		this.__arr = {position:[], color:[]};
		
		this._canvasContainer.appendChild(this._canvas);
		
		var o = ["shift.x", "shift.y", "lineTypesCount", "rotateTypesCount", "anglesCount", "gapWidth", "gapTime", "gapTimeout", "maxLength", "fastRotateTime", "slowRotateTime", "shortLineTime", "longLineTime", "shortLineLength", "longLineLength", "lineWidth", "fastRotateAngle", "slowRotateAngle"];
		
		for(let i=0;i<o.length;i++){
			Object.defineProperty(pub,o[i],{
				get: function(){
					return pri[o[i].toLowerCase()];
				},
				set: function(val){
					pri[o[i].toLowerCase()] = val;
					if(!this._disableConf)
						_this._configCanvas();
				}
			});
		}
		Object.defineProperty(this,'DOM',{
			get:function(){
				return this._container;
			}
		});
		Object.defineProperty(pub, 'color', {
			set:function(val){
				pri.color = parseColor(val);
			},
			get:function(){
				return stringifyColor(pri.color);
			}
		});
		Object.defineProperty(pub, 'fadeColor', {
			set:function(val){
				pri.fadeColor = parseColor(val);
				pri.fadeColor[3] = 0;
			},
			get:function(){
				var fc = copyColor(pri.fadeColor);
				fc[3] = 1;
				return stringifyColor(fc);
			}
		});
		Object.defineProperty(pub, 'gapColor', {
			set:function(val){
				pri.gapColor = parseColor(val);
			},
			get:function(){
				return stringifyColor(pri.gapColor);
			}
		});
	}

	lProto._initGL = function(){
		var attrs = [
			{name: 'position', size: 2, type: this.gl.DYNAMIC_DRAW, arr: this.__arr.position, attr:'a_position'},
			{name: 'color', size: 4, type: this.gl.DYNAMIC_DRAW, arr: this.__arr.color, attr:'a_color'}
		];
		var unifs = [
			{name: 'matrix', attr:'u_matrix'},
			{name: 'resolution', attr:'u_resolution'}
		]
		this._defineShaders();
		var opts = {
			vs: this.__vs,
			fs: this.__fs,
			attributes: attrs,
			uniforms: unifs
		};
		var g = new GL(this.gl, opts);
		this._gl = g;
	}

	lProto._defineShaders = function(){
		this.__vs = 
			'attribute vec2 a_position;'+
			'attribute vec4 a_color;'+
			'uniform vec2 u_resolution;'+
			'uniform mat3 u_matrix;'+
			'varying vec4 v_color;'+
			'varying vec2 v_position;'+
			'void main(){'+
				'vec2 position;'+
				'vec2 tpos = a_position;'+
				'position = (u_matrix * vec3(tpos.x,-tpos.y,1)).xy;'+
				'position = (position/u_resolution)*2.0-1.0;'+
				'v_position = position;'+
				'v_color = a_color;'+
				'gl_Position = vec4(position,0,1);'+
			'}';
		this.__fs = 
			'precision mediump float;'+
			'varying vec4 v_color;'+
			'varying vec2 v_position;'+
			'void main(){'+
				'vec4 color = v_color;'+
				'gl_FragColor = color;'+
			'}';
			
	}

	lProto.__calcCanvasRadius = function(){
		var pri = this._settings;
		var arr = [];
		var w = 0;
		var mxw = -Infinity;
		var mnw = Infinity;
		var i = 0;
		var a = 0;
		var x=0,y=0;
		var ap = Math.PI - this.__calcSumOfAngles()/pri.anglescount;
		var cl = this.__calcCycle();
		for(i=0;i<cl;i++){
			arr.push({x:x,y:y});
			var nw = this.__calcLineWidth(i);
			x += nw*Math.cos(a);
			y += nw*Math.sin(a);
			a += ap;
		}
		var sx = 0, sy = 0;
		for(let i=0;i<arr.length;i++){
			sx += arr[i].x;
			sy += arr[i].y;
		}
		sx /= arr.length;
		sy /= arr.length;
		var r = 0;
		for(let i=0;i<arr.length;i++){
			arr[i].x -= sx;
			arr[i].y -= sy;
			let nr = (arr[i].x**2+arr[i].y**2)**0.5;
			r = Math.max(r,nr);
		}
		return {arr:arr,r:r};
	}
	
	lProto.__calcCycle = function(){
		var pri = this._settings;
		return pri.anglescount * pri.linetypescount * pri.rotatetypescount;
	}

	lProto.__calcSumOfAngles = function(){
		return (this._settings.anglescount-2)*Math.PI;
	}

	lProto.__calcLineWidth = function(i){
		if(i == void 0) 
			i = this._state.linetype;
		var pri = this._settings;
		return calcFitCoof(pri.shortlinelength, pri.longlinelength, pri.linetypescount, i);
	}

	lProto.__calcRotation = function(i){
		if(i == void 0) 
			i = this._state.rotatetype;
		var pri = this._settings;
		return calcFitCoof(pri.slowrotateangle, pri.fastrotateangle, pri.rotatetypescount, i);
	}

	lProto.__checkGapCoof = function(cb){
		var pri = this._settings;
		var st = this._state;
		if(!pri.gaptime && !pri.gaptimeout)
			return;
		var ltm;
		var lc = 0;
		do{
			ltm = st.gaptype ? pri.gaptimeout : pri.gaptime;
			if(st.timegap >= ltm){
				st.timegap -= ltm;
				cb();
				lc++;
				continue;
			}
			break
		}while(true);
		st.coofgap = pri.tf(st.timegap,ltm);
		return lc;
	}

	lProto.__checkLineCoof = function(cb){
		var pri = this._settings;
		var st = this._state;
		if(!pri.longlinetime && !pri.shortlinetime)
			return;
		var ltm;
		var lc = 0;
		do{
			ltm = calcTime(pri.shortlinetime, pri.longlinetime, pri.linetypescount, st.linetype);
			if(st.timeline >= ltm){
				st.timeline -= ltm;
				cb();
				lc++;
				continue;
			}
			break
		}while(true);
		st.coofline = pri.tf(st.timeline,ltm);
		return lc;
	}

	lProto.__checkRotateCoof = function(cb){
		var pri = this._settings;
		var st = this._state;
		if(!pri.fastrotatetime && !pri.slowrotatetime)
			return;
		var ltm;
		var lc = 0;
		do{
			ltm = calcTime(pri.slowrotatetime, pri.fastrotatetime, pri.rotatetypescount, st.rotatetype);
			if(st.timerotate >= ltm){
				st.timerotate -= ltm;
				cb();
				lc++;
				continue;
			}
			break
		}while(true);
		st.coofrotate = pri.tf(st.timerotate,ltm);
		return lc;
	}


	/**
	 * WebGL Custom Engine Class
	 */
	 
	function GL(gl, options){
		this.options = options;
		this.gl = gl;
		this.init();
	}

	var gProto = GL.prototype;

	// Init
	gProto.init = function(){
		this.initProgram();
	}

	// Init Program
	gProto.initProgram = function(){
		var gl = this.gl;
		var vertexShaderSource = this.options.vs;
		var fragmentShaderSource = this.options.fs;
		var vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
		var fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
		var program = this.createProgram(vertexShader, fragmentShader);
		gl.useProgram(program);
		this.a = {
			attributes:{},
			uniforms:{}
		};
		for(let i=0;i<this.options.attributes.length;i++){
			let a = this.options.attributes[i];
			this.a.attributes[a.name] = {
				attr: gl.getAttribLocation(program, a.attr),
				size: a.size,
				buffer: gl.createBuffer(),
				type: a.type,
				arr: a.arr
			};
		}
		for(let i=0;i<this.options.uniforms.length;i++){
			let a = this.options.uniforms[i];
			this.a.uniforms[a.name] = gl.getUniformLocation(program, a.attr);
		}
		this._program = program;
	}

	// Create Shader
	gProto.createShader = function(type, source){
		var shader = this.gl.createShader(type);
		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);
		var success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
		if (success) {
			return shader;
		}
		console.log(this.gl.getShaderInfoLog(shader));
		this.gl.deleteShader(shader);
	}
	// Create Program
	gProto.createProgram = function(vertexShader, fragmentShader) {
		var program = this.gl.createProgram();
		this.gl.attachShader(program, vertexShader);
		this.gl.attachShader(program, fragmentShader);
		this.gl.linkProgram(program);
		var success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
			if (success) {
			return program;
		}
		console.log(this.gl.getProgramInfoLog(program));
		this.gl.deleteProgram(program);
	}
	// Enable Buffer
	gProto.enableBuffer = function(options){
		var gl = this.gl;
		gl.enableVertexAttribArray(options.attr);
		gl.bindBuffer(gl.ARRAY_BUFFER, options.buffer);
		gl.vertexAttribPointer(
			options.attr, options.size, options.type || gl.FLOAT, options.normalize || false, options.stride || 0, options.offset || 0);
	}

	// Buffer Data
	gProto.buffer = function(options){
		var gl = this.gl;
		var b = options.buffer || gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, b);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(options.arr), options.type);
		return b;
	}

	// Clear WebGL
	gProto.clear = function(){
		var gl = this.gl;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.depthFunc(gl.LESS);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		gl.useProgram(this._program);
	}

	// Prepare Attributes
	gProto.prepare = function(){
		var attrs = this.a.attributes;
		for(let i in attrs){
			let a = attrs[i];
			this.buffer({arr:a.arr, type:a.type, buffer:a.buffer});
			this.enableBuffer({attr:a.attr, buffer:a.buffer, size:a.size});
			this._count = a.arr.length/a.size;
		}
	}

	// Render
	gProto.render = function(){
		this.clear();
		this.prepare();
		this.draw();
	}

	// Draw
	gProto.draw = function(){
		var gl = this.gl;
		var primitiveType = gl.TRIANGLES;
		var offset = 0;
		var count = this._count;
		gl.drawArrays(primitiveType, offset, count);
	}
	
	
	// Additional Function and Objects
	
	var calcTime = function(mn,mx,count,ind){
		return mn + (mx-mn)*ind/(count-1);
	}

	var calcFitCoof = function(mn,mx,cnt,ind){
		return mn + (((cnt-1)-(ind%cnt))/(cnt-1))*(mx-mn);
	}

	var createContainer = function(){
		let d = document.createElement('div');
		let din = document.createElement('div');
		
		d.appendChild(din);
		return d;
	}

	var createCanvas = function(){
		var c = document.createElement('canvas');
		return c;
	}


	var rotateLine = function(len,ang){
		return {x:len*Math.cos(ang), y:len*Math.sin(ang)};
	}

	var blendColor = function(c1,c2,coof){
		var nclr = new Array(4);
		nclr[0] = c1[0] + (c2[0]-c1[0])*coof;
		nclr[1] = c1[1] + (c2[1]-c1[1])*coof;
		nclr[2] = c1[2] + (c2[2]-c1[2])*coof;
		nclr[3] = c1[3] + (c2[3]-c1[3])*coof;
		return nclr;
	}

	var copyColor = function(c){
		var arr = [];
		for(let i=0;i<c.length;i++)
			arr.push(c[i]);
		return arr;
	}
	
	function stringifyColor(col){
		if(col[3] < 1)
			return 'rgba('+Math.round(col[0]*255)+', '+Math.round(col[1]*255)+', '+Math.round(col[2]*255)+', '+col[3]+')';
		else
			return '#'+cnv(col[0]) + cnv(col[1]) + cnv(col[2]);
		
		function cnv(v){
			return ('0'+Math.round(v*255).toString(16)).substr(-2);
		}
	}

	var parseColor = function(c){
		var colorArr = [];
		if(Array.isArray(c)){
			for(let i=0;i<c.length;i++)
				colorArr.push(c[i]);
		}
		else if(c.indexOf("rgb")+1){
			var fb = c.indexOf("(")+1;
			var lb = c.indexOf(")");
			c = c.substr(fb,lb-fb).split(',');
			c.splice(4);
			for(let i=0;i<c.length;i++)
				colorArr.push(parseInt(c[i])/(i<3 ? 255 : 1));
			while(colorArr.length < 4)
				colorArr.push(1);
		}
		else if(c.charAt(0) == '#'){
			c = c.substr(1);
			var cc = 0;
			if(c.length < 6){
				var tc = '';
				for(let i=0;i<4 && i<c.length;i++)
					tc += c[i]+c[i];
				c = tc;
			}
			while(c.length < 8)
				c += 'ff';
			for(let i=0;i<c.length;i+=2)
				colorArr.push(parseInt(c.substr(i,2),16)/255);
		}
		else{
			throw new Error(err.BAD_COLOR_FORMAT);
		}
		return colorArr;
	}

	var err = {
		BAD_COLOR_FORMAT: "Bad Color Format"
	}

	var m3 = {
		translation: function(tx, ty) {
			return [
				1, 0, 0,
				0, 1, 0,
				tx, ty, 1,
			];
		},
		rotation: function(angleInRadians) {
			var c = Math.cos(angleInRadians);
			var s = Math.sin(angleInRadians);
			return [
				c,-s, 0,
				s, c, 0,
				0, 0, 1,
			];
		},
		scaling: function(sx, sy) {
			return [
				sx, 0, 0,
				0, sy, 0,
				0, 0, 1,
			];
		},
		multiply: function(a, b) {
			var a00 = a[0 * 3 + 0];
			var a01 = a[0 * 3 + 1];
			var a02 = a[0 * 3 + 2];
			var a10 = a[1 * 3 + 0];
			var a11 = a[1 * 3 + 1];
			var a12 = a[1 * 3 + 2];
			var a20 = a[2 * 3 + 0];
			var a21 = a[2 * 3 + 1];
			var a22 = a[2 * 3 + 2];
			var b00 = b[0 * 3 + 0];
			var b01 = b[0 * 3 + 1];
			var b02 = b[0 * 3 + 2];
			var b10 = b[1 * 3 + 0];
			var b11 = b[1 * 3 + 1];
			var b12 = b[1 * 3 + 2];
			var b20 = b[2 * 3 + 0];
			var b21 = b[2 * 3 + 1];
			var b22 = b[2 * 3 + 2];
			return [
				b00 * a00 + b01 * a10 + b02 * a20,
				b00 * a01 + b01 * a11 + b02 * a21,
				b00 * a02 + b01 * a12 + b02 * a22,
				b10 * a00 + b11 * a10 + b12 * a20,
				b10 * a01 + b11 * a11 + b12 * a21,
				b10 * a02 + b11 * a12 + b12 * a22,
				b20 * a00 + b21 * a10 + b22 * a20,
				b20 * a01 + b21 * a11 + b22 * a21,
				b20 * a02 + b21 * a12 + b22 * a22,
			];
		},
	};
	gr.Loading = Loading;
})(window);
