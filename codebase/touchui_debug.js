/*
Copyright DHTMLX LTD. http://www.dhtmlx.com
You allowed to use this component or parts of it under GPL terms
To use it on other terms or get Professional edition of the component please contact us at sales@dhtmlx.com
*/
/*
2011 May 27
*/



/* DHX DEPEND FROM FILE 'core/assert.js'*/


if (!window.dhx) 
	dhx={};

//check some rule, show message as error if rule is not correct
dhx.assert = function(test, message){
	if (!test)	dhx.error(message);
};
//entry point for analitic scripts
dhx.assert_core_ready = function(){
	if (window.dhx_on_core_ready)	
		dhx_on_core_ready();
};

//code below this point need to be reconsidered

dhx.assert_enabled=function(){ return false; };

//register names of event, which can be triggered by the object
dhx.assert_event = function(obj, evs){
	if (!obj._event_check){
		obj._event_check = {};
		obj._event_check_size = {};
	}
		
	for (var a in evs){
		obj._event_check[a.toLowerCase()]=evs[a];
		var count=-1; for (var t in evs[a]) count++;
		obj._event_check_size[a.toLowerCase()]=count;
	}
};
dhx.assert_method_info=function(obj, name, descr, rules){
	var args = [];
	for (var i=0; i < rules.length; i++) {
		args.push(rules[i][0]+" : "+rules[i][1]+"\n   "+rules[i][2].describe()+(rules[i][3]?"; optional":""));
	}
	return obj.name+"."+name+"\n"+descr+"\n Arguments:\n - "+args.join("\n - ");
};
dhx.assert_method = function(obj, config){
	for (var key in config)
		dhx.assert_method_process(obj, key, config[key].descr, config[key].args, (config[key].min||99), config[key].skip);
};
dhx.assert_method_process = function (obj, name, descr, rules, min, skip){
	var old = obj[name];
	if (!skip)
		obj[name] = function(){
			if (arguments.length !=	rules.length && arguments.length < min) 
				dhx.log("warn","Incorrect count of parameters\n"+obj[name].describe()+"\n\nExpecting "+rules.length+" but have only "+arguments.length);
			else
				for (var i=0; i<rules.length; i++)
					if (!rules[i][3] && !rules[i][2](arguments[i]))
						dhx.log("warn","Incorrect method call\n"+obj[name].describe()+"\n\nActual value of "+(i+1)+" parameter: {"+(typeof arguments[i])+"} "+arguments[i]);
			
			return old.apply(this, arguments);
		};
	obj[name].describe = function(){	return dhx.assert_method_info(obj, name, descr, rules);	};
};
dhx.assert_event_call = function(obj, name, args){
	if (obj._event_check){
		if (!obj._event_check[name])
			dhx.log("warn","Not expected event call :"+name);
		else if (dhx.isNotDefined(args))
			dhx.log("warn","Event without parameters :"+name);
		else if (obj._event_check_size[name] != args.length)
			dhx.log("warn","Incorrect event call, expected "+obj._event_check_size[name]+" parameter(s), but have "+args.length +" parameter(s), for "+name+" event");
	}		
};
dhx.assert_event_attach = function(obj, name){
	if (obj._event_check && !obj._event_check[name]) 
			dhx.log("warn","Unknown event name: "+name);
};
//register names of properties, which can be used in object's configuration
dhx.assert_property = function(obj, evs){
	if (!obj._settings_check)
		obj._settings_check={};
	dhx.extend(obj._settings_check, evs);		
};
//check all options in collection, against list of allowed properties
dhx.assert_check = function(data,coll){
	if (typeof data == "object"){
		for (var key in data){
			dhx.assert_settings(key,data[key],coll);
		}
	}
};
//check if type and value of property is the same as in scheme
dhx.assert_settings = function(mode,value,coll){
	coll = coll || this._settings_check;

	//if value is not in collection of defined ones
	if (coll){
		if (!coll[mode])	//not registered property
			return dhx.log("warn","Unknown propery: "+mode);
			
		var descr = "";
		var error = "";
		var check = false;
		for (var i=0; i<coll[mode].length; i++){
			var rule = coll[mode][i];
			if (typeof rule == "string")
				continue;
			if (typeof rule == "function")
				check = check || rule(value);
			else if (typeof rule == "object" && typeof rule[1] == "function"){
				check = check || rule[1](value);
				if (check && rule[2])
					dhx["assert_check"](value, rule[2]); //temporary fix , for sources generator
			}
			if (check) break;
		}
		if (!check )
			dhx.log("warn","Invalid configuration\n"+dhx.assert_info(mode,coll)+"\nActual value: {"+(typeof value)+"} "+value);
	}
};

dhx.assert_info=function(name, set){ 
	var ruleset = set[name];
	var descr = "";
	var expected = [];
	for (var i=0; i<ruleset.length; i++){
		if (typeof ruleset[i] == "string")
			descr = ruleset[i];
		else if (ruleset[i].describe)
			expected.push(ruleset[i].describe());
		else if (ruleset[i][1] && ruleset[i][1].describe)
			expected.push(ruleset[i][1].describe());
	}
	return "Property: "+name+", "+descr+" \nExpected value: \n - "+expected.join("\n - ");
};


if (dhx.assert_enabled()){
	
	dhx.assert_rule_color=function(check){
		if (typeof check != "string") return false;
		if (check.indexOf("#")!==0) return false;
		if (check.substr(1).replace(/[0-9A-F]/gi,"")!=="") return false;
		return true;
	};
	dhx.assert_rule_color.describe = function(){
		return "{String} Value must start from # and contain hexadecimal code of color";
	};
	
	dhx.assert_rule_template=function(check){
		if (typeof check == "function") return true;
		if (typeof check == "string") return true;
		return false;
	};
	dhx.assert_rule_template.describe = function(){
		return "{Function},{String} Value must be a function which accepts data object and return text string, or a sting with optional template markers";
	};
	
	dhx.assert_rule_boolean=function(check){
		if (typeof check == "boolean") return true;
		return false;
	};
	dhx.assert_rule_boolean.describe = function(){
		return "{Boolean} true or false";
	};
	
	dhx.assert_rule_object=function(check, sub){
		if (typeof check == "object") return true;
		return false;
	};
	dhx.assert_rule_object.describe = function(){
		return "{Object} Configuration object";
	};
	
	
	dhx.assert_rule_string=function(check){
		if (typeof check == "string") return true;
		return false;
	};
	dhx.assert_rule_string.describe = function(){
		return "{String} Plain string";
	};
	
	
	dhx.assert_rule_htmlpt=function(check){
		return !!dhx.toNode(check);
	};
	dhx.assert_rule_htmlpt.describe = function(){
		return "{Object},{String} HTML node or ID of HTML Node";
	};
	
	dhx.assert_rule_notdocumented=function(check){
		return false;
	};
	dhx.assert_rule_notdocumented.describe = function(){
		return "This options wasn't documented";
	};
	
	dhx.assert_rule_key=function(obj){
		var t = function (check){
			return obj[check];
		};
		t.describe=function(){
			var opts = [];
			for(var key in obj)
				opts.push(key);
			return  "{String} can take one of next values: "+opts.join(", ");
		};
		return t;
	};
	
	dhx.assert_rule_dimension=function(check){
		if (check*1 == check && !isNaN(check) && check >= 0) return true;
		return false;
	};
	dhx.assert_rule_dimension.describe=function(){
		return "{Integer} value must be a positive number";
	};
	
	dhx.assert_rule_number=function(check){
		if (typeof check == "number") return true;
		return false;
	};
	dhx.assert_rule_number.describe=function(){
		return "{Integer} value must be a number";
	};
	
	dhx.assert_rule_function=function(check){
		if (typeof check == "function") return true;
		return false;
	};
	dhx.assert_rule_function.describe=function(){
		return "{Function} value must be a custom function";
	};
	
	dhx.assert_rule_any=function(check){
		return true;
	};
	dhx.assert_rule_any.describe=function(){
		return "Any value";
	};
	
	dhx.assert_rule_mix=function(a,b){
		var t = function(check){
			if (a(check)||b(check)) return true;
			return false;
		};
		t.describe = function(){
			return a.describe();
		};
		return t;
	};

}


/* DHX DEPEND FROM FILE 'core/dhx.js'*/


/*DHX:Depend core/assert.js*/

/*
	Common helpers
*/
dhx.version="3.0";
dhx.codebase="./";
dhx.name = "Core";

//coding helpers
dhx.copy = function(source){
	var f = dhx.copy._function;
	f.prototype = source;
	return new f();
};
dhx.copy._function = function(){};

//copies methods and properties from source to the target
dhx.extend = function(target, source, force){
	dhx.assert(target,"Invalid mixing target");
	dhx.assert(source,"Invalid mixing source");
	if (target._dhx_proto_wait)
		target = target._dhx_proto_wait[0];
	
	//copy methods, overwrite existing ones in case of conflict
	for (var method in source)
		if (!target[method] || force)
			target[method] = source[method];
		
	//in case of defaults - preffer top one
	if (source.defaults)
		dhx.extend(target.defaults, source.defaults);
	
	//if source object has init code - call init against target
	if (source._init)	
		source._init.call(target);
				
	return target;	
};

//copies methods and properties from source to the target from all levels
dhx.fullCopy = function(source){
	dhx.assert(source,"Invalid mixing target");
	var target =  (source.length?[]:{});
	if(arguments.length>1){
		target = arguments[0];
		source = arguments[1];
	}
	for (var method in source){
		if(typeof source[method] == "object"){
			target[method] = (source[method].length?[]:{});
			dhx.fullCopy(target[method],source[method]);
		}else{
			target[method] = source[method];
		}
	}

	return target;	
};


dhx.single = function(source){ 
	var instance = null;
	var t = function(config){
		if (!instance)
			instance = new source({});
			
		if (instance._reinit)
			instance._reinit.apply(instance, arguments);
		return instance;
	};
	return t;
};

dhx.protoUI = function(){
	if (dhx.debug_proto)
		dhx.log("UI registered: "+arguments[0].name);
		
	var origins = arguments;
	var selfname = origins[0].name;
	
	var t = function(data){
		if (origins){
			var params = [origins[0]];
			
			for (var i=1; i < origins.length; i++){
				params[i] = origins[i];
				
				if (params[i]._dhx_proto_wait)
					params[i] = params[i].call(dhx);

				if (params[i].prototype && params[i].prototype.name)
					dhx.ui[params[i].prototype.name] = params[i];
			}
		
			dhx.ui[selfname] = dhx.proto.apply(dhx, params);
			if (t._dhx_type_wait)	
				for (var i=0; i < t._dhx_type_wait.length; i++)
					dhx.Type(dhx.ui[selfname], t._dhx_type_wait[i]);
				
			t = origins = null;	
		}
			
		if (this != dhx)
			return new dhx.ui[selfname](data);
		else 
			return dhx.ui[selfname];
	};
	t._dhx_proto_wait = arguments;
	return dhx.ui[selfname]=t;
};

dhx.proto = function(){
	
	if (dhx.debug_proto)
		dhx.log("Proto chain:"+arguments[0].name+"["+arguments.length+"]");
		
	var origins = arguments;
	var compilation = origins[0];
	var has_constructor = !!compilation._init;
	var construct = [];
	
	dhx.assert(compilation,"Invalid mixing target");
		
	for (var i=origins.length-1; i>0; i--) {
		dhx.assert(origins[i],"Invalid mixing source");
		if (typeof origins[i]== "function")
			origins[i]=origins[i].prototype;
		if (origins[i]._init) 
			construct.push(origins[i]._init);
		if (origins[i].defaults){ 
			var defaults = origins[i].defaults;
			if (!compilation.defaults)
				compilation.defaults = {};
			for (var def in defaults)
				if (dhx.isNotDefined(compilation.defaults[def]))
					compilation.defaults[def] = defaults[def];
		}
		if (origins[i].type && compilation.type){
			for (var def in origins[i].type)
				if (!compilation.type[def])
					compilation.type[def] = origins[i].type[def];
		}
			
		for (var key in origins[i]){
			if (!compilation[key])
				compilation[key] = origins[i][key];
		}
	}
	
	if (has_constructor)
		construct.push(compilation._init);
	
	
	compilation._init = function(){
		for (var i=0; i<construct.length; i++)
			construct[i].apply(this, arguments);
	};
	var result = function(config){
		this._after_init=[];
		dhx.assert(this._init,"object without init method");
		this._init(config);
		if (this._parseSettings)
			this._parseSettings(config, this.defaults);
		for (var i=0; i < this._after_init.length; i++)
			this._after_init[i].call(this);
	};
	result.prototype = compilation;
	
	compilation = origins = null;
	return result;
};
//creates function with specified "this" pointer
dhx.bind=function(functor, object){ 
	return function(){ return functor.apply(object,arguments); };  
};

//loads module from external js file
dhx.require=function(module){
	if (!dhx._modules[module]){
		dhx.assert(dhx.ajax,"load module is required");
		
		//load and exec the required module
		dhx.exec( dhx.ajax().sync().get(dhx.codebase+module).responseText );
		dhx._modules[module]=true;	
	}
};
dhx._modules = {};	//hash of already loaded modules

//evaluate javascript code in the global scoope
dhx.exec=function(code){
	if (window.execScript)	//special handling for IE
		window.execScript(code);
	else window.eval(code);
};

dhx.wrap = function(code, wrap){
	if (!code) return wrap;
	return function(){
		var result = code.apply(this, arguments);
		wrap.apply(this,arguments);
		return result;
	};
};

/*
	creates method in the target object which will transfer call to the source object
	if event parameter was provided , each call of method will generate onBefore and onAfter events
*/
dhx.methodPush=function(object,method,event){
	return function(){
		var res = false;
		//if (!event || this.callEvent("onBefore"+event,arguments)){ //not used anymore, probably can be removed
			res=object[method].apply(object,arguments);
		//	if (event) this.callEvent("onAfter"+event,arguments);
		//}
		return res;	//result of wrapped method
	};
};
//check === undefined
dhx.isNotDefined=function(a){
	return typeof a == "undefined";
};
//delay call to after-render time
dhx.delay=function(method, obj, params, delay){
	return window.setTimeout(function(){
		var ret = method.apply(obj,params);
		method = obj = params = null;
		return ret;
	},delay||1);
};

//common helpers

//generates unique ID (unique per window, nog GUID)
dhx.uid = function(){
	if (!this._seed) this._seed=(new Date).valueOf();	//init seed with timestemp
	this._seed++;
	return this._seed;
};
//resolve ID as html object
dhx.toNode = function(node){
	if (typeof node == "string") return document.getElementById(node);
	return node;
};
//adds extra methods for the array
dhx.toArray = function(array){ 
	return dhx.extend((array||[]),dhx.PowerArray, true);
};
//resolve function name
dhx.toFunctor=function(str){ 
	return (typeof(str)=="string") ? eval(str) : str; 
};

//dom helpers

//hash of attached events
dhx._events = {};
//attach event to the DOM element
dhx.event=function(node,event,handler,master){
	node = dhx.toNode(node);
	
	var id = dhx.uid();
	dhx._events[id]=[node,event,handler];	//store event info, for detaching
	
	if (master) 
		handler=dhx.bind(handler,master);	
		
	//use IE's of FF's way of event's attaching
	if (node.addEventListener)
		node.addEventListener(event, handler, false);
	else if (node.attachEvent)
		node.attachEvent("on"+event, handler);

	return id;	//return id of newly created event, can be used in eventRemove
};

//remove previously attached event
dhx.eventRemove=function(id){
	
	if (!id) return;
	dhx.assert(this._events[id],"Removing non-existing event");
		
	var ev = dhx._events[id];
	//browser specific event removing
	if (ev[0].removeEventListener)
		ev[0].removeEventListener(ev[1],ev[2],false);
	else if (ev[0].detachEvent)
		ev[0].detachEvent("on"+ev[1],ev[2]);
		
	delete this._events[id];	//delete all traces
};


//debugger helpers
//anything starting from error or log will be removed during code compression

//add message in the log
dhx.log = function(type,message,details){
	if (arguments.length == 1){
		message = type;
		type = "log";
	}
	/*jsl:ignore*/
	if (window.console && console.log){
		type=type.toLowerCase();
		if (window.console[type])
			window.console[type](message||"unknown error");
		else
			window.console.log(type +": "+message);
		if (details) 
			window.console.log(details);
	}	
	/*jsl:end*/
};
//register rendering time from call point 
dhx.log_full_time = function(name){
	dhx._start_time_log = new Date();
	dhx.log("Info","Timing start ["+name+"]");
	window.setTimeout(function(){
		var time = new Date();
		dhx.log("Info","Timing end ["+name+"]:"+(time.valueOf()-dhx._start_time_log.valueOf())/1000+"s");
	},1);
};
//register execution time from call point
dhx.log_time = function(name){
	var fname = "_start_time_log"+name;
	if (!dhx[fname]){
		dhx[fname] = new Date();
		dhx.log("Info","Timing start ["+name+"]");
	} else {
		var time = new Date();
		dhx.log("Info","Timing end ["+name+"]:"+(time.valueOf()-dhx[fname].valueOf())/1000+"s");
		dhx[fname] = null;
	}
};
//log message with type=error
dhx.error = function(message,details){
	dhx.log("error",message,details);
	if (dhx.debug !== false)
		debugger;
};
//event system
dhx.EventSystem={
	_init:function(){
		this._events = {};		//hash of event handlers, name => handler
		this._handlers = {};	//hash of event handlers, ID => handler
		this._map = {};
	},
	//temporary block event triggering
	blockEvent : function(){
		this._events._block = true;
	},
	//re-enable event triggering
	unblockEvent : function(){
		this._events._block = false;
	},
	mapEvent:function(map){
		dhx.extend(this._map, map, true);
	},
	//trigger event
	callEvent:function(type,params){
		if (this._events._block) return true;
		
		type = type.toLowerCase();
		dhx.assert_event_call(this, type, params);
		
		var event_stack =this._events[type.toLowerCase()];	//all events for provided name
		var return_value = true;

		if (dhx.debug)	//can slowdown a lot
			dhx.log("info","["+this.name+"] event:"+type,params);
		
		if (event_stack)
			for(var i=0; i<event_stack.length; i++)
				/*
					Call events one by one
					If any event return false - result of whole event will be false
					Handlers which are not returning anything - counted as positive
				*/
				if (event_stack[i].apply(this,(params||[]))===false) return_value=false;
				
		if (this._map[type] && !this._map[type].callEvent(type,params))
			return_value =	false;
			
		return return_value;
	},
	//assign handler for some named event
	attachEvent:function(type,functor,id){
		type=type.toLowerCase();
		dhx.assert_event_attach(this, type);
		
		id=id||dhx.uid(); //ID can be used for detachEvent
		functor = dhx.toFunctor(functor);	//functor can be a name of method

		var event_stack=this._events[type]||dhx.toArray();
		//save new event handler
		event_stack.push(functor);
		this._events[type]=event_stack;
		this._handlers[id]={ f:functor,t:type };
		
		return id;
	},
	//remove event handler
	detachEvent:function(id){
		if(!this._handlers[id]){
			return;
		}
		var type=this._handlers[id].t;
		var functor=this._handlers[id].f;
		
		//remove from all collections
		var event_stack=this._events[type];
		event_stack.remove(functor);
		delete this._handlers[id];
	},
	hasEvent:function(type){
		type=type.toLowerCase();
		return this._events[type]?true:false;
	}
};

dhx.extend(dhx, dhx.EventSystem);

//array helper
//can be used by dhx.toArray()
dhx.PowerArray={
	//remove element at specified position
	removeAt:function(pos,len){
		if (pos>=0) this.splice(pos,(len||1));
	},
	//find element in collection and remove it 
	remove:function(value){
		this.removeAt(this.find(value));
	},	
	//add element to collection at specific position
	insertAt:function(data,pos){
		if (!pos && pos!==0) 	//add to the end by default
			this.push(data);
		else {	
			var b = this.splice(pos,(this.length-pos));
  			this[pos] = data;
  			this.push.apply(this,b); //reconstruct array without loosing this pointer
  		}
  	},  	
  	//return index of element, -1 if it doesn't exists
  	find:function(data){ 
  		for (var i=0; i<this.length; i++) 
  			if (data==this[i]) return i; 	
  		return -1; 
  	},
  	//execute some method for each element of array
  	each:function(functor,master){
		for (var i=0; i < this.length; i++)
			functor.call((master||this),this[i]);
	},
	//create new array from source, by using results of functor 
	map:function(functor,master){
		for (var i=0; i < this.length; i++)
			this[i]=functor.call((master||this),this[i]);
		return this;
	}
};

dhx.env = {};

// dhx.env.transform 
// dhx.env.transition
(function(){
	if (navigator.userAgent.indexOf("Mobile")!=-1) 
		dhx.env.mobile = true;
	if (dhx.env.mobile || navigator.userAgent.indexOf("iPad")!=-1 || navigator.userAgent.indexOf("Android")!=-1)
		dhx.env.touch = true;
	if (navigator.userAgent.indexOf('Opera')!=-1)
		dhx.env.isOpera=true;
	else{
		//very rough detection, but it is enough for current goals
		dhx.env.isIE=!!document.all;
		dhx.env.isFF=!document.all;
		dhx.env.isWebKit=(navigator.userAgent.indexOf("KHTML")!=-1);
		dhx.env.isSafari=dhx.env.isWebKit && (navigator.userAgent.indexOf('Mac')!=-1);
	}
	if(navigator.userAgent.toLowerCase().indexOf("android")!=-1)
		dhx.env.isAndroid = true;
	dhx.env.transform = false;
	dhx.env.transition = false;
	var options = {};
	options.names = ['transform', 'transition'];
	options.transform = ['transform', 'WebkitTransform', 'MozTransform', 'oTransform', 'msTransform'];
	options.transition = ['transition', 'WebkitTransition', 'MozTransition', 'oTransition', 'msTransition'];
	
	var d = document.createElement("DIV");
	for(var i=0; i<options.names.length; i++) {
		var coll = options[options.names[i]];
		
		for (var j=0; j < coll.length; j++) {
			if(typeof d.style[coll[j]] != 'undefined'){
				dhx.env[options.names[i]] = coll[j];
				break;
			}
		}
	}
    d.style[dhx.env.transform] = "translate3d(0,0,0)";
    dhx.env.translate = (d.style[dhx.env.transform])?"translate3d":"translate";

    dhx.env.transformCSSPrefix = (function(){
        var prefix;
        if(dhx.env.isOpera)
            prefix = '-o-';
        else {
            prefix = ''; // default option
            if(dhx.env.isFF)
                prefix = '-Moz-';
            if(dhx.env.isWebKit)
               prefix = '-webkit-';
            if(dhx.env.isIE)
               prefix = '-ms-';
        }
        return prefix;
    })();
    dhx.env.transformPrefix = dhx.env.transformCSSPrefix.replace(/-/gi, "");
    dhx.env.transitionEnd = ((dhx.env.transformCSSPrefix == '-Moz-')?"transitionend":(dhx.env.transformPrefix+"TransitionEnd"));
})();


dhx.env.svg = (function(){
		return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
})();


//html helpers
dhx.html={
	create:function(name,attrs,html){
		attrs = attrs || {};
		var node = document.createElement(name);
		for (var attr_name in attrs)
			node.setAttribute(attr_name, attrs[attr_name]);
		if (attrs.style)
			node.style.cssText = attrs.style;
		if (attrs["class"])
			node.className = attrs["class"];
		if (html)
			node.innerHTML=html;
		return node;
	},
	//return node value, different logic for different html elements
	getValue:function(node){
		node = dhx.toNode(node);
		if (!node) return "";
		return dhx.isNotDefined(node.value)?node.innerHTML:node.value;
	},
	//remove html node, can process an array of nodes at once
	remove:function(node){
		if (node instanceof Array)
			for (var i=0; i < node.length; i++)
				this.remove(node[i]);
		else
			if (node && node.parentNode)
				node.parentNode.removeChild(node);
	},
	//insert new node before sibling, or at the end if sibling doesn't exist
	insertBefore: function(node,before,rescue){
		if (!node) return;
		if (before && before.parentNode)
			before.parentNode.insertBefore(node, before);
		else
			rescue.appendChild(node);
	},
	//return custom ID from html element 
	//will check all parents starting from event's target
	locate:function(e,id){
		if (e.tagName)
			var trg = e;
		else {
			e=e||event;
			var trg=e.target||e.srcElement;
		}
		
		while (trg){
			if (trg.getAttribute){	//text nodes has not getAttribute
				var test = trg.getAttribute(id);
				if (test) return test;
			}
			trg=trg.parentNode;
		}	
		return null;
	},
	//returns position of html element on the page
	offset:function(elem) {
		if (elem.getBoundingClientRect) { //HTML5 method
			var box = elem.getBoundingClientRect();
			var body = document.body;
			var docElem = document.documentElement;
			var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
			var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
			var clientTop = docElem.clientTop || body.clientTop || 0;
			var clientLeft = docElem.clientLeft || body.clientLeft || 0;
			var top  = box.top +  scrollTop - clientTop;
			var left = box.left + scrollLeft - clientLeft;
			return { y: Math.round(top), x: Math.round(left) };
		} else { //fallback to naive approach
			var top=0, left=0;
			while(elem) {
				top = top + parseInt(elem.offsetTop,10);
				left = left + parseInt(elem.offsetLeft,10);
				elem = elem.offsetParent;
			}
			return {y: top, x: left};
		}
	},
	//returns position of event
	pos:function(ev){
		ev = ev || event;
        if(ev.pageX || ev.pageY)	//FF, KHTML
            return {x:ev.pageX, y:ev.pageY};
        //IE
        var d  =  ((dhx.env.isIE)&&(document.compatMode != "BackCompat"))?document.documentElement:document.body;
        return {
                x:ev.clientX + d.scrollLeft - d.clientLeft,
                y:ev.clientY + d.scrollTop  - d.clientTop
        };
	},
	//prevent event action
	preventEvent:function(e){
		if (e && e.preventDefault) e.preventDefault();
		dhx.html.stopEvent(e);
	},
	//stop event bubbling
	stopEvent:function(e){
		(e||event).cancelBubble=true;
		return false;
	},
	//add css class to the node
	addCss:function(node,name){
        node.className+=" "+name;
    },
    //remove css class from the node
    removeCss:function(node,name){
        node.className=node.className.replace(RegExp(" "+name,"g"),"");
    }
};

dhx.ready = function(code){
	if (this._ready) code.call();
	else this._ready_code.push(code);
};
dhx._ready_code = [];

//autodetect codebase folder
(function(){
	var temp = document.getElementsByTagName("SCRIPT");	//current script, most probably
	dhx.assert(temp.length,"Can't locate codebase");
	if (temp.length){
		//full path to script
		temp = (temp[temp.length-1].getAttribute("src")||"").split("/");
		//get folder name
		temp.splice(temp.length-1, 1);
		dhx.codebase = temp.slice(0, temp.length).join("/")+"/";
	}
	dhx.event(window, "load", function(){
		dhx.callEvent("onReady",[]);
		dhx.delay(function(){
			dhx._ready = true;
			for (var i=0; i < dhx._ready_code.length; i++)
				dhx._ready_code[i].call();
			dhx._ready_code=[];
		});
	});
	
})();

dhx.ui={};
dhx.ui.zIndex = function(){
	return dhx.ui._zIndex++;
};
dhx.ui._zIndex = 1;

dhx.assert_core_ready();


dhx.ready(function(){
	dhx.event(document.body,"click", function(e){
		dhx.callEvent("onClick",[e||event]);
	});
});




/* DHX DEPEND FROM FILE 'core/touch.js'*/


/*DHX:Depend core/touch.css*/
/*DHX:Depend core/dhx.js*/

(function(){

var t = dhx.Touch = {
	config:{
		longTouchDelay:1000,
		scrollDelay:150,
		gravity:500,
		deltaStep:30,
		speed:"0ms",
		finish:1500
	},
	disable:function(){
		t._disabled = true;
	},
	enable:function(){
		t._disabled = false;
	},
	_init:function(){
		if (dhx.env.touch){
			dhx.event(document.body,"touchstart",	t._touchstart);
			dhx.event(document.body,"touchmove", 	t._touchmove);
			dhx.event(document.body,"touchend", 		t._touchend);
		}
		else {
			t._get_context = t._get_context_m;
			dhx.event(document.body,"mousedown",		t._touchstart);
			dhx.event(document.body,"mousemove",		t._touchmove);
			dhx.event(document.body,"mouseup",			t._touchend);
			document.body.style.overflowX = document.body.style.overflowY = "hidden";
		}
		dhx.event(document.body,"dragstart",function(e){
			return dhx.html.preventEvent(e);
		});
		dhx.event(document.body,"touchstart",function(e){
			if (t._disabled) return;
			
			//fast click mode for iOS
			//To have working form elements Android must not block event - so there are no fast clicks for Android
            //Selects still don't work with fast clicks
			if (dhx.env.isSafari) {
                if(e.srcElement.tagName=="SELECT")
                    return true;
                return dhx.html.preventEvent(e);
            }
		});
		t._clear_artefacts();
	},
	_clear_artefacts:function(){
		t._start_context = t._current_context = t._prev_context = null;
		t._scroll_mode = t._scroll_node = t._scroll_stat = null;
		//dhx.html.remove(t._scroll);
		//t._scroll = [null, null];
		t._delta = 	{ _x_moment:0, _y_moment:0, _time:0 };

		if (t._css_button_remove){
			dhx.html.removeCss(t._css_button_remove,"dhx_touch");
			t._css_button_remove = null;
		}
		
		window.clearTimeout(t._long_touch_timer);
		t._was_not_moved = true;
		t._axis_x = true;
		t._axis_y = true;
		if (!t._active_transion)
			t._scroll_end();
	},
	_touchend:function(e){ 
		if (t._start_context){
		
			if (!t._scroll_mode){
				if (t._axis_y && !t._axis_x){
					t._translate_event("onSwipeX");
				} else if (t._axis_x && !t._axis_y){
					t._translate_event("onSwipeY");
				} else {
					if (dhx.env.isSafari){ //need to test for mobile ff and blackbery 
						var target = t._start_context.target;
	
						//dark iOS magic, without delay it can skip repainting
						dhx.delay(function(){
							var click_event = document.createEvent('MouseEvents');
							click_event.initEvent('click', true, true);
							target.dispatchEvent(click_event);							
						});
						
					}
				}
			} else {
				
				var temp = t._get_matrix(t._scroll_node);
				var x = temp.e;
				var y = temp.f;
				var finish = t.config.finish;
				
				var	delta = t._get_delta(e, true);
				
				if (delta._time){
					var nx = x + t.config.gravity * delta._x_moment/delta._time;
					var ny = y + t.config.gravity * delta._y_moment/delta._time;
					
					var cnx = t._scroll[0]?t._correct_minmax( nx, false, false, t._scroll_stat.dx, t._scroll_stat.px):x;
					var cny = t._scroll[1]?t._correct_minmax( ny, false, false , t._scroll_stat.dy, t._scroll_stat.py):y;
					
					if (nx != x || ny != y)
						finish = Math.round(finish * Math.max((cnx-x)/(nx-x),(cny-y)/(ny-y)));
					
					var result = { e:cnx, f:cny };
					var view = t._get_event_view("onAfterScroll");
					if (view)
						view.callEvent("onAfterScroll",[result]);
						
					//finish = Math.max(100,(t._fast_correction?100:finish));
					finish = Math.max(100,finish);
						
					if (x != result.e || y!=result.f){
						t._set_matrix(t._scroll_node, result.e, result.f, finish+"ms");
						t._set_scroll(result.e,result.f,finish+"ms");
					} else {
						t._scroll_end();
					}
				} else 
					t._scroll_end();
			}
		
			t._clear_artefacts();
		}
		
		dhx.callEvent("onTouchEnd", [e]);
	},
	_touchmove:function(e){
		if (!t._start_context) return;
		var	delta = t._get_delta(e);
		
		if (t._scroll_mode){
			t._set_scroll_pos(delta);
		} else {
			t._axis_x = t._axis_check(delta._x, "x", t._axis_x);
			t._axis_y = t._axis_check(delta._y, "y", t._axis_y);
			if (t._scroll_mode){
				var view = t._get_event_view("onBeforeScroll");
				if (view){
					var data = {};
					view.callEvent("onBeforeScroll",[data]);
					if (data.update){
						t.config.speed = data.speed;
						t.config.scale = data.scale;
					}
				}
				t._init_scroller(delta); //apply scrolling
			}
		}
		
		return dhx.html.preventEvent(e);
	},
	_set_scroll_pos:function(){
		if (!t._scroll_node) return;
		var temp = t._get_matrix(t._scroll_node);
		var be = temp.e, bf = temp.f;
		var prev = t._prev_context || t._start_context;
		
		if (t._scroll[0])
			temp.e = t._correct_minmax( temp.e - prev.x + t._current_context.x , true, temp.e, t._scroll_stat.dx, t._scroll_stat.px);
		if (t._scroll[1])
			temp.f = t._correct_minmax( temp.f - prev.y + t._current_context.y , true, temp.f, t._scroll_stat.dy, t._scroll_stat.py);

		t._set_matrix(t._scroll_node, temp.e, temp.f, "0ms");
		t._set_scroll(temp.e, temp.f, "0ms");
	},
	_set_scroll:function(dx, dy, speed){
		
		var edx = t._scroll_stat.px/t._scroll_stat.dx * -dx;
		var edy = t._scroll_stat.py/t._scroll_stat.dy * -dy;
		if (t._scroll[0])
			t._set_matrix(t._scroll[0], edx, 0 ,speed);
		if (t._scroll[1])
			t._set_matrix(t._scroll[1], 0, edy ,speed);
	},
	_set_matrix:function(node, xv, yv, speed){
		
		t._active_transion = true;
        node.style[dhx.env.transformPrefix+"Transform"] = dhx.env.translate+"("+Math.round(xv)+"px, "+Math.round(yv)+"px"+((dhx.env.translate=="translate3d")?", 0":"")+")";
		node.style[dhx.env.transformPrefix+"TransitionDuration"] = speed;
	},
	_get_matrix:function(node){
		var matrix = window.getComputedStyle(node)[dhx.env.transformPrefix+'Transform'];
		if (matrix == "none")
			return {e:0, f:0};
		else {
            if(window.WebKitCSSMatrix)
                return new WebKitCSSMatrix(matrix);

            // matrix(1, 0, 0, 1, 0, 0) --> 1, 0, 0, 1, 0, 0
            var _tmatrix = matrix.replace(/(matrix\()(.*)(\))/gi, "$2");
            // 1, 0, 0, 1, 0, 0 --> 1,0,0,1,0,0
            _tmatrix = _tmatrix.replace(/\s/gi, "");
            _tmatrix = _tmatrix.split(',');

            var tmatrix = {};
            var tkey = ['a', 'b', 'c', 'd', 'e', 'f'];
            for(var i=0; i<tkey.length; i++){
                tmatrix[tkey[i]] = parseInt(_tmatrix[i], 10);
            }
            return tmatrix;
        }
	},	
	_correct_minmax:function(value, allow, current, dx, px){
		if (value === current) return value;
		
		var delta = Math.abs(value-current);
		var sign = delta/(value-current);
	//	t._fast_correction = true;
		
		
		if (value>0) return allow?(current + sign*Math.sqrt(delta)):0;
		
		var max = dx - px;
		if (max + value < 0)	
			return allow?(current - Math.sqrt(-(value-current))):-max;
			
	//	t._fast_correction = false;
		return value;
	},	
	_init_scroller:function(delta){
		if (t._scroll_mode.indexOf("x") != -1)
			t._scroll[0] = t._create_scroll("x", t._scroll_stat.dx, t._scroll_stat.px, "width");
		if (t._scroll_mode.indexOf("y") != -1)
			t._scroll[1] = t._create_scroll("y", t._scroll_stat.dy, t._scroll_stat.py, "height");
			
		if (!t._scroll_node.scroll_enabled){
			t._scroll_node.scroll_enabled = true;	
			t._scroll_node.parentNode.style.position="relative";
			var prefix = dhx.env.transformCSSPrefix;
			t._scroll_node.style.cssText += prefix+"transition: "+prefix+"transform; "+prefix+"user-select:none; "+prefix+"transform-style:flat;";
			t._scroll_node.addEventListener(dhx.env.transitionEnd,t._scroll_end,false);
		}
		
		window.setTimeout(t._set_scroll_pos,1);
	},
	_create_scroll:function(mode, dy, py, height){
		if (dy - py <2)
			return t._scroll_mode = "";

		var scroll = dhx.html.create("DIV", {
			"class":"dhx_scroll_"+mode
		},"");
		
		scroll.style[height] = (py*py/dy-7) +"px";
		t._scroll_node.parentNode.appendChild(scroll);
		
		return scroll;
	},
	_axis_check:function(value, mode, old){
		if (value > t.config.deltaStep){
				if (t._was_not_moved){
					t._long_move();
					if ((t._scroll_mode||"").indexOf(mode) == -1) t._scroll_mode = "";
				}
				return false;
		}
		return old;
	},
	_scroll_end:function(){
		if (!t._scroll_mode){
			dhx.html.remove(t._scroll);
			t._scroll = [null, null];
		}
		t._active_transion = false;
	},
	_long_move:function(){
		window.clearTimeout(t._long_touch_timer);
		t._was_not_moved = false;
		t._locate(t._start_context.target, "touch_scroll");
	},	
	_touchstart :function(e){
		if (t._disabled) return;
		
		t._start_context = t._get_context(e);
		t._translate_event("onTouchStart");
	
		if (t._scroll[0] || t._scroll[1]) 
			t._stop_scroll(e);
			
		t._long_touch_timer = window.setTimeout(t._long_touch, t.config.longTouchDelay);
		
		var element = dhx.ui.get(e);
		if (element && element.touchable && (!e.target.className || e.target.className.indexOf("dhx_view")!==0)){
			t._css_button_remove = element.getNode(e);
			dhx.html.addCss(t._css_button_remove,"dhx_touch");
		}
	},
	_long_touch:function(e){
		t._translate_event("onLongTouch");
		dhx.callEvent("onClick", []);
		t._clear_artefacts();
	},
	_stop_scroll:function(e){ 
		t._locate();
		var scroll = t._scroll[0]||t._scroll[1];
		
		if (scroll && (!t._scroll_node || scroll.parentNode != t._scroll_node.parentNode)){
			t._clear_artefacts();
			t._scroll_end();
			t._start_context = t._get_context(e);
		}
		t._touchmove(e);
	},
	_get_delta:function(e, ch){
		t._prev_context = t._current_context;
		t._current_context = t._get_context(e);
			
		t._delta._x = Math.abs(t._start_context.x - t._current_context.x);
		t._delta._y = Math.abs(t._start_context.y - t._current_context.y);
		
		if (t._prev_context){
			if (t._current_context.time - t._prev_context.time < t.config.scrollDelay){
				t._delta._x_moment = t._delta._x_moment/1.3+t._current_context.x - t._prev_context.x;
				t._delta._y_moment = t._delta._y_moment/1.3+t._current_context.y - t._prev_context.y;
			}
			else {
				t._delta._y_moment = t._delta._x_moment = 0;
			}
			t._delta._time = t._delta._time/1.3+(t._current_context.time - t._prev_context.time);
		}
		
		return t._delta;
	},
	_locate:function(){
		var node = t._start_context.target;
		if (!dhx.env.touch && !dhx.env.transition && !dhx.env.transform) return;
		while(node && node.tagName!="BODY"){
			if(node.getAttribute){
				var mode = node.getAttribute("touch_scroll");
				if (mode){
					t._scroll_mode = mode;
					t._scroll_node = node;
					t._scroll_stat = {
						dx:node.offsetWidth,
						dy:node.offsetHeight,
						px:node.parentNode.offsetWidth,
						py:node.parentNode.offsetHeight
					};
					return;
				}
			}
			node = node.parentNode;
		}
	},
	_translate_event:function(name){
		dhx.callEvent(name, [t._start_context,t._current_context]);
		var view = t._get_event_view(name);
		if (view)
			view.callEvent(name, [t._start_context,t._current_context]);
	},
	_get_event_view:function(name){
		var view = dhx.ui.get(t._start_context);
		if(!view) return null;
		
		while (view){
			if (view.hasEvent&&view.hasEvent(name))	
				return view;
			view = view.getParent();
		}
		
		return null;
	},	
	_get_context:function(e){
		if (!e.touches[0]) {
			var temp = t._current_context;
			temp.time = new Date();
			return temp;
		}
			
		return {
			target:e.target,
			x:e.touches[0].pageX,
			y:e.touches[0].pageY,
			time:new Date()
		};
	},
	_get_context_m:function(e){
		return {
			target:e.target,
			x:e.pageX,
			y:e.pageY,
			time:new Date()
		};
	}
};

dhx.TouchEvents={
	_init:function(){
		this.attachEvent("onSwipeX", this._swipe);
		this.attachEvent("onBeforeSelect", this.unSwipe);
		this.attachEvent("onAfterDelete", this.unSwipe);
	},
	_swipe:function(e){
		var id = this.locate(e);
		if (id && id!= this._swipe_id){
			this.unSwipe();
			this.swipe(id);
		}
	},
	swipe:function(id){
		this._swipe_id = id;
		this.item(this._swipe_id).$template="Swipe";
		this.refresh(this._swipe_id);
	},
	unSwipe:function(){
		if (this._swipe_id){
			var node = this.item(this._swipe_id);
			if (node){
				node.$template="";
				this.refresh(this._swipe_id);
			}
			this._swipe_id = null;
		}
	}
};


dhx.ready(function(){
	t._init();
});


})();




/* DHX DEPEND FROM FILE 'core/render/render.js'*/


/*
	Renders collection of items
	Behavior uses plain strategy which suits only for relative small datasets
	
*/
/*DHX:Depend core/dhx.js*/

dhx.RenderStack={
	_init:function(){
		dhx.assert(this.data,"RenderStack :: Component doesn't have DataStore");
        dhx.assert(dhx.Template,"dhx.Template :: dhx.Template is not accessible");

		//used for temporary HTML elements
		//automatically nulified during destruction
		this._html = document.createElement("DIV");
				
		this.data.attachEvent("onIdChange", dhx.bind(this._render_change_id, this));
		this.attachEvent("onItemClick", this._call_onclick);
		
		//create copy of default type, and set it as active one
		if (!this.types){
			this.types = { "default" : this.type };
			this.type.name = "default";
		}
		this.type = dhx.copy(this.types[this.type.name]);	
	},
	
	customize:function(obj){ 
		dhx.Type(this,obj);
	},
	type_setter:function(value){ 
		if(!this.types[value])
			this.customize(value);
		else {
			this.type = dhx.copy(this.types[value]);
			if (this.type.css) 
				this._contentobj.className+=" "+this.type.css;
		}
		return value;
	},
	
	template_setter:function(value){
		this.type.template=dhx.Template(value);
	},
	//convert single item to HTML text (templating)
	_toHTML:function(obj){
			//check if related template exist
			dhx.assert((!obj.$template || this.type["template"+obj.$template]),"RenderStack :: Unknown template: "+obj.$template);
			this.callEvent("onItemRender",[obj]);
			return this.type.templateStart(obj,this.type)+(obj.$template?this.type["template"+obj.$template]:this.type.template)(obj,this.type)+this.type.templateEnd(obj, this.type);
	},
	//convert item to HTML object (templating)
	_toHTMLObject:function(obj){
		this._html.innerHTML = this._toHTML(obj);
		return this._html.firstChild;
	},
	_render_change_id:function(old, newid){
		var obj = this._locateHTML(old);
		if (obj) {
			obj.setAttribute(this._id, newid);
			this._htmlmap[newid] = this._htmlmap[old];
			delete this._htmlmap[old];
		}
	},
	//calls function that is set in onclick property
	_call_onclick:function(){
		if (this._settings.click){
			var code = dhx.toFunctor(this._settings.click);
			if (code && code.call) code.apply(this,arguments);
		}
	},
	//return html container by its ID
	//can return undefined if container doesn't exists
	_locateHTML:function(search_id){
		if (this._htmlmap)
			return this._htmlmap[search_id];
			
		//fill map if it doesn't created yet
		this._htmlmap={};
		
		var t = this._dataobj.childNodes;
		for (var i=0; i < t.length; i++){
			var id = t[i].getAttribute(this._id); //get item's
			if (id) 
				this._htmlmap[id]=t[i];
		}
		//call locator again, when map is filled
		return this._locateHTML(search_id);
	},
	//return id of item from html event
	locate:function(e){ return dhx.html.locate(e,this._id); },
	/*change scrolling state of top level container, so related item will be in visible part*/
	showItem:function(id){
		var html = this._locateHTML(id);
		if (html&&this.scrollTo){
			var x = this._dataobj.scrollWidth-this._dataobj.parentNode.offsetWidth;
			x = Math.abs(html.offsetLeft-this._dataobj.offsetLeft);
			var y = this._dataobj.scrollHeight-this._dataobj.parentNode.offsetHeight;
			y = Math.abs(html.offsetTop-this._dataobj.offsetTop);

			this.scrollTo(x,y);
			if(this._setItemActive)
				this._setItemActive(id);
		}
	},
	//update view after data update
	//method calls low-level rendering for related items
	//when called without parameters - all view refreshed
	render:function(id,data,type){
		if (!this.isVisible(this._settings.id))
			return;
		
		if (dhx.debug_render)
			dhx.log("Render: "+this.name+"@"+this._settings.id+", mode:"+(type||"#")+", item:"+(id||"#"));
			
		if (id){
			var cont = this._locateHTML(id); //get html element of updated item
			switch(type){
				case "update":
					//in case of update - replace existing html with updated one
					if (!cont) return;
					var t = this._htmlmap[id] = this._toHTMLObject(data);
					dhx.html.insertBefore(t, cont); 
					dhx.html.remove(cont);
					break;
				case "delete":
					//in case of delete - remove related html
					if (!cont) return;
					dhx.html.remove(cont);
					delete this._htmlmap[id];
					break;
				case "add":
					//in case of add - put new html at necessary position
					var t = this._htmlmap[id] = this._toHTMLObject(data);
					dhx.html.insertBefore(t, this._locateHTML(this.data.next(id)), this._dataobj);
					break;
				case "move":
					//in case of move , simulate add - delete sequence
					//it will affect only rendering 
					this.render(id,data,"delete");
					this.render(id,data,"add");
					break;
				default:
					dhx.error("Unknown render command: "+type);
					break;
			}
		} else {
			//full reset
			if (this.callEvent("onBeforeRender",[this.data])){
				//getRange - returns all elements
				(this._renderobj||this._dataobj).innerHTML = this.data.getRange().map(this._toHTML,this).join("");
				this._htmlmap = null; //clear map, it will be filled at first _locateHTML
				this.callEvent("onAfterRender",[]);
			}
		}
	}
};




/* DHX DEPEND FROM FILE 'core/render/virtual_render.js'*/


/*
	Renders collection of items
	Always shows y-scroll
	Can be used with huge datasets
	
	@export
		show
		render
*/

/*DHX:Depend core/render/render.js*/ 

dhx.VirtualRenderStack={
	_init:function(){
		dhx.assert(this.render,"VirtualRenderStack :: Object must use RenderStack first");
        	
        this._htmlmap={}; //init map of rendered elements
        //in this mode y-scroll is always visible
        //it simplifies calculations a lot
        this._dataobj.style.overflowY="scroll";
        
        //we need to repaint area each time when view resized or scrolling state is changed
        dhx.event(this._dataobj,"scroll",dhx.bind(this._render_visible_rows,this));
        dhx.event(window,"resize",dhx.bind(function(){ this.render(); },this));

		//here we store IDs of elemenst which doesn't loadede yet, but need to be rendered
		this._unrendered_area=[];
        this.attachEvent("onItemRender",function(obj){ 			//each time, during item rendering
        	if (obj.$template == "loading")						//if real data is not loaded yet
        		this._unrendered_area.push(this.data.id(obj));	//store item ID for later loading
	    });
	},
	//return html object by item's ID. Can return null for not-rendering element
	_locateHTML:function(search_id){
		//collection was filled in _render_visible_rows
		return this._htmlmap[search_id];
	},
	//adjust scrolls to make item visible
	show:function(id){
		var range = this._getVisibleRange();
		var ind = this.data.indexById(id);
		//we can't use DOM method for not-rendered-yet items, so fallback to pure math
		var dy = Math.floor(ind/range._dx)*range._y;
		this._dataobj.scrollTop = dy;
	},	
	//repain self after changes in DOM
	//for add, delete, move operations - render is delayed, to minify performance impact
	render:function(id,data,type){
		if (dhx.debug_render)
			dhx.log("Render: "+this.name+"@"+this._settings.id);
			
		if (id){
			var cont = this._locateHTML(id);	//old html element
			switch(type){
				case "update":
					if (!cont) return;
					//replace old with new
					var t = this._htmlmap[id] = this._toHTMLObject(data);
					dhx.html.insertBefore(t, cont); 
					dhx.html.remove(cont);
					break;
				default: // "move", "add", "delete"
					/*
						for all above operations, full repainting is necessary
						but from practical point of view, we need only one repainting per thread
						code below initiates double-thread-rendering trick
					*/
					this._render_delayed();
					break;
			}
		} else {
			//full repainting
			if (this.callEvent("onBeforeRender",[this.data])){
				this._htmlmap = {}; 					//nulify links to already rendered elements
				this._render_visible_rows(null, true);	
				// clear delayed-rendering, because we already have repaint view
				this._wait_for_render = false;			
				this.callEvent("onAfterRender",[]);
			}
		}
	},
	//implement double-thread-rendering pattern
	_render_delayed:function(){
		//this flag can be reset from outside, to prevent actual rendering 
		if (this._wait_for_render) return;
		this._wait_for_render = true;	
		
		window.setTimeout(dhx.bind(function(){
			this.render();
		},this),1);
	},
	//create empty placeholders, which will take space before rendering
	_create_placeholder:function(height){
		var node = document.createElement("DIV");
			node.style.cssText = "height:"+height+"px; width:100%; overflow:hidden;";
		return node;
	},
	/*
		Methods get coordinatest of visible area and checks that all related items are rendered
		If, during rendering, some not-loaded items was detected - extra data loading is initiated.
		reset - flag, which forces clearing of previously rendered elements
	*/
	_render_visible_rows:function(e,reset){
		this._unrendered_area=[]; //clear results of previous calls
		
		var viewport = this._getVisibleRange();	//details of visible view
		if (!this._dataobj.firstChild || reset){	//create initial placeholder - for all view space
			this._dataobj.innerHTML="";
			this._dataobj.appendChild(this._create_placeholder(viewport._max));
			//register placeholder in collection
			this._htmlrows = [this._dataobj.firstChild];
		}
		
		/*
			virtual rendering breaks all view on rows, because we know widht of item
			we can calculate how much items can be placed on single row, and knowledge 
			of that, allows to calculate count of such rows
			
			each time after scrolling, code iterate through visible rows and render items 
			in them, if they are not rendered yet
			
			both rendered rows and placeholders are registered in _htmlrows collection
		*/

		//position of first visible row
		var t = viewport._from;
			
		while(t<=viewport._height){	//loop for all visible rows
			//skip already rendered rows
			while(this._htmlrows[t] && this._htmlrows[t]._filled && t<=viewport._height){
				t++; 
			}
			//go out if all is rendered
			if (t>viewport._height) break;
			
			//locate nearest placeholder
			var holder = t;
			while (!this._htmlrows[holder]) holder--;
			var holder_row = this._htmlrows[holder];
			
			//render elements in the row			
			var base = t*viewport._dx+(this.data.min||0);	//index of rendered item
			if (base > (this.data.max||Infinity)) break;	//check that row is in virtual bounds, defined by paging
			var nextpoint =  Math.min(base+viewport._dx-1,(this.data.max||Infinity));
			var node = this._create_placeholder(viewport._y);
			//all items in rendered row
			var range = this.data.getIndexRange(base, nextpoint);
			if (!range.length) break; 
			
			node.innerHTML=range.map(this._toHTML,this).join(""); 	//actual rendering
			for (var i=0; i < range.length; i++)					//register all new elements for later usage in _locateHTML
				this._htmlmap[this.data.idByIndex(base+i)]=node.childNodes[i];
			
			//correct placeholders
			var h = parseInt(holder_row.style.height,10);
			var delta = (t-holder)*viewport._y;
			var delta2 = (h-delta-viewport._y);
			
			//add new row to the DOOM
			dhx.html.insertBefore(node,delta?holder_row.nextSibling:holder_row,this._dataobj);
			this._htmlrows[t]=node;
			node._filled = true;
			
			/*
				if new row is at start of placeholder - decrease placeholder's height
				else if new row takes whole placeholder - remove placeholder from DOM
				else 
					we are inserting row in the middle of existing placeholder
					decrease height of existing one, and add one more, 
					before the newly added row
			*/
			if (delta <= 0 && delta2>0){
				holder_row.style.height = delta2+"px";
				this._htmlrows[t+1] = holder_row;
			} else {
				if (delta<0)
					dhx.html.remove(holder_row);
				else
					holder_row.style.height = delta+"px";
				if (delta2>0){ 
					var new_space = this._htmlrows[t+1] = this._create_placeholder(delta2);
					dhx.html.insertBefore(new_space,node.nextSibling,this._dataobj);
				}
			}
			
			
			t++;
		}
		
		//when all done, check for non-loaded items
		if (this._unrendered_area.length){
			//we have some data to load
			//detect borders
			var from = this.indexById(this._unrendered_area[0]);
			var to = this.indexById(this._unrendered_area.pop())+1;
			if (to>from){
				//initiate data loading
				if (!this.callEvent("onDataRequest",[from, to-from])) return false;
				dhx.assert(this.data.feed,"Data feed is missed");
				this.data.feed.call(this,from,to-from);
			}
		}
	},
	//calculates visible view
	_getVisibleRange:function(){
		var top = this._dataobj.scrollTop;
		var width = Math.max(this._dataobj.scrollWidth,this._dataobj.offsetWidth)-18; 	// opera returns zero scrollwidth for the empty object
		var height = this._dataobj.offsetHeight;									// 18 - scroll
		//size of single item
		var t = this.type;
		var dim = this._getDimension();

		var dx = Math.floor(width/dim.x)||1; //at least single item per row
		
		var min = Math.floor(top/dim.y);				//index of first visible row
		var dy = Math.ceil((height+top)/dim.y)-1;		//index of last visible row
		//total count of items, paging can affect this math
		var count = this.data.max?(this.data.max-this.data.min):this.data.dataCount();
		var max = Math.ceil(count/dx)*dim.y;			//size of view in rows
		
		return { _from:min, _height:dy, _top:top, _max:max, _y:dim.y, _dx:dx};
	}
};


/* DHX DEPEND FROM FILE 'core/selection.js'*/


/*
	Behavior:SelectionModel - manage selection states
	@export
		select
		unselect
		selectAll
		unselectAll
		isSelected
		getSelected
*/
dhx.SelectionModel={
	_init:function(){
		//collection of selected IDs
		this._selected = dhx.toArray();
		dhx.assert(this.data, "SelectionModel :: Component doesn't have DataStore");
         	
		//remove selection from deleted items
		this.data.attachEvent("onStoreUpdated",dhx.bind(this._data_updated,this));
		this.data.attachEvent("onStoreLoad", dhx.bind(this._data_loaded,this));
		this.data.attachEvent("onAfterFilter", dhx.bind(this._data_filtered,this));
	},
	_data_filtered:function(){
		for (var i = this._selected.length - 1; i >= 0; i--){
			if (this.data.indexById(this._selected[i]) < 0)
				var id = this._selected[i];
				var item = this.item(id);
				if (item)
					delete item.$selected;
				this._selected.splice(i,1);
				this.callEvent("onSelectChange",[id]);
		}	
	},
	//helper - linked to onStoreUpdated
	_data_updated:function(id,obj,type){
		if (type == "delete")				//remove selection from deleted items
			this._selected.remove(id);
		else if (!this.data.dataCount() && !this.data._filter_order){	//remove selection for clearAll
			this._selected = dhx.toArray();
		}
	},
	_data_loaded:function(){
		if (this._settings.select)
			this.data.each(function(obj){
				if (obj.$selected) this.select(obj.id);
			}, this);
	},
	//helper - changes state of selection for some item
	_select_mark:function(id,state,refresh){
		if (!refresh && !this.callEvent("onBeforeSelect",[id,state])) return false;
		
		this.data.item(id).$selected=state;	//set custom mark on item
		if (refresh)
			refresh.push(id);				//if we in the mass-select mode - collect all changed IDs
		else{
			if (state)
				this._selected.push(id);		//then add to list of selected items
		else
				this._selected.remove(id);
			this._refresh_selection(id);	//othervise trigger repainting
		}
			
		return true;
	},
	//select some item
	select:function(id,non_modal,continue_old){
		//if id not provide - works as selectAll
		if (!id) return this.selectAll();

		//allow an array of ids as parameter
		if (id instanceof Array){
			for (var i=0; i < id.length; i++)
				this.select(id[i], non_modal, continue_old);
			return;
		}

		if (!this.data.exists(id)){
			dhx.error("Incorrect id in select command: "+id);
			return;
		}
		
		//block selection mode
		if (continue_old && this._selected.length)
			return this.selectAll(this._selected[this._selected.length-1],id);
		//single selection mode
		if (!non_modal && (this._selected.length!=1 || this._selected[0]!=id)){
			this._silent_selection = true; //prevent unnecessary onSelectChange event
			this.unselectAll();
			this._silent_selection = false;
		}
		if (this.isSelected(id)){
			if (non_modal) this.unselect(id);	//ctrl-selection of already selected item
			return;
		}
		
		if (this._select_mark(id,true)){	//if not blocked from event
			this.callEvent("onAfterSelect",[id]);
		}
	},
	//unselect some item
	unselect:function(id){
		//if id is not provided  - unselect all items
		if (!id) return this.unselectAll();
		if (!this.isSelected(id)) return;
		
		this._select_mark(id,false);
	},
	//select all items, or all in defined range
	selectAll:function(from,to){
		var range;
		var refresh=[];
		
		if (from||to)
			range = this.data.getRange(from||null,to||null);	//get limited set if bounds defined
		else
			range = this.data.getRange();			//get all items in other case
												//in case of paging - it will be current page only
		range.each(function(obj){ 
			var d = this.data.item(obj.id);
			if (!d.$selected){	
				this._selected.push(obj.id);	
				this._select_mark(obj.id,true,refresh);
			}
			return obj.id; 
		},this);
		//repaint self
		this._refresh_selection(refresh);
	},
	//remove selection from all items
	unselectAll:function(){
		var refresh=[];
		
		this._selected.each(function(id){
			this._select_mark(id,false,refresh);	//unmark selected only
		},this);
		
		this._selected=dhx.toArray();
		this._refresh_selection(refresh);	//repaint self
	},
	//returns true if item is selected
	isSelected:function(id){
		return this._selected.find(id)!=-1;
	},
	/*
		returns ID of selected items or array of IDs
		to make result predictable - as_array can be used, 
			with such flag command will always return an array 
			empty array in case when no item was selected
	*/
	getSelected:function(as_array){	
		switch(this._selected.length){
			case 0: return as_array?[]:"";
			case 1: return as_array?[this._selected[0]]:this._selected[0];
			default: return ([].concat(this._selected)); //isolation
		}
	},
	//detects which repainting mode need to be used
	_is_mass_selection:function(obj){
		 // crappy heuristic, but will do the job
		return obj.length>100 || obj.length > this.data.dataCount/2;
	},
	_refresh_selection:function(refresh){
		if (typeof refresh != "object") refresh = [refresh];
		if (!refresh.length) return;	//nothing to repaint
		
		if (this._is_mass_selection(refresh))	
			this.data.refresh();	//many items was selected - repaint whole view
		else
			for (var i=0; i < refresh.length; i++)	//repaint only selected
				this.render(refresh[i],this.data.item(refresh[i]),"update");
			
		if (!this._silent_selection)	
		this.callEvent("onSelectChange",[refresh]);
	}
};


/* DHX DEPEND FROM FILE 'core/edit.js'*/


/*
	Behavior:EditAbility - enables item operation for the items
	
	@export
		edit
		stopEdit
*/

/*DHX:Depend core/dhx.js*/

dhx.EditAbility={
	_init: function(id){
		this._edit_id = null;		//id of active item 
		this._edit_bind = null;		//array of input-to-property bindings

		dhx.assert(this.data,"EditAbility :: Component doesn't have DataStore");
		dhx.assert(this._locateHTML,"EditAbility :: Component doesn't have RenderStack");
				
		this.attachEvent("onEditKeyPress",function(code, ctrl, shift){
			if (code == 13 && !shift)
				this.stopEdit();
			else if (code == 27) 
				this.stopEdit(true);
		});
		this.attachEvent("onBeforeRender", function(){
			this.stopEdit();
		});
		this.data.attachEvent("onClearAll", dhx.bind(function(){
			this._edit_bind=this._edit_id=null;
		}, this));
    	
	},
	//returns id of item in edit state, or null if none
	isEdit:function(){
		return this._edit_id;
	},
	//switch item to the edit state
	edit:function(id){
		//edit operation can be blocked from editStop - when previously active editor can't be closed			
		if (this.stopEdit(false, id)){
			if (!this.callEvent("onBeforeEditStart",[id])) 
				return;			
			var data = this.data.item(id);			
			//object with custom template is not editable
			if (data.$template) return;
			
			//item must have have "edit" template
 			data.$template="Edit";	
			this.data.refresh(id);
			this._edit_id = id;
			
			//parse templates and save input-property mapping
			this._save_binding(id);
			this._edit_bind(true,data);	//fill inputs with data
			
			this.callEvent("onAfterEditStart",[id]);	
		}
	},
	//close currently active editor
	stopEdit:function(mode, if_not_id){
		if (!this._edit_id) return true;
		if (this._edit_id == if_not_id) return false;
		if (!this.callEvent("onBeforeEditStop",[this._edit_id]))
			return false;

		var data=this.data.item(this._edit_id);
		data.$template=null;	//set default template

		//load data from inputs
		//if mode is set - close editor without saving
		if (!mode) this._edit_bind(false,data);
		var id = this._edit_id;
		this._edit_bind=this._edit_id=null;

		this.data.refresh(id);

		this.callEvent("onAfterEditStop",[id]);
		return true;
	},
	//parse template and save inputs which need to be mapped to the properties
	_save_binding:function(id){
		var cont = this._locateHTML(id);
		var code = "";			//code of prop-to-inp method
		var back_code = "";		//code of inp-to-prop method
		var bind_elements = [];	//binded inputs
		if (cont){
			var elements = cont.getElementsByTagName("*");		//all sub-tags
			var bind = "";
			for (var i=0; i < elements.length; i++) {
				if(elements[i].nodeType==1 && (bind = elements[i].getAttribute("bind"))){	//if bind present
					//code for element accessing 
					code+="els["+bind_elements.length+"].value="+bind+";";
					back_code+=bind+"=els["+bind_elements.length+"].value;";
					bind_elements.push(elements[i]);
					//clear block-selection for the input
					elements[i].className+=" dhx_allow_selection";
					elements[i].onselectstart=this._block_native;
				}
			}
			elements = null;
		}
		//create accessing methods, for later usage
		code = Function("obj","els",code);
		back_code = Function("obj","els",back_code);
		this._edit_bind = function(mode,obj){
			if (mode){	//property to input
				code(obj,bind_elements);	
				if (bind_elements.length && bind_elements[0].select) //focust first html input, if possible
					bind_elements[0].select();						 
			}
			else 		//input to propery
				back_code(obj,bind_elements);
		};
	},
	//helper - blocks event bubbling, used to stop click event on editor level
	_block_native:function(e){ (e||event).cancelBubble=true; return true; }
};


/* DHX DEPEND FROM FILE 'core/key.js'*/


/*
	Behavior:KeyEvents - hears keyboard 
*/
dhx.keyPressTimeout = 200;
dhx.KeyEvents = {
	_init:function(){
		//attach handler to the main container
		dhx.event(this._contentobj,"keyup",this._onKeyPress,this);
	},
	//called on each key press , when focus is inside of related component
	_onKeyPress:function(e){
		e=e||event;
		var code = e.which||e.keyCode; //FIXME  better solution is required
		this.callEvent((this._edit_id?"onEditKeyPress":"onKeyPress"),[code,e.ctrlKey,e.shiftKey,e]);
	
		if (dhx._keyPressTimeout)
			window.clearTimeout(dhx._keyPressTimeout);
		dhx._keyPressTimeout = window.setTimeout(dhx.bind(this._onKeyPressTimed, this), dhx.keyPressTimeout);
	},
	_onKeyPressTimed:function(){
		this.callEvent("onTimedKeyPress",[]);
	}
};


/* DHX DEPEND FROM FILE 'core/mouse.js'*/


/*
	Behavior:MouseEvents - provides inner evnets for  mouse actions
*/
/*DHX:Depend core/dhx.js*/
dhx.MouseEvents={
	_init: function(){
		//attach dom events if related collection is defined
		if (this.on_click)
			dhx.event(this._contentobj,"click",this._onClick,this);
		if (this.on_context)
			dhx.event(this._contentobj,"contextmenu",this._onContext,this);
		
		if (this.on_dblclick)
			dhx.event(this._contentobj,"dblclick",this._onDblClick,this);
		if (this.on_mouse_move){
			dhx.event(this._contentobj,"mousemove",this._onMouse,this);
			dhx.event(this._contentobj,(dhx.env.isIE?"mouseleave":"mouseout"),this._onMouse,this);
		}

	},
	//inner onclick object handler
	_onClick: function(e) {
		return this._mouseEvent(e,this.on_click,"ItemClick");
	},
	//inner ondblclick object handler
	_onDblClick: function(e) {
		return this._mouseEvent(e,this.on_dblclick,"ItemDblClick");
	},
	//process oncontextmenu events
	_onContext: function(e) {
		if (this._mouseEvent(e, this.on_context, "BeforeContextMenu")){
			this._mouseEvent(e, {}, "AfterContextMenu");
			return dhx.html.preventEvent(e);
		}
	},
	/*
		event throttler - ignore events which occurs too fast
		during mouse moving there are a lot of event firing - we need no so much
		also, mouseout can fire when moving inside the same html container - we need to ignore such fake calls
	*/
	_onMouse:function(e){
		if (dhx.env.isIE)	//make a copy of event, will be used in timed call
			e = document.createEventObject(event);
			
		if (this._mouse_move_timer)	//clear old event timer
			window.clearTimeout(this._mouse_move_timer);
				
		//this event just inform about moving operation, we don't care about details
		this.callEvent("onMouseMoving",[e]);
		//set new event timer
		this._mouse_move_timer = window.setTimeout(dhx.bind(function(){
			//called only when we have at least 100ms after previous event
			if (e.type == "mousemove")
				this._onMouseMove(e);
			else
				this._onMouseOut(e);
		},this),500);
	},

	//inner mousemove object handler
	_onMouseMove: function(e) {
		if (!this._mouseEvent(e,this.on_mouse_move,"MouseMove"))
			this.callEvent("onMouseOut",[e||event]);
	},
	//inner mouseout object handler
	_onMouseOut: function(e) {
		this.callEvent("onMouseOut",[e||event]);
	},
	//common logic for click and dbl-click processing
	_mouseEvent:function(e,hash,name){
		e=e||event;
		var trg=e.target||e.srcElement;
		var css = "";
		var id = null;
		var found = false;
		//loop through all parents
		while (trg && trg.parentNode){
			if (!found && trg.getAttribute){													//if element with ID mark is not detected yet
				id = trg.getAttribute(this._id);							//check id of current one
				if (id){
					if (trg.getAttribute("userdata"))
						this.callEvent("onLocateData",[id,trg]);
					if (!this.callEvent("on"+name,[id,e,trg])) return;		//it will be triggered only for first detected ID, in case of nested elements
					found = true;											//set found flag
				}
			}
			css=trg.className;
			if (css){		//check if pre-defined reaction for element's css name exists
				css = css.split(" ");
				css = css[0]||css[1]; //FIXME:bad solution, workaround css classes which are starting from whitespace
				if (hash[css]){
					var res =  hash[css].call(this,e,id||dhx.html.locate(e, this._id),trg);
					if(typeof res!="undefined"&&res!==true)
					return;
				}
			}
			trg=trg.parentNode;
		}		
		return found;	//returns true if item was located and event was triggered
	}
};


/* DHX DEPEND FROM FILE 'core/move.js'*/


/*
	Behavior:DataMove - allows to move and copy elements, heavily relays on DataStore.move
	@export
		copy
		move
*/
dhx.DataMove={
	_init:function(){
		dhx.assert(this.data, "DataMove :: Component doesn't have DataStore");
	},
	//creates a copy of the item
	copy:function(sid,tindex,tobj,tid){
		var data = this.item(sid);
		if (!data){
			dhx.log("Warning","Incorrect ID in DataMove::copy");
			return;
		}
		
		//make data conversion between objects
		if (tobj){
			dhx.assert(tobj.externalData,"DataMove :: External object doesn't support operation");	
			data = tobj.externalData(data);
		}
		tobj = tobj||this;
		//adds new element same as original
		return tobj.add(tobj.externalData(data,tid),tindex);
	},
	//move item to the new position
	move:function(sid,tindex,tobj,tid){
		//can process an arrya - it allows to use it from onDrag 
		if (sid instanceof Array){
			for (var i=0; i < sid.length; i++) {
				//increase index for each next item in the set, so order of insertion will be equal to order in the array
				var new_index = (tobj||this).indexById(this.move(sid[i], tindex, tobj, (tid?tid[i]:null)));
				if (sid[i+1])
					tindex = new_index+(this.indexById(sid[i+1])<new_index?0:1);
				
			}
			return;
		}
		
		var nid = sid; //id after moving
		if (tindex<0){
			dhx.log("Info","DataMove::move - moving outside of bounds is ignored");
			return;
		}
		
		var data = this.item(sid);
		if (!data){
			dhx.log("Warning","Incorrect ID in DataMove::move");
			return;
		}
		
		if (!tobj || tobj == this)
			this.data.move(this.indexById(sid),tindex);	//move inside the same object
		else {
			dhx.assert(tobj.externalData, "DataMove :: External object doesn't support operation");
			//copy to the new object
			if (!tid || tobj.item(tid)) tid = dhx.uid();
			nid=tobj.add(tobj.externalData(data,tid),tindex);
			this.remove(sid);//delete in old object
		}
		return nid;	//return ID of item after moving
	},
	//move item on one position up
	moveUp:function(id,step){
		return this.move(id,this.indexById(id)-(step||1));
	},
	//move item on one position down
	moveDown:function(id,step){
		return this.moveUp(id, (step||1)*-1);
	},
	//move item to the first position
	moveTop:function(id){
		return this.move(id,0);
	},
	//move item to the last position
	moveBottom:function(id){
		return this.move(id,this.data.dataCount()-1);
	},
	/*
		this is a stub for future functionality
		currently it just makes a copy of data object, which is enough for current situation
	*/
	externalData:function(data,id){
		//FIXME - will not work for multi-level data
		var newdata = dhx.extend({},data);
		newdata.id = id||dhx.uid();
		
		newdata.$selected=newdata.$template=null;
		return newdata;
	}
};


/* DHX DEPEND FROM FILE 'core/dnd.js'*/


/*
	Behavior:DND - low-level dnd handling
	@export
		getContext
		addDrop
		addDrag
		
	DND master can define next handlers
		onCreateDrag
		onDragIng
		onDragOut
		onDrag
		onDrop
	all are optional
*/

/*DHX:Depend core/dhx.js*/

dhx.DragControl={
	//has of known dnd masters
	_drag_masters : dhx.toArray(["dummy"]),
	/*
		register drop area
		@param node 			html node or ID
		@param ctrl 			options dnd master
		@param master_mode 		true if you have complex drag-area rules
	*/
	addDrop:function(node,ctrl,master_mode){
		node = dhx.toNode(node);
		node.dhx_drop=this._getCtrl(ctrl);
		if (master_mode) node.dhx_master=true;
	},
	//return index of master in collection
	//it done in such way to prevent dnd master duplication
	//probably useless, used only by addDrop and addDrag methods
	_getCtrl:function(ctrl){
		ctrl = ctrl||dhx.DragControl;
		var index = this._drag_masters.find(ctrl);
		if (index<0){
			index = this._drag_masters.length;
			this._drag_masters.push(ctrl);
		}
		return index;
	},
	/*
		register drag area
		@param node 	html node or ID
		@param ctrl 	options dnd master
	*/
	addDrag:function(node,ctrl){
	    node = dhx.toNode(node);
	    node.dhx_drag=this._getCtrl(ctrl);
		dhx.event(node,"mousedown",this._preStart,node);
	},
	//logic of drag - start, we are not creating drag immediately, instead of that we hears mouse moving
	_preStart:function(e){
		if (dhx.DragControl._active){
			dhx.DragControl._preStartFalse();
			dhx.DragControl.destroyDrag();
		}
		dhx.DragControl._active=this;
		dhx.DragControl._dhx_drag_mm = dhx.event(document.body,"mousemove",dhx.DragControl._startDrag);
		dhx.DragControl._dhx_drag_mu = dhx.event(document.body,"mouseup",dhx.DragControl._preStartFalse);
		
		e.cancelBubble=true;
		return false;
	},
	//if mouse was released before moving - this is not a dnd, remove event handlers
	_preStartFalse:function(e){
		dhx.DragControl._dhx_drag_mm = dhx.eventRemove(dhx.DragControl._dhx_drag_mm);
		dhx.DragControl._dhx_drag_mu = dhx.eventRemove(dhx.DragControl._dhx_drag_mu);
	},
	//mouse was moved without button released - dnd started, update event handlers
	_startDrag:function(e){
		dhx.DragControl._preStartFalse();
		if (!dhx.DragControl.createDrag(e)) return;
		
		dhx.DragControl.sendSignal("start"); //useless for now
		dhx.DragControl._dhx_drag_mm = dhx.event(document.body,"mousemove",dhx.DragControl._moveDrag);
		dhx.DragControl._dhx_drag_mu = dhx.event(document.body,"mouseup",dhx.DragControl._stopDrag);
		dhx.DragControl._moveDrag(e);
	},
	//mouse was released while dnd is active - process target
	_stopDrag:function(e){
		dhx.DragControl._dhx_drag_mm = dhx.eventRemove(dhx.DragControl._dhx_drag_mm);
		dhx.DragControl._dhx_drag_mu = dhx.eventRemove(dhx.DragControl._dhx_drag_mu);
		if (dhx.DragControl._last){	//if some drop target was confirmed
			dhx.DragControl.onDrop(dhx.DragControl._active,dhx.DragControl._last,this._landing,e);
			dhx.DragControl.onDragOut(dhx.DragControl._active,dhx.DragControl._last,null,e);
		}
		dhx.DragControl.destroyDrag();
		dhx.DragControl.sendSignal("stop");	//useless for now
	},
	//dnd is active and mouse position was changed
	_moveDrag:function(e){
		var pos = dhx.html.pos(e);
		//adjust drag marker position
		dhx.DragControl._html.style.top=pos.y+dhx.DragControl.top +"px";
		dhx.DragControl._html.style.left=pos.x+dhx.DragControl.left+"px";
		
		if (dhx.DragControl._skip)
			dhx.DragControl._skip=false;
		else
			dhx.DragControl._checkLand((e.srcElement||e.target),e);
		
		e.cancelBubble=true;
		return false;		
	},
	//check if item under mouse can be used as drop landing
	_checkLand:function(node,e){ 
		while (node && node.tagName!="BODY"){
			if (node.dhx_drop){	//if drop area registered
				if (this._last && (this._last!=node || node.dhx_master))	//if this area with complex dnd master
					this.onDragOut(this._active,this._last,node,e);			//inform master about possible mouse-out
				if (!this._last || this._last!=node || node.dhx_master){	//if this is new are or area with complex dnd master
				    this._last=null;										//inform master about possible mouse-in
					this._landing=this.onDragIn(dhx.DragControl._active,node,e);
					if (this._landing)	//landing was rejected
						this._last=node;
					return;				
				} 
				return;
			}
			node=node.parentNode;
		}
		if (this._last)	//mouse was moved out of previous landing, and without finding new one 
			this._last = this._landing = this.onDragOut(this._active,this._last,null,e);
	},
	//mostly useless for now, can be used to add cross-frame dnd
	sendSignal:function(signal){
		dhx.DragControl.active=(signal=="start");
	},
	
	//return master for html area
	getMaster:function(t){
		return this._drag_masters[t.dhx_drag||t.dhx_drop];
	},
	//return dhd-context object
	getContext:function(){
		return this._drag_context;
	},
	getNode:function(){
		return this._html;
	},
	//called when dnd is initiated, must create drag representation
	createDrag:function(e){ 
		var a=dhx.DragControl._active;
		dhx.DragControl._drag_context = {};
		var master = this._drag_masters[a.dhx_drag];
		var drag_container;
		
		//if custom method is defined - use it
		if (master.onDragCreate){
			drag_container=master.onDragCreate(a,e);
			if (!drag_container) return false;
			drag_container.style.position='absolute';
			drag_container.style.zIndex=dhx.ui.zIndex();
		} else {
		//overvise use default one
			var text = dhx.DragControl.onDrag(a,e);
			if (!text) return false;
			var drag_container = document.createElement("DIV");
			drag_container.innerHTML=text;
			drag_container.className="dhx_drag_zone";
			document.body.appendChild(drag_container);
		}
		drag_container.onmousemove=dhx.DragControl._skip_mark;
		if (!dhx.DragControl._drag_context.from)
			dhx.DragControl._drag_context = {source:a, from:a};
		dhx.DragControl._html=drag_container;
		return true;
	},
	//helper, prevents unwanted mouse-out events
	_skip_mark:function(){
		dhx.DragControl._skip=true;
	},
	//after dnd end, remove all traces and used html elements
	destroyDrag:function(){
		var a=dhx.DragControl._active;
		var master = this._drag_masters[a.dhx_drag];
		
		if (master && master.onDragDestroy)
			master.onDragDestroy(a,dhx.DragControl._html);
		else dhx.html.remove(dhx.DragControl._html);
		
		dhx.DragControl._landing=dhx.DragControl._active=dhx.DragControl._last=dhx.DragControl._html=null;
	},
	top:5,	 //relative position of drag marker to mouse cursor
	left:5,
	//called when mouse was moved in drop area
	onDragIn:function(s,t,e){
		var m=this._drag_masters[t.dhx_drop];
		if (m.onDragIn && m!=this) return m.onDragIn(s,t,e);
		t.className=t.className+" dhx_drop_zone";
		return t;
	},
	//called when mouse was moved out drop area
	onDragOut:function(s,t,n,e){
		var m=this._drag_masters[t.dhx_drop];
		if (m.onDragOut && m!=this) return m.onDragOut(s,t,n,e);
		t.className=t.className.replace("dhx_drop_zone","");
		return null;
	},
	//called when mouse was released over drop area
	onDrop:function(s,t,d,e){
		var m=this._drag_masters[t.dhx_drop];
		dhx.DragControl._drag_context.from = dhx.DragControl.getMaster(s);
		if (m.onDrop && m!=this) return m.onDrop(s,t,d,e);
		t.appendChild(s);
	},
	//called when dnd just started
	onDrag:function(s,e){
		var m=this._drag_masters[s.dhx_drag];
		if (m.onDrag && m!=this) return m.onDrag(s,e);
		return "<div style='"+s.style.cssText+"'>"+s.innerHTML+"</div>";
	}	
};


/* DHX DEPEND FROM FILE 'core/movable.js'*/


/*DHX:Depend core/dnd.js*/
/*DHX:Depend core/move.js*/
/*DHX:Depend core/dhx.js*/

dhx.Movable = {
	move_setter: function (value) { 
		if (value){
			this._move_admin = dhx.copy(this._move_admin);
			this._move_admin.master = this;
				
			dhx.DragControl.addDrag(this._headobj, this._move_admin);
		}
	},
	_move_admin: {
		onDragCreate:function(object, e){
			var offset = dhx.html.offset(object);
			var pos = dhx.html.pos(e);
			dhx.DragControl.top = offset.y - pos.y;
			dhx.DragControl.left = offset.x - pos.x;
			return dhx.toNode(this.master._viewobj);
		}, 	
		onDragDestroy:function(){
			dhx.DragControl.top = dhx.DragControl.left = 5;
			return;
		}
	}
};


dhx.Scrollable = {
	_init:function(config){
		//do not spam unwanted scroll containers for templates 
		if (config && !config.scroll && this._one_time_scroll) 
			return this._dataobj = (this._dataobj||this._contentobj);
		
		(this._dataobj||this._contentobj).appendChild(dhx.html.create("DIV",{ "class" : "dhx_scroll_cont" },""));
		this._dataobj=(this._dataobj||this._contentobj).firstChild;
	},
	/*defaults:{
		scroll:true
	},*/
	scrollSize:(dhx.Touch?0:18),
	scroll_setter:function(value){
		if (!value) return false;
		if (dhx.Touch){
			value =  (value=="x"?"x":(value=="xy"?"xy":"y"));
			this._dataobj.setAttribute("touch_scroll",value);
			if (this.attachEvent)
				this.attachEvent("onAfterRender", dhx.bind(this._refresh_scroll,this));
			this._settings.touch_scroll = true;
		} else {
			this._dataobj.parentNode.style.overflowY=value?"scroll":"";
		}
		return value;
	},
	scrollTo:function(x,y){
		if (dhx.Touch){
			y = Math.max(0, Math.min(y, this._dataobj.offsetHeight - this._content_height));
			x = Math.max(0, Math.min(x, this._dataobj.offsetWidth - this._content_width));
			dhx.Touch._set_matrix(this._dataobj, -x, -y, this._settings.scrollSpeed||"100ms");
		} else {
			this._dataobj.parentNode.scrollLeft=x;
			this._dataobj.parentNode.scrollTop=y;
		}
	},
	_refresh_scroll:function(){
		//this._dataobj.style.webkitTransformStyle="flat";
		if (this._settings.scroll.indexOf("x")!=-1 && !this._handleScrollSize){
			this._dataobj.style.width = this._content_width+"px";
			this._dataobj.style.width = this._dataobj.scrollWidth+"px";
		}
			
		if(dhx.Touch && this._settings.touch_scroll){
			dhx.Touch._clear_artefacts();
			dhx.Touch._scroll_end();
			dhx.Touch._set_matrix(this._dataobj, 0, 0, 0);
		}
	}
};


/* DHX DEPEND FROM FILE 'ui/content.js'*/


dhx.ActiveContent = {
	_init:function(config){  
		if (config.activeContent){
			this._after_init.push(this._init_active_content_list);
			
			this._active_holders = {};
			this._active_holders_item = {};
			this._active_holders_values = {};
			this._active_references = {};
			
			for (var key in config.activeContent){
				this[key] = this._bind_active_content(key);
				if (config.activeContent[key].earlyInit){
					var temp = dhx._parent_cell; dhx._parent_cell = null;
					this[key].call(this,{},this, config.activeContent);
					dhx._parent_cell=temp;
				}
			}
			
		}
	},
	_init_active_content_list:function(){
		if (this.filter){
			for (var key in this._settings.activeContent){
				this.type[key] = this[key];
				this[key] = this._locate_active_content_by_id(key);
			}
			//really bad!	
			this.type.masterUI = this;
		}
	},
	_locate_active_content_by_id:function(key){
		return function(id){
			var button = this._active_references[key];
			var button_id = button._settings.id;
			var html = this._locateHTML(id).getElementsByTagName("DIV");
			for (var i=0; i < html.length; i++) {
				if (html[i].getAttribute("view_id") == button_id){
					button._viewobj = button._dataobj = html[i];
					break;
				}
			}
			return button;
		};
	},
	_get_active_node:function(el, key, master){
		return function(e){
			if (e){
				var trg=e.target||e.srcElement;
				while (trg){
					if (trg.getAttribute && trg.getAttribute("view_id")){
						el._dataobj = el._viewobj = trg;
						if (master.locate){
							var id = master.locate(trg.parentNode);
							var value = master._active_holders_values[key][id];
							el._settings.value = value;
						}
						return trg;
					}
					trg = trg.parentNode;
				}				
			}
			return el._viewobj;
		};
	},
	_set_new_active_value:function(key, master){
		return function(value){
			var data = master.data;
			if (master.filter){
				var id = master.locate(this._viewobj.parentNode);
				data = master.item(id);
				//XMLSerializer - FF "feature"
				master._active_holders_item[key][id]=this._viewobj.outerHTML||(new XMLSerializer().serializeToString(this._viewobj));
				master._active_holders_values[key][id] = value;
			}
			
			data[key] = value;
		};
	},
	_bind_active_content:function(key){ 
		return function(obj, common, active){
			var object = common._active_holders?common:common.masterUI;
			if (!object._active_holders[key]){
				var d = document.createElement("DIV");
				
				active = active || object._settings.activeContent;
				var el = dhx.ui(active[key], d);
				el.getNode = object._get_active_node(el, key, object);
				el.attachEvent("onChange", object._set_new_active_value(key, object));
				
				object._active_references[key] = el;
				object._active_holders[key] = d.innerHTML;
				object._active_holders_item[key] = {};
				object._active_holders_values[key] = {};
			}
			if (object.filter && obj[key] != object._active_holders_values[key] && !dhx.isNotDefined(obj[key])){
				var el = object._active_references[key];
				el.blockEvent();
				el.setValue(obj[key]);
				el.unblockEvent();
				
				object._active_holders_values[key][obj.id] = obj[key];
				object._active_holders_item[key][obj.id] = el._viewobj.outerHTML||(new XMLSerializer().serializeToString(el._viewobj));
			}
			
			return object._active_holders_item[key][obj.id]||object._active_holders[key];
		};
	}
};


/* DHX DEPEND FROM FILE 'core/render/template.js'*/


/*
	Template - handles html templates
*/

/*DHX:Depend core/dhx.js*/

(function(){

var _cache = {};
dhx.Template = function(str){
	if (typeof str == "function") return str;
	if (_cache[str])
		return _cache[str];
		
	str=(str||"").toString();			
	if (str.indexOf("->")!=-1){
		str = str.split("->");
		switch(str[0]){
			case "html": 	//load from some container on the page
				str = dhx.html.getValue(str[1]);
				break;
			case "http": 	//load from external file
				str = new dhx.ajax().sync().get(str[1],{uid:dhx.uid()}).responseText;
				break;
			default:
				//do nothing, will use template as is
				break;
		}
	}
		
	//supported idioms
	// {obj} => value
	// {obj.attr} => named attribute or value of sub-tag in case of xml
	// {obj.attr?some:other} conditional output
	// {-obj => sub-template
	str=(str||"").toString();		
	str=str.replace(/(\r\n|\n)/g,"\\n");
	str=str.replace(/(\")/g,"\\\"");
	str=str.replace(/\{obj\.([^}?]+)\?([^:]*):([^}]*)\}/g,"\"+(obj.$1?\"$2\":\"$3\")+\"");
	str=str.replace(/\{common\.([^}\(]*)\}/g,"\"+(common.$1||'')+\"");
	str=str.replace(/\{common\.([^\}\(]*)\(\)\}/g,"\"+(common.$1?common.$1(obj,common):\"\")+\"");
	str=str.replace(/\{obj\.([^}]*)\}/g,"\"+(obj.$1||'')+\"");
	str=str.replace(/#([$a-z0-9_\[\]]+)#/gi,"\"+(obj.$1||'')+\"");
	str=str.replace(/\{obj\}/g,"\"+obj+\"");
	str=str.replace(/\{-obj/g,"{obj");
	str=str.replace(/\{-common/g,"{common");
	str="return \""+str+"\";";
	try {
		Function("obj","common",str);
	} catch(e){
		debugger;
	}
	return _cache[str]= Function("obj","common",str);
};


dhx.Template.empty=function(){	return "";	};
dhx.Template.bind =function(value){	return dhx.bind(dhx.Template(value),this); };


	/*
		adds new template-type
		obj - object to which template will be added
		data - properties of template
	*/
dhx.Type=function(obj, data){ 
	if (obj._dhx_proto_wait){
		if (!obj._dhx_type_wait)
			obj._dhx_type_wait = [];
				obj._dhx_type_wait.push(data);
		return;
	}
		
	//auto switch to prototype, if name of class was provided
	if (typeof obj == "function")
		obj = obj.prototype;
	if (!obj.types){
		obj.types = { "default" : obj.type };
		obj.type.name = "default";
	}
	
	var name = data.name;
	var type = obj.type;
	if (name)
		type = obj.types[name] = dhx.copy(obj.type);
	
	for(var key in data){
		if (key.indexOf("template")===0)
			type[key] = dhx.Template(data[key]);
		else
			type[key]=data[key];
	}

	return name;
};

})();


/* DHX DEPEND FROM FILE 'core/render/single_render.js'*/


/*
	REnders single item. 
	Can be used for elements without datastore, or with complex custom rendering logic
	
	@export
		render
*/

/*DHX:Depend core/render/template.js*/

dhx.AtomRender={
	//convert item to the HTML text
	_toHTML:function(obj){
		return this._settings.template(obj, this);
	},
	//render self, by templating data object
	render:function(){
		if (this.isVisible(this._settings.id)){
			if (dhx.debug_render)
				dhx.log("Render: "+this.name+"@"+this._settings.id);
			if (!this.callEvent || this.callEvent("onBeforeRender",[this.data])){
				if (this.data)
					this._dataobj.innerHTML = this._toHTML(this.data);
				if (this.callEvent) this.callEvent("onAfterRender",[]);
			}
			return true;
		}
		return false;
	},
	template_setter:dhx.Template
};

dhx.SingleRender=dhx.proto({
	//convert item to the HTML text
	_toHTML:function(obj){
		return this.type.templateStart(obj,this.type) + this.type.template(obj,this.type) + this.type.templateEnd(obj, this.type);
	},
	customize:function(obj){
		dhx.Type(this,obj);
	}
}, dhx.AtomRender);


/* DHX DEPEND FROM FILE 'core/load.js'*/


/* 
	ajax operations 
	
	can be used for direct loading as
		dhx.ajax(ulr, callback)
	or
		dhx.ajax().item(url)
		dhx.ajax().post(url)

*/

/*DHX:Depend core/dhx.js*/

dhx.ajax = function(url,call,master){
	//if parameters was provided - made fast call
	if (arguments.length!==0){
		var http_request = new dhx.ajax();
		if (master) http_request.master=master;
		http_request.get(url,null,call);
	}
	if (!this.getXHR) return new dhx.ajax(); //allow to create new instance without direct new declaration
	
	return this;
};
dhx.ajax.prototype={
	//creates xmlHTTP object
	getXHR:function(){
		if (dhx.env.isIE)
		 return new ActiveXObject("Microsoft.xmlHTTP");
		else 
		 return new XMLHttpRequest();
	},
	/*
		send data to the server
		params - hash of properties which will be added to the url
		call - callback, can be an array of functions
	*/
	send:function(url,params,call){
		var x=this.getXHR();
		if (typeof call == "function")
		 call = [call];
		//add extra params to the url
		if (typeof params == "object"){
			var t=[];
			for (var a in params){
				var value = params[a];
				if (value === null || value === dhx.undefined)
					value = "";
				t.push(a+"="+encodeURIComponent(value));// utf-8 escaping
		 	}
			params=t.join("&");
		}
		if (params && !this.post){
			url=url+(url.indexOf("?")!=-1 ? "&" : "?")+params;
			params=null;
		}
		
		x.open(this.post?"POST":"GET",url,!this._sync);
		if (this.post)
		 x.setRequestHeader('Content-type','application/x-www-form-urlencoded');
		 
		//async mode, define loading callback
		//if (!this._sync){
		 var self=this;
		 x.onreadystatechange= function(){
			if (!x.readyState || x.readyState == 4){
				dhx.log_full_time("data_loading");	//log rendering time
				if (call && self) 
					for (var i=0; i < call.length; i++)	//there can be multiple callbacks
					 if (call[i])
						call[i].call((self.master||self),x.responseText,x.responseXML,x);
				self.master=null;
				call=self=null;	//anti-leak
			}
		 };
		//}
		
		x.send(params||null);
		return x; //return XHR, which can be used in case of sync. mode
	},
	//GET request
	get:function(url,params,call){
		this.post=false;
		return this.send(url,params,call);
	},
	//POST request
	post:function(url,params,call){
		this.post=true;
		return this.send(url,params,call);
	}, 
	sync:function(){
		this._sync = true;
		return this;
	}
};


dhx.AtomDataLoader={
	_init:function(config){
		//prepare data store
		this.data = {}; 
		this._settings.datatype = config.datatype||"json";
		this._after_init.push(this._load_when_ready);
	},
	_load_when_ready:function(){
		this._ready_for_data = true;
		
		if (this._settings.url)
			this.url_setter(this._settings.url);
		if (this._settings.data)
			this.data_setter(this._settings.data);
	},
	url_setter:function(value){
		if (!this._ready_for_data) return value;
		this.load(value, this._settings.datatype);	
		return value;
	},
	data_setter:function(value){
		if (!this._ready_for_data) return value;
		this.parse(value, this._settings.datatype);
		return true;
	},
	//loads data from external URL
	load:function(url,call){
		this.callEvent("onXLS",[]);
		if (typeof call == "string"){	//second parameter can be a loading type or callback
			this.data.driver = dhx.DataDriver[call];
			call = arguments[2];
		}
		else
			this.data.driver = dhx.DataDriver["json"];
		//load data by async ajax call
		dhx.ajax(url,[this._onLoad,call],this);
	},
	//loads data from object
	parse:function(data,type){
		this.callEvent("onXLS",[]);
		this.data.driver = dhx.DataDriver[type||"json"];
		this._onLoad(data,null);
	},
	//default after loading callback
	_onLoad:function(text,xml,loader){
		var driver = this.data.driver;
		var top = driver.getRecords(driver.toObject(text,xml))[0];
		this.data=(driver?driver.getDetails(top):text);
		this.callEvent("onXLE",[]);
	},
	_check_data_feed:function(data){
		if (!this._settings.dataFeed || this._ignore_feed || !data) return true;
		var url = this._settings.dataFeed;
		url = url+(url.indexOf("?")==-1?"?":"&")+"action=get&id="+encodeURIComponent(data.id||data);
		this.callEvent("onXLS",[]);
		dhx.ajax(url, function(text,xml){
			this._ignore_feed=true;
			this.setValues(dhx.DataDriver.json.toObject(text)[0]);
			this._ignore_feed=false;
			this.callEvent("onXLE",[]);
		}, this);
		return false;
	}
};

/*
	Abstraction layer for different data types
*/

dhx.DataDriver={};
dhx.DataDriver.json={
	//convert json string to json object if necessary
	toObject:function(data){
		if (!data) data="[]";
		if (typeof data == "string"){
		 eval ("dhx.temp="+data);
		 return dhx.temp;
		}
		return data;
	},
	//get array of records
	getRecords:function(data){
		if (data && !(data instanceof Array))
		 return [data];
		return data;
	},
	//get hash of properties for single record
	getDetails:function(data){
		return data;
	},
	//get count of data and position at which new data need to be inserted
	getInfo:function(data){
		return { 
		 _size:(data.total_count||0),
		 _from:(data.pos||0)
		};
	}
};

dhx.DataDriver.json_ext={
	//convert json string to json object if necessary
	toObject:function(data){
		if (!data) data="[]";
		if (typeof data == "string"){
			var temp;
			eval ("temp="+data);
			dhx.temp = [];
			var header  = temp.header;
			for (var i = 0; i < temp.data.length; i++) {
				var item = {};
				for (var j = 0; j < header.length; j++) {
					if (typeof(temp.data[i][j]) != "undefined")
						item[header[j]] = temp.data[i][j];
				}
				dhx.temp.push(item);
			}
			return dhx.temp;
		}
		return data;
	},
	//get array of records
	getRecords:function(data){
		if (data && !(data instanceof Array))
		 return [data];
		return data;
	},
	//get hash of properties for single record
	getDetails:function(data){
		return data;
	},
	//get count of data and position at which new data need to be inserted
	getInfo:function(data){
		return {
		 _size:(data.total_count||0),
		 _from:(data.pos||0)
		};
	}
};

dhx.DataDriver.html={
	/*
		incoming data can be
		 - collection of nodes
		 - ID of parent container
		 - HTML text
	*/
	toObject:function(data){
		if (typeof data == "string"){
		 var t=null;
		 if (data.indexOf("<")==-1)	//if no tags inside - probably its an ID
			t = dhx.toNode(data);
		 if (!t){
			t=document.createElement("DIV");
			t.innerHTML = data;
		 }
		 
		 return t.getElementsByTagName(this.tag);
		}
		return data;
	},
	//get array of records
	getRecords:function(data){
		if (data.tagName)
		 return data.childNodes;
		return data;
	},
	//get hash of properties for single record
	getDetails:function(data){
		return dhx.DataDriver.xml.tagToObject(data);
	},
	//dyn loading is not supported by HTML data source
	getInfo:function(data){
		return { 
		 _size:0,
		 _from:0
		};
	},
	tag: "LI"
};

dhx.DataDriver.jsarray={
	//eval jsarray string to jsarray object if necessary
	toObject:function(data){
		if (typeof data == "string"){
		 eval ("dhx.temp="+data);
		 return dhx.temp;
		}
		return data;
	},
	//get array of records
	getRecords:function(data){
		return data;
	},
	//get hash of properties for single record, in case of array they will have names as "data{index}"
	getDetails:function(data){
		var result = {};
		for (var i=0; i < data.length; i++) 
		 result["data"+i]=data[i];
		 
		return result;
	},
	//dyn loading is not supported by js-array data source
	getInfo:function(data){
		return { 
		 _size:0,
		 _from:0
		};
	}
};

dhx.DataDriver.csv={
	//incoming data always a string
	toObject:function(data){
		return data;
	},
	//get array of records
	getRecords:function(data){
		return data.split(this.row);
	},
	//get hash of properties for single record, data named as "data{index}"
	getDetails:function(data){
		data = this.stringToArray(data);
		var result = {};
		for (var i=0; i < data.length; i++) 
		 result["data"+i]=data[i];
		 
		return result;
	},
	//dyn loading is not supported by csv data source
	getInfo:function(data){
		return { 
		 _size:0,
		 _from:0
		};
	},
	//split string in array, takes string surrounding quotes in account
	stringToArray:function(data){
		data = data.split(this.cell);
		for (var i=0; i < data.length; i++)
		 data[i] = data[i].replace(/^[ \t\n\r]*(\"|)/g,"").replace(/(\"|)[ \t\n\r]*$/g,"");
		return data;
	},
	row:"\n",	//default row separator
	cell:","	//default cell separator
};

dhx.DataDriver.xml={
	//convert xml string to xml object if necessary
	toObject:function(text,xml){
		if (xml && (xml=this.checkResponse(text,xml)))	//checkResponse - fix incorrect content type and extra whitespaces errors
		 return xml;
		if (typeof text == "string"){
		 return this.fromString(text);
		}
		return text;
	},
	//get array of records
	getRecords:function(data){
		return this.xpath(data,this.records);
	},
	records:"/*/item",
	//get hash of properties for single record
	getDetails:function(data){
		return this.tagToObject(data,{});
	},
	//get count of data and position at which new data_loading need to be inserted
	getInfo:function(data){
		return { 
		 _size:(data.documentElement.getAttribute("total_count")||0),
		 _from:(data.documentElement.getAttribute("pos")||0)
		};
	},
	//xpath helper
	xpath:function(xml,path){
		if (window.XPathResult){	//FF, KHTML, Opera
		 var node=xml;
		 if(xml.nodeName.indexOf("document")==-1)
		 xml=xml.ownerDocument;
		 var res = [];
		 var col = xml.evaluate(path, node, null, XPathResult.ANY_TYPE, null);
		 var temp = col.iterateNext();
		 while (temp){ 
			res.push(temp);
			temp = col.iterateNext();
		}
		return res;
		}	
		else {
			var test = true;
			try {
				if (typeof(xml.selectNodes)=="undefined")
					test = false;
			} catch(e){ /*IE7 and below can't operate with xml object*/ }
			//IE
			if (test)
				return xml.selectNodes(path);
			else {
				//Google hate us, there is no interface to do XPath
				//use naive approach
				var name = path.split("/").pop();
				return xml.getElementsByTagName(name);
			}
		}
	},
	//convert xml tag to js object, all subtags and attributes are mapped to the properties of result object
	tagToObject:function(tag,z){
		z=z||{};
		var flag=false;
		
		//map attributes
		var a=tag.attributes;
		if(a && a.length){
			for (var i=0; i<a.length; i++)
		 		z[a[i].name]=a[i].value;
		 	flag = true;
	 	}
		//map subtags
		
		var b=tag.childNodes;
		var state = {};
		for (var i=0; i<b.length; i++){
			if (b[i].nodeType==1){
				var name = b[i].tagName;
				if (typeof z[name] != "undefined"){
					if (!(z[name] instanceof Array))
						z[name]=[z[name]];
					z[name].push(this.tagToObject(b[i],{}));
				}
				else
					z[b[i].tagName]=this.tagToObject(b[i],{});	//sub-object for complex subtags
				flag=true;
			}
		}
		
		if (!flag)
			return this.nodeValue(tag);
		//each object will have its text content as "value" property
		z.value = this.nodeValue(tag);
		return z;
	},
	//get value of xml node 
	nodeValue:function(node){
		if (node.firstChild)
		 return node.firstChild.data;	//FIXME - long text nodes in FF not supported for now
		return "";
	},
	//convert XML string to XML object
	fromString:function(xmlString){
		if (window.DOMParser)		// FF, KHTML, Opera
		 return (new DOMParser()).parseFromString(xmlString,"text/xml");
		if (window.ActiveXObject){	// IE, utf-8 only 
		 var temp=new ActiveXObject("Microsoft.xmlDOM");
		 temp.loadXML(xmlString);
		 return temp;
		}
		dhx.error("Load from xml string is not supported");
	},
	//check is XML correct and try to reparse it if its invalid
	checkResponse:function(text,xml){ 
		if (xml && ( xml.firstChild && xml.firstChild.tagName != "parsererror") )
			return xml;
		//parsing as string resolves incorrect content type
		//regexp removes whitespaces before xml declaration, which is vital for FF
		var a=this.fromString(text.replace(/^[\s]+/,""));
		if (a) return a;
		
		dhx.error("xml can't be parsed",text);
	}
};




/* DHX DEPEND FROM FILE 'core/config.js'*/


/*
	Behavior:Settings
	
	@export
		customize
		config
*/

/*DHX:Depend core/render/template.js*/
/*DHX:Depend core/dhx.js*/

dhx.Settings={
	_init:function(){
		/* 
			property can be accessed as this.config.some
			in same time for inner call it have sense to use _settings
			because it will be minified in final version
		*/
		this._settings = this.config= {}; 
	},
	define:function(property, value){
		if (typeof property == "object")
			return this._parseSeetingColl(property);
		return this._define(property, value);
	},
	_define:function(property,value){
		dhx.assert_settings.call(this,property,value);
		
		//method with name {prop}_setter will be used as property setter
		//setter is optional
		var setter = this[property+"_setter"];
		return this._settings[property]=setter?setter.call(this,value,property):value;
	},
	//process configuration object
	_parseSeetingColl:function(coll){
		if (coll){
			for (var a in coll)				//for each setting
				this._define(a,coll[a]);		//set value through config
		}
	},
	//helper for object initialization
	_parseSettings:function(obj,initial){
		//initial - set of default values
		var settings = {}; 
		if (initial)
			settings = dhx.extend(settings,initial);
					
		//code below will copy all properties over default one
		if (typeof obj == "object" && !obj.tagName)
			dhx.extend(settings,obj, true);	
		//call config for each setting
		this._parseSeetingColl(settings);
	},
	_mergeSettings:function(config, defaults){
		for (var key in defaults)
			switch(typeof config[key]){
				case "object": 
					config[key] = this._mergeSettings((config[key]||{}), defaults[key]);
					break;
				case "undefined":
					config[key] = defaults[key];
					break;
				default:	//do nothing
					break;
			}
		return config;
	}
};


/* DHX DEPEND FROM FILE 'core/datastore.js'*/


/*DHX:Depend core/load.js*/
/*DHX:Depend core/dhx.js*/

/*
	Behavior:DataLoader - load data in the component
	
	@export
		load
		parse
*/
dhx.DataLoader=dhx.proto({
	_init:function(config){
		//prepare data store
		config = config || "";
		name = "DataStore";
		this.data = (config.datastore)||(new dhx.DataStore());
		this._readyHandler = this.data.attachEvent("onStoreLoad",dhx.bind(this._call_onready,this));
	},
	//loads data from external URL
	load:function(url,call){
		dhx.AtomDataLoader.load.apply(this, arguments);
		//prepare data feed for dyn. loading
		if (!this.data.feed)
		 this.data.feed = function(from,count){
			//allow only single request at same time
			if (this._load_count)
				return this._load_count=[from,count];	//save last ignored request
			else
				this._load_count=true;
				
			this.load(url+((url.indexOf("?")==-1)?"?":"&")+"posStart="+from+"&count="+count,function(){
				//after loading check if we have some ignored requests
				var temp = this._load_count;
				this._load_count = false;
				if (typeof temp =="object")
					this.data.feed.apply(this, temp);	//load last ignored request
			});
		};
	},
	//default after loading callback
	_onLoad:function(text,xml,loader){
		this.data._parse(this.data.driver.toObject(text,xml));
		this.callEvent("onXLE",[]);
		if(this._readyHandler){
			this.data.detachEvent(this._readyHandler);
			this._readyHandler = null;
		}
	},
	dataFeed_setter:function(value){
		this.data.attachEvent("onBeforeFilter", dhx.bind(function(text, value){
			if (this._settings.dataFeed){
				
				var filter = {};
				if (!text && !filter) return;
				if (typeof text == "function"){
					if (!value) return;
					text(value, filter);
				} else 
					filter = { text:value };

				this.clearAll();
				var url = this._settings.dataFeed;
				var urldata = [];
				for (var key in filter)
					urldata.push("dhx_filter["+key+"]="+encodeURIComponent(filter[key]));
				this.load(url+(url.indexOf("?")<0?"?":"&")+urldata.join("&"), this._settings.datatype);
				return false;
			}
		},this));
		return value;
	},
	_call_onready:function(){
		if (this._settings.ready){
			var code = dhx.toFunctor(this._settings.ready);
			if (code && code.call) code.apply(this, arguments);
		}
	}
},dhx.AtomDataLoader).prototype;


/*
	DataStore is not a behavior, it standalone object, which represents collection of data.
	Call provideAPI to map data API

	@export
		exists
		idByIndex
		indexById
		get
		set
		refresh
		dataCount
		sort
		filter
		next
		previous
		clearAll
		first
		last
*/
dhx.DataStore = function(){
	this.name = "DataStore";
	
	dhx.extend(this, dhx.EventSystem);
	
	this.setDriver("xml");	//default data source is an XML
	this.pull = {};						//hash of IDs
	this.order = dhx.toArray();		//order of IDs
};

dhx.DataStore.prototype={
	//defines type of used data driver
	//data driver is an abstraction other different data formats - xml, json, csv, etc.
	setDriver:function(type){
		dhx.assert(dhx.DataDriver[type],"incorrect DataDriver");
		this.driver = dhx.DataDriver[type];
	},
	//process incoming raw data
	_parse:function(data){
		if (this._filter_order)
			this.filter();
			
		//get size and position of data
		var info = this.driver.getInfo(data);
		//get array of records

		var recs = this.driver.getRecords(data);
		var from = (info._from||0)*1;
		
		if (from === 0 && this.order[0]) //update mode
			from = this.order.length;
		
		var j=0;
		for (var i=0; i<recs.length; i++){
			//get has of details for each record
			var temp = this.driver.getDetails(recs[i]);
			var id = this.id(temp); 	//generate ID for the record
			if (!this.pull[id]){		//if such ID already exists - update instead of insert
				this.order[j+from]=id;	
				j++;
			}
			this.pull[id]=temp;
			//if (this._format)	this._format(temp);
			
			if (this.extraParser)
				this.extraParser(temp);
		}

		//for all not loaded data
		for (var i=0; i < info._size; i++)
			if (!this.order[i]){
				var id = dhx.uid();
				var temp = {id:id, $template:"loading"};	//create fake records
				this.pull[id]=temp;
				this.order[i]=id;
			}
		this.callEvent("onStoreLoad",[this.driver, data]);
		//repaint self after data loading
		this.refresh();
	},
	//generate id for data object
	id:function(data){
		return data.id||(data.id=dhx.uid());
	},
	changeId:function(old, newid){
		dhx.assert(this.pull[old],"Can't change id, for non existing item: "+old);
		this.pull[newid] = this.pull[old];
		this.pull[newid].id = newid;
		this.order[this.order.find(old)]=newid;
		this.callEvent("onIdChange", [old, newid]);
		if (this._render_change_id)
			this._render_change_id(old, newid);
	},
	//get data from hash by id
	item:function(id){
		return this.pull[id];
	},
	//assigns data by id
	update:function(id,data){
		if (this.callEvent("onBeforeUpdate", [id, data]) === false) return false;
		this.pull[id]=data;
		this.refresh(id);
	},
	//sends repainting signal
	refresh:function(id){
		if (this._skip_refresh) return; 
		
		if (id)
			this.callEvent("onStoreUpdated",[id, this.pull[id], "update"]);
		else
			this.callEvent("onStoreUpdated",[null,null,null]);
	},
	silent:function(code){
		this._skip_refresh = true;
		code.call(this);
		this._skip_refresh = false;
	},
	//converts range IDs to array of all IDs between them
	getRange:function(from,to){		
		//if some point is not defined - use first or last id
		//BEWARE - do not use empty or null ID
		if (from)
			from = this.indexById(from);
		else 
			from = this.startOffset||0;
		if (to)
			to = this.indexById(to);
		else {
			to = Math.min((this.endOffset||Infinity),(this.dataCount()-1));
			if (to<0) to = 0; //we have not data in the store
		}

		if (from>to){ //can be in case of backward shift-selection
			var a=to; to=from; from=a;
		}
				
		return this.getIndexRange(from,to);
	},
	//converts range of indexes to array of all IDs between them
	getIndexRange:function(from,to){
		to=Math.min((to||Infinity),this.dataCount()-1);
		
		var ret=dhx.toArray(); //result of method is rich-array
		for (var i=(from||0); i <= to; i++)
			ret.push(this.item(this.order[i]));
		return ret;
	},
	//returns total count of elements
	dataCount:function(){
		return this.order.length;
	},
	//returns truy if item with such ID exists
	exists:function(id){
		return !!(this.pull[id]);
	},
	//nextmethod is not visible on component level, check DataMove.move
	//moves item from source index to the target index
	move:function(sindex,tindex){
		if (sindex<0 || tindex<0){
			dhx.error("DataStore::move","Incorrect indexes");
			return;
		}
		
		var id = this.idByIndex(sindex);
		var obj = this.item(id);
		
		this.order.removeAt(sindex);	//remove at old position
		//if (sindex<tindex) tindex--;	//correct shift, caused by element removing
		this.order.insertAt(id,Math.min(this.order.length, tindex));	//insert at new position
		
		//repaint signal
		this.callEvent("onStoreUpdated",[id,obj,"move"]);
	},
	scheme:function(config){
		/*
			some.scheme({
				order:1,
				name:"dummy",
				title:""
			})
		*/
		this._scheme = config;
		
	},
	sync:function(source, filter, silent){
		if (typeof filter != "function"){
			silent = filter;
			filter = null;
		}
		
		if (dhx.debug_bind){
			this.debug_sync_master = source; 
			dhx.log("[sync] "+this.debug_bind_master.name+"@"+this.debug_bind_master._settings.id+" <= "+this.debug_sync_master.name+"@"+this.debug_sync_master._settings.id);
		}

		if (source.name != "DataStore")
			source = source.data;

		var sync_logic = dhx.bind(function(){
			this.order = dhx.toArray([].concat(source.order));
			this._filter_order = null;
			this.pull = source.pull;
			
			if (filter)
				this.silent(filter);
			
			if (this._on_sync)
				this._on_sync();
			if (dhx.debug_bind)
				dhx.log("[sync:request] "+this.debug_sync_master.name+"@"+this.debug_sync_master._settings.id + " <= "+this.debug_bind_master.name+"@"+this.debug_bind_master._settings.id);
			if (!silent) 
				this.refresh();
			else
				silent = false;
		}, this);
		
		source.attachEvent("onStoreUpdated", sync_logic);
		sync_logic();
	},
	//adds item to the store
	add:function(obj,index){
		
		if (this._scheme){
			obj = obj||{};
			for (var key in this._scheme)
				obj[key] = obj[key]||this._scheme[key];
			if (this._scheme.$init)
				this._scheme.$init(obj);
		}
		
		//generate id for the item
		var id = this.id(obj);
		
		//by default item is added to the end of the list
		var data_size = this.dataCount();
		
		if (dhx.isNotDefined(index) || index < 0)
			index = data_size; 
		//check to prevent too big indexes			
		if (index > data_size){
			dhx.log("Warning","DataStore:add","Index of out of bounds");
			index = Math.min(this.order.length,index);
		}
		if (this.callEvent("onBeforeAdd", [id, obj, index]) === false) return false;

		if (this.exists(id)) return dhx.error("Not unique ID");
		
		this.pull[id]=obj;
		this.order.insertAt(id,index);
		if (this._filter_order){	//adding during filtering
			//we can't know the location of new item in full dataset, making suggestion
			//put at end by default
			var original_index = this._filter_order.length;
			//put at start only if adding to the start and some data exists
			if (!index && this.order.length)
				original_index = 0;
			
			this._filter_order.insertAt(id,original_index);
		}
		this.callEvent("onafterAdd",[id,index]);
		//repaint signal
		this.callEvent("onStoreUpdated",[id,obj,"add"]);
		return id;
	},
	
	//removes element from datastore
	remove:function(id){
		//id can be an array of IDs - result of getSelect, for example
		if (id instanceof Array){
			for (var i=0; i < id.length; i++)
				this.remove(id[i]);
			return;
		}
		if (this.callEvent("onBeforeDelete",[id]) === false) return false;
		if (!this.exists(id)) return dhx.error("Not existing ID",id);
		var obj = this.item(id);	//save for later event
		//clear from collections
		this.order.remove(id);
		if (this._filter_order) 
			this._filter_order.remove(id);
			
		delete this.pull[id];
		this.callEvent("onafterdelete",[id]);
		//repaint signal
		this.callEvent("onStoreUpdated",[id,obj,"delete"]);
	},
	//deletes all records in datastore
	clearAll:function(){
		//instead of deleting one by one - just reset inner collections
		this.pull = {};
		this.order = dhx.toArray();
		this._filter_order = null;
		this.callEvent("onClearAll",[]);
		this.refresh();
	},
	//converts id to index
	idByIndex:function(index){
		if (index>=this.order.length || index<0)
			dhx.log("Warning","DataStore::idByIndex Incorrect index");
			
		return this.order[index];
	},
	//converts index to id
	indexById:function(id){
		var res = this.order.find(id);	//slower than idByIndex
		
		if (!this.pull[id])
			dhx.log("Warning","DataStore::indexById Non-existing ID: "+ id);
			
		return res;
	},
	//returns ID of next element
	next:function(id,step){
		return this.order[this.indexById(id)+(step||1)];
	},
	//returns ID of first element
	first:function(){
		return this.order[0];
	},
	//returns ID of last element
	last:function(){
		return this.order[this.order.length-1];
	},
	//returns ID of previous element
	previous:function(id,step){
		return this.order[this.indexById(id)-(step||1)];
	},
	/*
		sort data in collection
			by - settings of sorting
		
		or
		
			by - sorting function
			dir - "asc" or "desc"
			
		or
		
			by - property
			dir - "asc" or "desc"
			as - type of sortings
		
		Sorting function will accept 2 parameters and must return 1,0,-1, based on desired order
	*/
	sort:function(by, dir, as){
		var sort = by;	
		if (typeof by == "function")
			sort = {as:by, dir:dir};
		else if (typeof by == "string")
			sort = {by:by, dir:dir, as:as};		
		
		
		var parameters = [sort.by, sort.dir, sort.as];
		if (!this.callEvent("onbeforesort",parameters)) return;	
		
		if (this.order.length){
			var sorter = dhx.sort.create(sort);
			//get array of IDs
			var neworder = this.getRange(this.first(), this.last());
			neworder.sort(sorter);
			this.order = neworder.map(function(obj){ return this.id(obj); },this);
		}
		
		//repaint self
		this.refresh();
		
		this.callEvent("onaftersort",parameters);
	},
	/*
		Filter datasource
		
		text - property, by which filter
		value - filter mask
		
		or
		
		text  - filter method
		
		Filter method will receive data object and must return true or false
	*/
	filter:function(text,value){
		if (!this.callEvent("onBeforeFilter", [text, value])) return;
		
		//remove previous filtering , if any
		if (this._filter_order){
			this.order = this._filter_order;
			delete this._filter_order;
		}
		
		if (!this.order.length) return;
		
		//if text not define -just unfilter previous state and exit
		if (text){
			var filter = text;
			value = value||"";
			if (typeof text == "string"){
				text = dhx.Template(text);
				value = value.toString().toLowerCase();
				filter = function(obj,value){	//default filter - string start from, case in-sensitive
					return text(obj).toLowerCase().indexOf(value)!=-1;
				};
			}
			
					
			var neworder = dhx.toArray();
			for (var i=0; i < this.order.length; i++){
				var id = this.order[i];
				if (filter(this.item(id),value))
					neworder.push(id);
			}
			//set new order of items, store original
			this._filter_order = this.order;
			this.order = neworder;
		}
		//repaint self
		this.refresh();
		
		this.callEvent("onAfterFilter", []);
	},
	/*
		Iterate through collection
	*/
	each:function(method,master){
		for (var i=0; i<this.order.length; i++)
			method.call((master||this), this.item(this.order[i]));
	},
	/*
		map inner methods to some distant object
	*/
	provideApi:function(target,eventable){
		this.debug_bind_master = target;
			
		if (eventable){
			this.mapEvent({
				onbeforesort:	target,
				onaftersort:	target,
				onbeforeadd:	target,
				onafteradd:		target,
				onbeforedelete:	target,
				onafterdelete:	target,
				onbeforeupdate: target/*,
				onafterfilter:	target,
				onbeforefilter:	target*/
			});
		}
			
		var list = ["sort","add","remove","exists","idByIndex","indexById","item","update","refresh","dataCount","filter","next","previous","clearAll","first","last","serialize","sync"];
		for (var i=0; i < list.length; i++)
			target[list[i]]=dhx.methodPush(this,list[i]);
			
		if (dhx.assert_enabled())		
			this.assert_event(target);
	},
	/*
		serializes data to a json object
	*/
	serialize: function(){
		var ids = this.order;
		var result = [];
		for(var i=0; i< ids.length;i++)
			result.push(this.pull[ids[i]]); 
		return result;
	}
};

dhx.sort = {
	create:function(config){
		return dhx.sort.dir(config.dir, dhx.sort.by(config.by, config.as));
	},
	as:{
		"int":function(a,b){
			a = a*1; b=b*1;
			return a>b?1:(a<b?-1:0);
		},
		"string_strict":function(a,b){
			a = a.toString(); b=b.toString();
			return a>b?1:(a<b?-1:0);
		},
		"string":function(a,b){
			a = a.toString().toLowerCase(); b=b.toString().toLowerCase();
			return a>b?1:(a<b?-1:0);
		}
	},
	by:function(prop, method){
		if (!prop)
			return method;
		if (typeof method != "function")
			method = dhx.sort.as[method||"string"];
		prop = dhx.Template(prop);
		return function(a,b){
			return method(prop(a),prop(b));
		};
	},
	dir:function(prop, method){
		if (prop == "asc")
			return method;
		return function(a,b){
			return method(a,b)*-1;
		};
	}
};





/* DHX DEPEND FROM FILE 'core/bind.js'*/


/*DHX:Depend core/dhx.js*/
/*DHX:Depend core/config.js*/
/*DHX:Depend core/datastore.js*/



//UI interface
dhx.BaseBind = {
	bind:function(target, rule, format){
		if (typeof target == 'string')
			target = dhx.ui.get(target);
			
		if (!target.getBindData)
			dhx.extend(target, dhx.BindSource);
		if (!this._bind_ready){
			var old_render = this.render;
			if (this.filter){
				var key = this._settings.id;
				this.data._on_sync = function(){
					target._bind_updated[key] = false;
				};
			}
			this.render = function(){
				if (this._in_bind_processing) return;
				
				this._in_bind_processing = true;
				this.callEvent("onBindRequest");
				this._in_bind_processing = false;
				
				return old_render.call(this);
			};
			if (this.getValue||this.getValues)
				this.save = function(){
					if (this.validate && !this.validate()) return;
					target.setBindData((this.getValue?this.getValue:this.getValues()),this._settings.id);
				};
			this._bind_ready = true;
		}
		target.addBind(this._settings.id, rule, format);
		
		if (dhx.debug_bind)
			dhx.log("[bind] "+this.name+"@"+this._settings.id+" <= "+target.name+"@"+target._settings.id);
		//FIXME - check for touchable is not the best solution, to detect necessary event
		this.attachEvent(this.touchable?"onAfterRender":"onBindRequest", function(){
			target.getBindData(this._settings.id);
		});
		if (this.isVisible(this._settings.id))
			this.refresh();
	}
};

//bind interface
dhx.BindSource = {
	_init:function(){
		this._bind_hash = {};		//rules per target
		this._bind_updated = {};	//update flags
		this._ignore_binds = {};
		
		//apply specific bind extension
		this._bind_specific_rules(this);
	},
	setBindData:function(data, key){
		if (key)
			this._ignore_binds[key] = true;
		
		if (dhx.debug_bind)
				dhx.log("[bind:save] "+this.name+"@"+this._settings.id+" <= "+"@"+key);
		if (this.setValue)
			this.setValue(data);
		else if (this.setValues)
			this.setValues(data);
		else 
			this.update(this.getCursor(), data);
		
		if (this.save)
			this.save();
		
		if (key)
			this._ignore_binds[key] = false;
	},
	//fill target with data
	getBindData:function(key, update){
		//fire only if we have data updates from the last time
		if (this._bind_updated[key]) return;
		var target = dhx.ui.get(key);
		//fill target only when it visible
		if (target.isVisible(target._settings.id)){
			this._bind_updated[key] = true;
			if (dhx.debug_bind)
				dhx.log("[bind:request] "+this.name+"@"+this._settings.id+" => "+target.name+"@"+target._settings.id);
			this._bind_update(target, this._bind_hash[key][0], this._bind_hash[key][1]); //trigger component specific updating logic
			if (update && target.filter)
				target.refresh();
			
		}
	},
	//add one more bind target
	addBind:function(source, rule, format){
		this._bind_hash[source] = [rule, format];
	},
	//returns true if object belong to "collection" type
	_bind_specific_rules:function(obj){
		if (obj.filter)
			dhx.extend(this, dhx.CollectionBind);
		else if (obj.setValue)
			dhx.extend(this, dhx.ValueBind);
		else
			dhx.extend(this, dhx.RecordBind);
	},
	//inform all binded objects, that source data was updated
	_update_binds:function(){
		for (var key in this._bind_hash){
			if (this._ignore_binds[key]) continue;
			this._bind_updated[key] = false;
			this.getBindData(key, true);
		}
	},
	//copy data from source to the target
	_bind_update_common:function(target, rule, data){
		if (target.setValue)
			target.setValue(data?data[rule]:data);
		else if (!target.filter){
			if (!data && target.clear)
				target.clear();
			else {
				if (target._check_data_feed(data))
					target.setValues(dhx.copy(data));
			}
		} else {
			target.data.silent(function(){
				this.filter(rule,data);
			});
		}
	}
};


//pure data objects
dhx.DataValue = dhx.proto({
	name:"DataValue",
	isVisible:function(){ return true; },
	_init:function(config){ 
		this.data = ""||config; 
		var id = (config&&config.id)?config.id:dhx.uid();
		this._settings = { id:id };
		dhx.ui.views[id] = this;
	},
	setValue:function(value){
		this.data = value;
		this.callEvent("onChange", [value]);
	},
	getValue:function(){
		return this.data;
	},
	refresh:function(){ this.callEvent("onBindRequest"); }
}, dhx.EventSystem, dhx.BaseBind);

dhx.DataRecord = dhx.proto({
	name:"DataRecord",
	isVisible:function(){ return true; },
	_init:function(config){
		this.data = config||{}; 
		var id = (config&&config.id)?config.id:dhx.uid();
		this._settings = { id:id };
		dhx.ui.views[id] = this;
	},
	getValues:function(){
		return this.data;
	},
	setValues:function(data){
		this.data = data;
		this.callEvent("onChange", [data]);
	},
	refresh:function(){ this.callEvent("onBindRequest"); }
}, dhx.EventSystem, dhx.BaseBind);


dhx.DataCollection = dhx.proto({
	name:"DataCollection",
	isVisible:function(){ return true; },
	_init:function(config){
		this.data.provideApi(this, true);
		var id = (config&&config.id)?config.id:dhx.uid();
		this._settings.id =id;
		dhx.ui.views[id] = this;
	},
	refresh:function(){ this.callEvent("onBindRequest"); }
}, dhx.EventSystem, dhx.DataLoader, dhx.BaseBind, dhx.Settings);




dhx.ValueBind={
	_init:function(){
		this.attachEvent("onChange", this._update_binds);
	},
	_bind_update:function(target, rule, format){
		var data = this.getValue()||"";
		if (format) data = format(data);
		
		if (target.setValue)
			target.setValue(data);
		else if (!target.filter){
			var pod = {}; pod[rule] = data;
			if (target._check_data_feed(data))
				target.setValues(pod);
		} else{
			target.data.silent(function(){
				this.filter(rule,data);
			});
		}
	}
};

dhx.RecordBind={
	_init:function(){
		this.attachEvent("onChange", this._update_binds);		
	},
	_bind_update:function(target, rule){
		var data = this.getValues()||null;
		this._bind_update_common(target, rule, data);
	}
};

dhx.CollectionBind={
	_init:function(){
		this._cursor = null;
		this.attachEvent("onSelectChange", function(data){
			this.setCursor(this.getSelected());
		});
		this.attachEvent("onAfterCursorChange", this._update_binds);		
		this.data.attachEvent("onStoreUpdated", dhx.bind(function(id){
			if (id && id == this.getCursor())
				this._update_binds();
		},this));
	},
	setCursor:function(id){
		if (id == this._cursor) return;
		this.callEvent("onBeforeCursorChange", [this._cursor]);
		this._cursor = id;
		this.callEvent("onAfterCursorChange",[id]);
	},
	getCursor:function(){
		return this._cursor;
	},
	_bind_update:function(target, rule){ 
		var data = this.item(this.getCursor())||null;
		this._bind_update_common(target, rule, data);
	}
};	


/* DHX DEPEND FROM FILE 'core/destructor.js'*/


/*
	Behavior:Destruction
	
	@export
		destructor
*/

/*DHX:Depend core/dhx.js*/

dhx.Destruction = {
	_init:function(){
		//register self in global list of destructors
		dhx.destructors.push(this);
	},
	//will be called automatically on unload, can be called manually
	//simplifies job of GC
	destructor:function(){
		this.destructor=function(){}; //destructor can be called only once
		if (this._cells)
			for (var i=0; i < this._cells.length; i++)
				this._cells[i].destructor();
		
		delete dhx.ui.views[this._settings.id];
		//html collection
		this._htmlmap  = null;
		this._htmlrows = null;
		
		//temp html element, used by toHTML
		if (this._html)
			document.body.appendChild(this._html);	//need to attach, for IE's GC

		this._html = null;
				
		if (this._contentobj) {
			this._contentobj.innerHTML="";
			this._contentobj._htmlmap = null;
		}
		
		this._contentobj = this._dataobj = null;
		if(this._settings.container&&this._viewobj.parentNode){
			this._viewobj.parentNode.parentNode.removeChild(this._viewobj.parentNode);
		}
		else if (this._viewobj&&this._viewobj.parentNode){
			this._viewobj.parentNode.removeChild(this._viewobj);
		}
		this.data = null;
		this._events = this._handlers = {};
	}
};
//global list of destructors
dhx.destructors = [];
dhx.event(window,"unload",function(){
	//call all registered destructors
	for (var i=0; i<dhx.destructors.length; i++)
		dhx.destructors[i].destructor();
	dhx.destructors = [];
	
	//detach all known DOM events
	for (var a in dhx._events){
		var ev = dhx._events[a];
		if (ev[0].removeEventListener)
			ev[0].removeEventListener(ev[1],ev[2],false);
		else if (ev[0].detachEvent)
			ev[0].detachEvent("on"+ev[1],ev[2]);
		delete dhx._events[a];
	}
});


/* DHX DEPEND FROM FILE 'ui/view.js'*/


/*
	UI:DataView
*/

/*DHX:Depend ui/view.css*/

/*DHX:Depend core/destructor.js*/
/*DHX:Depend core/dhx.js*/
/*DHX:Depend core/bind.js*/
/*DHX:Depend core/config.js*/
/*DHX:Depend core/load.js*/
/*DHX:Depend core/render/template.js*/
/*DHX:Depend core/render/single_render.js*/
/*DHX:Depend ui/content.js*/

dhx.IdSpace = {
	_init:function(){
		var temp = dhx._global_collection;
		this.elements = {};
		dhx._global_collection = this;
		this._translate_ids = {};
		this.getTopParent = dhx.bind(function(){ return this;}, this);
		this._after_init.push(function(){
			dhx._global_collection = temp;
			for (var name in this.elements){
				if (this.elements[name].mapEvent && !this.elements[name].touchable)
					this.elements[name].mapEvent({
						onbeforetabclick:this,
						onaftertabclick:this,
						onitemclick:this
					});
		
				this.elements[name].getTopParent = this.getTopParent;
			}
		});
	},
	$$:function(id){
		return this.elements[id];
	},
	innerId:function(id){
		return this._translate_ids[id];
	}
};




(function(){

var resize = [];

var ui = dhx.ui = function(config, parent, id){
	
	var node = config;
	
	node = dhx.toNode((config.container||parent)||document.body);
	if (config._settings || (node._cells && !id)){
		var top_node = config;
	} else 
		var top_node = ui._view(config);
	
	if (node.appendChild){
		node.appendChild(top_node._viewobj);
		if (!top_node.setPosition  && node == document.body)
			resize.push(top_node);
		if (!config.skipResize)
			top_node.resize();
	} else if (node._replace){
		if (top_node.getParent && top_node.getParent)
			top_node.getParent()._remove(top_node);
		node._replace(top_node, id);
	} else
		dhx.error("not existing parent:"+config.container);
	
	return top_node;
};
dhx.ui._uid = function(name){
	return name+(this._namecount[name] = (this._namecount[name]||0)+1);
};
dhx.ui._namecount = {};

dhx.ui.resize = function(){
	if (!dhx.ui._freeze)
		for (var i=0; i < resize.length; i++){
			resize[i].resize();
		}
};
dhx.event(window, "resize", dhx.ui.resize);

ui._delays = {};
ui.delay = function(config){
	dhx.ui._delays[config.id] = config;
};

dhx.ui.zIndex = function(){
	return dhx.ui._zIndex++;
};
dhx.ui._zIndex = 1;

ui._view = function(config){
	if (config.view){
		var view = config.view;
		delete config.view;
		dhx.assert(ui[view], "unknown view:"+view);
		return new ui[view](config);
	} else if (config.rows || config.cols)
		return new ui.layout(config);
	else if (config.cells)
		return new ui.multiview(config);
	else
		return new ui.template(config);	
};

ui.views = {};
ui.get = function(id){
	if (!id) return null;
	
	if (ui.views[id]) return ui.views[id];
	if (ui._delays[id]) return dhx.ui(ui._delays[id]);
	
	var name = id;
	if (typeof id == "object")
		name = (id.target||id.srcElement)||id;
	return ui.views[dhx.html.locate({ target:dhx.toNode(name)},"view_id")];
};
if (dhx.isNotDefined(window.$$)) $$=ui.get;


dhx.protoUI({
	name:"baseview",
	//attribute , which will be used for ID storing
	_init:function(config){
		if (!config.id) 
			config.id = dhx.ui._uid(this.name);
		
		this._parent_cell = dhx._parent_cell;
		dhx._parent_cell = null;
		
		this._contentobj = this._viewobj = dhx.html.create("DIV",{
			"class":"dhx_view"
		});
	},
	defaults:{
		width:-1,
		height:-1,
		gravity:1
	},
	getNode:function(){
		return this._viewobj;
	},
	getParent:function(){
		return this._parent_cell||null;	
	},
	isVisible:function(base_id, prev_id){
		if (this._settings.hidden && base_id){
			if (!this._hidden_render) {
				this._hidden_render = [];
				this._hidden_hash = {};
			}
			if (!this._hidden_hash[base_id]){
				this._hidden_hash[base_id] =  true;
				this._hidden_render.push(base_id);
			}
			return false;
		}
		
		var parent = this.getParent();
		if (parent) return parent.isVisible(base_id, this._settings.id);
		
		return true;
	},
	container_setter:function(value){
		dhx.assert(dhx.toNode(value),"Invalid container");
		//dhx.toNode(value).appendChild(this._viewobj);
		//this.resize();
		return true;
	},
	css_setter:function(value){
		this._viewobj.className += " "+value;
		return value;
	},
	id_setter:function(value){
		if (dhx._global_collection && dhx._global_collection != this){
			var oldvalue = value;
			dhx._global_collection.elements[value] = this;
			value = dhx.ui._uid(this.name);
			dhx._global_collection._translate_ids[value]=oldvalue;
		}
		ui.views[value] = this;
		this._viewobj.setAttribute("view_id", value);
		return value;
	},
	_set_size:function(x,y){
		if (dhx.debug_size)
			dhx.log("[set] "+this.name+"@"+this.config.id+" :"+x+","+y);
			
		if (this._last_size && this._last_size[0]==x && this._last_size[1]==y) 
			return false;
		
		this._last_size = [x,y];
		this._content_width = x;
		this._content_width = x-(this._settings.scroll?dhx.Scrollable.scrollSize:0);
		this._content_height = y;
		this._viewobj.style.width = x+"px";
		this._viewobj.style.height = y+"px";
		return true;
	},
	_get_desired_size:function(){
		var width = this._settings.width;
		var height = this._settings.height;
		var gravx, gravy;
		gravx = gravy = this._settings.gravity; 
		
		if (width == -1) width = 0; else {
			gravx = 0;
			width+=this._settings.scroll?dhx.Scrollable.scrollSize:0;
		}
		if (height == -1) height = 0; else gravy = 0;
		return [ gravx, width, gravy, height ];
	},
	show:function(animate_settings){
		if (this.getParent()) {
			var parent = this.getParent();
			if(!animate_settings && this._settings.animate)
				if (parent._settings.animate)
					animate_settings = dhx.extend((parent._settings.animate?dhx.extend({},parent._settings.animate):{}), this._settings.animate, true);
			var show = arguments.length < 2;
			if (show?parent._show:parent._hide)
				(show?parent._show:parent._hide).call(parent, this, animate_settings);
		}
	},
	hidden_setter:function(value){
		if (value) this.hide();
		return this._settings.hidden;
	},
	hide:function(){
		this.show(null, true);
	},
	resize:function(){
		var area = this._viewobj;
		if (!this._parent_cell)
			area = area.parentNode;

		if(!this._viewobj.parentNode)
			return false;

		var x = this._viewobj.parentNode.offsetWidth;
		var y = this._viewobj.parentNode.offsetHeight;

		var sizes=this._get_desired_size();
		
		//use limited size if we have only fixed sizes
		if (!sizes[0]) x = Math.max(sizes[1],x);
		else x = Math.max(x, sizes[1]); //else use all avaiable space
		if (!sizes[2]) y = Math.max(sizes[3],y);
		else y = Math.max(y, sizes[3]);
		
		this._set_size(x,y);
	}
}, dhx.Settings, dhx.Destruction, dhx.BaseBind);


dhx.protoUI({
	name:"baselayout",
	_init:function(){
		this._after_init.push(this._parse_cells);
		this._dataobj  = this._contentobj;
	},
	rows_setter:function(value){
		this._vertical_orientation = 1;
		this._cssFloat = "";
		this._collection = value;
	},
	cols_setter:function(value){
		this._vertical_orientation = 0;
		this._cssFloat = "left";
		this._collection = value;
	},
	_remove:function(view){
		dhx.PowerArray.removeAt.call(this._cells, dhx.PowerArray.find.call(this._cells, view));
		this._resize_childs();
	},
	_replace:function(new_view,target_id){
		if (dhx.isNotDefined(target_id)){
			for (var i=0; i < this._cells.length; i++)
				this._cells[i].destructor();
			this._collection = new_view;
			this._parse_cells();
		} else {
			if (typeof target_id == "number"){
				if (target_id<0 || target_id > this._cells.length)
					target_id = this._cells.length;
				var prev_node = (this._cells[target_id]||{})._viewobj;
				dhx.PowerArray.insertAt.call(this._cells, new_view, target_id);
				dhx.html.insertBefore(new_view._viewobj, prev_node, this._dataobj);
			} else {
				var source = dhx.ui.get(target_id);
				target_id = dhx.PowerArray.find.call(this._cells, source);
				dhx.assert(target_id!=-1, "Attempt to replace the non-existing view");
				source._viewobj.parentNode.insertBefore(new_view._viewobj, source._viewobj);
				source.destructor();	
				this._cells[target_id] = new_view;
			}
			new_view._viewobj.style.cssFloat = this._cssFloat;
			this._cells[target_id]._parent_cell = this;
		}
		this._resize_childs();
	},
	reconstruct:function(){
		for (var i=0; i<this._cells.length; i++)
			dhx.html.remove(this._cells[i]._viewobj);
		this._parse_cells();
		this._set_size(this._last_size[0], this._last_size[1]);
	},
	_hide:function(obj, settings, silent){
		if (obj._settings.hidden) return;
		obj._settings.hidden = true;
		dhx.html.remove(obj._viewobj);
		this._hiddencells++;
		if (!silent)
			this._resize_childs();	
	},
	_resize_childs:function(){
		if (this._last_size){
			this._get_desired_size();
			this._set_size(this._viewobj.offsetWidth, this._viewobj.offsetHeight);
		}
	},
	index:function(obj){
		if (obj._settings)
			obj = obj._settings.id;
		for (var i=0; i < this._cells.length; i++)
			if (this._cells[i]._settings.id == obj)
				return i;
		return -1;
	},
	_show:function(obj, settings, silent){
		if (!obj._settings.hidden) return;
		obj._settings.hidden = false;
		dhx.html.insertBefore(obj._viewobj, (this._cells[this.index(obj)+1]||{})._viewobj, (this._dataobj||this._viewobj));
		this._hiddencells--;
		if (!silent)
			this._resize_childs();
	},
	showBatch:function(name){
		if (this._settings.visibleBatch == name) return;
		this._settings.visibleBatch = name;
		
		var show = [];
		for (var i=0; i < this._cells.length; i++){
			if (!this._cells[i]._settings.batch) 
				show.push(this._cells[i]);
			if (this._cells[i]._settings.batch == name)
				show.push(this._cells[i]);
			else
				this._hide(this._cells[i], null, true);
		}
		for (var i=0; i < show.length; i++)
			this._show(show[i], null, true);
		
		this._resize_childs();
	},
	_parse_cells:function(collection){
		collection = this._collection||collection; this._collection = null;
		
		this._cells=[];
		this._viewobj.style.verticalAlign="top";
		
		for (var i=0; i<collection.length; i++){
			dhx._parent_cell = this;
			this._cells[i]=ui._view(collection[i], this);
			if (!this._vertical_orientation)
				this._cells[i]._viewobj.style.cssFloat  = "left";
				
			if (this._settings.visibleBatch && this._settings.visibleBatch != this._cells[i]._settings.batch && this._cells[i]._settings.batch)
				this._cells[i]._settings.hidden = true;
				
			if (!this._cells[i]._settings.hidden)
				(this._dataobj||this._contentobj).appendChild(this._cells[i]._viewobj);
		}
		
	},
	_get_desired_size:function(){
		var width  = 0; 
		var height = 0;
		var xgrav = 0;
		var ygrav = 0;
		this._sizes=[];
		for (var i=0; i < this._cells.length; i++) {
			
			if (this._cells[i]._settings.hidden)
			//	this._sizes[i] = [0,0,0,0];
				continue;
			
					
			var sizes = this._sizes[i] = this._cells[i]._get_desired_size();
			if (this._vertical_orientation){
				width = Math.max(width, sizes[1]);
				xgrav = Math.max(xgrav, sizes[0]);
				
				height += sizes[3];
				ygrav+=sizes[2];
			} else {
				height = Math.max(height, sizes[3]);
				ygrav = Math.max(ygrav, sizes[2]);
				
				 
				width += sizes[1];
				xgrav += sizes[0];
			}
		}
		
		this._master_size = [ xgrav, width, ygrav, height ];
		
		if (this._settings.height > -1){
			height = this._settings.height;
			ygrav = 0;
		}
		if (this._settings.width > -1){
			width = this._settings.width;
			xgrav = 0;
		}
		if (this._vertical_orientation){
			if (width) xgrav  = 0;
			if (ygrav) height = 0;
		} else {
			if (height) ygrav  = 0;
			if (xgrav) width = 0;
		}
		
		if (dhx.debug_size)
			dhx.log("[get][layout] "+this.name+"@"+this._settings.id+" "+[xgrav, width, ygrav, height].join(","));
			
		return [ xgrav, width, ygrav, height ];
	},
	_set_size:function(x,y){ 
		if (dhx.debug_size)
			dhx.log("[set] "+this.name+"@"+this.config.id+" :"+x+","+y);
		dhx.ui.baseview.prototype._set_size.call(this,x,y);
		this._set_child_size(x,y);
	},
	_set_child_size:function(x,y){
		var delta_x = x-this._master_size[1];
		var delta_y = y-this._master_size[3];
		
		var control_x = this._master_size[0], control_y=this._master_size[2];
		var limit =  this._cells.length-1;
		for (var i=0; i < this._cells.length; i++){
			if (this._cells[i]._settings.hidden)
				continue;

			if (this._vertical_orientation){
				var width = x;
				var height;
				if (this._sizes[i][2]){
					height = Math.round(this._sizes[i][2]*delta_y/control_y);
					delta_y-=height; control_y-=this._sizes[i][2];
				} else {
					height = this._sizes[i][3];
					if (i == limit && delta_y > 0) height+=delta_y;
				}
			} else {
				var width;
				var height = y;
				if (this._sizes[i][0]){
					width = Math.round(this._sizes[i][0]*delta_x/control_x);
					delta_x-=width; control_x-=this._sizes[i][0];
				} else {
					width = this._sizes[i][1];
					if (i == limit && delta_x > 0) width+=delta_x;
				}
			}
			this._cells[i]._set_size(width,height);
		}
	}
}, dhx.ui.baseview);


/*
	don't render borders itself , but aware of layout , which can set some borders
*/
dhx.protoUI({
	name:"view",
	_init:function(){
		//this._contentobj = dhx.html.create("DIV");
		//this._viewobj.appendChild(this._contentobj);
		this._contentobj.style.border="1px solid #AEAEAE";
	},
	_get_desired_size:function(){
		var _borders = this._settings._inner;
		var size = dhx.ui.baseview.prototype._get_desired_size.call(this);
		if (!_borders) return size;
		var dx = (_borders.left?0:1)+(_borders.right?0:1);
		var dy = (_borders.top?0:1)+(_borders.bottom?0:1);
		
		if (size[1] && dx) size[1]+=dx;
		if (size[3] && dy) size[3]+=dy;
		return size;
	},
	_set_size:function(x,y){
		if (dhx.debug_size)
			dhx.log("[set] "+this.name+"@"+this.config.id+" :"+x+","+y);
			
		var _borders = this._settings._inner;
		if (_borders){
			x -= (_borders.left?0:1)+(_borders.right?0:1);
			y -= (_borders.top?0:1)+(_borders.bottom?0:1);
		} else 
			this._contentobj.style.border="0px solid #AEAEAE";
			
		return dhx.ui.baseview.prototype._set_size.call(this,x,y);
	}	
}, dhx.ui.baseview);


dhx.protoUI({
	name:"layout",
	_init:function(){
		this._hiddencells = 0;
	},
	_parse_cells:function(){
		this._viewobj.className += " dhx_layout_"+(this._settings.type||"");
		
		var collection = this._collection;
		if (!this._settings._inner){
			this._settings._inner = { top:true, left:true, right:true, bottom:true};
		}

		for (var i=0; i < collection.length; i++)
			collection[i]._inner=dhx.copy(this._settings._inner);
		var mode = false;
		if (this._settings.type=="clean")
			mode = true;
			
		if (this._vertical_orientation){
			for (var i=1; i < collection.length-1; i++)
				collection[i]._inner.top = collection[i]._inner.bottom = mode;
			if (collection.length>1){
				if (this._settings.type!="head")
					collection[0]._inner.bottom = mode;
				collection[collection.length-1]._inner.top = mode;
			}
		}
		else {
			for (var i=1; i < collection.length-1; i++)
				collection[i]._inner.left = collection[i]._inner.right= mode;
			if (collection.length>1){
				if (this._settings.type!="head")
					collection[0]._inner.right= mode;
				collection[collection.length-1]._inner.left = mode;
			}
		}
		
		ui.baselayout.prototype._parse_cells.call(this, collection);
		
		for (var i=0; i<collection.length; i++){
			var cell = this._cells[i];
			//if (cell._cells && !cell._render_borders) continue; 
			
			var _inner = cell._settings._inner;
			if (_inner.top) 
				cell._viewobj.style.borderTopWidth="0px";
			if (_inner.left) 
				cell._viewobj.style.borderLeftWidth="0px";
			if (_inner.right) 
				cell._viewobj.style.borderRightWidth="0px";
			if (_inner.bottom) 
				cell._viewobj.style.borderBottomWidth="0px";
		}
				
		if (this._vertical_orientation){ 
			for (var i=1; i<collection.length; i++)
				this._cells[i]._viewobj.style.marginTop=this._margin+"px";
		} else {
			for (var i=1; i<collection.length; i++)
				this._cells[i]._viewobj.style.marginLeft=this._margin+"px";
		}
	},
	_get_desired_size:function(){ 
		var size = dhx.ui.baselayout.prototype._get_desired_size.call(this);
		var correction = this._margin*(this._cells.length-this._hiddencells-1);
		if (this._vertical_orientation) {
			if (size[3]) size[3]+=correction;
		} else {
			if (size[1]) size[1]+=correction;
		}
		return size;
	},
	_set_size:function(x,y){ 
		if (dhx.debug_size)
			dhx.log("[set] " +this.name+"@"+this.config.id+" :"+x+","+y);
			
		dhx.ui.baseview.prototype._set_size.call(this,x,y);
		var correction = this._margin*(this._cells.length-this._hiddencells-1);
		
		if (this._vertical_orientation)
			y-=correction;
		else
			x-=correction;

		ui.baselayout.prototype._set_child_size.call(this, x,y);
	},
	type_setter:function(value){
		this._margin = this._margin_set[value];
		return value;
	},
	_margin_set:{ wide:4, clean:0, head:4, line:0 },
	_margin:-1
}, dhx.ui.baselayout);



dhx.protoUI({
	name:"template",
	_init:function(config){
		this.attachEvent("onXLE",this.render);
		this._after_init.push(this._probably_render_me);
	},
	setValues:function(obj){
		this.data = obj;
		this.render();
	},
	defaults:{
		template:dhx.Template.empty,
		loading:true
	},
	_probably_render_me:function(){
		if (!this._not_render_me)
			this.render();
	},
	src_setter:function(value){
		this._not_render_me = true;
		
		this.callEvent("onXLS",[]);
		dhx.ajax(value, dhx.bind(function(text){
			this._settings.template = dhx.Template(text);
			this._not_render_me = false;
			this._probably_render_me();
			this.callEvent("onXLE",[]);
		}, this));
		return value;
	},
	content_setter:function(config){
		if (config){
			this._not_render_me = true;
			this._dataobj.appendChild(dhx.toNode(config));
		}
	},
	refresh:function(){
		this.render();
	},
	waitMessage_setter:function(value){
		dhx.extend(this, dhx.ui.overlay);
		return value;
	},
	_one_time_scroll:true //scroll will appear only if set directly in config
}, dhx.Scrollable, dhx.AtomDataLoader, dhx.AtomRender, dhx.EventSystem, ui.view);


dhx.protoUI({
	name:"iframe",
	defaults:{
		loading:true
	},
	_init:function(){
		this._dataobj = this._contentobj;
		this._contentobj.innerHTML = "<iframe style='width:100%; height:100%' frameborder='0' src='about:blank'></iframe>";
	},
	load:function(value){
		this.src_setter(value);
	},
	src_setter:function(value){
		this._contentobj.childNodes[0].src = value;
		this.callEvent("onXLS",[]);
		dhx.delay(this._set_frame_handlers, this);
		return value;
	},
	_set_frame_handlers:function(){
		try {
			dhx.event(this.getWindow(), "load", dhx.bind(function(){
				this.callEvent("onXLS",[]);
			}, this));
		} catch (e){
			this.callEvent("onXLE",[]);
		}
	},
	getWindow:function(){
		return this._contentobj.childNodes[0].contentWindow;
	},
	waitMessage_setter:function(value){
		dhx.extend(this, dhx.ui.overlay);
		return value;
	}
}, ui.view, dhx.EventSystem);

dhx.ui.overlay = {
	_init:function(){
		if (dhx.isNotDefined(this._overlay) && this.attachEvent){
			this.attachEvent("onXLS", this.showOverlay);
			this.attachEvent("onXLE", this.hideOverlay);
			this._overlay = null;
		}
	},
	showOverlay:function(){
		if (!this._overlay){
			this._overlay = dhx.html.create("DIV",{ "class":"dhx_loading_overlay" },"");
			dhx.html.insertBefore(this._overlay, this._viewobj.firstChild, this._viewobj);
		}
	},
	hideOverlay:function(){
		if (this._overlay){
			dhx.html.remove(this._overlay);
			this._overlay = null;
		}
	}
};

/*scrollable view with another view insize*/
dhx.protoUI({
	name:"scrollview",
	defaults:{
		scroll:"x",
		scrollSpeed:"0ms"
	},
	_init:function(){
		this._viewobj.className += " dhx_scrollview";
	},
	content_setter:function(config){
		this._content_obj = dhx.ui._view(config);
		this._content_obj._parent_cell = this;
		this._dataobj.appendChild(this._content_obj._viewobj);
	},
	_get_desired_size:function(){
		this._content_desired = this._content_obj._get_desired_size();
		if(this._settings.scroll=="x"&&this._content_desired[3]>0)
			this._settings.height = this._content_desired[3];
		else if(this._settings.scroll=="y"&&this._content_desired[1]>0){
			this._settings.width = this._content_desired[1];
		}
		return dhx.ui.view.prototype._get_desired_size.call(this);
	},
	_set_size:function(x,y){
		if (dhx.ui.view.prototype._set_size.call(this,x,y)){
			this._content_obj._set_size(Math.max(this._content_desired[1], this._content_width),Math.max(this._content_desired[3], this._content_height));
			this._dataobj.style.width = this._content_obj._content_width+"px";
			this._dataobj.style.height = this._content_obj._content_height+"px";
		}
	}
}, dhx.Scrollable, ui.view);

})();

dhx.ui.view.call(dhx);
dhx.ui.layout.call(dhx);


/* DHX DEPEND FROM FILE 'ui/component.js'*/



/*DHX:Depend core/render/render.js*/
/*DHX:Depend core/datastore.js*/
/*DHX:Depend core/config.js*/
/*DHX:Depend core/load.js*/
/*DHX:Depend ui/view.js*/
/*DHX:Depend core/movable.js*/ 
/*DHX:Depend core/dhx.js*/

dhx.protoUI({
	name:"proto",
	_init:function(){
		this.data.provideApi(this, true);
		this._dataobj = this._contentobj;
		
		//render self , each time when data is updated
		this.data.attachEvent("onStoreUpdated",dhx.bind(function(){
			this.render.apply(this,arguments);
		},this));
	},
	_set_size:function(){
		if (dhx.ui.view.prototype._set_size.apply(this, arguments))
			this.render();
	}
}, dhx.RenderStack, dhx.DataLoader, dhx.ui.view, dhx.EventSystem, dhx.Settings);



/* DHX DEPEND FROM FILE 'ui/dataview.js'*/


/*
	UI:DataView
*/

/*DHX:Depend ui/dataview.css*/
/*DHX:Depend ui/component.js*/
/*DHX:Depend core/mouse.js*/ 	
/*DHX:Depend core/key.js*/ 					
/*DHX:Depend core/edit.js*/ 
/*DHX:Depend core/selection.js*/ 
/*DHX:Depend core/render/virtual_render.js*/ 

dhx.protoUI({
	name:"dataview",
	_init:function(){
		this._contentobj.className+=" dhx_dataview";
		this.data.provideApi(this,true);
	},
	_after_init_call:function(){
		if (this._settings.height!="auto")
			dhx.extend(this, dhx.VirtualRenderStack);	//extends RenderStack behavior
	},
	
	defaults:{
		edit:false,
		select:"multiselect", 
		type:"default",
		scroll:true
	},
	_id:"dhx_f_id",
	on_click:{
		dhx_dataview_item:function(e,id){ 
		//click on item
			if (this.stopEdit(false,id)){
				if (this._settings.select){
					if (this._settings.select=="multiselect")
						this.select(id, e.ctrlKey, e.shiftKey); 	//multiselection
					else
						this.select(id);
				}
			}
		}
	},
	on_dblclick:{
		dhx_dataview_item:function(e,id){ 
			//dblclick on item
			if (this._settings.edit)
				this.edit(id);	//edit it!
		}
	},
	on_mouse_move:{
	},
	dragMarker:function(context,ev){
		//get HTML element by item ID
		//can be null - when item is not rendered yet
		var el = this._locateHTML(context.target);
		
		//ficon and some other types share common bg marker
		if (this.type.drag_marker){
			if (this._drag_marker){
				//clear old drag marker position
				this._drag_marker.style.backgroundImage="";
				this._drag_marker.style.backgroundRepeat="";
			}
			
			// if item already rendered
			if (el) {
				//show drag marker
				el.style.backgroundImage="url("+(dhx.image_path||"")+this.type.drag_marker+")";
				el.style.backgroundRepeat="no-repeat";
				this._drag_marker = el;
			}
		}
		
		//auto-scroll during d-n-d, only if related option is enabled
		if (el && this._settings.auto_scroll){
			//maybe it can be moved to the drag behavior
			var dy = el.offsetTop;
			var dh = el.offsetHeight;
			var py = this._dataobj.scrollTop;
			var ph = this._dataobj.offsetHeight;
			//scroll up or down is mouse already pointing on top|bottom visible item
			if (dy-dh > 0 && dy-dh*0.75 < py)
				py = Math.max(dy-dh, 0);
			else if (dy+dh/0.75 > py+ph)
				py = py+dh;
		
			this._dataobj.scrollTop = py;
		}
		return true;
	},
	type:{
		css:"default",
		//normal state of item
		template:"<div style='padding:10px; white-space:nowrap; overflow:hidden;'>#value#</div>",
		//template for edit state of item
		templateEdit:dhx.Template("<div style='padding:10px; white-space:nowrap; overflow:hidden;'><textarea style='width:100%; height:100%;' bind='#text#'></textarea></div>"),
		//in case of dyn. loading - temporary spacer
		templateLoading:dhx.Template("<div style='padding:10px; white-space:nowrap; overflow:hidden;'>Loading...</div>"),
		width:139,
		height:22,
		margin:"0",
		padding:10,
		border:1,
		widthSize:function(obj, common){
			return common.width+(common.width>-1?"px":"");
		},
		heightSize:function(obj, common){
			return common.height+(common.height>-1?"px":"");
		},
		templateStart:dhx.Template("<div dhx_f_id='#id#' class='dhx_dataview_item dhx_dataview_{common.css}_item{obj.$selected?_selected:}' style='width:{common.widthSize()}; height:{common.heightSize()}; padding:{common.padding}px; margin:{common.margin}px; float:left; overflow:hidden;'>"),
		templateEnd:dhx.Template("</div>")
		
	},
	xCount_setter:function(value){
		var dim = this._getDimension();
		this._dataobj.style.width = dim.x*value+(this._settings.height != "auto"?18:0)+"px";
		return value;
	},
	yCount_setter:function(value){
		var dim = this._getDimension();
		this._dataobj.style.height = dim.y*value+"px";
		return value;
	},
	_getDimension:function(){
		var t = this.type;
		var d = (t.border||0)+(t.padding||0)*2+(t.margin||0)*2;
		return {x : t.width+d, y: t.height+d };
	}
}, dhx.MouseEvents, dhx.KeyEvents,dhx.SelectionModel, dhx.EditAbility,dhx.Scrollable, dhx.ui.proto);


dhx.Type(dhx.ui.dataview, {
	name:"FreeSize",
	css:"FreeSize",
	width:"auto",
	height:"auto"
});


/* DHX DEPEND FROM FILE 'ui/map.js'*/


/*DHX:Depend core/dhx.js*/
/*DHX:Depend ui/view.js*/

dhx.ui.Map = function(key){
	this._id = "map_"+dhx.uid();
	this._key = key;
	this._map = [];
};
dhx.ui.Map.prototype = {
	addRect: function(id,points,userdata) {
		this._createMapArea(id,"RECT",points,userdata);
	},
	addPoly: function(id,points) {
		this._createMapArea(id,"POLY",points);
	},
	_createMapArea:function(id,shape,coords,userdata){
		var extra_data = "";
		if(arguments.length==4) 
			extra_data = "userdata='"+userdata+"'";
		this._map.push("<area "+this._key+"='"+id+"' shape='"+shape+"' coords='"+coords.join()+"' "+extra_data+"></area>");
	},
	addSector:function(id,alpha0,alpha1,x,y,R,ky){
		var points = [];
		points.push(x);
		points.push(Math.floor(y*ky)); 
		for(var i = alpha0; i < alpha1; i+=Math.PI/18){
			points.push(Math.floor(x+R*Math.cos(i)));
			points.push(Math.floor((y+R*Math.sin(i))*ky));
		}
		points.push(Math.floor(x+R*Math.cos(alpha1)));
		points.push(Math.floor((y+R*Math.sin(alpha1))*ky));
		points.push(x);
		points.push(Math.floor(y*ky)); 
		
		return this.addPoly(id,points);
	},
	render:function(obj){
		var d = dhx.html.create("DIV");
		d.style.cssText="position:absolute; width:100%; height:100%; top:0px; left:0px;";
		obj.appendChild(d);
		var src = dhx.env.isIE?"":"src='data:image/gif;base64,R0lGODlhEgASAIAAAP///////yH5BAUUAAEALAAAAAASABIAAAIPjI+py+0Po5y02ouz3pwXADs='";
		d.innerHTML="<map id='"+this._id+"' name='"+this._id+"'>"+this._map.join("\n")+"</map><img "+src+" class='dhx_map_img' usemap='#"+this._id+"'>";
		
		obj._htmlmap = d; //for clearing routine
		
		this._map = [];
	}
};


/* DHX DEPEND FROM FILE 'core/math.js'*/


dhx.math = {};
dhx.math._toHex=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
dhx.math.toHex = function(number, length){
	number=parseInt(number,10);
	var str = "";
		while (number>0){
			str=this._toHex[number%16]+str;
			number=Math.floor(number/16);
		}
		while (str.length <length)
			str = "0"+str;
	return str;
};
dhx.math.toFixed = function(num){
	if (num<10)	return "0"+num;
	return num;
};





/* DHX DEPEND FROM FILE 'ui/chart/chart_base.js'*/


dhx.chart = {};


/* DHX DEPEND FROM FILE 'ui/chart/chart_area.js'*/


/*DHX:Depend ui/chart/chart_base.js*/
dhx.chart.area = {
	/**
	*   renders an area chart
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: width - the width of the container
	*   @param: height - the height of the container
	*   @param: sIndex - index of drawing chart
	*/
	pvt_render_area:function(ctx, data, point0, point1, sIndex, map){
				
	    var params = this._calculateParametersOfLineChart(ctx,data,point0,point1,sIndex);
			
		/*the value that defines the map area position*/
		var areaPos = Math.floor(params.cellWidth/2);
	
		/*drawing all items*/
		if (data.length) {
			
			ctx.globalAlpha = this._settings.alpha.call(this,data[0]);
			ctx.fillStyle = this._settings.color.call(this,data[0]);
		  
			/*the position of the first item*/
			var y0 = this._getYPointOfLineChart(data[0],point0,point1,params);
			var x0 = (this._settings.offset?point0.x+params.cellWidth*0.5:point0.x);
			ctx.beginPath();
			ctx.moveTo(x0,point1.y);
			ctx.lineTo(x0,y0);
			
			/*creates map area*/
			map.addRect(data[0].id,[x0-areaPos,y0-areaPos,x0+areaPos,y0+areaPos]);
			/*item label*/
			if(!this._settings.yAxis)
		    	this.renderTextAt(false, (!this._settings.offset?false:true), x0, y0-this._settings.labelOffset, this._settings.label(data[0]));
				
			/*drawing the previous item and the line between to items*/
			for(var i=1; i < data.length;i ++){
				/*horizontal positions of the previous and current items (0.5 - the fix for line width)*/
				var xi = x0+ Math.floor(params.cellWidth*i) - 0.5;
				var yi = this._getYPointOfLineChart(data[i],point0,point1,params);
				ctx.lineTo(xi,yi);
				/*creates map area*/
				map.addRect(data[i].id,[xi-areaPos,yi-areaPos,xi+areaPos,yi+areaPos]);
				/*item label*/
				if(!this._settings.yAxis)
					this.renderTextAt(false, (!this._settings.offset&&i==(data.length-1)?"left":"center"), xi, yi-this._settings.labelOffset, this._settings.label(data[i]));
			}
			ctx.lineTo(x0+Math.floor(params.cellWidth*[data.length-1]),point1.y);
			ctx.lineTo(x0,point1.y);
			ctx.fill();
		}
	}
};
dhx.chart.stackedArea ={
	/**
	*   renders an area chart
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: width - the width of the container
	*   @param: height - the height of the container
	*   @param: sIndex - index of drawing chart
	*/
	pvt_render_stackedArea:function(ctx, data, point0, point1, sIndex, map){
				
	  	var params = this._calculateParametersOfLineChart(ctx,data,point0,point1,sIndex);
			
		/*the value that defines the map area position*/
		var areaPos = Math.floor(params.cellWidth/2);
	  
	    var y1 = [];
	
		/*drawing all items*/
		if (data.length) {
			
			ctx.globalAlpha = this._settings.alpha.call(this,data[0]);
			ctx.fillStyle = this._settings.color.call(this,data[0]);
		   
		   /*for the 2nd, 3rd, etc. series*/
		    var y01 = (sIndex?data[0].$startY:point1.y);
		   
		   	/*the position of the first item*/
			var x0 = (this._settings.offset?point0.x+params.cellWidth*0.5:point0.x);
		  	var y02 = this._getYPointOfLineChart(data[0],point0,point1,params)-(sIndex?(point1.y-y01):0);
			
			y1[0] = y02;
				
			ctx.beginPath();
			ctx.moveTo(x0,y01);
			ctx.lineTo(x0,y02);
			
			/*creates map area*/
			map.addRect(data[0].id,[x0-areaPos,y02-areaPos,x0+areaPos,y02+areaPos]);
			/*item label*/
			if(!this._settings.yAxis)
		    	this.renderTextAt(false, true, x0, y02-this._settings.labelOffset, this._settings.label(data[0]));
			
			/*drawing the previous item and the line between to items*/
			for(var i=1; i < data.length;i ++){
				/*horizontal positions of the previous and current items (0.5 - the fix for line width)*/
				var xi = x0+ Math.floor(params.cellWidth*i) - 0.5;
				var yi2 = this._getYPointOfLineChart(data[i],point0,point1,params)-(sIndex?(point1.y-data[i].$startY):0);
				
				y1[i] = yi2;
				
				ctx.lineTo(xi,yi2);
				/*creates map area*/
				map.addRect(data[i].id,[xi-areaPos,yi2-areaPos,xi+areaPos,yi2+areaPos]);
				/*item label*/
				if(!this._settings.yAxis)
					this.renderTextAt(false, true, xi, yi2-this._settings.labelOffset, this._settings.label(data[i]));
			}
			ctx.lineTo(x0+Math.floor(params.cellWidth*[data.length-1]),y01);
			/*drawing lines of the lower part*/
			if(sIndex){
				for(var i=data.length-1; i >=0 ;i--){
					var xi = x0+ Math.floor(params.cellWidth*i) - 0.5;
					var yi1 = data[i].$startY;
					ctx.lineTo(xi,yi1);
				}
			}
			else ctx.lineTo(x0+ Math.floor(params.cellWidth*(length-1)) - 0.5,y01);
			ctx.lineTo(x0,y01);
			ctx.fill();
			for(var i=0; i < data.length;i ++){
				data[i].$startY = y1[i];
			}
		}
	}
};



/* DHX DEPEND FROM FILE 'ui/chart/chart_spline.js'*/


/*DHX:Depend ui/chart/chart_base.js*/
dhx.chart.spline = {
	/**
	*   renders a spline chart
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: width - the width of the container
	*   @param: height - the height of the container
	*   @param: sIndex - index of drawing chart
	*/
	pvt_render_spline:function(ctx, data, point0, point1, sIndex, map){
			
		var params = this._calculateParametersOfLineChart(ctx,data,point0,point1,sIndex);
		
		/*the value that defines the map area position*/
		var areaPos = Math.floor(params.cellWidth/2);
		
		/*array of all points*/
		var items = [];
		
		/*drawing all items*/
		if (data.length) {
		   
			/*getting all points*/
			var x0 = (this._settings.offset?point0.x+params.cellWidth*0.5:point0.x);
			for(var i=0; i < data.length;i ++){
				var x = ((!i)?x0:Math.floor(params.cellWidth*i) - 0.5 + x0);
			    var y = this._getYPointOfLineChart(data[i],point0,point1,params);		
				items.push({x:x,y:y});
			}
			var sparam = this._getSplineParameters(items);
			
			for(var i =0; i< items.length-1; i++){
				var x1 = items[i].x;
				var y1 = items[i].y;
				var x2 = items[i+1].x;
				var y2 = items[i+1].y;
				
				
				for(var j = x1; j < x2; j++)
					this._drawLine(ctx,j,this._getSplineYPoint(j,x1,i,sparam.a,sparam.b,sparam.c,sparam.d),j+1,this._getSplineYPoint(j+1,x1,i,sparam.a,sparam.b,sparam.c,sparam.d),this._settings.line.color(data[i]),this._settings.line.width);
				this._drawLine(ctx,x2-1,this._getSplineYPoint(j,x1,i,sparam.a,sparam.b,sparam.c,sparam.d),x2,y2,this._settings.line.color(data[i]),this._settings.line.width);
				this._drawItemOfLineChart(ctx,x1,y1,data[i],this._settings.label(data[i]));
			}
			this._drawItemOfLineChart(ctx,x2,y2,data[i],this._settings.label(data[i]));
		}
	},
	/*gets spline parameter*/
	_getSplineParameters:function(points){
		var h,u,v,s,a,b,c,d,n,m;
		h = [];	m = [];
		n = points.length;
		
		for(var i =0; i<n-1;i++){
			h[i] = points[i+1].x - points[i].x;
			m[i] = (points[i+1].y - points[i].y)/h[i];
		}
		u = [];	v = [];
		u[0] = 0;
		u[1] = 2*(h[0] + h[1]);
		v[0] = 0;
		v[1] = 6*(m[1] - m[0]);
		for(var i =2; i < n-1; i++){
			u[i] = 2*(h[i-1]+h[i]) - h[i-1]*h[i-1]/u[i-1];
	    	v[i] = 6*(m[i]-m[i-1]) - h[i-1]*v[i-1]/u[i-1];
		}
		
		s = [];
		s[n-1] = s[0] = 0;
		for(var i = n -2; i>=1; i--)
	   		s[i] = (v[i] - h[i]*s[i+1])/u[i];
	
        a = []; b = []; c = [];	d = []; 
		
		for(var i =0; i<n-1;i++){
			a[i] = points[i].y;
			b[i] = - h[i]*s[i+1]/6 - h[i]*s[i]/3 + (points[i+1].y-points[i].y)/h[i];
			c[i] = s[i]/2;
			d[i] = (s[i+1] - s[i])/(6*h[i]);
		}
		return {a:a,b:b,c:c,d:d};
	},
	/*returns the y position of the spline point */
	_getSplineYPoint:function(x,xi,i,a,b,c,d){
		return a[i] + (x - xi)*(b[i] + (x-xi)*(c[i]+(x-xi)*d[i])); 
	}
};


/* DHX DEPEND FROM FILE 'ui/chart/chart_barh.js'*/


/*DHX:Depend ui/chart/chart_base.js*/
dhx.chart.barH = {
	/**
	*   renders a bar chart
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: x - the width of the container
	*   @param: y - the height of the container
	*   @param: sIndex - index of drawing chart
	*/
	pvt_render_barH:function(ctx, data, point0, point1, sIndex, map){
	     var maxValue,minValue;
		/*necessary if maxValue - minValue < 0*/
		var valueFactor;
		/*maxValue - minValue*/
		var relValue;
		
		var total_width = point1.x-point0.x;
		
		var yax = !!this._settings.yAxis;
		var xax = !!this._settings.xAxis;
		
		var limits = this._getLimits("h");
		maxValue = limits.max;
		minValue = limits.min;
		
		/*an available width for one bar*/
		var cellWidth = Math.floor((point1.y-point0.y)/data.length);
		
		/*draws x and y scales*/
		if(!sIndex)
			this._drawHScales(ctx,data,point0, point1,minValue,maxValue,cellWidth);
		
		/*necessary for automatic scale*/
		if(yax){
		    maxValue = parseFloat(this._settings.xAxis.end);
			minValue = parseFloat(this._settings.xAxis.start);      
		}
		
		/*unit calculation (bar_height = value*unit)*/
		var relativeValues = this._getRelativeValue(minValue,maxValue);
		relValue = relativeValues[0];
		valueFactor = relativeValues[1];
		
		var unit = (relValue?total_width/relValue:10);
		if(!yax){
			/*defines start value for better representation of small values*/
			var startValue = 10;
			unit = (relValue?(total_width-startValue)/relValue:10);
		}
		
		
		/*a real bar width */
		var barWidth = parseInt(this._settings.barWidth,10);
		if((barWidth*this._series.length+4)>cellWidth) barWidth = cellWidth/this._series.length-4;
		/*the half of distance between bars*/
		var barOffset = Math.floor((cellWidth - barWidth*this._series.length)/2);
		/*the radius of rounding in the top part of each bar*/
		var radius = (typeof this._settings.radius!="undefined"?parseInt(this._settings.radius,10):Math.round(barWidth/5));
		if(barWidth/2<radius)
			radius = barWidth/2;
			
		var inner_gradient = false;
		var gradient = this._settings.gradient;
	
		if (gradient&&typeof(gradient) != "function"){
			inner_gradient = gradient;
			gradient = false;
		} else if (gradient){
			gradient = ctx.createLinearGradient(point0.x,point0.y,point1.x,point0.y);
			this._settings.gradient(gradient);
		}
		var scaleY = 0;
		/*draws a black line if the horizontal scale isn't defined*/
		if(!yax){
			this._drawLine(ctx,point0.x-0.5,point0.y,point0.x-0.5,point1.y,"#000000",1); //hardcoded color!
		}
		
		
		
		for(var i=0; i < data.length;i ++){
			
			
			var value =  parseFloat(this._settings.value(data[i]));
			if(value>maxValue) value = maxValue;
			value -= minValue;
			value *= valueFactor;
			
			/*start point (bottom left)*/
			var x0 = point0.x;
			var y0 = point0.y+ barOffset + i*cellWidth+(barWidth+1)*sIndex;
			
			if(value<0||(this._settings.yAxis&&value===0)){
				this.renderTextAt(true, true, x0+Math.floor(barWidth/2),y0,this._settings.label(data[i]));
				continue;
			}
			
			/*takes start value into consideration*/
			if(!yax) value += startValue/unit;
			var color = gradient||this._settings.color.call(this,data[i]);
			
			/*drawing the gradient border of a bar*/
			if(this._settings.border){
				ctx.beginPath();
				ctx.fillStyle = color;
				this._setBarHPoints(ctx,x0,y0,barWidth,radius,unit,value,0);
				ctx.lineTo(x0,0);
				ctx.fill();

				ctx.fillStyle = "#000000";
				ctx.globalAlpha = 0.37;
				ctx.beginPath();
				this._setBarHPoints(ctx,x0,y0,barWidth,radius,unit,value,0);
				ctx.fill();
			}
			
			/*drawing bar body*/
			ctx.globalAlpha = this._settings.alpha.call(this,data[i]);
			ctx.fillStyle = (gradient||this._settings.color.call(this,data[i]));
			ctx.beginPath();
			var points = this._setBarHPoints(ctx,x0,y0,barWidth,radius,unit,value,(this._settings.border?1:0));
			if (gradient&&!inner_gradient) ctx.lineTo(point0.x+total_width,y0+(this._settings.border?1:0)); //fix gradient sphreading
   			ctx.fill();
			ctx.globalAlpha = 1;
			
			if (inner_gradient!==false){
				var gradParam = this._setBarGradient(ctx,point0.x,y0+barWidth,point0.x+unit*value+2,y0,inner_gradient,color,"x");
				ctx.fillStyle = gradParam.gradient;
				ctx.beginPath();
				var points = this._setBarHPoints(ctx,x0,y0+gradParam.offset,barWidth-gradParam.offset*2,radius,unit,value,gradParam.offset);
				ctx.fill();
				ctx.globalAlpha = 1;
			}
			
			
			/*sets a bar label*/
			this.renderTextAt("middle",false,points[0]+3, parseInt(y0+(points[1]-y0)/2,10), this._settings.label(data[i]));
			/*defines a map area for a bar*/
			map.addRect(data[i].id,[x0,y0,points[0],points[1]],sIndex);
		}
	},
	/**
	*   sets points for bar and returns the position of the bottom right point
	*   @param: ctx - canvas object
	*   @param: x0 - the x position of start point
	*   @param: y0 - the y position of start point
	*   @param: barWidth - bar width 
	*   @param: radius - the rounding radius of the top
	*   @param: unit - the value defines the correspondence between item value and bar height
	*   @param: value - item value
	*   @param: offset - the offset from expected bar edge (necessary for drawing border)
	*/
	_setBarHPoints:function(ctx,x0,y0,barWidth,radius,unit,value,offset){
		/*correction for displaing small values (when rounding radius is bigger than bar height)*/
		var angle_corr = 0;
		if(radius>unit*value){
			var sinA = (radius-unit*value)/radius;
			angle_corr = -Math.asin(sinA)+Math.PI/2;
		}
		/*start*/
		ctx.moveTo(x0,y0+offset);
		/*start of left rounding*/
		var x1 = x0 + unit*value - radius - (radius?0:offset);
		if(radius<unit*value)
			ctx.lineTo(x1,y0+offset);
   		/*left rounding*/
		var y2 = y0 + radius;
		if (radius)
			ctx.arc(x1,y2,radius-offset,-Math.PI/2+angle_corr,0,false);
   		/*start of right rounding*/
		var y3 = y0 + barWidth - radius - (radius?0:offset);
		var x3 = x1 + radius - (radius?offset:0);
		ctx.lineTo(x3,y3);
		/*right rounding*/
		var x4 = x1;
		if (radius)
			ctx.arc(x4,y3,radius-offset,0,Math.PI/2-angle_corr,false);
   		/*bottom right point*/
		var y5 = y0 + barWidth-offset;
        ctx.lineTo(x0,y5);
		/*line to the start point*/
   		ctx.lineTo(x0,y0+offset);
   	//	ctx.lineTo(x0,0); //IE fix!
		return [x3,y5];
	},
	 _drawHScales:function(ctx,data,point0,point1,start,end,cellWidth){
	    this._drawHXAxis(ctx,data,point0,point1,start,end);
		this._drawHYAxis(ctx,data,point0,point1,cellWidth);
	},
	_drawHYAxis:function(ctx,data,point0,point1,cellWidth){
		if (!this._settings.yAxis) return;
		
		var x0 = point0.x-0.5;
		var y0 = point1.y+0.5;
		var y1 = point0.y;
			
		this._drawLine(ctx,x0,y0,x0,y1,this._settings.yAxis.color,1);
		
		for(var i=0; i < data.length;i ++){
				
			/*scale labels*/
			this.renderTextAt("middle",0,0,y1+cellWidth/2+i*cellWidth,
				this._settings.yAxis.template(data[i]),
				"dhx_axis_item_y",point0.x-5
			);
		}
		this._setYAxisTitle(point0,point1);
	},
	_drawHXAxis:function(ctx,data,point0,point1,start,end){
		var step;
		var scaleParam= {};
		var axis = this._settings.xAxis;
		if (!axis) return;
		
		var y0 = point1.y+0.5;
		var x0 = point0.x-0.5;
		var x1 = point1.x-0.5;
		
		this._drawLine(ctx,x0,y0,x1,y0,axis.color,1);
		
		if(axis.step)
		     step = parseFloat(axis.step);
		
		if(typeof axis.step =="undefined"||typeof axis.start=="undefined"||typeof axis.end =="undefined"){
			scaleParam = this._calculateScale(start,end);
			start = scaleParam.start;
			end = scaleParam.end;
			step = scaleParam.step;
			this._settings.xAxis.end = end;
			this._settings.xAxis.start = start;
			this._settings.xAxis.step = step;
		}
		
		if(step===0) return;
		var stepHeight = (x1-x0)*step/(end-start);
		var c = 0;
		for(var i = start; i<=end; i += step){
			if(scaleParam.fixNum)  i = parseFloat((new Number(i)).toFixed(scaleParam.fixNum));
			var xi = Math.floor(x0+c*stepHeight)+ 0.5;/*canvas line fix*/
			if(i!=start &&axis.lines)
				this._drawLine(ctx,xi,y0,xi,point0.y,this._settings.xAxis.color,0.2);	
			this.renderTextAt(false, true,xi,y0+2,axis.template(i.toString()),"dhx_axis_item_x");
			c++;
		}
		this.renderTextAt(true, false, x0,point1.y+this._settings.padding.bottom-3,
			this._settings.xAxis.title,
			"dhx_axis_title_x",
			point1.x - point0.x
		);
		/*the right border in lines in scale are enabled*/
		if (!axis.lines) return;
			this._drawLine(ctx,x0,point0.y-0.5,x1,point0.y-0.5,this._settings.xAxis.color,0.2);
	}
	
};



/* DHX DEPEND FROM FILE 'ui/chart/chart_stackedbarh.js'*/


/*DHX:Depend ui/chart/chart_base.js*/
/*DHX:Depend ui/chart/chart_barh.js*/
dhx.assert(dhx.chart.barH);
dhx.chart.stackedBarH = {
/**
	*   renders a bar chart
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: x - the width of the container
	*   @param: y - the height of the container
	*   @param: sIndex - index of drawing chart
	*   @param: map - map object
	*/
	pvt_render_stackedBarH:function(ctx, data, point0, point1, sIndex, map){
	   var maxValue,minValue;
		/*necessary if maxValue - minValue < 0*/
		var valueFactor;
		/*maxValue - minValue*/
		var relValue;
		
		var total_width = point1.x-point0.x;
		
		var yax = !!this._settings.yAxis;
		var xax = !!this._settings.xAxis;
		
		var limits = this._getStackedLimits(data);
		maxValue = limits.max;
		minValue = limits.min;
		
		/*an available width for one bar*/
		var cellWidth = Math.floor((point1.y-point0.y)/data.length);
	
		/*draws x and y scales*/
		if(!sIndex)
			this._drawHScales(ctx,data,point0, point1,minValue,maxValue,cellWidth);
		
		/*necessary for automatic scale*/
		if(yax){
		    maxValue = parseFloat(this._settings.xAxis.end);
			minValue = parseFloat(this._settings.xAxis.start);      
		}
		
		/*unit calculation (bar_height = value*unit)*/
		var relativeValues = this._getRelativeValue(minValue,maxValue);
		relValue = relativeValues[0];
		valueFactor = relativeValues[1];
		
		var unit = (relValue?total_width/relValue:10);
		if(!yax){
			/*defines start value for better representation of small values*/
			var startValue = 10;
			unit = (relValue?(total_width-startValue)/relValue:10);
		}
		
		/*a real bar width */
		var barWidth = parseInt(this._settings.barWidth,10);
		if((barWidth+4)>cellWidth) barWidth = cellWidth-4;
		/*the half of distance between bars*/
		var barOffset = Math.floor((cellWidth - barWidth)/2);
		/*the radius of rounding in the top part of each bar*/
		var radius = 0;
		
		var inner_gradient = false;
		var gradient = this._settings.gradient;
	
		var inner_gradient = false;
		var gradient = this._settings.gradient;
		if (gradient){
			inner_gradient = true;
		} 
		var scaleY = 0;
		/*draws a black line if the horizontal scale isn't defined*/
		if(!yax){
			this._drawLine(ctx,point0.x-0.5,point0.y,point0.x-0.5,point1.y,"#000000",1); //hardcoded color!
		}
		
		for(var i=0; i < data.length;i ++){
			
			if(!sIndex) 
			   data[i].$startX = point0.x;
			
			var value =  parseFloat(this._settings.value(data[i]));
			if(value>maxValue) value = maxValue;
			value -= minValue;
			value *= valueFactor;
			
			/*start point (bottom left)*/
			var x0 = point0.x;
			var y0 = point0.y+ barOffset + i*cellWidth;
			
			/*for the 2nd, 3rd, etc. series*/
			if(sIndex)
			    x0 = data[i].$startX;
			
			if(value<0||(this._settings.yAxis&&value===0)){
				this.renderTextAt(true, true, x0+Math.floor(barWidth/2),y0,this._settings.label(data[i]));
				continue;
			}
			
			/*takes start value into consideration*/
			if(!yax) value += startValue/unit;
			var color = this._settings.color.call(this,data[i]);
			
			/*drawing the gradient border of a bar*/
			if(this._settings.border){
				ctx.beginPath();
				ctx.fillStyle = color;
				this._setBarHPoints(ctx,x0,y0,barWidth,radius,unit,value,0);
				ctx.lineTo(x0,0);
				ctx.fill();

				ctx.fillStyle = "#000000";
				ctx.globalAlpha = 0.37;
				ctx.beginPath();
				this._setBarHPoints(ctx,x0,y0,barWidth,radius,unit,value,0);
				ctx.fill();
			}
			ctx.globalAlpha = 1;
			/*drawing bar body*/
			ctx.globalAlpha = this._settings.alpha.call(this,data[i]);
			ctx.fillStyle = this._settings.color.call(this,data[i]);
			ctx.beginPath();
			var points = this._setBarHPoints(ctx,x0,y0,barWidth,radius,unit,value,(this._settings.border?1:0));
			if (gradient&&!inner_gradient) ctx.lineTo(point0.x+total_width,y0+(this._settings.border?1:0)); //fix gradient sphreading
   			ctx.fill();
			
			if (inner_gradient!==false){
				var gradParam = this._setBarGradient(ctx,x0,y0+barWidth,x0,y0,inner_gradient,color,"x");
				ctx.fillStyle = gradParam.gradient;
				ctx.beginPath();
				var points = this._setBarHPoints(ctx,x0,y0, barWidth,radius,unit,value,0);
				ctx.fill();
				ctx.globalAlpha = 1;
			}
			
			/*sets a bar label*/
			this.renderTextAt("middle",true,data[i].$startX+(points[0]-data[i].$startX)/2-1, y0+(points[1]-y0)/2, this._settings.label(data[i]));
			/*defines a map area for a bar*/
			map.addRect(data[i].id,[data[i].$startX,y0,points[0],points[1]],sIndex);
			/*the start position for the next series*/
			data[i].$startX = points[0];
		}
	}
};


/* DHX DEPEND FROM FILE 'ui/chart/chart_stackedbar.js'*/


/*DHX:Depend ui/chart/chart_base.js*/
dhx.chart.stackedBar = {
	/**
	*   renders a bar chart
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: x - the width of the container
	*   @param: y - the height of the container
	*   @param: sIndex - index of drawing chart
	*/
	pvt_render_stackedBar:function(ctx, data, point0, point1, sIndex, map){
	     var maxValue,minValue;
		/*necessary if maxValue - minValue < 0*/
		var valueFactor;
		/*maxValue - minValue*/
		var relValue;
		
		var total_height = point1.y-point0.y;
		
		var yax = !!this._settings.yAxis;
		var xax = !!this._settings.xAxis;
		
		var limits = this._getStackedLimits(data);
		maxValue = limits.max;
		minValue = limits.min;
		
		/*an available width for one bar*/
		var cellWidth = Math.floor((point1.x-point0.x)/data.length);
		
		/*draws x and y scales*/
		if(!sIndex)
			this._drawScales(ctx,data,point0, point1,minValue,maxValue,cellWidth);
		
		/*necessary for automatic scale*/
		if(yax){
		    maxValue = parseFloat(this._settings.yAxis.end);
			minValue = parseFloat(this._settings.yAxis.start);      
		}
		
		/*unit calculation (bar_height = value*unit)*/
		var relativeValues = this._getRelativeValue(minValue,maxValue);
		relValue = relativeValues[0];
		valueFactor = relativeValues[1];
		
		var unit = (relValue?total_height/relValue:10);
		
		/*a real bar width */
		var barWidth = parseInt(this._settings.barWidth,10);
		if(barWidth+4 > cellWidth) barWidth = cellWidth-4;
		/*the half of distance between bars*/
		var barOffset = Math.floor((cellWidth - barWidth)/2);
		
		
		var inner_gradient = (this._settings.gradient?this._settings.gradient:false);
		
		var scaleY = 0;
		/*draws a black line if the horizontal scale isn't defined*/
		if(!xax){
			//scaleY = y-bottomPadding;
			this._drawLine(ctx,point0.x,point1.y+0.5,point1.x,point1.y+0.5,"#000000",1); //hardcoded color!
		}
		
		for(var i=0; i < data.length;i ++){
			var value =  parseFloat(this._settings.value(data[i]));
			if(!value) continue;
			
			/*adjusts the first tab to the scale*/
			if(!sIndex)
				value -= minValue;

			value *= valueFactor;
			
			/*start point (bottom left)*/
			var x0 = point0.x + barOffset + i*cellWidth;
			var y0 = point1.y;
			
			/*for the 2nd, 3rd, etc. series*/
			if(sIndex)
			    y0 = data[i].$startY;
			
			/*the max height limit*/
			if(y0 < (point0.y+1)) continue;
			
			if(value<0||(this._settings.yAxis&&value===0)){
				this.renderTextAt(true, true, x0+Math.floor(barWidth/2),y0,this._settings.label(data[i]));
				continue;
			}
			
			var color = this._settings.color.call(this,data[i]);
			
			/*drawing the gradient border of a bar*/
			if(this._settings.border){
				ctx.beginPath();
				ctx.fillStyle = color;
				this._setStakedBarPoints(ctx,x0-1,y0,barWidth+2,unit,value,0,point0.y);
				ctx.lineTo(x0,y0);
				ctx.fill();

				ctx.fillStyle = "#000000";
				ctx.globalAlpha = 0.37;
				ctx.beginPath();
				this._setStakedBarPoints(ctx,x0-1,y0,barWidth+2,unit,value,0,point0.y);
				ctx.fill();
			}
			
			/*drawing bar body*/
			ctx.globalAlpha = this._settings.alpha.call(this,data[i]);
			ctx.fillStyle = this._settings.color.call(this,data[i]);
			ctx.beginPath();
			var points = this._setStakedBarPoints(ctx,x0,y0,barWidth,unit,value,(this._settings.border?1:0),point0.y);
   			ctx.fill();
			ctx.globalAlpha = 1;
			
			/*gradient*/
			if (inner_gradient){
				var gradParam = this._setBarGradient(ctx,x0,y0,x0+barWidth,points[1],inner_gradient,color,"y");
				ctx.fillStyle = gradParam.gradient;
				ctx.beginPath();
				var points = this._setStakedBarPoints(ctx,x0+gradParam.offset,y0,barWidth-gradParam.offset*2,unit,value,(this._settings.border?1:0),point0.y);
				ctx.fill();
				ctx.globalAlpha = 1;
			}
			
			/*sets a bar label*/
			this.renderTextAt(false, true, x0+Math.floor(barWidth/2),(points[1]+(y0-points[1])/2)-7,this._settings.label(data[i]));
			/*defines a map area for a bar*/
			map.addRect(data[i].id,[x0,points[1],points[0],(data[i].$startY||y0)],sIndex);
			
			/*the start position for the next series*/
			data[i].$startY = (this._settings.border?(points[1]+1):points[1]);
		}
	},
	/**
	*   sets points for bar and returns the position of the bottom right point
	*   @param: ctx - canvas object
	*   @param: x0 - the x position of start point
	*   @param: y0 - the y position of start point
	*   @param: barWidth - bar width 
	*   @param: radius - the rounding radius of the top
	*   @param: unit - the value defines the correspondence between item value and bar height
	*   @param: value - item value
	*   @param: offset - the offset from expected bar edge (necessary for drawing border)
	*   @param: minY - the minimum y position for the bars ()
	*/
	_setStakedBarPoints:function(ctx,x0,y0,barWidth,unit,value,offset,minY){
		/*start*/
		ctx.moveTo(x0,y0);
		/*start of left rounding*/
		var y1 = y0 - unit*value+offset;
		/*maximum height limit*/
		if(y1<minY) 
			y1 = minY;
		ctx.lineTo(x0,y1);
   		var x3 = x0 + barWidth;
		var y3 = y1; 
		ctx.lineTo(x3,y3);
		/*right rounding*/
		var y4 = y1;
   		/*bottom right point*/
		var x5 = x0 + barWidth;
        ctx.lineTo(x5,y0);
		/*line to the start point*/
   		ctx.lineTo(x0,y0);
   	//	ctx.lineTo(x0,0); //IE fix!
		return [x5,y3-2*offset];
	}
};



/* DHX DEPEND FROM FILE 'ui/chart/chart_line.js'*/


/*DHX:Depend ui/chart/chart_base.js*/
dhx.chart.line = {

	/**
	*   renders a graphic
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: width - the width of the container
	*   @param: height - the height of the container
	*   @param: sIndex - index of drawing chart
	*/
	pvt_render_line:function(ctx, data, point0, point1, sIndex, map){
				
	    var params = this._calculateParametersOfLineChart(ctx,data,point0,point1,sIndex);
		
		/*the value that defines the map area position*/
		var areaPos = Math.floor(params.cellWidth/2);
		
		/*drawing all items*/
		if (data.length) {
		    /*gets the vertical coordinate of an item*/
			
			/*the position of the first item*/
			var y1 = this._getYPointOfLineChart(data[0],point0,point1,params);
			var x1 = (this._settings.offset?point0.x+params.cellWidth*0.5:point0.x);
			var x0 = x1;
			/*drawing the previous item and the line between to items*/
			for(var i=1; i <= data.length;i ++){
								
				/*horizontal positions of the item (0.5 - the fix for line width)*/
				//var x1 = Math.floor(params.cellWidth*(i-0.5)) - 0.5 + point0.x;
				var x2 = Math.floor(params.cellWidth*i) - 0.5 + x0;

				/*a line between items*/
				if (data.length!=i){
					var y2 = this._getYPointOfLineChart(data[i],point0,point1,params);
					this._drawLine(ctx,x1,y1,x2,y2,this._settings.line.color(data[i-1]),this._settings.line.width);
				}
				
				/*draws prevous item*/
				this._drawItemOfLineChart(ctx,x1,y1,data[i-1],!!this._settings.offset);
				
				/*creates map area*/
				map.addRect(data[i-1].id,[x1-areaPos,y1-areaPos,x1+areaPos,y1+areaPos]);
				
				y1=y2;
				x1=x2;
			}
		}
	},
	/**
	*   draws an item and its label
	*   @param: ctx - canvas object
	*   @param: x0 - the x position of a circle
	*   @param: y0 - the y position of a circle
	*   @param: obj - data object 
	*   @param: label - (boolean) defines wherether label needs being drawn 
	*/
	_drawItemOfLineChart:function(ctx,x0,y0,obj,label){
		var R = parseInt(this._settings.item.radius,10);
		ctx.lineWidth = parseInt(this._settings.item.borderWidth,10);
		ctx.fillStyle = this._settings.item.color(obj);
		ctx.strokeStyle = this._settings.item.borderColor(obj);
		ctx.beginPath();
		ctx.arc(x0,y0,R,0,Math.PI*2,true);
		ctx.fill();
		ctx.stroke();
		/*item label*/
		if(label)
			this.renderTextAt(false, true, x0,y0-R-this._settings.labelOffset,this._settings.label(obj));
	},
	/**
	*   gets the vertical position of the item
	*   @param: data - data object
	*   @param: y0 - the y position of chart start
	*   @param: y1 - the y position of chart end
	*   @param: params - the object with elements: minValue, maxValue, unit, valueFactor (the value multiple of 10) 
	*/
	_getYPointOfLineChart: function(data,point0,point1,params){
		var minValue = params.minValue;
		var maxValue = params.maxValue;
		var unit = params.unit;
		var valueFactor = params.valueFactor;
		/*the real value of an object*/
		var value = this._settings.value(data);
		/*a relative value*/
		var v = (parseFloat(value) - minValue)*valueFactor;
		if(!this._settings.yAxis)
			v += params.startValue/unit;
		/*a vertical coordinate*/
		var y = point1.y - Math.floor(unit*v);
		/*the limit of the minimum value is  the minimum visible value*/
		if(v<0) 
			y = point1.y;
		/*the limit of the maximum value*/
		if(value > maxValue) 
			y = point0.y;
		/*the limit of the minimum value*/
		if(value < minValue) 
			y = point1.y;
		return y;
	},
	_calculateParametersOfLineChart: function(ctx,data,point0,point1,sIndex){
		var params = {};
		
		/*maxValue - minValue*/
		var relValue;
		
		/*available height*/
		params.totalHeight = point1.y-point0.y;
		
		/*a space available for a single item*/
		//params.cellWidth = Math.round((point1.x-point0.x)/((!this._settings.offset&&this._settings.yAxis)?(data.length-1):data.length)); 
		params.cellWidth = Math.round((point1.x-point0.x)/((!this._settings.offset)?(data.length-1):data.length)); 
		
		/*scales*/
		var yax = !!this._settings.yAxis;
		var xax = !!this._settings.xAxis;
		
		var limits = (this._settings.type.indexOf("stacked")!=-1?this._getStackedLimits(data):this._getLimits());
		params.maxValue = limits.max;
		params.minValue = limits.min;
		
		/*draws x and y scales*/
		if(!sIndex)
			this._drawScales(ctx,data, point0, point1,params.minValue,params.maxValue,params.cellWidth);
		
		/*necessary for automatic scale*/
		if(yax){
		    params.maxValue = parseFloat(this._settings.yAxis.end);
			params.minValue = parseFloat(this._settings.yAxis.start);      
		}
		
		/*unit calculation (y_position = value*unit)*/
		var relativeValues = this._getRelativeValue(params.minValue,params.maxValue);
		relValue = relativeValues[0];
		params.valueFactor = relativeValues[1];
		params.unit = (relValue?params.totalHeight/relValue:10);
		
		params.startValue = 0;
		if(!yax){
			/*defines start value for better representation of small values*/
			params.startValue = (params.unit>10?params.unit:10);
			params.unit = (relValue?(params.totalHeight - params.startValue)/relValue:10);
		}
		return params;
	}
};



/* DHX DEPEND FROM FILE 'ui/chart/chart_bar.js'*/


/*DHX:Depend ui/chart/chart_base.js*/
dhx.chart.bar = {
	/**
	*   renders a bar chart
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: x - the width of the container
	*   @param: y - the height of the container
	*   @param: sIndex - index of drawing chart
	*/
	pvt_render_bar:function(ctx, data, point0, point1, sIndex, map){
	     var maxValue,minValue;
		/*necessary if maxValue - minValue < 0*/
		var valueFactor;
		/*maxValue - minValue*/
		var relValue;
		
		var total_height = point1.y-point0.y;
		
		var yax = !!this._settings.yAxis;
		var xax = !!this._settings.xAxis;
		
		var limits = this._getLimits();
		maxValue = limits.max;
		minValue = limits.min;
		
		/*an available width for one bar*/
		var cellWidth = Math.floor((point1.x-point0.x)/data.length);
		
		/*draws x and y scales*/
		if(!sIndex&&!(this._settings.origin!="auto"&&!yax)){
			this._drawScales(ctx,data,point0, point1,minValue,maxValue,cellWidth);
		}
		
		/*necessary for automatic scale*/
		if(yax){
		    maxValue = parseFloat(this._settings.yAxis.end);
			minValue = parseFloat(this._settings.yAxis.start);      
		}
		
		/*unit calculation (bar_height = value*unit)*/
		var relativeValues = this._getRelativeValue(minValue,maxValue);
		relValue = relativeValues[0];
		valueFactor = relativeValues[1];
		
		var unit = (relValue?total_height/relValue:relValue);
		if(!yax&&!(this._settings.origin!="auto"&&xax)){
			/*defines start value for better representation of small values*/
			var startValue = 10;
			unit = (relValue?(total_height-startValue)/relValue:startValue);
		}
		/*if yAxis isn't set, but with custom origin */
		if(!sIndex&&(this._settings.origin!="auto"&&!yax)&&this._settings.origin>minValue){
			this._drawXAxis(ctx,data,point0,point1,cellWidth,point1.y-unit*(this._settings.origin-minValue));
		}
		
		/*a real bar width */
		var barWidth = parseInt(this._settings.barWidth,10);
		if(this._series&&(barWidth*this._series.length+4)>cellWidth) barWidth = cellWidth/this._series.length-4;
		/*the half of distance between bars*/
		var barOffset = Math.floor((cellWidth - barWidth*this._series.length)/2);
		/*the radius of rounding in the top part of each bar*/
		var radius = (typeof this._settings.radius!="undefined"?parseInt(this._settings.radius,10):Math.round(barWidth/5));
		if(barWidth/2<radius)
			radius = barWidth/2;
		
		var inner_gradient = false;
		var gradient = this._settings.gradient;
		
		if(gradient && typeof(gradient) != "function"){
			inner_gradient = gradient;
			gradient = false;
		} else if (gradient){
			gradient = ctx.createLinearGradient(0,point1.y,0,point0.y);
			this._settings.gradient(gradient);
		}
		var scaleY = 0;
		/*draws a black line if the horizontal scale isn't defined*/
		if(!xax){
			this._drawLine(ctx,point0.x,point1.y+0.5,point1.x,point1.y+0.5,"#000000",1); //hardcoded color!
		}
		
		for(var i=0; i < data.length;i ++){
			var value =  parseFloat(this._settings.value(data[i])||0);
			if(value>maxValue) value = maxValue;
			value -= minValue;
			value *= valueFactor;
			
			/*start point (bottom left)*/
			var x0 = point0.x + barOffset + i*cellWidth+(barWidth+1)*sIndex;
			var y0 = point1.y;
		
			if(value<0||(this._settings.yAxis&&value===0&&!(this._settings.origin!="auto"&&this._settings.origin>minValue))){
				this.renderTextAt(true, true, x0+Math.floor(barWidth/2),y0,this._settings.label(data[i]));
				continue;
			}
			
			/*takes start value into consideration*/
			if(!yax&&!(this._settings.origin!="auto"&&xax)) value += startValue/unit;
			
			var color = gradient||this._settings.color.call(this,data[i]);
	
			/*drawing the gradient border of a bar*/
			if(this._settings.border)
				this._drawBarBorder(ctx,x0,y0,barWidth,minValue,radius,unit,value,color);
			
			/*drawing bar body*/
			ctx.globalAlpha = this._settings.alpha.call(this,data[i]);
			var points = this._drawBar(ctx,point0,x0,y0,barWidth,minValue,radius,unit,value,color,gradient,inner_gradient);
			ctx.globalAlpha = 1;
			
			if (inner_gradient){
				this._drawBarGradient(ctx,x0,y0,barWidth,minValue,radius,unit,value,color,inner_gradient);
			}
			/*sets a bar label*/
			if(points[0]!=x0)
				this.renderTextAt(false, true, x0+Math.floor(barWidth/2),points[1],this._settings.label(data[i]));
			else
				this.renderTextAt(true, true, x0+Math.floor(barWidth/2),points[3],this._settings.label(data[i]));
			/*defines a map area for a bar*/
			map.addRect(data[i].id,[x0,points[3],points[2],points[1]],sIndex);
		}
	},
	_correctBarParams:function(ctx,x,y,value,unit,barWidth,minValue){
		var xax = this._settings.xAxis;
		var axisStart = y;
		if(!!xax&&this._settings.origin!="auto" && (this._settings.origin>minValue)){
			y -= (this._settings.origin-minValue)*unit;
			axisStart = y;
			value = value-(this._settings.origin-minValue);
			if(value < 0){
				value *= (-1);
			 	ctx.translate(x+barWidth,y);
				ctx.rotate(Math.PI);
				x = 0;
				y = 0;
			}
			y -= 0.5;
		}
		
		return {value:value,x0:x,y0:y,start:axisStart};
	},
	_drawBar:function(ctx,point0,x0,y0,barWidth,minValue,radius,unit,value,color,gradient,inner_gradient){
		ctx.save();
		ctx.fillStyle = color;
		var p = this._correctBarParams(ctx,x0,y0,value,unit,barWidth,minValue);
		var points = this._setBarPoints(ctx,p.x0,p.y0,barWidth,radius,unit,p.value,(this._settings.border?1:0));
		if (gradient&&!inner_gradient) ctx.lineTo(p.x0+(this._settings.border?1:0),point0.y); //fix gradient sphreading
   		ctx.fill();
	    ctx.restore();
		var x1 = p.x0;
		var x2 = (p.x0!=x0?x0+points[0]:points[0]);
		var y1 = (p.x0!=x0?(p.start-points[1]):y0);
		var y2 = (p.x0!=x0?p.start:points[1]);
		return [x1,y1,x2,y2];
	},
	_drawBarBorder:function(ctx,x0,y0,barWidth,minValue,radius,unit,value,color){
		ctx.save();
		var p = this._correctBarParams(ctx,x0,y0,value,unit,barWidth,minValue);
		
		ctx.fillStyle = color;
		this._setBarPoints(ctx,p.x0,p.y0,barWidth,radius,unit,p.value,0);
		ctx.lineTo(p.x0,0);
		ctx.fill();
	   
				
		ctx.fillStyle = "#000000";
		ctx.globalAlpha = 0.37;
		
		this._setBarPoints(ctx,p.x0,p.y0,barWidth,radius,unit,p.value,0);
		ctx.fill();
	    ctx.restore();
	},
	_drawBarGradient:function(ctx,x0,y0,barWidth,minValue,radius,unit,value,color,inner_gradient){
		ctx.save();
		//y0 -= (dhx.env.isIE?0:0.5);
		var p = this._correctBarParams(ctx,x0,y0,value,unit,barWidth,minValue);
		var gradParam = this._setBarGradient(ctx,p.x0,p.y0,p.x0+barWidth,p.y0-unit*p.value+2,inner_gradient,color,"y");
		ctx.fillStyle = gradParam.gradient;
		this._setBarPoints(ctx,p.x0+gradParam.offset,p.y0,barWidth-gradParam.offset*2,radius,unit,p.value,gradParam.offset);
		ctx.fill();
	    ctx.restore();
	},
	/**
	*   sets points for bar and returns the position of the bottom right point
	*   @param: ctx - canvas object
	*   @param: x0 - the x position of start point
	*   @param: y0 - the y position of start point
	*   @param: barWidth - bar width 
	*   @param: radius - the rounding radius of the top
	*   @param: unit - the value defines the correspondence between item value and bar height
	*   @param: value - item value
	*   @param: offset - the offset from expected bar edge (necessary for drawing border)
	*/
	_setBarPoints:function(ctx,x0,y0,barWidth,radius,unit,value,offset){
		/*correction for displaing small values (when rounding radius is bigger than bar height)*/
		ctx.beginPath();
		//y0 = 0.5;
		var angle_corr = 0;
		if(radius>unit*value){
			var cosA = (radius-unit*value)/radius;
			if(cosA<=1&&cosA>=-1)
				angle_corr = -Math.acos(cosA)+Math.PI/2;
		}
		/*start*/
		ctx.moveTo(x0+offset,y0);
		/*start of left rounding*/
		var y1 = y0 - Math.floor(unit*value) + radius + (radius?0:offset);
		if(radius<unit*value)
			ctx.lineTo(x0+offset,y1);
   		/*left rounding*/
		var x2 = x0 + radius;
		if (radius&&radius>0)
			ctx.arc(x2,y1,radius-offset,-Math.PI+angle_corr,-Math.PI/2,false);
   		/*start of right rounding*/
		var x3 = x0 + barWidth - radius - (radius?0:offset);
		var y3 = y1 - radius+(radius?offset:0);
		ctx.lineTo(x3,y3);
		/*right rounding*/
		var y4 = y1;
		if (radius&&radius>0)
			ctx.arc(x3,y4,radius-offset,-Math.PI/2,0-angle_corr,false);
   		/*bottom right point*/
		var x5 = x0 + barWidth-offset;
        ctx.lineTo(x5,y0);
		/*line to the start point*/
   		ctx.lineTo(x0+offset,y0);
   	//	ctx.lineTo(x0,0); //IE fix!
		return [x5,y3];
	}
};


/* DHX DEPEND FROM FILE 'ui/chart/chart_pie.js'*/


/*DHX:Depend ui/chart/chart_base.js*/
dhx.chart.pie = {
	pvt_render_pie:function(ctx,data,x,y,sIndex,map){
		this._renderPie(ctx,data,x,y,1,map);
		
	}, 
	/**
	*   renders a pie chart
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: x - the width of the container
	*   @param: y - the height of the container
	*   @param: ky - value from 0 to 1 that defines an angle of inclination (0<ky<1 - 3D chart)
	*/
	_renderPie:function(ctx,data,point0,point1,ky,map){
				
		var totalValue = 0;
		var coord = this._getPieParameters(point0,point1);
		/*pie radius*/
		var radius = (this._settings.radius?this._settings.radius:coord.radius);
		var maxValue = this.data.max(this._settings.value);
		/*weighed values (the ratio of object value to total value)*/
		var ratios = [];
		/*real values*/
		var values = [];
		var prevSum = 0;

		for(var i = 0; i < data.length;i++)
           totalValue += parseFloat(this._settings.value(data[i]));
		
		for(var i = 0; i < data.length;i++){
			values[i] = parseFloat(this._settings.value(data[i]));
			ratios[i] = Math.PI*2*(totalValue?((values[i]+prevSum)/totalValue):(1/data.length));
			prevSum += values[i];
		}
		/*pie center*/
		var x0 = (this._settings.x?this._settings.x:coord.x);
		var y0 = (this._settings.y?this._settings.y:coord.y);
		/*adds shadow to the 2D pie*/
		if(ky==1&&this._settings.shadow)
			this._addShadow(ctx,x0,y0,radius);
		
		/*changes vertical position of the center according to 3Dpie cant*/
		y0 = y0/ky;
		/*the angle defines the 1st edge of the sector*/
		var alpha0 = -Math.PI/2;
		/*changes Canvas vertical scale*/
		ctx.scale(1,ky); 
		
		for(var i = 0; i < data.length;i++){
			if (!values[i]) continue;
			/*drawing sector*/
			ctx.lineWidth = 2;
			ctx.beginPath(); 
	    	ctx.moveTo(x0,y0);
			/*the angle defines the 2nd edge of the sector*/
			var alpha1 = -Math.PI/2+ratios[i]-0.0001;
			ctx.arc(x0,y0,radius,alpha0,alpha1,false);
			ctx.lineTo(x0,y0);

			var color = this._settings.color.call(this,data[i]);
			ctx.fillStyle = color;

			ctx.strokeStyle = this._settings.lineColor(data[i]);
			ctx.stroke();
			ctx.fill();

			/*text that needs being displayed inside the sector*/
			if(this._settings.pieInnerText)
				this._drawSectorLabel(x0,y0,5*radius/6,alpha0,alpha1,ky,this._settings.pieInnerText(data[i],totalValue),true);
			/*label outside the sector*/
			if(this._settings.label)
				this._drawSectorLabel(x0,y0,radius+this._settings.labelOffset,alpha0,alpha1,ky,this._settings.label(data[i]));
			/*drawing lower part for 3D pie*/
			if(ky!=1){
				this._createLowerSector(ctx,x0,y0,alpha0,alpha1,radius,true);
				ctx.fillStyle = "#000000";
				ctx.globalAlpha = 0.2;
				this._createLowerSector(ctx,x0,y0,alpha0,alpha1,radius,false);
				ctx.globalAlpha = 1;
				ctx.fillStyle = color;
			}
			
			/*creats map area (needed for events)*/
			map.addSector(data[i].id,alpha0,alpha1,x0,y0,radius,ky);
			
			alpha0 = alpha1;
			
			
		}
		
		/*adds radial gradient to a pie*/
		if (this._settings.gradient){
			var x1 = (ky!=1?x0+radius/3:x0);
			var y1 = (ky!=1?y0+radius/3:y0);
			this._showRadialGradient(ctx,x0,y0,radius,x1,y1);	
		}
		ctx.scale(1,1/ky); 
	},
	/**
	*   returns calculated pie parameters: center position and radius
	*   @param: x - the width of a container
	*   @param: y - the height of a container
	*/
	_getPieParameters:function(point0,point1){
		/*var offsetX = 0;
		var offsetY = 0;
		if(this._settings.legend &&this._settings.legend.layout!="x")
			offsetX = this._settings.legend.width*(this._settings.legend.align=="right"?-1:1);
		var x0 = (x + offsetX)/2;
		if(this._settings.legend &&this._settings.legend.layout=="x")
			offsetY = this._settings.legend.height*(this._settings.legend.valign=="bottom"?-1:1);
		var y0 = (y+offsetY)/2;*/
		var width = point1.x-point0.x;
		var height = point1.y-point0.y;
		var x0 = point0.x+width/2;
		var y0 = point0.y+height/2;
		var radius = Math.min(width/2,height/2);
		return {"x":x0,"y":y0,"radius":radius};
	},
	/**
	*   creates lower part of sector in 3Dpie
	*   @param: ctx - canvas object
	*   @param: x0 - the horizontal position of the pie center
	*   @param: y0 - the vertical position of the pie center
	*   @param: a0 - the angle that defines the first edge of a sector
	*   @param: a1 - the angle that defines the second edge of a sector
	*   @param: R - pie radius
	*   @param: line (boolean) - if the sector needs a border
	*/
	_createLowerSector:function(ctx,x0,y0,a1,a2,R,line){
		ctx.lineWidth = 1;
		/*checks if the lower sector needs being displayed*/
		if(!((a1<=0 && a2>=0)||(a1>=0 && a2<=Math.PI)||(a1<=Math.PI && a2>=Math.PI))) return;
		
		if(a1<=0 && a2>=0){
			a1 = 0;
			line = false;
			this._drawSectorLine(ctx,x0,y0,R,a1,a2);
		}
		if(a1<=Math.PI && a2>=Math.PI){
			a2 = Math.PI;
			line = false;
			this._drawSectorLine(ctx,x0,y0,R,a1,a2);
		}
		/*the height of 3D pie*/
		var offset = (this._settings.pieHeight||Math.floor(R/4))/this._settings.cant;
		ctx.beginPath(); 
		ctx.arc(x0,y0,R,a1,a2,false);
		ctx.lineTo(x0+R*Math.cos(a2),y0+R*Math.sin(a2)+offset);
		ctx.arc(x0,y0+offset,R,a2,a1,true);
		ctx.lineTo(x0+R*Math.cos(a1),y0+R*Math.sin(a1));
		ctx.fill();
		if(line)		
			ctx.stroke();
	},
	/**
	*   draws a serctor arc
	*/
	_drawSectorLine:function(ctx,x0,y0,R,a1,a2){
		ctx.beginPath(); 
		ctx.arc(x0,y0,R,a1,a2,false);
		ctx.stroke();
	},
	/**
	*   adds a shadow to pie
	*   @param: ctx - canvas object
	*   @param: x - the horizontal position of the pie center
	*   @param: y - the vertical position of the pie center
	*   @param: R - pie radius
	*/
	_addShadow:function(ctx,x,y,R){
		var shadows = ["#676767","#7b7b7b","#a0a0a0","#bcbcbc","#d1d1d1","#d6d6d6"];
		for(var i = shadows.length-1;i>-1;i--){
			ctx.beginPath();
			ctx.fillStyle = shadows[i]; 
			ctx.arc(x+2,y+2,R+i,0,Math.PI*2,true);  
			ctx.fill();  
		} 
	},
	/**
		*   returns a gray gradient
		*   @param: gradient - gradient object
	*/
	_getGrayGradient:function(gradient){
		gradient.addColorStop(0.0,"#ffffff");
		gradient.addColorStop(0.7,"#7a7a7a");
		gradient.addColorStop(1.0,"#000000");
		return gradient;
	},
	/**
	*   adds gray radial gradient
	*   @param: ctx - canvas object
	*   @param: x - the horizontal position of the pie center
	*   @param: y - the vertical position of the pie center
	*   @param: radius - pie radius
	*   @param: x0 - the horizontal position of a gradient center
	*   @param: y0 - the vertical position of a gradient center
	*/
	_showRadialGradient:function(ctx,x,y,radius,x0,y0){
			ctx.globalAlpha = 0.3;
			ctx.beginPath();
			var gradient; 
			if(typeof this._settings.gradient!= "function"){
				gradient = ctx.createRadialGradient(x0,y0,radius/4,x,y,radius);
				gradient = this._getGrayGradient(gradient);
			}
			else gradient = this._settings.gradient(gradient);
			ctx.fillStyle = gradient;
			ctx.arc(x,y,radius,0,Math.PI*2,true);
			ctx.fill();
			ctx.globalAlpha = 1;
	},
	/**
	*   returns the calculates pie parameters: center position and radius
	*   @param: ctx - canvas object
	*   @param: x0 - the horizontal position of the pie center
	*   @param: y0 - the vertical position of the pie center
	*   @param: R - pie radius
	*   @param: alpha1 - the angle that defines the 1st edge of a sector
	*   @param: alpha2 - the angle that defines the 2nd edge of a sector
	*   @param: ky - the value that defines an angle of inclination
	*   @param: text - label text
	*   @param: in_width (boolean) - if label needs being displayed inside a pie
	*/
	_drawSectorLabel:function(x0,y0,R,alpha1,alpha2,ky,text,in_width){
		var t = this.renderText(0,0,text,0,1);
		if (!t) return;
		
		//get existing width of text
		var labelWidth = t.scrollWidth;
		t.style.width = labelWidth+"px";	//adjust text label to fit all text
		if (labelWidth>x0) labelWidth = x0;	//the text can't be greater than half of view
		
		//calculate expected correction based on default font metrics
		var width = 8;
		if (in_width) width = labelWidth/1.8;
		var alpha = alpha1+(alpha2-alpha1)/2;
		
		//calcualteion position and correction
		R = R-(width-8)/2;
		var corr_x = - width;
		var corr_y = -8;
		var align = "left";
		
		//for items in right upper sector
		if(alpha>=Math.PI/2 && alpha<Math.PI){
			//correction need to be applied because of righ align
			//we need to count right upper angle instead of left upper angle
			corr_x = -labelWidth-corr_x+1;/*correction for label width*/
			align = "right";
		}
		//for items in right lower sector
		if(alpha<=3*Math.PI/2 && alpha>=Math.PI){
			corr_x = -labelWidth-corr_x+1;
			align = "right";
		}
		
		//calculate position of text
		//basically get point at center of pie sector
		var y = (y0+Math.floor(R*Math.sin(alpha)))*ky+corr_y;
		var x = x0+Math.floor((R+width/2)*Math.cos(alpha))+corr_x;
		
		//if pie sector starts in left of right part pie, related text
		//must be placed to the left of to the right of pie as well
		var left_end = (alpha2 < Math.PI/2+0.01);
		var left_start = (alpha < Math.PI/2);
		if (left_start && left_end)
			x = Math.max(x,x0+3);	//right part of pie
		else if (!left_start && !left_end)
			x = Math.min(x,x0-labelWidth);	//left part of pie
		
		/*correction for the lower sector of the 3D pie*/
		if (!in_width && ky<1 && y > y0*ky){
			y+= (this._settings.pieHeight||Math.floor(R/4));
		}

		//we need to set position of text manually, based on above calculations
		t.style.top  = y+"px";
		t.style.left = x+"px";
		t.style.width = labelWidth+"px";
		t.style.textAlign = align;
		t.style.whiteSpace = "nowrap";
	}
};

dhx.chart.pie3D = {
	pvt_render_pie3D:function(ctx,data,x,y,sIndex,map){
		this._renderPie(ctx,data,x,y,this._settings.cant,map);
	}
};


/* DHX DEPEND FROM FILE 'core/group.js'*/


/*DHX:Depend core/datastore.js*/
/*DHX:Depend core/dhx.js*/

dhx.Group = {
	_init:function(){
		dhx.assert(this.data,"DataStore required for grouping");
		
		this.attachEvent("onBeforeRender",function(data){
			if (this._settings.sort){
				data.blockEvent();
				data.sort(this._settings.sort);
				data.unblockEvent();
			}
		});
		this.attachEvent("onBeforeSort",function(){
			this._settings.sort = null;
		});
		
		this.data.attachEvent("onStoreLoad",dhx.bind(function(){
			if (this._settings.group)
				this.group(this._settings.group,false);
		},this));
		this.data.attachEvent("onClearAll",dhx.bind(function(){
			this.ungroup(false);
		},this));
		
		dhx.extend(this.data, dhx.GroupStore);
	},
	group:function(config,mode){
		this.data.ungroup(false);
		this.data.group(config);
		if (mode!==false)
			this.render();
	},
	ungroup:function(mode){
		this.data.ungroup();
		if (mode!==false)
			this.render();
	},
	group_setter:function(config){
		dhx.assert(typeof config == "object", "Incorrect group value");
		dhx.assert(config.by,"group.by is mandatory");
		dhx.assert(config.map,"group.map is mandatory");
		return config;
	},
	//need to be moved to more appropriate object
	sort_setter:function(config){
		if (typeof config != "object")
			config = { by:config };
		
		this._mergeSettings(config,{
			as:"string",
			dir:"asc"
		});
		return config;
	}
};

dhx.GroupStore = {
	sum:function(property, data){
		property = dhx.Template(property);
		
		data = data || this;
		var summ = 0; 
		data.each(function(obj){
			summ+=property(obj)*1;
		});
		return summ;
	},
	min:function(property, data){
		property = dhx.Template(property);
		
		data = data || this;
		var min = Infinity;
		data.each(function(obj){
			if (property(obj)*1 < min) min = property(obj)*1;
		});
		return min*1;
	},
	max:function(property, data){
		property = dhx.Template(property);
		
		data = data || this;
		var max = -Infinity;
		data.each(function(obj){
			if (property(obj)*1 > max) max = property(obj)*1;
		});
		return max;
	},
	_any:function(property, data){
		property = dhx.Template(property);
		return property(data[0]);
	},
	ungroup:function(){
		if (this._not_grouped_order){
			this.order = this._not_grouped_order;
			this.pull = this._not_grouped_pull;
			this._not_grouped_pull = this._not_grouped_order = null;
		}
		
		this.callEvent("onStoreUpdated",[]);
	},
	group:function(stats){ 

		var key = dhx.Template(stats.by);
		if (!stats.map[key])
			stats.map[key] = [key, this._any];
			
		var groups = {};
		var labels = [];
		this.each(function(data){
			var current = key(data);
			if (!groups[current]){
				labels.push({id:current});
				groups[current] = dhx.toArray();
			}
			groups[current].push(data);
		});
		for (var prop in stats.map){
			var functor = (stats.map[prop][1]||this._any);
			if (typeof functor != "function")
				functor = this[functor];
				
			for (var i=0; i < labels.length; i++) {
				labels[i][prop]=functor.call(this, stats.map[prop][0], groups[labels[i].id]);
			}
		}
		
//		if (this._settings.sort)
//			labels.sortBy(stats.sort);
			
		this._not_grouped_order = this.order;
		this._not_grouped_pull = this.pull;
		
		this.order = dhx.toArray();
		this.pull = {};
		for (var i=0; i < labels.length; i++) {
			var id = this.id(labels[i]);
			this.pull[id] = labels[i];
			this.order.push(id);
		}
		
		this.callEvent("onStoreUpdated",[]);
	}
};


/* DHX DEPEND FROM FILE 'core/canvas.js'*/


/*DHX:Depend core/dhx.js*/

dhx.Canvas = {
	_init:function(){
		this._canvas_labels = [];
	},
	_prepareCanvas:function(container){
		//canvas has the same size as master object
		this._canvas = dhx.html.create("canvas",{ width:container.offsetWidth, height:container.offsetHeight });
		container.appendChild(this._canvas);
		//use excanvas in IE
		if (!this._canvas.getContext){
				dhx.error("Canvas is not supported in the current browser");
		}
		return this._canvas;
	}, 
	getCanvas:function(context){
		return (this._canvas||this._prepareCanvas(this._contentobj)).getContext(context||"2d");
	},
	_resizeCanvas:function(){
		if (this._canvas){
			this._canvas.setAttribute("width", this._canvas.parentNode.offsetWidth);
			this._canvas.setAttribute("height", this._canvas.parentNode.offsetHeight);
		}
	},
	renderText:function(x,y,text,css,w){
		if (!text) return; //ignore empty text
		if (w) w = Math.max(w,0);
		if (y) y = Math.max(y,0);
		var t = dhx.html.create("DIV",{
			"class":"dhx_canvas_text"+(css?(" "+css):""),
			"style":"left:"+x+"px; top:"+y+"px;"
		},text);
		this._contentobj.appendChild(t);
		this._canvas_labels.push(t); //destructor?
		if (w)
			t.style.width = w+"px";
		return t;
	},
	renderTextAt:function(valign,align, x,y,t,c,w){
		var text=this.renderText.call(this,x,y,t,c,w);
		if (text){
			if (valign){
				if(valign == "middle")
					text.style.top = parseInt(y-text.offsetHeight/2,10) + "px";
				else
					text.style.top = y-text.offsetHeight + "px";
			}
			if (align){
			    if(align == "left")
					text.style.left = x-text.offsetWidth + "px";
				else
					text.style.left = parseInt(x-text.offsetWidth/2,10) + "px";
			}
		}
		return text;
	},
	clearCanvas:function(){
		for(var i=0; i < this._canvas_labels.length;i++)
			this._contentobj.removeChild(this._canvas_labels[i]);
		this._canvas_labels = [];
		if (this._contentobj._htmlmap){
			this._contentobj._htmlmap.parentNode.removeChild(this._contentobj._htmlmap);
			this._contentobj._htmlmap = null;
		}
		//FF breaks, when we are using clear canvas and call clearRect without parameters		
		this.getCanvas().clearRect(0,0,this._canvas.offsetWidth, this._canvas.offsetHeight);
	}
};


/* DHX DEPEND FROM FILE 'ui/chart.js'*/


/*DHX:Depend ui/chart.css*/
/*DHX:Depend core/canvas.js*/
/*DHX:Depend core/load.js*/

/*DHX:Depend core/config.js*/

/*DHX:Depend core/mouse.js*/
/*DHX:Depend core/group.js*/

/*DHX:Depend ui/chart/chart_base.js*/
/*DHX:Depend ui/chart/chart_pie.js*/		//+pie3d
/*DHX:Depend ui/chart/chart_bar.js*/	
/*DHX:Depend ui/chart/chart_line.js*/
/*DHX:Depend ui/chart/chart_barh.js*/	
/*DHX:Depend ui/chart/chart_stackedbar.js*/	
/*DHX:Depend ui/chart/chart_stackedbarh.js*/
/*DHX:Depend ui/chart/chart_spline.js*/	
/*DHX:Depend ui/chart/chart_area.js*/	 	//+stackedArea

/*DHX:Depend core/math.js*/
/*DHX:Depend core/destructor.js*/
/*DHX:Depend core/dhx.js*/
/*DHX:Depend ui/view.js*/
/*DHX:Depend ui/map.js*/


dhx.protoUI({
	name:"chart",
	_init:function(){
		for (var key in dhx.chart)
			dhx.extend(this, dhx.chart[key]);
		this._series = [this._settings];
		this._legend_labels = [];
		this._contentobj.className += " dhx_chart";
		this._after_init.push(this._after_init_call);
		this.attachEvent("onLocateData", this._switchSerie);
		this.data.provideApi(this, true);
	},
	_after_init_call:function(){
		this.data.attachEvent("onStoreUpdated",dhx.bind(function(){
			this.render();  
		},this));
  	},
	defaults:{
		color:"RAINBOW",
		alpha:"1",
		label:false,
		value:"{obj.value}",
		padding:{},
		type:"pie",
		lineColor:"#ffffff",
		cant:0.5,
		barWidth: 15,
		line:{},
		item:{},
		shadow:true,
		gradient:false,
		border:true,
		labelOffset: 20,
		origin:"auto"
	},
	_id:"dhx_area_id",
	on_click:{
	},
	on_dblclick:{
	},
	on_mouse_move:{
	},
	resize:function(){
		dhx.ui.view.prototype.resize.call(this);
		this._resizeCanvas();
		this.render();	
	},
	_set_size:function(x,y){
		if(dhx.ui.view.prototype._set_size.call(this,x,y)){
			this._resizeCanvas();
			this.render();
		}
	},
	type_setter:function(val){
		if (!dhx.chart[val])
			dhx.error("Chart type extension is not loaded: "+val);
		//if you will need to add more such settings - move them ( and this one ) in a separate methods
		
		if (typeof this._settings.offset == "undefined"){
			if (val == "area" || val == "stackedArea") 
				this._settings.offset = false;
			else
				this._settings.offset = true;
		}
			
			
		return val;
	},
	render:function(){
		if (!this.isVisible(this._settings.id))
			return;
		if (!this.callEvent("onBeforeRender",[this.data]))
			return;
		if(this._legendObj){
			for(var i=0; i < this._legend_labels.length;i++)
				this._legendObj.removeChild(this._legend_labels[i]);
		}
		this._legend_labels = [];
		this.clearCanvas();
		
		if(this._settings.legend){
			this._drawLegend(this.getCanvas(),
				this.data.getRange(),
				this._content_width,
				this._content_height
			);
		}
		
		var bounds = this._getChartBounds(this._content_width,this._content_height);
		
		var map = new dhx.ui.Map(this._id);
		
		var temp = this._settings;
		for(var i=0; i < this._series.length;i++){
		 	this._settings = this._series[i];
			this["pvt_render_"+this._settings.type](
				this.getCanvas(),
				this.data.getRange(),
				bounds.start,
				bounds.end,
				i,
				map
			);
		}
		
		map.render(this._contentobj);
		this._settings = temp;
	},
	series_setter:function(config){
		if(typeof config!="object"){
			dhx.assert(config,"Chart :: Series must be an array or object");	
		}
		else{
			this._parseSettings((!config.length?config:config[0]),{});
			for(var i=1;i< config.length;i++)
				this.addSeries(config[i]);
		}
		return config;
	},
	value_setter:dhx.Template,	
	alpha_setter:dhx.Template,	
	label_setter:dhx.Template,
	lineColor_setter:dhx.Template,	
	pieInnerText_setter:dhx.Template,
	gradient_setter:function(config){
		if((typeof(config)!="function")&&config&&(config === true||config!="3d"))
			config = "light";
		return config;
	},
	colormap:{
		"RAINBOW":function(obj){
			var pos = Math.floor(this.indexById(obj.id)/this.dataCount()*1536);
			if (pos==1536) pos-=1;
			return this._rainbow[Math.floor(pos/256)](pos%256);
		}
	},
	color_setter:function(value){
		return this.colormap[value]||dhx.Template(value);
	},
	legend_setter:function(config){	
		if(typeof(config)!="object")	//allow to use template string instead of object
			config={template:config};
			
		this._mergeSettings(config,{
			width:150,
			height:18,
			layout:"y",
			align:"left",
			valign:"bottom",
			template:"",
			marker:{
				type:"square",
				width:25,
				height:15
			}
		});
		
		config.template = dhx.Template(config.template);
		return config;
	},
	item_setter:function(config){
		if(typeof(config)!="object")
			config={color:config, borderColor:config};
			
		this._mergeSettings(config,{
			radius:4,
			color:"#000000",
			borderColor:"#000000",
			borderWidth:2
		});
		
		config.color = dhx.Template(config.color);
		config.borderColor = dhx.Template(config.borderColor);
		return config;
	},
	line_setter:function(config){
		if(typeof(config)!="object")
			config={color:config};
			
		this._mergeSettings(config,{
			width:3,
			color:"#d4d4d4"
		});
		
		config.color = dhx.Template(config.color);
		return config;
	},
	padding_setter:function(config){	
		if(typeof(config)!="object")
			config={left:config, right:config, top:config, bottom:config};
		this._mergeSettings(config,{
			left:50,
			right:20,
			top:35,
			bottom:40
		});
		return config;
	},
	xAxis_setter:function(config){
		if(!config) return false;
		if(typeof(config)!="object")
			config={ template:config };

		this._mergeSettings(config,{
			title:"",
			color:"#000000",
			template:"{obj}",
			lines:false
		});
		
		if(config.template)
			config.template = dhx.Template(config.template);
		return config;
	},
    yAxis_setter:function(config){
	    this._mergeSettings(config,{
			title:"",
			color:"#000000",
			template:"{obj}",
			lines:true
		});
		
		if(config.template)
			config.template = dhx.Template(config.template);
		return config;
	},
    _drawScales:function(ctx,data,point0,point1,start,end,cellWidth){
	    var y = this._drawYAxis(ctx,data,point0,point1,start,end);
		this._drawXAxis(ctx,data,point0,point1,cellWidth,y);
		return y;
	},
	_drawXAxis:function(ctx,data,point0,point1,cellWidth,y){
		if (!this._settings.xAxis) return;
		
		var x0 = point0.x-0.5;
		var y0 = parseInt((y?y:point1.y),10)+0.5;

		var x1 = point1.x;
		var unit_pos;
		var center = true;
		
		this._drawLine(ctx,x0,y0,x1,y0,this._settings.xAxis.color,1);
		
		for(var i=0; i < data.length;i ++){
			if(this._settings.offset === true)
				unit_pos = x0+cellWidth/2+i*cellWidth;
			else{
				unit_pos = x0+i*cellWidth;
				center = !!i;
			}
			/*scale labels*/
			var top = ((this._settings.origin!="auto")&&(this._settings.type=="bar")&&(parseFloat(this._settings.value(data[i])||0)<this._settings.origin));
			this._drawXAxisLabel(unit_pos,y0,data[i],center,top);
			/*draws a vertical line for the horizontal scale*/
			if(this._settings.type_setter != "bar")
		    	this._drawXAxisLine(ctx,unit_pos,point1.y,point0.y);
		}
		
		this.renderTextAt(true, false, x0,point1.y+this._settings.padding.bottom-3,
			this._settings.xAxis.title,
			"dhx_axis_title_x",
			point1.x - point0.x
		);
		
		/*the right border in lines in scale are enabled*/
		if (!this._settings.xAxis.lines || !this._settings.offset) return;
		this._drawLine(ctx,x1+0.5,point1.y,x1+0.5,point0.y+0.5,this._settings.xAxis.color,0.2);
	},
	_drawYAxis:function(ctx,data,point0,point1,start,end){
		var step;
		var scaleParam= {};
		if (!this._settings.yAxis) return;
		
		var x0 = point0.x - 0.5;
		var y0 = point1.y;
		var y1 = point0.y;
		var lineX = point1.y;
		
		this._drawLine(ctx,x0,y0,x0,y1,this._settings.yAxis.color,1);
		
		if(this._settings.yAxis.step)
		     step = parseFloat(this._settings.yAxis.step);

		if(typeof this._settings.yAxis.step =="undefined"||typeof this._settings.yAxis.start=="undefined"||typeof this._settings.yAxis.end =="undefined"){
			scaleParam = this._calculateScale(start,end);
			start = scaleParam.start;
			end = scaleParam.end;
			step = scaleParam.step;
			
			this._settings.yAxis.end = end;
			this._settings.yAxis.start = start;
		}
		
		if(step===0) return;
		var stepHeight = (y0-y1)*step/(end-start);
		var c = 0;
		for(var i = start; i<=end; i += step){
			if(scaleParam.fixNum)  i = parseFloat((new Number(i)).toFixed(scaleParam.fixNum));
			var yi = Math.floor(y0-c*stepHeight)+ 0.5;/*canvas line fix*/
			if(!(i==start&&this._settings.origin=="auto") &&this._settings.yAxis.lines)
				this._drawLine(ctx,x0,yi,point1.x,yi,this._settings.yAxis.color,0.2);
			if(i == this._settings.origin) lineX = yi;
			this.renderText(0,yi-5,
				this._settings.yAxis.template(i.toString()),
				"dhx_axis_item_y",
				point0.x-5
			);	
			c++;
		}
		this._setYAxisTitle(point0,point1);
		return lineX;
	},
	_setYAxisTitle:function(point0,point1){
		var text=this.renderTextAt("middle",false,0,parseInt((point1.y-point0.y)/2+point0.y,10),this._settings.yAxis.title,"dhx_axis_title_y");
		if (text)
			text.style.left = (dhx.env.transform?(text.offsetHeight-text.offsetWidth)/2:0)+"px";
	},
	_calculateScale:function(nmin,nmax){
		var step,start,end;
	   	step = ((nmax-nmin)/8)||1;
		var power = Math.floor(this._log10(step));
		var calculStep = Math.pow(10,power);
		var stepVal = step/calculStep;
		stepVal = (stepVal>5?10:5);
		step = parseInt(stepVal,10)*calculStep;
		
		if(step>Math.abs(nmin))
			start = (nmin<0?-step:0);
		else{
			var absNmin = Math.abs(nmin);
			var powerStart = Math.floor(this._log10(absNmin));
			var nminVal = absNmin/Math.pow(10,powerStart);
			start = Math.ceil(nminVal*10)/10*Math.pow(10,powerStart)-step;
			if(nmin<0) start =-start-2*step;
		}
		var end = start;
		while(end<nmax){
			end += step;
			end = parseFloat((new Number(end)).toFixed(Math.abs(power)));
		}
		return { start:start,end:end,step:step,fixNum:Math.abs(power) };
	},
	_getLimits:function(orientation){
		var maxValue,minValue;
		var axis = ((arguments.length && orientation=="h")?this._settings.xAxis:this._settings.yAxis);
		if(axis&&(typeof axis.end!="undefined")&&(typeof axis.start!="undefined")&&axis.step){
		    maxValue = parseFloat(axis.end);
			minValue = parseFloat(axis.start);      
		}
		else{
			maxValue = this.data.max(this._series[0].value);
			minValue = this.data.min(this._series[0].value);
			if(this._series.length>1)
			for(var i=1; i < this._series.length;i++){
				var maxI = this.data.max(this._series[i].value);
				var minI = this.data.min(this._series[i].value);
				if (maxI > maxValue) maxValue = maxI;
		    	if (minI < minValue) minValue = minI;
			}
		}
		return {max:maxValue,min:minValue};
	},
	_log10:function(n){
        var method_name="log";
        return Math.floor((Math[method_name](n)/Math.LN10));
    },
	_drawXAxisLabel:function(x,y,obj,center,top){
		if (!this._settings.xAxis) return;
		var elem = this.renderTextAt(top, center, x,y,this._settings.xAxis.template(obj),"dhx_axis_item_x");
	},
	_drawXAxisLine:function(ctx,x,y1,y2){
		if (!this._settings.xAxis||!this._settings.xAxis.lines) return;
		this._drawLine(ctx,x,y1,x,y2,this._settings.xAxis.color,0.2);
	},
	_drawLine:function(ctx,x1,y1,x2,y2,color,width){
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.beginPath();
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.stroke();
	},
	_getRelativeValue:function(minValue,maxValue){
	    var relValue;
		var valueFactor = 1;
		if(maxValue != minValue){
		    relValue = maxValue - minValue;
			if(Math.abs(relValue) < 1){
			    while(Math.abs(relValue)<1){
				    valueFactor *= 10;
					relValue *= valueFactor;
				}
			}
		}
		else relValue = minValue;
		return [relValue,valueFactor];
	},
	_rainbow : [
		function(pos){ return "#FF"+dhx.math.toHex(pos/2,2)+"00";},
		function(pos){ return "#FF"+dhx.math.toHex(pos/2+128,2)+"00";},
		function(pos){ return "#"+dhx.math.toHex(255-pos,2)+"FF00";},
		function(pos){ return "#00FF"+dhx.math.toHex(pos,2);},
		function(pos){ return "#00"+dhx.math.toHex(255-pos,2)+"FF";},
		function(pos){ return "#"+dhx.math.toHex(pos,2)+"00FF";}		
	],
	/**
	*   adds series to the chart (value and color properties)
	*   @param: obj - obj with configuration properties
	*/
	addSeries:function(obj){
		var temp = this._settings; this._settings = dhx.extend({},temp);
		this._parseSettings(obj,{});
	    this._series.push(this._settings);
		this._settings = temp;
    },
    /*switch global settings to serit in question*/
    _switchSerie:function(id, tag){
    	this._active_serie = tag.getAttribute("userdata");
		if (!this._series[this._active_serie]) return;
    	for (var i=0; i < this._series.length; i++) {
    		var tip = this._series[i].tooltip;
    		if (tip)
    			tip.disable();
		}
		var tip = this._series[this._active_serie].tooltip;
    	if (tip)
    		tip.enable();
    },
	/**
	*   renders legend block
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: width - the width of the container
	*   @param: height - the height of the container
	*/
	_drawLegend:function(ctx,data,width,height){
		/*position of the legend block*/
		var x=0,y=0;
		/*legend config*/
		var legend = this._settings.legend;
		 /*the legend sizes*/
		var legendHeight,legendWidth;
		
		var style = (this._settings.legend.layout!="x"?"width:"+legend.width+"px":"");
		/*creation of legend container*/
		if(this._legendObj)
			this._legendObj.parentNode.removeChild(this._legendObj);
		var legendContainer = dhx.html.create("DIV",{
			"class":"dhx_chart_legend",
			"style":"left:"+x+"px; top:"+y+"px;"+style
		},"");
		this._legendObj = legendContainer;
		this._contentobj.appendChild(legendContainer);
		/*rendering legend text items*/
		var legendItems = [];
		if(!legend.values)
			for(var i = 0; i < data.length; i++){
				legendItems.push(this._drawLegendText(legendContainer,legend.template(data[i])));
			}
		else
			for(var i = 0; i < legend.values.length; i++){
				legendItems.push(this._drawLegendText(legendContainer,legend.values[i].text));
			}
		if (legendContainer.offsetWidth === 0) 
			legendContainer.style.width = "auto"; 
	   	legendWidth = legendContainer.offsetWidth;
	    legendHeight = legendContainer.offsetHeight;
		this._settings.legend.width = legendWidth;
		this._settings.legend.height = legendHeight;
		/*setting legend position*/
		if(legendWidth<this._contentobj.offsetWidth){
			if(legend.layout == "x"&&legend.align == "center")
				x = (this._contentobj.offsetWidth-legendWidth)/2;
			if(legend.align == "right"){
				x = this._contentobj.offsetWidth-legendWidth;
			}
		}
		
		if(legendHeight<this._contentobj.offsetHeight){
			if(legend.valign == "middle"&&legend.align != "center"&&legend.layout != "x")
				y = (this._contentobj.offsetHeight-legendHeight)/2;
			else if(legend.valign == "bottom")
				y = this._contentobj.offsetHeight-legendHeight;
		}
		legendContainer.style.left = x+"px";
		legendContainer.style.top = y+"px";
		
		/*drawing colorful markers*/
		for(var i = 0; i < legendItems.length; i++){
			var item = legendItems[i];
			var itemColor = (legend.values?legend.values[i].color:this._settings.color.call(this,data[i]));
			this._drawLegendMarker(ctx,item.offsetLeft+x,item.offsetTop+y,itemColor);
		}
		legendItems = null;
	},
	/**
	*   appends legend item to legend block
	*   @param: ctx - canvas object
	*   @param: obj - data object that needs being represented
	*/
	_drawLegendText:function(cont,value){
		var style = "";
		if(this._settings.legend.layout=="x")
			style = "float:left;";
		/*the text of the legend item*/
		var text = dhx.html.create("DIV",{
			"style":style+"padding-left:"+(10+this._settings.legend.marker.width)+"px",
			"class":"dhx_chart_legend_item"
		},value);
		this._legend_labels.push(text);
		cont.appendChild(text);
		return text;
	},
	/**
	*   draw legend colorful marder
	*   @param: ctx - canvas object
	*   @param: x - the horizontal position of the marker
	*   @param: y - the vertical position of the marker
	*   @param: obj - data object which color needs being used
	*/
	_drawLegendMarker:function(ctx,x,y,color){
		var details = this._settings.legend;
		
		ctx.strokeStyle = ctx.fillStyle = color;
		ctx.lineWidth = details.marker.height;  
		ctx.lineCap = details.marker.type;
		ctx.beginPath();
		/*start of marker*/
		x += ctx.lineWidth/2+5;
		y += ctx.lineWidth/2+3;
		ctx.moveTo(x,y);
		var x1 = x + details.marker.width-details.marker.height +1;
		ctx.lineTo(x1,y);  
    	ctx.stroke(); 
	},
	/**
	*   gets the points those represent chart left top and right bottom bounds
	*   @param: width - the width of the chart container
	*   @param: height - the height of the chart container
	*/
	_getChartBounds:function(width,height){
		var chartX0, chartY0, chartX1, chartY1;
		
		chartX0 = this._settings.padding.left;
		chartY0 = this._settings.padding.top;
		chartX1 = width - this._settings.padding.right;
		chartY1 = height - this._settings.padding.bottom;	
		
		if(this._settings.legend){
			var legend = this._settings.legend;
			/*legend size*/
			var legendWidth = this._settings.legend.width;
			var legendHeight = this._settings.legend.height;
		
			/*if legend is horizontal*/
			if(legend.layout == "x"){
				if(legend.valign == "center"){
					if(legend.align == "right")
						chartX1 -= legendWidth;
					else if(legend.align == "left")
				 		chartX0 += legendWidth;
			 	}
			 	else if(legend.valign == "bottom"){
			    	chartY1 -= legendHeight;
			 	}
			 	else{
			    	chartY0 += legendHeight;
			 	}
			}
			/*vertical scale*/
			else{
				if(legend.align == "right")
					chartX1 -= legendWidth;
			 	else if(legend.align == "left")
					chartX0 += legendWidth;
			}
		}
		return {start:{x:chartX0,y:chartY0},end:{x:chartX1,y:chartY1}};
	},
	/**
	*   gets the maximum and minimum values for the stacked chart
	*   @param: data - data set
	*/
	_getStackedLimits:function(data){
		var maxValue,minValue;
		if(this._settings.yAxis&&(typeof this._settings.yAxis.end!="undefined")&&(typeof this._settings.yAxis.start!="undefined")&&this._settings.yAxis.step){
		    maxValue = parseFloat(this._settings.yAxis.end);
			minValue = parseFloat(this._settings.yAxis.start);      
		}
		else{
			for(var i=0; i < data.length; i++){
				data[i].$sum = 0 ;
				data[i].$min = Infinity;
				for(var j =0; j < this._series.length;j++){
					var value = parseFloat(this._series[j].value(data[i])||0);
					if(isNaN(value)) continue;
					data[i].$sum += value;
					if(value < data[i].$min) data[i].$min = value;
				}
			}
			maxValue = -Infinity;
			minValue = Infinity;
			for(var i=0; i < data.length; i++){
				if (data[i].$sum > maxValue) maxValue = data[i].$sum ;
				if (data[i].$min < minValue) minValue = data[i].$min ;
			}
			if(minValue>0) minValue =0;
		}
		return {max:maxValue,min:minValue};
	},
	/*adds colors to the gradient object*/
	_setBarGradient:function(ctx,x1,y1,x2,y2,type,color,axis){
		var gradient,offset;
		if(type == "light"){
			if(axis == "x")
				gradient = ctx.createLinearGradient(x1,y1,x2,y1);
			else
				gradient = ctx.createLinearGradient(x1,y1,x1,y2);
			gradient.addColorStop(0,"#FFFFFF");
			gradient.addColorStop(0.9,color);
			gradient.addColorStop(1,color);
			offset = 2;
		}
		else{
			ctx.globalAlpha = 0.37;
			offset = 0;
			if(axis == "x")
				gradient = ctx.createLinearGradient(x1,y2,x1,y1);
			else
				gradient = ctx.createLinearGradient(x1,y1,x2,y1);
			gradient.addColorStop(0,"#000000");
			gradient.addColorStop(0.5,"#FFFFFF");
			gradient.addColorStop(0.6,"#FFFFFF");
			gradient.addColorStop(1,"#000000");
		}
		return {gradient:gradient,offset:offset};
	}
},dhx.Group, dhx.DataLoader,dhx.MouseEvents, dhx.ui.view, dhx.Destruction, dhx.Canvas,  dhx.EventSystem ,dhx.Settings);


/* DHX DEPEND FROM FILE 'libs/jsonp.js'*/


/*DHX:Depend core/dhx.js*/


dhx.jsonp = function(url, params, callback, master){
	var id = "dhx_jsonp_"+dhx.uid();
	var script = document.createElement('script');
	script.id = id;
	script.type = 'text/javascript';

	var head = document.getElementsByTagName("head")[0];
	
	if (!params)
		params = {};
	params.jsonp = "dhx.jsonp."+id;
	dhx.jsonp[id]=function(){
		callback.apply(master||window, arguments);
		script.parentNode.removeChild(script);
		callback = head = master = script = null;
		delete dhx.jsonp[id];
	};
	
	var vals = [];
	for (var key in params) vals.push(key+"="+encodeURIComponent(params[key]));
	
	url += (url.indexOf("?") == -1 ? "?" : "&")+vals.join("&");

    script.src = url ;
    head.appendChild(script);
};


/* DHX DEPEND FROM FILE 'libs/validation.js'*/


/*DHX:Depend core/dhx.js*/

dhx.ValidateData = {
	validate:function(obj) {
		dhx.assert(this.callEvent, "using validate for eventless object");
		var result =true;
		var rules = this._settings.rules;
		if (rules){
			var objrule = rules.$obj;
			if(!obj&&this.getValues)
				obj = this.getValues();
			if (objrule && !objrule.call(this, obj)) return false;
			
			var all = rules.$all;
			for (var key in rules){
				if (key.indexOf("$")!==0){
					dhx.assert(rules[key], "Invalid rule for:"+key);
					if (rules[key].call(this, obj[key], obj, key) && (!all || all.call(this, obj[key], obj, key))){
						if(this.callEvent("onValidationSuccess",[key, obj])&&this._clear_invalid)
							this._clear_invalid(key, obj);
					}
					else {
						result =false;
						if(this.callEvent("onValidationError",[key, obj])&&this._mark_invalid)
							this._mark_invalid(key, obj);
					}
				}
			}
		}
		return result;
	}
};


dhx.rules = {
	isNumber: function(value) {
		return (parseFloat(value) == value);
	},

	isNotEmpty: function(value) {
		return (value=="0" || value);
	}
};


/* DHX DEPEND FROM FILE 'libs/dataprocessor.js'*/


/*DHX:Depend core/config.js*/
/*DHX:Depend core/load.js*/
/*DHX:Depend libs/validation.js*/


dhx.dp = function(name){
	if (typeof name == "object" && name._settings)
		name = name._settings.id;
		
	if (dhx.dp._pull[name])
		return dhx.dp._pull[name];
	
	if (typeof name == "string"||typeof name == "number")
		name = { master:dhx.ui.get(name) };
		
	var dp = new dhx.DataProcessor(name);
	dhx.dp._pull[dp._settings.master._settings.id]=dp;
	return dp;
};
dhx.dp._pull = {};

dhx.DataProcessor = dhx.proto({
	defaults: {
		autoupdate:true,
		mode:"post"
	},

	/*! constructor
	 **/
	_init: function() {
		this._updates = [];
		this._linked = [];
		this._shareed = [];
		this._cursor = null;
		this._ignore = false;
		this.name = "DataProcessor";
		this._after_init.push(this._after_init_call);
	},
	master_setter:function(value){
		var store = value;
		if (value.name != "DataStore")
			store = value.data;

		this._settings.store = store;
		return value;
	},
	/*! attaching onStoreUpdated event
	 **/
	_after_init_call: function() {
		dhx.assert(this._settings.store, "store or master need to be defined for the dataprocessor");
		this._settings.store.attachEvent("onStoreUpdated", dhx.bind(this._onStoreUpdated, this));
	},
	
	ignore:function(code,master){
		var temp = this._ignore;
		this._ignore = true;
		code.call((master||this));
		this._ignore = temp;
	},
	off:function(){
		this._ignore = true;
	},
	on:function(){
		this._ignore = false;
	},

	_copy_data:function(source){
		var obj = {};
		for (var key in source)	
			if (key.indexOf("$")!==0)
				obj[key]=source[key];
		return obj;
	},
	save:function(id, operation){
		operation = operation || "update";
		this._onStoreUpdated(id, this._settings.store.item(id), operation);
	},
	/*! callback for onStoreUpdated event.
	 *	@param id
	 *		item id
	 *	@param index
	 *		item index
	 *	@param operation
	 *		type of operation ("update", "add", "delete", "move", null)
	 **/
	_onStoreUpdated: function(id, obj, operation) {
		if (this._shareed.length)
			for (var i=0; i < this._shareed.length; i++)
				this._share.apply(this, this._shareed[i]);

		if (this._ignore === true || !operation) return true;
		var update = {id: id, data:this._copy_data(obj) };
		switch (operation) {
			case 'update':
				update.operation = "update";
				break;
			case 'add':
				update.operation = "insert";
				break;
			case 'delete':
				update.operation = "delete";				
				break;
			default:
				return true;
		}
		if (update.operation != "delete" && !this.validate(update.data)) return false;
		this._updates.push(update);
		
		if (this._settings.autoupdate)
			this.send();
			
		return true;
	},

	send:function(){
		this._sendData();
	},
	
	_sendData: function(){
		if (!this._settings.url){
			//dhx.log("DataProcessor works in silent mode, maybe you have forgot to set url property","");
			return;
		}
		var marked = this._updates;
		var to_send = [];
		for (var i = 0; i < marked.length; i++) {
			var id = marked[i].id;
			var operation = marked[i].operation;
			
			if (this._settings.store.exists(id))
				marked[i].data = this._settings.store.item(id);
			
			if (!this.callEvent("onBefore"+operation, [id, marked[i].data]))
				continue;
			
			to_send.push(marked[i]);
		}
		if (!to_send.length) return;
		if (!this.callEvent("onBeforeDataSend", [to_send]))
			return;
			
		this._send(this._settings.url, this._updatesToParams(to_send), this._settings.mode);
	},
	

	/*! process updates list to POST and GET params according dataprocessor protocol
	 *	@param updates
	 *		list of objects { id: "item id", data: "data hash", operation: "type of operation"}
	 *	@return
	 *		object { post: { hash of post params as name: value }, get: { hash of get params as name: value } }
	 **/
	_updatesToParams: function(updates) {
		var post_params = {};
		
		var ids = [];
		for (var i = 0; i < updates.length; i++) {
			var action = updates[i];
			ids.push(action.id);
			post_params[action.id + '_!nativeeditor_status'] = action.operation;
			for (var j in action.data) {
				if (j.indexOf("$")!==0)
					post_params[action.id + "_" + j] = action.data[j];
			}
		}
		post_params.ids = ids.join(",");
		return post_params;
	},



	/*! send dataprocessor query to server
	 *	and attach event to process result
	 *	@param url
	 *		server url
	 *	@param get
	 *		hash of get params
	 *	@param post
	 *		hash of post params
	 *	@mode
	 *		'post' or 'get'
	 **/
	_send: function(url, post, mode) {
		dhx.assert(url, "url was not set for DataProcessor");
		if (typeof url == "function")
			return url(post);
		
		url += (url.indexOf("?") == -1) ? "?" : "&";
		url += "editing=true";
		
		dhx.ajax()[mode](url, post, dhx.bind(this._processResult, this));
	},

	// process saving from result
	_processResult: function(text,data,loader) {
		this.callEvent("onBeforeSync", [hash, text, data, loader]);
		
		var xml = dhx.DataDriver.xml;
		data = xml.toObject(text, xml);
				
		var actions = xml.xpath(data, "//action");
		var hash = [];
		for (var i = 0; i < actions.length; i++) {
			var obj = xml.tagToObject(actions[i]);
			hash.push(obj);
			
			var index = -1;
			for (var ii=0; ii < this._updates.length; ii++){
				if (this._updates[ii].id == obj.sid)
					index = ii;
					break;
			}
					
			if (obj.type == "error" || obj.type == "invalid"){
				if (!this.callEvent("onDBError", [obj, this._updates[index]])){
					continue;
				}
			}
			
			if  (index>=0)
				this._updates.splice(index,1);
			
			if (obj.tid != obj.sid)
				this._settings.store.changeId(obj.sid, obj.tid);
			
			if (!this.callEvent("onAfter"+obj.type, [obj]))
				continue;
		}
		
		this.callEvent("onAfterSync", [hash, text, data, loader]);
	},


	/*! if it's defined escape function - call it
	 *	@param value
	 *		value to escape
	 *	@return
	 *		escaped value
	 **/
	escape: function(value) {
		if (this._settings.escape)
			return this._settings.escape(value);
		else
			return encodeURIComponent(value);
	}

}, dhx.Settings, dhx.EventSystem, dhx.ValidateData);




/* DHX DEPEND FROM FILE 'libs/animate.js'*/


/*DHX:Depend core/config.js*/
/*DHX:Depend core/dhx.js*/

dhx.animate = function(html_element, animation){
	if (html_element instanceof Array){

		for (var i=0; i < html_element.length; i++) {
            if(animation.type == 'slide'){
                if(animation.subtype == 'out' && i===0) { // next
                    continue;
                }
                if(animation.subtype == 'in' && i==1) { // current
                    continue;
                }
            }
            if(animation.type == 'flip'){
                var animation_copy = dhx.copy(animation);
                if(i===0) { // next
                    animation_copy.type = 'flipback';
                }
                if(i==1) { // current
                    animation_copy.callback = null;
                }
                dhx.animate(html_element[i], animation_copy);
                continue;
            }
            dhx.animate(html_element[i], animation);
        }
		return;
	}

	var node = dhx.toNode(html_element);
	if (node._has_animation)
		dhx.animate.end(node, animation);
	else
		dhx.animate.start(node, animation);
};
dhx.animate.end = function(node, animation){
	//stop animation
	node.style[dhx.env.transformPrefix+'TransitionDuration'] = "1ms";
	node._has_animation = null;
	//clear animation wait order, if any
	if (dhx._wait_animate)
		window.clearTimeout(dhx._wait_animate);

	//plan next animation, if any
	dhx._wait_animate = dhx.delay(dhx.animate, dhx,[node,animation],10);
};
dhx.animate.isSupported=function(){
	return dhx.env.transform && dhx.env.transition;
};
dhx.animate.formLine=function(next, current, animation){
    var direction = animation.direction;
	current.parentNode.style.position = "relative";
    current.style.position = "absolute";
	next.style.position = "absolute";
	if(direction=="top"||direction=="bottom"){
		next.style.left="0px";
		next.style.top = (direction=="top"?1:-1)*current.offsetHeight+"px";
	}
	else{
		next.style.top="0px";
		next.style.left = (direction=="left"?1:-1)*current.offsetWidth+"px";
	}
    current.parentNode.appendChild(next);
    if(animation.type == 'slide' && animation.subtype == 'out') {
        next.style.left = 0;
        next.style.top = 0;
        current.parentNode.removeChild(current);
        next.parentNode.appendChild(current);
    }

	return [next, current];
};
dhx.animate.breakLine=function(line){
	dhx.html.remove(line[1]); // 1 = current
	dhx.animate.clear(line[0]);
	dhx.animate.clear(line[1]);
	line[0].style.position="";
};
dhx.animate.clear=function(node){
	node.style[dhx.env.transformPrefix+'Transform'] = "";
	node.style[dhx.env.transformPrefix+'Transition'] = "";
	node.style.top = node.style.left = "";
};
dhx.animate.start = function(node, animation){
	//getting config object by merging specified and default options
 	if (typeof animation == 'string')
		animation = {type: animation};

    animation = dhx.Settings._mergeSettings(animation,{
		type: 'slide',
		delay: '0',
		duration: '500',
		timing: 'ease-in-out',
		x: 0,
		y: 0
	});

	var prefix = dhx.env.transformPrefix;

    var settings = node._has_animation = animation;

	switch(settings.type == 'slide' && settings.direction) { // getting new x, y in case it is slide with direction
		case 'right':
			settings.x = node.offsetWidth;
			break;
		case 'left':
			settings.x = -node.offsetWidth;
			break;
		case 'top':
			settings.y = -node.offsetHeight;
			break;
		case 'bottom':
		default:
			settings.y = node.offsetHeight;
			break;
	}
    if(settings.type == 'flip' || settings.type == 'flipback') {
            var skew_options = [0, 0];
            var scale_type = 'scaleX';
            if(settings.subtype == 'vertical') {
                skew_options[0] = 20;
                scale_type = 'scaleY';
            }
            else
                skew_options[1] = 20;
            if(settings.direction == 'right' || settings.direction == 'bottom') {
                skew_options[0] *= -1; skew_options[1] *= -1;
            }
    }

	var duration = settings.duration + "ms " + settings.timing + " " + settings.delay+"ms";
	var css_general = prefix+"TransformStyle: preserve-3d;"; // general css rules
	var css_transition = '';
	var css_transform = '';

	switch(settings.type) {
		case 'fade': // changes opacity to 0
			css_transition = "opacity " + duration;
			css_general = "opacity: 0;";
			break;
		case 'show': // changes opacity to 1
			css_transition = "opacity " + duration;
			css_general = "opacity: 1;";
			break;
        case 'flip':
            duration = (settings.duration/2) + "ms " + settings.timing + " " + settings.delay+"ms";
            css_transform = "skew("+skew_options[0]+"deg, "+skew_options[1]+"deg) "+scale_type+"(0.00001)";
            css_transition = "all "+(duration);
            break;
        case 'flipback':
            settings.delay += settings.duration/2;
            duration = (settings.duration/2) + "ms " + settings.timing + " " + settings.delay+"ms";
            node.style[prefix+'Transform'] = "skew("+(-1*skew_options[0])+"deg, "+(-1*skew_options[1])+"deg) "+scale_type+"(0.00001)";
            node.style.left = "0";

            css_transform = "skew(0deg, 0deg) "+scale_type+"(1)";
            css_transition = "all "+(duration);
            break;
		case 'slide': // moves object to specified location
			var x = settings.x +"px";
			var y = settings.y +"px";
            // translate(x, y) OR translate3d(x, y, 0)
			css_transform = dhx.env.translate+"("+x+", "+y+((dhx.env.translate=="translate3d")?", 0":"")+")";
			css_transition = dhx.env.transformCSSPrefix+"transform " + duration;
			break;
		default:
			break;
	}

	//set styles only after applying transition settings
    dhx.delay(function(){
        node.style[prefix+'Transition'] = css_transition;
        dhx.delay(function(){
            if (css_general)
                node.style.cssText += css_general;
            if (css_transform)
                node.style[prefix+'Transform'] = css_transform;
            var transitionEnded = false;
            var tid = dhx.event(node, dhx.env.transitionEnd, function(ev){
                node._has_animation = null;
                if (settings.callback) settings.callback.call((settings.master||window), node,settings,ev);
                transitionEnded = true;
                dhx.eventRemove(tid);
            });
            window.setTimeout(function(){
                if(!transitionEnded){
                    node._has_animation = null;
                    if (settings.callback) settings.callback.call((settings.master||window), node,settings);
                    transitionEnded = true;
                    dhx.eventRemove(tid);
                }
            }, (settings.duration*1+settings.delay*1)*1.3);
        });
    });
};



/* DHX DEPEND FROM FILE 'ui/window.js'*/


/*DHX:Depend ui/window.css*/

/*DHX:Depend ui/view.js*/
/*DHX:Depend core/movable.js*/
/*DHX:Depend libs/animate.js*/
/*DHX:Depend core/mouse.js*/


/*
	var t = dhx.ui.dialog({
		template:"abs"
	});
	var t = dhx.ui.dialog({
		cells:[]
	});
	var t = dhx.ui.dialog({
		cells:[]
	});
	var t = dhx.ui.dialog({
		view:"dataview"
		...
	});
	var t = dhx.ui({
		view:"window"
		body:{
			
		}
	});
	
*/

dhx.Modality = {
    modal_setter:function(value){
	    if (value){
	    	if (!this._modal_cover){
		        this._modal_cover = dhx.html.create('div',{
		        	"class":(value=="rich"?"dhx_modal_rich":"dhx_modal")
		    	});
		    	
		    	this._modal_cover.style.zIndex = dhx.ui.zIndex();
		    	this._viewobj.style.zIndex = dhx.ui.zIndex();
		        document.body.appendChild(this._modal_cover);
	        }
	    }
	    else {
	        if (this._modal_cover) 
	            dhx.html.remove(this._modal_cover);
	        this._modal_cover = null;
	    }
	    return value;
    }
};

	
dhx.protoUI({
	name:"window",
	_init:function(config){
		this._viewobj.innerHTML = "<div class='dhx_win_content'><div class='dhx_win_head'></div><div class='dhx_win_body'></div></div>";
		
		this._contentobj = this._viewobj.firstChild;
		this._headobj = this._contentobj.childNodes[0];
		this._bodyobj = this._contentobj.childNodes[1];
		this._viewobj.className +=" dhx_window";
		
		this._head_cell = this._body_cell = null;
		this._settings._inner = {top:false, left:false, right:false, bottom:false }; //set border flags
		if (!config.id) config.id = dhx.uid();
	},
	_remove:function(){ 
		this._body_cell = { destructor:function(){} };	
	},
	_replace:function(new_view){
		this._body_cell.destructor();
		this._body_cell = new_view;
		this._body_cell._parent_cell = this;
		
		this._bodyobj.appendChild(this._body_cell._viewobj);
		this.resize();		
	},
	show:function(node, mode, point){ 
		this._settings.hidden = false;
		this._viewobj.style.zIndex = dhx.ui.zIndex();
		if (this._settings.modal)
			this.modal_setter(true);
			
		var pos, dx, dy;
		 if (node){
			if (typeof node == "object" && !node.tagName){
				/*below logic is far from ideal*/
				pos = { x:node.clientX-this._last_size[0]/2, y:node.clientY};
				dx = document.body.offsetWidth;
				dy = 1;
			} else {
				node = dhx.toNode(node);
				dhx.assert(node,"Not existing target for window:show");
			}	
			
			
			var x = document.body.offsetWidth;
			var y = document.body.offsetHeight;
			dx = dx || node.offsetWidth;
			dy = dy || node.offsetHeight;
			var size = this._last_size;
			pos = pos||dhx.html.offset(node);
			var delta_x = 6; var delta_y=6; var delta_point = 6;
			point = "top";
			
			var point_y=0; var point_x = 0;
			var fin_y=0; var fin_x = 0;
			
			if (mode == "right"){
				fin_x = pos.x+delta_x+dx; 
				delta_y = -dy;
				point = "left";
				point_y = Math.round(pos.y+dy/2);
				point_x = fin_x - delta_point;
			} else if (mode == "left"){
				fin_x = pos.x-delta_x-size[0]-1; 
				delta_y = -dy;
				point = "right";
				point_y = Math.round(pos.y+dy/2);
				point_x = fin_x + size[0]+1;
			} else  {
				if (x-pos.x > size[0]){
					fin_x = pos.x; //aligned
				} else
					fin_x = x-delta_x-size[0]; //not aligned
				point_x = Math.round(pos.x+dx/2);
				//when we have a small popup, point need to be rendered at center of popup
				if (point_x > fin_x + size[0])
					point_x = fin_x + size[0]/2;
			}
			
			if (y-dy-pos.y-delta_y > size[1]){
				//bottom	
				fin_y = dy+pos.y+delta_y;
				if (!point_y){
					point = "top";
					point_y = fin_y-delta_point;
				}
			} else {
				//top
				fin_y = pos.y-delta_y - size[1];
				if (fin_y < 0){
					fin_y = 0; 
					point = false;
				} else if (!point_y){
					point = "bottom";
					fin_y --;
					point_y = fin_y+size[1]+1;
				}
			}
			this.setPosition(fin_x, fin_y);
			if (point && this._set_point) 
				this._set_point(point,point_x, point_y);
		}
		this._show_time = new Date();
		this._viewobj.style.display = "block";
		
		if (this._hidden_render){
			for (var i=0; i < this._hidden_render.length; i++)
				dhx.ui.get(this._hidden_render[i]).render();
			this._hidden_render = [];
			this._hidden_hash = {};
		}
		
		this.callEvent("onShow",[]);
	}, 
	hidden_setter:function(value){
		if(value) 
			this.hide();
		else
			this.show();
		return !!value;
	},
	hide:function(){ 
		if(this._settings.hidden)
			return;
		if (new Date() - this._show_time < 100) return; //prevent self closing on opening click
		if (this._settings.modal)
			this.modal_setter(false);
			
		if (this._settings.position == "top"){
				dhx.animate(this._viewobj, {type: 'slide', x:0, y:0, duration: 300,
											callback:this._hide_callback, master:this});
		}
		else 
			this._hide_callback();
	},
	_hide_callback:function(){
		this._viewobj.style.display = "none";
		this._settings.hidden = true;
		this.callEvent("onHide",[]);
	},
	close:function(){
		this.define("modal", false);
		//temp
		dhx.html.remove(this._viewobj);
		this.destructor(); 
	},
	body_setter:function(value){ 
		if (typeof value != "object")
			value = {template:value };
		
		this._body_cell = dhx.ui._view(value);
		this._body_cell._parent_cell = this;
		this._bodyobj.appendChild(this._body_cell._viewobj);
		return value;
	},
	head_setter:function(value){ 
		if (value === false) return value;
		if (typeof value != "object")
			value = { template:value, css:"dhx_alert_template" };
			
		this._head_cell = dhx.ui._view(value);
		this._head_cell._parent_cell = this;
		this._headobj.appendChild(this._head_cell._viewobj);
		return value;
	},
	getBody:function(){
		return this._body_cell;
	},
	getHead:function(){
		return this._head_cell;	
	},
	resize:function(){
		var sizes=this._get_desired_size();
		this._set_size((sizes[1]||this._settings.width), (sizes[3]||this._settings.height));
		this._setPosition(this._settings.left, this._settings.top);
	},
	_setPosition:function(x,y){
		if (this._settings.position){
			var left = Math.round((document.body.offsetWidth-this._settings.width)/2);
			var top = Math.round((document.body.offsetHeight-this._settings.height)/2);
			
			if (this._settings.position == "top"){
				if (dhx.animate.isSupported())
					top = -1*this._settings.height;
				else
					top = 10;
			}
					
			this.setPosition(left, top);
			
			if (this._settings.position == "top")
				dhx.animate(this._viewobj, {type: 'slide', x:0, y:this._settings.height, duration: 300 });
		} else 
			this.setPosition(x,y);
	},
	setPosition:function(x,y){
		this._viewobj.style.top = y+"px";
		this._viewobj.style.left = x+"px";
		this._settings.left = x; this._settings.top=y;
	},
	_get_desired_size:function(){
		var size =  this._body_cell._get_desired_size();
		if (this._head_cell){
			var head_size = this._head_cell._get_desired_size();
			if (head_size[3])
				this._settings.headHeight = head_size[3];
		}
		
		if (size[3]){
			size[3]+=(this._settings.head !== false?this._settings.headHeight:0);
			this._settings.height = size[3];
		}
		if (size[1]) 
			this._settings.width = size[1];
		
		if (size[0] || size[2]) this._settings.gravity = Math.max(size[0], size[2]);
		
		return dhx.ui.view.prototype._get_desired_size.call(this);
	},
	_set_size:function(x,y){
		if (dhx.ui.view.prototype._set_size.call(this,x,y)){
			x = this._content_width;
			y = this._content_height;
			if (this._settings.head === false) {
				this._headobj.style.display="none";
				this._body_cell._set_size(x,y);
			} else { 
				this._head_cell._set_size(x,this._settings.headHeight);
				this._body_cell._set_size(x,y-this._settings.headHeight);
			}
		}
	},
	defaults:{
		headHeight:43,
		width:300,
		height:200,
		top:100, 
		left:100,
		body:"",
		head:""
	}
}, dhx.ui.view, dhx.Movable, dhx.Modality, dhx.EventSystem);

/*
dhx.ui.dialog = dhx.ui.dialog = dhx.proto({
	_init:function(config){
		this._after_init.push(this._link_toolbar);
		this._toolbar = dhx.uid();
		config.body = {
			rows:[
				typeof config.body == "string" ? {template:config.body} : config.body,
				{ view:"toolbar", data:(config.buttons||this.defaults.buttons), type:"BigButtonsBar", id:this._toolbar}
			]
		};
	},
	_link_toolbar:function(){
		var t = this._settings.toolbar = dhx.ui.get(this._toolbar);
		t.mapEvent({
			onitemclick:this
		});
	},
	defaults:{
		head:false,
		position:"center",
		buttons:[{type:"button", label:"Ok", align:"center"}, {type: "default_button", label:"Cancel", align:"center"} ],
		modal:"rich"
	}
}, dhx.ui.window);*/

dhx.protoUI({
	name:"popup",
	_init:function(){
		this._settings.head = false;
		dhx.event(this._contentobj,"click", dhx.bind(this._clever_block, this));
		dhx.attachEvent("onClick", dhx.bind(this._hide, this));
		this.attachEvent("onHide", this._hide_point);
	},
	_clever_block:function(){
		this._show_time_click = new Date();
	},
	_hide:function(){
		if (new Date()-(this._show_time_click||0) > 250 )
			this.hide();
	},
	_get_desired_size:function(){ 
		var size =  this._body_cell._get_desired_size();
		if (size[3])
			this._settings.height = size[3]+this._settings.padding*2;
		if (size[1])
			this._settings.width = size[1]+this._settings.padding*2;
		if (size[0] || size[2]) this._settings.gravity = Math.max(size[0], size[2]);
		
		return dhx.ui.view.prototype._get_desired_size.call(this);
	},
	_set_size:function(x,y){
		if (dhx.ui.view.prototype._set_size.call(this,x,y)){
			x = this._content_width-this._settings.padding*2;
			y = this._content_height-this._settings.padding*2;
			this._contentobj.style.padding = this._settings.padding+"px";
			this._headobj.style.display="none";
			this._body_cell._set_size(x,y);
		}
	},
	body_setter:function(value){
		value = dhx.ui.window.prototype.body_setter.call(this, value);
		this._body_cell._settings._inner = {top:false, left:false, right:false, bottom:false };
		return value;
	},
	defaults:{
		padding:8
	},
	head_setter:null,
	_set_point:function(mode, left, top){
		this._hide_point();
		document.body.appendChild(this._point_element = dhx.html.create("DIV",{ "class":"dhx_point_"+mode },""));
		this._point_element.style.zIndex = dhx.ui.zIndex();
		this._point_element.style.top = top+"px";
		this._point_element.style.left = left+"px";
	},
	_hide_point:function(){
		this._point_element = dhx.html.remove(this._point_element);
	}
}, dhx.ui.window);







dhx.protoUI({
	name:"alert",
	defaults:{
		position: 'center',
		head: { template:"Info",  css:"dhx_alert_template" },
		height:170, modal:true, callback:null,
		body:{
			type:"clean", 
			rows:[
				{	
					template: "<div class='dhx_alert_text'>#text#</div>",
					data:{ text: "You have forgot to define the text :) " }	
				},
				{ view:"button", height:60, id:"dhx_alert_ok",css:"BigButton", label:"Ok", click:function(){
							this.getParent().getParent()._callback(true);
						} 
				}
			]
		}
	},
	_init:function(config){
		if (!this._viewobj.parentNode)
		document.body.appendChild(this._viewobj);
		this._after_init.push(this.resize);
	},
	_reinit:function(config){ 
		if (typeof config == "string"){
			config = {
				title:this.defaults.head.template,
				message:config
			};
		}
		dhx.extend(config, this.defaults);
		delete config.head; delete config.body;
		this._parseSettings(config,{});
		
		this.resize();
		this.show();
	},
	title_setter:function(value){
		this._head_cell.define("template", value);
		this._head_cell.render();
	},
	message_setter:function(value){
		var body = this._body_cell._cells[0];
		body.data={ text:value };
		body.render();
	},
	labelOk_setter:function(value){
		var body = this._body_cell._cells[1];
		body.config.label = value;
		body.render();
	},
	labelCancel_setter:function(value){
		var body = this._body_cell._cells[2];
		body.config.label = value;
		body.render();
	},
	_callback:function(mode){ 
		this.hide();
		if (this._settings.callback)
			dhx.toFunctor(this._settings.callback).call(this, mode, this._settings.details);
		
	}
}, dhx.ui.window);


dhx.alert = dhx.single(dhx.ui.alert);


dhx.protoUI({
	name:"confirm",
	defaults:{
		height:210,
		body:{
			type:"clean", 
			rows:[
				{id: "dhx_confirm_message", template: "<div class='dhx_alert_text'>#text#</div>",
					data:{ text: "You have forgot to define the text :) " }	
				},
				{	height:53, view:"button", css:"BigButton", id:"dhx_confirm_ok", label:"Ok", click:function(){
					this.getParent().getParent()._callback(true);
				} },
				{ 	height:55, view:"button", type:"round", css:"BigButton", id:"dhx_confirm_cancel", label:"Cancel", click:function(){
					this.getParent().getParent()._callback(false);
				} }
			]
		}
	}
},dhx.ui.alert);
dhx.confirm = dhx.single(dhx.ui.confirm);



/* DHX DEPEND FROM FILE 'ui/notice.js'*/


/*DHX:Depend ui/window.js*/
/*DHX:Depend ui/notice.css*/

dhx.notice = function(message){
	if(typeof message != 'object') {
		message = {message: message};
	}
	
	message = dhx.Settings._mergeSettings(message, {
		message: "Sample notice message.",
		css: "",
		width: 240,
		height: 70,
		delay: 3500,
		top: 9,
		right: 9
	});
	
	if (dhx.notice._top)
		message.top += dhx.notice._top;
	
	dhx.notice._top	= message.top + message.height;
	
	var message_div = dhx.html.create('div', {
		"class":"dhx_notice "+message.css
	}, "<span class='dhx_notice_content'>"+message.message+"</span>");
	
	message_div.style.cssText = "width:"+message.width+"px; height:"+message.height+"px; top:"+message.top+"px; right:"+message.right+"px";
	document.body.appendChild(message_div);
	
	dhx.delay(dhx.notice._clear, message_div, [dhx.notice._top], message.delay);
};
dhx.notice._clear = function(top){
	if (dhx.notice._top == top) dhx.notice._top = 0;
	dhx.html.remove(this);
};



/* DHX DEPEND FROM FILE 'libs/crspanel.js'*/


dhx.CarouselPanel = {
   _renderPanel:function(){
		var panel, style, top, left;
		panel = this._settings.panel;
		dhx.html.remove(this._carouselPanel);
		
		style = "z-index:"+dhx.ui.zIndex()+";";
		if (panel.align=="bottom"||panel.align=="top"){
			style += "height:"+panel.size+"px; left:0px;";
			top = 0;
			if (panel.align=="bottom")
				top = this._content_height-this._settings.panel.size;
			style += "top:"+top+"px";
		} else if(panel.align=="right"||panel.align=="left"){
			style += "width:"+panel.size+"px;top:0px;";
			left = 0; 
			if (panel.align=="right")
				left = this._content_width-this._settings.panel.size;
			style += "left:"+left+"px";
		}
		this._carouselPanel = dhx.html.create("DIV",{
			"class":"dhx_carousel_panel",
			"style":style
		},"");
		this._viewobj.appendChild(this._carouselPanel);
			this._renderPanelItems();
	},
	_renderPanelItems:function(){
		var item, panel;
		panel = this._settings.panel;
		if(!this._carouselPanel)
			this._renderPanel();
		else 
			this._clearPanel();

		var count = (this._cells?this._cells.length:this.data.order.length);
		if(count>1){
			for (var i=0; i < count; i++){
				item = dhx.html.create("DIV",{
					"class":"dhx_item dhx_carousel_"+(i==this._active_cell?"active":"inactive"),
					"style":(panel.align=="left"||panel.align=="right"?"float:none;":"")
				},"");
				this._carouselPanel.appendChild(item);
			}
			
			var size =  count *this._settings.panel.itemSize;
			
			if(panel.align=="bottom"||panel.align=="top"){
				this._carouselPanel.style.left = (this._content_width-size)/2+this._viewobj.scrollLeft+"px";
				this._carouselPanel.style.width = size+"px";
			}
			else
				this._carouselPanel.style.top = (this._content_height-size)/2+this._viewobj.scrollTop+"px";
		}
	},
	_clearPanel:function(){
		if (this._carouselPanel){
			var coll = this._carouselPanel.childNodes;
			for (var i = coll.length - 1; i >= 0; i--)
				dhx.html.remove(coll[i]);
		}
	}
};



/* DHX DEPEND FROM FILE 'ui/carousel.js'*/


 /*DHX:Depend ui/view.js*/
/*DHX:Depend core/movable.js*/ 	
/*DHX:Depend libs/crspanel.js*/
/*DHX:Depend ui/carousel.css*/
dhx.protoUI({
	name:"carousel",
	defaults:{
		scrollSpeed:"100"
	},
	_init:function(){
		this._viewobj.className += " dhx_carousel";
		this._viewobj.appendChild(dhx.html.create("DIV",{ 
			"class" : "dhx_scroll_carousel" }
		,""));
		this._contentobj = this._viewobj.firstChild;
		this._dataobj = null;
		
		this._active_cell = 0;
		this._after_init.push(this._after_init_call);
	},
	_after_init_call:function(){
		this._contentobj.setAttribute("touch_scroll", (this._vertical_orientation?"y":"x"));
		this.attachEvent("onAfterScroll",this._correctDelta);
	},
	_correctDelta:function(matrix){
		var size =  (this._vertical_orientation?this._content_height:this._content_width);

		var correction;
		if (this._vertical_orientation) {
			correction = Math.round(matrix.f/size);
			matrix.f = correction*size;
		} else { 
			correction = Math.round(matrix.e/size);
			matrix.e = correction*size;
		}
		
		this._active_cell = -correction;
		if(this._settings.panel)
			this._renderPanelItems();
			
		return true;
	},
	_show:function(obj){
		var i, _next_cell, _size, x, y;
		_next_cell = -1;
		for (i=0; i < this._cells.length; i++)
			if (this._cells[i]==obj){
				_next_cell = i;
				break;
			}
		if (_next_cell < 0 || _next_cell == this._active_cell)
			return;
		this._active_cell = _next_cell;
		_size =  (this._vertical_orientation?this._content_height:this._content_width);
		x = -(this._vertical_orientation?0:_next_cell*_size);
		y = -(this._vertical_orientation?_next_cell*_size:0);
		this.scrollTo(x,y);
		this._renderPanel();
	},
	scrollTo:function(x,y){
		if (dhx.Touch)
			dhx.Touch._set_matrix(this._contentobj, x,y, this._settings.scrollSpeed||"100ms");
		else {
			this._contentobj.parentNode.scrollLeft=-x;
			this._contentobj.parentNode.scrollTop=-y;
		}
	},
	panel_setter:function(config){
		this._mergeSettings(config,{
			size: 16,
			itemSize: 16,
			align:"bottom"
		});
		return config;
	},
	_get_desired_size:function(){
		return dhx.ui.layout.prototype._get_desired_size.call(this);
	},
	_set_size:function(x,y){ 
		var c = this._cells.length;
		var yc = (this._vertical_orientation?c:1);
		var xc = (this._vertical_orientation?1:c);
		dhx.ui.view.prototype._set_size.call(this,x,y);
		this._contentobj.style.height = y*yc+"px";
		this._contentobj.style.width = x*xc+"px";
		this._set_child_size(x*xc, y*yc);
		this._renderPanel();
	},
	getActive:function(){
		return this._cells[this._active_cell]._settings.id;
	}
},dhx.CarouselPanel,dhx.ui.baselayout,dhx.EventSystem);



/* DHX DEPEND FROM FILE 'ui/grid.js'*/


/*
	UI:Grid
*/
/*DHX:Depend ui/grid.css*/
/*DHX:Depend core/render/render.js*/
/*DHX:Depend core/datastore.js*/
/*DHX:Depend core/config.js*/
/*DHX:Depend core/load.js*/
/*DHX:Depend ui/view.js*/

/*DHX:Depend core/dhx.js*/
/*DHX:Depend core/selection.js*/ 	
/*DHX:Depend core/mouse.js*/ 	
 	

dhx.protoUI({
	name:"grid",
	_init:function(config){
		this._contentobj.innerHTML = "<div class='dhx_grid_header' style='width:100%;height:"+this._settings.headerHeight+"px;'></div><div class='dhx_grid_body'></div>";
		this._contentobj.className +=" dhx_grid";
		
		this._bodyobj = this._dataobj = this._contentobj.childNodes[1];
		
		dhx.extend(this,dhx.Scrollable);
		
		this.data.provideApi(this,true);		
		this.data.attachEvent("onStoreUpdated", dhx.bind(this.render, this));
		this.attachEvent("onBeforeRender", this._render_header);
		/*
		MK:has not sense for touch version
		dhx.event(this._dataobj,"scroll",dhx.bind(this._scrollHeader,this));
		*/
		this._sortedColumn = null;		
	},
	header_setter:function(config){
		this._bodyobj.previousSibling.style.display = (config?"":"none");
		return config;
	},
	defaults:{
		 select:true,
		 type:"default",
		 sorting:true,
		 header:true,
		 scroll:true,
		 headerHeight:30
	},
	_id:"dhx_f_id",
	on_click:{
		dhx_grid_row:function(e,id){
			if (this._settings.select){
				if (this._settings.select=="multiselect")
					this.select(id, e.ctrlKey, e.shiftKey); 	//multiselection
				else
					this.select(id);
			}
		},
		dhx_grid_header:function(e,id){
			if(!this._settings.sorting) return;
			id = dhx.html.locate(e,"column_id");
			if(id!==null){
				this._sortedColumn = id;
				var sort = this._settings.fields[id].sort;
				this.sort(sort);
				sort.dir = (sort.dir=="desc"?"asc":"desc");
			}
		}
	},
	fields_setter:function(config){
		var fields ={};
		for(var i=0;i<config.length; i++){
			if(typeof(config[i].id)=="undefined")
				config[i].id = "f"+i;
			var id = config[i].id;
			this._mergeSettings(config[i],{
				width:100,
				label:id,
				template:"#"+config[i].id+"#",
				css:this.type.css,
				sort:{
					by:"#"+id+"#",
					dir:"asc",
					as:"string"
				},
				align:"left"
			});
			config[i].template = dhx.Template(config[i].template);
			fields[id] = config[i];
			dhx.assert(typeof config[i].width == "number","Grid :: column width must be an integer number");
		}
		this.type.fields = fields;
		return fields;
	},
	_render_header:function(){
		if(!this._settings.header) return;
		
		var fields = this._settings.fields;
		var header = this._bodyobj.previousSibling;
		
		var html = "<table style='width:0px;height:100%' cellspacing='0' cellpadding='0'><tr>";
		
		for(var name in fields)
			html+=this._renderHeaderItem(fields[name].label,fields[name].width,name);
	//	html+=this._renderHeaderItem("",-1);

		html+="</tr></table>";
		header.innerHTML = html;
	},
	_renderHeaderItem:function(value,width,name){
		var html = "<td class='dhx_grid_header_td' ";
		if(!dhx.isNotDefined(name))
			html+="column_id='"+name+"'";
		html+="><div style='width:"+width+"px;'>"+(value===""?"&nbsp;":value);
		
		
		
		if(name && name==this._sortedColumn){
			var dir = this._settings.fields[this._sortedColumn].sort.dir;
			html+="<div class='dhx_sort_"+dir+"' style='left:"+(width-this.type.sortImgWidth)+"px'></div>";
		}
		html+="</div></td>";
		return html;
	},
	/*MK:has not sense for touch version
	_scrollHeader:function(){
		this._headerobj.scrollLeft=this._bodyobj.scrollLeft;
	},
	*/
	_set_size:function(x,y){
		if (dhx.debug_size)
			dhx.log(this.name+"@"+this.config.id+" :"+x+","+y);
			
		if (dhx.ui.view.prototype._set_size.apply(this, arguments)){
			this._bodyobj.style.height =  this._content_height-(this._settings.header?this._settings.headerHeight:0)+"px";
			this._bodyobj.style.width = this._content_width +"px";
			this._bodyobj.previousSibling.style.width = this._content_width+"px";
		}
	},
	type:{ 
		template:function(obj,type){
			var str = "";
			for(var name in type.fields){
				var t = type.fields[name];
			 	str += "<td style='' class='dhx_td' ><div align='"+t.align+"' style='width:"+t.width+"px;height:"+type.height+"px;line-height:"+type.height+"px' class='dhx_cell "+t.css+"'>"+t.template(obj)+"</div></td>";
			 }
			return str;
		},
		align:"left",
		height:42,
		css:"",
		sortImgWidth:20,
		type:"text",
		templateStart:function(obj,type){
			return "<table dhx_f_id='"+obj.id+"' class='dhx_grid_row"+(obj.$selected?"_selected":"")+" "+type.templateCss(obj,type)+"' cellpadding='0' cellspacing='0'><tr>";
		},
		templateCss:dhx.Template(""),
		templateEnd:dhx.Template("</tr></table>")
	}
}, dhx.SelectionModel, dhx.MouseEvents, dhx.RenderStack, dhx.DataLoader, dhx.ui.view, dhx.EventSystem, dhx.Settings);

dhx.Type(dhx.ui.grid, {
	name:"dummy"
});



/* DHX DEPEND FROM FILE 'ui/video.js'*/


/*
	UI:Video
*/
/*DHX:Depend ui/video.css*/
/*DHX:Depend ui/view.js*/
dhx.protoUI({
	name:"video",
	_init:function(config){
		if (!config.id) config.id = dhx.uid();
		this._after_init.push(this._init_video);
	},
	_init_video:function(){
		var c = this._settings;
		this._contentobj  = dhx.html.create("video",{
			"class":"dhx_view_video",
			"style":"width:100%;height:100%;",
			"src":c.src,
			"autobuffer":"autobuffer"
		},"");
		if(c.poster)
			this._contentobj.poster=c.poster;
		if(this._contentobj.addEventListener)
		this._contentobj.addEventListener('click', function(videoNode) { 
          return function() { 
            videoNode.play(); 
          }; 
        }(this._contentobj),false); 
	
		if(c.controls)
			this._contentobj.controls=true;
		if(c.autoplay)
			this._contentobj.autoplay=true;
		this._viewobj.appendChild(this._contentobj);
	},
	getVideo:function(){
		return this._contentobj;
	},
	defaults:{
		src:"",
		controls: true,
		autoplay:true
	}
}, dhx.ui.view);



/* DHX DEPEND FROM FILE 'ui/gmap.js'*/


/*
	UI:Google Map
*/
/*DHX:Depend ui/view.js*/
//container - can be a HTML container or it's ID
dhx.protoUI({
	name:"googlemap",
	_init:function(config){
		dhx.assert(google,"'http://maps.google.com/maps/api/js?sensor=false' is not included");
		if (!config.id) config.id = dhx.uid();
		this._viewobj.innerHTML = "<div class='dhx_map_content' style='width:100%;height:100%'></div>";
		this._contentobj = this._viewobj.firstChild;
		this.map = null;
		this._after_init.push(this.render);
	},
	render:function(){
		var c = this._settings;
		var mapOptions = {
			zoom: c.zoom,
			center: c.center,
			mapTypeId: c.mapType
		};
		this.map = new google.maps.Map(this._contentobj, mapOptions);
	},
	center_setter:function(config){
		if(typeof(config)!="object")
			config={};
		this._mergeSettings(config,{
			x:48.724,
			y: 8.215
		});
		config = (new google.maps.LatLng(config.x, config.y));
		if(this.map)
			this.map.setCenter(config);	
		return config;
	},
	mapType_setter:function(config){
		/*ROADMAP,SATELLITE,HYBRID,TERRAIN*/
		config = google.maps.MapTypeId[config];
		if(this.map)
			this.map.setMapTypeId(config);
		return config;
	},
	zoom_setter:function(config){
		if(this.map)
			 this.map.setZoom(config);
		return config;
	},
	defaults:{
		zoom: 5,
		center:{},
		mapType: "ROADMAP" 
	},
	_set_size:function(){
		dhx.ui.view.prototype._set_size.apply(this, arguments);
		google.maps.event.trigger(this.map, "resize");
	}
}, dhx.ui.view);



/* DHX DEPEND FROM FILE 'core/values.js'*/


dhx.Values = {
	_init:function(){
		this.elements = {};
	},
	focus:function(name){
		dhx.assert(this.elements[name],"unknown input name: "+name);
		this.elements[name].focus();
	},
	setValues:function(data){
		if(!this.isVisible(this._settings.id)){
			this._timeout_data = data;
			return;
		}
		this._values = dhx.copy(data);
		if (dhx.debug_render)
			dhx.log("Render: "+this.name+"@"+this._settings.id);

		for (var name in this.elements)
			if (this.elements[name] && this.elements[name].isVisible() && !dhx.isNotDefined(data[name]))
				this.elements[name].setValue(data[name]);
		this.callEvent("onChange",[]);
	},
	getValues:function(){
		var data = (this._values?dhx.copy(this._values):{});
		for (var name in this.elements)
			data[name] = this.elements[name].getValue();
		return data;
	},
	clear:function() {
		var data = {};
		for (var name in this.elements)
			if (this.elements[name]._allowsClear)
				data[name] = this.elements[name]._settings.defaultValue||"";
		
		this.setValues(data);
	},
	_onLoad:function(text,xml,loader){
		var driver = this.data.driver;
		var top = driver.getRecords(driver.toObject(text,xml))[0];
		this.setValues(driver?driver.getDetails(top):text);
		this.callEvent("onXLE",[]);
	},
	_mark_invalid:function(id,obj){
		dhx.html.addCss(this.elements[id]._dataobj.firstChild, "invalid");
	},
	_clear_invalid:function(id,obj){
		dhx.html.removeCss(this.elements[id]._dataobj.firstChild, "invalid");
	}
};




/* DHX DEPEND FROM FILE 'ui/inputs.js'*/


dhx.CanvasMgr = function(name){
	var cache = dhx.CanvasMgr.prototype._cache;
	if (cache[name] || !document.getCSSCanvasContext) return;
	cache[name] = true;
	dhx.CanvasMgr.prototype[name](cache);
};


dhx.CanvasMgr.prototype={
	buttonGrd:["#fefefe", "#e0e0e0", "#e5e5e5", "#e0e0e0",32],
	_cache:[],
	_abstract_angle:function(color1, color2, height, name, back){
		var pt = document.getCSSCanvasContext("2d", name, 18, height);
		var gradient = pt.createLinearGradient(0, 0, 0, height);
			gradient.addColorStop(0, color1);
			gradient.addColorStop(1, color2);
			pt.fillStyle = gradient;
			pt.strokeStyle = "#93B0BA";
			pt.lineWidth  = 2;
			if (back){
				pt.moveTo(0 , 0.5);
				pt.lineTo(17.5, height/2+0.5);
				pt.lineTo(0,  height-0.5);
				pt.lineTo(0 , 0.5);
			} else {
				pt.moveTo(18, 0.5);
				pt.lineTo(0.5 ,height/2+0.5);
				pt.lineTo(18, height-0.5);
				pt.lineTo(18, 0.5);
			}
			pt.stroke();
			pt.fill();
	},
	dhxArrowLeftT:function(){
		this._abstract_angle(this.buttonGrd[2], this.buttonGrd[3], this.buttonGrd[4], "dhxArrowLeftT");
	},
	dhxArrowRightT:function(){
		this._abstract_angle(this.buttonGrd[2], this.buttonGrd[3], this.buttonGrd[4], "dhxArrowRightT", true);
	},
	dhxArrowLeft:function(){
		this._abstract_angle(this.buttonGrd[0], this.buttonGrd[1], this.buttonGrd[4], "dhxArrowLeft");
		dhx.CanvasMgr("dhxArrowLeftT");
	},
	dhxArrowRight:function(){
		this._abstract_angle(this.buttonGrd[0], this.buttonGrd[1], this.buttonGrd[4], "dhxArrowRight", true);
		dhx.CanvasMgr("dhxArrowRightT");
	}
};


dhx.attachEvent("onClick", function(e){
	var element = dhx.ui.get(e);
	if (element && element.touchable){
		//for inline elements - restore pointer to the master element
		element.getNode(e);
		//reaction on custom css elements in buttons
		var trg=e.target||e.srcElement;
		var css = "";
		var id = null;
		var found = false;
		if (trg.className && trg.className.indexOf("dhx_view")===0) return;
		//loop through all parents
		while (trg && trg.parentNode){
			if (trg.getAttribute){
				if (trg.getAttribute("view_id"))
					break;
					
				css=trg.className;
				if (css){
					css = css.split(" ");
					css = css[0]||css[1];
					if (element.on_click[css]){
						var res =  element.on_click[css].call(element,e,element._settings.id,trg);
						if (res===false)
							return;
					}
				}
			}
			trg=trg.parentNode;
		}		
		
		if (element._settings.click){
			var code = dhx.toFunctor(element._settings.click);
			if (code && code.call) code.call(element, element._settings.id, e);
		}
		
		if (element._settings.multiview){
			var view = dhx.ui.get(element._settings.multiview);
			if(view&&view.show)
				view.show();
		}
		
		if (element._settings.popup){
			var popup = dhx.ui.get(element._settings.popup);
			dhx.assert(popup, "Unknown popup");
			popup._settings.master = element._settings.id;
			popup.show((element.getInput()||element.getNode()),(popup._body_cell._settings.align||"bottom"),true);
		}
		
		element.callEvent("onItemClick", [element._settings.id, e]);
	}
});


dhx.protoUI({
	name:"button",
	touchable:true,
	defaults:{
		template:"<div class='dhx_el_button'><input type='button' style='width:100%;' value='#label#'></div>",
		height:42,
		label:"label",
		_cssConstant:10
	},
	_init:function(config){
		this.data = this._settings;
		this._dataobj = this._viewobj;
		
		if (dhx._parent_collection){
			dhx.assert(config.name||config.id, "input missing both id and name");
			dhx._parent_collection.elements[config.name||config.id]=this;
			this.mapEvent({
				onbeforetabclick:dhx._parent_collection,
				onaftertabclick:dhx._parent_collection,
				onitemclick:dhx._parent_collection
			});
		}
		
		if (config.type == "prev")
			dhx.CanvasMgr("dhxArrowLeft");
		if (config.type == "next")
			dhx.CanvasMgr("dhxArrowRight");
	},
	type_setter:function(value){
		this._settings.template = dhx.Template(this._types[value][0]);
		var cconst = this._types[value][1];
		if (cconst)
			this._settings._cssConstant = cconst;
	},
	_types:{
		round:["<div class='dhx_el_roundbutton'><input type='button' style='width:100%;' value='#label#'></div>"],
		"default":["<div class='dhx_el_defaultbutton'><input type='button' style='width:100%;' value='#label#'></div>"],
		form:[function(obj) {
			return "<div class='dhx_el_formbutton'><div style='width:100%;text-align:"+obj.align+"'><input type='button' class='dhx_inp_form_button' style='text-align: "+obj.inputAlign+"; width: "+(obj.inputWidth?obj.inputWidth+"px":"100%")+";' value='"+(obj.label||obj.value)+"' /></div></div>";
		}],
		prev:["<div class='dhx_el_prevbutton'><div class='dhx_el_prevbutton_arrow'></div><div class='dhx_el_prevbutton_input_cont'><input type='button' value='#label#' /></div></div>",28],
		next:["<div class='dhx_el_nextbutton'><div class='dhx_el_nextbutton_input_cont'><input type='button' value='#label#' /></div><div class='dhx_el_nextbutton_arrow'></div></div>",28]
	},
	_set_size:function(x,y){
		if(dhx.ui.view.prototype._set_size.call(this,x,y)){
			this.render();
		}
	}, 
	_setValue:function(value){
		this._settings.label = value;
		this.getInput().value = value; 
	},
	setValue:function(value){
		var oldvalue = this._settings.value;
		this._settings.value = value;
		if (this._dataobj.childNodes.length > 0){
			this._current_value = value;
			this._setValue(value);
			this.callEvent("onChange", [value, oldvalue]);
		}
	},
	focus:function(){
	},
	getValue:function(){
		return this._settings.label||"";	
	},
	getInput: function() {
		return this._dataobj.getElementsByTagName('input')[0];
	},
	_getBox:function(){
		return this.getInput();
	},
	_set_inner_size:function(){
		if (this._settings.inputWidth)
			this._getBox().style.width = this._settings.inputWidth-this._settings._cssConstant+"px";
		else
			this._getBox().style.width = this._content_width - this._settings._cssConstant+ "px";
		/*if (this._settings.inputHeight)
			this._getBox().style.height = this._settings.inputHeight+"px";*/
	},
	render:function(){
		if(dhx.AtomRender.render.call(this)){
			this._set_inner_size();
			if (this._settings.align){
				switch(this._settings.align){
					case "right":
						this._dataobj.firstChild.style.cssFloat = "right";
						break;
					case "center":
						this._dataobj.firstChild.style.display = "inline-block";
						this._dataobj.firstChild.parentNode.style.textAlign = "center";
						break;
					case "middle":
						this._dataobj.firstChild.style.marginTop = Math.round((this._content_height-40)/2)+"px";
						break;
					case "bottom": 
						this._dataobj.firstChild.style.marginTop = (this._content_height-40)+"px";
						break;
					case "left":
						this._dataobj.firstChild.parentNode.style.textAlign = "left";
						break;
					default:
						dhx.assert(false, "Unknown align mode");
						break;
				}
			}
			if (this._after_render)
				this._after_render(this.data);
			if (this._current_value != this._settings.value)
				this.setValue(this._settings.value);
		}
	},
	refresh:function(){ this.render(); },
	on_click:{
		_handle_tab_click: function(ev, button){
			var id = dhx.html.locate(ev, "button_id");
			if (id && this.callEvent("onBeforeTabClick", [button, id])){
				this._settings.selected = id;
				this.refresh();
				if(this._settings.multiview){
					var view = dhx.ui.get(id);
					if(view && view.show)
						view.show();
				}
				this.callEvent("onAfterTabClick", [button, id]);
			}
		},
		dhx_el_segmented:function(ev, button){
			this.on_click._handle_tab_click.call(this, ev, button);
		},
		dhx_el_tabbar:function(ev, button) {
			this.on_click._handle_tab_click.call(this, ev, button);
		},
		dhx_inp_counter_next:function(e, obj, node){ 
			this.next(this._settings.step, this._settings.min, this._settings.max);
		}, 
		dhx_inp_counter_prev:function(e, obj, node){ 
			this.prev(this._settings.step, this._settings.min, this._settings.max);
		},
		dhx_inp_toggle_left_off: function(e, obj, node) {
			var options = this._settings.options;
			this.setValue(options[0].value);
		},
		dhx_inp_toggle_right_off: function(e, obj, node) {
			var options = this._settings.options;
			this.setValue(options[1].value);
			
		},
		dhx_inp_combo:function(e, obj, node){
			node.focus();
		},
		dhx_inp_checkbox_border: function(e, obj, node) { 
			this.toggle();
		},
		dhx_inp_checkbox_label: function(e, obj, node) {
			this.toggle();
		},
		dhx_inp_radio_border: function(e, obj, node) {
			var value = dhx.html.locate(e, "radio_id");
			this.setValue(value);
		},
		dhx_inp_radio_label: function(e, obj, node) {
			node = node.parentNode.getElementsByTagName('input')[0];
			return this.on_click.dhx_inp_radio_border.call(this, node, obj, node);
		}
	},
	_check_options:function(opts){
		dhx.assert(opts, this.name+": options not defined");
		for(var i=0;i<opts.length;i++){
			if(typeof opts[i]=="string"){
				opts[i] = {value:opts[i],label:opts[i]};
			}
			else if(!opts[i].value){
				opts[i].value = opts[i].label;
			}
			else if(!opts[i].label){
				opts[i].label = opts[i].value;
			}
		}
	}
}, dhx.ui.view, dhx.AtomRender, dhx.Settings, dhx.EventSystem);



dhx.protoUI({
	name:"imagebutton",
	defaults:{
		template:"<div class='dhx_el_imagebutton'><span><img src='#src#'/>&nbsp;#label#</span></div>",
		label:""
	}, 
	_set_inner_size:function(){}
}, dhx.ui.button);

dhx.protoUI({
	name:"label",
	defaults:{
		template:"<div class='dhx_el_label'>#label#</div>"
	},
	_getBox:function(){
		return this._dataobj.firstChild;
	},
	_setValue:function(value){
		this._settings.label = value;
		this._dataobj.firstChild.innerHTML = value;
	}
}, dhx.ui.button);

dhx.protoUI({
	name:"icon",
	defaults:{
		template:"<div class='dhx_el_icon'><div class='dhx_el_icon_#icon#'></div></div>",
		width:42
	},
	_set_inner_size:function(){
		
	}
}, dhx.ui.button);

dhx.protoUI({
	name:"segmented",
	defaults:{
		template:function(obj, common){
			if(!obj.options)
				dhx.assert(false, "segmented: options undefined");
			var options = obj.options;
			var html = '';
			var optionWidth;
			common._check_options(options);
			if(!obj.selected)
				obj.selected = options[0].value;
			for(var i=0; i<options.length; i++){
				optionWidth  = (options[i].width||obj.inputWidth?'width: '+((options[i].width||Math.round(obj.inputWidth/options.length))-common._settings._cssConstant)+'px;':'');
				html+="<div style='"+optionWidth+"' class='"+((obj.selected==options[i].value)?"selected ":"")+"segment_"+((i==options.length-1)?"N":(i>0?1:0))+"' button_id='"+options[i].value+"'>"+options[i].label+"</div>";
			}					
			return "<div class='dhx_el_segmented'>"+html+"</div>";
		},
		_cssConstant:28,
		_outerPadding:0
	},
	_setValue:function(value){
		if(this._dataobj&&this._dataobj.firstChild){
			var options = this._dataobj.firstChild.childNodes;
			for(var i = 0; i < options.length;i++){
				if(dhx.html.locate(options[i],"button_id") == value){
					this.on_click._handle_tab_click.call(this, options[i], this._settings.options[i]);
					return true;
				}
					
			}
		}
	},
	getValue:function(){
		return this._settings.selected;
	},
	_set_inner_size:function(){
	}
}, dhx.ui.button);

dhx.protoUI({
	name:"tabbar",
	defaults:{
		height:49,
		template:function(obj,common) {
			var tabs = obj.options;
			common._check_options(tabs);
			var html = '';
			var optionWidth;
			for(var i = 0; i<tabs.length; i++) {
				var classname = '';
				var src = tabs[i].src;
				if(tabs[i].value==obj.selected) {
					classname=" class='selected'";
					src = tabs[i].srcSelected||tabs[i].src;
				}
				if (tabs[i].css)
					classname+=" "+tabs[i].css;
					
				optionWidth  = (obj.optionWidth ||tabs[i].width||obj.inputWidth?'width: '+(tabs[i].width||Math.ceil(obj.inputWidth/tabs.length)-common._settings._cssConstant)+'px;':'');
				html+="<div"+classname+" button_id='"+tabs[i].value+"' style='"+optionWidth+"'>";
				if (src) html+="<img src='"+src+"'/><span>"+tabs[i].label+"</span>";
				else html+="<div style='height:26px'></div><span>"+tabs[i].label+"</span>";
				html+="</div>";
			}
			return "<div class='dhx_el_tabbar'>"+html+"</div>";
		},
		_cssConstant:4
	},
	_setValue:function(value){
		dhx.ui.segmented.setValue.apply(this, arguments);
	},
	getValue:function(){
		return dhx.ui.segmented.getValue.call(this);
	},
	_set_inner_size:function(){
	}
}, dhx.ui.button);







dhx.protoUI({
	name:"text",
	_allowsClear:true,
	_render_final:function(label, input, config){
		if (config.labelPosition == "left")
			label += input;
		else
			label = input + label;
		return "<div class='dhx_el_"+this.name+"'>"+label+"</div>";
	},
	_render_input: function(config, type, readonly, div) {
		var inputAlign = (config.inputAlign||"left");
		var labelAlign = (config.labelAlign||"left");
		var name = dhx.uid();
		var html =  "<div class='dhx_inp_text_border'>";
		html += 	"<div class='dhx_inp_text_label' style='width: " + this._settings.labelWidth + "px; text-align: " + labelAlign + ";'><label onclick='' for='"+name+"' class='dhx_inp_label_for_text'>" + (config.label||"") + "</label></div>";
		var width = this._settings.inputWidth-this._settings.labelWidth-18;
		if(width<0)
			width = 0;
		if(div)
			html +=	"<div class='dhx_inp_"+type+"' onclick='' style='width: " + width + "px; text-align: " + inputAlign + ";' >"+ (config.text||config.value||"") + "</div>";
		else 
			html +=		"<input id='" + name + "' type='"+(config.type||this.name)+"' value='" + (config.text||config.value||"") + "' "+((readonly||config.readonly)?"readonly='true' ":"")+(config.maxlength?"maxlength='"+config.maxlength+"' ":"")+(config.placeholder?"placeholder='"+config.placeholder+"' ":"")+" class='dhx_inp_"+type+"' style='width: " + width + "px; text-align: " + inputAlign + ";' />";
		html +=		"</div>";
		
		return "<div class='dhx_el_"+this.name+"'>"+html+"</div>";
	},		
	_render_label: function(config, type) {
		if (!config.label) return "";
		var labelAlign = config.labelAlign||"left";
		return "<div class='dhx_inp_" + type + "_label' style='width: " + config.labelWidth + "px; text-align: " + labelAlign + ";'>" + config.label + "</div>";
	},
	defaults:{
		template:function(obj, common){
			return common._render_input(obj, "text");
		},
		labelWidth:80,
		_cssConstant:28,
		_outerPadding:0
	},
	type_setter:function(value){ return value; },
	_set_inner_size:function(){
		if (this._settings.inputWidth)
			this._getBox().style.width = this._settings.inputWidth-this._settings.labelWidth- this._settings._cssConstant +"px";
		else
			this._getBox().style.width = this._content_width - this._settings.labelWidth - this._settings._cssConstant-this._settings._outerPadding + "px";
	},
	focus:function(){
		var input = this._dataobj.getElementsByTagName('input')[0];
		if (input) input.focus();
	},
	_setValue:function(value){
			this.getInput().value = value;
	},
	getValue:function(){
		return this.getInput().value;
	}
}, dhx.ui.button);

dhx.protoUI({
	name:"toggle",
	defaults:{
		template:function(config, common){
			var opts = config.options;
			if(!opts||!opts.length||opts.length<2)
				dhx.assert(false, "toggle: options undefined");
			common._check_options(opts);
			var width = (common._settings.inputWidth/2||"auto");
			var widths = [opts[0].width||width, opts[1].width||width];
			var label_str = common._render_label(config, "toggle");
			
			var tpl = "<input type='button' style='width: " + widths[0] + "px;' value='" + config.options[0].label+ "' />";
			tpl += "<input type='button' style='width: " + widths[1] + "px;' value='" + config.options[1].label + "'  />";
			return common._render_final(label_str, tpl, config);
		},
		label:"",
		labelWidth:0,
		_cssConstant:20
	},
	_set_inner_size:function(){
	},
	_after_render:function(obj){
		this.setValue(obj.value);
	},
	_getInput:function(){
		return this._dataobj.getElementsByTagName("input");
	},
	_setValue:function(value){
		var inps = this._getInput();
		var options = this._settings.options;
		if (value == options[1].value) {
			inps[0].className = "dhx_inp_toggle_left_off";
			inps[1].className = "dhx_inp_toggle_right_on";
		} else {
			inps[0].className = "dhx_inp_toggle_left_on";
			inps[1].className = "dhx_inp_toggle_right_off";
		}
	},
	getValue:function(){
		var inps = this._getInput();
		var options = this._settings.options;
		if (inps[0].className == "dhx_inp_toggle_left_on")
			return options[0].value;
		else
			return options[1].value;
	}
}, dhx.ui.text);

dhx.protoUI({
	name:"input",
	defaults:{
		template:function(obj,common) {
			var html = '<input';
			var attributes = ['maxlength', 'disabled', 'placeholder'];
			for(var i=0; i<attributes.length; i++) {
				if(obj[attributes[i]])
					html += " "+attributes[i]+"='"+obj[attributes[i]]+"'";
			}
            html += " type='"+(obj.type||'text')+"'";
			html += '/>';
			return "<div class='dhx_el_input'>"+html+"</div>";
		},
		_cssConstant:18,
		labelWidth:0
	}
}, dhx.ui.text);


dhx.protoUI({
	name:"select",
	defaults:{
		template:function(obj,common) {
			if(!obj.options)
				dhx.assert(false, "select: options undefined");
			var options = obj.options;
			common._check_options(options);
			var html = '<select';
			if(obj.disabled)
				html+=" disabled='true'";
			html+='>';
			for(var i=0; i<options.length; i++) {
				html+="<option"+((options[i].selected)?" selected='true'":"")+((options[i].value)?" value='"+options[i].value+"'":"")+">"+options[i].label+"</option>";
			}
			html += "</select>";
			return "<div class='dhx_el_select'>"+html+"</div>";
		},
		labelWidth:0,
		_outerPadding:0,
		_cssConstant:0
	},
	getInput:function(){
		return this._dataobj.firstChild.firstChild;
	}	
}, dhx.ui.text);

dhx.protoUI({
	name:"textarea",
	defaults:{
		template:function(config){ 
				return "<div class='dhx_el_textarea'><textarea class='dhx_inp_textarea' placeholder='"+(config.label||"")+"' style=''>"+(config.value||"")+"</textarea></div>";
		},
		cssContant:28
	},
	_set_inner_size:function(){
		if (this._settings.inputWidth)
			this._getBox().style.width = this._settings.inputWidth- this._settings.cssContant+"px";
		else
			this._getBox().style.width = this._content_width- this._settings._outerPadding - this._settings.cssContant + "px";
		if (this._settings.inputHeight)
			this._getBox().style.height = this._settings.inputHeight+"px";
		else
			this._getBox().style.height = (this._content_height - 9) + "px";
	},
	getInput:function(){
		return this._dataobj.firstChild.firstChild;
	},
	_setValue:function(value){
		this.getInput().value = value;
	},
	getValue:function(){
		return  this.getInput().value;
	}
}, dhx.ui.text);

dhx.protoUI({
	name:"counter",
	defaults:{
		template:function(config, common){
			var value = (config.value||0);
			
			var label_str = common._render_label(config, "counter");
			var html =  "<input type='button' class='dhx_inp_counter_prev' value='▬' />";
				html += "<div class='dhx_inp_counter_value' >" + value + "</div>";
				html += "<input type='button' class='dhx_inp_counter_next' value='+' />";
			return common._render_final(label_str, html, config);
		},
		min:1, 
		step:1,
		labelWidth:0,
		label:"",
		_cssConstant:145
	},
	_getBox: function(){
		return this.getInput().parentNode;
	},
	getLabel: function(){
		return this.getInput().previousSibling||this.getInput().parentNode.lastChild;
	},
	_set_inner_size:function(){ 
		if (this._settings.label && !this._settings.labelWidth){
			var label = this.getLabel();
			if (label)
				label.style.width = (this._settings.inputWidth||this._content_width) - this._settings._cssConstant +"px";
		}
	},
	_setValue:function(value){
		this.getInput().nextSibling.innerHTML = value;
	},
	getValue:function(obj){
		return (this._settings.value||0)*1;
	},
	
	next:function(step, min, max){
		step = (step||1);
		this._step(step, min, max);
	},
	prev:function(step, min, max){
		step = (-1)*(step||1);
		this._step(step, min, max);
	},
	_step:function(step, min, max) {
		min = (typeof(min) == "undefined") ? -Infinity : min;
		max = (typeof(max) == "undefined") ? Infinity : max;
		var new_value = this.getValue() + step;
		if (new_value >= min && new_value <= max)
			this.setValue(new_value);
	}
}, dhx.ui.text);


dhx.protoUI({
	name:"checkbox",
	defaults:{
		template:function(config, common) {
			var chClassName = (config.value) ? 'dhx_inp_checkbox_on' : 'dhx_inp_checkbox_on hidden';
			var ch = "<div class='dhx_inp_checkbox_border'><input type='button' class='" + chClassName + "' value='' /></div>";
			var label = common._render_label(config, "checkbox");
			return common._render_final(label,ch,config);
		}
	},
	_setValue:function(value){
		var inp = this.getInput();
		if (value)
			inp.className = "dhx_inp_checkbox_on";
		else
			inp.className = "dhx_inp_checkbox_on hidden";
	},
	toggle:function(){
		this.setValue(!this.getValue());
	},
	getLabel:function(){
		var parent = this.getInput().parentNode;
		return parent.nextSibling||parent.previousSibling;
	},
	getValue:function(){
		return  this._settings.value?1:0;
	},
	_getBox: function(){
		return this.getInput().parentNode.parentNode;
	}
}, dhx.ui.counter);

dhx.protoUI({
	name:"radio",
	defaults:{
		template: function(config,common) {
			if(!config.options)
				dhx.assert(false, "radio: options undefined");
			common._check_options(config.options);
			var html = [];
			for (var i=0; i < config.options.length; i++) {
				if  (config.options[i].newline)
					html.push("<div style='clear:both;'></div>");
				var input = "<div radio_id='"+config.options[i].value+"' class='dhx_inp_radio_border'><input type='button' class='" + (config.options[i].value == config.value ? 'dhx_inp_radio_on' : 'dhx_inp_radio_on hidden') + "' value='' /></div>";
				config.label = config.options[i].label;
				var label = common._render_label(config, "radio");
				if (config.labelPosition == "left")
					html.push(label + input);
				else
					html.push(input + label);
			}
			return "<div class='dhx_el_radio'><div>"+html.join("</div><div>")+"</div></div>";
		}
	},
	_get_desired_size:function(){
		var size = dhx.ui.button.prototype._get_desired_size.call(this);
		if (this._settings.options){
			var count = 1;
			for (var i=0; i < this._settings.options.length; i++)
				if (this._settings.options[i].newline)
					count++;
			size[3] = Math.max(size[3], this.defaults.height * count);
		}
		return size;
	},
	_getInput: function(){
		return this._dataobj.getElementsByTagName('input');
	},
	_setValue:function(value){
		var inp = this._getInput();
		
		for (var i=0; i < inp.length; i++){
			if (inp[i].parentNode.getAttribute("radio_id")==value)
				inp[i].className = "dhx_inp_radio_on";	
			else
				inp[i].className = "dhx_inp_radio_on hidden";
		}
	},
	getValue:function(obj){
		return this._settings.value;
	}
}, dhx.ui.text);

dhx.protoUI({
	name:"richselect",
	defaults:{
		template:function(obj,common){
			return common._render_input(obj, "list", true,true);
		}
	},
	_init_once:function(obj){
		if (!obj.popup)
			this._create_popup("list", obj);
		this._set_on_popup_click();
		this._init_once = function(){};
	},
	options_setter:function(value){
		var data = this._settings.data = [];
		for (var i=0; i < value.length; i++){
			var id = (value[i].value||value[i].label||value[i]);
			var title = (value[i].label||value[i].value||value[i]);
			data.push({id:id, value:title});
		}
		return value;
	},
	_after_render:function(obj){
		
		this._init_once(obj);
				
		if (dhx.isNotDefined(obj.value)) return;
		this.setValue(obj.value,{},obj);
		var popup = dhx.ui.get(obj.popup.toString());
		var list = popup._body_cell;
		var self = this;
		list.attachEvent("onXLE",dhx.bind(function(){
			this.setValue(this._settings.value,{},obj);
		}, this));
	},
	_create_popup:function(type, obj){
		var copy = dhx.extend({}, obj);
		//delete copy.type;// delete copy.name; delete copy.label;
		delete copy.align;
		delete copy.height; 
		delete copy.width;
		delete copy.template;
		
		copy.view = type;
		copy.id = (obj.id||obj.name)+"_"+type;
		copy.width = (copy['popupWidth']||290);
		
			
		var id = dhx.uid();
		var config = {
			id:id,
			view:"popup", 
			body:copy
		};
		
		dhx.ui(config).hide();
		obj.popup=id;
		this._set_on_popup_click();
	},
	_set_on_popup_click:function(){
		var popup = dhx.ui.get(this._settings.popup);
		popup._body_cell.attachEvent("onItemClick", function(item){
			var master = dhx.ui.get(this.getParent()._settings.master);
			this.getParent().hide();
			master.setValue(item);
		});
	},
	getInput: function(){
		return this._dataobj.firstChild.childNodes[0].childNodes[1];
	},
	_setValue:function(value){
		var popup = dhx.ui.get(this._settings.popup)._body_cell;
		var text = (popup.type?popup.type.template(popup.item(value)||value,popup.type):value);
		this._settings.value = value;
		this._settings.text = text;
		if(this.name == "combo")
			this.getInput().value = text.replace(/<[^>]*>/g,"");
		else
		    this.getInput().innerHTML = text;
	},
	getValue:function(){
		return this._settings.value;
	}
}, dhx.ui.text);

dhx.protoUI({
	name:"combo",
	defaults:{
		template:function(config, common){ 
			return common._render_input(config, "combo");
		}
	},
	_init_once:function(obj){
		if (!obj.popup)
			this._create_popup("list", obj);
		this._set_on_popup_click();
		
		dhx.event(this._dataobj,"keydown",function(e){
			e = (e||event);
			var trg = e.target||e.srcElement;
			
			var popup = dhx.ui.get(obj.popup);
			window.clearTimeout(popup.key_timer);
			popup.key_timer = window.setTimeout(function(){
				popup._body_cell.filter(function(item){
    				if (item.value.toString().toLowerCase().indexOf(trg.value.toLowerCase())===0) return true;
   					return false;
				});
				var master = dhx.ui.get(popup._settings.master);
				if(popup._body_cell.dataCount()==1&&popup._body_cell.type.template(popup._body_cell.item(popup._body_cell.first())) == trg.value)
					master._settings.value = popup._body_cell.first();
				else 
					master._settings.value = "";
			},200);
			popup.show(trg,(popup._body_cell._settings.align||"bottom"),true);
		},this);

		this._init_once = function(){};
	},
	_after_render:function(obj){
		this._init_once(obj);
		if (!dhx.isNotDefined(obj.value))
			this.setValue(obj.value);
	}
}, dhx.ui.richselect);



dhx.protoUI({
	name:"datepicker",
	defaults:{
		template:function(obj, common){
			return common._render_input(obj, "list", true,true);
		}
	},
	_init_once:function(obj){ 
		if (!obj.popup)
			this._create_popup("calendar", obj);
			
		var popup =  dhx.ui.get(obj.popup);
		popup._body_cell.attachEvent("onDateSelect", function(date){
			var master = dhx.ui.get(this.getParent()._settings.master);
			this.getParent().hide();
			master.setValue(date);
		});
		
		this._init_once = function(){};	
	},
	_after_render:function(obj){
		this._init_once(obj);
		if (!dhx.isNotDefined(obj.value))
			this.setValue(obj.value);
	},
	_setValue:function(value){
		var popup =  dhx.ui.get(this._settings.popup.toString());
		var calendar = popup._body_cell;
		
		calendar.selectDate(value);
		this._settings.value = (value)?calendar.config.date:"";
		
		this.getInput().innerHTML = (value)?((this._settings.dateFormatStr||dhx.i18n.dateFormatStr)(this._settings.value)):"";
	},
	dateFormat_setter:function(value){
		this._settings.dateFormatStr = dhx.Date.dateToStr(value);
		return dhx.Date.strToDate(value);
	},
	getValue:function(){
		return this._settings.value||null;
	}
}, dhx.ui.richselect);




/* DHX DEPEND FROM FILE 'ui/toolbar.js'*/


/*DHX:Depend ui/inputs.js*/
/*DHX:Depend libs/validation.js*/
/*DHX:Depend ui/component.js*/
/*DHX:Depend ui/toolbar.css*/
/*DHX:Depend core/values.js*/
/*DHX:Depend ui/inputs.css*/

dhx.protoUI({
	name:"toolbar",
	defaults:{
		type:"MainBar"
	},
	_render_borders:true,
	_default_height:44,
	_init:function(config){ 
		this._contentobj.style.border="1px solid #AEAEAE";
		this._parse_inputs(config);
	},
	_parse_inputs:function(config){
		this._contentobj.className+=" dhx_toolbar";
		if (config.elements){
			this._collection = config.elements;
			this._vertical_orientation = false;
		}
		delete config.elements;
		
		dhx._parent_collection = this;
	},
	_get_desired_size:function(){ 
		var sizes = dhx.ui.baselayout.prototype._get_desired_size.call(this);
		if(sizes[3]>0 && (!this._vertical_orientation || !this._settings.scroll))
			this._settings.height = sizes[3];
		if(sizes[1]>0 && (this._vertical_orientation || !this._settings.scroll))
			this._settings.width = sizes[1];
		/*if (sizes[0]||sizes[2])
			this._settings.gravity = Math.max(sizes[0],sizes[2]);*/
		
		sizes = dhx.ui.view.prototype._get_desired_size.call(this); 
		
		if (dhx.debug_size)
			dhx.log("[get][toolbar] "+this.name+"@"+this._settings.id+" "+[sizes].join(","));
			
		if (sizes[3]<=0 && this._default_height>0){ sizes[3]=this._default_height; sizes[2]=0; }
			
		return sizes;
	},
	_set_size:function(x,y){ 
		if (dhx.debug_size)
			dhx.log("[set][toolbar] "+this.name+"@"+this._settings.id+" "+[x,y].join(","));
		dhx.ui.view.prototype._set_size.apply(this, arguments);
		dhx.ui.baselayout.prototype._set_size.call(this, this._content_width,this._content_height);
	},
	render:function(){
		if (this.isVisible(this._settings.id))
			if(this._timeout_data){
				this.setValues(this._timeout_data);
				this._timeout_data = null;
			}
	},
	refresh:function(){
		this.render();
	},
	type_setter:function(value){
		this._contentobj.className+=" dhx_"+value.toLowerCase();
	}
}, dhx.Scrollable, dhx.AtomDataLoader, dhx.Values, dhx.ui.baselayout, dhx.EventSystem, dhx.ValidateData);




/* DHX DEPEND FROM FILE 'ui/form.js'*/


/*DHX:Depend ui/inputs.js*/
/*DHX:Depend ui/inputs.css*/
/*DHX:Depend ui/form.css*/
/*DHX:Depend ui/toolbar.js*/

dhx.protoUI({
	name:"form",
	defaults:{
		scroll:true
	},
	_default_height:-1,
	_parse_inputs:function(config){
		this._contentobj.className+=" dhx_form";
		if (config.elements){
			this._collection = config.elements;
			this._vertical_orientation = true;
		}
		delete config.elements;
		
		dhx._parent_collection = this;
	},
	type_setter:function(){}
}, dhx.ui.toolbar);



/* DHX DEPEND FROM FILE 'ui/multiview.js'*/


/*DHX:Depend ui/view.js*/

dhx.protoUI({
	name:"multiview",
	defaults:{
		animate:{
		}
	},
	_init:function(){
		this._active_cell = 0;
		this._vertical_orientation = 1;
		this._viewobj.style.position = "relative";
		this._viewobj.className += " dhx_multiview";
		this._back_queue = [];
	},
	_ask_render:function(cell_id, view_id){
		var cell = dhx.ui.get(cell_id);
		if (!cell._render_hash){
			cell._render_queue = [];
			cell._render_hash = {};			
		}
		if (!cell._render_hash[view_id]){
			cell._render_hash[view_id]=true;
			cell._render_queue.push(view_id);
		}
	},
	_render_activation:function(cell_id){ 
		var cell = dhx.ui.get(cell_id);
		/*back array*/
		if(this._back_queue[this._back_queue.length-2]!=cell_id){
			if(this._back_queue.length==10)
				this._back_queue.splice(0,1);
			this._back_queue.push(cell_id);
		}
		else 
			this._back_queue.splice(this._back_queue.length-1,1);	
		
		if (cell._render_hash){
			for (var i=0; i < cell._render_queue.length; i++)
				dhx.ui.get(cell._render_queue[i]).render();
				
			cell._render_queue = [];
			cell._render_hash = {};			
		}
	},
	_parse_cells:function(collection){
		collection = collection || this._collection; 
		
		for (var i=0; i < collection.length; i++)
			collection[i]._inner = this._settings._inner||{top:1, bottom:1, left:1, right:1};
			
		dhx.ui.baselayout.prototype._parse_cells.call(this, collection);
		
		for (var i=1; i < this._cells.length; i++)
			dhx.html.remove(this._cells[i]._viewobj);
			
		for (var i=0; i<collection.length; i++){
			var cell = this._cells[i];
			if (cell._cells && !cell._render_borders) continue; 
			
			var _inner = cell._settings._inner;
			if (_inner.top) 
				cell._viewobj.style.borderTopWidth="0px";
			if (_inner.left) 
				cell._viewobj.style.borderLeftWidth="0px";
			if (_inner.right) 
				cell._viewobj.style.borderRightWidth="0px";
			if (_inner.bottom) 
				cell._viewobj.style.borderBottomWidth="0px";
		}
		this._render_activation(this.getActive());
	},
	cells_setter:function(value){
		dhx.assert(value && value.length,"Multiview must have at least one view in 'cells'");
		this._collection = value;
	},
	_getDirection:function(next, active){
		return 	 next < active ? "right":"left";
	},
	_show:function(obj, animation_options){
		 if (this._in_animation)
			return dhx.delay(this._show, this,[obj],100);
			
		var _next_cell = -1;
		for (var i=0; i < this._cells.length; i++)
			if (this._cells[i]==obj){
				_next_cell = i;
				break;
			}
		if (_next_cell < 0 || _next_cell == this._active_cell)
			return;
     
		//need to be moved in animate
		if((animation_options||typeof animation_options=="undefined")&&dhx.animate.isSupported() && this._settings.animate) {
			var aniset = dhx.extend({}, this._settings.animate);
        	aniset.direction = this._getDirection(_next_cell,this._active_cell);
        	aniset = dhx.Settings._mergeSettings(animation_options||{}, aniset);
		
			var line = dhx.animate.formLine(
				this._cells[_next_cell]._viewobj,
                this._cells[this._active_cell]._viewobj,
				aniset);
			this._cells[_next_cell]._get_desired_size();
			this._cells[_next_cell]._set_size(this._content_width,this._content_height);
			
			aniset.callback = function(){
				dhx.animate.breakLine(line);
				this._in_animation = false;
				aniset.master = aniset.callback = null;
			};
			aniset.master = this;
			
			this._active_cell = _next_cell;
			this._render_activation(this.getActive());
			
			dhx.animate(line, aniset);
			this._in_animation = true;
		}
		else { // browsers which don't support transform and transition
			dhx.html.remove(this._cells[this._active_cell]._viewobj);		
			
			this._active_cell = _next_cell;
			
			this._cells[this._active_cell]._get_desired_size();
			this._cells[this._active_cell]._set_size(this._content_width,this._content_height);
			this._render_activation(this.getActive());
			
			this._viewobj.appendChild(this._cells[i]._viewobj);
			
		}
	},
	_get_desired_size:function(){
		var size = this._cells[this._active_cell]._get_desired_size();
		
		if (this._settings.height > -1){
			size[3] = this._settings.height;
			size[2] = 0;
		}
		if (this._settings.width > -1){
			size[1] = this._settings.width;
			size[0] = 0;
		}
		if (size[0]) size[1] = 0;
		if (size[2]) size[3] = 0;
		
		return size;
	},
	_set_size:function(x,y){
		dhx.ui.baseview.prototype._set_size.call(this,x,y);
		this._cells[this._active_cell]._set_size(x,y);
	},
	isVisible:function(base_id, cell_id){
		if (cell_id && cell_id != this.getActive()){
			if (base_id)
				this._ask_render(cell_id, base_id);
			return false;
		}
		return dhx.ui.view.prototype.isVisible.call(this, base_id, this._settings.id);
	},
	getActive:function(){
		return this._cells.length?this._cells[this._active_cell]._settings.id:null;
	},
	back:function(step){
		step=step||1;
		if(this._back_queue.length>step){
			var viewId = this._back_queue[this._back_queue.length-step-1];
			dhx.ui.get(viewId).show();
			return viewId;
		}
		return null;
	}
},dhx.ui.baselayout);



/* DHX DEPEND FROM FILE 'core/treestore.js'*/


/*DHX:Depend core/datastore.js*/

dhx.TreeStore = {
	_init:function() {
		this.branch = { 0:[] };
	},
	clearAll:function(){
		this.branch = { 0:[] };
		dhx.DataStore.prototype.clearAll.call(this);	
	},
	prevSibling:function(id){
		var order = this.branch[this.item(id).$parent];
		var pos = dhx.PowerArray.find.call(order, id)-1;
		if (pos>=0)
			return order[pos];
		return null;
	},
	nextSibling:function(id){
		var order = this.branch[this.item(id).$parent];
		var pos = dhx.PowerArray.find.call(order, id)+1;
		if (pos<order.length)
			return order[pos];
		return null;
	},
	parent:function(id){
		return this.item(id).$parent;
	},
	firstChild:function(id){
		var order = this.branch[id];
		if (order && order.length)
			return order[0];
		return null;
	},
	hasChild:function(parent, child){
		var t = this.branch[parent];
		if (t && t.length){
			for (var i=0; i < t.length; i++) {
				if (t[i] == child) return true;
				if (this.hasChild(t[i], child)) return true;
			}
		}
		return false;
	},
	branchIndex:function(parent, child){
		var t = this.branch[parent];
		return dhx.PowerArray.find.call(t, child);
	},
    extraParser:function(data, parent, level){
    	data.$parent = parent||0;
		data.$level = level||1;

		if (!this.branch[data.$parent])
			this.branch[data.$parent] = [];

		this.branch[data.$parent].push(data.id);
		//update is not working for now FIXME
		
    	if (!data.item)
    		return data.$count = 0;
    	
		if (!(data.item instanceof Array)){
			data.item=[data.item];
			data.$count = 1;
		} else 
			data.$count = data.item.length;

		for (var i=0; i < data.item.length; i++) {
			var item = data.item[i];
			this.pull[this.id(item)]=item;
			this.extraParser(item, data.id, data.$level+1);
		}
		delete data.item;
	}, 
	provideApi:function(target,eventable){
		var list = ["prevSibling","nextSibling","parent","firstChild","hasChild","branchIndex"];
		for (var i=0; i < list.length; i++)
			target[list[i]]=dhx.methodPush(this,list[i]);
			
		dhx.DataStore.prototype.provideApi.call(this, target, eventable);
	},
	getTopRange:function(){
		return dhx.toArray([].concat(this.branch[0])).map(function(id){
			return this.item(id);
		}, this);
	},
	eachChild:function(id, functor){
		if (this.branch[id])
			return 	dhx.PowerArray.each.call(this.branch[id], functor);
	},
	add:function(obj, index, parent){
		this.branch[parent||0] = this.order = dhx.toArray(this.branch[parent||0]);
		
		parent = this.item(parent||0);
		if(parent)
			parent.$count++;	
		obj.$count = 0; 
		obj.$level= (parent?parent.$level+1:1); 
		obj.$parent = (parent?parent.id:0); 
		return dhx.DataStore.prototype.add.call(this, obj, index);
	},
	remove:function(id){
		var obj = this.item(id);
		var parentId = (obj.$parent||0);
		this.branch[parentId] = this.order = dhx.toArray(this.branch[parentId]);
		if(parentId)
			this.item(parentId).$count--;	
		return dhx.DataStore.prototype.remove.call(this, id);
	},
	/*
		serializes data to a json object
	*/
	serialize: function(id){
		var ids = this.branch[id||0];
		var result = [];
		for(var i=0; i< ids.length;i++){
			var obj = this.pull[ids[i]];
			result.push(obj);
			if (obj.$count)
				obj.item = this.serialize(ids[i]); 
		}
		return result;
	}
};


/* DHX DEPEND FROM FILE 'ui/list.js'*/


/*DHX:Depend ui/list.css*/ 	

/*DHX:Depend ui/component.js*/
/*DHX:Depend core/mouse.js*/ 	
/*DHX:Depend core/selection.js*/ 
/*DHX:Depend core/treestore.js*/
/*DHX:Depend libs/animate.js*/
/*DHX:Depend libs/crspanel.js*/ 	

dhx.protoUI({
	name:"list",
	_init:function(){ 
		this.data.provideApi(this,true);
	},
	defaults:{
		select:false, 
		scroll:true
	},
	_id:"dhx_l_id",
	on_click:{
		dhx_list_item:function(e,id){ 
			if (this._settings.select){
                this._no_animation = true;
				if (this._settings.select=="multiselect")
					this.select(id, e.ctrlKey, e.shiftKey); 	//multiselection
				else
					this.select(id);
                this._no_animation = false;
			}
		}
	},
	_get_desired_size:function(){
		if (this.type.width!="auto")
			this._settings.width = this.type.width + (this.type.padding + this.type.margin)*2;// + this.type.border;
		if (this._settings.yCount)
			this._settings.height = (this.type.height+ (this.type.padding + this.type.margin)*2+1)*(this._settings.yCount == "auto"?this.dataCount():this._settings.yCount);
		return dhx.ui.view.prototype._get_desired_size.call(this);
	},
	_set_size:function(){
        dhx.ui.view.prototype._set_size.apply(this, arguments);
	},
	type:{
		css:"",
		widthSize:function(obj, common){
			return common.width+(common.width>-1?"px":"");
		},
		heightSize:function(obj, common){
			return common.height+(common.height>-1?"px":"");
		},
		template:dhx.Template("#value#"),
		width:"auto",
		height:22,
		margin:0,
		padding:10,
		border:1,
		templateStart:dhx.Template("<div dhx_l_id='#id#' class='dhx_list_item dhx_list_{common.css}_item{obj.$selected?_selected:}' style='width:{common.widthSize()}; height:{common.heightSize()}; padding:{common.padding}px; margin:{common.margin}px; overflow:hidden;'>"),
		templateEnd:dhx.Template("</div>")
	}
}, dhx.MouseEvents, dhx.SelectionModel, dhx.Scrollable, dhx.ui.proto);


dhx.protoUI({
	name:"grouplist",
	defaults:{
		animate:{
		}
	},
	_init:function(){
		dhx.extend(this.data, dhx.TreeStore, true);
		this.data.provideApi(this,true);
		this.data.attachEvent("onClearAll", dhx.bind(this._onClear, this));
		this._viewobj.className += " dhx_grouplist";
		this._onClear();
	},
	_onClear:function(){
		this._nested_cursor = [];
		this._nested_chain = [];
	},
	on_click:{
		dhx_list_item:function(e,id){
            if (this._in_animation) {
                return false;
            }
			for (var i=0; i < this._nested_chain.length; i++){
				if (this._nested_chain[i] == id){ //one level up
					for (var j=i; j < this._nested_chain.length; j++) {
						this.data.item(this._nested_chain[j]).$template="";
					}
					if (!i){ //top level
						this._nested_cursor = this.data.branch[0];
						this._nested_chain = [];
					} else {
						this._nested_cursor= this.data.branch[this._nested_chain[i-1]];
						this._nested_chain.splice(i);
					}
                    this._is_level_down = false;
					return this.render();
				}
			}
			var obj = this.item(id);
			if (obj.$count){	//one level down
                this._is_level_down = true;
				this._nested_chain.push(id);
				obj.$template = "Back";
				this._nested_cursor = this.data.branch[obj.id];
				return this.render();
			} else {
				if (this._settings.select){
                    this._no_animation = true;
					if (this._settings.select=="multiselect")
						this.select(id, e.ctrlKey, e.shiftKey); 	//multiselection
					else
						this.select(id);
                    this._no_animation = false;
				}		
			}
		}
	},
	render:function(id,data,type,after){
		if (this._in_animation) {
            return dhx.delay(this.render, this, arguments, 100);
        }        
        for (var i=0; i < this._nested_cursor.length; i++)
        	this.data.item(this._nested_cursor[i]).$template = "";
        
		if (this._nested_chain.length)
			this.data.order = dhx.toArray([].concat(this._nested_chain).concat(this._nested_cursor));
		else
			this.data.order = dhx.toArray([].concat(this.data.branch[0]));
			
        if (this.callEvent("onBeforeRender",[this.data])){
            if(this._no_animation || !this._dataobj.innerHTML || !(dhx.animate.isSupported() && this._settings.animate) || (this._prev_nested_chain_length == this._nested_chain.length)) { // if dataobj is empty or animation is not supported
				dhx.RenderStack.render.apply(this, arguments);
            }
            else {
                //getRange - returns all elements
                var next_div = this._dataobj.cloneNode(false);
                next_div.innerHTML = this.data.getRange().map(this._toHTML,this).join("");
                
                var aniset = dhx.extend({}, this._settings.animate);
                aniset.direction = (this._is_level_down)?'left':'right';

                var line = dhx.animate.formLine(
                    next_div,
                    this._dataobj,
                    aniset
                );
                aniset.master = this;
                aniset.callback = function(){
                    this._dataobj = next_div;
                    dhx.animate.breakLine(line);
                    aniset.master = aniset.callback = null;
                    this._htmlmap = null; //clear map, it will be filled at first _locateHTML
                    this._in_animation = false;
                    this.callEvent("onAfterRender",[]); 
                };
                this._in_animation = true;
                dhx.animate(line, aniset);
            }
            this._prev_nested_chain_length = this._nested_chain.length;
        }
	},
	templateBack_setter:function(config){
		this.type.templateBack = dhx.Template(config);
	},
	templateItem_setter:function(config){
		this.type.templateItem = dhx.Template(config);
	},
	templateGroup_setter:function(config){
		this.type.templateGroup = dhx.Template(config);
	},
	type:{
		template:function(obj, common){
			if (obj.$count)
				return common.templateGroup(obj, common);
			return common.templateItem(obj, common);
		},
		css:"group",
		templateStart:dhx.Template("<div dhx_l_id='#id#' class='dhx_list_item dhx_list{obj.$count?_group:_item}{obj.$template?_back:}{obj.$selected?_selected:}' style='width:{common.width}px; height:{common.height}px; padding:{common.padding}px; margin:{common.margin}px; overflow:hidden;'>"),
		templateBack:dhx.Template("&lt; #value#"),
		templateItem:dhx.Template("#value#"),
		templateGroup:dhx.Template("#value#"),
        templateEnd:function(obj, common){
            var html = '';
            if(obj.$count) html += "<div class='dhx_arrow_icon'></div>";
            html += "</div>";
            return html;
        }
	},
	showItem:function(id){
		var obj, parent;
		if(id){
			obj = this.item(id);
			parent = obj.$parent;
			
			if (obj.$count)
				parent = obj.id;
		}
		
	/*	for (var i=0; i < this._nested_chain.length; i++){
			if (this._nested_chain[i] == id){
				for (var j=i; j < this._nested_chain.length; j++) {
					this.data.item(this._nested_chain[j]).$template="";
				}
			}
		}*/
		this._nested_cursor = this.data.branch[parent||0];
		this._nested_chain=[];
				
		//build _nested_chain
		while(parent){
			this.item(parent).$template = "Back";
			this._nested_chain.unshift(parent);
			parent = this.item(parent).$parent;
		} 
		
		//render
		this._no_animation = true;
		this.render();
		this._no_animation = false;
		
		//scroll if necessary
		dhx.RenderStack.showItem.call(this,id);
	}
}, dhx.ui.list);
dhx.Type(dhx.ui.grouplist,{});

dhx.protoUI({
	name:"pagelist",
    defaults:{
		scroll:"x",
		panel:false,
		scrollOffset:0
	},
	_handleScrollSize:true,
	_init:function(config){
		this._viewobj.className += " dhx_pagelist";
		
		config.scroll = (config.scroll=="y"?"y":"x");
		this.type.layout = config.scroll;
		
		this.attachEvent("onAfterRender",this._setListSize);
		this._after_init.push(this._after_init_call);
		this._active_cell = 0;
	},
	_after_init_call:function(){
		if(this._settings.scroll=="x"){
			this._dataobj.style.height = "100%";	
		}
		this.type.layout = this._settings.scroll;
		this.attachEvent("onAfterScroll",this._correctDelta);
	},
	_setListSize:function(){
		if(this._settings.scroll=="x"){
			this._dataobj.style.width = (this.type.width + (this.type.padding + this.type.margin)*2+this.type.border)*this.dataCount()+"px";
		}
		if(this._settings.panel)
			this._renderPanel();
	},
	panel_setter:function(config){
		if(config){
			this._viewobj.className += " hidden_scroll";
			if (config === true) config = {};
			this._mergeSettings(config,{
				size: 16,
				itemSize: 16,
				align:"bottom"
			});
		}
		return config;
	},
	_setItemActive:function(id){
		var i = this.indexById(id);
		if(typeof i != "undefined" &&this._settings.panel){
			this._active_cell = i;
			this._renderPanelItems();
		}	
	},
	getActive:function(){
		return this._active_cell?this.data.order[this._active_cell]:this.first();
	},
	_correctDelta:function(matrix){
		
		var size =  (this._settings.scroll=="y"?this.type.height:this.type.width)+(this.type.padding + this.type.margin)*2+this.type.border;
		var limit = (this._settings.scroll=="y"?this._dataobj.scrollHeight-this._content_height:this._dataobj.scrollWidth-this._content_width);
		
		var correction;
		if (this._settings.scroll == "y") {
			correction = Math.round(matrix.f/size);
			matrix.f = correction*size;
			matrix.f = this._correctScrollOffset(matrix.f,limit);
		} else{ 
			correction = Math.round(matrix.e/size);
			matrix.e = correction*size;
			matrix.e = this._correctScrollOffset(matrix.e,limit);
		}
		
		this._active_cell = -correction;
		if(this._settings.panel)
			this._renderPanelItems();
			
		return true;
	},
	_correctScrollOffset:function(position,limit){
		var offset = this._settings.scrollOffset;
		if(offset&&Math.abs(position)>offset)
				position += (position>0?-offset:(1-offset));
		if(Math.abs(position)>limit)
				position = -limit;
		return position;
	},
	_get_desired_size:function(){
		if(this._settings.scroll=="y"){
			if (this.type.width!="auto")
				this._settings.width = this.type.width + (this.type.padding + this.type.margin)*2 +this.type.border;
			if (this._settings.yCount)
				this._settings.height = (this.type.height+ (this.type.padding + this.type.margin)*2 +this.type.border)*(this._settings.yCount == "auto"?this.dataCount():this._settings.yCount);
		}
		else{
			if (this.type.height!="auto")
				this._settings.height = this.type.height + (this.type.padding + this.type.margin)*2 +this.type.border;
		}
		return dhx.ui.view.prototype._get_desired_size.call(this);
	},
	_set_size:function(x,y){ 
		if (dhx.ui.view.prototype._set_size.apply(this, arguments)){
			if (this.type.fullScreen){
				this.type.width = this._content_width;
	        	this.type.height = this._content_height;
	        	this.type.padding = 0;
	        	this.render();
        	}
        	if(this._settings.panel)
				this._renderPanel();
		}
	},
	type:{
		templateStart:function(obj,type){
			var className = "dhx_list_item dhx_list_"+(type.css)+"_item"+(obj.$selected?"_selected":"");
			var style = "width:"+type.width+"px; height:"+type.height+"px; padding:"+type.padding+"px; margin:"+type.margin+"px; overflow:hidden;"+(type.layout&&type.layout=="x"?"float:left;":"");
			return "<div dhx_l_id='"+obj.id+"' class='"+className+"' style='"+style+"'>";
		}			
	}
}, dhx.ui.list, dhx.CarouselPanel);



/* DHX DEPEND FROM FILE 'ui/accordion.js'*/


/*DHX:Depend ui/accordion.css*/

/*DHX:Depend ui/view.js*/
/*DHX:Depend core/movable.js*/
/*DHX:Depend libs/animate.js*/
/*DHX:Depend core/mouse.js*/

dhx.protoUI({
	name:"accordionitem",
	_init:function(config){
		this._viewobj.innerHTML = "<div dhx_ai_id='"+config.id+"'  class='dhx_accordionitem_header'><div class='dhx_accordionitem_button' ></div><div class='dhx_accordionitem_label' ></div></div><div class='dhx_accordionitem_body'></div>";
		
		this._contentobj = this._viewobj;
		this._headobj = this._contentobj.childNodes[0];
		if(!config.header)
			this._headobj.style.display = "none";
		this._headlabel = this._contentobj.childNodes[0].childNodes[1];
		this._headbutton = this._contentobj.childNodes[0].childNodes[0];
		this._bodyobj = this._contentobj.childNodes[1];
		this._viewobj.className +=" dhx_accordionitem";
		this._head_cell = this._body_cell = null;
		
		this._cells = true;
		this._settings._inner = config._inner||{top:1, bottom:1, left:1, right:1};
		this._after_init.push(this._border_applying);
	},
	_border_applying:function(){
		var _inner = this._settings._inner;
        if (_inner){
        	this._border_helper(_inner.top, "borderTopWidth");
        	this._border_helper(_inner.left, "borderLeftWidth");
        	this._border_helper(_inner.right, "borderRightWidth");
        	this._border_helper(_inner.bottom, "borderBottomWidth");
    	}
		this._original_width = this._settings.width;
		this._original_height = this._settings.height;
	},
	_border_helper:function(top, borderTopWidth){
		if (!top) return;
		
		this._headobj.style[borderTopWidth]="0px";
        if (!this._body_cell._cells)
			this._body_cell._viewobj.style[borderTopWidth]="0px";
	},
	_id:"dhx_ai_id",
	body_setter:function(value){
		if (typeof value != "object")
			value = {template:value };
		value._inner = dhx.copy(this._settings._inner);
		this._body_cell = dhx.ui._view(value);
		this._body_cell._parent_cell = this;
		this._bodyobj.appendChild(this._body_cell._viewobj);
		return value;
	},
	header_setter:function(value){
		if(value)
			value = dhx.Template(value);
		return value;
	},
	headerAlt_setter:function(value){
		if(value)
			value = dhx.Template(value);
		return value;
	},
	_get_desired_size:function(){
		var size =  this._body_cell._get_desired_size();
		var header = 0;
		
		if(this.getParent()._vertical_orientation){
			if (this._settings.collapsed){
				size[3] = this._getHeaderSize();
				size[2] = 0;
			} else 
				header = this._settings.headerHeight;
		} else {
			if (this._settings.collapsed){
				size[1] = this._getHeaderSize();
				size[0] = 0;
			}
			else 
				header = this._settings.headerHeight;
		} 
		
		this._settings.width = size[1]||this._original_width;
		this._settings.height = size[3]?(size[3]+header):this._original_height;
		if (size[0] || size[2]) this._settings.gravity = Math.max(size[0],size[2]);
		
		return dhx.ui.baseview.prototype._get_desired_size.call(this);
	},
	on_click:{
		dhx_accordionitem_header:function(e, id){
			this._toggle(e);
		},
		dhx_accordionitem_header_v:function(e, id){
			this._toggle(e);
		}
	},
	_toggle:function(e){
		this.define("collapsed", !this._settings.collapsed);
		dhx.callEvent("onClick", [this._settings.id]);
		return dhx.html.preventEvent(e);
	},
	collapsed_setter:function(value){  
		if (this._settings.header === false) return;
		//use last layout element if parent is not known yet
		var parent = this.getParent();
		if(!value)
			this._expand();
		else
			if (!parent || parent._canCollapse(this))
				this._collapse();
			else 
				return false;
				
		this._settings.collapsed = value;
		if (!value) this.getParent()._afterOpen(this);
		
		this.refresh();
		if (this.getParent()){ //only necessary after rendering
			parent._resizeChilds();
			parent.callEvent("onAfter"+(value?"Collapse":"Expand"), [this._settings.id]);
		}
		return value;
	},
	collapse:function(){
		this.define("collapsed", true);
	},
	expand:function(){
		this.define("collapsed", false);
	},
	_expand:function(){
		this._bodyobj.style.display = "";

		dhx.html.removeCss(this._headbutton, "collapsed");
		this._last_size = null;
	},
	_collapse:function(mode){
		var vertical = this.getParent()._vertical_orientation;
		
		if(this._settings.headerAlt)
			this._headlabel.innerHTML = this._settings.headerAlt();
		this._bodyobj.style.display = "none";
		
		dhx.html.addCss(this._headbutton, "collapsed");
		this._last_size = null;
	},
	refresh:function(){
		var template = this._settings[this._settings.collapsed?"headerAlt":"header"] ||this._settings.header;
		if (template)
			this._headlabel.innerHTML = template();
	},
	_getHeaderSize:function(){
		return (this._settings.collapsed?this._settings.headerAltHeight:this._settings.headerHeight);
	},
	_set_size:function(x,y){ 
		if (dhx.ui.baseview.prototype._set_size.call(this,x,y)){
			x = this._content_width;
			y = this._content_height;
			
			var headerSize = this._getHeaderSize()-(this._settings._inner.top?0:1);
			if (this._settings.header){
				this._headobj.style.height=headerSize+"px";
				this._headobj.style.lineHeight=headerSize+"px";
				this._headobj.style.width="auto";
				this._headobj.style[dhx.env.transform]="";
				
				if (this._settings._inner.left)
					this._headobj.style.borderLeftWidth = "0px";
				if (this._settings._inner.right)
					this._headobj.style.borderRightWidth = "0px";
				
				if(this.getParent()._vertical_orientation||!this._settings.collapsed){
					y-=this._getHeaderSize();
				} else if (this._settings.collapsed){
					//-2 - borders
					
					this._headobj.style.width=(y-2)+"px";
					this._headobj.style.borderLeftWidth = this._headobj.style.borderRightWidth = "1px";
					var d = Math.floor(-y/2+x/2)-(x-this._settings.headerAltHeight)/2;
					this._headobj.style[dhx.env.transform]="rotate(-90deg) translate("+d+"px, "+d+"px)";
				}
			}
			if(!this._settings.collapsed)
				this._body_cell._set_size(x,y);
		}
	},
	defaults:{
		header:"",
		headerAlt:false,
		body:"",
		headerHeight:42,
		headerAltHeight:42,
		collapsed:true
	}
}, dhx.MouseEvents, dhx.EventSystem, dhx.ui.baseview);

dhx.protoUI({
	name:"accordion",
	_init:function(){
	},
	_parse_cells:function(){
		for (var i=0; i<this._collection.length; i++)
			this._collection[i].view = "accordionitem";

		dhx.ui.layout.prototype._parse_cells.call(this);
		
		for (var i=0; i < this._cells.length; i++){
			this._cells[i].refresh();
		}
	},
	_afterOpen:function(view){
		if (this._settings.multi === false){
			for (var i=0; i < this._cells.length; i++) {
				if (view != this._cells[i] && !this._cells[i]._settings.collapsed)
					this._cells[i].collapse();
			}
		}
	},
	_canCollapse:function(view){
		if (this._settings.multi === true) return true;
		//can collapse only if you have other item to open	
		for (var i=0; i < this._cells.length; i++)
			if (view != this._cells[i] && !this._cells[i]._settings.collapsed)
				return true;
		return false;
	},
	_resizeChilds:function(){
		this._get_desired_size();
		this._set_size.apply(this, this._last_size);
	},
	defaults:{
		multi:false
	}
}, dhx.ui.layout, dhx.EventSystem);




/* DHX DEPEND FROM FILE 'core/date.js'*/


/*DHX:Depend core/dhx.js*/
/*DHX:Depend core/math.js*/

dhx.i18n = {
    dateFormat:"%d.%m.%Y",
    timeFormat:"%H:%i",
    longDateFormat:"%l, %d %F %Y",
    fullDateFormat:"%d-%m-%Y %H:%i",
    setLocale:function(){
    	for( var key in dhx.i18n)
    		if (typeof dhx.i18n[key] == "string"){
    			dhx.i18n[key+"Str"] = dhx.Date.dateToStr(dhx.i18n[key]);
    			dhx.i18n[key+"Date"] = dhx.Date.strToDate(dhx.i18n[key]);
			}
    }
};

dhx.Date={
	Locale: {
		month_full:["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		month_short:["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		day_full:["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    	day_short:["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    },
	weekStart:function(date){
			var shift=date.getDay();
			if (this.config.start_on_monday){
				if (shift===0) shift=6;
				else shift--;
			}
			return this.date_part(this.add(date,-1*shift,"day"));
	},
	monthStart:function(date){
		date.setDate(1);
		return this.date_part(date);
	},
	yearStart:function(date){
		date.setMonth(0);
		return this.month_start(date);
	},
	dayStart:function(date){
			return this.date_part(date);
	},
	dateToStr:function(format,utc){
		format=format.replace(/%[a-zA-Z]/g,function(a){
			switch(a){
				case "%d": return "\"+dhx.math.toFixed(date.getDate())+\"";
				case "%m": return "\"+dhx.math.toFixed((date.getMonth()+1))+\"";
				case "%j": return "\"+date.getDate()+\"";
				case "%n": return "\"+(date.getMonth()+1)+\"";
				case "%y": return "\"+dhx.math.toFixed(date.getFullYear()%100)+\""; 
				case "%Y": return "\"+date.getFullYear()+\"";
				case "%D": return "\"+dhx.Date.Locale.day_short[date.getDay()]+\"";
				case "%l": return "\"+dhx.Date.Locale.day_full[date.getDay()]+\"";
				case "%M": return "\"+dhx.Date.Locale.month_short[date.getMonth()]+\"";
				case "%F": return "\"+dhx.Date.Locale.month_full[date.getMonth()]+\"";
				case "%h": return "\"+dhx.math.toFixed((date.getHours()+11)%12+1)+\"";
				case "%g": return "\"+((date.getHours()+11)%12+1)+\"";
				case "%G": return "\"+date.getHours()+\"";
				case "%H": return "\"+dhx.math.toFixed(date.getHours())+\"";
				case "%i": return "\"+dhx.math.toFixed(date.getMinutes())+\"";
				case "%a": return "\"+(date.getHours()>11?\"pm\":\"am\")+\"";
				case "%A": return "\"+(date.getHours()>11?\"PM\":\"AM\")+\"";
				case "%s": return "\"+dhx.math.toFixed(date.getSeconds())+\"";
				case "%W": return "\"+dhx.math.toFixed(dhx.Date.getISOWeek(date))+\"";
				default: return a;
			}
		});
		if (utc===true) format=format.replace(/date\.get/g,"date.getUTC");
		return new Function("date","return \""+format+"\";");
	},
	strToDate:function(format,utc){
		var splt="var temp=date.split(/[^0-9a-zA-Z]+/g);";
		var mask=format.match(/%[a-zA-Z]/g);
		for (var i=0; i<mask.length; i++){
			switch(mask[i]){
				case "%j":
				case "%d": splt+="set[2]=temp["+i+"]||1;";
					break;
				case "%n":
				case "%m": splt+="set[1]=(temp["+i+"]||1)-1;";
					break;
				case "%y": splt+="set[0]=temp["+i+"]*1+(temp["+i+"]>50?1900:2000);";
					break;
				case "%g":
				case "%G":
				case "%h": 
				case "%H":
							splt+="set[3]=temp["+i+"]||0;";
					break;
				case "%i":
							splt+="set[4]=temp["+i+"]||0;";
					break;
				case "%Y":  splt+="set[0]=temp["+i+"]||0;";
					break;
				case "%a":					
				case "%A":  splt+="set[3]=set[3]%12+((temp["+i+"]||'').toLowerCase()=='am'?0:12);";
					break;					
				case "%s":  splt+="set[5]=temp["+i+"]||0;";
					break;
				default:
					break;
			}
		}
		var code ="set[0],set[1],set[2],set[3],set[4],set[5]";
		if (utc) code =" Date.UTC("+code+")";
		return new Function("date","var set=[0,0,1,0,0,0]; "+splt+" return new Date("+code+");");
	},
		
	getISOWeek: function(ndate) {
		if(!ndate) return false;
		var nday = ndate.getDay();
		if (nday === 0) {
			nday = 7;
		}
		var first_thursday = new Date(ndate.valueOf());
		first_thursday.setDate(ndate.getDate() + (4 - nday));
		var year_number = first_thursday.getFullYear(); // year of the first Thursday
		var ordinal_date = Math.floor( (first_thursday.getTime() - new Date(year_number, 0, 1).getTime()) / 86400000); //ordinal date of the first Thursday - 1 (so not really ordinal date)
		var weekNumber = 1 + Math.floor( ordinal_date / 7);	
		return weekNumber;
	},
	
	getUTCISOWeek: function(ndate){
   		return this.getISOWeek(ndate);
   	},
   	add:function(date,inc,mode){
		var ndate=new Date(date.valueOf());
		switch(mode){
			case "day": ndate.setDate(ndate.getDate()+inc); break;
			case "week": ndate.setDate(ndate.getDate()+7*inc); break;
			case "month": ndate.setMonth(ndate.getMonth()+inc); break;
			case "year": ndate.setYear(ndate.getFullYear()+inc); break;
			case "hour": ndate.setHours(ndate.getHours()+inc); break;
			case "minute": ndate.setMinutes(ndate.getMinutes()+inc); break;
			default:
				break;
		}
		return ndate;
	},
	datePart:function(date){
		var d = this.copy(date);
		d.setHours(0);
		d.setMinutes(0);
		d.setSeconds(0);
		d.setMilliseconds(0);	
		return d;
	},
	timePart:function(date){
		var d = this.copy(date);
		return (d.valueOf()/1000 - d.getTimezoneOffset()*60)%86400;
	},
	copy:function(date){
		return new Date(date.valueOf());
	}
};

dhx.i18n.setLocale("en");


/* DHX DEPEND FROM FILE 'libs/format.js'*/


/*DHX:Depend core/dhx.js*/
/*DHX:Depend core/date.js*/

dhx.format = function(config) {
	config = (config || {});
	this._init(config);
};

dhx.format.prototype = {
	_init: function(config) {
		this._settings = {};
		/*! char for separating digits: 121 342   */
		this._settings.groupDelimiter = (config.groupDelimiter || " ");
		/*! number of digits on group */
		this._settings.groupNumber = (config.groupNumber || 3);
		/*! char of decimal point */
		this._settings.decimalPoint = (config.decimalPoint || ",");
		/*! number of digits after decimal point */
		this._settings.fractNumber = (config.fractNumber || 5);
		/*! date format */
		this._settings.dateFormat = (config.dateFormat || "%Y/%m/%d");
		/*! string template */
		this._settings.stringTemplate = (config.stringTemplate || "{value}");
		this._str_to_date = dhx.Date.str_to_date(this._settings.dateFormat);
		this._date_to_str = dhx.Date.date_to_str(this._settings.dateFormat);
	},

	define: function(name, value) {
		this._settings[name] = value;
	},

	format: function(value, type) {
		type = (type || this.formatAutoDefine(value));
		if (this['format__' + type])
			return this['format__' + type](value);
		return value;
	},

	formatAutoDefine: function(value) {
		// check if it's a number
		if ((typeof value == "number")||(value instanceof Number))
			return "number";
		// check if it's a date
		if (value instanceof Date)
			return "date";
		// check if it's a string
		if ((typeof value == "string")||(value instanceof String)) {
			// try to parse string as number
			if (!isNaN(parseFloat(value)))
				return "number";
			else
                return "string";
        }
		return false;
	},

	format__number: function(value) {
		var result = "";
		if (!((typeof value == "number")||(value instanceof Number))) {
			value = parseFloat(value);
		}
		var str = value.toFixed(this._settings.fractNumber).toString();
		str = str.split(".");
		var int_value = this.add_delimiter_to_int(str[0]);
		var fract_value = this.str_reverse(this.add_delimiter_to_int(this.str_reverse(str[1])));
		result = int_value + this._settings.decimalPoint + fract_value;
		return result;
	},

	add_delimiter_to_int: function(value) {
		var k = 0;
		var int_result = "";
		for (var i = value.length - 1; i >= 0; i--) {
			int_result = value[i] + int_result;
			k++;
			if (k == this._settings.groupNumber) {
				int_result = this._settings.groupDelimiter + int_result;
				k = 0;
			}
		}
		return int_result;
	},

	str_reverse: function(str_in) {
		var str_out = "";
		for (var i = str_in.length - 1; i >= 0; i--) {
			str_out += str_in[i];
		}
		return str_out;
	},

	format__date: function(value) {
		var result = this._date_to_str(value);
		return result;
	},

	attachFormat: function(name, processor) {
		this["format__" + name] = processor;
	},

	format__string: function(value) {
		var result = this._settings.stringTemplate.replace('{value}', value);
		return result;
	},

	format__bold: function(value) {
		if ((typeof value == "string")||(value instanceof String))
			return value.bold();
		return value;
	}

};

dhx.i18n.setLocale();


/* DHX DEPEND FROM FILE 'ui/calendar.js'*/


/*
	UI:Calendar
*/

/*DHX:Depend ui/view.css*/
/*DHX:Depend ui/calendar.css*/

/*DHX:Depend core/movable.js*/
/*DHX:Depend core/mouse.js*/
/*DHX:Depend core/config.js*/
/*DHX:Depend libs/format.js*/
/*DHX:Depend core/date.js*/
/*DHX:Depend core/dhx.js*/
/*DHX:Depend ui/view.js*/

dhx.protoUI({
	name:"calendar",
    defaults:{
        date: null, //selected date, not selected by default
        startOnMonday: true,
        navigation: true,
        weekHeader: false,
        weekNumber: false,
        timeSelect: false,
        skipEmptyWeeks: true,
        cellHeight:36,
        minuteStep: 15,
        hourStart: 6,
        hourEnd: 24,
        hourFormat: "%H",
        calendarHeader: "%F %Y",
        calendarDay: "%d",
        calendarWeekHeader: "W#",
        calendarWeek: "%W",
        width: 300,
        height: 300,
        selectedCss: "dhx_cal_selected_day"
    },
    skin:{
    	monthHeaderHeight: 40,
        weekHeaderHeight: 20,
        timeSelectHeight: 32
    },
    hourFormat_setter:dhx.Date.dateToStr,
    calendarHeader_setter:dhx.Date.dateToStr,
    calendarDay_setter:dhx.Date.dateToStr,
    calendarHeader_setter:dhx.Date.dateToStr,
    calendarWeekHeader_setter:dhx.Date.dateToStr,
    calendarWeek_setter:dhx.Date.dateToStr,
    date_setter:function(value){
    	if (typeof value == "string")	
    		value = dhx.i18n.fullDateFormatDate(value);
    	
    	this._show_date = this._show_date||value;
    	return value;
    },
    _init: function() {
    	//special dates
    	this._calendar_dates = {};
    	
    	//used for encoding dates in html
    	this._calendarDateFormatStr = dhx.Date.dateToStr("%Y-%m-%d");
        this._calendarDateFormatDate = dhx.Date.strToDate("%Y-%m-%d");
    },
	_get_desired_size:function(){
		if (this._settings.cellHeight>0)
			this._settings.height = this._get_desired_height();
		return dhx.ui.view.prototype._get_desired_size.call(this);
	},
	cellHeight_setter:function(value){
		if (value == "auto") return 0;
		return value;
	},
	_set_size:function(x,y){
        if(dhx.ui.view.prototype._set_size.call(this,x,y)){
            this.render();
        }
    },
    _getDateBoundaries: function() { // addition information about rendering event: how many days from the previous month, next, number of weeks to display and so on
    	//cache old values
    	//if (this._old_boundaries == this._show_date) return;
    	//this._old_boundaries = this._show_date;
    	
    	if (!this._show_date)
    		this._show_date = new Date();
    		
        var month_start = new Date(this._show_date);
        month_start.setDate(1);
        var month_start_day = month_start.getDay();
        
        this._month_start = new Date(month_start);
        this._week_start_day = (this._settings.startOnMonday)?1:0; // 0 - Sun, 1 - Mon, ...
        this._ndays_prev_month = (month_start_day - this._week_start_day + 7) % 7; // number of days which will be displayed from the previous month
        this._ndays_current_month = 32 - new Date(month_start.getFullYear(), month_start.getMonth(), 32).getDate();
        
        var ndays_next_month = 42 - this._ndays_prev_month - this._ndays_current_month; // max number of days in calendar - number in the previous month - number in the next month
        this._month_end = new Date(month_start.setDate(this._ndays_current_month));
        
        if(!this._settings.skipEmptyWeeks)
            this._rowcount = 6;
        else
            this._rowcount = 6-Math.floor(ndays_next_month/7);
        this._ndays_next_month = this._rowcount*7-this._ndays_prev_month-this._ndays_current_month;
	    this._max_date = new Date(month_start.setDate(month_start.getDate()+ndays_next_month));
	    
	    this._heightOffset = this.skin.monthHeaderHeight + (this._settings.weekHeader?this.skin.weekHeaderHeight:0) + (this._settings.timeSelect?this.skin.timeSelectHeight:0);
    },
    _get_desired_height:function(){
    	this._getDateBoundaries();
    	return this._heightOffset + this._rowcount*this._settings.cellHeight;
    },
	_getColumnSizes: function(){
        this._getDateBoundaries();

		this._columnsHeight = [];
		this._columnsWidth = [];

		var containerWidth = this._content_width;
        containerWidth += 1; //FIXME: whole body width is 1px as we have margin-left -1px to remove left borders

		var containerHeight = this._content_height; // used only for table with month dates

		var columnsNumber = (this._settings.weekNumber)?8:7;
		for(var i=0; i<columnsNumber; i++) {
			this._columnsWidth[i] = Math.ceil(containerWidth/(columnsNumber-i));
			containerWidth -= this._columnsWidth[i];
		}

        if(this._settings.cellHeight<=0) {
            for (var k = 0; k < this._rowcount; k++) {
                this._columnsHeight[k] = Math.ceil( (containerHeight - this._heightOffset)/(this._rowcount-k) );
                containerHeight -= this._columnsHeight[k];
            }
        }
        else {
            for (var k = 0; k < this._rowcount; k++) {
                this._columnsHeight[k] = this._settings.cellHeight; 
            }
        }
	},
	
	selectDate: function(date, show) { // sets class for the selected date, removes from the previous
        this.define("date",date);
        if (show)
        	this.showCalendar(this._settings.date);
            
        var className = this._settings.selectedCss;
        
        if(this._calendar_dates[this._selected]){
            dhx.html.removeCss(this._calendar_dates[this._selected], className);
            this._selected = null;
        }
        
        var date_string = this._calendarDateFormatStr(this._settings.date);
        if(this._calendar_dates[date_string]) {
            dhx.html.addCss(this._calendar_dates[date_string], className);
            this._selected = date_string;
        }
	},
	getSelectedDate: function() {
		return this._settings.date?new Date(this._settings.date):null;
	},
	getVisibleDate: function() {
		return new Date(this._show_date);
	},
	setValue: function(date){
		this.selectDate(date, true);
	},
	getValue: function(date){
		return this.getSelectedDate();
	},
	showCalendar: function(date) {
		if(typeof date == "string")
            date=dhx.i18m.fullDateFormatDate(date);

		//date is already visible, skip update
		if (date && date.getFullYear() == this._show_date.getFullYear() && date.getMonth() == this._show_date.getMonth()) return;
		
		this._show_date = date||this._show_date;
		this.render();
		var parent = this.getParent();
		if (parent) parent.resize();
	},
	refresh:function(){ this.render(); },
	render: function() {
		
		if (!this.isVisible(this._settings.id)) return;
		if (dhx.debug_render)
			dhx.log("Render: "+this.name+"@"+this._settings.id);
			
		this.callEvent("onBeforeRender",[]);
		this._getColumnSizes();

		var html = "<div class='dhx_mini_calendar'><div class='dhx_cal_month'>"+this._settings.calendarHeader(this._show_date);
		if (this._settings.navigation)
			html += this._navigation_template();
		html+="</div>";
		
		if(this._settings.weekHeader)
            html += "<div class='dhx_cal_header' style='height:"+this.skin.weekHeaderHeight+"px'>"+this._week_template()+"</div>";
        
        html += "<div class='dhx_cal_body'>"+this._body_template()+"</div>";
        
		if(this._settings.timeSelect)
        	html += "<div class='dhx_cal_time_select'>"+this._timeSelect_template()+"</div>";
		
        html += "</div></div>";

        
		this._contentobj.innerHTML = html;
		
		// this._calendar_dates stores all divs with dates displayed in the calendar
		this._calendar_dates={};
		var temp = this._contentobj.getElementsByTagName('table');
        var tdivs = temp[temp.length-1].getElementsByTagName('div');
        for(var i=0; i<tdivs.length; i++) {
            this._calendar_dates[tdivs[i].getAttribute('date')] = tdivs[i];
        }
		
		// marking selected if it is defined
		if(this._settings.date)
			this.selectDate(this._settings.date, false);
		
		this.callEvent("onAfterRender",[]);
	},	

	_week_template: function(){ 
		var week_template = '';
		var k = (this._settings.startOnMonday)?1:0;
		var left = 0;
		var delta = 0;
		if(this._settings.weekNumber) {
			delta = 1;
			var label = this._settings.calendarWeekHeader();
			week_template += "<div class='dhx_cal_week_header' style='width: "+(this._columnsWidth[0]-1)+"px; left: "+left+"px;' >"+label+"</div>"; // -2 because of the top and bottom borders
			left += this._columnsWidth[0];
		}
		
		for (var i=0; i<7; i++){ // 7 days total
			var day_index = (k + i) % 7; // 0 - Sun, 6 - Sat as in Locale.date.day_short
			var day = dhx.Date.Locale.day_short[day_index]; // 01, 02 .. 31
			
			var className = 'dhx_cal_day_name';
			var width = this._columnsWidth[i+delta]-1; // border
			if (i == 6) { // last column
				className += ' dhx_cal_day_name_last';
				width += 1; // there is no right border for the last column
			}
			if (day_index === 0) {
				className += ' dhx_sunday';
			}
			if (day_index == 6) {
				className += ' dhx_saturday';
			}

			week_template += "<div class='"+className+"' style='width: "+width+"px; left: "+left+"px;' >"+day+"</div>"; // -2 because of the top and bottom borders

			left += this._columnsWidth[i+delta];
		}
		
		return week_template;
	},
	
	_body_template: function() {
		var day_number = 0;
		var temp_date = dhx.Date.add(this._month_start, -this._ndays_prev_month, "day"); // used for date attribute, changed in the main loop
		temp_date = dhx.Date.datePart(temp_date);
		
		var delta = 0;	
		var body_template = '';
		
		if(this._settings.weekNumber) {
			delta=1;
			var tdate = dhx.Date.add(temp_date, (this._week_start_day+1)%2, "day"); // need to move to the closest Monday in case temp_date = Sun
			body_template += '<table class="dhx_week_numbers" cellspacing="0" cellpadding="0" style="float: left;"><tbody>';
			
			for (var i = 0; i < this._rowcount; i++) {
				var height = this._columnsHeight[i] - 2;
				var width = this._columnsWidth[0] - 2;
				var weekNumber = this._settings.calendarWeek(tdate);
				var div_class = 'dhx_cal_week_num';
				if (!this._settings.skipEmptyWeeks && ((i == (this._rowcount-1) && this._ndays_next_month >= 7) || (i == (this._rowcount-2) && this._ndays_next_month == 14))) { //FIXME: seems to be working correctly but should be done more gracefully
					div_class = 'dhx_next_month';
					weekNumber = '';
				}
                
                if(i==this._rowcount-1) { // last cell
                    div_class += ' dhx_cal_day_num_bborder';
                    height += 1;
                }

				body_template += "<tr><td>";
				body_template += "<div class='" + div_class + "' style='width:" + width + "px; height:" + height + "px; line-height:" + height + "px;' >" + weekNumber + "</div>";
				body_template += "</td></tr>";
				
				tdate = dhx.Date.add(tdate, 7, "day");
			}
			
			body_template += "</tbody></table>";
		}			

		var current_date = dhx.Date.datePart(new Date());
		body_template += '<table cellspacing="0" cellpadding="0"><tbody>';
        var total_days = (this._rowcount*7) - 1;
		for (var i=0; i<this._rowcount; i++){
			body_template += "<tr>";
			
			for(var k=0; k<7; k++) {

				var day = this._settings.calendarDay(temp_date);
				var date_string = this._calendarDateFormatStr(temp_date);
				var div_class = 'dhx_cal_day_num';

				if(day_number < this._ndays_prev_month) {
					div_class = 'dhx_prev_month';
					day = '';
					date_string = '';
				}
				if(day_number > total_days - this._ndays_next_month) {
					div_class = 'dhx_next_month';
					day = '';
					date_string = '';
				}

				var height = this._columnsHeight[i]-2; // top and bottom border
				var width = this._columnsWidth[k+delta]-2; // left and right border

                if(k==6) { // last day
                    div_class += ' dhx_cal_day_num_rborder';
                    width += 1; // there is no right border for the last column
                }

                if(i==(this._rowcount-1)) {
                    div_class += ' dhx_cal_day_num_bborder';
                    height += 1; // there is no bottom border for the last row
                }

				body_template += "<td>";

				if(current_date.valueOf() == temp_date.valueOf()) {
					div_class += ' dhx_cal_current_day';
				}
				
				body_template += "<div class='"+div_class+"' style='width:"+width+"px; height:"+height+"px; line-height:"+height+"px;' date='"+date_string+"'>"+day+"</div>";
				body_template += "</td>";
				
				temp_date = dhx.Date.add(temp_date, 1, "day");
				day_number++;
			}
			body_template += "</tr>";
		}
		body_template += "</tbody></table>";
			
		return body_template;
	},
	
	_timeSelect_template: function() {
		var timeSelect_template = "<select class='dhx_hour_select' onclick=''>";
		
		var hourStart = this._settings.hourStart;
		var hourEnd = this._settings.hourEnd;
		var temp_date = dhx.Date.datePart(new Date());
		for (var hour = hourStart; hour < hourEnd; hour++){
			temp_date.setHours(hour);
			timeSelect_template += "<option value='"+hour+"'>"+this._settings.hourFormat(temp_date)+"</option>";
		}	
		timeSelect_template += "</select>";
		
		// minutes
		timeSelect_template += "<select class='dhx_minute_select' onclick=''>";
		for(var minute=0; minute<60; minute+= this._settings.minuteStep){
			timeSelect_template += "<option value='"+minute+"'>"+dhx.math.toFixed(minute)+"</option>";
		}
		timeSelect_template += "</select>";

		return timeSelect_template;
	},
	_navigation_template: function(calendar) {
		var start = "<div class='dhx_cal_arrow dhx_cal_";
		var end   = "_button'><div></div></div>";
		
		return start+"prev"+end+start+"next"+end;
	},
	on_click:{
		dhx_cal_arrow: function(e,id,html_object){
			var direction = html_object.className.match(/prev/i)?-1:1;
			
			var prev_date = new Date(this._show_date);
			var next_date = new Date(prev_date);
            next_date.setDate(1); // 31 march -1 month = 31 february (bug)
			next_date = dhx.Date.add(next_date, direction, "month");
			
			if(this.callEvent("onBeforeMonthChange", [prev_date, next_date])){
				this.showCalendar(next_date);
				this.callEvent("onAfterMonthChange", [next_date, prev_date]);
			}
		},
		dhx_cal_day_num: function(e, id, html_object){
			var date_string = html_object.getAttribute('date');
			var date = this._calendarDateFormatDate(date_string);
			
			if(this._settings.timeSelect) {
				var selects = this._viewobj.getElementsByTagName('select');
				date.setMinutes((selects[0].value*60)+selects[1].value*1);
			}
			
			this.selectDate(date);
			this.callEvent("onDateSelect", [date]);
			this.callEvent("onChange",[date]);
		}
	}	
}, dhx.MouseEvents, dhx.Settings, dhx.EventSystem, dhx.Movable, dhx.ui.view);




/* DHX DEPEND FROM FILE 'ui/fullscreen.js'*/


dhx.html.addMeta = function(name, value){
	document.getElementsByTagName('head').item(0).appendChild(dhx.html.create("meta",{
		name:name,
		content:value
	}));	
	
};

(function(){
	
var orientation = function(){
	var new_orientation = !!(window.orientation%180);
	if (dhx.ui.orientation === new_orientation) return;
	
	dhx.ui.orientation = new_orientation;	
	dhx.callEvent("onRotate", [new_orientation]);
};
dhx.ui.orientation = !!((dhx.isNotDefined(window.orientation)?90:window.orientation)%180);
dhx.event(window, ("onorientationchange" in window ?"orientationchange":"resize"), orientation);

dhx.ui.fullScreen = function(){
	dhx.html.addMeta("apple-mobile-web-app-capable","yes");
	dhx.html.addMeta("viewport","initial-scale = 1.0, maximum-scale = 1.0, user-scalable = no");
	
	if (!dhx.env.touch) return;
	
	var size = document.body.offsetHeight;
	
	var iphone = navigator.userAgent.indexOf("iPhone")!=-1;
	
	var iphone_safari = iphone && (size == 356 || size == 208 || size == 306 || size == 158);

	/*	
	//will block adress bar as well
	dhx.event(window, "scroll", function(){
		if (window.pageYOffset == 0);
			window.scrollTo(0,1);
	});
	*/
	
	var fix = function(){
		if (iphone){
			if (!dhx.ui.orientation){
				x = 320;
				y = iphone_safari?416:460;
			} else {
				x = 480;
				y = iphone_safari?268:300;
			}
		} else {
			document.body.style.width = document.body.style.height = "1px";
			document.body.style.overflow="hidden";
			var dmod = window.outerWidth/window.innerWidth; //<1
			var x = window.outerWidth/dmod;
			var y = window.outerHeight/dmod;	
		}
		
		//document.body.style.overflow="visible";
		document.body.style.height = y+"px";
		document.body.style.width = x+"px";

		dhx.ui._freeze = false;
		dhx.ui.resize();
		dhx.delay(function(){
			window.scrollTo(0,1);
		});
	};
	var onrotate = function(){ 
		dhx.ui._freeze = true;
		if(dhx.env.isSafari) 
			fix();
		else
			dhx.delay(fix,null, [], 500);
	};
	
	dhx.attachEvent("onClick", function(){
		if ((iphone_safari && window.innerHeight<416) || (!iphone_safari && window.innerHeight < window.outerHeight))
			window.scrollTo(0,1);
	});
	
	dhx.attachEvent("onRotate", onrotate);
	orientation();
	dhx.delay(onrotate);
};


})();


/* DHX INITIAL FILE '../../sources//touchui.js'*/


/*DHX:Depend ui/fullscreen.js*/
/*DHX:Depend ui/calendar.js*/
/*DHX:Depend ui/toolbar.js*/
/*DHX:Depend ui/dataview.js*/
/*DHX:Depend ui/accordion.js*/
/*DHX:Depend ui/list.js*/
/*DHX:Depend ui/multiview.js*/
/*DHX:Depend ui/window.js*/
/*DHX:Depend ui/form.js*/
/*DHX:Depend ui/gmap.js*/
/*DHX:Depend ui/video.js*/
/*DHX:Depend ui/grid.js*/
/*DHX:Depend ui/carousel.js*/
/*DHX:Depend ui/notice.js*/
/*DHX:Depend libs/dataprocessor.js*/
/*DHX:Depend libs/jsonp.js*/
/*DHX:Depend ui/chart.js*/
/*DHX:Depend ui/dataview.js*/
/*DHX:Depend core/touch.js*/
