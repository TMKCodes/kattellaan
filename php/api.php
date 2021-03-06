<?php

header("Access-Control-Allow-Origin: *");
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
ignore_user_abort(false);
ini_set('max_execution_time', 120);

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

	if(!empty($_POST['call']) && $_POST['call'] == "register-account") {
		if(empty($_POST['username'])) {
			printf('{ "success": false, "error": "username is empty." }');
		} else if(empty($_POST['address'])) {
			printf('{ "success": false, "error": "address is empty." }');
		} else if(empty($_POST['password'])) {
			printf('{ "success": false, "error": "password is empty." }');
		} else if(empty($_POST['password-confirm'])) {
			printf('{ "success": false, "error": "password-confirm is empty" }');
		} else if($_POST['password'] != $_POST['password-confirm']) {
			printf('{ "success": false, "error": "password-mismatch" }');
		} else if(empty($_POST['street-address-checked'])) {
			printf('{ "success": false, "error": "address can not be empty" }');
		} else if(empty($_POST['latitude-longitude'])) {
			printf('{ "success": false, "error": "latitude longitude can not be empty." }');
		} else {
			try {
				$account = new account($database);
				$account->set_username($_POST['username']);
				$account->set_address($_POST['address']);
				$account->set_password(hash("sha512", $_POST['password']));
				if($account->insert() == true) {
					$profile = new profile($database);
					$pdata = $profile->get();
					if(!empty($_POST['birthday'])) {
						$pdata['birthday'] = $_POST['birthday'];
					}
					if(!empty($_POST['gender'])) {
						$pdata['gender'] = $_POST['gender'];
					}
					if(!empty($_POST['profile-text'])) {
						$pdata['profile_text'] = $_POST['profile-text'];
					}
					$pdata['latlng'] = $_POST['latitude-longitude'];
					$pdata['address'] = $_POST['street-address-checked'];
					$pdata['identifier'] = $account->get_identifier();	
					$profile->set($pdata);
					if($profile->select($pdata['identifier']) == false) {	
						if($profile->insert() == true) {
							$position = new position($database);
							$latlng = $profile->strip_latlng($pdata['latlng']);
							$position->set_latitude($latlng[0]);
							$position->set_longitude($latlng[1]);
							$position->insert();
							/// send email to the registered user
							$to = $_POST['address'];
							$subject = "Tervetuloa kattellaan.com sivustolle!";
							$message = "Hei " . $_POST['username'] . "!\r\n\r\n" .
								"Olemme kiitollisia, että olet liittynyt seuraamme.\r\n" .
								"Toivottavasti löydät itsellesi seuraa joukostamme.\r\n\r\n" .
								"http://kattellaan.com\r\n\r\n" .
								"Tähän viestiin saa vastata jos on jotain kysyttävää.\r\n\r\n" .
								"Terveisin kattellaan treffipalstalta.\r\n";
							$headers = "From: support@kattellaan.com\r\n" .
								"Content-Type: text/plain; charset=UTF-8\r\n" .
								"Reply-To: support@kattellaan.com\r\n" .
								"X-Mailer: PHP/" . phpversion();
							mail($to, $subject, $message, $headers);
				
							/// return information to the browser
							printf('{ "success": true, "uid": "%s" }', $account->get_identifier());
						} else {
							printf('{ "success": false, "error": "profile creation failed." }');
						}
					} else {
						printf('{ "success": false, "error": "profile already exists." }');
					}
				} else {
					printf('{ "success": false, "error": "account already exists" }');
				}
			} catch (Exception $e) {
				printf('{ "success": false, "error": "%s" }', $e->getMessage());	
			}
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "register-select-profile-picture") {
		if(!empty($_POST['owner'])) {	
			if(!empty($_POST['picture'])) {
				$profile = new profile($database);
				if($profile->select($_POST['owner']) == true) {
					$profile->set_picture($_POST['picture']);
					if($profile->update() == true) { 
						if(!empty($_POST['files'])) {
							$file_count = count($_POST['files']);
							$success = false;
							for($i = 0; $i < $file_count; $i++) {
								$file = new file($database, "", "");
								$file->set_name($_POST['files'][$i]);
								$file->set_owner($_POST['owner']);
								try { 
									$success = $file->insert();
									if($success == false) break;
								} catch (Exception $e) {
									printf('{ "success": false, "error": "%s" }', $e->getMessage());
									die();
								}
							}
							if($success == true) {
								printf('{ "success": true }');
							} else {
								printf('{ "success": false, "error": "could not save some files" }');
							}
						} else {
							printf('{ "success": true }');
						}
					} else {
						printf('{ "success": false, "error": "failed to update profile" }');
					}
				} else {
					printf('{ "success": false, "error": "failed to select profile" }');
				}
			} else {
				if(!empty($_POST['files'])) {
					$file_count = count($_POST['files']);
					$success = false;
					for($i = 0; $i < $file_count; $i++) {
						$file = new file($database);
						$file->set_name($_POST['files'][$i]);
						$file->set_owner($_POST['owner']);
						try { 
							$success = $file->insert();
							if($success == false) break;
						} catch (Exception $e) {
							printf('{ "success": false, "error": "%s" }', $e->getMessage());
							die();
						}
					}
					if($success == true) {
						printf('{ "success": false, "error": "%s" }');
					} else {
						printf('{ "success": false, "error": "could not save some files" }');
					}
				} else {
					printf('{ "success": true }');
				}
			}
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "password-recovery") {
		$account = new account($database);
		$account->set_username($_POST['username']);
		if($account->select() == true) {
			if($account->get_address() == $_POST['address']) {
				$pwa = "https://kattellaan.com?page=new-password-page&secret=";
				$pwa .= base64_encode($account->get_identifier() . "||" . hash("sha512", $account->get_username() . "/" . $account->get_address() . "/" . $account->get_password() . "/" . $account->get_registered()));
				$to = $account->get_address();
				$subject = "kattellaan.com salasana palautus.";
				$message = "Hei " . $account->get_username() ."!\r\n\r\n" .
					"Sinun tunnuksellesi on pyydetty uutta salasanaa. Jos et ole tätä pyytänyt voit unohtaa viestin.\r\n" .
					"Kuitenkin jos haluat uuden salasanan mene osoitteeseen:\r\n" . $pwa . "\r\n" .
					"Terveisiä kattellaan treffipalvelusta.";
				$message = "Hei " . $account->get_username() ."!\r\n\r\n" .
					"Sinun tunnuksellesi on pyydetty uutta salasanaa. Jos et ole tätä pyytänyt voit unohtaa viestin.\r\n" .
					"Kuitenkin jos haluat uuden salasanan mene osoitteeseen:\r\n" . $pwa . "\r\n" .
					"Terveisiä kattellaan treffipalvelusta.";
				$headers = "From: support@kattellaan.com\r\n" .
					"Content-Type: text/plain; charset=UTF-8\r\n" .
					"Reply-To: support@kattellaan.com\r\n" .
					"X-Mailer: PHP/" . phpversion();
				mail($to, $subject, $message, $headers);
				printf('{ "success": true }');
			} else {
				printf('{ "success": false, "error": "Käyttäjätunnuksen sähköpostiosoite ei vastaa antamaasi sähköpostiosoitetta." }');
			}
		} else {
			printf('{ "success": false, "error": "Antamaasi käyttäjätunnusta ei ole olemassa." }');
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "new-password") {
		try {
			if(!empty($_POST['secret'])) {
				// base64_encode($account->get_identifier() . "||" . hash("sha512", $account->get_username() . "/" . $account->get_address() . "/" . $account->get_password() . "/" . $account->get_registered()));
				$pwa = base64_decode($_POST['secret']);
				$pwa = explode("||", $pwa);
				if(count($pwa) == 2) {
					$account = new account($database);
					$account->set_identifier($pwa[0]);
					if($account->select() == true) {
						$secret = hash("sha512", $account->get_username() . "/" . $account->get_address() . "/" . $account->get_password() . "/" . $account->get_registered());
						if($secret == $pwa[1]) {
							if(!empty($_POST['password'])) {
								$account->set_password(hash("sha512", $_POST['password']));
								if($account->update() == true) {
									printf('{ "success": true }');	
								} else {
									printf('{ "success": false, "error": "Salasanan päivitys epäonnistui." }');	
								}
							} else {
								// empty password can not do.
								printf('{ "success": false, "error": "Uusi salasana ei voi olla tyhjä." }');	
							}
						} else {
							// wrong secret
							printf('{ "success": false, "error": "Sinulla ei ole oikeutta, muuttaa tämän käyttäjätilin salasanaa." }');
						}
					} else {
						// account with the identifier was not found.
						printf('{ "success": false, "error": "Käyttäjätiliä ei löytynyt." }');
					}
				} else {
					// incorrect secret
					printf('{ "success": false, "error": "Salaisuus on väärin muodostettu." }');
				}
			} else {
				// no secret
				printf('{ "success": false, "error": "Ei salaisuutta." }');
			}
		} catch (Exception $e) {
			// something horrible happened.
			printf('{ "success", false, "error": "%s" }', $e->getMessage());
		}

	} else if(!empty($_GET['call']) && $_GET['call'] == "open_session") {
		try {
			$session = new session($database, "sha512");
			$session_key = $session->open($_GET['username'], hash("sha512", $_GET['password']));
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
			if(!empty($_POST['uid'])) {
				$account = new account($database);
				$account->set_identifier($_POST['uid']);
				$account->select();
				printf('{ "success": true, "username": "%s" }', $account->get_username());
			} else {
				printf('{ "success": false, "error": "user identifier was empty" }');
			}
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
		$uploaded_files = array();
		$failed_files = array();
		$upload_directory = "/home/temek/kattellaan-live/uploads/";
		if(!empty($_FILES)) {
			for($i = 0; $i < count($_FILES['file']['name']); $i++) {
				if(move_uploaded_file($_FILES['file']['tmp_name'][$i], $upload_directory . $_FILES['file']['name'][$i])) {	
					array_push($uploaded_files, $_FILES['file']['name'][$i]);
				} else {
					array_push($failed_files, $_FILES['file']['name'][$i]);
				}
			}
			if(empty($failed_files)) {
				printf('{ "success": true, "uploaded_files": %s }', json_encode($uploaded_files));
			} else {
				printf('{ "success": true, "uploaded_files": %s, "failed_files": %s }', json_encode($uploaded_files), json_encode($failed_files));
			}
		} else {
			printf('{ "success": false, "error": "No files uploaded." }');
		}	
	} else if(!empty($_POST['call']) && $_POST['call'] == "get_work") {
		if(!empty($_POST['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_POST['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session." }');
				die;
			}
		/*	if(!empty($_POST['work_type']) && $_POST['work_type'] == "distance") {
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
			}*/
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
			/*if(!empty($_POST['work_type']) && $_POST['work_type'] == "distance") {
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
			}*/
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
	} else if(!empty($_POST['call']) && $_POST['call'] == "long_pull_messages") {
		if(!empty($_COOKIE['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_COOKIE['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session." }');
				die();	
			}
			if(empty($_POST['suid'])) {
				printf('{ "success": false, "error": "Sender user identifier not specified." }');
				die();
			}
			$messages = new messages($database);
			try {
				$message = false;
				$time = time() + 30;
				while($message == false) {
					$msgs = $messages->get_unread($session->get_identifier($_COOKIE['session']));
					if($msgs != false) {
						foreach($msgs as $msg) {
							if($msg->get_sender() == $_POST['suid']) {
								$message = $msg;
							}
						}
						if($time < time()) {
							$message = "end";
						}
					} else {
						continue;
					} 
				}
				if($message != "end") {
					$sacc = new account($database);
					$sacc->set_identifier($message->get_sender());
					$racc = new account($database);
					$racc->set_identifier($message->get_receiver());
					try {
						$sacc->select();
						$racc->select();
					} catch (Exception $e) {
						printf('{ "success": false, "error": "%s"}', $e->getMessage());
					}
					$rmsg = array();
					$rmsg['mid'] = $message->get_identifier();
					$rmsg['sender_name'] = $sacc->get_username();
					$rmsg['sender_uid'] = $message->get_sender();
					$rmsg['receiver_name'] = $racc->get_username();
					$rmsg['receiver_uid'] = $message->get_receiver();
					$rmsg['timestamp'] = $message->get_timestamp();
					$rmsg['seen'] = $message->get_seen();
					$rmsg['type'] = $message->get_type();
					$rmsg['message'] = $message->get_message();
					printf("%s", json_encode(array("success" => true, "message" => $rmsg)));
				} else {
					printf('{ "success": true, "reason": "long pull ended."}');
				}
			} catch (Exception $e) {
				printf('{ "success": false, "error": "%s" }', $e->getMessage());
			}
		} else {
			printf('{ "success": false, "error": Not authenticated." }');
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "get_unread_messages") {
		if(!empty($_COOKIE['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_COOKIE['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session." }');
				die();
			}
			$messages = new messages($database);
			$messages = $messages->get_unread($session->get_identifier($_COOKIE['session']));
			if($messages != false) {	
				if($_POST['only_count'] == "true") {
					
					printf('{ "success": true, "count": %s }', count($messages));
				} else {
					$racc = new account($database);
					$racc->set_identifier($session->get_identifier($_COOKIE['session']));
					try {
						$racc->select();
					} catch (Exception $e) {
						printf('{ "success": false, "error": "%s" }', $e->getMessage());
						die;
					}
					$results = array();
					foreach($messages as $message) {
						$result['mid'] = $message->get_identifier();
						$account = new account($database);
						$account->set_identifier($message->get_sender());
						$account->select();
						$result['sender_name'] = $account->get_username();
						$result['sender_uid'] = $message->get_sender(); 
						$result['receiver_name'] = $racc->get_username();
						$result['receiver_uid'] = $message->get_receiver();
						$result['timestamp'] = $message->get_timestamp();
						$result['seen'] = $message->get_seen();
						$result['type'] = $message->get_type();
						$result['message'] = $message->get_message();
						array_push($results, $result);
					}
					$jsonthis = array("success" => true, "count" => count($messages), "messages" => $results);
					$json = json_encode($jsonthis);
					printf("%s", $json);
				}
			} else {
				printf('{ "success": false, "error": "No new messages."}');
			}
		} else {
			printf('{ "success": false, "error": "Not authenticated." }');
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "set_message_as_read") {
		if(!empty($_COOKIE['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_COOKIE['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session." }');
				die();
			}
			if(!empty($_POST['mid'])) {
				$message = new message($database);
				$message->set_identifier($_POST['mid']);
				try {
					$message->select();
					if($message->seen() == true) {
						printf('{ "success": true }');
					} else {
						printf('{ "success": false }');
					}
				} catch (exception $e) {
					printf('{ "success": false, "error": "%s" }', $e->getMessage());
					die();
				}
			} else {
				printf('{ "success": false, "error": "Message id was not specified."}');
			}
		} else {
			printf('{ "success": false, "error": "Not authenticated."}');
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "send_message") {
		if(!empty($_COOKIE['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_COOKIE['session']) == false) {
				printf('{"success": false, "error": "Failed to confirm session" }');
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
			if($discussion != false) {
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
				if(!empty($discussions)) {
					foreach($discussions as $discussion) {
						$sacc = new account($database);
						$racc = new account($database);
						if($discussion->get_sender() == $_POST['uid']) {
							$sacc->set_identifier($discussion->get_sender());
							$racc->set_identifier($discussion->get_receiver());		
							try {
								$sacc->select();
								$racc->select();
							} catch (Exception $e) {
								printf('{ "success": false, "error": "%s"}', $e->getMessage());
								die();
							}
							$result['sender_name'] = $sacc->get_username();
							$result['receiver_name'] = $racc->get_username();
							$result['sender_uid'] = $sacc->get_identifier();
							$result['receiver_uid'] = $racc->get_identifier();
						} else if($discussion->get_receiver() == $_POST['uid']) {
							$sacc->set_identifier($discussion->get_receiver());
							$racc->set_identifier($discussion->get_sender());
							try {
								$sacc->select();
								$racc->select();
							} catch (Exception $e) {
								printf('{ "success": false, "error": "%s"}', $e->getMessage());
								die();
							}
							$result['sender_name'] = $racc->get_username();
							$result['receiver_name'] = $sacc->get_username();
							$result['sender_uid'] = $racc->get_identifier();
							$result['receiver_uid'] = $sacc->get_identifier();
						}
						array_push($results, $result);
					}
				}
				$results = array_unique($results, SORT_REGULAR);
				$results = array_values($results);
				$jsonthis = array("success" => true, "discussions" => $results);
				printf("%s", json_encode($jsonthis));
			} else {
				printf('{ "success": false, "error": "User identifier was not given."}');
			}
		} else {
			printf('{ "success": false, "error": "Session does not exist." }');
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "change_username") {
		if(!empty($_COOKIE['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_COOKIE['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session."}');
				die();
			}
			$account = new account($database);
			$account->set_identifier($_POST['uid']);
			try {
				$account->select();
			} catch (Exception $e) {
				printf('{ "success": false, "error": "%s"}', $e->getMessage());
				die();
			}
			$account->set_username($_POST['username']);
			try {
				if($account->update() != false) {
					printf('{ "success": true }');
				} else {
					printf('{ "success": false, "error": "Account update method failed" }');
				}
			} catch (Exception $e) {
				printf('{ "success": false, "error": "%s" }', $e->getMessage());
				die();
			}
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "change_password") {
		if(!empty($_COOKIE['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_COOKIE['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session."}');
				die();
			}
			$account = new account($database);
			$account->set_identifier($_POST['uid']);
			try {
				$account->select();
			} catch (Exception $e) {
				printf('{ "success": false, "error": "%s"}', $e->getMessage());
				die();
			}
			$account->set_password(hash("sha512", $_POST['password']));
			try {
				if($account->update() != false) {
					printf('{ "success": true }');
				} else {
					printf('{ "success": false, "error": "Account update method failed" }');
				}
			} catch (Exception $e) {
				printf('{ "success": false, "error": "%s" }', $e->getMessage());
				die();
			}
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "get_latest_users") {
		if(!empty($_COOKIE['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_COOKIE['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session."}');
				die();
			}
			$query = "SELECT `id`, `username`, `picture` FROM `account` INNER JOIN `profile` ON profile.identifier = account.id ORDER BY `id` DESC LIMIT 0, 10;";
			$statement = $database->prepare($query);
			$result = $statement->execute();
			if($result->success() == true) {
				$rows = $result->rows();
				if($rows > 0) {
					$latest_users = array();
					for($i = 0; $i < $rows; $i++) {
						$row = $result->fetch_array(RASSOC);
						array_push($latest_users, $row); 
					}
					printf('{ "success": true, "users" : %s }', json_encode($latest_users));
				}
			} else {
				printf('{ "success": false, "error": "Failed to query database." }');
				die();
			}
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "edit_profile") {
		if(!empty($_COOKIE['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_COOKIE['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session." }');
				die;
			}
			$call = json_encode($_POST);
			$profile = new profile($database);
			if($profile->select($_POST['uid']) == true) {
				$data = json_decode($call, true);
				$data['address'] = $_POST['street-address'] . " " . $_POST['town-address'] . " " . $_POST['country-address'];
				$data['address'] = str_replace(" ", "+", $data['address']);
				$data['looking_for'] = implode(",", $data['looking_for']);
				$data['kids'] = implode(",", $data['kids']);
				$data['language_skills'] = implode(",", $data['language_skills']);
				$data['pets'] = implode(",", $data['pets']);
				$data['picture'] = $profile->get_picture();
				$profile->set($data);
				if($profile->update() == true) {
					printf('{ "success": true }');
				} else {
					printf('{ "success": false, "error": "Failed to update profile" }');
				}
			}
		} else {
			printf('{ "success": false, "error": "Session was not found" }');
		}
	} else if(!empty($_POST['call']) && $_POST['call'] == "search") {
		if(!empty($_COOKIE['session'])) {
			$session = new session($database, "sha512");
			if($session->confirm($_COOKIE['session']) == false) {
				printf('{ "success": false, "error": "Failed to confirm session." }');
				die;
			}

			foreach($_POST as $key => $value) {
				if(is_array($_POST[$key])) {
					foreach($_POST[$key] as $skey => $svalue) {
						$_POST[$key][$skey] = $database->escape($svalue);
					}
				} else {
					$_POST[$key] = $database->escape($value);
				}
			}


			$query = "SELECT account.id, `username`, profile.address, `profile_text` ,`picture`, `relationship_status`, `registered`, `timestamp`, `birthday`, `gender`, `looking_for`, `sexual_orientation` ";
			$query .= "FROM `account` INNER JOIN `profile` ON account.id = profile.identifier ";
			$query .= "LEFT JOIN (SELECT * FROM `session` WHERE 1 ORDER BY `timestamp` DESC LIMIT 0, 1) s ON account.id = s.uid WHERE ";
			$ap_search_results = array();
			
			if(!empty($_POST['username'])) {
				$query .= " `username` LIKE '%" . $_POST['username'] . "%'";
			} else {
				$query .= " `username` LIKE '%%'";
			}

			if(!empty($_POST['age-min']) && !empty($_POST['age-max'])) {
				$current_year = gmdate("Y");
				$minimum_year = $current_year - $_POST['age-min'];
				$query .= " AND `birthday` <= '" . $minimum_year . "-12-31'";
				$maximum_year = $current_year - $_POST['age-max'];
				$query .= " AND `birthday` >= '" . $maximum_year . "-01-01'";
			}


			if(!empty($_POST['gender'])) {
				$count = count($_POST['gender']);
				if($count > 1) {
					$query .= " AND ( `gender` = '" . $_POST['gender'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `gender` = '" . $_POST['gender'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `gender` = '" . $_POST['gender'][0] ."'";
				}
			}
			if(!empty($_POST['relationship-status'])) {
				$count = count($_POST['relationship-status']);
				if($count > 1) {
					$query .= " AND  (`relationship_status` = '" . $_POST['relationship-status'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `relationship_status` = '" . $_POST['relationship-status'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `relationship_status` = '" . $_POST['relationship-status'][0] . "'";
				}
			}

			if(!empty($_POST['sexual-orientation'])) {
				$count = count($_POST['sexual-orientation']);
				if($count > 1) {
					$query .= " AND ( `sexual_orientation` = '" . $_POST['sexual-orientation'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `sexual_orientation` = '" . $_POST['sexual-orientation'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `sexual_orientation` = '" . $_POST['sexual-orientation'][0] . "'";
				}
			}
			if(!empty($_POST['looking-for'])) {
				$count = count($_POST['looking-for']);
				if($count > 1) {
					$query .= " AND ( `looking_for` = '" . $_POST['looking-for'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `looking_for` = '" . $_POST['looking-for'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `looking_for` = '" . $_POST['looking-for'][0] . "'";
				}
			}

			if(!empty($_POST['min-height']) && !empty($_POST['max-height'])) {
				$query .= " AND `height` > " . $_POST['min-height'];
				$query .= " AND `height` < " . $_POST['max-height'];
			}
	
			if(!empty($_POST['min-weight']) && !empty($_POST['max-weight'])) {
				$query .= " AND `weight` > " . $_POST['min-weight'];
				$query .= " AND `weight` < " . $_POST['max-weight'];
			}

			if(!empty($_POST['body-type'])) {
				$count = count($_POST['body-type']);
				if($count > 1) {
					$query .= " AND ( `body_type` = '" . $_POST['body-type'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `body_type` = '" . $_POST['body-type'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `body_type` = '" . $_POST['body-type'][0] . "'";
				}
			}

			if(!empty($_POST['eye-color'])) {
				$count = count($_POST['eye-color']);
				if($count > 1) {
					$query .= " AND ( `eye_color` = '" . $_POST['eye-color'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `eye_color` = '" . $_POST['eye-color'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `eye_color` = '" . $_POST['eye-color'][0] . "'";
				}
			}

			if(!empty($_POST['hair-length'])) {
				$count = count($_POST['hair-length']);
				if($count > 1) {
					$query .= " AND ( `hair_length` = '" . $_POST['hair-length'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `hair_length` = '" . $_POST['hair-length'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `hair_length` = '" . $_POST['hair-length'][0] . "'";
				}
			}

			if(!empty($_POST['hair-color'])) {
				$count = count($_POST['hair-color']);
				if($count > 1) {
					$query .= " AND ( `hair_color` = '" . $_POST['hair-color'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `hair_color` = '" . $_POST['hair-color'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `hair_color` = '" . $_POST['hair-color'][0] . "'";
				}
			}


			if(!empty($_POST['kids'])) {
				$count = count($_POST['kids']);
				if($count > 1) {
					$query .= " AND ( `kids` = '" . $_POST['kids'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `kids` = '" . $_POST['kids'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `kids` = '" . $_POST['kids'][0] . "'";
				}
			}

			if(!empty($_POST['accomodation'])) {
				$count = count($_POST['accomodation']);
				if($count > 1) {
					$query .= " AND ( `accomodation` = '" . $_POST['accomodation'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `accomodation` = '" . $_POST['accomodation'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `accomodation` = '" . $_POST['accomodation'][0] . "'";
				}
			}

			if(!empty($_POST['ethnic-identity'])) {
				$count = count($_POST['ethnic-identity']);
				if($count > 1) {
					$query .= " AND ( `ethnic_identity` = '" . $_POST['ethnic-identity'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `ethnic_identity` = '" . $_POST['ethnic-identity'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `ethnic_identity` = '" . $_POST['ethnic-identity'][0] . "'";
				}
			}

			if(!empty($_POST['language-skills'])) {
				$count = count($_POST['language-skills']);
				if($count > 1) {
					$query .= " AND ( `language_skills` = '" . $_POST['language-skills'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `language_skills` = '" . $_POST['language-skills'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `language_skills` = '" . $_POST['language-skills'][0] . "'";
				}
			}

			if(!empty($_POST['education'])) {
				$count = count($_POST['education']);
				if($count > 1) {
					$query .= " AND ( `education` = '" . $_POST['education'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `education` = '" . $_POST['education'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `education` = '" . $_POST['education'][0] . "'";
				}
			}

			if(!empty($_POST['work'])) {
				$count = count($_POST['work']);
				if($count > 1) {
					$query .= " AND ( `work` = '" . $_POST['work'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `work` = '" . $_POST['work'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `work` = '" . $_POST['work'][0] . "'";
				}
			}

			if(!empty($_POST['min-income']) && !empty($_POST['max-income'])) {
				$query .= " AND `income` > " . $_POST['min-income'];
				$query .= " AND `income` < " . $_POST['max-income'];
			}

			if(!empty($_POST['vocation'])) {
				$count = count($_POST['vocation']);
				if($count > 1) {
					$query .= " AND ( `vocation` = '" . $_POST['vocation'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `vocation` = '" . $_POST['vocation'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `vocation` = '" . $_POST['vocation'][0] . "'";
				}
			}

			if(!empty($_POST['dress-style'])) {
				$count = count($_POST['dress-style']);
				if($count > 1) {
					$query .= " AND ( `dress_style` = '" . $_POST['dress-style'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `dress_style` = '" . $_POST['dress-style'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `dress_style` = '" . $_POST['dress-style'][0] . "'";
				}
			}

			if(!empty($_POST['smoking'])) {
				$count = count($_POST['smoking']);
				if($count > 1) {
					$query .= " AND ( `smoking` = '" . $_POST['smoking'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `smoking` = '" . $_POST['smoking'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `smoking` = '" . $_POST['smoking'][0] . "'";
				}
			}

			if(!empty($_POST['alcohol'])) {
				$count = count($_POST['alcohol']);
				if($count > 1) {
					$query .= " AND ( `alcohol` = '" . $_POST['alcohol'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `alcohol` = '" . $_POST['alcohol'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `alcohol` = '" . $_POST['alcohol'][0] . "'";
				}
			}

			if(!empty($_POST['pets'])) {
				$count = count($_POST['pets']);
				if($count > 1) {
					$query .= " AND ( `pets` = '" . $_POST['pets'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `pets` = '" . $_POST['pets'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `pets` = '" . $_POST['pets'][0] . "'";
				}
			}

			if(!empty($_POST['exercise'])) {
				$count = count($_POST['exercise']);
				if($count > 1) {
					$query .= " AND ( `exercise` = '" . $_POST['exercise'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `exercise` = '" . $_POST['exercise'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `exercise` = '" . $_POST['exercise'][0] . "'";
				}
			}

			if(!empty($_POST['travel'])) {
				$count = count($_POST['travel']);
				if($count > 1) {
					$query .= " AND ( `travel` = '" . $_POST['travel'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `travel` = '" . $_POST['travel'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `travel` = '" . $_POST['travel'][0] . "'";
				}
			}

			if(!empty($_POST['religion'])) {
				$count = count($_POST['religion']);
				if($count > 1) {
					$query .= " AND ( `religion` = '" . $_POST['religion'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `religion` = '" . $_POST['religion'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `religion` = '" . $_POST['religion'][0] . "'";
				}
			}

			if(!empty($_POST['religion-importance'])) {
				$count = count($_POST['religion-importance']);
				if($count > 1) {
					$query .= " AND ( `religion_importance` = '" . $_POST['religion-importance'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `religion_importance` = '" . $_POST['religion-importance'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `religion_importance` = '" . $_POST['religion-importance'][0] . "'";
				}
			}

			if(!empty($_POST['left-right-politics'])) {
				$count = count($_POST['left-right-politics']);
				if($count > 1) {
					$query .= " AND ( `left_right_politics` = '" . $_POST['left-right-politics'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `left_right_politics` = '" . $_POST['left-right-politics'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `left_right_politics` = '" . $_POST['left-right-politics'][0] . "'";
				}
			}

			if(!empty($_POST['liberal-conservative-politics'])) {
				$count = count($_POST['liberal-conservative-politics']);
				if($count > 1) {
					$query .= " AND ( `liberal_conservative_politics` = '" . $_POST['liberal-conservative-politics'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `liberal_conservative_politics` = '" . $_POST['liberal-conservative-politics'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `liberal_conservative_politics` = '" . $_POST['liberal-conservative-politics'][0] . "'";
				}
			}

			if(!empty($_POST['political-importance'])) {
				$count = count($_POST['political-importance']);
				if($count > 1) {
					$query .= " AND ( `political_importance` = '" . $_POST['political-importance'][0] . "'";
					for($i = 1; $i < $count; $i++) {
						$query .= " OR `political_importance` = '" . $_POST['political-importance'][$i] . "'";
					}
					$query .= " )";
				} else if($count == 1) {
					$query .= " AND `political_importance` = '" . $_POST['political-importance'][0] . "'";
				}
			}

			// username=&age-min=16&age-max=40&location=&max-distance=50&gender%5B%5D=man&relationship-status%5B%5D=single&sexual-orientation%5B%5D=hetero&looking-for%5B%5D=friends&min-height=150&max-height=170&min-weight=30&max-weight=60&body-type%5B%5D=slender&eye-color%5B%5D=blue&hair-length%5B%5D=bald&hair-color%5B%5D=light&kids%5B%5D=yes&accomodation%5B%5D=alone&ethnic-identity%5B%5D=white&language-skills%5B%5D=finnish&education%5B%5D=untrained&work%5B%5D=student&min-income=0&max-income=50000&vocation%5B%5D=administrator%2Ffinance&dress-style%5B%5D=fashionable&smoking%5B%5D=smokeless&alcohol%5B%5D=alcohol-free&pets%5B%5D=nopets&exercise%5B%5D=idont&travel%5B%5D=cottagebatty&religion%5B%5D=atheist&religion-importance%5B%5D=insignificant&left-right-politics%5B%5D=left&liberal-conservative-politics%5B%5D=conservative&political-importance%5B%5D=dontcare&search-save-name=&saved-search=none 
			
			$query .= ";";
			//printf("%s\r\n", $query);
			$world = json_decode(file_get_contents("../lists/states-regions-municipalities.json"));
			$distances = array();
			if(!empty($_POST['max-distance'])) {
				$searcher_identifier = $session->get_identifier($_COOKIE['session']);
				if($distance_result->success() == true) {
					$rows = $distance_result->rows();
					for($i = 0; $i < $rows; $i++) {
						array_push($distances, $distance_result->fetch_array(RASSOC));
					}
				}
			}
			$statement = $database->prepare($query);	
			$result = $statement->execute();
			if($result->success() == true) {
				$rows = $result->rows();
				if($rows > 0) {
					for($i = 0; $i < $rows; $i++) {
						$row = $result->fetch_array(RASSOC);
						$push_this = false;
						// do the location matching.
						$town = explode("+", $row['address']);
						if(empty($town)) {
							$town = explode(", ", $row['address']);
						}
						end($town);
						$row['town'] = prev($town);
						if(!empty($_POST['location'])) {
							foreach($world->states as $state) {
								if(in_array(strtolower($_POST['location']), $state->name) == true) {
									foreach($state->regions as $region) {
										foreach($region->municipalities as $municipality) {
											if(strpos(strtolower($row['address']), $municipality) !== false) {
												$push_this = true;
												$row['town'] = $municipality;
											}
										}
									}
								} else {
									foreach($state->regions as $region) {
										if(in_array(strtolower($_POST['location']), $region->name) == true) {
											foreach($region->municipalities as $municipality) {
												if(strpos(strtolower($row['address']), $municipality) !== false) {
													$push_this = true;
													$row['town'] = $municipality;
												}
											}
										} else {
											if(strpos(strtolower($row['address']), strtolower($_POST['location'])) !== false) {
												$push_this = true;
												$row['town'] = strtolower($_POST['location']);
											}
										}
									}
								}
							}
						} else if(!empty($_POST['max-distance'])) {
							$distances_count = count($distances);
							if($distances_count >= 1) {
								for($x = 0; $x < $distances_count; $x++) {
									if($distances[$x]['end'] == $row['id'] && $distances[$x]['start'] == $searcher_identifier) {
										$push_this = true;
									} else if ($distances[$x]['end'] == $searcher_identifier && $distances[$x]['start'] == $row['id']) {
										$push_this = true;
									}
								}
							}
							/*
							$searcher_identifier = $session->get_identifier($_COOKIE['session']);
							$distance_statement = $database->prepare("SELECT * FROM `distance` WHERE `distance` <= ? AND ((`start` = ? AND `end` = ?) OR (`start` = ? AND `end` = ?));");
							$distance_statement->bind("i", $_POST['max-distance'] * 1000);
							$distance_statement->bind("i", $searcher_identifier);
							$distance_statement->bind("i", $row['id']);
							$distance_statement->bind("i", $row['id']);
							$distance_statement->bind("i", $searcher_identifier);
							$distance_result = $distance_statement->execute();
							if($distance_result->success() == true && $distance_result->rows() >= 1) {
								$push_this = true;
							}
							*/
						} else {
							$push_this = true;
						}

						if($push_this == true) {
							array_push($ap_search_results, $row);
						}
					}
				} else {
					printf('{ "success": false, "error": "No results" }');
					die();
				}
			}
			
			printf('{ "success": true, "result" : %s }', json_encode($ap_search_results));
			//printf('{ "success": false, "error": "Search has not been implemented yet.\r\n This is the current sql query:\r\n %s" }', $query);
		} else {
			printf('{ "success": false, "error": "Not authenticated."}');
		}
	} else {
		printf('{ "success": false, "error": "api %s call does not exist."}', $_POST['call']);
	}
}

?>
