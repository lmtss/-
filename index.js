function MusicPlayer3D_View(canvasFatherDom) {
    this.initThree(canvasFatherDom);
    this.initGeom();
    this.paused = false;
    this.analyser = null;
    this.dataArray = new Uint8Array(1024);
    this.hasLyric = false;
    this.centerLyric = null;
}
MusicPlayer3D_View.prototype = {
    initThree: function (canvasFatherDom) {
        // 初始�?渲染
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor("white",1);

        // 初始�?场景
        this.scene = new THREE.Scene();

        // 初始�?摄像�?
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1500);
        this.camera.position.set(0, -600, 200);
        this.camera.up = new THREE.Vector3(0,0,1);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        if(canvasFatherDom){
            canvasFatherDom.appendChild(this.renderer.domElement);
        }else{
            document.body.appendChild(this.renderer.domElement);
        }
        this.curDeg = 0;

        // 飞行控件
       /* this.flyControl = new THREE.FlyControls(this.camera);
        this.flyControl.domElement = document.body;
        this.flyControl.movementSpeed = 250;
        this.flyControl.rollSpeed = Math.PI / 6;
        this.flyControl.autoForward = false;
        this.flyControl.dragToLook = false;
        this.clock = new THREE.Clock();*/


        this.renderer.domElement.width = window.innerWidth;
        this.renderer.domElement.height = window.innerHeight;
    },
    createColorfulMaterial: function () {
        return new THREE.ShaderMaterial({
            uniforms: {
                //c : {type: "f", value: 1.0},
                //time : {type: "f", value: 0.1},
                resolution : {type: "v2", value: new THREE.Vector2(this.renderer.domElement.width/3,this.renderer.domElement.height)},
                //radius : {type: "f", value: 1.0}
            },
            vertexShader: 'void main() {\n' +
            '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, position.z, 1.0);\n' +
            '}\n',
            fragmentShader:
            "uniform vec2 resolution;"+
            "void main(){\n" +
            "float p = (gl_FragCoord.x-resolution.x)/resolution.x;\n" +
                ""+
            "gl_FragColor = vec4(p,0.8,0.2,1.0);\n" +
            "}",
            transparent: true,
            side: THREE.DoubleSide

        });
    },
    initGeom: function () {
        var halfDegPer = Math.PI/256,
            centerRadius = 2/Math.sin(halfDegPer),
            curDeg = 0;
        var mesh,
            cube,
            material;
        // 256�?
        this.centerCircle = [];
        for(var i = 0; i < 256; i++){ //256边圆 �? arcsin(2/r)*2*256 = 2*PI 2/r = sin(PI/256)
            cube = new THREE.CubeGeometry(2,4,2);
            //material = new THREE.MeshLambertMaterial({color:"black"});
            material = this.createColorfulMaterial();
            mesh = new THREE.Mesh(cube, material);

            mesh.position.x = (centerRadius + 2)*Math.sin(curDeg);
            mesh.position.y = 0 + (centerRadius + 2)*Math.cos(curDeg);
            mesh.position.z = 0;

            mesh.rotation.x = Math.PI/2;
            this.centerCircle[i] = mesh;
            this.scene.add(mesh);
            curDeg += halfDegPer * 2;
        }

        // “山�?
        // test textgeom

        this.canvasMap = document.createElement("canvas");


        this.lyricPlaneMaterial = new THREE.MeshBasicMaterial({
            map: new THREE.Texture(this.canvasMap)
        });
        this.lyricPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(256,128),
            this.lyricPlaneMaterial
        );
        this.lyricPlane.position.y = -300;
        this.scene.add(this.lyricPlane);
        this.canvasMap.width = 512;
        this.canvasMap.height = 256;
        this.ctx = this.canvasMap.getContext("2d");
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0,0,512,256);
        this.lyricPlaneMaterial.map.needsUpdate = true;
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
            this.curDeg += Math.PI/256/10;

            this.camera.position.set(600 * Math.sin(this.curDeg), -600* Math.cos(this.curDeg), 200);
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
            this.updateLyric();

            this.lyricPlane.position.x = 300 * Math.sin(this.curDeg);
            this.lyricPlane.position.y = -300 * Math.cos(this.curDeg);
            this.lyricPlane.rotation.z = this.curDeg;



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
        this.analyser = analy;
    },
    /*createTextGeom: function (str) {
        return new THREE.TextGeometry(str, {
            size: 90,
            height: 30,
            curveSegments: 12,
            font: null,
            fontName:"helvetiker"
        });
    },*/
    changeLyric: function (res) {
        if(res.code!=200 || res.hasOwnProperty("nolyric")){
            this.hasLyric = false;
        }else{

            var lyric,
                start,
                timeEnd;
            if(res.tlyric.lyric){
                lyric = res.tlyric.lyric.split("\n");
            }else{
                lyric = res.lrc.lyric.split("\n");
            }
            /*for(var i = 0; i < lyric.length; i++){
                if(parseInt(lyric[i][1])){
                    start = i;
                    break;
                }
            }*/
            start = 1;
            console.log("timeEnd: " + lyric[1][9]);
            if(lyric[1][9] == "]"){
                timeEnd = 8;
            }else{
                timeEnd = 9;
            }
            this.lyric = [];
            for(var i = 1; i < lyric.length; i++){
                var times = lyric[i].slice(1,9);
                this.lyric.push({
                    time:parseInt(times.slice(0,2))*60*100 + parseInt(times.slice(3,5))*100 + parseInt(times.slice(6,8)),
                    str:lyric[i].slice(timeEnd + 2)
                });
            }
            console.log(start);
            console.log(this.lyric);
            this.hasLyric = true;
            this.centerLyric = 0;
        }

    },
    updateLyric:function () {
        if(this.hasLyric){
            //var durationTime = this.audio.duration;
            var currentTime = Math.floor(this.audio.currentTime*100);
            //console.log("ct " + currentTime + " t " + this.lyric[0].time );
            for(var i = 0; i < this.lyric.length; i++){
                if(Math.abs(currentTime - this.lyric[i].time) < 10){
                    this.moveLyric(i);
                    /*if(i != this.centerLyric){
                        this.moveLyric(i);
                    }*/
                }
            }

        }
    },
    moveLyric:function (i) {
        this.centerLyric = i;
        var ctx = this.ctx,
            str = this.lyric[i].str;
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,512,256);

        ctx.fillStyle = "black";


        var width = ctx.measureText(str).width;
        if(width < 512){
            ctx.font = "16pt Arial";
            ctx.fillText(str, (512 - width)/2, 160);
        }else{
            ctx.font = "" + Math.floor(16*500/width) + "pt Arial";
            ctx.fillText(str, (512 - ctx.measureText(str).width)/2, 160);
        }


        this.lyricPlaneMaterial.map.needsUpdate = true;
    },
    changeAudio:function (audio) {
        this.audio = audio;
    }



}

function MusicPlayer3D_Controller(view){
    this.init();
    this.searchList = null;
    this.audio = document.createElement("audio");
    //this.audio.src = "unity.mp3";
    document.body.appendChild(this.audio);
    this.isSrcEmpty = true;
    this.view = view;
    this.changeOtherState = function () {
        view.changeRenderState();
    };
    this.testPlay();
    view.changeAudio(this.audio);
}
MusicPlayer3D_Controller.prototype = {
    init: function () {

        var mod = this;

        // 搜索歌曲面板
        var searchPanel = document.getElementsByClassName("search_panel")[0];
        // 搜索�?
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
        document.getElementById("play_button").insertBefore(this.colorfulCircle.dom(), document.getElementById("play_button_img"));
        playButton.addEventListener("click",function () {
            mod.clickPlayButton();
        });
        this.drawStopPlayButton();


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
                    mod.clearList();
                    mod.fillList(res);
                }, this);
            }
        }
    },
    clearList: function () {
        var ul = document.getElementById("search_list");
        ul.innerHTML = "";
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
            this.searchList[i] = {
                id: song.id,
                title: song.name,
                singer:div.innerText,
                album:song.al.name
            };

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
        MusicV1.getUrlById(this.searchList[order - 1].id, function (res, mod) {
            //console.log(res);
            mod.changeAudio(res.data[0].url, res.data[0].size, mod.searchList[order - 1].title, mod.searchList[order - 1].singer,mod.searchList[order - 1].album);
            //res = null;
        },this);
        MusicV1.getLyricById(this.searchList[order - 1].id, function (res, mod) {
            //console.log(res);
            mod.view.changeLyric(res);
            res = null;
        },this);
    },
    changeAudio: function (url, size, title, singer, album) {
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
        //console.log("tt " + title + " " + singer);
        document.getElementById("title").innerHTML = title;
        document.getElementById("singer").innerHTML = "歌手:"+ singer;
        document.getElementById("album").innerHTML = "专辑:"+ album;
        //alert(document.getElementById("title").innerHTML);
        mod.initAnaly();
        mod.view.changeAnalyser(mod.analyser_);
        this.drawPlayButton();


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
        if(this.audio.paused){
            this.drawStopPlayButton();
        }else{
            this.drawPlayButton();
        }
        this.changeOtherState();
    },
    testPlay: function () {
        var TESTLYRIC = {"sgc":true,"sfy":true,"qfy":false,"transUser":{"id":600349,"status":0,"demand":1,"userid":37114165,"nickname":"rainstone0513","uptime":1446803756198},"lrc":{"version":22,"lyric":"[00:00.00] ä½œæ›�?: asuï¼ˆthe new classicsï¼‰\n[00:00.223] ä½œè¯ : æ¸¡éƒ¨ç´«ç·’\n[00:00.670]Stand up together å‹�?ã†ã�?ãå§�?ã¯ã˜)ã‚ã�?é¡˜(ã­ãŒ)ã„\n[00:10.080]Whenever,Wherever æ–�?ã‚ã‚�?ãŸãªæ—…ç«�?ãŸã³ã )ã¡ è¿Ž(ã‚€ã�?ãˆã‚ˆã†\n[00:30.800]å¤±(ã†ã—ã�?ã„ã‹ã‘ã¦ã„ã�?Soul å‘�?ã‚�?ã³è¦š(ã�?ã¾ã—ã�?Confide in you\n[00:39.980]ä¸ç¢º(ãµãŸã�?ã‹ãªæœªæ�?ã¿ã‚‰ã�?ã•ã�?ä¿¡(ã—ã‚�?ã˜ã‚‰ã‚Œã‚�?The testify\n[00:49.700]\n[00:49.930]å…�?ã¨ã‚�?ã«ã—ãŸæ—¥ã€�?ã²ã³)ã‚�?ä¸�?ã²ã¨)ã¤ã€äº�?ãµãŸ)ã¤ã¨ é›�?ã‚ã�?ã‚\n[00:59.390]å’�?ã�?ã„ã�?ã¬ãã‚‚ã‚�?å¼·(ã¤ã‚�?ã æ¡(ã«ãŽ)ã‚Šã—ã‚\n[01:10.200]Whenever,Wherever äº�?ãŸãŒ)ã„ã«å¯�?ã‚�?ã‚Šæ·�?ã)ã„\n[01:18.520]æ(ãŠã)ã‚Œã‚‹äº�?ã“ã�?ãªã©ãªã�?é—�?ã‚„ã�?ãŒ äºŒäºº(ãµãŸã‚�?åˆ�?ã‚�?ã‹ã¤ã¨ã‚‚\n[01:28.880]ç¢º(ãŸã�?ã‹ãªé¼“å‹�?ã“ã©ã�?ãŒ ãã†å‘�?ã¤)ã’ã¦ã„ã‚‹ã‹ã‚‰\n[01:38.410]å†�?ãµãŸãŸ)ã³å‡ºä¼�?ã§ã�?ãˆã‚‹ã¾ã�?æƒ³(ãŠã‚�?ã„ã‚�?ã©ã†ã�?å�?ãã¿)ã¨å…�?ã¨ã‚�?ã«\n[01:59.730]å¾®(ã‹ã™ã�?ã‹ã«æ�?ã„ã�?ã¥ã„ã�?Hope è¿½(ãŠ)ã„ã‹ã‘ã¦ã�?Rely on you\n[02:09.369]ä¸å®�?ãµã‚ã‚�?ã‹ãæ¶�?ã�?ã™ã‚ˆã†ã�?å�?ãã¿)ã‚’è¦�?ã¿)ã¤ã‘ã�?Tragic fate\n[02:19.800]ã“ã“ã«ã„ã‚‹æ„å‘�?ã„ã�?ã‚�?å¼·(ã¤ã‚�?ãã€å¼�?ã¤ã‚�?ã å™�?ã�?ã¿ç· (ã�?ã‚\n[02:29.100]èƒŒè² (ã›ã�?ã�?é‹å‘�?ã†ã‚“ã‚ã�? å �?ã‹ã�?ã ã¤ãªãŽã¨ã‚\n[03:16.800]Stand up together äº�?ãŸãŒ)ã„ã«æ‰�?ã¦)ã‚’å�?ã¨)ã‚Š\n[03:25.840]æ€�?ãŠã³)ãˆã‚‹äº�?ã“ã�?ãªã©ãªã�?å…�?ã²ã‹ã‚�? å¥ª(ã†ã�?ã„åŽ�?ã�?ã‚‰ã‚Œã¦ã‚‚\n[03:37.100]é‡�?ã‹ã�?ãªã‚‹æ€(ãŠã‚�?ã„ã�?è¦š(ãŠã¼)ãˆã¦ã„ã‚‹ã‹ã‚‰\n[03:46.380]å†�?ãµãŸãŸ)ã³å‡ºä¼�?ã§ã�?ãˆã‚‹ã¾ã�?æ•�?ã™ã�?ã„ã‚�?ã©ã†ã�?å�?ãã¿)ã®ãŸã‚\n[03:57.200]\n[03:57.510]Whenever,Wherever äº�?ãŸãŒ)ã„ã«å¯�?ã‚�?ã‚Šæ·�?ã)ã„\n[04:06.420]æ(ãŠã)ã‚Œã‚‹äº�?ã“ã�?ãªã©ãªã�?é—�?ã‚„ã�?ãŒ äºŒäºº(ãµãŸã‚�?åˆ�?ã‚�?ã‹ã¤ã¨ã‚‚\n[04:17.130]ç¢º(ãŸã�?ã‹ãªé¼“å‹�?ã“ã©ã�?ãŒ ãã†å‘�?ã¤)ã’ã¦ã„ã‚‹ã‹ã‚‰\n[04:27.100]å†�?ãµãŸãŸ)ã³å‡ºä¼�?ã§ã�?ãˆã‚‹ã¾ã�?æƒ³(ãŠã‚�?ã„ã‚�?ã©ã†ã�?å�?ãã¿)ã¨å…�?ã¨ã‚�?ã«\n"},"klyric":{"version":12,"lyric":null},"tlyric":{"version":1,"lyric":"[by:RainStone0513]\n"+
                    "[00:00.670]站在一�?愿望由此转动\n"+
            "[00:10.080]无论何时 去迎接那崭新的旅途吧\n"+
            "[00:30.800]即将消逝的灵魂 因你的信赖而得以复苏\n"+
            "[00:39.980]就连模糊的未�?亦是能信任的证据\n"+
            "[00:49.930]逐一聚集起共同度过的时光\n"+
            "[00:59.390]紧紧握住从中绽放的温暖\n"+
            "[01:10.200]无论何时 你我互相依偎\n"+
            "[01:18.520]再也无所畏惧 哪怕黑暗将两人分开\n"+
            "[01:28.880]因为鸣亮的心跳声正如此宣告\n"+
            "[01:38.410]直至再度与你相�?思念�? 惟愿伴君左右\n"+
            "[01:59.730]奄奄一息的希望 依靠你的力量去追赶\n"+
            "[02:09.369]为了消除所有不�?悲惨的命运让我遇见你\n"+
            "[02:19.800]紧紧地咬住存在此地的意义\n"+
            "[02:29.100]坚固地维系起身负的命运\n"+
            "[03:16.800]站在一�?牵起彼此的手\n"+
            "[03:25.840]再也不用惴惴不安 纵使失去了一切光芒\n"+
            "[03:37.100]因为我们仍记得那重重交织的思念\n"+
            "[03:46.380]直至再度与你相�?挽救�? 但愿为了你\n"+
            "[03:57.510]站在一�?你我互相依偎\n"+
            "[04:06.420]再也无所畏惧 哪怕黑暗将两人分开\n"+
            "[04:17.130]因为鸣亮的心跳声正如此宣告\n[04:27.100]直至再度与你相�?思念�? 惟愿伴君左右\n"},"code":200};
        this.view.changeLyric(TESTLYRIC);
        this.changeAudio("unity.mp3",null,"unity","コミネリ�?","Resuscitated Hope");
    },
    drawStopPlayButton: function () {
        var canvas = document.getElementById("play_button_img");
        canvas.width = window.innerHeight*0.15;
        canvas.height = window.innerHeight*0.15;
        var ctx = canvas.getContext("2d");
        var wid = canvas.width*0.45,
            gen3 = 1.732;
        ctx.fillStyle = "white";
        ctx.moveTo(canvas.width/2 - wid/2/gen3, canvas.height/2 - wid/2);
        ctx.lineTo(canvas.width/2 + wid/gen3, canvas.height/2);
        ctx.lineTo(canvas.width/2 - wid/2/gen3, canvas.height/2 + wid/2);
        ctx.lineTo(canvas.width/2 - wid/2/gen3, canvas.height/2 - wid/2);
        ctx.fill();
    },
    drawPlayButton: function () {
        var canvas = document.getElementById("play_button_img");
        canvas.width = window.innerHeight*0.15;
        canvas.height = window.innerHeight*0.15;
        var ctx = canvas.getContext("2d");
        var wid = canvas.width*0.45,
            gen3 = 1.732;
        ctx.fillStyle = "white";
        ctx.fillRect(canvas.width*0.34, canvas.height*0.3, canvas.width*0.08, canvas.height*0.4);
        ctx.fillRect(canvas.width*0.58, canvas.height*0.3, canvas.width*0.08, canvas.height*0.4);
    },
    update: function () {
        var curTime = this.audio.currentTime,
            duration = this.audio.duration;
        //console.log("cur " + curTime + "  d " + duration);
        //bar
        var bar = document.getElementById("current_bar");
        bar.style.width = "" + curTime/duration*window.innerWidth*0.55 + "px";
        //cur
        var minutes = Math.floor(curTime/60);
        var sec = Math.floor(curTime) - minutes*60;
        if(sec < 10){
            sec = "0" + sec;
        }else{
            sec = "" + sec;
        }
        if(minutes < 10){
            minutes = "0" + minutes;
        }else{
            minutes = "" + minutes;
        }
        sec = minutes + ":" + sec;
        document.getElementById("current_time").innerHTML = sec;

        var minutes = Math.floor(duration/60);
        var sec = Math.floor(duration) - minutes*60;
        if(sec < 10){
            sec = "0" + sec;
        }else{
            sec = "" + sec;
        }
        if(minutes < 10){
            minutes = "0" + minutes;
        }else{
            minutes = "" + minutes;
        }
        sec = minutes + ":" + sec;
        document.getElementById("duration_time").innerHTML = sec;


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
        var controller = this.controller;
        function render() {
            controller.update();
            view.render();
            requestAnimationFrame(render);
        }
        render();
    }
}
var test = new MusicPlayer3D();
