$('#navigation-left > li').click(function() {
	console.log("navigation-left link was clicked.");
	$('#navigation-left').children().removeClass("active");
	$(this).addClass("active");
});
