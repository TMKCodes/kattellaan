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
		$client_remote_host = $_SERVER['REMOTE_HOST'];
		$client_forwarded_for = $_SERVER['HTTP_X_FORWARDED_FOR'];
		return hash($this->session_hash, $client_user_agent . "||" . $client_remote_host . "||" . $client_forwarded_for); 
	}

	public function open($username, $password) {
		if(!empty($account) && !empty($password)) {
			$account = new account($this->database);
			$account->set_username($username);
			$account->set_password($password);
			if($account->select() == true) {
				$session_key = $this->generate($this->session_hash, 256);
				$client = $this->client();
				$statement = $this->database->prepare("INSERT INTO `session` (`id`, `key`, `client`) VALUES (?, ?, ?);");
				$statement->bind("s", $account->get_identifier());
				$statement->bind("s", $session_key);
				$statement->bind("s", $client);
				$result = $statement->execute();
				if($result->success() == true) {
					return $this->get_identifier . "||" . $session_key . "||" . $client;
				} else {
					return false;
				}
			} else {
				return false;
			}
		} else {
			throw new Exception("Username and password were empty.");
		}
	}

	public function update($data) {
		if(!empty($data)) {
			if($this->confirm($data) == true) {
				$data = explode("||", $data);
				$session_key = $this->generate($this->session_hash, 256);
				$statement = $this->database->prepare("UPDATE `session` SET `key` = '?' WHERE `id` = '?' AND `client` = '?';");
				$statement->bind("s", $session_key);
				$statement->bind("s", $data[0]);
				$statement->bind("s", $data[2]);
				$result = $statement->execute();
				if($result->success() == true) {
					return $data[0] . "||" . $session_key . "||" . $data[2];
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
			$data = explode("||", $data);
			$statement = $this->database->prepare("SELECT * FROM `session` WHRE `id` = '?' AND `key` = '?' AND `client` = '?';");
			$statement->bind("s", $data[0]);
			$statement->bind("s", $data[1]);
			$statement->bind("s", $this->client());
			$result = $statement->execute();
			$result->success();
		} else {
			throw new Exception("Session data was not given.");
		}
	}
	
	public function close($data) {
		if(!empty($data)) {
			$data = explode("||", $data);
			$statement = $this->database->prepare("DELETE FROM `session` WHERE `id` = '?' AND `key` = '?' AND `client` = '?';");
			$statement->bind("s", $data[0]);
			$statement->bind("s", $data[1]);
			$statement->bind("s", $data[2]);
			$result = $statement->execute();
			return $result->success();
		} else {
			throw new Exception("Session data was not given.");
		}
	}
}

?>
