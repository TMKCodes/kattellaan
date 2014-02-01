<?php

header("Access-Control-Allow-Origin: *");
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

require_once("dbwrapper/db.php");
require_once("account.php");
require_once("session.php");
require_once("invite.php");

$passwd = explode(":", base64_decode(file_get_contents("/home/temek/kattellaan/.passwd")));
$database = new db("mysqli");
if($database->connect("127.0.0.1", $passwd[0], $passwd[1], "kattellaan") == true) {

	// Exit if no data was given to the api
	if(empty($_GET) && empty($_POST)) {
		exit;
	}

	/// register new account event.
	if(!empty($_GET['call']) && $_GET['call'] == "register") {
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
			if($account->insert() == true) {
				/// send email to the registered user
				$to = $_GET['address'];
				$subject = "Tervetuloa kattellaan.com sivustolle!";
				$message = "Hei " . $_GET['username'] . "!\r\n\r\n" .
					"Olemme kiitollisia, että olet liittynyt seuraamme.\r\n" .
					"Toivottavasti löydät itsellesi seuraa joukostamme.\r\n\r\n" .
					"http://kattellaan.com\r\n\r\n" .
					"Tähän viestiin saa vastata jos on jotain kysyttävää.\r\n\r\n" .
					"Terveisin kattellaan treffipalstalta.\r\n";
				$headers = "From: support@kattellaan.com\r\n" .
					"Content-Type: text/html; charset=UTF-8\r\n" .
					"Reply-To: support@kattellaan.com\r\n" .
					"X-Mailer: PHP/" . phpversion();
				mail($to, $subject, $message, $headers);
	
				/// return information to the browser
				printf('{ "success": true, "account": { "identifier": "%s", "username": "%s", "address": "%s", "password": "%s"}}', 
					$account->get_identifier(), $account->get_username(), $account->get_address(), $account->get_password());
			} else {
				printf('{ "success": false, "error": "account already exists"}');
			}
		}
	} else if(!empty($_GET['call']) && $_GET['call'] == "open_session") {
		try {
			$session = new session($database, "sha512");
			$session_key = $session->open($_GET['username'], $_GET['password']);
			printf('{ "success": true, "session": "%s" }', $session_key);	
		} catch (Exception $e) {
			printf('{ "success": false, "error": "%s" }', $e->getMessage());
		}
	} else if(!empty($_GET['call']) && $_GET['call'] == "invite") {
		try {
			$session = new session($database, "sha512");
			if(!empty($_GET['session'])) {
				if($session->confirm($_GET['session']) == true) {
					$identifier = $session->get_identifier($_GET['session']);
					$count = 0;
					$invite = new invite($database);
					printf('{ "success": true, "invite": {');
					while(!empty($_GET['friend-address-' . $count])) {
						try {
							$invite->insert($_GET['friend-address-' . $count], $identifier);
							printf('"friend-address-%s": true', $count);
						} catch (Exception $e) {
							printf('"friend-address-%s": { "address": "%s", "error": "%s" }',  $count, $_GET['friend-address-' . $count],  $e->getMessage());
						}
						$count++;
						if(!empty($_GET['friend-address-' . $count])) {
							printf(", ");
						}
					}
					printf('}}');
				} else {
					printf('{ "success": false, "error": "failed to confirm session" }');
				}
			} else {
				printf('{ "success": false, "error": "session data was empty." }');
			}
		} catch (Exception $e) {
			printf('{ "success": false, "error": "%s" }', $e->getMessage());
		}
	} else if(!empty($_GET['call']) && $_GET['call'] == "delete_invite") {
		if(!empty($address)) {
			$invite = new invite($database);
			if($invite->remove($address) == true) {
				setcookie("last-visited-page", "#delete-invite-success-page");
				header("Location: kattellaan.com", true, "303");
				die();
			} else {
				setcookie("last-visited-page", "#delete-invite-failed-page");
				header("Location: kattellaan.com", true, "303");
				die();
			}	
		} else {
			setcookie("last-visited-page", "#delete-invite-failed-empty-address-page");
			header("Location: kattellaan.com", true, "303");
			die();
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "upload") {
		if(!empty($_POST['upload-incoming']) && $_POST['upload-incoming'] == 1) {
			$error = false;
			$upload_directory = "../uploads/";
			foreach($_FILES as $file) {
				if(move_uploaded_file($file['tmp_name'], $upload_directory . basename($file['name']))) {
					$files[] = $upload_directory . $file['name'];
				} else {
					$error = true;
				}
				$data  = ($error) ? array('error' => 'There was an error uploading your files.') : array('files' => $files);
			}
		}  else {
			$data = array('success' => "form was submitted", "formData" => $_POST);
		}
		printf("%s", json_encode($data));
	}
}

?>
