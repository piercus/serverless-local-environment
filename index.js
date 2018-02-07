'use strict';


class ServerlessPluginLocalEnvironment {

  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.hooks = {
      'before:invoke:local:invoke': this.extendOptionsWithLocalEnvironment.bind(this)
    };
  }
  
  extendOptionsWithLocalEnvironment(){
    const functionObj = this.serverless.service.getFunction(this.options.function);
    // const providerObj = this.serverless.getProvider();

    this.extendWithLocalEnvironment(functionObj,  functionObj && functionObj['local-environment'])
    // this.extendWithLocalEnvironment(providerObj, providerObj && providerObj['local-environment'])
  }
  
  extendWithLocalEnvironment(obj, extension){
    
      if(
        extension && 
        extension['LD_LIBRARY_PATH']
      ){
        
        let ldPaths = [];
        // from https://github.com/serverless/serverless/blob/4b71faf2128308894646940ce2fb64e826450972/lib/plugins/aws/invokeLocal/index.js#L95
        const awsLibs = '/usr/local/lib64/node-v4.3.x/lib:/lib64:/usr/lib64:/var/runtime:/var/runtime/lib:/var/task:/var/task/lib';
        ldPaths = ldPaths.concat(awsLibs.split(':'));
        ldPaths = ldPaths.concat(extension['LD_LIBRARY_PATH'].split(':'));

        extension['LD_LIBRARY_PATH'] = ldPaths.join(':');
      }
      if(!obj.environment){
        obj.environment = {};
      }        
      
      Object.assign(obj.environment, extension);
      return Promise.resolve();
  }

}

module.exports = ServerlessPluginLocalEnvironment;
