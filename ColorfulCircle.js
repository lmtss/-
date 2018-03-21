function ColorfulCircle(canvasFatherDom,width,height,radius) {
    this.canvasFatherDom = canvasFatherDom || document.body;
    this.width = width || window.innerWidth;
    this.height = height || window.innerHeight;
    this.radius = radius || 1.0;
    this.isPlay = true;
    this.init();
    var mod = this;
    function render() {
        mod.render();
        requestAnimationFrame(render);
    }
    render();
}
ColorfulCircle.prototype.init = function () {
    this.initThree();
    this.initObject();
}
ColorfulCircle.prototype.initThree = function () {
    // 初始化 渲染
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor("white",1);

    // 初始化 场景
    this.scene = new THREE.Scene();

    // 初始化 摄像机
    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 1500);
    this.camera.position.set(0, 0, 200);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.canvasFatherDom.appendChild(this.renderer.domElement);
}
ColorfulCircle.prototype.createM5 = function () {
    return new THREE.ShaderMaterial({
        uniforms: {
            c : {type: "f", value: 1.0},
            time : {type: "f", value: 0.1},
            resolution : {type: "v2", value: new THREE.Vector2(this.renderer.domElement.width,this.renderer.domElement.height)},
            radius : {type: "f", value: this.radius}
        },
        vertexShader: 'void main() {\n' +
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, position.z, 1.0);\n' +
        '}\n',
        fragmentShader:
        "uniform float time;"+
        "uniform vec2 resolution;"+
        "uniform float c;"+
        "uniform float radius;"+
        "void main(){\n"+
        "vec2 p = (2.0 * gl_FragCoord.xy - resolution.xy)/resolution.y;"+
        "float tau = 3.1415926535*2.0;  \n" +
        "float a = atan(p.x,p.y);  \n" +
        "float r = length(p)*0.75;  \n" +
        "vec2 uv = vec2(a/tau,r);  \n" +
        "float xCol = (uv.x - (time / 3.0)) * 3.0;  \n" +
        "xCol = mod(xCol, 3.0);  \n" +
        "vec3 horColour = vec3(0.25, 0.25, 0.25);  \n" +
        "  \n" +
        "if (xCol < 1.0) {  \n" +
        "    horColour.r += 1.0 - xCol;  \n" +
        "    horColour.g += xCol;  \n" +
        "} else if (xCol < 2.0) {  \n" +
        "    xCol -= 1.0;  \n" +
        "    horColour.g += 1.0 - xCol;  \n" +
        "    horColour.b += xCol;  \n" +
        "} else {  \n" +
        "    xCol -= 2.0;  \n" +
        "    horColour.b += 1.0 - xCol;  \n" +
        "    horColour.r += xCol;  \n" +
        "}  "+
            //"if(uv.y)"+
            "uv = (2.0 * uv) - radius;  \n" +
        "    float beamWidth = abs(1.0 / (30.0 * uv.y));  \n" +
        "    vec3 horBeam = vec3(beamWidth,beamWidth,beamWidth);  \n" +
    "gl_FragColor = vec4((( horBeam)* horColour ), 1.0);\n"+
        "}\n",
        transparent: true,
        side: THREE.DoubleSide
    });
}
ColorfulCircle.prototype.addV5 = function () {
    this.testM = this.createM5();
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(200, 200), this.testM));
}
ColorfulCircle.prototype.initObject = function () {
    this.addV5();
}
ColorfulCircle.prototype.render = function () {
    if(this.isPlay){
        this.renderer.clear();
        //this.zz.rotation.z += Math.PI/36;
        this.testM.uniforms["c"].value = 0.2;
        //document.getElementById("print").innerHTML = this.testM.uniforms["time"].value;
        if(this.testM.uniforms["time"].value >= 6.0)
            this.testM.uniforms["time"].value = 0.0;
        else
            this.testM.uniforms["time"].value += 0.02;
        this.renderer.render(this.scene, this.camera);
    }else{

    }

}
ColorfulCircle.prototype.stop = function () {
    this.isPlay = false;
}
ColorfulCircle.prototype.play = function () {
    this.isPlay = true;
}
ColorfulCircle.prototype.changePlay = function () {
    this.isPlay = !this.isPlay;
}
ColorfulCircle.prototype.dom = function () {
    return this.renderer.domElement;
}


