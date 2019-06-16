'use strict';

var libQ = require('kew');
var SPI = require('pi-spi');

var fs=require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;


module.exports = FM3Control;
function FM3Control(context) {
	var self = this;

	this.context = context;
	this.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
	this.configManager = this.context.configManager;
	
}

FM3Control.prototype.onVolumioStart = function()
{
	var self = this;
	var configFile=this.commandRouter.pluginManager.getConfigurationFile(this.context,'config.json');
	this.config = new (require('v-conf'))();
	this.config.loadFile(configFile);

    return libQ.resolve();
}

FM3Control.prototype.onStart = function() {
    var self = this;
	var defer=libQ.defer();

	self.initSPIDevice();

	// Once the Plugin has successfull started resolve the promise
	defer.resolve();

    return defer.promise;
};

FM3Control.prototype.onStop = function() {
    var self = this;
    var defer=libQ.defer();

	self.closeSPIDevice();

    // Once the Plugin has successfull stopped resolve the promise
    defer.resolve();

    return libQ.resolve();
};

FM3Control.prototype.onRestart = function() {
    var self = this;
	// Optional, use if you need it
	
	self.closeSPIDevice();
	self.initSPIDevice();
};


// Configuration Methods -----------------------------------------------------------------------------

FM3Control.prototype.getUIConfig = function() {
    var defer = libQ.defer();
    var self = this;

    var lang_code = this.commandRouter.sharedVars.get('language_code');

    self.commandRouter.i18nJson(__dirname+'/i18n/strings_'+lang_code+'.json',
        __dirname+'/i18n/strings_en.json',
        __dirname + '/UIConfig.json')
        .then(function(uiconf)
        {


            defer.resolve(uiconf);
        })
        .fail(function()
        {
            defer.reject(new Error());
        });

    return defer.promise;
};

FM3Control.prototype.getConfigurationFiles = function() {
	return ['config.json'];
}

FM3Control.prototype.setUIConfig = function(data) {
	var self = this;
	//Perform your installation tasks here
};

FM3Control.prototype.getConf = function(varName) {
	var self = this;
	//Perform your installation tasks here
};

FM3Control.prototype.setConf = function(varName, varValue) {
	var self = this;
	//Perform your installation tasks here
};

// fm-3-control specific methods

FM3Control.prototype.initSPIDevice = function() {

	this.spi = SPI.initialize("/dev/spidev0.0");
	this.spi.clockSpeed(1000000);

};

FM3Control.prototype.closeSPIDevice = function() {

	this.spi.close(function(err){
		self.commandRouter.logger.info('fm-3-control::onStop error closing SPI device:' + err);
		self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'fm-3-control::onStop error closing SPI device');
	});
};