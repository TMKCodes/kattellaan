<?php 

header('Content-type: text/html; charset=utf-8'); 

require_once("./php/template.php");

$template = new template("./html/base.html");

$template->replace("[NAVBAR]", "./html/navbar.html");
$pages = array("./html/welcome.html", "./html/login.html", "./html/build-log.html", "./html/new-profiles.html", "./html/picture-ad.html", "./html/profile.html", "./html/search.html", "./html/forum.html", "./html/games.html");
$template->replace("[CONTENT]", $pages);

$template->send();
?>







