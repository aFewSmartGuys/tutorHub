'use strict';
/**
 * args:
 * default boolean Whether to include the authlvl links
 * homepage boolean whether to include the scroll links
 * custom Array[opt] custom menu options
 * dropdowns Array[] | dropdown {} custom dropdown menu or menus
 *
 * opt={
 * 	href:str,
 * 	value:str
 * }
 * dropodown={
 * 	title:str,
 * 	opts:Array[opt]
 * }
 */
function MenuOptions(args) {
	this.l3 = [{value:'Dashboard',href:'/admin'}];
	this.l0 = [{value:'Booking',href:'/user'}];

	this.homepage = args.homepage || false;
	this.default = args.default;
	this.dropdowns = null;
	this.dropdown = null;

	this.links = args.custom instanceof Array ?
	args.custom.concat(this.genCustomOpts(args.authLvl)) : this.genCustomOpts(args.authLvl);

	// set up dropdown menu items
	// dropdowns if an array is provided otherwise looks for a single object
	if (args.dropdowns instanceof Array) {
		this.dropdowns = args.dropdowns;
	} else if (typeof args.dropdowns === 'object') {
		// required properties to be a dropdown obj
		let reqProps = ['title', 'opts'];
		// needs to be tested
		this.dropdown = reqProps.every(hasProp(args.dropdowns))?args.dropdowns:null;
	}
}

MenuOptions.prototype.generateDropdowns = function() {
	var dropdownMenus = [];
	if (this.dropdowns) {
		dropdownMenus = this.dropdowns.map(createDropdown);
	} else if (this.dropdown) {
		let dd = createDropdown(this.dropdown);
		dropdownMenus.push(dd);
	}
	return dropdownMenus;
}

MenuOptions.prototype.generateLinks = function() {
	var htmlStr = '';
	this.links.forEach(function(opt) {
		htmlStr += "<li><a href='" + opt.href + "'>" + opt.value + "</a></li>";
	});
	return htmlStr;
};

/**
 * gets all of the premade options for a user according to their authentication level
 * @param authLvl Integer >=0 && <=3
 * @return Array of options
 */
MenuOptions.prototype.genCustomOpts = function(authLvl) {
	// 0 =  min authlvl
	// 3 = max authlvl
	// TODO: get min and max as variables
	if (!Number.isInteger(authLvl) || authLvl < 0 || authLvl > 3) {
		authLvl = 0;
	}
	var optsarr = [];
	for (let i = 0; i <= authLvl; ++i) {
		let opts = 'l'+i;
		if (this.hasOwnProperty(opts)) {
			optsarr = optsarr.concat(this[opts]);
		}
	}
	return optsarr;
};

function createDropdown(dd) {
	if (dd.hasOwnProperty('title')&&dd.hasOwnProperty('opts')) {
		if (dd.opts instanceof Array) {
			let beg = "<li class='dropdown'><a class='dropdown-toggle' data-toggle='dropdown'>"+dd.title+
				"<span class='caret'></span></a><ul class='dropdown-menu'>";
			let end = "</ul></li>";
			dd.opts.forEach(function(o) {
				if (o.hasOwnProperty('href')&&o.hasOwnProperty('value')) {
					let item = "<li><a href='" + o.href + "'>" + o.value + "</a></li>";
					beg += item;
				}
			});
			return beg+end;
		}
	} else {
		console.log('Missing properties for dropdown');
		return '';
	};
}

function hasProp(obj) {
	return function(prop) {
		return obj.hasOwnProperty(prop);
	};
}

module.exports = MenuOptions;
