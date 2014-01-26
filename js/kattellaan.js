$('#navigation-left > li').click(function() {
	$('#navigation-left').children().removeClass("active");
	$(this).addClass("active");
});
