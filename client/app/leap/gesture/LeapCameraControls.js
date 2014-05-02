/*
 * @author Torsten Sprenger / http://torstensprenger.com
 *
 * Leap Camera Controls (http://leapmotion.com)
 * 
 */

THREE.LeapCameraControls = function(camera) {
  var _this = this;

  _this.camera = camera;

  // api
  this.enabled      = true;
  this.target       = new THREE.Vector3(0, 0, 0);
  this.step         = (camera.position.z == 0 ? Math.pow(10, (Math.log(camera.frustum.near) + Math.log(camera.frustum.far))/Math.log(10))/10.0 : camera.position.z);
  this.fingerFactor = 2;

  // `...Hands`       : integer or range given as an array of length 2
  // `...Fingers`     : integer or range given as an array of length 2
  // `...RightHanded` : boolean indicating whether to use left or right hand for controlling (if number of hands > 1)
  // `...HandPosition`: boolean indicating whether to use palm position or finger tip position (if number of fingers == 1)
  // `...Stabilized`  : boolean indicating whether to use stabilized palm/finger tip position or not

  // rotation
  this.rotateEnabled       = true;
  this.rotateSpeed         = 0.5;
  this.rotateHands         = 1;
  this.rotateFingers       = [2, 3]; 
  this.rotateRightHanded   = true;
  this.rotateHandPosition  = true;
  this.rotateStabilized    = false;
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
  this.panSpeed            = 2.0;
  this.panHands            = 2;
  this.panFingers          = [6, 12];
  this.panRightHanded      = true;
  this.panHandPosition     = true;
  this.panStabilized       = false;
  
  // internals
  var _rotateXLast         = null;
  var _rotateYLast         = null;
  var _zoomZLast           = null;
  var _panXLast            = null;
  var _panYLast            = null;
  var _panZLast            = null;
  
  var _zoomZLastBefore      = _zoomZLast;

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
      console.log (this.step);
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

    // speed controls
        var startZ         = _this.camera.position.z;
        var speedFactor    = this.zoomSpeed / startZ;
        var initialSpeed   = this.zoomSpeed;
  this.zoomCamera = function(frame) {
            
    if (_this.zoomEnabled && _this.applyGesture(frame, 'zoom')) {
      var z = _this.position(frame, 'zoom')[2];
      if (!_zoomZLast) _zoomZLast = z;
      var zDelta = z - _zoomZLast;

      var positionZ = _this.camera.position.z;

//      console.log ('lastZ: ' + _zoomZLastBefore);
//             make zoom speed smoother when getting closer to earth and higher when going away 
    if (_zoomZLast > _zoomZLastBefore && _this.zoomSpeed < 0.2)
    {}
      
    else if (_zoomZLast > _zoomZLastBefore) {
        _this.zoomSpeed = _this.zoomSpeed - 0.08;
    }
      
    else {
        _this.zoomSpeed = _this.zoomSpeed + 0.08;
    }
//      else if (positionZ < startZ * 0.75 && positionZ > startZ * 0.66) {
////         console.log('elseif1');
//         _this.zoomSpeed = (speedFactor * positionZ) / 1.5;
//      }
//      else {
////          console.log ('else');
//         _this.zoomSpeed = speedFactor * positionZ;
//      }
//      console.log ('zoomspeed: ' + _this.zoomSpeed);
//      console.log ('Z: ' + _zoomZLast);
      
      // make zoom speed smoother when getting closer to earth and higher when going away 
      
//      if (_zoom)
          
      if (positionZ > startZ) {
         _this.zoomSpeed = initialSpeed;
      }
//      
//      else if (positionZ < startZ * 0.75 && positionZ > startZ * 0.66) {
////         console.log('elseif1');
//         _this.zoomSpeed = (speedFactor * positionZ) / 1.5;
//      }
//      else if (positionZ < startZ * 0.66 && positionZ > startZ * 0.6) {
////          console.log('elseif2');
//          _this.zoomSpeed = (speedFactor * positionZ) / 4;
//      }
//      else if (positionZ < startZ * 0.6 && positionZ > startZ * 0.54) {
////          console.log('elseif3');
//          _this.zoomSpeed = (speedFactor * positionZ) / 12;
//      }
//      else if (positionZ < startZ * 0.54 && positionZ > startZ * 0.50) {
////          console.log('elseif4');
//          _this.zoomSpeed = (speedFactor * positionZ) / 20;
//      }
//      else if (positionZ < startZ * 0.50 && positionZ > startZ * 0.40) {
////          console.log('elseif5');
//          _this.zoomSpeed = (speedFactor * positionZ) / 40;
//      }
//      else if (positionZ < startZ * 0.40) {
////          console.log('elseif6');
//          _this.zoomSpeed = (speedFactor * positionZ) / 80;
//      }
//      else {
////          console.log ('else');
//         _this.zoomSpeed = speedFactor * positionZ;
//      }
//      console.log ('startz: ' + startZ);
//      console.log ('zoomspeed: ' + _this.zoomSpeed);
//      console.log ('Z: ' + positionZ);
      

      var lengthDelta = _this.zoomTransform(zDelta);
      var absoluteLength = Math.abs(lengthDelta);

      if(lengthDelta > 0) {
        var cameraHeight = _this.ellipsoid.cartesianToCartographic(_this.camera.position).height;
        var moveRate = cameraHeight / 100.0;
        console.log (moveRoate);
        _this.camera.moveForward(moveRate);
      }
      else {
        _this.camera.zoomOut(absoluteLength);
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
      _zoomZLastBefore  = _zoomZLast;
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

  this.update = function(frame) {

    if (_this.enabled) {
      _this.rotateCamera(frame);
      _this.zoomCamera(frame);
      _this.panCamera(frame);
    };
  };
};