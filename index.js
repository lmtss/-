function MusicPlayer3D_View(canvasFatherDom) {
    this.initThree(canvasFatherDom);
    this.initGeom();
    this.paused = false;
    this.analyser = null;
    this.dataArray = new Uint8Array(1024);
}
MusicPlayer3D_View.prototype = {
    initThree: function (canvasFatherDom) {
        // 初始化 渲染
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor("white",1);

        // 初始化 场景
        this.scene = new THREE.Scene();

        // 初始化 摄像机
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1500);
        this.camera.position.set(0, -600, 300);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        if(canvasFatherDom){
            canvasFatherDom.appendChild(this.renderer.domElement);
        }else{
            document.body.appendChild(this.renderer.domElement);
        }

        // 飞行控件
        this.flyControl = new THREE.FlyControls(this.camera);
        this.flyControl.domElement = document.body;
        this.flyControl.movementSpeed = 250;
        this.flyControl.rollSpeed = Math.PI / 6;
        this.flyControl.autoForward = false;
        this.flyControl.dragToLook = false;
        this.clock = new THREE.Clock();
        //this.flyControl = new FlyControl(this.camera);

        this.renderer.domElement.width = window.innerWidth;
        this.renderer.domElement.height = window.innerHeight;
    },
    initGeom: function () {
        var halfDegPer = Math.PI/256,
            centerRadius = 2/Math.sin(halfDegPer),
            curDeg = 0;
        var mesh,
            cube,
            material;
        // 256圆
        this.centerCircle = [];


        for(var i = 0; i < 256; i++){ //256边圆 边4 arcsin(2/r)*2*256 = 2*PI 2/r = sin(PI/256)
            cube = new THREE.CubeGeometry(2,4,2);
            material = new THREE.MeshLambertMaterial({color:"black"});
            mesh = new THREE.Mesh(cube, material);

            mesh.position.x = (centerRadius + 2)*Math.sin(curDeg);
            mesh.position.y = 0 + (centerRadius + 2)*Math.cos(curDeg);
            //mesh.rotation.z = -curDeg;
            mesh.rotation.x = Math.PI/2;
            this.centerCircle[i] = mesh;
            this.scene.add(mesh);
            curDeg += halfDegPer * 2;
        }
    },
    canvasDom: function () {
        return this.renderer.domElement;
    },
    update: function () {
        if(this.analyser){
            var dataArray = this.dataArray,
                start = 128,
                max = 0,
                min = 256;
            this.analyser.getByteFrequencyData(dataArray);
            //console.log(dataArray);
            for(var i = start; i < start + 256; i++){
                max = (dataArray[i] > max)?dataArray[i]:max;
                min = (dataArray[i] < min)?dataArray[i]:min;
            }
            max -= min;
            for(var i = start; i < start + 256; i++){
                var val = dataArray[i] - min;
                val /= max;
                val = val*80/4;
                val = (val > 1)?val:1;
                var h = dataArray[i]/256*60/4;
                h = (h > 1)?h:1;
                this.centerCircle[i-start].scale.set(1,val,1);

            }
        }
    },
    render: function () {
        if(!this.paused){
            this.renderer.clear();
            this.update();
            this.renderer.render(this.scene, this.camera);
            //this.flyControl.update(this.clock.getDelta());
        }
    },
    changeRenderState: function () {
        this.paused = !this.paused;
    },
    changeAnalyser: function (analy) {
        console.log("sss");
        this.analyser = analy;
    },



}

function MusicPlayer3D_Controller(view){
    this.init();
    this.searchList = null;
    this.audio = document.createElement("audio");
    //this.audio.src = "unity.mp3";
    document.body.appendChild(this.audio);
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    this.isSrcEmpty = true;
    this.view = view;
    this.changeOtherState = function () {
        view.changeRenderState();
    };
    //this.changePlayState();
    this.changeAudio("unity.mp3",null);
}
MusicPlayer3D_Controller.prototype = {
    init: function () {

        var mod = this;

        // 搜索歌曲面板
        var searchPanel = document.getElementsByClassName("search_panel")[0];
        // 搜索框
        var searchInput = document.getElementById("search_input");
        searchInput.onkeydown = function (e) {
            var currKey=0,
                e=e||event;
            currKey=e.keyCode||e.which||e.charCode;

            if(currKey === 13){
                mod.inputEnterEevnt();
                return false;
            }
            return true;
        };
        // 搜索结果列表
        var searchList = document.getElementById("search_list");
        searchList.addEventListener("click", function (ev) {
            var event = ev || window.event,
                target = event.target || event.srcElement,
                order;
            if (target.nodeName === 'LI') {
                order = parseInt(target.getElementsByTagName("div")[0].innerText);
            }else if(target.nodeName === 'DIV'){
                order = parseInt(target.parentNode.getElementsByTagName("div")[0].innerText);
            }
            mod.clickLi(order);
        },true);


        // 播放/暂停 按钮
        var playButton = document.getElementById("play_button");
        this.colorfulCircle = new ColorfulCircle(document.getElementById("play_button"), window.innerHeight*0.15,window.innerHeight*0.15,1.2);
        playButton.addEventListener("click",function () {
            mod.clickPlayButton();
        });

        // 打开/关闭 搜索歌曲面板
        var searchPanelButton = document.getElementById("search_panel_button");
        searchPanelButton.addEventListener("click",function () {
            if(searchPanel.classList.contains("search_panel_rotated")){
                searchPanel.classList.remove("search_panel_rotated");
            }else{
                searchPanel.classList.add("search_panel_rotated");
            }
        });
        // 关闭 搜索歌曲面板
        var searchPanelClose = document.getElementById("search_close_button");
        searchPanelClose.addEventListener("click",function () {
            if(searchPanel.classList.contains("search_panel_rotated")){
                searchPanel.classList.remove("search_panel_rotated");
            }else{
                searchPanel.classList.add("search_panel_rotated");
            }
        });
    },
    initAnaly: function () {
        try{
            this.audio_context_ = new AudioContext();
        }catch (e){
            alert("不支持audio context！！");
        }

        this.source_ = this.audio_context_.createMediaElementSource(this.audio);
        this.analyser_ = this.audio_context_.createAnalyser();
        this.source_.connect(this.analyser_);
        this.analyser_.connect(this.audio_context_.destination);

        this.analyser_.fftSize = 1024;
        //this.data_array_ = new Uint8Array(this.analyser_.fftSize);
    },
    inputEnterEevnt:function () {
        var text = document.getElementById("search_input").innerText;
        if(text){
            if(text.length > 0){
                MusicV1.searchIdByName(text, function (res, mod) {
                    mod.fillList(res);
                }, this);
            }
        }
    },
    fillList:function (res) {
        var ul = document.getElementById("search_list"),
            songCount = res.result.songCount,
            songs = res.result.songs,
            li,
            div,
            song,
            array;
        this.searchList = [];
        for(var i = 0; i < ((songCount <= 15)?songCount:15); i++){

            song = songs[i];

            this.searchList[i] = song.id;

            li = document.createElement("li");
            ul.appendChild(li);

            div = document.createElement("div");
            div.classList.add("search_list_order");
            div.innerText = i + 1;
            li.appendChild(div);

            div = document.createElement("div");
            div.classList.add("search_list_title");
            div.innerText = song.name;
            li.appendChild(div);

            div = document.createElement("div");
            div.classList.add("search_list_singer");

            for(var j = 0; j < song.ar.length; j++){
                div.innerText += song.ar[j].name;
                if(j != song.ar.length - 1){
                    div.innerText += "/";
                }
            }

            li.appendChild(div);

            div = document.createElement("div");
            div.classList.add("search_list_album");
            div.innerText = song.al.name;
            li.appendChild(div);

            /*div = document.createElement("div");
            div.classList.add("search_list_time");
            div.innerText = song.name;
            li.appendChild(div);*/
        }

        res = null;
    },
    clickLi: function (order) {
        MusicV1.getUrlById(this.searchList[order - 1], function (res, mod) {
            mod.changeAudio(res.data[0].url, res.data[0].size);
            res = null;
        },this);
    },
    changeAudio: function (url, size) {
        this.audio.src = url;
        var mod = this;
        this.audio.onload = function () {
            /*alert();
            mod.audio.play();
            mod.isSrcEmpty = false;
            console.log( mod.audio.src);
            mod.initAnaly();
            mod.view.changeAnalyser( mod.analyser_);*/
        }
        mod.audio.play();
        mod.isSrcEmpty = false;
        console.log( mod.audio.src);
        mod.initAnaly();console.log("mod");
        mod.view.changeAnalyser(mod.analyser_);

    },
    changePlayState: function () {
        if(this.audio.paused){
            this.audio.play();
        }else{
            this.audio.pause();
        }
    },
    clickPlayButton: function () {
        if(this.isSrcEmpty){

        }else{
            this.changePlayState();
        }
        this.colorfulCircle.changePlay();
        this.changeOtherState();
    }
}

function MusicPlayer3D(canvasFatherDom) {
    canvasFatherDom = canvasFatherDom || null;
    this.init(canvasFatherDom);
    this.play();
}
MusicPlayer3D.prototype = {
    init: function (canvasFatherDom) {
        this.view = new MusicPlayer3D_View(canvasFatherDom);
        var view = this.view;
        this.controller = new MusicPlayer3D_Controller(view);
    },
    play: function () {
        var view = this.view;
        function render() {
            view.render();
            requestAnimationFrame(render);
        }
        render();
    }
}
var test = new MusicPlayer3D();