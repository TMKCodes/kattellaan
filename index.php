<?php 

header('Content-type: text/html; charset=utf-8'); 

require_once("./php/template.php");

$template = new template("./html/base.html");
$template->replace("[CONTENT]", "./html/navbar.html");
$template->send();

?>







