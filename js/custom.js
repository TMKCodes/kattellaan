

$(function() {
	var multiselects = '#relationship';
	multiselects += ', #lookingfor';
	multiselects += ', #bodytypem';
	multiselects += ', #eyecolor';
	multiselects += ', #hairlength';
	multiselects += ', #haircolor';
	multiselects += ', #dressingstyle';
	multiselects += ', #pets';
	multiselects += ', #smoking';
	multiselects += ', #alcohol';
	multiselects += ', #training';
	multiselects += ', #travel';
	multiselects += ', #religion';
	multiselects += ', #religion-importance';
	multiselects += ', #livingmode';
	multiselects += ', #ethnic';
	multiselects += ', #language';
	multiselects += ', #school';
	multiselects += ', #work';
	multiselects += ', #profession';
	multiselects += ', #kids';
	multiselects += ', #looking';
	multiselects += ', #left-or-right';
	multiselects += ', #liberal-or-conservative';
	multiselects += ', #politic-importance';
	multiselects += ', #my-kids';
	multiselects += ', #my-language';
	multiselects += ', #my-pets';

	$(multiselects).multiselect({
		noneSelectedText: "Valitse",
		selectedText: "# valittu #:stä",
		checkAllText: "Valitse Kaikki",
		uncheckAllText: "Poista Valinnat"
	});

	$(".tip").tooltip({
		'placement': 'bottom',
		'trigger': 'hover',
		'delay': 0
	});

	var fileUploader = $('.start-new-topic-with-files, .reply-to-topic-with-files').fineUploader({
		request: {
			endpoint: 'fileupload.php'
		},
		autoUpload: false,
		text: {
			uploadButton: '<i class="icon-plus icon-white"></i> Tiedostoja'
		}
	});

	$('.start-new-topic, .reply-to-topic-send').click(function() {
		fileUploader.fineUploader('uploadStoredFiles');
	});
});

function hide_all() {
	$("#search-window").hide();
	$("#search").parent().removeClass("active");
	$("#games-window").hide();
	$("#games").parent().removeClass("active");
	$("#forum-window").hide();
	$("#forum").parent().removeClass("active");
	$("#groups-window").hide();
	$("#groups").parent().removeClass("active");
	$("#info-window").hide();
	$("#info").parent().removeClass("active");
	$("#welcome-window").hide();
	$("#own-profile-window").hide();
}



$("#search").click(function(event) {
	event.preventDefault();
	hide_all();
	$("#search-window").show();
	$("#search").parent().addClass("active");
});

$("#own-profile").click(function(event) {
	event.preventDefault();
	hide_all();
	$("#profile-header-edit").hide();
	$("#profile-modify-window").hide();
	$("#profile-header").show();
	$("#own-profile-window").show();
});

$("#modify-profile").click(function(event) {
	event.preventDefault();
	hide_all();
	$("#profile-header").hide();
	$("#profile-header-edit").show();
	$("#profile-modify-window").show();
	$("#basic-window").show();
	$("#own-profile-window").show();
});

$("#games").click(function(event) {
	event.preventDefault();
	hide_all();
	$("#games-window").show();
	$("#games").parent().addClass("active");

});

function hide_all_modify_profile() {
	$("#basic-window").hide();
	$("#basic-button").parent().removeClass("active");
	$("#outlook-window").hide();
	$("#outlook-button").parent().removeClass("active");
	$("#background-window").hide();
	$("#background-button").parent().removeClass("active");
	$("#lifestyle-window").hide();
	$("#lifestyle-button").parent().removeClass("active");
	$("#favorite-things-window").hide();
	$("#favorite-things-button").parent().removeclass("active");
}

$("#basic-button").click(function(event) {
	event.preventDefault();
	hide_all_modify_profile();
	$("#basic-window").show();
	$("#basic-button").parent().addClass("active");
});


$("#outlook-button").click(function(event) {
	event.preventDefault();
	hide_all_modify_profile();
	$("#outlook-window").show();
	$("#outlook-button").parent().addClass("active");
});

$("#background-button").click(function(event) {
	event.preventDefault();
	hide_all_modify_profile();
	$("#background-window").show();
	$("#background-button").parent().addClass("active");
});

$("#lifestyle-button").click(function(event) {
	event.preventDefault();
	hide_all_modify_profile();
	$("#lifestyle-window").show();
	$("#lifestyle-button").parent().addClass("active");
});

$("#favorite-things-button").click(function(event) {
	event.preventDefault();
	hide_all_modify_profile();
	$("#favorite-things-window").show();
	$("#favorite-things-button").parent().addClass("active");
});

$('#hc1').click(function() {
	$('#hc2, #hc3, #hc4, #hc5')
		.not("btn btn-primary")
		.removeClass("btn btn-primary disabled")
		.addClass("btn btn-primary");
	$('#hc1')
		.removeClass("btn btn-primary")
		.addClass("btn btn-primary disabled");
});
$('#hc2').click(function() {
	$('#hc1, #hc3, #hc4, #hc5')
		.not("btn btn-primary")
		.removeClass("btn btn-primary disabled")
		.addClass("btn btn-primary");
	$('#hc2')
		.removeClass("btn btn-primary")
		.addClass("btn btn-primary disabled");
});
$('#hc3').click(function() {
	$('#hc1, #hc2, #hc4, #hc5')
		.not("btn btn-primary")
		.removeClass("btn btn-primary disabled")
		.addClass("btn btn-primary");
	$('#hc3')
		.removeClass("btn btn-primary")
		.addClass("btn btn-primary disabled");
});
$('#hc4').click(function() {
	$('#hc1, #hc2, #hc3, #hc5')
		.not("btn btn-primary")
		.removeClass("btn btn-primary disabled")
		.addClass("btn btn-primary");
	$('#hc4')
		.removeClass("btn btn-primary")
		.addClass("btn btn-primary disabled");
});
$('#hc5').click(function() {
	$('#hc1, #hc2, #hc3, #hc4')
		.not("btn btn-primary")
		.removeClass("btn btn-primary disabled")
		.addClass("btn btn-primary");
	$('#hc5')
		.removeClass("btn btn-primary")
		.addClass("btn btn-primary disabled");
});
