$("document").ready(function() {
	$("body > .container").hide();
	var last_visited_page = $.cookie("last-visited-page");
	if(last_visited_page === undefined) {
		$("#home-page").show();
	} else {
		$(last_visited_page).show();
	}
});

$("#navigation-left > li").click(function(evt) {
	evt.preventDefault();	
	$("#navigation-left").children().removeClass("active");
	$(this).addClass("active");
});

$("#home-button").click(function(evt) {
	evt.preventDefault();
	$("body > .container").hide();
	$("#home-page").show();
	$.cookie("last-visited-page", "#home-page");
});

$("#first-link").click(function(evt) {
	evt.preventDefault();
	$("body > .container").hide();
});

$("#register-button").click(function(evt) {
	evt.preventDefault();
	$("body > .container").hide();
	$("#register-page").show();
	$.cookie("last-visited-page", "#register-page");
});

$("#register-form").submit(function(evt) {
	evt.preventDefault();
	if($("#input-username").val().length() <= 0) {
		$("#input-username-empty").show();
	} else if($("#input-address").val().length() <= 0) {
		$("#input-address-empty").show();
	} else if($("#input-password").val().length() <= 0) {
		$("#input-password-empty").show();
	} else if($("#input-password-confirm").val().length() <= 0) {
		$("#input-password-empty").show();
	} else if($("#input-password").val() != $("#input-password-confirm")) {
		$("#input-password-mismatch").show();
	} else {
		$.ajax({
			type: $(this).attr('method'),
			url: $(this).attr('action'),
			data: $(this).serialize()
		}).done(function(data){
			$("body > .container").hide();
			$("#invite-page").show();
		});
	}
});

