$("#navigation-left > li").click(function() {
	event.preventDefault();
	$("#navigation-left").children().removeClass("active");
	$(this).addClass("active");
});

$("#home_link").click(function() {
	$("body > .container").hide();
	$("#home").show();
});

$("#first_link").click(function() {
	$("body > .container").hide();
});
