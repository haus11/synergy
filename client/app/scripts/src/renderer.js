/* globals THREE, Renderer, document, window */

/**
* Export for require statemant
*/ 
module.exports = Renderer;


/**
* Constructor
*/
function Renderer() {
	this.SCREEN_WIDTH  = window.innerWidth;
	this.SCREEN_HEIGHT = window.innerHeight;

	this.init();
}


Renderer.prototype.init = function() {
    this.webglRenderer = new THREE.WebGLRenderer({ antialias: true });
    this.webglRenderer.setSize( this.SCREEN_WIDTH, this.SCREEN_HEIGHT );

	this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.z = 100;

    this.scene = new THREE.Scene();

    this.geometry = new THREE.SphereGeometry(50, 16, 16);
    this.material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.scene.add( this.mesh );


    document.getElementById("webglContainer").appendChild(this.webglRenderer.domElement);
};


Renderer.prototype.update = function() {
	this.webglRenderer.render(this.scene, this.camera);
};