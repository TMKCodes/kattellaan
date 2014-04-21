<?php

class position {

	private $identifier;
	private $latitude;
	private $longitude;
	private $database;

	public function __construct($database) {
		$this->database = $database;
	}

	public function set_identifier($identifier) {
		$this->identifier = $identifier;
	}
	
	public function set_latitude($latitude) {
		$this->latitude = $latitude;
	}
	
	public function set_longitude($longitude) {
		$this->longitude = $longitude;
	}
	
	public function set($identifier, $latitude, $longitude) {
		$this->set_identifier($identifier);
		$this->set_latitude($latitude);
		$this->set_longitude($longitude);
	}

	public function get_identifier() {
		return $this->identifier;
	}

	public function get_latitude() {
		return $this->latitude;
	}
	
	public function get_longitude() {
		return $this->longitude;	
	}

	public function get() {
		return array("identifier" => $this->identifier, "latitude" => $this->latitude, "longitude" => $this->longitude);
	}

	public function create_table() {
		$table = "CREATE TABLE IF NOT EXISTS `position` (" .
				"id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," .
				"latitude INT NOT NULL," .
				"longitude INT NOT NULL);";
		$statement = $this->database->prepare($table);
		$result = $statement->execute();
		return $result->success();
	}

	public function amount() {
		$statement = $this->database->prepare("SELECT COUNT(*) AS amount FROM `position`;");
		$result = $statement->execute();
		if($result->success() == true) {
			$data = $result->fetch_array(RASSOC);
			return $data['amount'];
		} else {
			throw new Exception("Failed to query database.");
		}
		return false;
	}

	public function select() {
		if(!empty($this->identifier)) {
			$statement = $this->database->prepare("SELECT * FROM `position` WHERE `id` = ?;");
			$statement->bind("i", $this->identifier);
		} else if(!empty($this->latitude) && !empty($this->longitude)) {
			$statement = $this->database->prepare("SELECT * FROM `position` WHERE `latitude` = ? AND `longitude` = ?;");
			$statement->bind("i", $this->latitude);
			$statement->bind("i", $this->longitude);
		} else {
			throw new Exception("No identifying data specified. Give latitude and longitude or identifier");
		}
		$result = $statement->execute();
		if($result->success() == true) {
			if($result->rows() == 1) {
				$data = $result->fetch_object();
				if(empty($data)) throw new Exception("Failed to fetch object!");
				$this->identifier = $this->id;
				$this->latitude = $this->latitude;
				$this->longitude = $this->longitude;
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
		if(!empty($this->identifier)) {
			throw new Exception("Identifier already set.");
			return false;
		}
		if(empty($this->latitude)) {
			throw new Exception("Latitude is not set.");
			return false;
		}
		if(empty($this->longitude)) {
			throw new Exception("Longitude is not set.");
			return false;
		}
		$statement = $this->database->prepare("SELECT * FROM `position` WHERE `latitude` = ? AND `longitude = ?;");
		$statement->bind("i", $this->latitude);
		$statement->bind("i", $this->longitude);
		$result = $statement->execute();
		if($result->success() == true) {
			if($result->rows() == 0) {
				$statement = $this->database->prepare("INSERT INTO `position` (`latitude`, `longitude`) VALUES (?, ?);");
				$statement->bind("i", $this->latitude);
				$statement->bind("i", $this->longitude);
				$result = $statement->execute();
				if($result->success() == true) {
					return $this->select();
				} else {
					throw new Exception("Database query failed!");
				}
			} else {
				throw new Exception("Position already exists.");
			}
		} else {
			throw new Exception("Database query failed!");
		}
		return false;
	}
}

?>
