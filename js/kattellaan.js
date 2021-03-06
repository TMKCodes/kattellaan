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
			$("#search-submit").prop("disabled", false);
			$("#search-submit").removeClass("disabled");
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
				if(data.results[0].address_components[i].types[0] === "locality" || data.results[0].address_components[i].types[0] == "administrative_area_level_3") {
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

function load_latest_users_to_home_page() {
	$.ajax({
		url: "php/api.php",
		type: "POST",
		async: true,
		data: { call : 'get_latest_users' }
	}).done(function(data) {
		console.log(data);
		var result = $.parseJSON(data);
		if(result.success === true) {
			var latest_users_display = "";
			for(var i = 0; i < ((result.users.length < 6) ? result.users.length : 6); i++) {
				latest_users_display += '<div class="new-user col-xs-2 col-sm-2">';
				latest_users_display += '<div class="uid" style="display: none;">' + result.users[i].id +  '</div>';
				if(result.users[i].picture != "") {
					latest_users_display += '<div class="profile-picture"><img style="width: 100%;" src="/uploads/' + result.users[i].picture + '" alt="' + result.users[i].username + '" /></div>';
				} else {
					latest_users_display += '<div class="profile-picture"><img style="width: 100%;" src="/uploads/default.jpg" alt="' + result.users[i].username + '" /></div>';
				}
				latest_users_display += '</div>';
			}
			$("#latest-users-display").html(latest_users_display);
			$(".profile-picture").click(function(evt) {
				var father = $(this).parent();
				var uid = $(father).children(".uid").text();
				load_profile_page(uid);
			});
		} else {
			console.log(result.error);
		}
	});
}


function load_home_page() {
	$("body > .container").hide();
	$("#home-page").show();
	$("#web-advertisement").show();
	if(check_session() === true) {
		// disable register jumbotron
		$("#home-page-register").hide();
		$("#home-page-features").hide();
		$("#home-page-logged-in-features").show();
		load_latest_users_to_home_page();
	} else {
		$("#home-page-logged-in-features").hide();
		$("#home-page-register").show();
		$("#home-page-features").show();
	}
	history.pushState(null, "home-page", hostname);
}

function load_page(page) {
	$("body > .container").hide();
	$("#" + page).show();
	history.pushState(null, page, hostname + "?page=" + page);
}

function load_custom_page(page, addons) {
	$("body > .container").hide();
	$("#" + page).show();
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

function eye_color(eyec) {
	if(eyec === "blue") {
		eyec = "Sininen";
	} else if(eyec === "brown") {
		eyec = "Ruskea";
	} else if(eyec === "green") {
		eyec = "Vihreä";
	} else if(eyec === "gray") {
		eyec = "Harmaa";
	} else if(eyec === "amber") {
		eyec = "Kullanruskea";
	} else if(eyec === "hazel") {
		eyec = "Pähkinänruseka";
	} else if(eyec === "red") {
		eyec = "Punainen";
	} else if(eyec === "violet") {
		eyec = "Violetti";
	} else if(eyec === "none") {
		eyec = "En halua kertoa";
	}
	return eyec;
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
	
	return town + ":sta";
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
		case 'Korsholm': return "Korsholmista";
		default: return unknown_town(town);
	}
}

function sexual_orientation(sexor) {
	if(sexor === "hetero") {
		sexor = "heteroseksuaali";
	} else if(sexor === "gay") {
		sexor = "homoseksuaali";
	} else if(sexor === "bi") {
		sexor = "bisexsuaali";
	} else if(sexor === "ase") {
		sexor = "aseksuaali";
	}
	return sexor;
}

function body_type(btype) {
	if(btype === "slender") {
		btype = "Siro";
	} else if(btype === "slim") {
		btype = "Hoikka";
	} else if(btype === "low-fat") {
		btype = "Vähärasvainen";
	} else if(btype === "sporty") {
		btype = "Sporttinen";
	} else if(btype === "muscular") {
		btype = "Lihaksikas";
	} else if(btype === "roundish") {
		btype = "Pyöreähkö";
	} else if(btype === "overweight") {
		btype = "Ylipainoinen";
	} else if(btype === "none") {
		btype = "En halua kertoa";
	}
	return btype;
}


function hair_color(hcolor) {
	if(hcolor === "verylight") {
		hcolor = "Hyvin vaalea";
	} else if(hcolor === "light") {
		hcolor = "Vaalea";
	} else if(hcolor === "lightbrown") {
		hcolor = "Vaaleanruskea";
	} else if(hcolor === "brown") {
		hcolor = "Ruskea";
	} else if(hcolor === "black") {
		hcolor = "Musta";
	} else if(hcolor === "gray") {
		hcolor = "Harmaa";
	} else if(hcolor === "red") {
		hcolor = "Punainen";
	} else if(hcolor === "pink") {
		hcolor = "Pinkki";
	} else if(hcolor === "white") {
		hcolor = "Valkoinen";
	} else if(hcolor === "colorful") {
		hcolor = "Värikäs";
	} else if(hcolor === "changeable") {
		hcolor = "Muuttuu usein";
	} else if(hcolor === "none") {
		hcolor = "En halua kertoa";
	}
	return hcolor;
}

function hair_length(hlength) {
	if(hlength === "bald") {
		hlength = "Kalju";
	} else if(hlength === "hedgehog") {
		hlength = "Siili";
	} else if(hlength === "short") {
		hlength = "Lyhyet";
	} else if(hlength === "long") {
		hlength = "Pitkät";
	} else if(hlength === "none") {
		hlength = "En halua kertoa";
	}
	return hlength;
}

function accomodation(accomodation) {
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
	return accomodation;
}

function recursive_kids(kids) {
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
	return kidsArr.join(", ");
}

function ethnic_identity(ethnic) {
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
	return ethnic;
}

function recursive_language_skills(lang) {
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
	if(langArr > 1) {
		return langArr.join(", ");
	} else {
		return langArr[0];
	}
}

function education(edu) {
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
	return edu;
}

function work(work) {
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
	return work;
}

function vocation(vocation) {
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
	return vocation;
}

function dress_style(dress) {
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
	return dress;
}	

function smoking(smoke) {
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
	return smoke;
}

function alcohol(alc) {
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
	return alc;
}

function recursive_pets(pets) {
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
        return petsArr.join(", ");
}

function exercise(ex) {
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
	return ex;
}

function travel(travel) {
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
	return travel;
}

function religion(religion) {
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
	return religion;
}

function religion_importance(relimp) {
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
	return relimp;
}

function left_right_politics(lrp) {
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
	return lrp;
}

function liberal_conservative_politics(lcp) {
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
	return lcp;
}

function political_importance(pi) {
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
	return pi;
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
			distance = distance / 1000;
			var new_distance;
			if(distance >= 0 && distance < 10) {
				profile_text += " asuu alle 10 kilometrin päässä.";
			}
			if(distance >= 10 && distance < 50) {
				profile_text += " asuu alle 50 kilometrin päässä.";
			}
			if(distance >= 50 && distance < 100) {
				profile_text += " asuu alle 100 kilometrin päässä.";
			}
			if(distance >= 100 && distance < 250) {
				profile_text += " asuu alle 250 kilometrin päässä.";
			}
			if(distance >= 250 && distance < 500) {
				profile_text += " asuu alle 500 kilometrin päässä.";
			}
			if(distance >= 500) {
				profile_text += " asuu yli 500 kilometrin päässä.";
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

	var sexorientation = sexual_orientation(profile.sexual_orientation);

	var asl = "<h2> Olen ";

	if(age != "") {
		asl += age + " vuotias ";
	}
	
	asl += sexorientation + " " + relationshipStatus + " " + sGender.toLowerCase() + " " + town
	
	if(profile.looking_for == "null") {
		asl = asl + ".</h2>";
	} else {
		var lookingFor = recursive_looking_for(profile.looking_for);
		var lookingForArr = lookingFor.split(",");
		lookingFor = lookingForArr.join(", ");
		lookingFor = lookingFor.replace(/,\s([^,]+)$/, " ja $1");	
		asl = asl + " joka etsii " + lookingFor.toLowerCase() + ".</h2>";
	}

	var profile_text = "<p>" + profile.profile_text + "</p>";

	$("#profile-page-basic-information-asl").html(asl + profile_text);
	
	var favorites = "<h3>Lempiasiat</h3>";
	if(profile.best_things_in_the_world != "") 
		favorites += "<p><b>Parasta maailmassa:</b> " + profile.best_things_in_the_world + "</p>";
	if(profile.ignite_me != "") 
		favorites += "<p><b>Sytyttää:</b> " + profile.ignite_me + "</p>";
	if(profile.favorite_television_series != "") 
		favorites += "<p><b>Sarjat:</b> " + profile.favorite_television_series + "</p>";
	if(profile.favorite_movies != "")
		favorites += "<p><b>Elokuvat:</b> " + profile.favorite_movies + "</p>";
	if(profile.favorite_bands != "")
		favorites += "<p><b>Musiikki:</b> " + profile.favorite_bands + "</p>";
	if(profile.favorite_radio_shows != "")
		favorites += "<p><b>Radio:</b> " + profile.favorite_radio_shows + "</p>";
	if(profile.not_exciting != "") 
		favorites += "<p><b>Huonoa maailmassa:</b> " + profile.not_exciting + "</p>";

	$("#profile-page-information-favorites").html(favorites);

	var weight = profile.weight;
	var height = profile.height;
	var bodytype = body_type(profile.body_type);
	var eyecolor = eye_color(profile.eye_color);
	var hairlength = hair_length(profile.hair_length);
	var haircolor = hair_color(profile.hair_color);

	var profile_page_information_outlook = "<h3>Ulkonäkö</h3>";
	profile_page_information_outlook += "<p><b>Paino:</b> " + weight + " kg</p><p><b>Pituus:</b> " + height + " cm</p><p><b>Ruumiinrakenne:</b> " + bodytype + "</p>";
	profile_page_information_outlook += "<p><b>Silmien väri:</b> " + eyecolor + "</p><p><b>Hiusten pituus:</b> " + hairlength + "</p><p><b>Hiusten väri:</b> " + haircolor + "</p>";
	
	$("#profile-page-information-outlook").html(profile_page_information_outlook);


	var kids = recursive_kids(profile.kids);
	if(kids == "null") {
		kids = "";
	}
	var acco = accomodation(profile.accomodation);
	if(acco == "null") {
		acco = "";
	}
	var ethnicidentity = ethnic_identity(profile.ethnic_identity);
	if(ethnicidentity == "null") {
		ethnicidentity = "";
	}
	var languageskills = recursive_language_skills(profile.language_skills);
	if(languageskills == "null") {
		languageskills = "";
	}
	var edu = education(profile.education);
	if(edu == "null") {
		edu = "";
	}
	var works = work(profile.work);
	if(works == "null") {
		works = "";
	}
	var income = profile.income;
	if(income == "null") {
		income = "0";
	}
	var voc = vocation(profile.vocation);
	if(voc == "null") {
		voc = "";
	}
	var profile_page_information_background = "<h3>Tausta</h3>";
	profile_page_information_background += "<p><b>Lapsia:</b> " + kids + "</p><p><b>Asumismuoto:</b> " + acco + "</p><p><b>Etninen identiteetti:</b> " + ethnicidentity + "</p>";
	profile_page_information_background += "<p><b>Kielitaito:</b> " + languageskills + "</p><p><b>Koulutus:</b> " + edu + "</p><p><b>Työssäkäynti:</b> " + works + "</p>";
	profile_page_information_background += "<p><b>Vuositulot:</b> ~" + income + " euroa</p><p><b>Ammatti:</b> " + voc + "</p>";

	$("#profile-page-information-background").html(profile_page_information_background);


	var dstyle = dress_style(profile.dress_style);
	var smoke = smoking(profile.smoking);
	var alc = alcohol(profile.alcohol);
	var animals = recursive_pets(profile.pets);
	var ex = exercise(profile.exercise);
	var trav = travel(profile.travel);
	var rel = religion(profile.religion);
	var relimp = religion_importance(profile.religion_importance);
	var lrpol = left_right_politics(profile.left_right_politics);
	var lcpol = liberal_conservative_politics(profile.liberal_conservative_politics);
	var polimp = political_importance(profile.political_importance);

	var profile_page_information_lifestyle = "<h3>Elämäntyyli</h3>";
	profile_page_information_lifestyle += "<p><b>Pukeutumistyyli:</b> " + dstyle + "</p><p><b>Tupakointi:</b> " + smoke + "</p><p><b>Alkoholi:</b> " + alc + "</p>";
	profile_page_information_lifestyle += "<p><b>Lemmikit:</b> " + animals + "</p><p><b>Liikunta:</b> " + ex + "</p><p><b>Matkustelu:</b> " + trav + "</p>";
	profile_page_information_lifestyle += "<p><b>Uskonto:</b> " + rel + "</p><p><b>Uskonnon merkitys:</b> " + relimp + "</p><p><b>Vasemmisto/oikeisto:</b> " + lrpol + "</p>";
	profile_page_information_lifestyle += "<p><b>Liberaali/konservatiivinen:</b> " + lcpol + "</p><p><b>Politiikan merkitys:</b> " + polimp + "</p>";

	$("#profile-page-information-lifestyle").html(profile_page_information_lifestyle);

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


function load_edit_account_page(uid) {
	var username = get_username(uid);
	$("#username-edit-account-input").attr("placeholder", username);
	$("#uid-edit-account-input").val(uid);
	$("#edit-account-form").show();
	$("#password-mismatch-account-edit-glyphicon").remove();
	$("#edit-account-success").remove();
	load_page("edit-account-page");
}

function select_edit_profile_values(select, values) {
	values = values.split(",");
	for(var i = 0; i < values.length; i++) {
		$(select).multiselect("select", values[i], false);
	}
	$(select).multiselect("refresh");
}

function submit_profile_editions() {
	var ret = false;
	var form_data = $("#edit-profile-form").serialize();
	if(check_session() === true) {
		form_data = form_data + "&call=edit_profile";
	}
	$.ajax({
		url: "php/api.php",
		type: "POST",
		async: false,
		data: form_data 
	}).done(function(data) {
		console.log(data);
		data = $.parseJSON(data);
		if(data.success == true) {
			ret = true;
		} else {
			console.log(data.error);
		}
	});
	return ret;
}

function load_edit_profile_page(uid) {
	var profile = get_profile(uid);
	$("#user-identifier-edit-profile-input").val(uid);
	$("#profile-text-edit-profile-input").val(profile.profile_text);
	$("#birthday-edit-profile-input").val(profile.birthday);
	$("#height-edit-profile-input").val(profile.height);
	$("#weight-edit-profile-input").val(profile.weight);
	$("#income-edit-profile-input").val(profile.income);
	$("#best-things-in-the-world-edit-profile-input").val(profile.best_things_in_the_world);
	$("#ignite-me-edit-profile-input").val(profile.ignite_me);
	$("#favorite-movies-edit-profile-input").val(profile.favorite_movies);
	$("#favorite-bands-edit-profile-input").val(profile.favorite_bands);
	$("#favorite-radio-shows-edit-profile-input").val(profile.favorite_radio_shows);
	$("#favorite-television-series-edit-profile-input").val(profile.favorite_television_series);
	$("#not-exciting-edit-profile-input").val(profile.not_exciting);

	var address = profile.address.split("+");
	var country = address[address.length-1]
	var town = address[address.length-2]
	var street = "";
	if(address.length == 3) {
		street += address[0]
	} else {
		street += address[0]
		for(var i = 1; i < address.length-2; i++) {
			street += " " + address[i]; 
		}
	}
	$("#street-address-edit-profile-input").val(street);
	$("#town-address-edit-profile-input").val(town);
	$("#country-address-edit-profile-input").val(country);
	
	
	select_edit_profile_values("#gender-edit-profile-input", profile.gender);
	select_edit_profile_values("#relationship-status-edit-profile-input", profile.relationship_status);
	select_edit_profile_values("#sexual-orientation-edit-profile-input", profile.sexual_orientation);
	select_edit_profile_values("#looking-for-edit-profile-input", profile.looking_for);
	select_edit_profile_values("#body-type-edit-profile-input", profile.body_type);
	select_edit_profile_values("#eye-color-edit-profile-input", profile.eye_color);
	select_edit_profile_values("#hair-length-edit-profile-input", profile.hair_length);
	select_edit_profile_values("#hair-color-edit-profile-input", profile.hair_color);
	select_edit_profile_values("#kids-edit-profile-input", profile.kids);
	select_edit_profile_values("#accomodation-edit-profile-input", profile.accomodation);
	select_edit_profile_values("#ethnic-identity-edit-profile-input", profile.ethnic_identity);
	select_edit_profile_values("#language-skills-edit-profile-input", profile.language_skills);
	select_edit_profile_values("#education-edit-profile-input", profile.education);
	select_edit_profile_values("#work-edit-profile-input", profile.work);
	select_edit_profile_values("#vocation-edit-profile-input", profile.vocation)
	select_edit_profile_values("#kids-edit-profile-input", profile.kids);
	select_edit_profile_values("#accomodation-edit-profile-input", profile.accomodation);
	select_edit_profile_values("#ethnic-identity-edit-profile-input", profile.ethnic_identity);
	select_edit_profile_values("#language-skills-edit-profile-input", profile.language_skills);
	select_edit_profile_values("#education-edit-profile-input", profile.education);
	select_edit_profile_values("#work-edit-profile-input", profile.work);
	select_edit_profile_values("#vocation-edit-profile-input", profile.vocation);
	select_edit_profile_values("#dress-style-edit-profile-input", profile.dress_style);
	select_edit_profile_values("#smoking-edit-profile-input", profile.smoking);
	select_edit_profile_values("#alcohol-edit-profile-input", profile.alcohol);
	select_edit_profile_values("#pets-edit-profile-input", profile.pets);
	select_edit_profile_values("#exercise-edit-profile-input", profile.exercise);
	select_edit_profile_values("#travel-edit-profile-input", profile.travel);
	select_edit_profile_values("#religion-edit-profile-input", profile.religion);
	select_edit_profile_values("#religion-importance-edit-profile-input", profile.religion_importance);
	select_edit_profile_values("#left-right-politics-edit-profile-input", profile.left_right_politics);
	select_edit_profile_values("#liberal-conservative-politics-edit-profile-input", profile.liberal_conservative_politics);
	select_edit_profile_values("#political-importance-edit-profile-input", profile.political_importance);
	load_page("edit-profile-page");
	$("#edit-profile-form").submit(function(evt) {
		evt.preventDefault();
		submit_profile_editions();
	});
}

function change_username(uid, username) {
	var ret = false;
	$.ajax({
		url: "php/api.php",
		type: "POST",
		async: false,
		data: { call : 'change_username', uid : uid, username : username }
	}).done(function(data) {
		console.log(data);
		data = $.parseJSON(data);
		if(data.success == true) {
			ret = true;
		} else {
			console.log(data.error);
		}
	});
	return ret;
}

function change_password(uid, password) {
	var ret = false;
	$.ajax({
		url: "php/api.php",
		type: "POST",
		async: false,
		data: { call : 'change_password', uid : uid, password : password }
	}).done(function(data) {
		console.log(data);
		data = $.parseJSON(data);
		if(data.success == true) {
			ret = true;
		} else {
			console.log(data.error);
		}
	});
	return ret;
}

$("#edit-account-form").submit(function(evt) {
	evt.preventDefault();
	var success = false;
	var nosuccess = false;
	var uid = $("#uid-edit-account-input").val();
	console.log(uid);
	var username = $("#username-edit-account-input").val();
	console.log(username);
	if(username != "") {
		success = change_username(uid, username);
	}
	var apassword = $("#apassword-edit-account-input").val();
	console.log(apassword);
	var bpassword = $("#bpassword-edit-account-input").val();
	console.log(bpassword);
	if(apassword != "" || bpassword != "") {
		if(apassword == bpassword) {
			success = change_password(uid, apassword);
			$("#password-mismatch-account-edit-glyphicon").remove();
		} else {
			if($("#password-mismatch-account-edit-glyphicon").length == 0) {
				$("#bpassword-edit-account-input").before("<b id=\"password-mismatch-account-edit-glyphicon\" class=\"glyphicon glyphicon-remove\" style=\"color: red\"></b>");
			}
			nosuccess = true;		
		}
	}
	console.log(nosuccess);
	if(nosuccess == false) {
		console.log(success);
		if(success == true) {
			$("#edit-account-form").hide();
			$("#edit-account-form").after("<p id=\"edit-account-success\">Tilin muutos onnistui.</p>");
		} else {
			$("#edit-account-form").hide();
			$("#edit-account-form").after("<p id=\"edit-account-success\">Tilin muutos epäonnistui.</p>");
			console.log("failed to update username or password");
		}
	}
});

$("#edit-profile-form").submit(function(evt) {
	evt.preventDefault();
});

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
						$("#user-menu-messages > a").html('<span class="badge">' + unread.count + '</span> Ilmoitukset <b class="caret"></b>');
						if(count > 1) {
							$("#user-menu-messages > .dropdown-menu > #empty > a").html("<i id=\"count\" style=\"display: none;\">" + count + "</i>" + count + " ilmoitusta.");
						} else {
							$("#user-menu-messages > .dropdown-menu > #empty > a").html("<i id=\"count\" style=\"display: none;\">" + count + "</i>" + count + " ilmoitus.");
						}
					} else {
						$("#user-menu-messages > a").html('<b class="glyphicon glyphicon-envelope"></b> Ilmoitukset <b class="caret"></b>');
						$("#user-menu-messages > .dropdown-menu > #empty > a").html("<i id=\"count\" style=\"display: none;\">0</i>Ei uusia ilmoituksia");
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
		if(unread.count > 1) {
			$("#user-menu-messages > .dropdown-menu > #empty > a").html("<i id=\"count\" style=\"display: none;\">" + unread.count + "</i>" + unread.count + " ilmoitusta."); 
		} else {
			$("#user-menu-messages > .dropdown-menu > #empty > a").html("<i id=\"count\" style=\"display: none;\">" + unread.count + "</i>" + unread.count + " ilmoitus."); 
		}
		var list = "";
		var shown = new Array();
		$(".unread_message_id").each(function(i, obj) { shown.push($(obj).html()); } );
		for(var i = 0; i < unread.count; i++) {
			if(jQuery.inArray(unread.messages[i].mid, shown) == -1) {
				list += "<li class=\"notification\"><a href=\"#\">";
				list += "<i class=\"unread_message_id\" style=\"display: none;\">" + unread.messages[i].mid + "</i>";
				list += "<i class=\"unread_sender_uid\" style=\"display: none;\">" + unread.messages[i].sender_uid + "</i>";
				list += unread.messages[i].sender_name + " lähetti sinulle viestin.</a></li>";
			}
		}
		$("#user-menu-messages > a").html('<span class="badge">' + unread.count + '</span> Ilmoitukset <b class="caret"></b>');
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
		$("#user-menu-messages > a").html('<b class="glyphicon glyphicon-envelope"></b> Ilmoitukset <b class="caret"></b>');
		$("#user-menu-messages > .dropdown-menu > #empty > a").html("<i id=\"count\" style=\"display: none;\">0</i>Ei uusia ilmoituksia");
	}
}

function load_messages_page(uid, duid) {
	$("#messages-page-conversation-messages").css("max-height: 600px; overflow-x: hidden; overflow-y: scroll;");
	if(duid != 0) {
		var receiver_name = get_username(duid);
		$("#messages-page-conversation-who").html("Keskustelu käyttäjän " + receiver_name + " kanssa.");

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
	if(check_session() == false) {
		$("#search-submit").prop('disabled', true);
	}
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
					return selected.substr(0, selected.length -2) + ' <b class="caret"></b>';
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
		} else if(page === "edit-account-page") {
			if($.cookie("session") != undefined) {
				var session = window.atob($.cookie("session"));
				session = session.split("||");
				load_edit_account_page(session[1]);
			}
		} else if(page === "edit-profile-page") {
			if($.cookie("session") != undefined) {
				var session = window.atob($.cookie("session"));
				session = session.split("||");
				load_edit_profile_page(session[1]);
			}
		} else if(page === "password-recovery-page") {
			load_password_recovery_page();
		} else if(page === "new-password-page") {
			load_new_password_page();
		} else {
			load_page(page);
		}
	} else {
		load_home_page();
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
						var count = responseText.uploaded_files.length;
						for(var i = 0; i < count; i++) {
							console.log("Uploaded file: " + responseText.uploaded_files[i]);
							$("#register-select-profile-picture").append("<option value=" + responseText.uploaded_files[i] + ">" + responseText.uploaded_files[i] + "</option>");
							$(".uploaded_files").append("<input type=\"hidden\" name=\"files[]\" value=\"" + responseText.uploaded_files[i] + "\" />");
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
			if(results[i].picture == "" || results[i].picture == undefined) {
				results.splice(i, 1);
				i--;
			}
		}
	}
	if($("#select-search-result-order").find(":selected").val() == "new-logins") {
		results.sort(compare_login);
		results.reverse();
	} else if($("#select-search-result-order").find(":selected").val() == "old-logins") {
		results.sort(compare_login);
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
		
		if(results[i].looking_for != "null") {
			var looking_for = results[i].looking_for.replace(/\s+/g, '');
			looking_for = looking_for.split(",");
			for(var x = 0; x < looking_for.length; x++) {
				if(looking_for[x] === "friends") {
					looking_for[x] = "Ystävyyttä";
				} else if(looking_for[x] === "love") {
					looking_for[x] = "Rakkautta";
				} else if(looking_for[x] === "date") {
					looking_for[x] = "Tapaamisia";
				} else if(looking_for[x] === "sex") {
					looking_for[x] = "Seksiä";
				} else if(looking_for[x] === "other") {
					looking_for[x] = "Jotain muuta";
				} else if(looking_for[x] === "none") {
					looking_for[x] === "En halua kertoa";
				}
			}
			looking_for = looking_for.join(", ");
		} else {
			var looking_for = "";
		}

		var sexual_orientation = results[i].sexual_orientation;
		if(sexual_orientation === "hetero") {
			sexual_orientation = "Heteroseksuaali";
		} else if(sexual_orientation === "gay") {
			sexual_orientation = "Homoseksuaali";
		} else if(sexual_orientation === "bi") {
			sexual_orientation = "Bisexsuaali";
		} else if(sexual_orientation === "ase") {
			sexual_orientation = "Aseksuaali";
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
					result_display += "<p>" + age + ", " + sexual_orientation + ", " + gender + ", " +  town + "</p>";
					result_display += "<p>" + looking_for + "</p>";
					result_display += "<p>" + profile_text + "</p>";
					result_display += '<div>';
						var uid = window.atob($.cookie("session")).split("||");
						if(uid[1] != results[i].id) {
							result_display += '<button class="btn btn-success search-result-send-message" style="margin-right: 5px;"><i class="uid" style="display: none;">' + results[i].id + '</i>Lähetä viesti</button>';
							result_display += '<button class="btn btn-success disable search-result-add-friend" disabled="disabled"><i class="uid" style="display: none;">' + results[i].id + '</i>Pyydä ystäväksi</button>';
						}
					result_display += "</div>";
				result_display += '</div>';
			result_display += '</div>';
		result_display += '</div>';
		$("#search-results").append(result_display);
	}

	$(".search-result-send-message").click(function(evt) {
		evt.preventDefault();
		if($.cookie("session") !== undefined) {
			var session = window.atob($.cookie("session"));
			session = session.split("||");
			var ruid = $(this).children("i").text();
			load_messages_page(session[1], ruid);
		}
	});

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
		window.scrollTo(0,0);
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

$("#search-reset").click(function(evt) {
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

function load_new_password_page() {
	var secret = get_url_parameter("secret");
	$("#new-password-form").prepend("<input type=\"hidden\" name=\"secret\" value=\"" + secret + "\" />");
	secret = "&secret=" + secret;
	$("#new-password-form").show();
	$("#new-password-form-success").hide();
	$("#new-password-form-failure").hide();
	load_custom_page("new-password-page", secret);	
	$("#new-password-form").submit(function(evt) {
		evt.preventDefault();
		if($("#new-password-form [name='password']").val() != $("#new-password-form [name='password-confirm']").val()) {
			$("#new-password-form-failure").show();
			$("#new-password-form-failure").html("<p>Antamasi salasanat ovat erilaiset.</p>");
		} else {
			$.ajax({
				url: "php/api.php",
				type: "POST",
				data: $(this).serialize()
			}).done(function(data) {
				console.log(data);
				data = $.parseJSON(data);
				if(data.success == true) {
					$("#new-password-form").hide();
					$("#new-password-form-success").show();
					$("#new-password-form-failure").hide();
				} else {
					$("#new-password-form-success").hide();
					$("#new-password-form-failure").show();
					$("#new-password-form-failure").html("<p>" + data.error + "</p>");
				}
			});
		}
	});

}

function load_password_recovery_page() {
	$("#password-recovery-form").show();
	$("#password-recovery-form-success").hide();
	$("#password-recovery-form-failure").hide();
	load_page("password-recovery-page");
	$("#password-recovery-form").submit(function(evt) {
		evt.preventDefault();
		$.ajax({
			url: "php/api.php",
			type: "POST",
			data: $(this).serialize()
		}).done(function(data) {
			console.log(data);
			data = $.parseJSON(data);
			if(data.success == true) {
				$("#password-recovery-form").hide();
				$("#password-recovery-form-success").show();
				$("#password-recovery-form-failure").hide();
			} else {
				$("#password-recovery-form-success").hide();
				$("#password-recovery-form-failure").show();
				$("#password-recovery-form-failure").html("<p>" + data.error + "</p>");
			}
		});
	});
}

$("#password-recovery-page-button").click(function(evt) {
	evt.preventDefault();
	load_password_recovery_page();
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


$("#help").click(function(evt) {
	evt.preventDefault();
	hide_menu_collapse();
	load_page("help-page");
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
		$(btn).html(text.replace("Näytä", "Piilota"));
		$(which).show();
	} else {
		$(btn).children("i").removeClass("glyphicon-arrow-up");
		$(btn).children("i").addClass("glyphicon-arrow-down");
		var text = $(btn).html();
		$(btn).html(text.replace("Piilota", "Näytä"));
		$(which).hide();
	}
}

$("#toggle-edit-profile-basic-information-inputs-button").click(function(evt) {
	evt.preventDefault();
	toggle_search_inputs(this, "#edit-profile-basic-information-inputs");
});

$("#toggle-basic-information-inputs-button").click(function(evt) {
	evt.preventDefault();
	toggle_search_inputs(this, "#basic-information-inputs");
});

$("#toggle-edit-profile-outlook-inputs-button").click(function(evt) {
	evt.preventDefault();
	toggle_search_inputs(this, "#edit-profile-outlook-inputs");
});

$("#toggle-outlook-inputs-button").click(function(evt) {
	evt.preventDefault();
	toggle_search_inputs(this, "#outlook-inputs");
});

$("#toggle-edit-profile-background-inputs-button").click(function(evt) {
	evt.preventDefault();
	toggle_search_inputs(this, "#edit-profile-background-inputs");
});

$("#toggle-background-inputs-button").click(function(evt) {
	evt.preventDefault();
	toggle_search_inputs(this, "#background-inputs");
});

$("#toggle-edit-profile-lifestyle-inputs-button").click(function(evt) {
	evt.preventDefault();
	toggle_search_inputs(this, "#edit-profile-lifestyle-inputs");
});

$("#toggle-lifestyle-inputs-button").click(function(evt) {
	evt.preventDefault();
	toggle_search_inputs(this, "#lifestyle-inputs");
});

$("#toggle-edit-profile-favorites-inputs-button").click(function(evt) {
	evt.preventDefault();
	toggle_search_inputs(this, "#edit-profile-favorites-inputs");
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

$("#messages > a").click(function(evt) {
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

$("#edit-account-page-button > a").click(function(evt) {
	evt.preventDefault();
	if($.cookie("session") !== undefined) {
		var session = window.atob($.cookie("session"));
		session = session.split("||");
		load_edit_account_page(session[1]);
	}
});

$("#edit-profile-page-button > a").click(function(evt) {
	evt.preventDefault();
	if($.cookie("session") !== undefined) {
		var session = window.atob($.cookie("session"));
		session = session.split("||");
		load_edit_profile_page(session[1]);
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

$("#start-registeration-button").click(function(evt) {
	evt.preventDefault();
	load_page("register-terms-of-service-page");
	$.removeCookie("next-page");
});

$("#register-terms-of-service-continue-button").click(function(evt) {
	evt.preventDefault();
	load_page("register-account-page");
});

$("#register-terms-of-service-stop-button").click(function(evt) {
	evt.preventDefault();
	load_page("home-page");
});

var map;

$("#register-account-page").on("show", function() {
	var map_canvas = document.getElementById("google_map_canvas");
	var map_options = {
		center: new google.maps.LatLng(61.4894846, 21.7298981),
		zoom: 4,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(map_canvas, map_options);
});

$("#register-select-location-show-on-map").click(function(evt) {
	evt.preventDefault();
	var street_address = $("#register-select-street-address-input").val();
	$.ajax({
		url: "https://maps.googleapis.com/maps/api/geocode/json",
		type: "GET",
		data: { address : street_address, sensor: false }
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


var registeration_success;

$("#register-account-form").submit(function(evt) {
	evt.preventDefault();
	var street_address = $("#register-select-street-address-input").val();
	var g = false;
	$.ajax({
		url: "https://maps.googleapis.com/maps/api/geocode/json",
		type: "GET",
		async: false,
		data : { address : street_address, sensor: false }
	}).done(function(data) {
		if(data.status === "OK") {
			var myLatLong = new google.maps.LatLng(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng)
			$("#register-select-latitude-longitude-input").val(myLatLong);
			$("#register-select-street-address-checked-input").val(street_address.split(" ").join("+"));
			g = true;
		} else {
			$("#register-select-street-address-input").parent().addClass("has-error");
			$("#register-select-street-address-input").change(function(evt) {
				$("#register-select-street-address-input").parent().removeClass("has-error");
			});
			console.log("Registeration failed, because could not retrieve address location.");
		}
	});
	var username = $("#register-account-username-input").val();
	if(username.length > 0) {
		var address = $("#register-account-address-input").val();
		var addressRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
		if(address.length > 0 && addressRegex.test(address)) {
			var password = $("#register-account-password-confirm-input").val();
			if($("#register-account-password-input").val() == $("#register-account-password-confirm-input").val() && password.length > 0 ) {
				if(g == true) {
					$.ajax({
						url: "php/api.php",
						type: "POST",
						async: false,
						data: $(this).serialize()
					}).done(function(data) {
						console.log(data);
						data = $.parseJSON(data);
						registeration_success = data.success;
						if(data.success == true) {
							$("#register-select-profile-picture-form [name='owner']").val(data.uid);
						} else {
							console.log(data.error);
						}
					});
				} else {
					registeration_success = false;
				}
			} else {
				$("#register-account-password-confirm-input").parent().addClass("has-error");
				$("#register-account-password-confirm-input").change(function(evt) {
					if($("#register-account-password-input").val() == $("#register-account-password-confirm-input").val()) {
						$("#register-account-password-confirm-input").parent().removeClass("has-error");
					}
					
				});
				registeration_success = false;
			}
		} else {
			$("#register-account-address-input").parent().addClass("has-error");
			$("#register-account-address-input").change(function(evt) {
				var address = $("#register-account-address-input").val();
				var addressRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
				if(address.length >= 0 && addressRegex.test(address)) {
					$("#register-account-address-input").parent().removeClass("has-error");
				}
	
			});
			registeration_success = false;
		}
	} else {
		$("#register-account-username-input").parent().addClass("has-error");
		$("#register-account-username-input").change(function(evt) {
			var username = $("#register-account-username-input").val();
			if(username.length > 0) {
				$("#register-account-username-input").parent().removeClass("has-error");
			}	
		});
		registeration_success = false;
	}
});


$("#register-select-profile-picture-form").submit(function(evt) {
	evt.preventDefault();
	$.ajax({
		url: "php/api.php",
		type: "POST",
		data: $(this).serialize()
	}).done(function(data) {
		console.log(data);
		data = $.parseJSON(data);
		registeration_success = data.success;
		if(data.success == false) {
			console.log(data.error);
		}
	});
});

$("#register-button").click(function(evt) {
	evt.preventDefault();
	$("#register-account-form").submit();
	if(registeration_success != false) {
		$("#register-select-profile-picture-form").submit();
		if(registeration_success == true) {
			load_page("registeration-done-page");
		} else {
			$("#register-button").addClass("disabled");
			$("#register-button").prop("disabled", true);
			$("#register-button").append("<p>Rekisteröinnissä tapahtui virhe. Lähetä sähköpostia support@kattellaan.com niin korjaamme tilanteen.</p>");
		}
	}
});
