var Tracker = Class.extend({
	properties: {
		debug: false,
		active: true,
		engine: "omniture",
		type: "new.page",
		data: {
			link: {
				name: "",
			},
			page: {
				name: "",
				site: "HPC",
				section: "123hp",
				subsection: "",
				events: []
			}
		}
	},
	init: function (options) {
		if ("object" === typeof options) {
			if (("undefined" !== typeof options.engine) && ("string" === typeof options.engine)) {
				this.properties.engine = options.engine.strToLower();
			}
			
			if (("undefined" !== typeof options.debug)) {
				this.properties.debug = (true === options.debug ? true : false);
			}
			
			this.debug("Tracker.init(): initialized");
		}
		/*
		if (/localhost/i.test(window.location.href)) {
			this.disable();
		}
		*/
	},
	debug: function (data) {
		if ("undefined" === typeof data) {
			return this;
		}
		
		if ("undefined" !== typeof window.console) {
			console.log(data);
		}
		
		return this;
	},
	isEnabled: function () {
		this.debug("Tracker.isEnabled(): executed");
		
		return this.properties.active;
	},
	disable: function () {
		this.properties.active = false;
		
		this.debug("Tracker.disable(): executed");
		
		return this;
	},
	enable: function () {
		this.properties.active = true;
		
		this.debug("Tracker.enable(): executed");
		
		return this;
	},
	send: function (data) {		
		if ((false === this.isEnabled()) || ("object" !== typeof data)) {
			return this;
		}
		
		if (("undefined" === typeof data.link) || ("undefined" === typeof data.page)) {
			return this;
		}
				
		if (("undefined" !== typeof this.properties.engine)) {
			this.debug("Tracker.send(): engine to use " + this.properties.engine);
			
			if ("undefined" === typeof data.type) {
				data.type = this.properties.type;
			}
			
			if (("omniture" === this.properties.engine) && ("function" === typeof trackMetrics)) {
				if ("undefined" !== typeof data.subsection) {
					this.properties.data.page.subsection = data.subsection;
				}
				
				if (("undefined" !== typeof data.events) && (data.events instanceof Array)) {
					this.properties.data.page.events = data.events;
				}
	
				trackMetrics( this.properties.type, {
					link:{ name: data.link, },
					page: {
						name: data.page, site: this.properties.data.page.site, section: this.properties.data.page.section,
						events: data.events || []
			    }});
			}
		}
		
		return this;
	}
});