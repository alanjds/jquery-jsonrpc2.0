module('RPC');

asyncTest('Simple method call', function(){
  var res1, res2, res3;

  $.jsonrpc({
    url : '/rpc',
    method : 'simpleMethod'
  }, function(result) {
    res1 = result.str;
    res2 = result.num;
    res3 = result.boo;
  });

  setTimeout(function() {
    strictEqual(res1, 'Called simpleMethod', 'Result value 1 (stirng)');
    strictEqual(res2, 1, 'Result value 2 (number)');
    strictEqual(res3, true, 'Result value 3 (boolean)');
    start();
  }, 500);
});

asyncTest('Use parameter', function(){
  var res, calledSuccess = false, calledFailure = false;
  $.jsonrpc({
    url : '/rpc',
    method : 'normalMethod',
    params : {
      p1 : 100,
      p2 : 'This is Parameter2',
      p3 : false,
      p4 : [0, 1, 2, 3],
      p5 : {
        hoge : 'fuga'
      }
    }
  }, {
    success : function(result) {
      calledSuccess = true;
      res = result;
    },
    fault : function(error) {
      calledFailure = true;
    }
  });

  setTimeout(function() {
    equals(calledSuccess, true, 'Called success callback');
    equals(calledFailure, false, 'Never called failuer callback');
    equals(res.p1, 200, 'Parameter1');
    equals(res.p2, 'This is Parameter2ZZZ', 'Parameter2');
    equals(res.p3, true, 'Parameter3');
    deepEqual(res.p4, [0, 1, 4, 9], 'Parameter4'); 
    deepEqual(res.p5, {hoge : 'fuga'}, 'Parameter5');
    start();
  }, 500);
});

asyncTest('Timeout', function(){
  var msg, calledSuccess = false, calledFailure = false;
  $.jsonrpc({
    url : '/rpc',
    method : 'timeoutMethod',
    timeout : 500
  }, {
    success : function(result) {
      calledSuccess = true;
    },
    fault : function(error) {
      calledFailure = true;
      msg = error.message;
    }
  });
  setTimeout(function() {
    equals(calledSuccess, false, 'Never alled success callback');
    equals(calledFailure, true, 'called failuer callback');
    equals(msg, 'Request Timeout', 'Error messsage');
    start();
  }, 1000);
});

asyncTest('RPC failuer', function(){
  var code, data, calledSuccess = false, calledFailure = false;
  $.jsonrpc({
    url : '/rpc',
    method : 'returnErrorMethod'
  }, {
    success : function() {
      calledSuccess = true;
    },
    fault : function(error) {
      calledFailure = true;
      code = error.code;
      data = error.data.msg;
    }
  });

  setTimeout(function() {
    equals(calledSuccess, false, 'Never called success callback');
    equals(calledFailure, true, 'Called failuer callback');
    equals(code, -32603, 'RPC fault');
    equals(data, 'this is error', 'error data');
    start();
  }, 500);
});

asyncTest('Method missing 404 : No method specified', function(){
  var code, calledSuccess = false, calledFailure = false;
  $.jsonrpc({
    url : '/rpc' // no method set
  }, {
    success : function() {
      calledSuccess = true;
    },
    fault : function(error) {
      calledFailure = true;
      code = error.code;
    },
  });

  setTimeout(function() {
    equals(calledSuccess, false, 'Never called success callback');
    equals(calledFailure, true, 'Called failuer callback');
    equals(code, -32601, 'Returns Bad Request');
    start();
  }, 500);
});


asyncTest('Method missing 404: Invalid method name', function(){
  var code, calledSuccess = false, calledFailure = false;
  $.jsonrpc({
    url : '/rpc',
    method : 'unknownMethod'
  }, {
    success : function() {
      calledSuccess = true;
    },
    fault : function(error) {
      calledFailure = true;
      code = error.code;
    }
  });

  setTimeout(function() {
    equals(calledSuccess, false, 'Never called success callback');
    equals(calledFailure, true, 'Called failuer callback');
    equals(code, -32601, 'Returns Bad Request');
    start();
  }, 500);
});

asyncTest('Internal Server Error 500', function(){
  var code, calledSuccess = false, calledFailure = false;
  $.jsonrpc({
    url : '/rpc',
    method : 'throwErrorMethod'
  }, {
    success : function() {
      calledSuccess = true;
    },
    fault : function(error) {
      calledFailure = true;
      code = error.code;
    }
  });

  setTimeout(function() {
    equals(calledSuccess, false, 'Never called success callback');
    equals(calledFailure, true, 'Called failuer callback');
    equals(code, -32603, 'Returns Server Error');
    start();
  }, 500);
});

