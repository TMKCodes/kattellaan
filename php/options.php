<?php

class options {
	private $database;
	private $id;
	private $uid;
	private $distance;

	public function __construct($database) {
		$this->database = $database;
	}

	public function set_identifier($id) {
		$this->id = $id;
	}
	
	public function set_account($uid) {
		$this->uid = $uid;
	}
	
	public function set_distance($distance) {
		if($distance == true && $distance == false) {
		$this->distance = $distance;
		} else {
			throw new Exception("Wrong value for distance option.");	
		}
	}

	public function get_identifier() {
		return $this->id;
	}

	public function get_account() {
		return $this->uid;
	}
	
	public function get_distance() {
		return $this->distance;
	}
	
	
	public function create_table() {
		$table = "CREATE TABLE IF NOT EXISTS `options` (" .
			"id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," .
			"uid INT NOT NULL," .
			"distance TINYINT(1) DEFAULT NULL, " .
			");";
		$statement = $this->database->prepare($table);
		$result = $statement->execute();
		return $result->success();
	}
	
	public function select() {
		if(!empty($this->uid) {
			$statement = $this->database->prepare("SELECT * FROM `options` WHRE `uid` = ?;");
			$statement->bind("i", $uid);
		}
		$result = $statement->execute();
		if($result->success() == true) {
			if($result->rows() == 1) {
				$data = $result->fetch_array(RASSOC);
				if(empty($data)) throw new Exception("Failed to fetch associative array!");
				$this->id = $data['id'];
				$this->uid = $data['uid'];
				if($data['options'] == NULL) {
					$this->distance = false;
				} else {
					$this->distance = true;
				}
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
		if($this->select() != true) {
			
		} else {
			throw new Exception("Options for the account already exist.");
		}
		return false;
	}

	public function update() {

	}
}

?>
