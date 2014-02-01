function get_url_parameter(param) {
	var url = window.location.search.substring(1);
	var variables = url.split('&');
	for(var i = 0; i < variables.length; i++) {
		var parameter = variables[i].split('=');
		if(parameter[0] == param) {
			return parameter[1];
		}
	}
	return undefined;
}

function open_session(username, password) {
	$.ajax({
		url: "php/api.php",
		type: "GET",
		async: false,
		data: { call : 'open_session', username : username, password : password }
	}).done(function(data) {
		var result = $.parseJSON(data);
		if(result.success == true) {
			$.cookie("session", result.session);
		} else {
			if($.cookie("session") != undefined) {
				$.removeCookie("session");
			}
		}
	});
}

$("#file-upload").ajaxForm({
	dataType: "json",
	beforeSubmit: function(formData, jqForm, options) {
		console.log("About to submit: \r\n" + $.param(formData));
		$("#progress").show();
		$("#bar").width("0%");
		$("#percent").html("0%");
		return true;
	},
	uploadProgress: function(evt, position, total, percentComplete) {
		$("#bar").width(percentComplete + "%");
		$("#percent").html(percentComplete + "%");
		if(percentComplete == 100) {
			$("#percent").html("Odota kiitos, käsittelemme tiedostoa.");
		}
	},
	success: function(responseText, statusText, xhr, $form) {
		if(statusText == "success") {
			$("#bar").width("100%");
			$("#percent").html("Lähetetty");
			if(responseText.uploaded_files != undefined) {
				for(var i = 0; i < responseText.uploaded_files.length; i++) {
					console.log("Uploaded file: " + responseText.uploaded_files[i]);
				}
			}
			if(responseText.failed_files != undefined) {
				for(var i = 0; i < responseText.failed_files.length; i++) {
					console.log("Failed to upload file: " + responseText.failed_files[i]);
				}
			}
		} else {
			$("#bar").width("0%");
			$("#percent").html("0%");
			console.log("Uploading failed.");
		}	
	}
});

$("document").ready(function() {
	$("body > .container").hide();
	var page = get_url_parameter("page");
	if(page != undefined) {
		$("#" + page).show();
		$.cookie("last-visited-page", "#" + page);
		window.location.href = "http://kattellaan.com/#";
	} else { 
		var last_visited_page = $.cookie("last-visited-page");
		if(last_visited_page === undefined) {
			$("#home-page").show();
			$.cookie("last-visited-page", "#home-page");
		} else {
			$(last_visited_page).show();
			$.cookie("last-visited-page", last_visited_page);
		}
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

$("#terms-of-service-button").click(function(evt) {
	evt.preventDefault();
	$("body > .container").hide();
	$("#terms-of-service-page").show();
	$.cookie("last-visited-page", "#terms-of-service-page");
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
				if($.cookie("session") != undefined) {
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

$("#accept-terms-of-service-button").click(function(evt) {
	evt.preventDefault();
	// TODO: add this information to database for the user.
	$("body > .container").hide();
	$("#register-page").show();
	$.cookie("last-visited-page", "#home-page");
});

$("#unaccept-terms-of-service-button").click(function(evt) {
	evt.preventDefault();
	// TODO: add this nasty informatio to database for the user.
	$("body > .container").hide();
	$("#home-page").show();
	$.cookie("last-visited-page", "#home-page");
});

$("#invite-form").submit(function(evt) {
	evt.preventDefault();
	var form_data = $(this).serialize();
	if($.cookie("session") != undefined) {
		form_data = form_data + "&session=" + $.cookie("session");	
	}
	$.ajax({
		type: $(this).attr('method'),
		url: $(this).attr('action'),
		data: form_data 
	}).done(function(data) {
		console.log(data);
		var result = $.parseJSON(data);
		if(result.success == true) {
			var cloneinput = $("#input-friend-addresses").children(":first").clone();
			$("#input-friend-addresses").children(".form-group").remove();
			var count = -1;
			for(var index in result.invite) {
				if(result.invite[index] != true) {
					count = count + 1;
					$("#input-friend-addresses").append(cloneinput);
					$("#input-friend-addresses").children(":last").children("label").attr("for-friend-address-" + count);
					$("#input-friend-addresses").children(":last").children("label").html("Tälle ystävälle kutsun lähettäminen epäonnistui.");
					$("#input-friend-addresses").children(":last").children("label").css("color", "red");
					$("#input-friend-addresses").children(":last").children("input").attr("id", "input-friend-address-" + count);
					$("#input-friend-addresses").children(":last").children("input").attr("name", "friend-address-" + count);		
					$("#input-friend-addresses").children(":last").children("input").val(result.invite[index].address);
				}
			}
			if(count == -1) {
				//continue
			} else {
				$("#friend-count").val(count);	
			}
		} else {
			// failed to confirm session.
			console.log("Exception happened: " + result.error);
		}
	});
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

