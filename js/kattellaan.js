$("#navigation-left > li").click(function(evt) {
	evt.preventDefault();	
	$("#navigation-left").children().removeClass("active");
	$(this).addClass("active");
});

$("#home-button").click(function(evt) {
	evt.preventDefault();
	$("body > .container").hide();
	$("#home-page").show();
});

$("#first-link").click(function(evt) {
	evt.preventDefault();
	$("body > .container").hide();
});

$("#register-button").click(function(evt) {
	evt.preventDefault();
	$("body > .container").hide();
	$("#register-page").show();
});
