<?php

class account {
	private $database;
	private $identifier;
	private $username;
	private $address;
	private $password;

	public function __construct($database) {
		$this->database = $database;
	}

	public function set_identifier($identifier) {
		$this->identifier = $identifier;
	}
	public function get_identifier() {
		return $this->identifier;
	}
	public function set_username($username) {
		$this->username = $username;
	}
	public function get_username() {
		return $this->username;
	}

	public function set_address($address) {
		$this->address = $address;
	}
	public function get_address() {
		return $this->address;
	}
	public function set_password($password) {
		$this->password = $password;
	}
	public function get_password() {
		return $this->password;
	}
	
	public function create_table() {
		$table_query = "CREATE TABLE IF NOT EXISTS `account`(" .
				"id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," .
				"username TEXT NOT NULL," .
				"address TEXT NOT NULL," .
				"password TEXT NOT NULL);"; 
		$statement = $this->database->prepare($table_query);
		$result = $statement->execute();
		if($result->success() == true) {
			return true;
		} else {
			return false;
		}
		
	}

	public function select() {
		if(!empty($this->identifier)) {
			$statement = $this->database->prepare("SELECT * FROM `account` WHERE `id` = ?;");
			$statement->bind("s", $this->identifier);
		} else if(!empty($this->username)) {
			$statement = $this->database->prepare("SELECT * FROM `account` WHERE `username` = ?;");
			$statement->bind("s", $this->username);
		} else {
			throw new Exception("No identifying data specified. Give identifier or username.");
		}
		$result = $statement->execute();
		if($result->success() == true) {
			if($result->rows() == 1) {
				$data = $result->fetch_object();
				if(empty($data)) throw new Exception("Failed to fetch object!");
				$this->identifier = $data->id;
				$this->username = $data->username;
				$this->address = $data->address;
				$this->password = $this->password;
				return true;
			} else {
				throw new Exception("Account does not exist!");
			}
		} else {
			throw new Exception("Database query failed!");
		}
		return false;
	}
	public function insert() {
		if($this->select() == true) {
			throw new Exception("Account already exists");
		} else {
			$statement = $this->database->prepare("INSERT INTO `account` (`username`, `address`, `password`) VALUES (?, ?, ?);");
			if(!empty($this->username)) {
				$statement->bind("s", $this->username);	
			} else {
				throw new Exception("Username was empty.");
			}
			if(!empty($this->address)) {
				$statement->bind("s", $this->address);
			} else {
				throw new Exception("Address was empty.");
			}
			if(!empty($this->password)) {
				$statement->bind("s", $this->address);
			} else {
				throw new Exception("Password was empty.");
			}
			$result = $statement->execute();
			if($result->success() == true) {
				return $this->select();
			} else {
				throw new Exception("Database query failed!");
			}
		}
		return false;
	}
	public function update() {
		$statement = $this->database->prepare("UPDATE `account` SET `username` = ?, `address` = ?, `password` = ? WHERE `id` = ?;");
		if(!empty($this->username)) {
			$statement->bind("s", $this->username);
		} else {
			throw new Exception("Username was empty.");
		}
		if(!empty($this->address)) {
			$statement->bind("s", $this->address);
		} else {
			throw new Exception("Address was empty.");
		}
		if(!empty($this->password)) {
			throw new Exception("Password was empty.");
		}
		$result = $statement->execute();
		if($result->success() == true) {
			return $this->select();
		} else {
			throw new Exception("Database query failed!");
		}
		return false;
	}

}

?>
