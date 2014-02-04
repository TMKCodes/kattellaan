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
	data: { session: $.cookie("session") },
	beforeSubmit: function(formData, jqForm, options) {
		console.log("About to submit: \r\n" + $.param(formData));
		$("#progress").show();
		$("#bar").width("0%");
		$("#percent").html("0%");
		if($("#select-picture").length > 0) {
			$("#select-picture").remove();
		}
		return true;
	},
	uploadProgress: function(evt, position, total, percentComplete) {
		$("#bar").width(percentComplete + "%");
		$("#percent").html(percentComplete + "%");
		if(percentComplete == 100) {
			$("#percent").html("Odota.");
		}
	},
	success: function(responseText, statusText, xhr, $form) {
		if(statusText == "success") {
			$("#bar").width("100%");
			$("#percent").html("Lähetetty.");
			if(responseText.uploaded_files != undefined) {
				if($("#select-picture").length == 0) {
					$("#profile-picture-select").append("<div id=\"select-picture\"></div>");
				}
				if($("#select-picture-header").length == 0) {
					$("#select-picture").append("<h1 id=\"select-picture-header\">Valitse profiili kuvasi.</h1>");
				}
				var rowNumber = 0;
				var count = responseText.uploaded_files.length;
				for(var i = 0; i < count; i++) {
					console.log("Uploaded file: " + responseText.uploaded_files[i]);
					if(i % 4 == 0) {
						rowNumber = i / 4;
						$("#select-picture").append("<div class=\"row\" id=\"row-" + rowNumber + "\"></div>");
					}
					$("#row-" + rowNumber).append("<div class=\"col-xs-6 col-md-3\"><div class=\"thumbnail\" id=\"thumbnail-" + i + "\">" +
									"<img style=\"heigth: 300px; width: 300px;\" src=\"uploads/" + responseText.uploaded_files[i] + "\" alt=\"" + responseText.uploaded_files[i]+ "\" />" + 
									"<div class=\"caption\"><p>" + responseText.uploaded_files[i]+ "</p>" +
									"<button class=\"btn btn-default\" id=\"select-profile-picture\" value=\"" + responseText.uploaded_files[i] + "\">Valitse tämä</button></div>" +
									"</div></div>");
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
	setInterval(function() { 
		if($.cookie("session") != undefined) {
			$.ajax({
				url: "php/api.php",
				type: "GET",
				async: false,
				data: { call : 'update_session', session : $.cookie("session") }
			}).done(function(data) {
				var result = $.parseJSON(data);
				if(result.success == true) {
					$.cookie("session", result.session);
				} else {
					console.log(result.error);
					$.removeCookie("session");
				}
			});
		}
	}, 15000);
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

$("#start-registeration-button").click(function(evt) {
	evt.preventDefault();
	$("body > .container").hide();
	$("#register-terms-of-service-page").show();
	$.cookie("last-visited-page", "#register-terms-of-service-page");
});

$("#register-account-form").submit(function(evt) {
	evt.preventDefault();
	$("#register-account-username-empty-error").hide();
	$("#register-account-address-empty-error").hide();
	$("#register-account-password-empty-error").hide();
	$("#register-account-password-mismatch-error").hide();
	$("#register-account-failure-error").hide();
	if($("#register-account-username-input").val().length <= 0) {
		$("#register-account-username-empty-error").show();
	} else if($("#register-account-address-input").val().length <= 0) {
		$("#register-account-address-empty-error").show();
	} else if($("#register-account-password-input").val().length <= 0) {
		$("#register-account-password-empty-error").show();
	} else if($("#register-account-password-confirm-input").val().length <= 0) {
		$("#register-account-password-empty-error").show();
	} else if($("#register-account-password-input").val() != $("#register-account-password-confirm-input").val()) {
		console.log($("#register-account-password-input").val() + " != " + $("#register-account-password-confirm-input").val());
		$("#register-account-password-mismatch-error").show();
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
					$("#register-invite-page").show();
				} else {
					console.log("Failed to authenticate.");
					$("#register-account-first-login-error").show();
				}
			} else {
				$("#register-account-failure-error").show();
			}
		});
		
	}
});

$("#register-terms-of-service-continue-button").click(function(evt) {
	evt.preventDefault();
	// TODO: add this information to database for the user.
	$("body > .container").hide();
	$("#register-account-page").show();
	$.cookie("last-visited-page", "#register-account-page");
});

$("#register-terms-of-service-stop-button").click(function(evt) {
	evt.preventDefault();
	// TODO: add this nasty informatio to database for the user.
	$("body > .container").hide();
	$("#home-page").show();
	$.cookie("last-visited-page", "#home-page");
});

$("#register-invite-form").submit(function(evt) {
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
			var cloneinput = $("#register-invite-friend-addresses").children(":first").clone();
			$("#register-invite-friend-addresses").children(".input-group").remove();
			var count = -1;
			for(var index in result.invite) {
				if(result.invite[index] != true) {
					count = count + 1;
					$("#register-invite-friend-addresses").append(cloneinput);
					$("#register-invite-friend-addresses").children(":last").children("label").attr("for", "register-invite-friend-address-input-" + count);
					$("#register-invite-friend-addresses").children(":last").children("label").html("Tälle ystävälle kutsun lähettäminen epäonnistui.");
					$("#register-invite-friend-addresses").children(":last").children("label").css("color", "red");
					$("#register-invite-friend-addresses").children(":last").children("input").attr("id", "register-invite-friend-address-input-" + count);
					$("#register-invite-friend-addresses").children(":last").children("input").attr("name", "friend-address-" + count);		
					$("#register-invite-friend-addresses").children(":last").children("input").val(result.invite[index].address);
				}
			}
			if(count == -1) {
				//continue
			} else {
				$("#register-invite-friend-count").val(count);	
			}
		} else {
			// failed to confirm session.
			console.log("Exception happened: " + result.error);
		}
	});
});

$("#register-invite-add-button").click(function(evt) {
	evt.preventDefault();
	$.cookie("last-visited-page", "#register-invite-page");
	var friends = parseInt($("#register-invite-friend-count").val(), 10);
	friends = friends + 1;
	text_friends = friends + 1;	
	$("#register-invite-friend-addresses").append($("#register-invite-friend-addresses").children(":last").clone());
	$("#register-invite-friend-addresses").children(":last").children("label").attr("for", "register-friend-address-input-" + friends);
	$("#register-invite-friend-addresses").children(":last").children("label").html("Ystävän " + String(text_friends) + " sähköposti osoite:");
	$("#register-invite-friend-addresses").children(":last").children("input").attr("id", "register-friend-address-input-" + friends);
	$("#register-invite-friend-addresses").children(":last").children("input").attr("name", "friend-address-" + friends);
	$("#register-invite-friend-count").val(friends);

});

$("#select-gender").change(function(evt) {
	$("#select-gender-error").hide();
});

$("#register-select-gender-done-button").click(function(evt) {
	evt.preventDefault();
	var gender = $("#select-gender").val();
	if(gender != undefined) {
		$.cookie("gender", gender);
		$("body > .container").hide();
		$("#register-select-birthday-page").show();
	} else {
		$("#select-gender-error").show();
	}
});

$("#select-birthday").change(function(evt) {
	$("#select-birthday-error").hide();
});

$("#register-select-birthday-done-button").click(function(evt) {
	evt.preventDefault();
	var birthday = $("#select-birthday").val();
	console.log($("#select-birthday").val());
	if(birthday != undefined) {
		$.cookie("birthday", birthday);
		$("body > .container").hide();
		$("#register-select-location-page").show();
	} else {
		$("#select-birthday-error").show();
	}
});
var map;

$("#register-select-location-page").on("show", function() {
	$.cookie("last-visited-page", "#register-select-location-page");
	var map_canvas = document.getElementById("google_map_canvas");
	var map_options = {
		center: new google.maps.LatLng(61.4894846, 21.7298981),
		zoom: 4,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(map_canvas, map_options);
});

$("#select-street-address").change(function(evt) {
	$("#select-street-address-error").hide();
	$("#select-location-error").hide();
});

$("#select-municipality").change(function(evt) {
	$("#select-municipality-error").hide();
	$("#select-location-error").hide();
});

$("#select-country").change(function(evt) {
	$("#select-country-error").hide();
	$("#select-location-error").hide();

});

// DO NOT REMOVE Enables hide and show binding
// $("element").on("show", someFunc);
// $("element").on("hide", someFunc);
(function ($) {
	$.each(['show', 'hide'], function (i, ev) {
		var el = $.fn[ev];
		$.fn[ev] = function () {
			this.trigger(ev);
			return el.apply(this, arguments);
		};
	});
})(jQuery);

$("#register-select-location-show-on-map").click(function(evt) {
	evt.preventDefault();
	if(window.map == undefined) {
		show_register_select_location_page();
	}
	var street_address = $("#select-street-address").val();
	var municipality = $("#select-municipality").val();
	var country = $("#select-country").val();
	var street_address_replaced = street_address.replace(" ", "+");
	var municipality_replaced = municipality.replace(" ", "+");
	var country_replaced = country.replace(" ", "+");
	var jaddress = street_address_replaced + "+" + municipality_replaced + "+" + country_replaced;
	console.log(jaddress);
	$.ajax({
		url: "http://maps.googleapis.com/maps/api/geocode/json",
		type: "GET",
		data: { address : jaddress, sensor: false  }
	}).done(function(data) {
		console.log(data);
		if(data.status == "OK") {
			var myLatLong = new google.maps.LatLng(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng) 
			var marker = new google.maps.Marker({
				position: myLatLong,
				map: window.map
			});
		} else {
			// display error
			console.log("failed to query location.");
		}
	});	
});

$("#register-select-location-done-button").click(function(evt) {
	evt.preventDefault();
	var street_address = $("#select-street-address").val();
	var municipality = $("#select-municipality").val();
	var country = $("#select-country").val();
	if(street_address == undefined) {
		$("#select-street-address-error").show();
	} else if(municipality == undefined) {
		$("#select-municipality-error").show();
	} else if(country == undefined) {
		$("#select-country-error").show();
	} else {
	}
});
