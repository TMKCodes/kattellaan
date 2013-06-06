<?php 

header('Content-type: text/html; charset=utf-8'); 

require_once("./php/template.php");

$template = new template("./html/base.html");
$template->replace("[NAVBAR]", "./html/navbar.html");
$pages = array("./html/welcome.html", "./html/login.html");
$template->send("[CONTENT]", $pages);

?>







