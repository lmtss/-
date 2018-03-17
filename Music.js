(function (global) {
    global.MusicV1 = new Object();
    var mdzz = "lmtss.free.wtbidc202.cn";
    var APIoptions = ["api.imjad.cn"];
    var DefaultAPIoption = "api.imjad.cn";
    var MusicV1 = global.MusicV1;
    MusicV1.searchIdByName = function (name,callback,mod) {
        $.ajax({
            url:"http://"+mdzz+"/MusicV1/API1/search.php?type=search&s=" + name,
            success:function (res) {
                callback(res,mod);
            }
        });
    };
    MusicV1.getUrlById = function (id,callback,mod) {
        $.ajax({
            url:"http://"+mdzz+"/MusicV1/API1/urlById.php?type=song&id="+ id +"&br=128000",
            success:function (res) {
                callback(res,mod);
            }
        });
    };
    MusicV1.getLyricById = function (id,callback,mod) {
        $.ajax({
            url:"http://"+mdzz+"/MusicV1/API1/lyricById.php?type=lyric&id="+ id,
            success:function (res) {
                callback(res,mod);
            }
        });
    };
})(this);
var test_id = {"data":[{"id":29307041,"url":"https:\/\/m7.music.126.net\/20180317140437\/83f0d2de1261b3921b6b0893dd1546a6\/ymusic\/1f2e\/acda\/5358\/590cf6063232db1b861cff50de5b4bfe.mp3","br":128000,"size":4296831,"md5":"590cf6063232db1b861cff50de5b4bfe","code":200,"expi":1200,"type":"mp3","gain":-2.4500000000000002,"fee":0,"uf":null,"payed":0,"flag":0,"canExtend":false}],"code":200};
var test_lyric = {"sgc":false,"sfy":true,"qfy":false,"transUser":{"id":29307041,"status":0,"demand":1,"userid":9503671,"nickname":"绯色之梦","uptime":1443852303440},"lyricUser":{"id":29307041,"status":0,"demand":0,"userid":360986,"nickname":"Mit_無限","uptime":1443851338559},"lrc":{"version":19,"lyric":"[by:_极限意识流]\n[00:19.87]決めつけばかり 自惚れを着た\n[00:24.67]チープなhokoriで 音荒げても\n[00:29.53]棚に隠した 哀れな\n[00:34.28]恥に濡れた鏡の中\n[00:38.81]都合の傷だけひけらかして\n[00:43.56]手軽な強さで勝取る術を\n[00:48.57]どれだけ磨いでも気はやつれる\n[00:53.22]ふらついた思想通りだ\n[00:57.26]愛-same-CRIER\n[00:59.71]愛撫-save-LIAR\n[01:02.27]Eid-聖-Rising HELL\n[01:04.57]愛してる Game世界のDay\n[01:07.72]Don't-生-War\n[01:09.36]Lie-兵士-War-World\n[01:11.80]Eyes-Hate-War\n[01:14.23]A-Z Looser-Krankheit\n[01:17.02]Was IS das?\n[01:27.81]受け売り盾に 見下してても\n[01:32.68]そこには地面しかない事さえ\n[01:37.62]気付かぬままに 壊れた\n[01:42.26]過去に負けた鏡の奥\n[01:46.50]「どこま」で叫べば位置を『知れる』\n[01:51.70]『とどめ』もないまま息が「切れる」\n[01:56.46]堂々さらした罪の群れと 後ろ向きにあらがう\n[02:05.32]愛-same-CRIER\n[02:07.71]愛撫-save-LIAR\n[02:10.16]Eid-聖-Rising HELL\n[02:13.02]I'll-ness Reset\n[02:14.93]Endじゃない Burst\n[02:16.38]Don't-生-War\n[02:17.67]Lie-兵士-War-World\n[02:20.13]Eyes-Hate-War\n[02:22.59]A-Z 想像High-de\n[02:24.23]Siehst YOU das?\n[02:44.28]偽の態度な 臆病Loud Voice\n[02:48.62]気高さを 勘違いした心臓音\n[02:53.71]狙い通りの 幻見ても\n[02:58.11]満たせない 何度も目を開けても\n[03:03.96]『どこまで』叫べば位置を『知れる』\n[03:09.26]『とどめ』もないまま息が「切れる」\n[03:14.08]堂々さらした罪の群れと 後ろ向きにあらがう\n[03:22.78]愛-same-CRIER\n[03:25.43]愛撫-save-LIAR\n[03:27.98]Eid-聖-Rising HELL\n[03:30.13]愛してる Game世界のDay\n[03:32.88]Don't-生-War\n[03:35.14]Lie-兵士-War-World\n[03:37.38]Eyes-Hate-War\n[03:39.83]A-Z Looser-Krankheit\n[03:41.98]Was IS das?\n[03:43.52]Leben, was ist das?\n[03:45.73]Signal, Siehst du das?\n[03:48.13]Rade, die du nicht weisst\n[03:50.49]Aus eigenem Willen\n[03:52.99]Leben, was ist das?\n[03:55.34]Signal, Siehst du das?\n[03:57.80]Rade, die du nicht weisst\n[04:00.18]Sieh mit deinen Augen\n"},"klyric":{"version":0},"tlyric":{"version":5,"lyric":"[by:_极限意识流]\n[00:19.87]单纯自负地妄下决断 充满猜测臆想\n[00:24.67]大声地 肆意宣扬这份荣耀\n[00:29.53]隐藏在架子上 真是可怜哪\n[00:34.28]沾濡羞愧耻辱的镜子里面\n[00:38.81]炫耀着刻意留下的伤痕\n[00:43.56]透过轻薄虚伪的坚强 所能得到的这些人生\n[00:48.57]再怎样磨练也只有病入膏肓\n[00:53.22]正是这些摇摆不羁的思想 带你入穷途末路\n[00:57.26]爱有如哭泣着的人\n[00:59.71]在抚慰中拯救谎言\n[01:02.27]神圣誓言也能创造地狱\n[01:04.57]深爱着啊 这有如棋盘上的每一天\n[01:07.72]请不要再制造战争 然后回过头来\n[01:09.36]欺骗士兵 诉说着 我们都生存在战争之中\n[01:11.80]人们的目光早已无法 再接受战争\n[01:14.23]从开始到结束\n[01:17.02]什么才是败者的恐惧？\n[01:27.81]用从他人身上盗取来的信念伪装 向下望去\n[01:32.68]那里也只是仅能看到地面的高度 这种事情\n[01:37.62]无从察觉地 渐渐地坏掉\n[01:42.26]囚禁在被过去所破碎的镜子深处\n[01:46.50]要在哪里呼喊 才能找到自己的所在\n[01:51.70]还未使出杀手 气息便已然断绝\n[01:56.46]面对坦然暴露的无数罪恶 消极地挣扎抵抗\n[02:05.32]爱是哭喊者的呐喊\n[02:07.71]在爱抚中告慰虚假\n[02:10.16]救赎信仰然后创造地狱\n[02:13.02]我会不断前行 即使变得脆弱\n[02:14.93]爆破 然后冲破 这绝不会是终点\n[02:16.38]请不要再制造战争 然后回过头来\n[02:17.67]欺骗士兵 诉说着 我们都生存在战争之中\n[02:20.13]人们的目光早已无法 再接受战争\n[02:22.59]从出生到流转 拥有更崇高的理想\n[02:24.23]你是否就能抬头看见目标？\n[02:44.28]虚伪的态度 用刻意地提高声调 掩饰懦弱\n[02:48.62]那误当做自己崇高的气节 激烈跳动的心跳\n[02:53.71]就算目睹预料中的幻象\n[02:58.11]也同样无法满足 无论重新睁眼多少次\n[03:03.96]在哪里呼喊 才能找到自己的所在\n[03:09.26]还未使出杀手 气息便已然断绝\n[03:14.08]面对坦然暴露的无数罪恶 消极地挣扎抵抗\n[03:22.78]爱是哭喊者的呐喊\n[03:25.43]在爱抚中告慰虚假\n[03:27.98]救赎信仰然后创造地狱\n[03:30.13]我深爱着这游戏世界般的每一天\n[03:32.88]请不要再制造战争 然后回过头来\n[03:35.14]欺骗士兵 诉说着 我们都生存在战争之中\n[03:37.38]人们的目光早已无法 再接受战争\n[03:39.83]从开始到结束\n[03:41.98]什么才是败者的恐惧？\n[03:43.52]活着算什么？如行尸走肉一般\n[03:45.73]黑暗中的一束光明，你看到了吗？\n[03:48.13]当然，你会不知道的\n[03:50.49]这就是我的意志\n[03:52.99]活着算什么？如行尸走肉一般\n[03:55.34]黑暗中的一束光明，你看到了吗？\n[03:57.80]当然，你会不知道的\n[04:00.18]就用你的双眼去感受吧\n"},"code":200}