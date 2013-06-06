

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
	$("#own-profile-window").hide();
	$("#games-window").hide();
	$("#forum-window").hide();
	$("#groups-window").hide();
	$("#info-window").hide();
	$("#welcome-window").hide();
}

$("#search").click(function(event) {
	event.preventDefault();
	hide_all();
	$("#search-window").show();
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
	$("#own-profile-window").show();
});

$("#games").click(function(event) {
	event.preventDefault();
	hide_all();
	$("#games-window").show();

}) 

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
