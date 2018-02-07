'use strict';

module.exports = function(ServerlessPlugin) { // Always pass in the ServerlessPlugin Class

  const path    = require('path'),
      fs        = require('fs'),
      BbPromise = require('bluebird'); // Serverless uses Bluebird Promises and we recommend you do to because they provide more than your average Promise :)

  /**
   * ServerlessPluginBoierplate
   */

  class ServerlessPluginLocalEnvironment extends ServerlessPlugin {

    /**
     * Constructor
     * - Keep this and don't touch it unless you know what you're doing.
     */

    constructor(S) {
      super(S);
    }

    /**
     * Define your plugins name
     * - We recommend adding prefixing your personal domain to the name so people know the plugin author
     */

    static getName() {
      return 'com.piercus.' + ServerlessPluginLocalVariable.name;
    }

    /**
     * Register Hooks
     * - If you would like to register hooks (i.e., functions) that fire before or after a core Serverless Action or your Custom Action, include this function.
     * - Make sure to identify the Action you want to add a hook for and put either "pre" or "post" to describe when it should happen.
     */

    registerHooks() {

      this.S.addHook(this.extendWithLocalEnvironment.bind(this), {
        action: 'invoke:local:invoke',
        event:  'pre'
      });

      return BbPromise.resolve();
    }
    
    extendWithLocalEnvironment(){
        this.options.functionObj = this.S.service.getFunction(this.options.function);
        this.options.localEnvironment = this.options.functionObj && this.options.functionObj['local-environment'];
        
        if(
          this.options.localEnvironment && 
          this.options.localEnvironment['LD_LIBRARY_PATH']
        ){
          
          let ldPaths;
          // from https://github.com/serverless/serverless/blob/4b71faf2128308894646940ce2fb64e826450972/lib/plugins/aws/invokeLocal/index.js#L95
          const awsLibs = '/usr/local/lib64/node-v4.3.x/lib:/lib64:/usr/lib64:/var/runtime:/var/runtime/lib:/var/task:/var/task/lib';
          ldPaths = ldPaths.concat(awsLibs.split(':'));
          ldPaths = ldPaths.concat(this.options.localEnvironment['LD_LIBRARY_PATH'].split(':'));

          this.options.localEnvironment['LD_LIBRARY_PATH'] = ldPaths.join(':');
        }
        if(!this.options.functionObj.environment){
          this.options.functionObj.environment = {};
        }        
        
        Object.assign(this.options.functionObj.environment, this.options.localEnvironment);
        
        return Promise.resolve();
    }

  }

  // Export Plugin Class
  return ServerlessPluginLocalEnvironment;

};

// Godspeed!