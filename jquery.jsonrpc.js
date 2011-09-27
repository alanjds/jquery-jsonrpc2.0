/*
 * jQuery JSON-RPC Plugin
 *
 * @version: 0.2(2011-03-14)
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
 *     success : function(result) {
 *       //doSomething
 *     },
 *     fault : function(error) {
 *       //doSomething
 *     }
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
 *   // Set DataFilter. It is useful for buggy API that returns sometimes not json but html (when 500, 403..).
 *   $.jsonrpc({
 *     url : '/rpc',
 *     method : 'getUser',
 *     dataFilter : function(data, type) {
 *       try {
 *         return JSON.parse(data);
 *       } catch(e) {
 *         return {error : {message : 'Cannot parse response', data : data}};
 *       }
 *     }, function(result){ doSomething... }
 *   }, {
 *     success : handleSuccess
 *     fault : handleFailure
 *   });
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 */
(function($) {
   
  var rpcid = 1,
      emptyFn = function(){};
   
  $.jsonrpc = $.jsonrpc || function(data, callbacks, debug) {
    debug = debug || false;

    var postdata = {
      jsonrpc : '2.0',
      method : data.method || '',
      params : data.params || {}
    }
    if (callbacks) {
      postdata.id = data.id || rpcid++;
    } else {
      callbacks = emptyFn; 
    }

    if (typeof(callbacks) === 'function') {
      callbacks = {
        success : callbacks,
        fault : callbacks
      }
    }

    var dataFilter = data.dataFilter;

    var ajaxopts = {
      url : data.url || $.jsonrpc.defaultUrl,
      contentType : 'application/json',
      dataType : 'text', 
      dataFilter : function(data, type) {
        if (dataFilter) {
          return dataFilter(data);
        } else {
          return JSON.parse(data);
        }
      },
      type : 'POST',
      processData : false,
      data : JSON.stringify(postdata),
      success : function(resp) {
        if (debug){ console.debug(resp) }
        if (resp && !resp.error) {
          return callbacks.success && callbacks.success(resp.result);
        } else if (resp && resp.error) {
          return callbacks.fault && callbacks.fault(resp.error);
        } else {
          return callbacks.fault && callbacks.fault(resp);
        }
      },
      error : function(xhr, status, error) {
        if (debug){ console.error(error || '<json-rpc call failed>') }
        if (error === 'timeout') {
          callbacks.fault({
            code : 0,
            message : 'Request Timeout'
          });
          return;
        }
        // If response code is 404, 400, 500, server returns error object
        try {
          var res = JSON.parse(xhr.responseText);
          callbacks.fault(res.error);
        } catch(e) {
          callbacks.fault({
            code: 0,
            message: error
          });
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

