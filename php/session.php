<?php

require_once("account.php");

class session {
	private $database;
	private $session_hash;

	public function __construct($database, $session_hash) {
		$this->database = $database;
		$this->session_hash = $session_hash;
	}
	
	private function generate($hash, $length) {
		$key = array();
		for($i = 0; $i < $length; $i++) {
			$first_random = mt_rand(0, 34);
			if($first_random >= 0 && $first_random <= 4) {
				$char = chr(mt_rand(48, 57));
			} else if($first_random >= 5 && $first_random <= 19) {
				$char = chr(mt_rand(65, 90));
			} else if($first_random >= 20 && $first_random <= 34) {
				$char = chr(mt_rand(97, 122));
			}
			$key[$i] = $char;
		}
		return hash($hash, implode($key));
	}

	private function client() {
		$client_user_agent = $_SERVER['HTTP_USER_AGENT'];
		$client_remote_addr = $_SERVER['REMOTE_ADDR'];
		$client_forwarded_for = getenv('HTTP_X_FORWARDED_FOR');
		return hash($this->session_hash, $client_user_agent . "||" . $client_remote_addr . "||" . $client_forwarded_for); 
	}

	public function get_identifier($data) {
		$data = explode("||", base64_decode($data));
		return $data[1];
	}

	public function create_table() {
		$table_statement = "CREATE TABLE IF NOT EXISTS `session`(" .
			"id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," .
			"uid INT NOT NULL," .
			"secret TEXT NOT NULL," .
			"client TEXT NOT NULL," .
			"timestamp DATETIME NOT NULL, " .
			"onlin INT NOT NULL );";
		$statement = $this->database->prepare($table_statement);
		$result = $statement->execute();
		return $result->success();
	}

	public function open($username, $password) {
		if(!empty($username) && !empty($password)) {
			$account = new account($this->database);
			$account->set_username($username);
			$account->set_password($password);
			if($account->select() == true) {
				$session_key = $this->generate($this->session_hash, 256);
				$client = $this->client();
				$statement = $this->database->prepare("INSERT INTO `session` (`uid`, `secret`, `client`, `timestamp`, `online`) VALUES (?, ?, ?, ?, 1);");
				$statement->bind("i", $account->get_identifier());
				$statement->bind("s", $session_key);
				$statement->bind("s", $client);
				$statement->bind("s", gmdate("Y-m-d H:i:s"));
				$result = $statement->execute();
				if($result->success() == true) {
					$statement = $this->database->prepare("SELECT * FROM `session` WHERE `uid` = ? AND `secret` = ? AND `client` = ?;");
					$statement->bind("i", $account->get_identifier());
					$statement->bind("s", $session_key);
					$statement->bind("s", $client);
					$result = $statement->execute();
					if($result->success() == true) {
						if($result->rows() > 1) {
							throw new Exception("Too many identical sessions.");
						} else {
							$data = $result->fetch_array(RASSOC);
							return base64_encode($data['id'] . "||" . $account->get_identifier() . "||" . $session_key . "||" . $client);
						}
					} else {
						throw new Exception("Failed to create session.");
					}
				} else {
					
					throw new Exception("Session already exists");
				}
			} else {
				throw new Exception("Something wrong with the username and password.");
			}
		} else {
			throw new Exception("Username and password were empty.");
		}
	}

	public function update($data) {
		if(!empty($data)) {
			if($this->confirm($data) == true) {
				$data = explode("||", base64_decode($data));
				$session_key = $this->generate($this->session_hash, 256);
				$statement = $this->database->prepare("UPDATE `session` SET `secret` = ?, `timestamp` = ?, `online` = 1 WHERE `id` = ?");
				$statement->bind("s", $session_key);
				$statement->bind("s", gmdate("Y-m-d H:i:s"));
				$statement->bind("i", $data[0]);
				$result = $statement->execute();
				if($result->success() == true) {
					return base64_encode($data[0] . "||" . $data[1] . "||" . $session_key . "||" . $data[3]);
				} else {
					return false;
				}
			} else {
				return false;
			}
		} else {
			throw new Exception("Session data was not given.");
		}
	}


	public function confirm($data) {
		if(!empty($data)) {
			$data = explode("||", base64_decode($data));
			$statement = $this->database->prepare("SELECT * FROM `session` WHERE `id` = ? AND `uid` = ? AND `secret` = ? AND `client` = ?;");
			$statement->bind("i", $data[0]);
			$statement->bind("i", $data[1]);
			$statement->bind("s", $data[2]);
			$statement->bind("s", $this->client());
			$result = $statement->execute();
			if($result->success() == true) {
				if($result->rows() >= 1) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		} else {
			throw new Exception("Session data was not given.");
		}
	}
	
	public function close($data) {
		if(!empty($data)) {
			$data = explode("||", base64_decode($data));
			$statement = $this->database->prepare("DELETE FROM `session` WHERE `id` = '?';");
			$statement->bind("i", $data[0]);
			$result = $statement->execute();
			if($result->success() == false) {
				throw new Exception("Failed Query: " . $statement->get());
			} else {
				return $result->success();
			}
		} else {
			throw new Exception("Session data was not given.");
		}
	}
}

?>
