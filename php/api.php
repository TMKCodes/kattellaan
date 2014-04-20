<?php

header("Access-Control-Allow-Origin: *");
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

require_once("dbwrapper/db.php");
require_once("account.php");
require_once("session.php");
require_once("invite.php");
require_once("file.php");
require_once("profile.php");
require_once("position.php");

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
	} else if(!empty($_POST['call']) && $_POST['call'] == "close_session") {
		try {
			$session = new session($database, "sha512");
			$success = $session->close($_POST['session']);
			printf('{ "success": true }');
		} catch (Exception $e) {
			printf('{ "success": false, "error": "%s" }', $e->getMessage());
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "update_session") {
		try {
			$session = new session($database, "sha512");
			if(!empty($_POST['session'])) {
				$session_key = $session->update($_POST['session']);
				if($session_key != false) {
					printf('{ "success": true, "session": "%s" }', $session_key);
				} else {
					printf('{ "success": false, "error": "Failed to update session: %s" }', $session_key);
				}
			} else {
				printf('{ "success": false, "error": "Session data was empty" }');
			}
		} catch (Exception $e) {
			printf('{ "success": false, "error": "%s" }', $e->getMessage());
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "get_username") {
	 	try {
			$account = new account($database);
			$account->set_identifier($_POST['uid']);
			$account->select();
			printf('{ "success": true, "username": "%s" }', $account->get_username());
		} catch (Exception $e) {
			printf('{ "success": false, "error": "%s" }', $e->getMessage());
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "get_profile") {
		$profile = new profile($database);
		if($profile->select($_POST['uid']) == true) {
			printf('{ "success": true, "profile": %s }', json_encode($profile->get()));
		} else {
			printf('{ "success": false, "error": "Profile %s could not be found." }', $_POST['uid']);
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
		if(!empty($_POST['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_POST['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session" }');
				die();
			} 
			$account_identifier = $session->get_identifier($_POST['session']);
			$uploaded_files = array();
			$failed_files = array();
			$upload_directory = "/home/temek/kattellaan/uploads/";
			if(!empty($_FILES)) {
				$ufile = new file($database, $upload_directory, "uploads/");
				for($i = 0; $i < count($_FILES['file']['name']); $i++) {
					$ufile->set_name(strtolower($_FILES['file']['name'][$i]));
					$ufile->set_owner($account_identifier);
					$dont_save = false;
					if($_POST['type'] == "picture") {
						$finfo = new finfo(FILEINFO_MIME_TYPE);
						if(false === $ext = array_search($finfo->file($_FILES['file']['tmp_name'][$i]), array('jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'gif' => 'image/gif'), true)) {
							$dont_save = true;
						}
					}
					if($dont_save == false) {
						try { if($ufile->insert() == true) {
								if(move_uploaded_file($_FILES['file']['tmp_name'][$i], $upload_directory . $ufile->get_name())) {	
									array_push($uploaded_files, $ufile->get_name());
								} else {
									$file->delete();
									array_push($failed_files, $_FILES['file']['name'][$i]);
								}
							} else {
								printf('{ "success": false, "error": "Failed to store filename in database" }');
								die();
							}
						} catch (Exception $e) {
							printf('{ "success": false, "error": "%s" }', $e->getMessage());
							die();
						}
					} else {
						array_push($failed_files, $_FILES['file']['name'][$i]);
					}
				}
				if(empty($failed_files)) {
					printf('{ "success": true, "uploaded_files": %s }', json_encode($uploaded_files));
				} else {
					printf('{ "success": false, "uploaded_files": %s, "failed_files": %s }', json_encode($uploaded_files), json_encode($failed_files));
				}
			} else {
				printf('{ "success": false, "error": "No files uploaded." }');
			}
		} else {
			printf('{ "success": false, "error": "Not authenticated." }');
		}	
	} else if(!empty($_POST['call']) && $_POST['call'] == "create_profile") {
		if(!empty($_POST['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_POST['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session." }');
				die();
			}
			$identifier = $session->get_identifier($_POST['session']);
			$data = $_POST;
			$data['identifier'] = $identifier;
			$profile = new profile($database);
			$profile->set($data);
			if($profile->select($identifier) == false) {	
				if($profile->insert() == true) {
					$position = new position($database);
					$latlng = $_POST['latlng'];
					$latlng = str_replace("(", "", $latlng);
					$latlng = str_replace(")", "", $latlng);
					$latlng = explode(", ", $latlng);
					$position->set_latitude($latlng[0]);
					$position->set_longitude($latlng[1]);
					$position->insert();
					printf('{ "success": true }');
				} else {
					printf('{ "success": false, "error": "Failed to insert into database." }');
				}
			} else {
				printf('{ "success": false, "error": "Profile with the user id already exists." }');
			}
		} else {
			printf('{ "success": false, "error": "Not auhtenticated." }');
		}
	}
}

?>
