function get_url_parameter(param) {
  var url = window.location.search.substring(1);
	var variables = url.split('&');
	for(var i = 0; i < variables.length; i++) {
		var parameter = variables[i].split('=');
		if(parameter[0] === param) {
			return parameter[1];
		}
	}
	return undefined;
}

function sleep(millis, callback) {
	setTimeout(function() {
		callback();
	}, millis);
}

function rad(x) {
	return x * Math.PI / 180;
}
/*
function do_distance_work() {
	var session = $.cookie("session");
	$.ajax({
		url: "php/api.php",
		type: "POST",
		async: true,
		data: { call : "get_work", work_type : "distance", session : session }
	}).done(function(data) {
		console.log(data);
		data = $.parseJSON(data);
		if(data.success === true) {
			var R = 6378137;
			var dLat = rad(data.work.end.latitude - data.work.start.latitude);
			var dLong = rad(data.work.end.longitude - data.work.start.longitude);
			var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
				Math.cos(rad(data.work.start.latitude)) * Math.cos(rad(data.work.end.latitude)) * 
				Math.sin(dLong / 2) * Math.sin(dLong / 2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			var d = R * c;
			console.log("Distance in meters: " + d);
			var session = $.cookie("session");
			$.ajax({
				url: "php/api.php",
				type: "POST",
				async: true,
				data: { call : "set_work", work_type : "distance", session : session,
					start : data.work.start.identifier, end : data.work.end.identifier,
					distance : d }
			}).done(function(data) {
				console.log(data);
				data = $.parseJSON(data);
				if(data.success === true) {
					success = true;
				} else {
					console.log(data.error);
					success = false;
				}
			});
		} else {
			console.log(data.error);
			success = false;
		}
	});
}
*/
function open_session(username, password) {
	$.ajax({
		url: "php/api.php",
		type: "GET",
		async: false,
		data: { call : 'open_session', username : username, password : password }
	}).done(function(data) {
		console.log(data);
		var result = $.parseJSON(data);
		if(result.success === true) {
			$.cookie("session", result.session);
		} else {
			if($.cookie("session") !== undefined) {
				$.removeCookie("session");
			}
		}
	});
}

function close_session() {
	var session = $.cookie("session");
	$.ajax({
		url: "php/api.php",
		type: "POST",
		async: false,
		data: { call: 'close_session', session: session }
	}).done(function(data) {
		console.log(data);
		var result = $.parseJSON(data);
		if(result.success === true) {
			if($.cookie("session") !== undefined) {
				$.removeCookie("session");
			}
			$("#user-menu").hide();
			$("#authentication-form").show();
			load_home_page();
		} else {
			console.log("Error: " + result.error);
		}
	});
}

function check_session() {
	update_session();
	if($.cookie("session") !== undefined) {
		return true;
	} else {
		return false;
	}
}

function update_session() {
	var session = $.cookie("session");
	if(session !== undefined) {
		$.ajax({
			url: "php/api.php",
			type: "POST",
			async: false,
			data: { call : 'update_session', session : session }
		}).done(function(data) {
			console.log(data);
			var result = $.parseJSON(data);
			if(result.success === true) {
				$.cookie("session", result.session);
			} else {
				if($.cookie("session") !== undefined) {
					$.removeCookie("session");
				}
			}
		});
	} else {
		console.log("Session was not found.");
		$("#user-menu").hide();
		$("#authentication-form").show();
		$("#register-information-jumbotron").show();
	}
}

function get_username(uid) {
	var username;
	$.ajax({
		url: "php/api.php",
		type: "POST",
		async: false,
		data: { call : 'get_username', uid : uid }
	}).done(function(data) {
		console.log(data);
		var result = $.parseJSON(data);
		if(result.success === true) {
			username = result.username;
		} else {
			console.log(result.error);
			if(result.error == "Failed to confirm session") {
				close_session();
			}
			return false;
		}
	});
	return username;
}

function get_profile(uid) {
	var profile;
	$.ajax({
		url: "php/api.php",
		type: "POST",
		async: false,
		data: { call : 'get_profile', uid : uid }
	}).done(function(data) {
		console.log(data);
		var result = $.parseJSON(data);
		if(result.success === true) {
			profile = result.profile;
		} else {
			console.log(result.error);
			profile = result.error;
			if(result.error = "Failed to confirm session") {
				close_session();
			}	
		}
	});
	return profile;
}

function register_select_profile_picture(picture) {
	$.cookie("picture", picture);
	if($("#register-select-profile-picture-name").length === 0) {
		$("#register-select-profile-picture-page").append("<div class\"row\" id=\"register-select-profile-picture-success-alert\"><div class=\"alert alert-success\" id=\"register-select-profile-picture-name\"><p>Valitsit " + picture + " profiili kuvaksesi.</p></div></div>");
	} else {
		$("#register-select-profile-picture-name").html("<p>Valitsit " + picture + " profiili kuvaksesi.</p>");
	}
	if($("#register-select-profile-picture-done-button").length === 0) {
		$("#register-select-profile-picture-name").append("<button class=\"btn btn-default\" id=\"register-select-profile-picture-done-button\" onclick=\"register_select_profile_picture_done_button(); return false;\">Jatka</button>");
	}
}

function get_town(latlng) {
	var town;
	latlng = latlng.replace(/\(/g, '');
	latlng = latlng.replace(/\)/g, '');
	latlng = latlng.replace(/\ /g, '');
	console.log(latlng);
	$.ajax({
		url: "https://maps.googleapis.com/maps/api/geocode/json",
		type: "GET",
		dataType: 'json',
		async: false,
		data: { latlng: latlng, sensor: true }
	}).done(function(data) {
		console.log(data);
		if(data.status === "OK") {
			for(var i = 0; i < data.results[0].address_components.length; i++) {
				if(data.results[0].address_components[i].types[0] === "locality") {
					town = data.results[0].address_components[i].long_name;
					break;
				}
			}
		} else {
			town = "";
		}
	});
	return town;
}

var hostname;

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


function register_select_profile_picture_done_button() {
	load_page("register-select-profile-text-page");
}

function load_home_page() {
	$("body > .container").hide();
	$("#home-page").show();
	$("#web-advertisement").show();
	if(check_session() === true) {
		// disable register jumbotron
		$("#home-page-register").hide();
		$("#home-page-features").hide();
	} else {
		$("#home-page-register").show();
		$("#home-page-features").show();
	}
	history.pushState(null, "home-page", hostname);
}

function load_page(page) {
	$("body > .container").hide();
	$("#" + page).show();
	$("#web-advertisement").show();
	history.pushState(null, page, hostname + "?page=" + page);
}

function load_custom_page(page, addons) {
	$("body > .container").hide();
	$("#" + page).show();
	$("#web-advertisement").show();
	history.pushState(null, page, hostname + "?page=" + page + addons);
}

function gender(g) {
	switch(g) {
		case 'man':
			return "Mies";
		case 'woman':
			return "Nainen";
		case 'transman':
			return "Transmies";
		case 'transwoman':
			return "Transnainen";
		case 'sexless':
			return "Sukupuoleton";
		case 'Mies':
			return "man";
		case 'Nainen':
			return "nainen";
		case 'Transmies':
			return "transman";
		case 'Transnainen':
			return "transwoman";
		case 'Sukupuoleton':
			return "sexless";
	}
}

function looking_for(lookingFor) {
	switch(lookingFor) {
		case 'friends':
			return "Ystäviä";
		case 'love':
			return "Rakkautta";
		case 'date':
			return "Tapaamisia";
		case 'sex':
			return "Seksiä";
		case 'other':
			return "Jotain muuta";
		case 'none':
			return "En halua kertoa";
		case 'Ystäviä':
			return "friends";
		case 'Rakkautta':
			return "love";
		case 'Tapaamisia':
			return "date";
		case 'Jotain muuta':
			return "other";
		case 'En halua kertoa':
			return "none";
	}
}

function recursive_looking_for(lookingFor) {
	var lookingForArr = lookingFor.split(", ");
	console.log(lookingForArr);
	if(lookingForArr.length == 1) {
		lookingForArr = lookingFor.split(",");
	}
	console.log(lookingForArr);
	for(var i = 0; i < lookingForArr.length; i++) {
		lookingForArr[i] = looking_for(lookingForArr[i]);
	}
	return lookingForArr.join(",");
}

function relationship_status(s) {
	switch(s) {
		case 'single': return "Sinkku";
		case 'relationship': return "Parisuhde";
		case 'cohabitation': return "Avoliitto";
		case 'marriage': return "Avioliitto";
		case 'divorced': return "Eronnut";
		case 'seperation': return "Asumusero";
		case 'widow': return "Leski";
		case 'none': return "En halua kerota";
		case 'Sinkku': return "single";
		case 'Parisuhde': return "relationship";
		case 'Avoliitto': return "cohabitation";
		case 'Avioliitto': return "marriage";
		case 'Eronnut': return "divorced";
		case 'Asumusero': return "seperation";
		case 'Leski': return "widow";
		case 'En halua kertoa': return "none";
		
	}
}

function odd_relationship_status(s) {
	switch(s) {
		case 'Sinkku': return "sinkku";
		case 'Parisuhde': return "parisuhteessa elävä";
		case 'Avoliitto': return "avoliitossa elävä";
		case 'Avioliitto': return "avioliitossa elävä";
		case 'Eronnut': return "eronnut";
		case 'Asumusero': return "asumuserossa elävä";
		case 'Leski': return "leski";
		case 'En halua kertoa': return "";
	}
}

function unknown_town(town) {
	// TODO: write ajax query to save unknown towns in to file.
	return town;
}


function from_town(town) {
	switch(town) {
		case 'Akaa': return "Akaasta";
		case 'Alajärvi': return "Alajärveltä";
		case 'Alavus': return "Alavukselta";
		case 'Espoo': return "Espoosta";
		case 'Forssa': return "Forssasta";
		case 'Haapajärvi': return "Haapajärveltä";
		case 'Haapavesi': return "Haapavedeltä";
		case 'Hämeenlinna': return "Hämeenlinnasta";
		case 'Hamina': return "Haminasta";
		case 'Hanko': return "Hangosta";
		case 'Harjavalta': return "Harjavallasta";
		case 'Haukipudas': return "Haikupudaasta";
		case 'Heinola': return "Heinolasta";
		case 'Helsinki': return "Helsingistä";
		case 'Huittinen': return "Huittisista";
		case 'Hyvinkää': return "Hyvinkäältä";
		case 'Iisalmi': return "Iisalmesta";
		case 'Ikaalinen': return "Ikaalisesta";
		case 'Imatra': return "Imatralta";
		case 'Pietarsaari': return "Pietarsaaresta";
		case 'Joensuu': return "Joensuusta";
		case 'Juankoski': return "Juankoskelta";
		case 'Jyväskylä': return "Jyväskylästä";
		case 'Jämsä': return "Jämsästä";
		case 'Järvenpää': return "Järvenpäästä";
		case 'Kaarina': return "Kaarinasta";
		case 'Kajaani': return "Kajaanista";
		case 'Kalajoki': return "Kalajoelta";
		case 'Kankaanpäästä': return "Kankaanpäästä";
		case 'Kannus': return "Kannuksesta";
		case 'Karkkila': return "Karkkilasta";
		case 'Kaskinen': return "Kaskilasta";
		case 'Kauhajoki': return "Kauhajoelta";
		case 'Kauhava': return "Kauhavalta";
		case 'Kauniainen': return "Kauniaisista";
		case 'Kemi': return "Kemistä";
		case 'Kemijärvi': return "Kemijärveltä";
		case 'Kerava': return "Keravasta";
		case 'Keuruu': return "Keuruusta";
		case 'Kitee': return "Kiteestä";
		case 'Kiuruvesi': return "Kiuruvedeltä";
		case 'Kokemäki': return "Kokemäeltä";
		case 'Kokkola': return "Kokkolasta";
		case 'Kotka': return "Kotkasta";
		case 'Kouvola': return "Kouvolasta";
		case 'Kristiinankaupunki': return "Kristiinankaupungista";
		case 'Kuhmo': return "Kuhmosta";
		case 'Kuopio': return "Kuopiosta";
		case 'Kurikka': return "Kurikasta";
		case 'Kuusamo': return "Kuusamosta";
		case 'Lahti': return "Lahdesta";
		case 'Laitila': return "Laitilasta";
		case 'Lappeenranta': return "Lappeenrannasta";
		case 'Lapua': return "Lapualta";
		case 'Lieksa': return "Lieksasta";
		case 'Lohja': return "Lohjalta";
		case 'Loimaa': return "Loimaalta";
		case 'Loviisa': return "Loviisasta";
		case 'Mänttä-Vilppula': return "Mänttä-Vilppulasta";
		case 'Maarianhamina': return "Maarianhaminasta";
		case 'Mikkeli': return "Mikkelistä";
		case 'Naantali': return "Naantalista";
		case 'Närpiö': return "Närpiöstä";
		case 'Nilsiä': return "Nilsiästä";
		case 'Nivala': return "Nivalasta";
		case 'Nokia': return "Nokialta";
		case 'Nurmes': return "Nurmesta";
		case 'Uusikaarlepyy': return "Uusikaarlepyystä";
		case 'Orimattila': return "Orimattilasta";
		case 'Orivesi': return "Orivedestä";
		case 'Oulainen': return "Oulaisista";
		case 'Oulu': return "Oulusta";
		case 'Outokumpu': return "Outokummusta";
		case 'Paimi': return "Paimiosta";
		case 'Parainen': return "Paraisesta";
		case 'Parkano': return "Parkanosta";
		case 'Pieksämäki': return "Pieksämäeltä";
		case 'Pori': return "Porista";
		case 'Porvoo': return "Porvoosta";
		case 'Pudasjärvi': return "Pudasjärveltä";
		case 'Pyhäjärvi': return "Pyhäjärveötä";
		case 'Raahe': return "Raahesta";
		case 'Raasepori': return "Raaseporista";
		case 'Rauma': return "Raumalta";
		case 'Raisio': return "Raisiosta";
		case 'Riihimäki': return "Riihimäeltä";
		case 'Rovaniemi': return "Rovaniemestä";
		case 'Saarijärvi': return "Saarijärveltä";
		case 'Salo': return "Salosta";
		case 'Sastamala': return "Sastamalasta";
		case 'Savonlinna': return "Savonlinnasta";
		case 'Seinäjoki': return "Seinäjoelta";
		case 'Siuntio': return "Siuntiosta";
		case 'Somero': return "Somerosta";
		case 'Suonenjoki': return "Suonenjoelta";
		case 'Tampere': return "Tampereelta";
		case 'Tornio': return "Torniosta";
		case 'Turku': return "Turusta";
		case 'Ulvila': return "Ulvilasta";
		case 'Uusikaupunki': return "Uusikaupungista";
		case 'Vaasa': return "Vaasasta";
		case 'Valkeakoski': return "Valkeakoskelta";
		case 'Vantaa': return "Vantaalta";
		case 'Varkaus': return "Varkaudesta";
		case 'Viitasaari': return "Viitasaaresta";
		case 'Virrat': return "Virrasta";
		case 'Ylivieska': return "Ylivieskasta";
		case 'Ylöjärvi': return "Ylöjärveltä";
		case 'Äänekoski': return "Äänekoskelta";
		case 'Ähtäri': return "Ähtäristä";
		default: return unknown_town(town);
	}
}


function get_distance(my_uid, his_uid) {
	var distance;
	$.ajax({
		url: "php/api.php",
		type: "POST",
		async: false,
		data: { call : 'get_distance', my_uid : my_uid, his_uid : his_uid }
	}).done(function(data) {
		console.log(data);
		data = $.parseJSON(data);
		if(data.success === true) {
			distance = data.distance;
		} else {
			console.log(data.error);
			if(data.error == "Failed to confirm session") {
				close_session();
			}
		}
	});
	return distance;
}

function load_profile_page(uid) {
	var vuid;
	if($.cookie("session") !== undefined) {
		var session = window.atob($.cookie("session"));
		var rsession = session.split("||");
		vuid = rsession[1];
		if(vuid === uid) {
			$("#profile-page-top-bar-menu-send-msg").hide();
			$("#profile-page-top-bar-menu-add-friend").hide();
			$("#profile-page-top-bar-menu-request-date").hide();
			$("#profile-page-top-bar-menu-block-user").hide();
			$("#profile-page-top-bar-menu-report-user").hide();
		} else {
			$("#profile-page-top-bar-menu-send-msg").show();
			$("#profile-page-top-bar-menu-add-friend").show();
			$("#profile-page-top-bar-menu-request-date").show();
			$("#profile-page-top-bar-menu-block-user").show();
			$("#profile-page-top-bar-menu-report-user").show();
		}
	}
	var profile = get_profile(uid);
	$.cookie("last-viewed-profile", profile.identifier);
	
	var username = get_username(uid);
	if(username == false) {
		return false;
	}	
	var profile_text = "<h1><b class=\"glyphicon glyphicon-user\"></b> " + username;

	if(uid !== vuid) {
		var distance = parseInt(get_distance(vuid, uid));
		if(!isNaN(distance)) {
			if(distance < 1000) {
				profile_text += " asuu " + distance + " metrin päässä.";
			} else {
				profile_text += " asuu " + distance / 1000 + " kilometrin päässä.";
			} 
		}
	}
		
	profile_text += "</h1>";
	
	$("#profile-page-top-bar-username").html(profile_text);
	
	if(profile.picture != "") {	
		$("#profile-page-main-picture").children("img").attr("src", "uploads/" + profile.picture);
	} else {
		$("#profile-page-main-picture").children("img").attr("src", "uploads/default.jpg");
	}
	
	var cTime = new Date();
	var cYear = cTime.getFullYear();
	if(profile.birthday != "0000-00-00") {
		var birthday = profile.birthday.split("-");
		var age = cYear - birthday[0];
	} else {
		var age = "";
	}

	var relationshipStatus = odd_relationship_status(relationship_status(profile.relationship_status));
	if(relationshipStatus == undefined) {
		relationshipStatus = "";
	}
	
	var sGender = gender(profile.gender);

	var town = from_town(get_town(profile.latlng));
	if(town == undefined) {
		town = "";
	}
		
	var asl = "<h2> Olen ";

	if(age != "") {
		asl += age + " vuotias ";
	}
	
	asl += relationshipStatus + " " + sGender.toLowerCase() + " " + town
	
	if(profile.looking_for == "null") {
		asl = asl + ".</h2>";
	} else {
		var lookingFor = recursive_looking_for(profile.looking_for);
		var lookingForArr = lookingFor.split(",");
		lookingFor = lookingForArr.join(", ");
		lookingFor = lookingFor.replace(/,\s([^,]+)$/, " ja $1");	
		asl = asl + " joka etsii " + lookingFor.toLowerCase() + ".</h2>";
	}

	$("#profile-page-basic-information-asl").html(asl);
	if(vuid !== uid) {
		load_custom_page("profile-page", "&uid=" + uid);
	} else {
		load_page("profile-page");
	}
	$(window).resize(function() {
		resize_profile_picture();
	});
}

function resize_profile_picture() {
	var width = $("#profile-page-main-picture").width();
	width = width;
	$("#profile-page-main-picture").attr("width", width + "px");
	$("#profile-page-main-picture").attr("height", width + "px");
}

function get_discussion(suid, ruid) {
	var discussion;
	$.ajax({
		url: "php/api.php",
		type: "POST",
		async: false,
		data: { call : 'get_discussion', suid : suid, ruid : ruid, limit : 30 }
	}).done(function(data) {
		console.log(data);
		data = $.parseJSON(data);
		if(data.success === true) {
			discussion = data.discussion;
		} else {
			console.log(data.error);
			if(data.error == "Failed to confirm session") {
				close_session();
			}
			discussion = false;
		}
	});
	return discussion;
}

function get_discussions(uid) {
	var discussions;
	$.ajax({
		url: "php/api.php",
		type: "POST",
		async: false,
		data: { call : 'get_discussions', uid : uid }
	}).done(function(data) {
		console.log(data);
		data = $.parseJSON(data);
		if(data.success === true) {
			discussions = data.discussions;
		} else {
			console.log(data.error);
			if(data.error == "Failed to confirm session.") {
				close_session();
			}
			discussions = false;
		}
	});
	return discussions;
}

function get_unread_messages(only_count) {
	var result;
	$.ajax({
		url: "php/api.php",
		type:  "POST", 
		async: false,
		data: { call : 'get_unread_messages', only_count : only_count }
	}).done(function(data) {
		console.log(data);
		data = $.parseJSON(data);
		if(data.success == true) {
			result = data;
		} else {
			result = false;
		}
	});
	return result;
}

function long_pull_messages(suid) {
	if($("#messages-page").is(":visible")) {
		$.ajax({
			url: "php/api.php",
			type: "POST", 
			async: true,
			data: { call : 'long_pull_messages', suid : suid }
		}).done(function(data) {
			console.log(data);
			data = $.parseJSON(data);
			if(data.success == true) {
				if($("#messages-page").is(":visible")) {	
					if(data.message != undefined) {
						var newMsg = "<div class=\"panel panel-default\" style=\"width: 80%; float: left; text-align: left;\">";
						newMsg += "<div class=\"panel-body\" style=\"padding: 0px;\">";
						var username = get_username(suid);
						newMsg += "<p style=\"padding: 5px; margin: 0px;\"><b>" + username + ":</b></p>";
						newMsg += "<p style=\"padding: 5px; margin: 0px;\">" + data.message.message + "</p>";
						newMsg += "</div></div>";
						$("#messages-page-conversation-messages").append(newMsg);
						$("#messages-page-conversation-messages").scrollTop($("#messages-page-conversation-messages")[0].scrollHeight);		
						set_message_to_seen(data.message.mid);
					}
					long_pull_messages(suid);
				}
			}
		});
	} else {
		return false;
	}
}

function set_message_to_seen(mid) {
	var result;
	$.ajax({
		url: "php/api.php",
		type: "POST",	
		async: false,
		data: { call : 'set_message_as_read', mid : mid }
	}).done(function(data) {
		console.log(data);
		data = $.parseJSON(data);
		if(data.success == true) {
			$(".unread_message_id").each(function(i, obj) {
				if($(obj).html() == mid) { 
					$(obj).parent().parent().remove(); 
					var count = parseInt($("#user-menu-messages > .dropdown-menu > #empty > a > #count").html());
					count -= 1;
					if(count > 0) {
						$("#user-menu-messages > .dropdown-menu > #empty > a").html("<i id=\"count\" style=\"display: none;\">" + count + "</i>" + count + " uutta viestiä.");
					} else {
						$("#user-menu-messages > .dropdown-menu > #empty > a").html("<i id=\"count\" style=\"display: none;\">0</i>Ei uusia viestejä.");
					}
				}
			});
			result = true;
		} else {
			result = false;
		}
	});
	return result;
}

function update_unread_messages() {
	var unread = get_unread_messages("false");
	// "{"success":true,"count":1,"messages":[{"mid":"125","sender_name":"TMKCodes","sender_uid":"214","receiver_name":"aa","receiver_uid":"189","timestamp":"2014-07-07 15:19:50","seen":"0","type":"text","message":"uusi viesti!"}]}"
	if(unread.count != undefined) {
		$("#user-menu-messages > .dropdown-menu > #empty > a").html("<i id=\"count\" style=\"display: none;\">" + unread.count + "</i>" + unread.count + " uutta viestiä."); 
		var list = "";
		var shown = new Array();
		$(".unread_message_id").each(function(i, obj) { shown.push($(obj).html()); } );
		for(var i = 0; i < unread.count; i++) {
			if(jQuery.inArray(unread.messages[i].mid, shown) == -1) {
				list += "<li class=\"notification\"><a href=\"#\">";
				list += "<i class=\"unread_message_id\" style=\"display: none;\">" + unread.messages[i].mid + "</i>";
				list += "<i class=\"unread_sender_uid\" style=\"display: none;\">" + unread.messages[i].sender_uid + "</i>";
				list += unread.messages[i].sender_name + " lähetti sinulle uuden viestin.</a></li>";
			}
		}
		$("#user-menu-messages > .dropdown-menu").prepend(list);
		$(".notification > a").click(function() {
			var suid = parseInt($(this).children(".unread_sender_uid").html());
			if($.cookie("session") !== undefined) {
				var session = window.atob($.cookie("session"));
				session = session.split("||");
				load_messages_page(session[1], suid);
			}			
		});
	} else {
		$("#user-menu-messages > .dropdown-menu > #empty > a").html("<i id=\"count\" style=\"display: none;\">0</i>Ei uusia viestejä.");
	}
}

function load_messages_page(uid, duid) {
	$("#messages-page-conversation-messages").css("max-height: 600px; overflow-x: hidden; overflow-y: scroll;");
	if(duid != 0) {
		var receiver_name = get_username(duid);
		$("#messages-page-conversation-who").html("Keskustelu " + receiver_name + ":n kanssa.");

		var discussion = get_discussion(uid, duid);
		if(discussion != undefined) {
			var messages = "";
			for(var i = 0; i < discussion.length; i++) {
				if(discussion[i].type == "text") {
					if(discussion[i].sender_uid == uid) {
						messages += "<div class=\"panel panel-success\" style=\"width: 80%; float: right; text-align: right;\">";
					} else if(discussion[i].sender_uid == duid) {
						messages += "<div class=\"panel panel-default\" style=\"width: 80%; float: left; text-align: left;\">";
						if(discussion[i].seen == 0) {
							set_message_to_seen(discussion[i].mid);
						}
					}
					messages += "<div class\"panel-body\">";
					messages += "<p style=\"padding: 5px; margin: 0px;\"><b>" + discussion[i].sender_name + ":</b></p>";
					messages += "<p style=\"padding: 5px; margin: 0px;\">" + discussion[i].message + "</p>";
					messages += "</div></div>";
				}
			}
			$("#messages-page-conversation-messages").html(messages);
			var newMsg = "<form method=\"POST\" action=\"php/api.php\" id=\"send-message-to\">" +
					"<div><textarea style=\"width: 100%;\" id=\"message\" ></textarea></div>" +
					"<div style=\"text-align: right;\">" +
					"<input type=\"hidden\" name=\"msg\" id=\"real-message\" value=\"\" />" +
					"<input type=\"hidden\" name=\"receiver\" value=\"" + duid + "\" />" +
					"<input type=\"hidden\" name=\"sender\" value=\"" + uid + "\" />" +
					"<input type=\"hidden\" name=\"type\" value=\"text\" />" +
					"<input type=\"hidden\" name=\"call\" value=\"send_message\" />" +
					"<input type=\"submit\" value=\"Lähetä\" class=\"btn btn-success\" /></div>" +
					"</form>";
			$("#messages-page-conversation-new-message").html(newMsg);	
			$("#send-message-to").submit(function(evt) {
				evt.preventDefault();
				var message = $("#send-message-to > div > #message").val();
				$("#send-message-to > div > #real-message").val(message.replace(/\n/g, "<br />"));
				$.ajax({
					type: $(this).attr('method'),
					url: $(this).attr('action'),
					data: $(this).serialize()
				}).done(function(data) {
					console.log(data);
					var result = $.parseJSON(data);
					if(result.success === true) {
						var newMsg = "<div class=\"panel panel-success\" style=\"width: 80%; float: right; text-align: right;\">";
						newMsg += "<div class=\"pane-body\">";
						var username = get_username(uid);
						newMsg += "<p style=\"padding: 5px; margin: 0px;\"><b>" + username + ":</b></p>";
						newMsg += "<p style=\"padding: 5px; margin: 0px;\">" + result.message + "</p>";
						newMsg += "</div></div>";
						$("#send-message-to > div > #message").val("");
						if($("#messages-page-conversation-messages").html() == "Lähetä uusi viesti.") {
							$("#messages-page-conversation-messages").html(newMsg);
						} else {
							$("#messages-page-conversation-messages").append(newMsg);
						}
						$("#messages-page-conversation-messages").scrollTop($("#messages-page-conversation-messages")[0].scrollHeight);
					} else {
						console.log(result.error);
					}
				});	
			});
		} else {
			console.log("fuck!");
		}
	} else {
		$("#messages-page-conversation-new-message").html("Lähetä uusi viesti.");
	}
	var discussions = get_discussions(uid);
	if(discussions == false) {
		return false;
	}
	var discussions_already = [];
	if(discussions != undefined) {
		var disc_list = "<ul class=\"list-group\">";	
		for(var i = 0; i < discussions.length; i++) {
			if(discussions[i].sender_uid == uid) {
				if(jQuery.inArray(discussions[i].receiver_name, discussions_already) == -1) {
					var button_press_script = "onclick=\"load_messages_page(" + discussions[i].sender_uid + ", " + discussions[i].receiver_uid +")\"";
					disc_list += "<li class=\"list-group-item\"><a href=\"#\" " + button_press_script + ">" + discussions[i].receiver_name + "</a></li>";
					discussions_already.push(discussions[i].receiver_name);
				}
			} else {
				if(jQuery.inArray(discussions[i].sender_name, discussions_already) == -1) {
					var button_press_script = "onclick=\"load_messages_page(" + discussions[i].receiver_uid + ", " + discussions[i].sender_uid +")\"";
					disc_list += "<li class=\"list-group-item\"><a href=\"#\" " + button_press_script + ">" + discussions[i].sender_name + "</a></li>";
					discussions_already.push(discussions[i].sender_name);
				}
			}
		}
		disc_list += "</ul>";
		$("#messages-page-conversations-list").html(disc_list);
	}

	if(duid != 0) {
		load_custom_page("messages-page", "&duid=" + duid);
	} else {
		load_page("messages-page");
	}
	$("#messages-page-conversation-messages").scrollTop($("#messages-page-conversation-messages")[0].scrollHeight);
	if(duid != 0) {
		long_pull_messages(duid);
	}
}

function load_search_page(ssid) {
	console.log("search page opened.");
	if(ssid != 0) {
		load_custom_page("search-page", "&ssid=" + ssid);
	} else {
		load_page("search-page");
	};
}

window.onpopstate = function(event) {
	$("body > .container").hide();
	var page = get_url_parameter("page");
	if(page !== undefined) {
		$("#" + page).show();
	} else {
		$("#home-page").show();
	}
};

$("document").ready(function() {
	$(".multiselect").multiselect({
		buttonText : function(options, select) {
			if(options.length == 0) {
				return "Valitse <b class=\"caret\"></b>";
			} else {
				if(options.length > this.numberDisplayed) {
					return options.length + ' valittu <b class="caret"></b>';
				} else {
					var selected = '';
					options.each(function() {
						var label = ($(this).attr('label') !== undefined) ? $(this).attr('label') : $(this).html();
						selected  += label + ', ';
					});
					return selected.substr(0, selected.length -2) + '<b class="caret"></b>';
				}
			}
		}
	});
	$("body > .container").hide();
	hostname = location.protocol + '//' + location.hostname + location.pathname;
	var page = get_url_parameter("page");
	if(page !== undefined) {
		if(page === "profile-page") {
			var uid = get_url_parameter("uid");
			if(uid != undefined) {
				load_profile_page(uid);
			} else {
				if($.cookie("session") != undefined) {
					var session = window.atob($.cookie("session"));
					var rsession = session.split("||");
					load_profile_page(rsession[1]);
				} else {
					load_home_page();
				}
			}
		} else if(page === "messages-page") {
			if($.cookie("session") != undefined) {
				var session = window.atob($.cookie("session"));
				session = session.split("||");
				var duid = get_url_parameter("duid");
				if(duid != undefined) {
					load_messages_page(session[1], duid);
				} else {
					load_messages_page(session[1], 0);
				}
			} else {
				load_home_page();
			}
		} else if(page === "search-page") {
			if($.cookie("session") != undefined) {
				var ssid = get_url_parameter("ssid");
				if(ssid != undefined) {
					load_search_page(ssid);
				} else {
					load_search_page(0);
				}	
			}
		} else {
			load_page(page);
		}
	} else {
		$("#home-page").show();
	}


	if(check_session() === true) {
		// disable login form and show user buttons
		$("#authentication-form").hide();
		$("#home-page-register").hide();
		$("#home-page-features").hide();
		$("#authentication-error-page").hide();
		$("#user-menu").show();
		
		update_unread_messages();
		setInterval(function() {
			update_session();
			update_unread_messages();
		}, 15000);
		/*	
		setInterval(function() {
			do_distance_work();
		}, 60000);
		*/
	} else {
		$("#user-menu").hide();
		$("#authentication-form").show();
		$("#home-page-register").show();
		$("#home-page-features").show();
		if($.cookie("allow-cookies") != "true") {
			$("#cookie-need-message").show();
			console.log("cookie use is not yet allowed.");
		} else {
			console.log("cookie use is already allowed.");
		}
	}
	// ...
	$("#register-picture-upload-form").ajaxForm({
		dataType: "json",
		data: { session: $.cookie("session") },
		beforeSubmit: function(formData, jqForm, options) {
			console.log("About to submit: \r\n" + $.param(formData));
			console.log($.cookie("session"));
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
			console.log("Sending: " + percentComplete + "%");
			if(percentComplete === 100) {
				$("#register-picture-upload-progress-percent").html("Odota.");
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("jqXHR: " + jqXHR.responseText + "\r\nStatus: " + textStatus + "\r\nError: " + errorThrown);
		}, 
		success: function(responseText, statusText, xhr, $form) {
			console.log(responseText);
			console.log("File sent.");
			if(statusText === "success") {
				console.log("File sent successfully.");
				if(responseText.success === true) {
					$("#register-picture-upload-progress-bar").width("100%");
					$("#register-picture-upload-progress-percent").html("Lähetetty.");
					if(responseText.uploaded_files !== undefined) {
						if($("#register-select-picture").length === 0) {
							$("#register-select-profile-picture-page").append("<div id=\"register-select-picture\"></div>");
						}
						if($("#register-select-picture-header").length === 0) {
							$("#register-select-picture").append("<h1 id=\"register-select-picture-header\">Valitse profiili kuvasi.</h1>");
						}
						var rowNumber = 0;
						var count = responseText.uploaded_files.length;
						for(var i = 0; i < count; i++) {
							console.log("Uploaded file: " + responseText.uploaded_files[i]);
							if(i % 4 === 0) {
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
					if(responseText.failed_files !== undefined) {
						for(var x = 0; x < responseText.failed_files.length; x++) {
							console.log("Failed to upload file: " + responseText.failed_files[x]);
						}
						$("#register-picture-upload-progress-percent").html("Joidenkin tiedostojen lähetys epäonnistui!");
					}
				} else {
					$("#register-picture-upload-progress-bar").width("0%");
					$("#register-picture-upload-progress-percent").width("Tiedoston lähetys epäonnistui!");
					console.log("File uploading failed: " + responseText.error);
				}
			} else {
				$("#register-picture-upload-progress-bar").width("0%");
				$("#register-picture-upload-progress-percent").html("Tiedoston lähetys epäonnistui!");
				console.log("Uploading failed.");
			}
		}
	});
});

function hide_menu_collapse() {
	if($(window).width() < 1200) {
		$("#menu").collapse("hide");
	}
}

function compare_login(a, b) {
	var alogin = new Date(a.timestamp);
	var blogin = new Date(b.timestamp);
	if(alogin > blogin)
		return -1;
	if(alogin < blogin)
		return 1;
	return 0;
}

function compare_registered(a, b) {
	var aregistered = new Date(a.registered);
	var bregistered = new Date(b.registered);
	if(aregistered > bregistered)
		return -1;
	if(aregistered < bregistered)
		return 1;
	return 0;
}

function compare_birthday(a, b) {
	var abirthday = new Date(a.birthday);
	var bbirthday = new Date(b.birthday);
	if(abirthday > bbirthday)
		return -1;
	if(abirthday < bbirthday) 
		return 1;
	return 0;
}

var user_search_results;

function display_results(search_results, index) {
	var results = search_results.slice(0);
	index -= 1;
	if($("#with-picture-checkbox").is(":checked")) {
		for(var i = 0; i < results.length; i++) {
			if(results[i].picture == "") {
				results.splice(i, 1);
				i--;
			}
		}
	}
	if($("#select-search-result-order").find(":selected").val() == "new-logins") {
		results.sort(compare_login);
	} else if($("#select-search-result-order").find(":selected").val() == "old-logins") {
		results.sort(compare_login);
		results.reverse();
	} else if($("#select-search-result-order").find(":selected").val() == "new-members") {
		results.sort(compare_registered);
		results.reverse();
	} else if($("#select-search-result-order").find(":selected").val() == "old-members") {
		results.sort(compare_registered);
	} else if($("#select-search-result-order").find(":selected").val() == "young-members") {
		results.sort(compare_birthday);
	} else if($("#select-search-result-order").find(":selected").val() == "aged-members") {
		results.sort(compare_birthday);
		results.reverse();
	}
	
	$("#search-results").html("");
	$("#display-amount-of-results").html("<b>Hakuosumia:</b><br /> " + results.length + " kappaletta.");
	for(var i = (30 * index); i < ((results.length > ((30 * index) + 30)) ? ((30 * index) + 30) : results.length); i++) {
		var gender = "";
		switch(results[i].gender) {
			case 'man': gender = "mies"; break;
			case 'woman': gender = "nainen"; break;
			case 'transman': gender = "transumies"; break;
			case 'transwoman': gender = "transunainen"; break;
			case 'sexless': gender = "Sukupuoleton"; break;
		}

		var birthday = new Date(results[i].birthday);
		var today = new Date();
		var ty = today.getFullYear();
		var by = birthday.getFullYear();
		var td = today.getDate();
		var bd = birthday.getDate();
		var tm = today.getMonth();
		var bm = birthday.getMonth();
		var age = ty - by;
		if(tm > bm) {
			if(td > bd) {
				age += 1;
			}
		}
		if(results[i].town != false) {
			var town = results[i].town.charAt(0).toUpperCase() + results[i].town.slice(1);
		} else {
			var town = "";
		}
		
		if(results[i].picture == "") {
			results[i].picture = "default.jpg";
		}

		var profile_text = results[i].profile_text;
		if(profile_text.length >= 250) {
			profile_text = profile_text.match(/.{1,250}/g);
			profile_text = profile_text[0] + "..";
		}

		var result_display = '<div class="row" style="border-top: 1px solid black; margin-top: 10px;" >';
			result_display += '<div class="row">';
				result_display += '<div class="col-xs-12">';
					result_display += '<h1><a class="user-profile-button" href="' + results[i].id + '">' + results[i].username + "</a></h1>";
				result_display += '</div>';
			result_display += '</div>';
			result_display += '<div class="row">';
				result_display += '<div class="col-xs-4">';
					result_display += '<img src="uploads/' + results[i].picture + '" alt="' + results[i].username + '" profiilikuva" style="width: 100%;"/>';
				result_display += '</div>';
				result_display += '<div class="col-xs-8">';
					result_display += "<p>" + age + ", " + gender + ", " +  town + "</p>";
					result_display += "<p>" + profile_text + "</p>";
				result_display += '</div>';
			result_display += '</div>';
		result_display += '</div>';
		$("#search-results").append(result_display);
	}
	
	$(".user-profile-button").click(function(evt) {
		evt.preventDefault();
		var uid = $(this).attr("href");
		load_profile_page(uid);
	});
}

var index;
var pagemove;

function display_pagination(index, pagemove) {
	window.index = index;
	window.pagemove = pagemove;
	var paginations = window.user_search_results.length / 30;
	var result_pagination = '<div class="row" style="border-top: 1px solid black; margin-top: 10px;">';
		result_pagination += '<ul class="pagination" id="search_result_pagination">';
			result_pagination += '<li id="search-result-prev-pagination-button"><a href="#" disabled="true">&laquo;</a></li>';
			for(var i = (0 + pagemove); i < ((paginations > (10 + pagemove)) ? (10 + pagemove) : paginations); i++) {
				var page = i + 1;
				if(page == index) {
					result_pagination += '<li class="active"><a href="#">' + page + ' <span class="sr-only">(current)</span></a></li>';
				} else {
					result_pagination += '<li><a href="#">' + page + '</a></li>';
				}
			}
			if(paginations > 12) {
				result_pagination += '<li id="search-result-next-pagination-button"><a href="#" disabled="false">&raquo;</a></li>';
			} else {
				result_pagination += '<li id="search-result-next-pagination-button"><a href="#" disabled="true" >&raquo;</a></li>';
			}	
		result_pagination += '</ul>';
	result_pagination += '</div>';
	$("#search-results").append(result_pagination);

	$("#search_result_pagination > li > a").click(function(evt) {
		evt.preventDefault();
		var page = $(this).text();	
		if(page.match("»") != null) {
			if($("#search-result-next-pagination-button > a").is(":disabled") == false) {
				if(paginations > pagemove) {
					pagemove += 1;
					$("#search-result-prev-pagination-button > a").attr('disabled', 'false');
				} else {
					$("#search-result-next-pagination-button > a").attr('disabled', 'true');
				}
				display_results(window.user_search_results, index);
				display_pagination(index, pagemove);
			}
		} else if(page.match("«") != null) {
			if($("#search-result-prev-pagination-button > a").is(":disabled") == false) {
				if(pagemove > 0) {
					pagemove -= 1;
					$("#search-result-next-pagination-button > a").attr('disabled', 'false');
				} else {
					$("#search-result-prev-pagination-button > a").attr('disabled', 'true');
				}
				display_results(window.user_search_results, index);
				display_pagination(index, pagemove);
			}
		} else if(page.match('<span class="sr-only">(current)</span>') == null) {
			display_results(window.user_search_results, page);
			display_pagination(page, pagemove); 
		}
	});
}

$("#select-search-result-order").change(function(evt) {
	display_results(window.user_search_results, window.index);
	display_pagination(window.index, window.pagemove);
});

$("#with-picture-checkbox").change(function(evt) {
	display_results(window.user_search_results, window.index);
	display_pagination(window.index, window.pagemove);
});

$("#search-submit").click(function(evt) {
	evt.preventDefault();
	var form_data = $("#search-form").serialize();
	console.log(form_data);
	if(check_session() === true) {
		form_data = form_data + "&call=search";
	}
	console.log(form_data);
	$.ajax({
                url: "php/api.php",
                type: "POST",
                async: false,
                data: form_data
        }).done(function(data) {
		console.log(data);
		data = $.parseJSON(data);
		if(data.success == true) {
			window.user_search_results = data.result;
			display_results(window.user_search_results, 1);	
			display_pagination(1, 0);			
			$("#search-results").show();
		} else {
			$("#display-amount-of-results").html("<b>Hakuosumia:</b><br /> 0 kappaletta.");
		}
	});
});


$("#navigation-left > li").click(function(evt) {
	evt.preventDefault();
	$("#navigation-left").children().removeClass("active");
	$("#user-menu").children().removeClass("active");
	$(this).addClass("active");
});

$("#user-menu > li").click(function(evt) {
	evt.preventDefault();
	$("#navigation-left").children().removeClass("active");
	$("#user-menu").children().removeClass("active");
	$(this).addClass("active");
});

$("#user-menu-settings > ul > li").click(function() {
	hide_menu_collapse();
});

$("#user-menu-messages > ul > li").click(function() {
	hide_menu_collapse();
});

$("#user-menu-requests > ul > li").click(function() {
	hide_menu_collapse();
});

$("#home-button").click(function(evt) {
	evt.preventDefault();
	hide_menu_collapse();
	$("#navigation-left").children().removeClass("active");
	$("#user-menu").children().removeClass("active");
	load_home_page();
});

$("#search").click(function(evt) {
	evt.preventDefault();
	hide_menu_collapse();
	load_search_page(0);
});

$("#logout-button").click(function(evt) {
	evt.preventDefault();
	hide_menu_collapse();
	close_session();
	load_home_page();
});


function toggle_search_inputs(btn, which) {
	if($(btn).children("i").hasClass("glyphicon-arrow-down")) {
		$(btn).children("i").removeClass("glyphicon-arrow-down");
		$(btn).children("i").addClass("glyphicon-arrow-up");
		var text = $(btn).html();
		$(btn).html(text.replace("Piiloita", "Näytä"));
		$(which).show();
	} else {
		$(btn).children("i").removeClass("glyphicon-arrow-up");
		$(btn).children("i").addClass("glyphicon-arrow-down");
		var text = $(btn).html();
		$(btn).html(text.replace("Näytä", "Piiloita"));
		$(which).hide();
	}
}

$("#toggle-basic-information-inputs-button").click(function(evt) {
	evt.preventDefault();
	toggle_search_inputs(this, "#basic-information-inputs");
});

$("#toggle-outlook-inputs-button").click(function(evt) {
	evt.preventDefault();
	toggle_search_inputs(this, "#outlook-inputs");
});

$("#toggle-background-inputs-button").click(function(evt) {
	evt.preventDefault();
	toggle_search_inputs(this, "#background-inputs");
});

$("#toggle-lifestyle-inputs-button").click(function(evt) {
	evt.preventDefault();
	toggle_search_inputs(this, "#lifestyle-inputs");
});

$("#own-profile-button").click(function(evt) {
	hide_menu_collapse();
	if($.cookie("session") !== undefined) {
		var session = window.atob($.cookie("session"));
		var rsession = session.split("||");
		load_profile_page(rsession[1]);
	}
});

$("#profile-page-top-bar-menu-send-msg").click(function(evt) {
	evt.preventDefault();
	if($.cookie("session") !== undefined) {
		var session = window.atob($.cookie("session"));
		session = session.split("||");
		var ruid = get_url_parameter("uid");
		load_messages_page(session[1], ruid);
	}
});

$("#user-menu-messages > .dropdown-menu > #empty > a").click(function(evt) {
	evt.preventDefault();
	if($.cookie("session") !== undefined) {
		var session = window.atob($.cookie("session"));
		session = session.split("||");
		$("#messages-page-conversation-who").html("Kenen kanssa keskustelee.");
		$("#messages-page-conversation-messages").html("Avaa keskustelu niin näet viestit tässä.");
		$("#messages-page-conversation-input").html("Lähetä uusi viesti.");
		load_messages_page(session[1], 0);
	}
});

$("#authentication-form").submit(function(evt) {
	evt.preventDefault();
	open_session($("#authentication-form-username-input").val(), $("#authentication-form-password-input").val());
	if(check_session() === true) {
		$("#authentication-form").hide();
		$("#home-page-register").hide();
		$("#home-page-features").hide();
		$("#authentication-error-page").hide();
		$("#user-menu").show();	
		update_unread_messages();
	} else {
		load_page("authentication-error-page");
	}
});

$("#hide-authentication-error-page-button").click(function(evt) {
	$("#authentication-error-page").hide();
});

$("#allow-cookie-use").click(function(evt) {
	$.cookie("allow-cookies", "true");
	$("#cookie-need-message").hide();
	console.log("allowed cookie use.");
});

$("#disallow-cookie-use").click(function(evt) {
	var cookies = document.cookie.split(";");
	$("#cookie-need-message").hide();
	console.log("disallowed cookie use, removing all cookies.");
	for(var i = 0; i < cookies.length; i++) 
		$.removeCookie(cookies[i].split("=")[0]);	
});

$("#register-select-profile-picture-skip-button").click(function(evt) {
	evt.preventDefault();
	load_page("register-select-profile-text-page");
});

$("#start-registeration-button").click(function(evt) {
	evt.preventDefault();
	load_page("register-terms-of-service-page");
	$.removeCookie("next-page");
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
	} else if($("#register-account-password-input").val() !== $("#register-account-password-confirm-input").val()) {
		console.log($("#register-account-password-input").val() + " !== " + $("#register-account-password-confirm-input").val());
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
			if(result.success === true) {
				open_session(result.account.username, result.account.password);
				if($.cookie("session") !== undefined) {
					$("#authentication-form").hide();
					$("#user-menu").show();
					load_page("register-invite-page");
					$.cookie("username", result.account.username);
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
	load_page("register-account-page");
});

$("#register-terms-of-service-stop-button").click(function(evt) {
	evt.preventDefault();
	load_page("home-page");
});

$("#register-invite-form").submit(function(evt) {
	evt.preventDefault();
	var form_data = $(this).serialize();
	if(check_session() === true) {
		form_data = form_data + "&session=" + $.cookie("session");
	}
	$.ajax({
		type: $(this).attr('method'),
		url: $(this).attr('action'),
		data: form_data
	}).done(function(data) {
		console.log(data);
		var result = $.parseJSON(data);
		if(result.success === true) {
			var cloneinput = $("#register-invite-friend-addresses").children(":first").clone();
			$("#register-invite-friend-addresses").children(".input-group").remove();
			var count = 0;
			var invites = "";
			for(var index in result.invite) {
				console.log(result.invite[index]);
				if(result.invite[index] !== true) {
					$("#register-invite-friend-addresses").append(cloneinput);
					$("#register-invite-friend-addresses").children(":last").children("label").attr("for", "register-invite-friend-address-input-" + count);
					$("#register-invite-friend-addresses").children(":last").children("label").html("Tälle ystävälle kutsun lähettäminen epäonnistui.");
					$("#register-invite-friend-addresses").children(":last").children("label").css("color", "red");
					$("#register-invite-friend-addresses").children(":last").children("input").attr("id", "register-invite-friend-address-input-" + count);
					$("#register-invite-friend-addresses").children(":last").children("input").attr("name", "friend-address-" + count);
					$("#register-invite-friend-addresses").children(":last").children("input").val(result.invite[index].address);
					cloneinput = $("#register-invite-friend-addresses").children(":last").clone();
					count = count + 1;
					invites = invites + result.invite[index].address + ", ";
				}
			}
			$.cookie("invites", invites);
			if(count === 0) {
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
	load_page("register-select-location-page");
});


$("#register-select-profile-text-done-button").click(function(evt) {
	evt.preventDefault();
	if(check_session() === true) {
		var profile_text = $("#register-select-profile-text-input").val();
		if(profile_text !== undefined) {
			$.cookie("profile-text", profile_text);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-gender-page");
			}
		}
	} else {
		load_home_page();
	}
});

$("#register-select-gender-page").on("show", function(evt) {
	if($.cookie("gender") !== undefined) {
		$("#register-select-gender-input").val($.cookie("gender"));
	}
});

$("#register-select-gender-input").change(function(evt) {
	$("#register-select-gender-error").hide();
});



$("#register-select-gender-done-button").click(function(evt) {
	evt.preventDefault();
	if(check_session() === true) {
		var gender = $("#register-select-gender-input").val();
		if(gender !== undefined) {
			$.cookie("gender", gender);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-birthday-page");
			}
		} else {
			$("#register-select-gender-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-birthday-page").on("show", function(evt) {
	if($.cookie("birthday") !== undefined) {
		$("#register-select-birthday-input").val($.cookie("birthday"));
	}
});

$("#register-select-birthday-input").change(function(evt) {
	$("#register-select-birthday-error").hide();
});

$("#register-select-birthday-done-button").click(function(evt) {
	evt.preventDefault();
	var birthday = $("#register-select-birthday-input").val();
	if(check_session() === true) {
		if(birthday !== undefined) {
			$.cookie("birthday", birthday);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-relationship-status-page");
			}
		} else {
			$("#register-select-birthday-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-relationship-status-page").on("show", function(evt) {
	if($.cookie("relationship-status") !== undefined) {
		$("#register-select-relationship-status-input").val($.cookie("relationship-status"));
	}
});

$("#register-select-relationship-status-input").change(function(evt) {
	$("#register-select-relationship-status-error").hide();
});

$("#register-select-relationship-status-done-button").click(function(evt) {
	evt.preventDefault();
	var relationshipStatus = $("#register-select-relationship-status-input").val();
	if(check_session() === true) {
		if(relationshipStatus !== undefined) {
			$.cookie("relationship-status", relationshipStatus);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-sexual-orientation-page");
			}
		} else {
			$("#register-select-relationship-status-error").show();
		}
	}
});

$("#register-select-sexual-orientation-page").on("show", function(evt) {
	if($.cookie("sexual-orientation") !== undefined) {
		$("#register-select-sexual-orientation-input").val($.cookie("sexual-orientation"));
	}
});

$("#register-select-sexual-orientation-input").change(function(evt) {
	$("#register-select-sexual-orientation-error").hide();
});

$("#register-select-sexual-orientation-done-button").click(function(evt) {
	evt.preventDefault();
	var sexualOrientation = $("#register-select-sexual-orientation-input").val();
	if(check_session() === true) {
		if(sexualOrientation !== undefined) {
			$.cookie("sexual-orientation", sexualOrientation);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-looking-for-page");
			}
		} else {
			$("#register-select-sexual-orientation-error").show();
		}
	}
});

$("#register-select-looking-for-page").on("show", function(evt) {
	if($.cookie("looking-for") !== undefined) {
		$("#register-select-looking-for-input").val($.cookie("looking-for"));
	}
});

$("#register-select-looking-for-input").change(function(evt) {
	$("#register-select-looking-for-error").hide();
});

$("#register-select-looking-for-done-button").click(function(evt) {
	evt.preventDefault();
	var lookingForValues = $("#register-select-looking-for-input").val();
	if(check_session() === true) {
		if(lookingForValues !== undefined) {
			$.cookie("looking-for", lookingForValues);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-height-page");
			}
		} else {
			$("#register-select-looking-for-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-height-page").on("show", function(evt) {
	if($.cookie("height") !== undefined) {
		$("#register-select-height-input").val($.cookie("height"));
	}
});

$("#register-select-height-input").change(function(evt) {
	$("#register-select-height-error").hide();
});

$("#register-select-height-done-button").click(function(evt) {
	evt.preventDefault();
	var height = $("#register-select-height-input").val();
	if(check_session() === true) {
		if(height !== undefined) {
			$.cookie("height", height);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-weight-page");
			}
		} else {
			$("#register-select-height-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-weight-page").on("show", function(evt) {
	if($.cookie("weight") !== undefined) {
		$("#register-select-weight-input").val($.cookie("weight"));
	}
});

$("#register-select-weight-input").change(function(evt) {
	$("#register-select-weight-error").hide();
});

$("#register-select-weight-done-button").click(function(evt) {
	evt.preventDefault();
	var weight = $("#register-select-weight-input").val();
	if(check_session() === true) {
		if(weight !== undefined) {
			$.cookie("weight", weight);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-body-type-page");
			}
		} else {
			$("#register-select-weight-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-body-type-page").on("show", function(evt) {
	if($.cookie("body-type") !== undefined) {
		$("#register-select-body-type-input").val($.cookie("body-type"));
	}
});

$("#register-select-body-type-input").change(function(evt) {
	$("#register-select-body-type-error").hide();
});

$("#register-select-body-type-done-button").click(function(evt) {
	evt.preventDefault();
	var bodyType = $("#register-select-body-type-input").val();
	if(check_session() === true) {
		if(bodyType !== undefined) {
			$.cookie("body-type", bodyType);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-eye-color-page");
			}
		} else {
			$("#register-select-body-type-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-eye-color-page").on("show", function(evt) {
	if($.cookie("eye-color") !== undefined) {
		$("#register-select-eye-color-input").val($.cookie("eye-color"));
	}
});

$("#register-select-eye-color-input").change(function(evt) {
	$("#register-select-eye-color-error").hide();
});

$("#register-select-eye-color-done-button").click(function(evt) {
	evt.preventDefault();
	var eyeColor = $("#register-select-eye-color-input").val();
	if(check_session() === true) {
		if(eyeColor !== undefined) {
			$.cookie("eye-color", eyeColor);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-hair-length-page");
			}
		} else {
			$("#register-select-eye-color-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-hair-length-page").on("show", function(evt) {
	if($.cookie("hair-length") !== undefined) {
		$("#register-select-hair-length-input").val($.cookie("hair-length"));
	}
});

$("#register-select-hair-length-input").change(function(evt) {
	$("#register-select-hair-length-error").hide();
});

$("#register-select-hair-length-done-button").click(function(evt) {
	evt.preventDefault();
	var hairLength = $("#register-select-hair-length-input").val();
	if(check_session() === true) {
		if(hairLength !== undefined) {
			$.cookie("hair-lenght", hairLength);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-hair-color-page");
			}
		} else {
			$("#register-select-hair-length-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-hair-color-page").on("show", function(evt) {
	if($.cookie("hair-color") !== undefined) {
		$("#register-select-hair-color-input").val($.cookie("hair-color"));
	}
});

$("#register-select-hair-color-input").change(function(evt) {
	$("#register-select-hair-color-error").hide();
});

$("#register-select-hair-color-done-button").click(function(evt) {
	evt.preventDefault();
	var hairColor = $("#register-select-hair-color-input").val();
	if(check_session() === true) {
		if(hairColor !== undefined) {
			$.cookie("hair-color", hairColor);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-kids-page");
			}
		} else {
			$("#register-select-hair-color-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-kids-page").on("show", function(evt) {
	if($.cookie("kids") !== undefined) {
		$("#register-select-kids-input").val($.cookie("kids"));
	}
});

$("#register-select-kids-input").change(function(evt) {
	$("#register-select-kids-error").hide();
});

$("#register-select-kids-done-button").click(function(evt) {
	evt.preventDefault();
	var kids = $("#register-select-kids-input").val();
	if(check_session() === true) {
		if(kids !== undefined) {
			$.cookie("kids", kids);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-accomodation-page");
			}
		} else {
			$("#register-select-kids-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-accomodation-input").change("show", function(evt) {
	if($.cookie("accomodation") !== undefined) {
		$("#register-select-accomodation-input").val($.cookie("accomodation"));
	}
});

$("#register-select-accomodation-input").change(function(evt) {
	$("#register-select-accomodation-error").hide();
});

$("#register-select-accomodation-done-button").click(function(evt) {
	evt.preventDefault();
	var accomodation = $("#register-select-accomodation-input").val();
	if(check_session() === true) {
		if(accomodation !== undefined) {
			$.cookie("accomodation", accomodation);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-ethnic-identity-page");
			}
		} else {
			$("#register-select-accomodation-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-ethnic-identity-page").on("show", function(evt) {
	if($.cookie("ethnic-identity") !== undefined) {
		$("#register-select-ethnic-identity-input").val($.cookie("ethnic-identity"));
	}
});

$("#register-select-ethnic-identity-input").change(function(evt) {
	$("#register-select-ethnic-identity-error").hide();
});

$("#register-select-ethnic-identity-done-button").click(function(evt) {
	evt.preventDefault();
	var ethnicIdentity = $("#register-select-ethnic-identity-input").val();
	if(check_session() === true) {
		if(ethnicIdentity !== undefined) {
			$.cookie("ethnic-identity", ethnicIdentity);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-language-skills-page");
			}
		} else {
			$("#register-select-ethnic-identity-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-language-skills-page").on("show", function(evt) {
	if($.cookie("language-skills") !== undefined) {
		$("#register-select-language-skills-input").val($.cookie("language-skills"));
	}
});

$("#register-select-language-skills-input").change(function(evt) {
	$("#register-select-language-skills-error").hide();
});

$("#register-select-language-skills-done-button").click(function(evt) {
	evt.preventDefault();
	var languageSkills = $("#register-select-language-skills-input").val();
	if(check_session() === true) {
		if(languageSkills !== undefined) {
			$.cookie("language-skills", languageSkills);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-education-page");
			}
		} else {
			$("#register-select-language-skills-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-education-page").on("show", function(evt) {
	if($.cookie("education") !== undefined) {
		$("#register-select-education-input").val($.cookie("education"));
	}
});

$("#register-select-education-input").change(function(evt) {
	$("#register-select-education-error").hide();
});

$("#register-select-education-done-button").click(function(evt) {
	evt.preventDefault();
	var education = $("#register-select-education-input").val();
	if(check_session() === true) {
		if(education !== undefined) {
			$.cookie("education", education);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-work-page");
			}
		} else {
			$("#register-select-education-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-work-page").on("show", function(evt) {
	if($.cookie("work") !== undefined) {
		$("#register-select-work-input").val($.cookie("work"));
	}
});

$("#register-select-work-input").change(function(evt) {
	$("#register-select-work-error").hide();
});

$("#register-select-work-done-button").click(function(evt) {
	evt.preventDefault();
	var work = $("#register-select-work-input").val();
	if(check_session() === true) {
		if(work !== undefined) {
			$.cookie("work", work);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-income-page");
			}
		} else {
			$("#register-select-work-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-incom-page").on("show", function(evt) {
	if($.cookie("income") !== undefined) {
		$("#register-select-income-input").val($.cookie("income"));
	}
});

$("#register-select-income-input").change(function(evt) {
	$("#register-select-income-error").hide();
});

$("#register-select-income-done-button").click(function(evt) {
	evt.preventDefault();
	var income = $("#register-select-income-input").val();
	if(check_session() === true) {
		if(income !== undefined) {
			$.cookie("income", income);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-vocation-page");
			}
		} else {
			$("#register-select-income-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-vocation-page").on("show", function(evt) {
	if($.cookie("vocation") !== undefined) {
		$("#register-select-vocation-input").val($.cookie("vocation"));
	}
});

$("#register-select-vocation-input").change(function(evt) {
	$("#register-select-vocation-error").hide();
});

$("#register-select-vocation-done-button").click(function(evt) {
	evt.preventDefault();
	var vocation = $("#register-select-vocation-input").val();
	if(check_session() === true) {
		if(vocation !== undefined) {
			$.cookie("vocation", vocation);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-dress-style-page");
			}
		} else {
			$("#register-select-vocation-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-dress-style-page").on("show", function(evt) {
	if($.cookie("dress-style") !== undefined) {
		$("#register-select-dress-style-input").val($.cookie("dress-style"));
	}
});

$("#register-select-dress-style-input").change(function(evt) {
	$("#register-select-dress-style-error").hide();
});

$("#register-select-dress-style-done-button").click(function(evt) {
	evt.preventDefault();
	var dressStyle = $("#register-select-dress-style-input").val();
	if(check_session() === true) {
		if(dressStyle !== undefined) {
			$.cookie("dress-style", dressStyle);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-smoking-page");
			}
		} else {
			$("#register-select-dress-style-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-smoking-page").on("show", function(evt) {
	if($.cookie("smoking") !== undefined) {
		$("#register-select-smoking-input").val($.cookie("smoking"));
	}
});

$("#register-select-smoking-input").change(function(evt) {
	$("#register-select-smoking-error").hide();
});

$("#register-select-smoking-done-button").click(function(evt) {
	evt.preventDefault();
	var smoking = $("#register-select-smoking-input").val();
	if(check_session() === true) {
		if(smoking !== undefined) {
			$.cookie("smoking", smoking);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-alcohol-page");
			}
		} else {
			$("#register-select-smoking-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-alcohol-page").on("show", function(evt) {
	if($.cookie("alcohol") !== undefined) {
		$("#register-select-alcohol-input").val($.cookie("alcohol"));
	}
});

$("#register-select-alcohol-input").change(function(evt) {
	$("#register-select-alcohol-error").hide();
});

$("#register-select-alcohol-done-button").click(function(evt) {
	evt.preventDefault();
	var alcohol = $("#register-select-alcohol-input").val();
	if(check_session() === true) {
		if(alcohol !== undefined) {
			$.cookie("alcohol", alcohol);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-pets-page");
			}
		} else {
			$("#register-select-alcohol-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-pets-page").on("show", function(evt) {
	if($.cookie("pets") !== undefined) {
		$("#register-select-pets-input").val($.cookie("pets"));
	}
});

$("#register-select-pets-input").change(function(evt) {
	$("#register-select-pets-error").hide();
});

$("#register-select-pets-done-button").click(function(evt) {
	evt.preventDefault();
	var pets = $("#register-select-pets-input").val();
	if(check_session() === true) {
		if(pets !== undefined) {
			$.cookie("pets", pets);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-exercise-page");
			}
		} else {
			$("#register-select-pets-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-exercise-page").on("show", function(evt) {
	if($.cookie("exercise") !== undefined) {
		$("#register-select-exercise-input").val($.cookie("exercise"));
	}
});

$("#register-select-exercise-input").change(function(evt) {
	$("#register-select-exercise-error").hide();
});

$("#register-select-exercise-done-button").click(function(evt) {
	evt.preventDefault();
	var exercise = $("#register-select-exercise-input").val();
	if(check_session() === true) {
		if(exercise !== undefined) {
			$.cookie("exercise", exercise);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-travel-page");
			}
		} else {
			$("#register-select-exercise-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-travel-page").on("show", function(evt) {
	if($.cookie("travel") !== undefined) {
		$("#register-select-travel-input").val($.cookie("travel"));
	}
});

$("#register-select-travel-input").change(function(evt) {
	$("#register-select-travel-error").hide();
});

$("#register-select-travel-done-button").click(function(evt) {
	evt.preventDefault();
	var travel = $("#register-select-travel-input").val();
	if(check_session() === true) {
		if(travel !== undefined) {
			$.cookie("travel", travel);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-religion-page");
			}
		} else {
			$("#register-select-travel-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-religion-page").on("show", function(evt) {
	if($.cookie("religion") !== undefined) {
		$("#register-select-religion-input").val($.cookie("religion"));
	}
});

$("#register-select-religion-input").change(function(evt) {
	$("#register-select-religion-error").hide();
});

$("#register-select-religion-done-button").click(function(evt) {
	evt.preventDefault();
	var religion = $("#register-select-religion-input").val();
	if(check_session() === true) {
		if(religion !== undefined) {
			$.cookie("religion", religion);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-religion-importance-page");
			}
		} else {
			$("#register-select-religion-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-religion-importance-page").on("show", function(evt) {
	if($.cookie("religion-importance") !== undefined) {
		$("#register-select-religion-importance-input").val($.cookie("religion-importance"));
	}
});

$("#register-select-religion-importance-input").change(function(evt) {
	$("#register-select-religion-importance-error").hide();
});

$("#register-select-religion-importance-done-button").click(function(evt) {
	evt.preventDefault();
	var religionImportance = $("#register-select-religion-importance-input").val();
	if(check_session() === true) {
		if(religionImportance !== undefined) {
			$.cookie("religion-importance", religionImportance);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-left-right-politics-page");
			}
		} else {
			$("#register-select-religion-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-left-right-politics-page").on("show", function(evt) {
	if($.cookie("left-right-politics") !== undefined) {
		$("#register-select-left-right-politics-input").val($.cookie("left-right-politics"));
	}
});

$("#register-select-left-right-politics-input").change(function(evt) {
	$("#register-select-left-right-politics-error").hide();
});

$("#register-select-left-right-politics-done-button").click(function(evt) {
	evt.preventDefault();
	var leftRight = $("#register-select-left-right-politics-input").val();
	if(check_session() === true) {
		if(leftRight !== undefined) {
			$.cookie("left-right-politics", leftRight);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-liberal-conservative-politics-page");
			}
		} else {
			$("#register-select-left-right-politics-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-liberal-conservative-politics-page").on("show", function(evt) {
	if($.cookie("liberal-conservative-politics") !== undefined) {
		$("#register-select-liberal-conservative-politics-input").val($.cookie("liberal-conservative-politics"));
	}
});

$("#register-select-liberal-conservative-politics-input").change(function(evt) {
	$("#register-select-liberal-conservative-politics-error").hide();
});

$("#register-select-liberal-conservative-politics-done-button").click(function(evt) {
	evt.preventDefault();
	var liberalConservative = $("#register-select-liberal-conservative-politics-input").val();
	if(check_session() === true) {
		if(liberalConservative !== undefined) {
			$.cookie("liberal-conservative-politics", liberalConservative);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-political-importance-page");
			}
		} else {
			$("#register-select-liberal-conservative-politics-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-political-importance-page").on("show", function(evt) {
	if($.cookie("political-importance") !== undefined) {
		$("#register-select-political-importance-input").val($.cookie("political-importance"));
	}
});

$("#register-select-political-importance-input").change(function(evt) {
	$("#register-select-political-importance-error").hide();
});

$("#register-select-political-importance-done-button").click(function(evt) {
	evt.preventDefault();
	var politicalImportance = $("#register-select-political-importance-input").val();
	if(check_session() === true) {
		if(politicalImportance !== undefined) {
			$.cookie("political-importance", politicalImportance);
			var nextPage = $.cookie("next-page");
			if(nextPage !== undefined) {
				load_page(nextPage);
				$.removeCookie("next-page");
			} else {
				load_page("register-select-favorite-television-series-page");
			}
		} else {
			$("#register-select-political-importance-error").show();
		}
	} else {
		load_home_page();
	}
});

$("#register-select-favorite-television-series-page").on("show", function(evt) {
	if($.cookie("favorite-television-series") !== undefined) {
		$("#register-select-favorite-television-series-input").val($.cookie("favorite-television-series"));
	}
});

$("#register-select-favorite-television-series-done-button").click(function(evt) {
	evt.preventDefault();
	var favoriteTelevisionSeries = $("#register-select-favorite-television-series-input").val();
	if(check_session() === true) {
		$.cookie("favorite-television-series", favoriteTelevisionSeries);
		var nextPage = $.cookie("next-page");
		if(nextPage !== undefined) {
			load_page(nextPage);
			$.removeCookie("next-page");
		} else {
			load_page("register-select-favorite-radio-shows-page");
		}
	} else {
		load_home_page();
	}
});

$("#register-select-favorite-radio-shows-page").on("show", function(evt) {
	if($.cookie("favorite-radio-shows") !== undefined) {
		$("#register-select-favorite-radio-shows-input").val($.cookie("favorite-radio-shows"));
	}
});

$("#register-select-favorite-radio-shows-done-button").click(function(evt) {
	evt.preventDefault();
	var favoriteRadioShows = $("#register-select-favorite-radio-shows-input").val();
	if(check_session() === true) {
		$.cookie("favorite-radio-shows", favoriteRadioShows);
		var nextPage = $.cookie("next-page");
		if(nextPage !== undefined) {
			load_page(nextPage);
			$.removeCookie("next-page");
		} else {
			load_page("register-select-favorite-bands-page");
		}
	} else {
		load_home_page();
	}
});

$("#register-select-favorite-bands-page").on("show", function(evt) {
	if($.cookie("favorite-bands") !== undefined) {
		$("#register-select-favorite-bands-input").val($.cookie("favorite-bands"));
	}
});

$("#register-select-favorite-bands-done-button").click(function(evt) {
	evt.preventDefault();
	var favoriteBands = $("#register-select-favorite-bands-input").val();
	if(check_session() === true) {
		$.cookie("favorite-bands", favoriteBands);
		var nextPage = $.cookie("next-page");
		if(nextPage !== undefined) {
			load_page(nextPage);
			$.removeCookie("next-page");
		} else {
			load_page("register-select-favorite-movies-page");
		}
	} else {
		load_home_page();
	}
});

$("#register-select-favorite-movies-page").on("show", function(evt) {
	if($.cookie("favorite-movies") !== undefined) {
		$("#register-select-favorite-movies-input").val($.cookie("favorite-movies"));
	}
});

$("#register-select-favorite-movies-done-button").click(function(evt) {
	evt.preventDefault();
	var favoriteMovies = $("#register-select-favorite-movies-input").val();
	if(check_session() === true) {
		$.cookie("favorite-movies", favoriteMovies);
		var nextPage = $.cookie("next-page");
		if(nextPage !== undefined) {
			load_page(nextPage);
			$.removeCookie("next-page");
		} else {
			load_page("register-select-best-things-in-the-world-page");
		}
	} else {
		load_home_page();
	}
});

$("#register-select-best-things-in-the-world-page").on("show", function(evt) {
	if($.cookie("best-things-in-the-world") !== undefined) {
		$("#register-select-best-things-in-the-world-input").val($.cookie("best-things-in-the-world"));
	}
});

$("#register-select-best-things-in-the-world-done-button").click(function(evt) {
	evt.preventDefault();
	var bestThingsInTheWorld = $("#register-select-best-things-in-the-world-input").val();
	if(check_session() !== undefined) {
		$.cookie("best-things-in-the-world", bestThingsInTheWorld);
		var nextPage = $.cookie("next-page");
		if(nextPage !== undefined) {
			load_page(nextPage);
			$.removeCookie("next-page");
		} else {
			load_page("register-select-ignite-me-page");
		}
	} else {
		load_home_page();
	}
});

$("#register-select-ignite-me-page").on("show", function(evt) {
	if($.cookie("ignite-me") !== undefined) {
		$("#register-select-ingite-me-input").val($.cookie("ignite-me"));
	}
});

$("#register-select-ignite-me-done-button").click(function(evt) {
	evt.preventDefault();
	var igniteMe = $("#register-select-ignite-me-input").val();
	if(check_session() === true) {
		$.cookie("ignite-me", igniteMe);
		var nextPage = $.cookie("next-page");
		if(nextPage !== undefined) {
			load_page(nextPage);
			$.removeCookie("next-page");
		} else {
			load_page("register-select-not-exciting-page");
		}
	} else {
		load_home_page();
	}
});

$("#register-select-not-exciting-page").on("show", function(evt) {
	if($.cookie("not-exciting") !== undefined) {
		$("#register-select-not-exciting-input").val($.cookie("not-exciting"));
	}
});

$("#register-select-not-exciting-done-button").click(function(evt) {
	evt.preventDefault();
	var notExciting = $("#register-select-not-exciting-input").val();
	if(check_session() === true) {
		$.cookie("not-exciting", notExciting);
		var nextPage = $.cookie("next-page");
		if(nextPage !== undefined) {
			load_page(nextPage);
			$.removeCookie("next-page");
		} else {
			load_page("register-confirm-profile-information-page");
		}
	} else {

	}
});

$("#register-confirm-profile-information-page").on("show", function() {
	$.cookie("next-page", "register-confirm-profile-information-page");

	var username = $.cookie("username");
	$("#register-confirm-username-data").val(username);

	var invites = $.cookie("invites");
	$("#register-confirm-invites-data").val(invites);

	var address = $.cookie("address");
	address = address.replace(/\+/gi, " ");
	$("#register-confirm-address-data").val(address);

	var profilePicture = $.cookie("picture");
	$("#register-confirm-profile-picture-data-url").attr("href", hostname + "uploads/" + profilePicture);
	$("#register-confirm-profile-picture-data-url").html(hostname + "uploads/" + profilePicture);
	
	var profileText = $.cookie("profile-text");
	$("#register-confirm-profile-text-data").text(profileText);

	var gender = $.cookie("gender");
	if(gender === "man") {
		$("#register-confirm-gender-data").val("Mies");
	} else if(gender === "woman") {
		$("#register-confirm-gender-data").val("Nainen");
	} else if(gender === "transman") {
		$("#register-confirm-gender-data").val("Transmies");
	} else if(gender === "transwoman") {
		$("#register-confirm-gender-data").val("Transnainen");
	} else if(gender === "sexless") {
		$("#register-confirm-gender-data").val("Sukupuoleton");
	}

	var birthday = $.cookie("birthday");
	var birthdayArr = birthday.split("-");
	$("#register-confirm-birthday-data").val(birthdayArr[2] + "/" + birthdayArr[1] + "/" + birthdayArr[0]);

	var relationshipStatus = $.cookie("relationship-status");
	if(relationshipStatus === "single") {
		$("#register-confirm-relationship-status-data").val("Sinkku");
	} else if(relationshipStatus === "relationship") {
		$("#register-confirm-relationship-status-data").val("Parisuhde");
	} else if(relationshipStatus === "cohabitation") {
		$("#register-confirm-relationship-status-data").val("Avoliitto");
	} else if(relationshipStatus === "marriage") {
		$("#register-confirm-relationship-status-data").val("Avioliitto");
	} else if(relationshipStatus === "divorced") {
		$("#register-confirm-relationship-status-data").val("Eronnut");
	} else if(relationshipStatus === "seperation") {
		$("#register-confirm-relationship-status-data").val("Asumusero");
	} else if(relationshipStatus === "widow") {
		$("#register-confirm-relationship-status-data").val("Leski");
	} else if(relationshipStatus === "none") {
		$("#register-confirm-relationship-status-data").val("En halua kertoa");
	}

	var sexualOrientation = $.cookie("sexual-orientation");
	if(sexualOrientation === "hetero") {
		$("#register-confirm-sexual-orientation-data").val("Heteroseksuaali");
	} else if(sexualOrientation === "gay") {
		$("#register-confirm-sexual-orientation-data").val("Homoseksuaali");
	} else if(sexualOrientation === "bi") {
		$("#register-confirm-sexual-orientation-data").val("Bisexsuaali");
	} else if(sexualOrientation === "ase") {
		$("#register-confirm-sexual-orientation-data").val("Aseksuaali");
	}

	var lookingFor = $.cookie("looking-for");
	var lookingForArr = lookingFor.split(",");
	var i;
	for(i = 0; i < lookingForArr.length; i++) {
		if(lookingForArr[i] === "friends") {
			lookingForArr[i] = "Ystävyyttä";
		} else if(lookingForArr[i] === "love") {
			lookingForArr[i] = "Rakkautta";
		} else if(lookingForArr[i] === "date") {
			lookingForArr[i] = "Tapaamisia";
		} else if(lookingForArr[i] === "sex") {
			lookingForArr[i] = "Seksiä";
		} else if(lookingForArr[i] === "other") {
			lookingForArr[i] = "Jotain muuta";
		} else if(lookingForArr[i] === "none") {
			lookingForArr[i] === "En halua kertoa";
		}
	}
	var lookingForParsed = lookingForArr.join(", ");
	$("#register-confirm-looking-for-data").val(lookingForParsed);
	
	$("#register-confirm-height-data").val($.cookie("height") + " cm");
	$("#register-confirm-weight-data").val($.cookie("weight") + " kg");

	var bodyType = $.cookie("body-type");
	if(bodyType === "slender") {
		bodyType = "Siro";
	} else if(bodyType === "slim") {
		bodyType = "Hoikka";
	} else if(bodyType === "low-fat") {
		bodyType = "Vähärasvainen";
	} else if(bodyType === "sporty") {
		bodyType = "Sporttinen";
	} else if(bodyType === "muscular") {
		bodyType = "Lihaksikas";
	} else if(bodyType === "roundish") {
		bodyType = "Pyöreähkö";
	} else if(bodyType === "overweight") {
		bodyType = "Ylipainoinen";
	} else if(bodyType === "none") {
		bodyType = "En halua kertoa";
	}
	$("#register-confirm-body-type-data").val(bodyType);

	var eyeColor = $.cookie("eye-color");
	if(eyeColor === "blue") {
		eyeColor = "Sininen";
	} else if(eyeColor === "brown") {
		eyeColor = "Ruskea";
	} else if(eyeColor === "green") {
		eyeColor = "Vihreä";
	} else if(eyeColor === "gray") {
		eyeColor = "Harmaa";
	} else if(eyeColor === "amber") {
		eyeColor = "Kullanruskea";
	} else if(eyeColor === "hazel") {
		eyeColor = "Pähkinänruseka";
	} else if(eyeColor === "red") {
		eyeColor = "Punainen";
	} else if(eyeColor === "violet") {
		eyeColor = "Violetti";
	} else if(eyeColor === "none") {
		eyeColor = "En halua kertoa";
	}
	$("#register-confirm-eye-color-data").val(eyeColor);

	var hairLength = $.cookie("hair-lenght");
	if(hairLength === "bald") {
		hairLength = "Kalju";
	} else if(hairLength === "hedgehog") {
		hairLength = "Siili";
	} else if(hairLength === "short") {
		hairLength = "Lyhyet";
	} else if(hairLength === "long") {
		hairLength = "Pitkät";
	} else if(hairLength === "none") {
		hairLength = "En halua kertoa";
	}
	$("#register-confirm-hair-length-data").val(hairLength);

	var hairColor = $.cookie("hair-color");
	if(hairColor === "verylight") {
		hairColor = "Hyvin vaalea";
	} else if(hairColor === "light") {
		hairColor = "Vaalea";
	} else if(hairColor === "lightbrown") {
		hairColor = "Vaaleanruskea";
	} else if(hairColor === "brown") {
		hairColor = "Ruskea";
	} else if(hairColor === "black") {
		hairColor = "Musta";
	} else if(hairColor === "gray") {
		hairColor = "Harmaa";
	} else if(hairColor === "red") {
		hairColor = "Punainen";
	} else if(hairColor === "pink") {
		hairColor = "Pinkki";
	} else if(hairColor === "white") {
		hairColor = "Valkoinen";
	} else if(hairColor === "colorful") {
		hairColor = "Värikäs";
	} else if(hairColor === "changeable") {
		hairColor = "Muuttuu usein";
	} else if(hairColor === "none") {
		hairColor = "En halua kertoa";
	}
	$("#register-confirm-hair-color-data").val(hairColor);
	
	var kids = $.cookie("kids");

	var kidsArr = kids.split(",");
	var i;
	for(i = 0; i < kidsArr.length; i++) {
		if(kidsArr[i] === "yes") {
			kidsArr[i] = "Kyllä";
		} else if(kidsArr[i] === "no") {
			kidsArr[i] = "Ei";
		} else if(kidsArr[i] === "athome") {
			kidsArr[i] = "Kotona";
		} else if(kidsArr[i] === "somewhereelse") {
			kidsArr[i] = "Muualla";
		} else if(kidsArr[i] === "jointcustody") {
			kidsArr[i] = "Yhteishuoltajuus";
		} else if(kidsArr[i] === "solecustody") {
			kidsArr[i] = "Yksinhuoltaja";
		} else if(kidsArr[i] === "iwantkids") {
			kidsArr[i] = "Haluan lapsia";
		} else if(kidsArr[i] === "idontwantkids") {
			kidsArr[i] = "En halua lapsia";
		} else if(kidsArr[i] === "idontknowifiwantkids") {
			kidsArr[i] = "En tiedä haluanko lapsia";
		} else if(kidsArr[i] === "kidsdonotmatter") {
			kidsArr[i] = "Lapset eivät haittaa";
		} else if(kidsArr[i] === "weekendparent") {
			kidsArr[i] = "Kerran viikossa lapset minulla";
		} else if(kidsArr[i] === "secondweekendparent") {
			kidsArr[i] = "Kaksi kertaa kuussa lapset minulla";
		} else if(kidsArr[i] === "monthlyparent") {
			kidsArr[i] = "Kerran kuussa lapset minulla";
		} else if(kidsArr[i] === "none") {
			kidsArr[i] = "En halua kertoa";
		}
	}
	var kidsParsed = kidsArr.join(", ");
	$("#register-confirm-kids-data").val(kidsParsed);

	var accomodation = $.cookie("accomodation");
	if(accomodation === "alone") {
		accomodation = "yksin";
	} else if(accomodation = "withfriend") {
		accomodation = "Ystävän kanssa";
	} else if(accomodation = "withparents") {
		accomodation = "Vanhempien luona";
	} else if(accomodation = "sharedflat") {
		accomodation = "Kimppakämpässä";
	} else if(accomodation = "withpartner") {
		accomodation = "Kumppanin kanssa";
	} else if(accomodation = "homeless") {
		accomodation = "Koditon";
	} else if(accomodation = "none") {
		accomodation = "En halua kertoa";
	}
	$("#register-confirm-accomodation-data").val(accomodation);
	
	var ethnic = $.cookie("ethnic-identity");
	if(ethnic === "white") {
		ethnic = "Valkoinen";
	} else if(ethnic === "black") {
		ethnic = "Musta";
	} else if(ethnic === "indian") {
		ethnic = "Intialainen";
	} else if(ethnic === "latino") {
		ethnic = "Latino";
	} else if(ethnic === "arab") {
		ethnic = "Arabi";
	} else if(ethnic === "asian") {
		ethnic = "Aasialainen";
	} else if(ethnic === "midget") {
		ethnic = "Kääpiö";
	} else if(ethnic === "none") {
		ethnic = "En halua kertoa";
	}
	$("#register-confirm-ethnic-identity-data").val(ethnic);

	var lang = $.cookie("language-skills");
	var langArr = lang.split(",");
        var i;
        for(i = 0; i < langArr.length; i++) {
		if(langArr[i] === "finnish") {
			langArr[i] = "Suomi";
		} else if(langArr[i] === "swedish") {
			langArr[i] = "Ruotsi";
		} else if(langArr[i] === "english") {
			langArr[i] = "Englanti";
		} else if(langArr[i] === "russian") {
			langArr[i] = "Venäjä";
		} else if(langArr[i] === "german") {
			langArr[i] = "Saksa";
		} else if(langArr[i] === "japanese") {
			langArr[i] = "Japani";
		} else if(langArr[i] === "others") {
			langArr[i] = "Muita";
		} else if(langArr[i] === "none") {
			langArr[i] = "En halua kertoa";
		}
	}
        var langParsed = langArr.join(", ");
	$("#register-confirm-language-skills-data").val(langParsed);

	var edu = $.cookie("education");
	if(edu === "untrained") {
		edu = "Kouluttamaton";
	} else if(edu === "lifeschool") {
		edu = "Elämänkoulu";
	} else if(edu === "school") {
		edu = "Peruskoulu";
	} else if(edu === "vocational") {
		edu = "Ammattikoulu";
	} else if(edu === "high") {
		edu = "Lukio";
	} else if(edu === "applied") {
		edu = "Ammattikorkeakoulu";
	} else if(edu === "college") {
		edu = "Yliopisto/korkeakoulu";
	} else if(edu === "masters") {
		edu = "Maisterin tutkinto";
	} else if(edu === "doctor") {
		edu = "Tohtorin tutkinto";
	} else if(edu === "none") {
		edu = "En halua kertoa";
	}
	$("#register-confirm-education-data").val(edu);

	var work = $.cookie("work");
	if(work === "unemployed") {
		work = "Työtön";
	} else if(work === "student") {
		work = "Opiskelija";
	} else if(work === "part-time") {
		work = "Osa-aikatyö";
	} else if(work === "morning") {
		work = "Aamutyö";
	} else if(work === "day") {
		work = "Päivätyö";
	} else if(work === "evening") {
		work = "Iltatyö";
	} else if(work === "night") {
		work = "Yötyö";
	} else if(work === "workaholic") {
		work = "Työnarkomaani";
	} else if(work === "pension") {
		work = "Eläke";
	} else if(work === "none") {
		work = "En halua kertoa";
	}
	$("#register-confirm-work-data").val(work);

	var income = $.cookie("income");
	$("#register-confirm-income-data").val(income);
	
	var vocation = $.cookie("vocation");
	if(vocation === "administration/finance") {
		vocation = "Hallinto/talous";
	} else if(vocation === "information-technology") {
		vocation = "Atk/it/tietoliikenne";
	} else if(vocation === "social/health") {
		vocation = "Sosiaali-/terveysala";
	} else if(vocation === "marketing/sales") {
		vocation = "Markkinointi/myynti";
	} else if(vocation === "science/technology") {
		vocation = "Tiede/teknologia";
	} else if(vocation === "education") {
		vocation = "Koulutus";
	} else if(vocation === "housewife/-husband") {
		vocation = "Kotiäiti/-isä";
	} else if(vocation === "agriculture-forestry") {
		vocation = "Maa- ja metsätalous";
	} else if(vocation === "entrepreneur") {
		vocation = "Yrittäjä";
	} else if(vocation === "none") {
		vocation = "En halua kertoa!";
	}
	$("#register-confirm-vocation-data").val(vocation);

	var dress = $.cookie("dress-style");
	if(dress = "fashionable") {
		dress = "Muodikas";
	} else if(dress = "business") {
		dress = "Bisnes";
	} else if(dress = "sporty") {
		dress = "Sporttinen";
	} else if(dress = "classic") {
		dress = "Klassinen";
	} else if(dress = "fleamarket") {
		dress = "Kirpputori";
	} else if(dress = "self-indulgent") {
		dress = "Mukavuuden haluinen";
	} else if(dress = "regular") {
		dress = "Normaali";
	} else if(dress = "hoppers") {
		dress = "Hoppari";
	} else if(dress = "rocker") {
		dress = "Rokkari";
	} else if(dress = "goth") {
		dress = "Gootti";
	} else if(dress = "allthesame") {
		dress = "Ihan sama";
	} else if(dress = "nudist") {
		dress = "Nudisti";
	} else if(dress = "none") {
		dress = "En halua kertoa";
	}
	$("#register-confirm-dress-style-data").val(dress);

	var smoke = $.cookie("smoking");
	if(smoke === "smokeless") {
		smoke = "Savuton";
	} else if(smoke === "company") {
		smoke = "Seurassa";
	} else if(smoke === "drunken") {
		smoke = "Humalassa";
	} else if(smoke === "regular") {
		smoke = "Säännöllisesti";
	} else if(smoke === "chimney") {
		smoke = "Korsteeni";
	} else if(smoke === "none") {
		smoke = "En halua kertoa";
	}
	$("#register-confirm-smoking-data").val(smoke);

	var alc = $.cookie("alcohol");
	if(alc === "alcohol-free") {
		alc = "Alkoholiton";
	} else if(alc === "holidays") {
		alc = "Juhlapäivinä";
	} else if(alc === "company") {
		alc = "Hyvässä seurassa";
	} else if(alc === "withfood") {
		alc = "Ruuan kanssa";
	} else if(alc === "occasionally") {
		alc = "Satunnaisesti";
	} else if(alc === "everyday") {
		alc = "Joka päivä";
	} else if(alc === "weekly") {
		alc = "Viikottain";
	} else if(alc === "monthly") {
		alc = "Kerran kuussa";
	} else if(alc === "yearly") {
		alc = "Kerran vuodessa";
	} else if(alc === "alcoholic") {
		alc = "Tapajuoppo";
	} else if(alc === "none") {
		alc = "En halua kertoa";
	}
	$("#register-confirm-alcohol-data").val(alc);

	var pets = $.cookie("pets");
        var petsArr = pets.split(",");
        var i;
        for(i = 0; i < petsArr.length; i++) {
		if(petsArr[i] === "horse") {
			petsArr[i] = "Hevonen";
		} else if(petsArr[i] === "pony") {
			petsArr[i] = "Poni";
		} else if(petsArr[i] === "spider") {
			petsArr[i] = "Hämähäkki";
		} else if(petsArr[i] === "fish") {
			petsArr[i] = "Kala";
		} else if(petsArr[i] === "rodent") {
			petsArr[i] = "Jyrsijä";
		} else if(petsArr[i] === "turtle") {
			petsArr[i] = "Kilpikonna";
		} else if(petsArr[i] === "dog") {
			petsArr[i] = "Koira";
		} else if(petsArr[i] === "cat") {
			petsArr[i] = "Kissa";
		} else if(petsArr[i] === "snake") {
			petsArr[i] = "Käärme";
		} else if(petsArr[i] === "bird") {
			petsArr[i] = "Lintu";
		} else if(petsArr[i] === "stuffed-animal") {
			petsArr[i] = "Pehmolelu";
		} else if(petsArr[i] === "nopets") {
			petsArr[i] = "Ei lemmikkejä";
		} else if(petsArr[i] === "likepets") {
			petsArr[i] = "Pidän eläimistä";
		} else if(petsArr[i] === "none") {
			petsArr[i] = "En halua kertoa";
		}
        }
        var petsParsed = petsArr.join(", ");
        $("#register-confirm-pets-data").val(petsParsed);

	var ex = $.cookie("exercise");
	if(ex === "idont") {
		ex = "En urheile";
	} else if(ex === "casually") {
		ex = "Satunnaisesti";
	} else if(ex === "regularily") {
		ex = "Säännöllisesti";
	} else if(ex === "daily") {
		ex = "Lähes Päivittäin";
	} else if(ex === "lifestyle") {
		ex = "Elämäntapa";
	} else if(ex === "none") {
		ex = "En halua kertoa";
	}
	$("#register-confirm-exercise-data").val(ex);

	var travel = $.cookie("travel");
	if(travel === "cottagebatty") {
		travel = "Mökkihöperö";
	} else if(travel === "neighboring-areas") {
		travel = "Lähialueilla";
	} else if(travel === "occasionally") {
		travel = "Satunnaisesti";
	} else if(travel === "few-times-a-yer") {
		travel = "Muutaman kertaa vuodessa";
	} else if(travel === "monthly") {
		travel = "Lähes joka kuukausi";
	} else if(travel === "weekly") {
		travel = "Lähes joka viikko";
	} else if(travel === "daily") {
		travel = "Lähes joka päivä";
	} else if(travel === "allthetime") {
		travel = "Matkalla aina johonkin";
	} else if(travel === "none") {
		travel = "En halua kertoa";
	}
	$("#register-confirm-travel-data").val(travel);

	var religion = $.cookie("religion");
	if(religion === "atheist") {
		religion = "Ateisti";
	} else if(religion === "agnostic") {
		religion = "Agnostikko";
	} else if(religion === "buddhism") {
		religion = "Buddhalainen";
	} else if(religion === "christian") {
		religion = "Kristitty";
	} else if(religion === "hinduism") {
		religion = "Hindu";
	} else if(religion === "muslism") {
		religion = "Muslimi";
	} else if(religion === "jewish") {
		religion = "Juutalainen";
	} else if(religion === "newage") {
		religion = "New Age";
	} else if(religion === "none") {
		religion = "En halua kertoa";
	}
	$("#register-confirm-religion-data").val(religion);

	var relimp = $.cookie("religion-importance");
	if(relimp === "insignificant") {
		relimp = "Merkityksetön";
	} else if(relimp === "low") {
		relimp = "Vähäinen";
	} else if(relimp === "normal") {
		relimp = "Normaali";
	} else if(relimp === "important") {
		relimp = "Tärkeä";
	} else if(relimp === "true-blue") {
		relimp = "Vakaumuksellinen";
	} else if(relimp === "none") {
		relimp = "En halua kertoa";
	}
	$("#register-confirm-religion-importance-data").val(relimp);

	var lrp = $.cookie("left-right-politics");
	switch(lrp) {
		case "left":
			lrp = "Vasemmistolainen";
			break;
		case "moderateleft":
			lrp = "Maltillisesti vasemmalla";
			break;
		case "inbetween":
			lrp = "Jossain välimaastossa";
			break;
		case "moderateright":
			lrp = "Maltillisesti oikealla";
			break;
		case "right":
			lrp = "Oikeistolainen";
			break;
		case "dontknow":
			lrp = "En tiedä";
			break;
		case "dontcare":
			lrp = "En välitä";
			break;
		case "none":
			lrp = "En halua kertoa";
			break;
	}
	$("#register-confirm-left-right-politics-data").val(lrp);
	
	var lcp = $.cookie("liberal-conservative-politics");
	switch(lcp) {
		case "conservative":
			lcp = "Konservatiivinen";
			break;
		case "ratherconservative":
			lcp = "Melko konservatiivinen";
			break;
		case "inbetween":
			lcp = "Jossain välimaastossa";
			break;
		case "ratherliberal":
			lcp = "Melko liberaalinen";
			break;
		case "liberal":
			lcp = "Liberaalinen";
			break;
		case "dontknow":
			lcp = "En tiedä";
			break;
		case "dontcare":
			lcp = "En välitä";
			break;
		case "none":
			lcp = "En halua kertoa";
			break;
	}
	$("#register-confirm-liberal-conservative-politics-data").val(lcp);
	
	var pi = $.cookie("political-importance");
	switch(pi) {
		case "dontcare":
			pi = "Aivan sama";
			break;
		case "title-follow":
			pi = "Lähinnä otsikko tasolla";
			break;
		case "active-follow":
			pi = "Seuraan aktiivisesti";
			break;
		case "involved":
			pi = "Mukana politiikassa";
			break;
		case "none":
			pi = "En halua kertoa";
			break;
	}
	$("#register-confirm-political-importance-data").val(pi);

	$("#register-confirm-favorite-television-series-data").val($.cookie("favorite-television-series"));
	$("#register-confirm-favorite-radio-shows-data").val($.cookie("favorite-radio-shows"));
	$("#register-confirm-favorite-bands-data").val($.cookie("favorite-bands"));
	$("#register-confirm-favorite-movies-data").val($.cookie("favorite-movies"));
	$("#register-confirm-best-things-in-the-world-data").val($.cookie("best-things-in-the-world"));
	$("#register-confirm-ignite-me-data").val($.cookie("ignite-me"));
	$("#register-confirm-not-exciting-data").val($.cookie("not-exciting"));

	
});

$("#register-confirm-profile-information-form").submit(function(evt) {
	evt.preventDefault();
	$.ajax({
		type: $(this).attr('method'),
		url: $(this).attr('action'),
		data: { call : 'create_profile',
			accomodation : $.cookie("accomodation"),
			address : $.cookie("address"),
			alcohol : $.cookie("alcohol"),
			best_things_in_the_world : $.cookie("best-things-in-the-world"),
			birthday : $.cookie("birthday"),
			body_type : $.cookie("body-type"),
			dress_style : $.cookie("dress-style"),
			education : $.cookie("education"),
			ethnic_identity : $.cookie("ethnic-identity"),
			exercise : $.cookie("exercise"),
			eye_color : $.cookie("eye-color"),
			favorite_bands : $.cookie("favorite-bands"),
			favorite_movies : $.cookie("favorite-movies"),
			favorite_radio_shows : $.cookie("favorite-radio-shows"),
			favorite_television_series : $.cookie("favorite-television-series"),
			gender : $.cookie("gender"),
			hair_color : $.cookie("hair-color"),
			hair_length : $.cookie("hair-lenght"),
			height : $.cookie("height"),
			ignite_me : $.cookie("ignite-me"),
			income : $.cookie("income"),
			kids : $.cookie("kids"),
			language_skills : $.cookie("language-skills"),
			latlng : $.cookie("latlng"),
			left_right_politics : $.cookie("left-right-politics"),
			liberal_conservative_politics : $.cookie("liberal-conservative-politics"),
			looking_for : $.cookie("looking-for"),
			not_exciting : $.cookie("not-exciting"),
			pets : $.cookie("pets"),
			picture : $.cookie("picture"),
			profile_text : $.cookie("profile-text"),
			political_importance : $.cookie("political-importance"),
			relationship_status : $.cookie("relationship-status"),
			religion : $.cookie("religion"),
			religion_importance : $.cookie("religion-importance"),
			session : $.cookie("session"),
			sexual_orientation : $.cookie("sexual-orientation"),
			smoking : $.cookie("smoking"),
			travel : $.cookie("travel"),
			vocation : $.cookie("vocation"),
			weight : $.cookie("weight"),
			work : $.cookie("work") }
	}).done(function(data) {
		console.log(data);
		var result = $.parseJSON(data);
		if(result.success === true) {
			console.log("Profile saved\r\n");
			$.removeCookie("next-page");
		//	next_page("registeration-done-page");
	
		} else {
			console.log(result.error);
		}
	});
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
	if(window.map === undefined) {
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
		url: "https://maps.googleapis.com/maps/api/geocode/json",
		type: "GET",
		data: { address : jaddress, sensor: false }
	}).done(function(data) {
		console.log(data);
		if(data.status === "OK") {
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
		url: "https://maps.googleapis.com/maps/api/geocode/json",
		type: "GET",
		data: { address : jaddress, sensor: false }
	}).done(function(data) {
		if(data.status === "OK") {
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
