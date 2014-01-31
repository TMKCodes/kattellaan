function open_session(username, password) {
	$.ajax({
		url: "php/api.php",
		type: "GET",
		data: { call : 'open_session', username : username, password : password }
	}).done(function(data) {
		var result = $.parseJSON(data);
		console.log(data);
		if(result.success == true) {
			$.cookie("session", result.key);
		} else {
			if($.cookie("session") !== undefined) {
				$.removeCookie("session");
			}
		}
	});
}

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
	$("#invite-page").show();
	$.cookie("last-visited-page", "#invite-page");
});

$("#register-button").click(function(evt) {
	evt.preventDefault();
	$("body > .container").hide();
	$("#register-page").show();
	$.cookie("last-visited-page", "#register-page");
});

$("#register-form").submit(function(evt) {
	evt.preventDefault();
	$("#input-username-empty").hide();
	$("#input-address-empty").hide();
	$("#input-password-empty").hide();
	$("#input-password-mismatch").hide();
	$("#registeration-failure").hide();
	if($("#input-username").val().length <= 0) {
		$("#input-username-empty").show();
	} else if($("#input-address").val().length <= 0) {
		$("#input-address-empty").show();
	} else if($("#input-password").val().length <= 0) {
		$("#input-password-empty").show();
	} else if($("#input-password-confirm").val().length <= 0) {
		$("#input-password-empty").show();
	} else if($("#input-password").val() != $("#input-password-confirm").val()) {
		console.log($("#input-password").val() + " != " + $("#input-password-confirm").val());
		$("#input-password-mismatch").show();
	} else {
		console.log("method: " + $(this).attr('method'));
		console.log("action: " + $(this).attr('action'));
		$.ajax({
			type: $(this).attr('method'),
			url: $(this).attr('action'),
			data: $(this).serialize()
		}).done(function(data){
			var result = $.parseJSON(data);
			if(result.success == true) {
				open_session(result.account.username, result.account.password);
				if($.cookie("session") !== undefined) {
					$("body > .container").hide();
					$("#invite-page").show();
				} else {
					console.log("Failed to authenticate.");
					$("#login-failure").show();
				}
			} else {
				$("#registeration-failure").show();
			}
		});
		
	}
});
$("#invite-add-button").click(function(evt) {
	evt.preventDefault();
	$.cookie("last-visited-page", "#invite-page");
	var friends = parseInt($("#friend-count").val(), 10);
	friends = friends + 1;
	text_friends = friends + 1;	
	$("#input-friend-addresses").append($("#input-friend-addresses").children(":last").clone());
	$("#input-friend-addresses").children(":last").children("label").attr("for", "input-friend-address-" + friends);
	$("#input-friend-addresses").children(":last").children("label").html("Ystävän " + String(text_friends) + " sähköposti osoite:");
	$("#input-friend-addresses").children(":last").children("input").attr("id", "input-friend-address-" + friends);
	$("#input-friend-addresses").children(":last").children("input").attr("name", "friend-address-" + friends);
	$("#friend-count").val(friends);

});
