/* globals LeapCameraController, Cesium */

/**
* Export for require statemant
*/
module.exports = LeapCameraController;


function LeapCameraController(camera, ellipsoid) {
  'use strict';

  this.camera    = camera;
  this.ellipsoid = ellipsoid;

  // api
  this.enabled      = true;
  this.target       = new Cesium.Cartesian3(0, 0, 0);
  this.step         = (camera.position.z === 0 ? Math.pow(10, (Math.log(camera.frustum.near) + Math.log(camera.frustum.far))/Math.log(10))/10.0 : camera.position.z);
  this.fingerFactor = 2;
  this.startZ       = this.camera.position.z;
  this.controlMode  = 'standard'; // 'standard' or 'flight'


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
  this.rotateSpeedInit     = this.rotateSpeed;
  
  // zoom
  this.zoomEnabled         = true;
  this.zoomSpeed           = 4.0;
  this.zoomHands           = 1;
  this.zoomFingers         = [4, 5];
  this.zoomRightHanded     = true;
  this.zoomHandPosition    = true;
  this.zoomStabilized      = true;
  this.zoomInMax           = 50;
  this.zoomOutMax          = 50000000;
  this.zoomMoveRateFactor  = 30;
  
  // pan
  this.panEnabled          = true;
  this.panSpeed            = 3.0;
  this.panHands            = 2;
  this.panFingers          = [6, 12];
  this.panRightHanded      = true;
  this.panHandPosition     = true;
  this.panStabilized       = true;
  this.panSpeedInit        = this.panSpeed;
  // camera height before panning
  this.cameraHeightZoom    = null;
  
  // internals
  this.rotateXLast         = null;
  this.rotateYLast         = null;
  this.zoomZLast           = null;
  this.panXLast            = null;
  this.panYLast            = null;
  this.panZLast            = null;  
}  
  
  
LeapCameraController.prototype.transformFactor = function(action) {
  'use strict';

  switch(action) {
    case 'rotate':
      return this.rotateSpeed * (this.rotateHandPosition ? 1 : this.fingerFactor);
    case 'zoom':
      return this.zoomSpeed * (this.zoomHandPosition ? 1 : this.fingerFactor);
    case 'pan':
      return this.panSpeed * (this.panHandPosition ? 1 : this.fingerFactor);
  }
};

LeapCameraController.prototype.mapLinear = function(x, a1, a2, b1, b2) {
  'use strict';
  return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
};

LeapCameraController.prototype.rotateTransform = function(delta) {
  'use strict';
  return this.transformFactor('rotate') * this.mapLinear(delta, -400, 400, -Math.PI, Math.PI);
};


LeapCameraController.prototype.zoomTransform = function(delta) {
  'use strict';
  return this.transformFactor('zoom') * this.mapLinear(delta, -400, 400, -this.step, this.step);
};


LeapCameraController.prototype.panTransform = function(delta) {
  'use strict';
  return this.transformFactor('pan') * this.mapLinear(delta, -400, 400, -this.step, this.step);
};


LeapCameraController.prototype.applyGesture = function(frame, action) {
  'use strict';

  var hl    = frame.hands.length;
  var fl    = frame.pointables.length;

  switch(action) {
    case 'rotate':
      if (this.rotateHands instanceof Array) {
        if (this.rotateFingers instanceof Array) {
          if (this.rotateHands[0] <= hl && hl <= this.rotateHands[1] && this.rotateFingers[0] <= fl && fl <= this.rotateFingers[1]) { 
            return true; 
          }
        } 
        else {
          if (this.rotateHands[0] <= hl && hl <= this.rotateHands[1] && this.rotateFingers === fl) { 
            return true; 
          }
        }
      } 
      else {
        if (this.rotateFingers instanceof Array) {
          if (this.rotateHands === hl && this.rotateFingers[0] <= fl && fl <= this.rotateFingers[1]) { 
            return true; 
          }
        } 
        else {
          if (this.rotateHands === hl && this.rotateFingers === fl) { 
            return true; 
          }
        }
      }
      break;
    case 'zoom':
      if (this.zoomHands instanceof Array) {
        if (this.zoomFingers instanceof Array) {
          if (this.zoomHands[0] <= hl && hl <= this.zoomHands[1] && this.zoomFingers[0] <= fl && fl <= this.zoomFingers[1]) { 
            return true; 
          }
        } 
        else {
          if (this.zoomHands[0] <= hl && hl <= this.zoomHands[1] && this.zoomFingers === fl) { 
            return true; 
          }
        }
      } 
      else {
        if (this.zoomFingers instanceof Array) {
          if (this.zoomHands === hl && this.zoomFingers[0] <= fl && fl <= this.zoomFingers[1]) { 
            return true; 
          }
        } 
        else {
          if (this.zoomHands === hl && this.zoomFingers === fl) { 
            return true; 
          }
        }
      }
      break;
    case 'pan':
      if (this.panHands instanceof Array) {
        if (this.panFingers instanceof Array) {
          if (this.panHands[0] <= hl && hl <= this.panHands[1] && this.panFingers[0] <= fl && fl <= this.panFingers[1]) { 
            return true; 
          }
        } 
        else {
          if (this.panHands[0] <= hl && hl <= this.panHands[1] && this.panFingers === fl) { 
            return true; 
          }
        }
      } 
      else {
        if (this.panFingers instanceof Array) {
          if (this.panHands === hl && this.panFingers[0] <= fl && fl <= this.panFingers[1]) { 
            return true; 
          }
        } 
        else {
          if (this.panHands === hl && this.panFingers === fl) { 
            return true; 
          }
        }
      }
      break;
  }

  return false;
};


LeapCameraController.prototype.hand = function(frame, action) {
  'use strict';

  var hds = frame.hands;
   
    if (hds.length > 0) {
      if (hds.length === 1) {
        return hds[0];
      } else if (hds.length === 2) {
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
            if (this.rotateRightHanded) {
              return rh;
            } 
            else {
              return lh;
            }
            break;
          case 'zoom':
            if (this.zoomRightHanded) {
              return rh;
            } 
            else {
              return lh;
            }
            break;
          case 'pan':
            if (this.panRightHanded) {
              return rh;
            } 
            else {
              return lh;
            }
        }
      }
    }

    return false;
};


LeapCameraController.prototype.position = function(frame, action) {
  'use strict';
  // assertion: if `...HandPosition` is false, then `...Fingers` needs to be 1 or [1, 1]
  var h;
  switch(action) {
    case 'rotate':
      h = this.hand(frame, 'rotate');
      return (this.rotateHandPosition ? (this.rotateStabilized ? h.stabilizedPalmPosition : h.palmPosition) 
        : (this.rotateStabilized ? frame.pointables[0].stabilizedTipPosition : frame.pointables[0].tipPosition)
      );
    case 'zoom':
      h = this.hand(frame, 'zoom');
      return (this.zoomHandPosition ? (this.zoomStabilized ? h.stabilizedPalmPosition : h.palmPosition) 
        : (this.zoomStabilized ? frame.pointables[0].stabilizedTipPosition : frame.pointables[0].tipPosition)
      );
    case 'pan':
      h = this.hand(frame, 'pan');
      return (this.panHandPosition ? (this.panStabilized ? h.stabilizedPalmPosition : h.palmPosition) 
        : (this.panStabilized ? frame.pointables[0].stabilizedTipPosition : frame.pointables[0].tipPosition)
      );
  }
};


LeapCameraController.prototype.rotateCamera = function(frame) {
  'use strict';

  if (this.rotateEnabled && this.applyGesture(frame, 'rotate')) {
      // if fly to modus was used, change x and y and fix the inverted new x
      var y = this.position(frame, 'rotate')[0];
     
      if (!this.rotateYLast) {
        this.rotateYLast = y;
      }
      var yDelta = y - this.rotateYLast;
      
      var n = null;

      // rotate around axis in xy-plane (in target coordinate system) which is orthogonal to camera vector
      var t = new Cesium.Cartesian3.subtract(this.camera.position, this.target);
      //var t = new THREE.Vector3().subVectors(this.camera.position, this.target); // translate
      var angleDelta = this.rotateTransform(yDelta);

      var newAngle = Cesium.Cartesian3.angleBetween(t, new Cesium.Cartesian3(0, 1, 0));
      //var newAngle = t.angleTo(new THREE.Vector3(0, 1, 0)) + angleDelta;

      if (this.rotateMin < newAngle && newAngle < this.rotateMax) {
        n = Cesium.Cartesian3.normalize(new Cesium.Cartesian3(t.z, 0, -t.x));

        this.camera.rotate(n, -angleDelta);   
      }

      var x = -this.position(frame, 'rotate')[1];
      // rotate around y-axis translated by target vector
      if (!this.rotateXLast) {
        this.rotateXLast = x;
      }
      var xDelta = x - this.rotateXLast;
      
      angleDelta = this.rotateTransform(xDelta);
      n = new Cesium.Cartesian3.normalize(new Cesium.Cartesian3(0, 1, 0));


      // rotation speed adjusting
      var cameraHeight = this.ellipsoid.cartesianToCartographic(this.camera.position).height;


      if (cameraHeight < 300) {
          this.rotateSpeed = 0.00002;
      }
      else if (cameraHeight < 2000 && cameraHeight > 300) {
          this.rotateSpeed = 0.0001;
      }
      else if (cameraHeight < 12000 && cameraHeight > 2000) {
          this.rotateSpeed = 0.003;
      }
      else if (cameraHeight < 80000 && cameraHeight > 12000) {
          this.rotateSpeed = 0.008;
      }
      else if (cameraHeight < 300000 && cameraHeight > 80000) {
          this.rotateSpeed = 0.05;
      }
      else if (cameraHeight < 500000 && cameraHeight > 300000) {
          this.rotateSpeed = 0.1;
      }
      else if (cameraHeight > 500000 && cameraHeight < 1000000) {
          this.rotateSpeed = 0.25;
      }
      else if (cameraHeight > 1000000 && cameraHeight < 2000000) {
          this.rotateSpeed = 0.5;
      }
      else if (cameraHeight > 2000000 && cameraHeight < 5000000) {
          this.rotateSpeed = 1.0;
      }
      else {
          this.rotateSpeed = this.rotateSpeedInit;
      }
    
    this.camera.rotate(n, angleDelta);


    this.rotateYLast = y;
    this.rotateXLast = x;
    this.zoomZLast   = null;
    this.panXLast    = null;
    this.panYLast    = null;
    this.panZLast    = null;      
  } 
  else {
    this.rotateYLast = null;
    this.rotateXLast = null;
  }
};

LeapCameraController.prototype.zoomCamera = function(frame) { 
  'use strict';

  if (this.zoomEnabled && this.applyGesture(frame, 'zoom')) {
    var z = this.position(frame, 'zoom')[2];
    if (!this.zoomZLast) { 
      this.zoomZLast = z;
    }
    var zDelta = z - this.zoomZLast;

    var lengthDelta = this.zoomTransform(zDelta);

    var cameraHeight = this.ellipsoid.cartesianToCartographic(this.camera.position).height;
    var moveRate = cameraHeight / this.zoomMoveRateFactor;

    if (lengthDelta > 0) {
      if (cameraHeight < this.zoomInMax) {
          //dont zoom in anymore
      }
      else {
          this.camera.moveForward(moveRate);
      }
    }
    else {
      if (cameraHeight > this.zoomOutMax) {
          //dont zoom out anymore
      }
      else {
          this.camera.moveBackward(moveRate);
      }
    }
    
    this.cameraHeightZoom = cameraHeight;


    this.zoomZLast        = z; 
    this.rotateXLast      = null;
    this.rotateYLast      = null;
    this.panXLast         = null;
    this.panYLast         = null;
    this.panZLast         = null;
  } 
  else {
    this.zoomZLast = null; 
  }
};

LeapCameraController.prototype.panCamera = function(frame) {
  'use strict';

  if (this.panEnabled && this.applyGesture(frame, 'pan')) {
    var x = this.position(frame, 'pan')[0];
    var y = this.position(frame, 'pan')[1];
    var z = this.position(frame, 'pan')[2];
    if (!this.panXLast) {
      this.panXLast = x;
    }
    if (!this.panYLast) { 
      this.panYLast = y;
    }
    if (!this.panZLast) { 
      this.panZLast = z;
    }
    var xDelta = x - this.panXLast;
    var yDelta = y - this.panYLast;


    var cameraHeight = this.ellipsoid.cartesianToCartographic(this.camera.position).height;
    
    if (cameraHeight < 10000) {
        this.panSpeed = 0.001;
    }
    if (cameraHeight < 50000 && cameraHeight > 10000) {
        this.panSpeed = 0.01;
    }
    else if (cameraHeight < 500000 && cameraHeight > 50000) {
        this.panSpeed = 0.1;
    }
    else if (cameraHeight > 500001 && cameraHeight < 1500000) {
        this.panSpeed = 0.8;
    }
    else {
        this.panSpeed = this.panSpeedInit;
    }
      
    var absoluteX = Math.abs(this.panTransform(xDelta));
  
    if(xDelta > 0) {
      this.camera.moveLeft(absoluteX);
    }
    else {
      this.camera.moveRight(absoluteX);
    }


    var absoluteY = Math.abs(this.panTransform(yDelta));

    if(yDelta > 0) {
      this.camera.moveDown(absoluteY);
    }
    else {
      this.camera.moveUp(absoluteY);
    }


    this.panXLast    = x;
    this.panYLast    = y;
    this.panZLast    = z;
    this.rotateXLast = null;
    this.rotateYLast = null;
    this.zoomZLast   = null;
  } 
  else {
    this.panXLast = null;
    this.panYLast = null;
    this.panZLast = null;     
  }
};

LeapCameraController.prototype.airplaneCamera = function(frame) {
  'use strict';

  var data = frame.data;
  if (frame.valid && data.hands.length === 1) {
    var fingers = data.pointables;
    if (fingers.length > 1) {
      data = data.hands[0];
      if (data.timeVisible > 0.75) {
        var camera = this.camera,
            movement = {},
            cameraHeight = this.ellipsoid.cartesianToCartographic(camera.position).height,
            moveRate = cameraHeight / 100.0;

        // pan - x,y
        movement.x = data.palmPosition[0];
        movement.y = data.palmPosition[2];

        //zoom - z // height above leap
        movement.z = data.palmPosition[1];

        //pitch - pitch
        var normal = data.palmNormal;
        movement.pitch = -1 * normal[2]; // leap motion has it that negative is sloping upwards
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

LeapCameraController.prototype.update = function(frame) {
  'use strict';

  if (this.enabled) {
    if (this.controlMode === 'standard') {
      this.rotateCamera(frame);
      this.zoomCamera(frame);
      this.panCamera(frame);
    }
    else if (this.controlMode === 'flight') {
      this.airplaneCamera(frame);
    }
  }
};
