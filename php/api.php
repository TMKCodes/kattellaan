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
require_once("distance.php");
require_once("messages.php");

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
		if(!empty($_COOKIE['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_COOKIE['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session" }');
				die();
			} 
			$account_identifier = $session->get_identifier($_COOKIE['session']);
			$uploaded_files = array();
			$failed_files = array();
			$upload_directory = "/home/temek/kattellaan/uploads/";
			if(!empty($_FILES)) {
				$ufile = new file($database, $upload_directory, "uploads/");
				for($i = 0; $i < count($_FILES['file']['name']); $i++) {
					$ufile->set_name(strtolower($_FILES['file']['name'][$i]));
					$ufile->set_owner($account_identifier);
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
					$latlng = $profile->strip_latlng($_POST['latlng']);
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
	} else if(!empty($_POST['call']) && $_POST['call'] == "get_work") {
		if(!empty($_POST['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_POST['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session." }');
				die;
			}
			if(!empty($_POST['work_type']) && $_POST['work_type'] == "distance") {
				try {
					$distance = new distance($database);
					$distance_work = $distance->get_uncalculated();
					if($distance_work != false) {
						printf('{ "success": true, "work_type": "distance", "work": %s }', json_encode($distance_work));
					} else {
						printf('{ "success": false, "error": "No work!" }');
					}
				} catch (Exception $e) {
					printf('{ "success": false, "error": "%s" }', $e->getMessage());
				}
			}
		} else {
			printf('{ "success": false, "error": "Not authenticated." }');
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "set_work") {
		if(!empty($_POST['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_POST['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session." }');
				die;
			}
			if(!empty($_POST['work_type']) && $_POST['work_type'] == "distance") {
				try {
					$distance = new distance($database);
					$distance->set_start($_POST['start']);
					$distance->set_end($_POST['end']);
					$distance->set_distance($_POST['distance']);
					if($distance->insert() == true) {
						printf('{ "success": true }');
					} else {
						printf('{ "success": false, "error": "Could not insert new distance." }');
					}
				} catch (Exception $e) {
					printf('{ "success": false, "error": "%s" }', $e->getMessage());
				}
			}
		} else {
			printf('{ "success": false, "error": "Not authenticated." }');
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "get_distance") {
		if(!empty($_COOKIE['session'])) {
 			$session = new session($database, "sha512");
			if($session->confirm($_COOKIE['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session." }');
				die;
			}
			if(!empty($_POST['my_uid']) && !empty($_POST['his_uid'])) {
				try {
					$my_profile = new profile($database);
					$his_profile = new profile($database);
					$my_profile->select($_POST['my_uid']);
					$his_profile->select($_POST['his_uid']);
					$my_latlng = $my_profile->strip_latlng($my_profile->get_latlng());
					$his_latlng = $his_profile->strip_latlng($his_profile->get_latlng());
					$my_position = new position($database);
					$his_position = new position($database);
					$my_position->set_latitude($my_latlng[0]);
					$my_position->set_longitude($my_latlng[1]);
					$his_position->set_latitude($his_latlng[0]);
					$his_position->set_longitude($his_latlng[1]);
					$my_position->select();
					$his_position->select();
					$distance = new distance($database);
					$distance->set_start($my_position->get_identifier());
					$distance->set_end($his_position->get_identifier());
					if($distance->select() == true) {
						printf('{ "success": true, "distance": "%s" }', $distance->get_distance());
					} else {
						printf('{ "success": true, "distance": "Unknown" }');
					}
					
				} catch (Exception $e) {
					printf('{ "success": false, "error": "%s" }', $e->getMessage());
				}
			} else {
				printf('{ "success": false, "error": "User identifiers were not give." }');
			}
		} else {
			printf('{ "success": false, "error": "Not authenticated." }');
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "send_message") {
		if(!empty($_COOKIE['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_COOKIE['session']) == false) {
				printf('{"success": false, "error": "%s" }', $e->getMessage());
				die();	
			}
			$message = new message($database);
			$message->set_receiver($_POST['receiver']);
			$message->set_sender($_POST['sender']);
			$message->set_type($_POST['type']);
			$message->set_message($_POST['msg']);
			$message->set_seen(0);
			try {
				if($message->insert() == true) {
					printf('{ "success": true, "message": "%s" }', $_POST['msg']);
				} else {
					printf('{ "success": false, "error": "Failed to insert message to database."}');
				}
			} catch (Exception $e) {
				printf('{"success": false, "error": "%s"}', $e->getMessage());
			}
		} else {
			printf('{ "success": false, "error": "Not authenticated."}');
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "get_discussion") {
		if(!empty($_COOKIE['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_COOKIE['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session." }');
				die;
			}
			$messages = new messages($database);
			try {
				$discussion = $messages->get_discussion($_POST['suid'], $_POST['ruid'], $_POST['limit']);
			} catch (Exception $e) {
				printf('{ "success": false, "error": "Error in get_discussion event $messages->get_discussion(): %s" }', $e->getMessage());
				die;	
			}
			$sacc = new account($database);
			$racc = new account($database);
			$sacc->set_identifier($_POST['suid']);
			$racc->set_identifier($_POST['ruid']);
			try {
				$sacc->select();
				$racc->select();
			} catch (Exception $e) {
				printf('{ "success": false, "error": "%s" }', $e->getMessage());
				die;
			}
			$results = array();
			foreach($discussion as $message) {
				$result['mid'] = $message->get_identifier();
				if($message->get_sender() == $sacc->get_identifier()) {
					$result['sender_name'] = $sacc->get_username();
					$result['sender_uid'] = $sacc->get_identifier(); 
				} else if($message->get_sender() == $racc->get_identifier()) {
					$result['sender_name'] = $racc->get_username();
					$result['sender_uid'] = $racc->get_identifier();
				}
				if($message->get_receiver() == $sacc->get_identifier()) {
					$result['receiver_name'] = $sacc->get_username();
					$result['receiver_uid'] = $sacc->get_identifier();
				} else if($message->get_receiver() == $racc->get_identifier()) {
					$result['receiver_name'] = $racc->get_username();
					$result['receiver_uid'] = $racc->get_identifier();
				}
				$result['timestamp'] = $message->get_timestamp();
				$result['seen'] = $message->get_seen();
				$result['type'] = $message->get_type();
				$result['message'] = $message->get_message();
				array_push($results, $result);
			}
			$jsonthis = array("success" => true, "discussion" => $results);
			$json = json_encode($jsonthis);
			printf("%s", $json);
		} else {
			printf('{ "success": false, "error": "Session does not exist." }');
			die;
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "get_discussions") {
		if(!empty($_COOKIE['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_COOKIE['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session." }');
				die;
			}
			if(!empty($_POST['uid']) && $_POST['uid'] != 0) {
				$messages = new messages($database);
				try {
					$discussions = $messages->get_discussions($_POST['uid']);
				} catch (Exception $e) {
					printf('{ "success": false, "error": "%s" }', $e->getMessage());
					die();
				}
				$results = array();
				foreach($discussions as $discussion) {
					$sacc = new account($database);
					$racc = new account($database);
					if($discussion->get_sender() == $_POST['uid']) {
						$sacc->set_identifier($discussion->sender);
						$racc->set_identifier($discussion->receiver);		
					} else if($discussion->get_receiver() == $_POST['uid']) {
						$sacc->set_identifier($discussion->receiver);
						$racc->set_identifier($discussion->sender);
					}
					$result['sender_name'] = $sacc->get_username();
					$result['receiver_name'] = $racc->get_username();
					$result['sender_uid'] = $sacc->get_identifier();
					$result['receiver_uid'] = $racc->get_identifier();
					array_push($results, $result);
					unset($sacc);
					unset($racc);
				}
				$results = array_unique($results);
				$jsonthis = array("success" => true, "discussions" => $results);
				printf("%s", json_encode($jsonthis));
			} else {
				printf('{ "success": false, "error": "User identifier was not given."}');
			}
		} else {
			printf('{ "success": false, "error": "Session does not exist." }');
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "search_users") {
		if(!empty($_COOKIE['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_COOKIE['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session." }');
				die;
			}
			$search_results = array();
			if(!empty($_POST['min_age']) && !empty($_POST['max_age'])) {
				$profiles = select_by_age($_POST['min_age'], $_POST['max_age']);
				if($profiles != false) {
					foreach($profiles as $profile) {
						array_push($search_results, $profile->get());
					}
				} else {
					printf('{ "success": error, "error": "No results found." }');
				}
			} else if(!empty($_POST['max_distance'])) {
				try {
					$search_results_i = count($search_results);
					$my_profile = new profile($database);
					$my_profile->select($_POST['my_uid']);
					$my_latlng = $my_profile->strip_latlng($my_profile->get_latlng());
					$my_position = new position($database);
					$my_position->set_latitude($my_latlng[0]);
					$my_position->set_longitude($my_latlng[1]);
					$my_position->select();
					for($i = 0; $i <= $search_results_i; $i++) {
						$his_latlng = $my_profile->strip_latlng($search_results[$i]['latlng']);
						$his_position = new position($database);
						$his_position->set_latitude($his_latlng[0]);
						$his_position->set_longitude($his_latlng[1]);
						$his_position->select();
						$position = new position($database);
						$position->set_start($my_position->get_identifier());
						$position->set_end($his_position->get_identifier());
						$position->select();
						if($position->get_distance() > $_POST['max_distance']) {
							unset($search_results[$i]);
						}		
					}
					$search_results = array_values($search_results);
				} catch (Exception $e) {
					printf('{ "success": false, "error": "%s" }', $e->getMessage());
				}
			} else if(!empty($_POST['gender'])) {
				$search_results_i = count($search_results);
				for($i = 0; $i < $search_results_i; $i++) {
					if($search_results[$i]['gender'] != $_POST['gender']) {
						unset($search_results[$i]);
					}
				}
				$search_results = array_values($search_results);
			} else if(!empty($_POST['looking_for'])) {
				$post_looking_for = explode(",", $_POST['looking_for']);
				$search_results_i = count($search_results);	
				for($i = 0; $i < $search_results_i; $i++) {
					$looking_for = explode(",", $search_results[$i]['looking_for']);
					$match_found = false;
					foreach($post_looking_for as $p_value) {
						foreach($looking_for as $d_value) {
							if($p_value == $d_value) {
								$match_found = true;
							}
						}
					}
					if($match_found == false) {
						unset($search_results[$i]);
					}
				}
				$search_results = array_values($search_results);
			}
		} else {
			printf('{ "success": false, "error": "Not authenticated."}');
		}
	} else {
		printf('{ "success": false, "error": "api call does not exist."}');
	}
}

?>
