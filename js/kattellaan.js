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

$("#register-picture-upload-form").ajaxForm({
	dataType: "json",
	data: { session: $.cookie("session") },
	beforeSubmit: function(formData, jqForm, options) {
		console.log("About to submit: \r\n" + $.param(formData));
		$("#register-picture-upload-progress").show();
		$("#register-picture-upload-progress-bar").width("0%");
		$("#register-picture-upload-progress-percent").html("0%");
		if($("#register-select-picture").length > 0) {
			$("#register-select-picture").remove();
		}
		if($("#register-select-profile-picture-success-alert").length > 0) {
			$("#register-select-profile-picture-success-alert").remove();
		}
		return true;
	},
	uploadProgress: function(evt, position, total, percentComplete) {
		$("#register-picture-upload-progress-bar").width(percentComplete + "%");
		$("#register-picture-upload-progress-percent").html(percentComplete + "%");
		if(percentComplete == 100) {
			$("#register-picture-upload-progress-percent").html("Odota.");
		}
	},
	success: function(responseText, statusText, xhr, $form) {
		if(statusText == "success") {
			if(responseText.success == true) {
				$("#register-picture-upload-progress-bar").width("100%");
				$("#register-picture-upload-progress-percent").html("Lähetetty.");
				if(responseText.uploaded_files != undefined) {
					if($("#register-select-picture").length == 0) {
						$("#register-select-profile-picture-page").append("<div id=\"register-select-picture\"></div>");
					}
					if($("#register-select-picture-header").length == 0) {
						$("#register-select-picture").append("<h1 id=\"register-select-picture-header\">Valitse profiili kuvasi.</h1>");
					}
					var rowNumber = 0;
					var count = responseText.uploaded_files.length;
					for(var i = 0; i < count; i++) {
						console.log("Uploaded file: " + responseText.uploaded_files[i]);
						if(i % 4 == 0) {
							rowNumber = i / 4;
							$("#register-select-picture").append("<div class=\"row\" id=\"row-" + rowNumber + "\"></div>");
						}
						$("#row-" + rowNumber).append("<div class=\"col-xs-6 col-md-3\"><div class=\"thumbnail\" id=\"thumbnail-" + i + "\">" +
										"<img style=\"heigth: 300px; width: 300px;\" src=\"uploads/" + responseText.uploaded_files[i] + "\" alt=\"" + responseText.uploaded_files[i]+ "\" />" + 
										"<div class=\"caption\"><p>" + responseText.uploaded_files[i]+ "</p>" +
										"<button class=\"btn btn-default\" onclick=\"register_select_profile_picture('" + responseText.uploaded_files[i] + "'); return false;\">Valitse tämä</button>" +
										"</div></div></div>");
					}
				}
				if(responseText.failed_files != undefined) {
					for(var i = 0; i < responseText.failed_files.length; i++) {
						console.log("Failed to upload file: " + responseText.failed_files[i]);
					}
				}
			} else {
				$("#register-picture-upload-progress-bar").width("0%");
				$("#register-picture-upload-progress-percent").width("Epäonnistui.");
				console.log("File uploading failed: " + responseText.error);
			}
		} else {
			$("#register-picture-upload-progress-bar").width("0%");
			$("#register-picture-upload-progress-percent").html("0%");
			console.log("Uploading failed.");
		}	
	}
});

function register_select_profile_picture(picture) {
	$.cookie("picture", picture);
	if($("#register-select-profile-picture-name").length == 0) {
		$("#register-select-profile-picture-page").append("<div class\"row\" id=\"register-select-profile-picture-success-alert\"><div class=\"alert alert-success\" id=\"register-select-profile-picture-name\"><p>Valitsit " + picture + " profiili kuvaksesi.</p></div></div>");
	} else {
		$("#register-select-profile-picture-name").html("<p>Valitsit " + picture + " profiili kuvaksesi.</p>");
	}
	if($("#register-select-profile-picture-done-button").length == 0) {
		$("#register-select-profile-picture-name").append("<button class=\"btn btn-default\" id=\"register-select-profile-picture-done-button\" onclick=\"register_select_profile_picture_done_button(); return false;\">Jatka</button>");
	}
}

var hostname;

function register_select_profile_picture_done_button() {
	$("body > .container").hide();
	$("#register-select-gender-page").show();
	history.pushState(null, "register select gender", hostname + "?page=register-select-gender-page");
}



window.onpopstate = function(event) {
	$("body > .container").hide();
	var page = get_url_parameter("page");
	if(page != undefined) {
		$("#" + page).show();
	} else {
		$("#home-page").show();
	}
}

$("document").ready(function() {
	$(".multiselect").multiselect();
	$("body > .container").hide();
	hostname = location.protocol + '//' + location.hostname + location.pathname;
	var page = get_url_parameter("page");
	if(page != undefined) {
		$("#" + page).show();
	} else {
		$("#home-page").show();
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
	// Check if user has already logged, do not show the registeration.
	$("#home-page").show();
	history.pushState(null, "Kattellaan home page", hostname);
});

$("#start-registeration-button").click(function(evt) {
	evt.preventDefault();
	$("body > .container").hide();
	$("#register-terms-of-service-page").show();
	history.pushState(null, "Registeration terms of service", hostname + "?page=register-terms-of-service-page");
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
					history.pushState(null, "Registeration invite friend", hostname + "?page=register-invite-page")
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
	$("body > .container").hide();
	$("#register-account-page").show();
	history.pushState(null, "Register Account", hostname + "?page=register-account-page")
});

$("#register-terms-of-service-stop-button").click(function(evt) {
	evt.preventDefault();
	$("body > .container").hide();
	$("#home-page").show();
	history.pushState(null, "Home page", hostname)
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
			var count = 0;
			for(var index in result.invite) {
				console.log(result.invite[index]);
				if(result.invite[index] != true) {
					$("#register-invite-friend-addresses").append(cloneinput);
					$("#register-invite-friend-addresses").children(":last").children("label").attr("for", "register-invite-friend-address-input-" + count);
					$("#register-invite-friend-addresses").children(":last").children("label").html("Tälle ystävälle kutsun lähettäminen epäonnistui.");
					$("#register-invite-friend-addresses").children(":last").children("label").css("color", "red");
					$("#register-invite-friend-addresses").children(":last").children("input").attr("id", "register-invite-friend-address-input-" + count);
					$("#register-invite-friend-addresses").children(":last").children("input").attr("name", "friend-address-" + count);		
					$("#register-invite-friend-addresses").children(":last").children("input").val(result.invite[index].address);
					cloneinput = $("#register-invite-friend-addresses").children(":last").clone();
					count = count + 1;
				}
			}
			if(count == 0) {
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
	var friends = parseInt($("#register-invite-friend-count").val(), 10);
	friends = friends + 1;
	text_friends = friends + 1;	
	$("#register-invite-friend-addresses").append($("#register-invite-friend-addresses").children(":last").clone());
	$("#register-invite-friend-addresses").children(":last").children("label").attr("for", "register-friend-address-input-" + friends);
	$("#register-invite-friend-addresses").children(":last").children("label").html("Ystävän " + String(text_friends) + " sähköposti osoite:");
	$("#register-invite-friend-addresses").children(":last").children("label").css("color", "black");
	$("#register-invite-friend-addresses").children(":last").children("input").attr("id", "register-friend-address-input-" + friends);
	$("#register-invite-friend-addresses").children(":last").children("input").attr("name", "friend-address-" + friends);
	$("#register-invite-friend-count").val(friends);

});

$("#register-invite-skip-button").click(function(evt) {
	evt.preventDefault();
	$("body > .container").hide();
	$("#register-select-location-page").show();
	history.pushState(null, "register select location", hostname + "?page=register-select-location-page");
});

$("#register-select-gender-input").change(function(evt) {
	$("#register-select-gender-error").hide();
});

$("#register-select-gender-done-button").click(function(evt) {
	evt.preventDefault();
	var gender = $("#register-select-gender-input").val();
	if(gender != undefined) {
		$.cookie("gender", gender);
		$("body > .container").hide();
		$("#register-select-birthday-page").show();
		history.pushState(null, "register select birthday", hostname + "?page=register-select-birthday-page");
	} else {
		$("#register-select-gender-error").show();
	}
});

$("#register-select-birthday-input").change(function(evt) {
	$("#register-select-birthday-error").hide();
});

$("#register-select-birthday-done-button").click(function(evt) {
	evt.preventDefault();
	var birthday = $("#register-select-birthday-input").val();
	if(birthday != undefined) {
		$.cookie("birthday", birthday);
		$("body > .container").hide();
		$("#register-select-relationship-status-page").show();
		history.pushState(null, "register select relationship", hostname + "?page=register-select-relationship-status-page");
	} else {
		$("#register-select-birthday-error").show();
	}
});


$("#register-select-relationship-status-input").change(function(evt) {
	$("#register-select-relationship-status-error").hide();
});

$("#register-select-relationship-status-done-button").click(function(evt) {
	evt.preventDefault();
	var relationshipStatus = $("#register-select-relationship-status-input").val();
	if(relationshipStatus != undefined) {
		$.cookie("relationship-status", relationshipStatus);
		$("body > .container").hide();
		$("#register-select-sexual-orientation-page").show();
		history.pushState(null, "register select sexual orientation", hostname + "?page=register-select-sexual-orientation-page");
	} else {
		$("#register-select-relationship-status-error").show();
	}
});

$("#register-select-sexual-orientation-input").change(function(evt) {
	$("#register-select-sexual-orientation-error").hide();
});

$("#register-select-sexual-orientation-done-button").click(function(evt) {
	evt.preventDefault();
	var sexualOrientation = $("#register-select-sexual-orientation-input").val();
	if(sexualOrientation != undefined) {
		$.cookie("sexual-orientation", sexualOrientation);
		$("body > .container").hide();
		$("#register-select-looking-for-page").show();
		history.pushState(null, "register select looking for", hostname + "?page=register-select-looking-for-page");
	} else {
		$("#register-select-sexual-orientation-error").show();
	}
});

$("#register-select-looking-for-input").change(function(evt) {
	$("#register-select-looking-for-error").hide();
});

$("#register-select-looking-for-done-button").click(function(evt) {
	evt.preventDefault();
	var lookingForValues = $("#register-select-looking-for-input").val();
	if(lookingForValues != undefined) {
		$.cookie("looking-for", lookingForValues);
		$("body > .container").hide();
		$("#register-select-height-page").show();
		history.pushState(null, "register select height", hostname + "?page=register-select-height-page");
	} else {
		$("#register-select-looking-for-error").show();
	}
});

$("#register-select-height-input").change(function(evt) {
	$("#register-select-height-error").hide();
});

$("#register-select-height-done-button").click(function(evt) {
	evt.preventDefault();
	var height = $("#register-select-height-input").val();
	if(height != undefined) {
		$.cookie("height", height);
		$("body > .container").hide();
		$("#register-select-weight-page").show();
		history.pushState(null, "register select weight", hostname + "?page=register-select-weight-page");
	} else {
		$("#register-select-height-error").show();
	}
});

$("#register-select-weight-input").change(function(evt) {
	$("#register-select-weight-error").hide();
});

$("#register-select-weight-done-button").click(function(evt) {
	evt.preventDefault();
	var weight = $("#register-select-weight-input").val();
	if(weight != undefined) {
		$.cookie("weight", weight);
		$("body > .container").hide();
		$("#register-select-body-type-page").show();
		history.pushState(null, "register select body type", hostname + "?page=register-select-body-type-page");
	} else {
		$("#register-select-weight-error").show();
	}
});

$("#register-select-body-type-input").change(function(evt) {
	$("register-select-body-type-error").hide();
});

$("#register-select-body-type-done-button").click(function(evt) {
	evt.preventDefault();
	var bodyType = $("#register-select-body-type-input").val();
	if(bodyType != undefined) {
		$.cookie("body-type", bodyType);
		$("body > .container").hide();
		$("#register-select-eye-color-page").show();
		history.pushState(null, "register select eye color", hostname + "?page=register-select-eye-color-page");
	} else {
		$("#register-select-body-type-error").show();
	}
});

$("#register-select-eye-color-input").change(function(evt) {
	$("#register-select-eye-color-error").hide();
});

$("#register-select-eye-color-done-button").click(function(evt) {
	evt.preventDefault();
	var eyeColor = $("#register-select-eye-color-input").val();
	if(eyeColor != undefined) {
		$.cookie("eye-color", eyeColor);
		$("body > .container").hide();
		$("#register-select-hair-length-page").show();
		history.pushState(null, "register select hair length", hostname + "?page=register-select-hair-length-page");
	} else {
		$("#register-select-eye-color-error").show();
	}
});

$("#register-select-hair-length-input").change(function(evt) {
	$("#register-select-hair-length-error").hide();
});

$("#register-select-hair-length-done-button").click(function(evt) {
	evt.preventDefault();
	var hairLength = $("#register-select-hair-length-input").val();
	if(hairLength != undefined) {
		$.cookie("hair-lenght", hairLength);
		$("body > .container").hide();
		$("#register-select-hair-color-page").show();
		history.pushState(null, "register select hair color", hostname + "?page=register-select-hair-color-page");
	} else {
		$("#register-select-hair-length-error").show();
	}
});

$("#register-select-hair-color-input").change(function(evt) {
	$("#register-select-hair-color-error").hide();
});

$("#register-select-hair-color-done-button").click(function(evt) {
	evt.preventDefault();
	var hairColor = $("#register-select-hair-color-input").val();
	if(hairColor != undefined) {
		$.cookie("hair-color", hairColor);
		$("body > .container").hide();
		$("#register-select-kids-page").show();
		history.pushState(null, "register select kids", hostname + "?page=register-select-kids-page");
	} else {
		$("#register-select-hair-color-error").show();
	}
});

$("#register-select-kids-input").change(function(evt) {
	$("#register-select-kids-error").hide();
});

$("#register-select-kids-done-button").click(function(evt) {
	evt.preventDefault();
	var kids = $("#register-select-kids-input").val();
	if(kids != undefined) {
		$.cookie("kids", kids);
		$("body > .container").hide();
		$("#register-select-accomodation-page").show();
		history.pushState(null, "register select accomodation", hostname + "?page=register-select-accomodation-page");
	} else {
		$("#register-select-kids-error").show();
	}
});


$("#register-select-accomodation-input").change(function(evt) {
	$("#register-select-accomodation-error").hide();
});

$("#register-select-accomodation-done-button").click(function(evt) {
	evt.preventDefault();
	var accomodation = $("#register-select-accomodation-input").val();
	if(accomodation != undefined) {
		$.cookie("accomodation", accomodation);
		$("body > .container").hide();
		$("#register-select-ethnic-identity-page").show();
		history.pushState(null, "register select ethnic identity", hostname + "?page=register-select-ethnic-identity-page");
	} else {
		$("#register-select-accomodation-error").show();
	}
});

$("#register-select-ethnic-identity-input").change(function(evt) {
	$("#register-select-ethnic-identity-error").hide();
});

$("#register-select-ethnic-identity-done-button").click(function(evt) {
	evt.preventDefault();
	var ethnicIdentity = $("#register-select-ethnic-identity-input");
	if(ethnicIdentity != undefined) {
		$.cookie("ethnic-identity", ethnicIdentity);
		$("body > .container").hide();
		$("#register-select-language-skills-page").show();
		history.pushState(null, "register select language skills", hostname + "?page=register-select-language-skills-page");
	} else {
		$("#register-select-ethnic-identity-error").show();
	}
});

$("#register-select-language-skills-input").change(function(evt) {
	$("#register-select-language-skills-error").hide();
});

$("#register-select-language-skills-done-button").click(function(evt) {
	evt.preventDefault();
	var languageSkills = $("#register-select-language-skills-input").val();
	if(languageSkills != undefined) {
		$.cookie("language-skills", languageSkills);
		$("body > .container").hide();
		$("#register-select-education-page").show();
		history.pushState(null, "register select education", hostname + "?page=register-select-education-page");
	} else {
		$("#register-select-language-skills-error").show();
	}
});

$("#register-select-education-input").change(function(evt) {
	$("#register-select-education-error").hide();
});

$("#register-select-education-done-button").click(function(evt) {
	evt.preventDefault();
	var education = $("#register-select-education-input").val();
	if(education != undefined) {
		$.cookie("education", education);
		$("body > .container").hide();
		$("#register-select-work-page").show();
		history.pushState(null, "register select work", hostname + "?page=register-select-work-page");
	} else {
		$("#register-select-education-error").show();
	}
});

$("#register-select-work-input").change(function(evt) {
	$("#register-select-work-error").hide();
});

$("#register-select-work-done-button").click(function(evt) {
	evt.preventDefault();
	var work = $("#register-select-work-input").val();
	if(work != undefined) {
		$.cookie("work", work);
		$("body > .container").hide();
		$("#register-select-income-page").show();
		history.pushState(null, "register select income", hostname + "?page=register-select-income-page");
	} else {
		$("#register-select-work-error").show();
	}
});

$("#register-select-income-input").change(function(evt) {
	$("#register-select-income-error").hide();
});

$("#register-select-income-done-button").click(function(evt) {
	evt.preventDefault();
	var income = $("#register-select-income-input").val();
	if(income != undefined) {
		$.cookie("income", income);
		$("body > .container").hide();
		$("#register-select-vocation-page").show();
		history.pushState(null, "register select vocation", hostname + "?page=register-select-vocation-page");
	} else {
		$("#register-select-income-error").show();
	}
});

$("#register-select-vocation-input").change(function(evt) {
	$("#register-select-vocation-error").hide();
});

$("#register-select-vocation-done-button").click(function(evt) {
	evt.preventDefault();
	var vocation = $("#register-select-vocation-input").val();
	if(vocation != undefined) {
		$.cookie("vocation", vocation);
		$("body > .container").hide();
		$("#register-select-dress-style-page").show();
		history.pushState(null, "register select dress style", hostname + "?page=register-select-dress-style-page");
	} else {
		$("#register-select-vocation-error").show();
	}
});

$("#register-select-dress-style-input").change(function(evt) {
	$("#register-select-dress-style-error").hide();
});

$("#register-select-dress-style-done-button").click(function(evt) {
	evt.preventDefault();
	var dressStyle = $("#register-select-dress-style-input").val();
	if(dressStyle != undefined) {
		$.cookie("dress-style", dressStyle);
		$("body > .container").hide();
		$("#register-select-smoking-page").show();
		history.pushState(null, "register select smoking", hostname + "?page=register-select-smoking-page");
	} else {
		$("#register-select-dress-style-error").show();
	}
});

$("#register-select-smoking-input").change(function(evt) {
	$("#register-select-smoking-error").hide();
});

$("#register-select-smoking-done-button").click(function(evt) {
	evt.preventDefault();
	var smoking = $("#register-select-smoking-input").val();
	if(smoking != undefined) {
		$.cookie("smoking", smoking);
		$("body > .container").hide();
		$("#register-select-alcohol-page").show();
		history.pushState(null, "register select alcohol", hostname + "?page=register-select-alcohol-page");
	} else {
		$("#register-select-smoking-error").show();
	}
});

$("#register-select-alcohol-input").change(function(evt) {
	$("#register-select-alcohol-error").hide();
});

$("#register-select-alcohol-done-button").click(function(evt) {
	evt.preventDefault();
	var alcohol = $("#register-select-alcohol-input").val();
	if(alcohol != undefined) {
		$.cookie("alcohol", alcohol);
		$("body > .container").hide();
		$("#register-select-pets-page").show();
		history.pushState(null, "register select pets", hostname + "?page=register-select-pets-page");
	} else {
		$("#register-select-alcohol-error").show();
	}
});

$("#register-select-pets-input").change(function(evt) {
	$("#register-select-pets-error").hide();
});

$("#register-select-pets-done-button").click(function(evt) {
	evt.preventDefault();
	var pets = $("#register-select-pets-input").val();
	if(pets != undefined) {
		$.cookie("pets", pets);
		$("body > .container").hide();
		$("#register-select-exercise-page").show();
		history.pushState(null, "register select exercise", hostname + "?page=register-select-exercise-page");
	} else {
		$("#register-select-pets-error").show();
	}
});

$("#register-select-exercise-input").change(function(evt) {
	$("#register-select-exercise-error").hide();
});

$("#register-select-exercise-done-button").click(function(evt) {
	evt.preventDefault();
	var exercise = $("#register-select-exercise-input").val();
	if(exercise != undefined) {
		$.cookie("exercise", exercise);
		$("body > .container").hide();
		$("#register-select-travel-page").show();
		history.pushState(null, "register select travel", hostname + "?page=register-select-travel-page");
	} else {
		$("#register-select-exercise-error").show();
	} 
});

$("#register-select-travel-input").change(function(evt) {
	$("#register-select-travel-error").hide();
});

$("#register-select-travel-done-button").click(function(evt) {
	evt.preventDefault();
	var travel = $("#register-select-travel-input").val();
	if(travel != undefined) {
		$.cookie("travel", travel);
		$("body > .container").hide();
		$("#register-select-religion-page").show();
		history.pushState(null, "register select religion", hostname + "?page=register-select-religion-page");
	} else {
		$("#register-select-travel-error").show();
	}
}); 

$("#register-select-religion-input").change(function(evt) {
	$("#register-select-religion-error").hide();
});

$("#register-select-religion-done-button").click(function(evt) {
	evt.preventDefault();
	var religion = $("#register-select-religion-input").val();
	if(religion != undefined) {
		$.cookie("religion", religion);
		$("body > .container").hide();
		$("#register-select-religion-importance-page").show();
		history.pushState(null, "register select religion importance", hostname + "?page=register-select-religion-importance-page");
	} else {
		$("#register-select-religion-error").show();
	}
});

$("#register-select-religion-importance-input").change(function(evt) {
	$("#register-select-religion-importance-error").hide();
});

$("#register-select-religion-importance-done-button").click(function(evt) {
	evt.preventDefault();
	var religionImportance = $("#register-select-religion-importance-input").val();
	if(religionImportance != undefined) {
		$.cookie("religion-importance", religionImportance);
		$("body > .container").hide();
		$("#register-select-left-right-politics-page").show();
		history.pushState(null, "register select left-right politics", hostname + "?page=register-select-left-right-politics-page");
	} else {
		$("#register-select-religion-error").show();
	}
});

$("#register-select-left-right-politics-input").change(function(evt) {
	$("#register-select-left-right-politics-error").hide();
});

$("#register-select-left-right-politics-done-button").click(function(evt) {
	evt.preventDefault();
	var leftRight = $("#register-select-left-right-politics-input").val();
	if(leftRight != undefined) {
		$.cookie("left-right-politics", leftRight);
		$("body > .container").hide();
		$("#register-select-liberal-conservative-politics-page").show();
		history.pushState(null, "register select liberal and conservative politics", hostname + "?page=register-select-liberal-conservative-politics-page");
	} else {
		$("#register-select-left-right-politics-error").show();
	}
});

$("#register-select-liberal-conservative-politics-input").change(function(evt) {
	$("#register-select-liberal-conservative-politics-error").hide();
});

$("#register-select-liberal-conservative-politics-done-button").click(function(evt) {
	evt.preventDefault();
	var liberalConservative = $("#register-select-liberal-conservative-politics-input").val();
	if(liberalConservative != undefined) {
		$.cookie("liberal-conservative-politics", liberalConservative);
		$("body > .container").hide();
		$("#register-select-political-importance-page").show();
		history.pushState(null, "register select political importance", hostname + "?page=register-select-political-importance-page");
	} else {
		$("#register-select-liberal-conservative-politics-error").show();
	}
});

$("#register-select-political-importance-input").change(function(evt) {
	$("#register-select-political-importance-error").hide();
});

$("#register-select-political-importance-done-button").click(function(evt) {
	evt.preventDefault();
	var politicalImportance = $("#register-select-political-importance-input").val();
	if(politicalImportance != undefined) {
		$.cookie("political-importance", politicalImportance);
		$("body > .container").hide();
		$("#register-select-favorite-television-series-page").show();
		history.pushState(null, "register select favorite television series", hostname + "?page=register-select-favorite-television-series-page");
	} else {
		$("#register-select-political-importance-error").show();
	}
});

$("#register-select-favorite-television-series-done-button").click(function(evt) {
	evt.preventDefault();
	var favoriteTelevisionSeries = $("#register-select-favorite-television-series-input").val();
	$.cookie("favorite-television-series", favoriteTelevisionSeries);
	$("body > .container").hide();
	$("#register-select-favorite-radio-shows-page").show();
	history.pushState(null, "register select favorite radio shows", hostname + "?page=register-select-favorite-radio-shows-page");
});

$("#register-select-favorite-radio-shows-done-button").click(function(evt) {
	evt.preventDefault();
	var favoriteRadioShows = $("#register-select-favorite-radio-shows-input").val();
	$.cookie("favorite-radio-shows", favoriteRadioShows);
	$("body > .container").hide();
	$("#register-select-favorite-bands-page").show();
	history.pushState(null, "register select favorite bands", hostname + "?page=register-select-favorite-bands-page");  
});

$("#register-select-favorite-bands-done-button").click(function(evt) {
	evt.preventDefault();
	var favoriteBands = $("#register-select-favorite-bands-input").val();
	$.cookie("favorite-bands", favoriteBands);
	$("body > .container").hide();
	$("#register-select-favorite-movies-page").show();
	history.pushState(null, "register select favorite movies", hostname + "?page=register-select-favorite-movies-page");
});

$("#register-select-favorite-movies-done-button").click(function(evt) {
	evt.preventDefault();
	var favoriteMovies = $("#register-select-favorite-movies-input").val();
	$.cookie("favorite-movies", favoriteMovies);
	$("body > .container").hide();
	$("#register-select-best-things-in-the-world-page").show();
	history.pushState(null, "register select best things of the world", hostname + "?page=register-select-best-things-in-the-world-page");
});

$("#register-select-best-things-in-the-world-done-button").click(function(evt) {
	evt.preventDefault();
	var bestThingsInTheWorld = $("#register-select-best-things-in-the-world-input").val();
	$.cookie("best-things-in-the-world", bestThingsInTheWorld);
	$("body > .container").hide();
	$("#register-select-ignite-me-page").show();
	history.pushState(null, "register select ignite me", hostname + "?page=register-select-ignite-me-page");
});

$("#register-select-ignite-me-done-button").click(function(evt) {
	evt.preventDefault();
	var igniteMe = $("#register-select-ignite-me-input").val();
	$.cookie("ignite-me", igniteMe);
	$("body > .container").hide();
	$("#register-select-not-exciting-page").show();
	history.pushState(null, "register select not exciting", hostname + "?page=register-select-not-exciting-page");
});

$("#register-select-not-exciting-done-button").click(function(evt) {
	evt.preventDefault();
	var notExciting = $("#register-select-not-exciting-input").val();
	$.cookie("not-exciting", notExciting);
	$("body > .container").hide();
	$("#register-confirm-profile-information-page").show();
	history.pushState(null, "register confirm profile information", hostname + "?page=register-confirm-profile-information-page");
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

$("#register-confirm-profile-information-page").on("show", function() {
	var address = $.cookie("address");
	address = address.replace(/\+/gi, " ");
	$("#register-confirm-address-data").val(address);
	
	var gender = $.cookie("gender");
	if(gender == "man") {
		$("#register-confirm-gender-data").val("Mies");
	} else if(gender == "woman") {
		$("#register-confirm-gender-data").val("Nainen");
	} else if(gender == "transman") {
		$("#register-confirm-gender-data").val("Transmies");
	} else if(gender == "transwoman") {
		$("#register-confirm-gender-data").val("Transnainen");
	} else if(gender == "sexless") {
		$("#register-confirm-gender-data").val("Sukupuoleton");
	}

	var birthday = $.cookie("birthday");
	var birthdayArr = birthday.split("-");
	$("#register-confirm-birthday-data").val(birthdayArr[2] + "/" + birthdayArr[1] + "/" + birthdayArr[0]);

	var relationshipStatus = $.cookie("relationship-status");
	if(relationshipStatus == "single") {
		$("#register-confirm-relationship-status-data").val("Sinkku");
	} else if(relationshipStatus == "relationship") {
		$("#register-confirm-relationship-status-data").val("Parisuhde");
	} else if(relationshipStatus == "marriage") {
		$("#register-confirm-relationship-status-data").val("Avioliitto");
	} else if(relationshipStatus == "divorced") {
		$("#register-confirm-relationship-status-data").val("Eronnut");
	} else if(relationshipStatus == "seperation") {
		$("#register-confirm-relationship-status-data").val("Asumusero");
	} else if(relationshipStatus == "widow") {
		$("#register-confirm-relationship-status-data").val("Leski");
	} else if(relationshipStatus == "none") {
		$("#register-confirm-relationship-status-data").val("En halua kertoa");
	}

	var sexualOrientation = $.cookie("sexual-orientation");
	if(sexualOrientation == "hetero") {
		$("#register-confirm-sexual-orientation-data").val("Heteroseksuaali");
	} else if(sexualOrientation == "gay") {
		$("#register-confirm-sexual-orientation-data").val("Homoseksuaali");
	} else if(sexualOrientation == "bi") {
		$("#register-confirm-sexual-orientation-data").val("Bisexsuaali");
	} else if(sexualOrientation == "ase") {
		$("#register-confirm-sexual-orientation-data").val("Aseksuaali");
	}

	var lookingFor = $.cookie("looking-for");
	var lookingForArr = lookingFor.split(",");
	var i;
	for(i = 0; i < lookingForArr.length; i++) {
		if(lookingForArr[i] == "friends") {
			lookingForArr[i] = "Ystävyyttä";
		} else if(lookingForArr[i] == "love") {
			lookingForArr[i] = "Rakkautta";
		} else if(lookingForArr[i] == "date") {
			lookingForArr[i] = "Tapaamisia";
		} else if(lookingForArr[i] == "sex") {
			lookingForArr[i] = "Seksiä";
		} else if(lookingForArr[i] == "other") {
			lookingForArr[i] = "Jotain muuta";
		} else if(lookingForArr[i] == "none") {
			lookingForArr[i] == "En halua kertoa";
		}
	}
	var lookingForParsed = lookingForArr.join(", ");
	$("#register-confirm-looking-for-data").val(lookingForParsed);
	
	$("#register-confirm-height-data").val($.cookie("height") + " cm");
	$("#register-confirm-weight-data").val($.cookie("weight") + " kg");

	var bodyType = $.cookie("body-type");
	if(bodyType == "slender") {
		bodyType = "Siro";
	} else if(bodyType == "slim") {
		bodyType = "Hoikka";
	} else if(bodyType == "low-fat") {
		bodyType = "Vähärasvainen";
	} else if(bodyType == "sporty") {
		bodyType = "Sporttinen";
	} else if(bodyType == "muscular") {
		bodyType = "Lihaksikas";
	} else if(bodyType == "roundish") {
		bodyType = "Pyöreähkö";
	} else if(bodyType == "overweight") {
		bodyType = "Ylipainoinen";
	} else if(bodyType == "none") {
		bodyType = "En halua kertoa";
	}
	$("#register-confirm-body-type-data").val(bodyType);

	var eyeColor = $.cookie("eye-color");
	if(eyeColor == "blue") {
		eyeColor = "Sininen";
	} else if(eyeColor == "brown") {
		eyeColor = "Ruskea";
	} else if(eyeColor == "green") {
		eyeColor = "Vihreä";
	} else if(eyeColor == "gray") {
		eyeColor = "Harmaa";
	} else if(eyeColor == "amber") {
		eyeColor = "Kullanruskea";
	} else if(eyeColor == "hazel") {
		eyeColor = "Pähkinänruseka";
	} else if(eyeColor == "red") {
		eyeColor = "Punainen";
	} else if(eyeColor == "violet") {
		eyeColor = "Violetti";
	} else if(eyeColor == "none") {
		eyeColor = "En halua kertoa";
	}
	$("#register-confirm-eye-color-data").val(eyeColor);
});

var map;

$("#register-select-location-page").on("show", function() {
	var map_canvas = document.getElementById("google_map_canvas");
	var map_options = {
		center: new google.maps.LatLng(61.4894846, 21.7298981),
		zoom: 4,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(map_canvas, map_options);
});

$("#register-select-street-address-input").change(function(evt) {
	$("#register-select-location-page-error").hide();
});

$("#register-select-municipality-input").change(function(evt) {
	$("#register-select-location-page-error").hide();
});

$("#register-select-country-input").change(function(evt) {
	$("#register-select-location-page-error").hide();

});

$("#register-select-location-show-on-map").click(function(evt) {
	evt.preventDefault();
	if(window.map == undefined) {
		show_register_select_location_page();
	}
	var street_address = $("#register-select-street-address-input").val();
	var municipality = $("#register-select-municipality-input").val();
	var country = $("#register-select-country-input").val();
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
	var street_address = $("#register-select-street-address-input").val();
	var municipality = $("#register-select-municipality-input").val();
	var country = $("#register-select-country-input").val();
	var street_address_replaced = street_address.replace(" ", "+");
	var municipality_replaced = municipality.replace(" ", "+");
	var country_replaced = country.replace(" ", "+");
	var jaddress = street_address_replaced + "+" + municipality_replaced + "+" + country_replaced;
	$.cookie("address", jaddress);
	$.ajax({
		url: "http://maps.googleapis.com/maps/api/geocode/json",
		type: "GET",
		data: { address : jaddress, sensor: false  }	
	}).done(function(data) {
		if(data.status == "OK") {
			var myLatLong = new google.maps.LatLng(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng)
			$.cookie("latlng", myLatLong);
			$("body > .container").hide();
			$("#register-select-profile-picture-page").show();
			history.pushState(null, "register select profile picture", hostname + "?page=register-select-profile-picture-page");
		} else {
			$("#register-select-location-page-error").show();
			console.log("Failed to retrieve address location");
		}
	});
});
