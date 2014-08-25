<?php

class account {
	private $database;
	private $identifier;
	private $username;
	private $address;
	private $password;
	private $registered;

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
		$username = str_replace("<", "&lt;", $username);
		$username = str_replace(">", "&gt;", $username);
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

	public function set_registered($registered) {
		$this->registered = $registered;
	}

	public function get_registered() {
		return $this->registered;
	}

	public function create_table() {
		$table_query = "CREATE TABLE IF NOT EXISTS `account`(" .
				"id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," .
				"username TEXT NOT NULL," .
				"address TEXT NOT NULL," .
				"password TEXT NOT NULL," .
				"registered DATETIME NOT NULL);"; 
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
		} else if(!empty($this->username) && !empty($this->address)) {
			$statement = $this->database->prepare("SELECT * FROM `account` WHERE `username` = ? OR `address` = ?");
			$statement->bind("s", $this->username);
			$statement->bind("s", $this->password);
		} else if(!empty($this->username)) {
			$statement = $this->database->prepare("SELECT * FROM `account` WHERE `username` = ?;");
			$statement->bind("s", $this->username);
		} else if(!empty($this->address)) {
			$statement = $this->database->prepare("SELECT * FROM `account` WHERE `address` = ?;");
			$statement->bind("s", $this->address);
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
				$this->password = $data->password;
				$this->registered = $data->registered;
				return true;
			} else {
				return false;
			}
		} else {
			throw new Exception("Database query failed!");
		}
		return false;
	}
	public function insert() {
		if($this->select() == true) {
			return false;	
		} else {
			$statement = $this->database->prepare("INSERT INTO `account` (`username`, `address`, `password`, `registered`) VALUES (?, ?, ?, NOW());");
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
				$statement->bind("s", $this->password);
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
			$statement->bind("s", $this->password);
		} else {
			throw new Exception("Password was empty.");
		}
		if(!empty($this->identifier)) {
			$statement->bind("s", $this->identifier);
		} else {
			throw new Exception("Identifier was empty.");
		}
		$result = $statement->execute();
		if($result->success() == true) {
			return $this->select();
		} else {
			throw new Exception("Database query failed! " . $statement->get());
		}
		return false;
	}

}

?>
