<?php

header("Access-Control-Allow-Origin: *");
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

require_once("dbwrapper/db.php");
require_once("account.php");

$database = new db("sqlite3");
if($database->open("kattellaan.db", SQLITE3_OPEN_READWRITE) == true) {

	/// register new account event.
	if(!empty($_GET['register'])) {
		if(empty($_GET['username'])) {
			printf('{ "success": false, "error": "username is empty." }');
		} else if(empty($_GET['address'])) {
			printf('{ "success": false, "error": "address is empty." }');
		} else if(empty($_GET['password'])) {
			printf('{ "success": false, "error": "password is empty." }');
		} else if(empty($_GET['password-confirm'])) {
			printf('{ "success": false, "error": "password-confirm is empty" }');
		} else if($_GET['password'] != $_GET['password-confirm']) {
			printf('{ "success": false, "error": "password-mismatch" }');
		} else {
			/// insert account to the database
			$account = new account($database);
			$account->set_username($_GET['username']);
			$account->set_address($_GET['address']);
			$account->set_password(hash("sha512", $_GET['password']));
			$account->insert();
			
			/// send email to the registered user
			$to = $_GET['address'];
			$subject = "Tervetuloa kattellaan.com sivustolle!";
			$message = "Hei " . $_GET['username'] . "!\r\n\r\n" .
				"Olemme kiitollisia, että olet liittynyt seuraamme.\r\n" .
				"Toivottavasti löydät itsellesi seuraa joukostamme.\r\n\r\n" .
				"http://kattellaan.com\r\n\r\n" .
				"Tähän viestiin saa vastata jos on jotain kysyttävää.\r\n";
			$headers = "From: toni@mussukka.org\r\n" .
				"Reply-To: toni@mussukka.org\r\n" .
				"X-Mailer: PHP/" . phpversion();
			mail($to, $subject, $message, $headers);
	
			/// return information to the browser
			printf('{ "success": true, "account": { "identifier": "%s", "username": "%s", "address": "%s", "password": %s"}}', 
				$account->get_identifier(), $account->get_username(), $account->get_address(), $account->get_password());
		}
	}
}

?>
