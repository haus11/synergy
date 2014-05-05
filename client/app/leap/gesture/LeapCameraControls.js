/*
 * @author Torsten Sprenger / http://torstensprenger.com
 *
 * Leap Camera Controls (http://leapmotion.com)
 * 
 */

THREE.LeapCameraControls = function(camera, ellipsoid) {
  var _this = this;

  _this.camera    = camera;
  _this.ellipsoid = ellipsoid;

  // api
  this.enabled      = true;
  this.target       = new THREE.Vector3(0, 0, 0);
  this.step         = (camera.position.z == 0 ? Math.pow(10, (Math.log(camera.frustum.near) + Math.log(camera.frustum.far))/Math.log(10))/10.0 : camera.position.z);
  this.fingerFactor = 2;

  this.startZ       = _this.camera.position.z;
  this.mode         = 'standard';

  // `...Hands`       : integer or range given as an array of length 2
  // `...Fingers`     : integer or range given as an array of length 2
  // `...RightHanded` : boolean indicating whether to use left or right hand for controlling (if number of hands > 1)
  // `...HandPosition`: boolean indicating whether to use palm position or finger tip position (if number of fingers == 1)
  // `...Stabilized`  : boolean indicating whether to use stabilized palm/finger tip position or not

  // rotation
  this.rotateEnabled       = true;
  this.rotateSpeed         = 2.0;
  this.rotateHands         = 1;
  this.rotateFingers       = [2, 3]; 
  this.rotateRightHanded   = true;
  this.rotateHandPosition  = true;
  this.rotateStabilized    = true;
  this.rotateMin           = 0;
  this.rotateMax           = Math.PI;
  
  // zoom
  this.zoomEnabled         = true;
  this.zoomSpeed           = 4.0;
  this.zoomHands           = 1;
  this.zoomFingers         = [4, 5];
  this.zoomRightHanded     = true;
  this.zoomHandPosition    = true;
  this.zoomStabilized      = true;
  this.zoomMin             = _this.camera.frustum.near;
  this.zoomMax             = _this.camera.maximumZoomFactor;
  //this.zoomMax             = _this.camera.frustum.far;
  
  // pan
  this.panEnabled          = true;
  this.panSpeed            = 3.0;
  this.panHands            = 2;
  this.panFingers          = [6, 12];
  this.panRightHanded      = true;
  this.panHandPosition     = true;
  this.panStabilized       = true;
  
  // internals
  var _rotateXLast         = null;
  var _rotateYLast         = null;
  var _zoomZLast           = null;
  var _panXLast            = null;
  var _panYLast            = null;
  var _panZLast            = null;
  
  // own zoom stuff
  this.zoomInMax           = 50;
  this.zoomOutMax          = 50000000;
  this.zoomMoveRateFactor  = 30;

  // own pan stuff
  this.panSpeedInit        = this.panSpeed;
  
  // own rotate stuff   
  this.rotateSpeedInit     = this.rotateSpeed;
  
  // helpers
  this.transformFactor = function(action) {
    switch(action) {
      case 'rotate':
        return _this.rotateSpeed * (_this.rotateHandPosition ? 1 : _this.fingerFactor);
      case 'zoom':
        return _this.zoomSpeed * (_this.zoomHandPosition ? 1 : _this.fingerFactor);
      case 'pan':
        return _this.panSpeed * (_this.panHandPosition ? 1 : _this.fingerFactor);
    };
  };

  this.rotateTransform = function(delta) {
    return _this.transformFactor('rotate') * THREE.Math.mapLinear(delta, -400, 400, -Math.PI, Math.PI);
  };

  this.zoomTransform = function(delta) {
    return _this.transformFactor('zoom') * THREE.Math.mapLinear(delta, -400, 400, -_this.step, _this.step);
  };

  this.panTransform = function(delta) {
    return _this.transformFactor('pan') * THREE.Math.mapLinear(delta, -400, 400, -_this.step, _this.step);
  };

  this.applyGesture = function(frame, action) {
    var hl = frame.hands.length;
    var fl = frame.pointables.length;

    switch(action) {
      case 'rotate':
        if (_this.rotateHands instanceof Array) {
          if (_this.rotateFingers instanceof Array) {
            if (_this.rotateHands[0] <= hl && hl <= _this.rotateHands[1] && _this.rotateFingers[0] <= fl && fl <= _this.rotateFingers[1]) return true;
          } else {
            if (_this.rotateHands[0] <= hl && hl <= _this.rotateHands[1] && _this.rotateFingers == fl) return true;
          };
        } else {
          if (_this.rotateFingers instanceof Array) {
            if (_this.rotateHands == hl && _this.rotateFingers[0] <= fl && fl <= _this.rotateFingers[1]) return true;
          } else {
            if (_this.rotateHands == hl && _this.rotateFingers == fl) return true;
          };
        };
        break;
      case 'zoom':
        if (_this.zoomHands instanceof Array) {
          if (_this.zoomFingers instanceof Array) {
            if (_this.zoomHands[0] <= hl && hl <= _this.zoomHands[1] && _this.zoomFingers[0] <= fl && fl <= _this.zoomFingers[1]) return true;
          } else {
            if (_this.zoomHands[0] <= hl && hl <= _this.zoomHands[1] && _this.zoomFingers == fl) return true;
          };
        } else {
          if (_this.zoomFingers instanceof Array) {
            if (_this.zoomHands == hl && _this.zoomFingers[0] <= fl && fl <= _this.zoomFingers[1]) return true;
          } else {
            if (_this.zoomHands == hl && _this.zoomFingers == fl) return true;
          };
        };
        break;
      case 'pan':
        if (_this.panHands instanceof Array) {
          if (_this.panFingers instanceof Array) {
            if (_this.panHands[0] <= hl && hl <= _this.panHands[1] && _this.panFingers[0] <= fl && fl <= _this.panFingers[1]) return true;
          } else {
            if (_this.panHands[0] <= hl && hl <= _this.panHands[1] && _this.panFingers == fl) return true;
          };
        } else {
          if (_this.panFingers instanceof Array) {
            if (_this.panHands == hl && _this.panFingers[0] <= fl && fl <= _this.panFingers[1]) return true;
          } else {
            if (_this.panHands == hl && _this.panFingers == fl) return true;
          };
        };
        break;
    };

    return false;
  };

  this.hand = function(frame, action) {
    var hds = frame.hands;
   
    if (hds.length > 0) {
      if (hds.length == 1) {
        return hds[0];
      } else if (hds.length == 2) {
        var lh, rh;
        if (hds[0].palmPosition[0] < hds[1].palmPosition[0]) {
          lh = hds[0];
          rh = hds[1];
        } else {
          lh = hds[1];
          rh = hds[0];
        }

        switch(action) {
          case 'rotate':
            if (_this.rotateRightHanded) {
              return rh;
            } else {
              return lh;
            };
          case 'zoom':
            if (_this.zoomRightHanded) {
              return rh;
            } else {
              return lh;
            };
          case 'pan':
            if (_this.panRightHanded) {
              return rh;
            } else {
              return lh;
            };
        };
      };
    };

    return false;
  };

  this.position = function(frame, action) {
    // assertion: if `...HandPosition` is false, then `...Fingers` needs to be 1 or [1, 1]
    var h;
    switch(action) {
      case 'rotate':
        h = _this.hand(frame, 'rotate');
        return (_this.rotateHandPosition 
          ? (_this.rotateStabilized ? h.stabilizedPalmPosition : h.palmPosition) 
          : (_this.rotateStabilized ? frame.pointables[0].stabilizedTipPosition : frame.pointables[0].tipPosition)
        );
      case 'zoom':
        h = _this.hand(frame, 'zoom');
        return (_this.zoomHandPosition 
          ? (_this.zoomStabilized ? h.stabilizedPalmPosition : h.palmPosition) 
          : (_this.zoomStabilized ? frame.pointables[0].stabilizedTipPosition : frame.pointables[0].tipPosition)
        );
      case 'pan':
        h = _this.hand(frame, 'pan');
        return (_this.panHandPosition
          ? (_this.panStabilized ? h.stabilizedPalmPosition : h.palmPosition) 
          : (_this.panStabilized ? frame.pointables[0].stabilizedTipPosition : frame.pointables[0].tipPosition)
        );
    };
  };

  // methods
  this.rotateCamera = function(frame) {
    if (_this.rotateEnabled && _this.applyGesture(frame, 'rotate')) {
      // rotate around axis in xy-plane (in target coordinate system) which is orthogonal to camera vector
      var y = _this.position(frame, 'rotate')[1];
      if (!_rotateYLast) _rotateYLast = y;
      var yDelta = y - _rotateYLast;


      var t = new THREE.Vector3().subVectors(_this.camera.position, _this.target); // translate
      angleDelta = _this.rotateTransform(yDelta);
      newAngle = t.angleTo(new THREE.Vector3(0, 1, 0)) + angleDelta;
      if (_this.rotateMin < newAngle && newAngle < _this.rotateMax) {
        var n = new THREE.Vector3(t.z, 0, -t.x).normalize();
        var matrixX = new THREE.Matrix4().makeRotationAxis(n, angleDelta);
        //_this.camera.position = t.applyMatrix4(matrixX).add(_this.target); // rotate and translate back
        _this.camera.rotate(n, -angleDelta);   
      };

      // rotate around y-axis translated by target vector
      var x = _this.position(frame, 'rotate')[0];
      if (!_rotateXLast) _rotateXLast = x;
      var xDelta = x - _rotateXLast;

      angleDelta = _this.rotateTransform(xDelta);
      var n = new THREE.Vector3(0, 1, 0).normalize();
      
        // rotation speed adjusting
        var cameraHeight = _this.ellipsoid.cartesianToCartographic(_this.camera.position).height;
        
        if (cameraHeight < 300) {
            _this.rotateSpeed = 0.00002;
        }
        else if (cameraHeight < 2000 && cameraHeight > 300) {
            _this.rotateSpeed = 0.0001;
        }
        else if (cameraHeight < 10000 && cameraHeight > 2000) {
            _this.rotateSpeed = 0.003;
        }
        else if (cameraHeight < 80000 && cameraHeight > 10000) {
            _this.rotateSpeed = 0.008;
        }
        else if (cameraHeight < 300000 && cameraHeight > 80000) {
            _this.rotateSpeed = 0.05;
        }
        else if (cameraHeight < 500000 && cameraHeight > 300000) {
            _this.rotateSpeed = 0.1;
        }
        else if (cameraHeight > 500000 && cameraHeight < 1000000) {
            _this.rotateSpeed = 0.25;
        }
        else if (cameraHeight > 1000000 && cameraHeight < 2000000) {
            _this.rotateSpeed = 0.5;
        }
        else if (cameraHeight > 2000000 && cameraHeight < 5000000) {
            _this.rotateSpeed = 1.0;
        }
        else {
            _this.rotateSpeed = _this.rotateSpeedInit;
        }
      
      _this.camera.rotate(n, angleDelta);

      /*
      var matrixY = new THREE.Matrix4().makeRotationY(-_this.rotateTransform(xDelta));
      _this.camera.position.sub(_this.target).applyMatrix4(matrixY).add(_this.target); // translate, rotate and translate back
      _this.camera.lookAt(_this.camera.position, _this.target, _this.camera.up);
      */

      _rotateYLast = y;
      _rotateXLast = x;
      _zoomZLast   = null;
      _panXLast    = null;
      _panYLast    = null;
      _panZLast    = null;      
    } else {
      _rotateYLast = null;
      _rotateXLast = null;
    };
  };

  this.zoomCamera = function(frame) {
            
    if (_this.zoomEnabled && _this.applyGesture(frame, 'zoom')) {
      var z = _this.position(frame, 'zoom')[2];
      if (!_zoomZLast) _zoomZLast = z;
      var zDelta = z - _zoomZLast;

    var lengthDelta = _this.zoomTransform(zDelta);
//      var absoluteLength = Math.abs(lengthDelta);

    var cameraHeight = _this.ellipsoid.cartesianToCartographic(_this.camera.position).height;
    var moveRate = cameraHeight / _this.zoomMoveRateFactor;
        
    if (lengthDelta > 0) {
        if (cameraHeight < _this.zoomInMax) {
            //dont zoom in anymore
        }
        else {
            _this.camera.moveForward(moveRate);
        }
    }
    else {
        if (cameraHeight > _this.zoomOutMax) {
            //dont zoom out anymore
        }
        else {
            _this.camera.moveBackward(moveRate);
        }
    }
      
      /*
      var t = new THREE.Vector3().subVectors(_this.camera.position, _this.target);
      var lengthDelta = _this.zoomTransform(zDelta);
      newLength = t.length() - lengthDelta;
      if (_this.zoomMin < newLength && newLength < _this.zoomMax) {
        t.normalize().multiplyScalar(lengthDelta);
        _this.camera.position.sub(t);        
      };
      */
      _zoomZLast        = z; 
      _rotateXLast      = null;
      _rotateYLast      = null;
      _panXLast         = null;
      _panYLast         = null;
      _panZLast         = null;
    } else {
      _zoomZLast = null; 
    };
  };

  this.panCamera = function(frame) {
    if (_this.panEnabled && _this.applyGesture(frame, 'pan')) {
      var x = _this.position(frame, 'pan')[0];
      var y = _this.position(frame, 'pan')[1];
      var z = _this.position(frame, 'pan')[2];
      if (!_panXLast) _panXLast = x;
      if (!_panYLast) _panYLast = y;
      if (!_panZLast) _panZLast = z;
      var xDelta = x - _panXLast;
      var yDelta = y - _panYLast;
      var zDelta = z - _panZLast;

      //var v = new THREE.Vector3(_this.panTransform(xDelta), _this.panTransform(yDelta), _this.panTransform(zDelta))
      //v.sub(_this.camera.position);

      //_this.camera.position.sub(v);
      //_this.target.sub(v);

        var cameraHeight = _this.ellipsoid.cartesianToCartographic(_this.camera.position).height;
        
        if (cameraHeight < 10000) {
            _this.panSpeed = 0.001;
        }
        if (cameraHeight < 50000 && cameraHeight > 10000) {
            _this.panSpeed = 0.01;
        }
        else if (cameraHeight < 500000 && cameraHeight > 50000) {
            _this.panSpeed = 0.1;
        }
        else if (cameraHeight > 500001 && cameraHeight < 1500000) {
            _this.panSpeed = 0.8;
        }
        else {
            _this.panSpeed = _this.panSpeedInit;
        }
        
      var absoluteX = Math.abs(_this.panTransform(xDelta));
    
      if(xDelta > 0) {
        _this.camera.moveLeft(absoluteX);
      }
      else {
        _this.camera.moveRight(absoluteX);
      }


      var absoluteY = Math.abs(_this.panTransform(yDelta));

      if(yDelta > 0) {
        _this.camera.moveDown(absoluteY);
      }
      else {
        _this.camera.moveUp(absoluteY);
      }


      _panXLast    = x;
      _panYLast    = y;
      _panZLast    = z;
      _rotateXLast = null;
      _rotateYLast = null;
      _zoomZLast   = null;
    } else {
      _panXLast = null;
      _panYLast = null;
      _panZLast = null;     
    };
  };

  this.airplaneCamera = function(frame) {
    var data = frame.data;
    if (frame.valid && data.hands.length === 1) {
      var fingers = data.pointables;
      if (fingers.length > 1) {
        data = data.hands[0];
        if (data.timeVisible > 0.75) {
          var cesiumLeap = this,
          camera = cesiumLeap.camera,
          movement = {},
          cameraHeight = cesiumLeap.ellipsoid.cartesianToCartographic(camera.position).height,
          moveRate = cameraHeight / 100.0;

          // pan - x,y
          movement.x = data.palmPosition[0];
          movement.y = data.palmPosition[2];

          //zoom - z // height above leap
          movement.z = data.palmPosition[1];

          //pitch - pitch
          var normal = data.palmNormal;
          movement.pitch = -1 * normal[2]; // leap motion has it that negative is sloping upwards, flipping it for google earth
          //Math.atan2(normal.z, normal.y) * 180/math.pi + 180;
          movement.rotate = data.direction[0];
          //yaw - yaw
          movement.yaw = -1 * normal[0]; // roll?
          // LeapMotion flips its roll angles as well

          // this 'mid' var seems to be a natural mid point in the 'z'
          // (or vertcal distance above device)
          // direction that is used for whether you are closer to the device
          // or away from it.
          var mid = 175;
          var normalized = (movement.z - mid) / -100;

          camera.moveForward(normalized * moveRate);
          camera.moveRight(movement.x * moveRate / 100);
          camera.moveDown(movement.y * moveRate / 100);

          camera.lookUp(movement.pitch / 100);

          camera.twistRight(movement.yaw / 100);
          camera.lookRight(movement.rotate / 100);
        }
      }
    }
  };

  this.update = function(frame) {

    if (_this.enabled) {
      if (_this.mode === 'standard') {
        _this.rotateCamera(frame);
        _this.zoomCamera(frame);
        _this.panCamera(frame);
      }
      else if (_this.mode === 'flight') {
        _this.airplaneCamera(frame);
      }
    };
  };
};