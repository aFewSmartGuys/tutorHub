'use strict';
/**
 * 
 * args: custom:[], dropdown{title:"",opts:[]}, homepage:bool
 *
 *
 *
 *
 */
function MenuOptions(args) {
	this.l3 = [{value:'Dashboard',href:'/admin'}];
	this.l0 = [{value:'Booking',href:'/user'}];
	
	this.homepage = args.homepage || false;
	this.links = args.custom instanceof Array ?
		args.custom.concat(this.genCustomOpts(args.authLvl)) : this.genCustomOpts(args.authLvl);
}

MenuOptions.prototype.generateCustomLinks = function() {
	var htmlStr = "";
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
		let opts = "l"+i;
		if (this.hasOwnProperty(opts)) {
			optsarr = optsarr.concat(this[opts]);
		}
	}
	return optsarr;
};

module.exports = MenuOptions;
