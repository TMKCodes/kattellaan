$("#navigation-left > li").click(function() {
	event.preventDefault();
	$("#navigation-left").children().removeClass("active");
	$(this).addClass("active");
});
