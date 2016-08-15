'use strict';

function MenuOptions(args) {
	this.l3 = [{value:'Dashboard',href:'/admin'}];
	this.l1 = [{value:'Booking',href:'/user'}];
	
	this.homepage = args.homepage || false;
	this.custom = args.custom || this.getCustomOpts(args.authLvl);
}

MenuOptions.prototype.generateCustomTags = function() {
	var htmlStr = "";
	this.custom.forEach(function(opt) {
		htmlStr += "<li><a href='" + opt.href + "'>" + opt.value + "</a></li>";
	});
	return htmlStr;
};

MenuOptions.prototype.getCustomOpts = function(authLvl) {
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
