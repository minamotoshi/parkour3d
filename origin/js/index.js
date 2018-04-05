var _game = null;
$(window).bind("resize load", function(){
    w = $(".box").width();
    h = $(window).height();
    if(w < 1000){
        size = w / 64;
        $("html").css("font-size",size+"px")
    }
    $(".box").css("height",h+"px")
});
$(function($) {
    $(document).on('touchmove', onDocumentMove);
    Parkour.Preload.load(progress, complete);
    //首页按钮点击进入二级页面，先loading
	$(".first .btn").on("click",function () {
		$(".first").hide();
		// $(".loading").show();
        $(".second .icons").show();
        $(".second").show();
		$(".warp").show();
	});


	//第二页事件
	$(".second .explain").on("click",function () {
		$(".second .mask_explain").show();
        $(document).off('touchmove', onDocumentMove);
    });

	$(".second .mask_explain .close").on("click",function () {
        $(".second .mask_explain").hide();
        $(document).on('touchmove', onDocumentMove);

    });

	$(".second .btn").on("click",function () {
		$("#info").show();
		_game.start();
		$(".second .icons").hide()
	});



    //个人中心点
    $(".three .draw").on("click",function(){prize(2)});
    $(".three .number").on("click",function(){
        window.location.href="./"
    });


    //游戏成绩页面
    $(".four .draw").on("click",function () {prize(0)});



	/**奖品弹窗**/
	$(".regret .okBtn").on("click",function () {
		$(".mask_one").hide();
		$(".mask_prize").hide();
    });
	$(".mask_prize .information .submit").on("click",submit);

	$(".mask_prize .water .receive").on("click",function () {
        $(".mask_one").hide();
        $(".mask_prize .information").show();
    });
	$(".mask_prize .mask_one .close").on("click",function () {
        $(".mask_one").hide();
        $(".mask_prize").hide();
    });


    /**游戏成绩**/
    $(".four .personal").on("click",function () {
        $(".page").hide();
        $(".three").show();
        $(".ranking .content .number_num,.ranking .content .rank_name,.ranking .content .rank_fraction").css("opacity","0");
        $(".ranking .content .rank_bar").css("opacity","0");
        var timer = setInterval(function () {
            $(".ranking .content .rank_bar").eq(bar).css("opacity","1");
            bar++;
            console.log(bar)
        },400);

        onCreateLis(nameNumber.length);
        $(document).off('touchmove', onDocumentMove);
        setTimeout(function () {
            $(".ranking .content .number_num,.ranking .content .rank_name,.ranking .content .rank_fraction,.ranking .content .rank_bar").css("opacity","1");
            clearInterval(timer)
        },2000)
    });


    $(".four .draw").on("click",function () {
        prize(0)
    });


    $(".four .again").on("click",function () {
        $(".four").hide();
        _game.replay();

    });

});
var bar = 0;

function onDocumentMove (e) {
    e.preventDefault();
}

function progress(e){
	$(".loading_text").text(Math.floor(e.loaded*100) + "%");
    $(".loading").show();
}
function complete(e){
	$(".loading").hide();
	$(".first").show();
	$("#info").hide();
	_game = new Parkour.main($("#game")[0]);
	_game.addEventListener(Parkour.Event.GAME_OVER, onGameOver);
	_game.addEventListener(Parkour.Event.RUNNING, onRunning);
	_game.launch();
	
}
function onGameOver (e) {
    // console.log(e.time, e.dis);
    //$(".warp").hide();
    $(".four").show();
    $(".four .content .distance span").text(e.dis);
    // $(".four .content .ranking span").text(e.dis);


}
var _imgs = ["<img src='images/canvas_num0.png'/>","<img src='images/canvas_num1.png'/>","<img src='images/canvas_num2.png'/>","<img src='images/canvas_num3.png'/>",
    "<img src='images/canvas_num4.png'/>", "<img src='images/canvas_num5.png'/>","<img src='images/canvas_num6.png'/>","<img src='images/canvas_num7.png'/>",
    "<img src='images/canvas_num8.png'/>","<img src='images/canvas_num9.png'/>"];

function onRunning (e) {
	//$("#info .life span").text("life:" + e.life);
    // $("#info .time").text(e.time);
    //$("#info .dis").text(e.dis);

    $("#info .life .lifeOver .lifeBar").css("height",(100 - e.life) + "%");
    var time = parseInt(e.time);
    var second = parseInt(time%60),
        min = parseInt(time/60);

    if(min < 1){
        min = "0" + "0";
    }else if(min >1 && min < 10){
        min = "0" + min;
    }
    $("#info .time .time_sec").empty();
    $("#info .time .time_min").empty();

    if(time < 10){
        time = "0" + time;
        for(var k = 0; k<time.length; k++){
            var secImg = _imgs[time.charAt(k)];
            $(".time .time_sec").prepend(secImg);
        }
        for(var j = 0; j <min.length; j++){
            var minImg = _imgs[min.charAt(j)];
            $(".time .time_min").prepend(minImg);

        }

    }else if(time >= 10 && time <= 59){
        //console.log(Math.floor(time/10),Math.floor(time%10));
        $(".time .time_sec").prepend(_imgs[Math.floor(time/10)]);
        $(".time .time_sec").prepend(_imgs[Math.floor(time%10)]);
        $(".time .time_min").prepend(_imgs[0]);
        $(".time .time_min").prepend(_imgs[0]);

    }else if(time > 59 && time <= 599){

        second = second.toString();
        min = min.toString();
        if (second < 10){
            second = "0" + second;
        }
        $(".time .time_sec").prepend(_imgs[second.charAt(0)]);
        $(".time .time_sec").prepend(_imgs[second.charAt(1)]);
        //_imgs[Math.floor(time/10)]
        $(".time .time_min").prepend(_imgs[min.charAt(0)]);
        $(".time .time_min").prepend(_imgs[min.charAt(1)]);
    }else if(time > 599){
        //console.log(min)
        second = second.toString();
        min = min.toString();
        if (second < 10){
            second = "0" + second;
        }
        $(".time .time_sec").prepend(_imgs[second.charAt(0)]);
        $(".time .time_sec").prepend(_imgs[second.charAt(1)]);
        $(".time .time_min").prepend(_imgs[min.charAt(0)]);
        $(".time .time_min").prepend(_imgs[min.charAt(1)]);
    }


    $("#info .dis").empty();
    var dis = e.dis.toString();
    if(dis.length == 1){
        dis = "0" + dis;
    }
    for(var i=0;i<dis.length;i++){
        var img = _imgs[dis.charAt(i)];
        $(".dis").prepend(img);
    }

}

// 验证姓名的正则表达式
function validName(name){
    var pattern=/^([a-zA-Z]{1,20}|[\u4e00-\u9fa5]{1,10}|[\u4e00-\u9fa5a-zA-Z]{1,20})$/;
    return pattern.test(name)
}

//手机号的验证  正则表达式
function validPhone(phone){
    var pattern=/^1[34578][0-9]{9}$/;
    return pattern.test(phone)
}

function submit() {
    var name = $(".name input").val();
    if (validName(name)){
    }else {
        if(name == ""){
            alert("请输入姓名");
            return false
        }else{
            alert("请输入正确的姓名");
            return false

        }
    }
    //验证电话号码是否正确
    var phone = $(".phone input").val();
    if (validPhone(phone)){
    }else {
        alert("请输入正确的手机号码");
        return false
    }
    //验证地址
    var address = $(".address input").val();
    if (address == ""){
        alert("请输入地址");
        return false
    }

    $(".mask_prize .information .fill .info input").val("");
    alert("提交成功");
    $(".mask_one").hide();
    $(".mask_prize").hide();
}


    var nameNumber = [
        ["蜻蜓队长1号","99988"],
        ["蜻蜓队长2号","9988"],
        ["蜻蜓队长3号","988"],
        ["蜻蜓队长4号","88"],
        ["蜻蜓队长5号","88"],
        ["蜻蜓队长6号","88"],
        ["蜻蜓队长7号","88"],
        ["蜻蜓队长8号","88"],
        ["蜻蜓队长9号","88"],
        ["蜻蜓队长10号","88"],
        ["蜻蜓队11号","88"],
        ["蜻蜓队长12号","88"],
        ["蜻蜓队长13号","88"],
        ["蜻蜓队长14号","88"],
        ["蜻蜓队长15号","88"],
        ["蜻蜓队长16号","88"],
        ["蜻蜓队长17号","88"],
        ["蜻蜓队长18号","88"],
        ["蜻蜓队长19号","88"],
        ["蜻蜓队长20号","88"],
        ["蜻蜓队长21号","88"],
        ["蜻蜓队长22号","88"],
        ["蜻蜓队长23号","88"],
        ["蜻蜓队长24号","88"],
        ["蜻蜓队长25号","88"],
        ["蜻蜓队长26号","88"],
        ["蜻蜓队长27号","88"],
        ["蜻蜓队长28号","88"],
        ["蜻蜓队长29号","88"],
        ["蜻蜓队长30号","88"],
        ["蜻蜓队长31号","88"],
        ["蜻蜓队长32号","88"],
        ["蜻蜓队长33号","88"],
        ["蜻蜓队长34号","88"],
        ["蜻蜓队长35号","88"],
        ["蜻蜓队长36号","88"],
        ["蜻蜓队长37号","88"],
        ["蜻蜓队长38号","88"],
        ["蜻蜓队长39号","88"],
        ["蜻蜓队长40号","88"],
        ["蜻蜓队长41号","88"],
        ["蜻蜓队长42号","88"],
        ["蜻蜓队长43号","88"],
        ["蜻蜓队44号","88"],
        ["蜻蜓队长45号","88"],
        ["蜻蜓队长46号","88"],
        ["蜻蜓队长47号","88"],
        ["蜻蜓队长48号","88"],
        ["蜻蜓队长49号","88"],
        ["蜻蜓队长50号","88"],
        ["蜻蜓队长51号","88"],
        ["蜻蜓队长52号","88"],
        ["蜻蜓队长53号","88"],
        ["蜻蜓队长54号","88"],
        ["蜻蜓队长55号","88"],
        ["蜻蜓队长56号","88"],
        ["蜻蜓队长57号","88"],
        ["蜻蜓队长58号","88"],
        ["蜻蜓队长59号","88"],
        ["蜻蜓队长60号","88"],
        ["蜻蜓队长61号","88"],
        ["蜻蜓队长62号","88"],
        ["蜻蜓队长63号","88"],
        ["蜻蜓队长64号","88"],
        ["蜻蜓队长65号","88"],
        ["蜻蜓队66号","88"],
        ["蜻蜓队长67号","88"],
        ["蜻蜓队长68号","88"],
        ["蜻蜓队长69号","88"],
        ["蜻蜓队长70号","88"],
        ["蜻蜓队长71号","88"],
        ["蜻蜓队长71号","88"],
        ["蜻蜓队长73号","88"],
        ["蜻蜓队长74号","88"],
        ["蜻蜓队长75号","88"],
        ["蜻蜓队长76号","88"],
        ["蜻蜓队长77号","88"],
        ["蜻蜓队长78号","88"],
        ["蜻蜓队长79号","88"],
        ["蜻蜓队长80号","88"],
        ["蜻蜓队长81号","88"],
        ["蜻蜓队长82号","88"],
        ["蜻蜓队长83号","88"],
        ["蜻蜓队长84号","88"],
        ["蜻蜓队长85号","88"],
        ["蜻蜓队长86号","88"],
        ["蜻蜓队长87号","88"],
        ["蜻蜓队长88号","88"],
        ["蜻蜓队长89号","88"],
        ["蜻蜓队长90号","88"],
        ["蜻蜓队长91号","88"],
        ["蜻蜓队长92号","88"],
        ["蜻蜓队长93号","88"],
        ["蜻蜓队长94号","88"],
        ["蜻蜓队长95号","88"],
        ["蜻蜓队长96号","88"],
        ["蜻蜓队长97号","88"],
        ["蜻蜓队长98号","88"],
        ["蜻蜓队长99号","88"],
        ["蜻蜓队长100号","88"]
    ];
    function onCreateLis(num){
        var template = $(".three .ranking .content").html();
        //console.log(template);
        var html = [];
        var _number = [0,0,0];
        for (var i = 0; i < num; i++) {
            _number = String(i+1).split("");
            var _html = template
                .replace("{{number1}}",setImg(_number[0]))
                .replace("{{number2}}",setImg(_number[1]))
                .replace("{{number3}}",setImg(_number[2]));
            //console.log(i);
            html.push(_html);
        }

        $(".three .ranking .content").html(html.join(""));
        $(".three .ranking .content .number_num:gt(8)").css("left","3.726%");
        $(".three .ranking .content .number_num:gt(98)").css("left","0");
        $(".three .ranking .content .rank_name:gt(2)").css("color","#656565");
        $(".three .ranking .content .rank_fraction:gt(2)").css("color","#656565");
        $(".three .ranking .content .number_num").eq(0).find(".n img").attr("src","images/page03_red_num01.png");
        $(".three .ranking .content .number_num").eq(1).find(".n img").attr("src","images/page03_red_num02.png");
        $(".three .ranking .content .number_num").eq(2).find(".n img").attr("src","images/page03_red_num03.png");


        for(var k = 0 ; k < nameNumber.length; k++){
            $(".three .ranking .content .rank_name").eq(k).text(nameNumber[k][0].substr(0,5));
            //console.log(str);
            $(".three .ranking .content .rank_fraction").eq(k).text(nameNumber[k][1])
        }

    }
    function setImg(n){
        if(n) return "<div class=\"n\"><img src=\"images/page03_num0" + n + ".png\"/></div>"
        else return "";
    }






    /****
     * 奖品函数
     * ****/
    function prize(num) {
        if(num == 0){  //num 为0 时 为未中奖弹窗
            $(".mask_prize").show();
            $(".mask_one").hide();
            $(".regret").show();
        }else if (num == 1 ){ //num 为 1 时 为 京东优惠券弹窗
            $(".mask_prize").show();
            $(".mask_one").hide();
            $(".coupon").show();
        }else if (num == 2 ){ //num 为 2 时 为 饮水机
            $(".mask_prize").show();
            $(".mask_one").hide();
            $(".water").show();
        }
    }
