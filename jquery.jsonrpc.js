/*
 * jQuery JSON-RPC Plugin
 *
 * @version: 0.1-ajs(2010-08-23)
 * @author hagino3000 <http://twitter.com/hagino3000> (Takashi Nishibayashi)
 * @author alanjds <http://twitter.com/alanjds> (Alan Justino da Silva)
 *
 * A JSON-RPC 2.0 implementation for jQuery.
 * JSON-RPC is a stateless, light-weight remote procedure call (RPC) protocol.
 * Read more in the <http://groups.google.com/group/json-rpc/web/json-rpc-2-0>
 *
 * Requires json2.js<http://www.json.org/json2.js> if browser has not window.JSON.
 *
 * Usage:
 *   $.jsonrpc(data [, callbacks [, debug]]);
 *
 *   where data = {url: '/rpc/', method:'simplefunc', params:['posi', 'tional']}
 *   or data = {url: '/rpc/', method:'complexfunc', params:{nam:'ed', par:'ams'}}
 *   and callbacks = {success: successFunc, fault: faultFunc, error: errorFunc}
 *
 *   Setting no callback produces a JSON-RPC Notification.
 *   'data' accepts 'timeout' keyword too, who sets the $.ajax request timeout.
 *   Setting 'debug' to true prints responses to Firebug's console.info
 *
 * Examples:
 *   // A RPC call with named parameters
 *   $.jsonrpc({
 *     url : '/rpc', 
 *     method : 'createUser',
 *     params : {name : 'John Smith', userId : '1000'}
 *   }, {
 *     success : doSomething(response),
 *     fault : handleFault(response, errordata),
 *     error : handleError(request, status, error);
 *   });
 *
 *   // A Notification 
 *   $.jsonrpc({
 *     url : '/rpc', 
 *     method : 'notify',
 *     params : {action : 'logout', userId : '1000'}
 *   });
 *
 *   // A Notification using console to debug and with timeout set
 *   $.jsonrpc({
 *     url : '/rpc', 
 *     method : 'notify',
 *     params : {action : 'logout', userId : '1000'},
 *     debug : true,
 *     timeout : 500,
 *   });
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 */
(function($) {
   
  var rpcid = 1;
   
  $.jsonrpc = $.jsonrpc || function(data, callbacks, debug) {

    var postdata = {
      jsonrpc : '2.0',
      method : data.method || '',
      params : data.params || {}
    }
    if (callbacks) {
      postdata.id = data.id || rpcid++;
    }

    if (!callbacks) {
      callbacks = function(){};
    }
    if (typeof(callbacks) === 'function') {
      callbacks = {
        success : callbacks,
        fault : callbacks
      }
    }
   
    debug = debug || false;

    var ajaxopts = {
      url : data.url || $.jsonrpc.defaultUrl,
      contentType : 'application/json',
      dataType : 'json',
      type : 'POST',
      processData : false,
      data : JSON.stringify(postdata),
      success : function(resp) {
        if (resp && !resp.error) {
          return callbacks.success && callbacks.success(resp.result);
        } else if (resp && resp.error) {
          return callbacks.fault && callbacks.fault(resp.error.message, resp.error.data);
        } else {
          return callbacks.fault && callbacks.fault(resp);
        }
      },
      error : function(xhr, status, error) {
        if (callbacks.error){
          return callbacks.error && callbacks.error(xhr, status, error);
        } else {
          if (debug) {
            $.error(error);
          }
          return false
        }
      }
    }
    if (data.timeout){
      ajaxopts['timeout'] = data.timeout
    }
    
    $.ajax(ajaxopts);

    return $;
  }
  
  $.jsonrpc.defaultUrl = $.jsonrpc.defaultUrl || '/jsonrpc/'

})(jQuery);

