$("#navigation-left > li").click(function(evt) {
	evt.preventDefault();	
	$("#navigation-left").children().removeClass("active");
	$(this).addClass("active");
});

$("#home_link").click(function(evt) {
	evt.preventDefault();
	$("body > .container").hide();
	$("#home").show();
});

$("#first_link").click(function(evt) {
	evt.preventDefault();
	$("body > .container").hide();
});
