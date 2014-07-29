<?php

require_once("position.php");

class distance {
	private $database;
	private $identifier;
	private $distance;
	private $start;
	private $end;
	
	function __construct($database) {
		$this->database = $database;
	}
	
	function create_table() {
		$table = "CREATE TABLE IF NOT EXISTS `distance` (" .
				"id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," .
				"distance INT NOT NULL," .
				"start INT NOT NULL," .
				"end INT NOT NULL);";
		$statement = $this->database->prepare($table);
		$result = $statement->execute();
		return $result->success();
	}
	
	function set_identifier($identifier) { 
		$this->identifier = $identifier;
	}

	function set_distance($distance) {
		$this->distance = $distance;
	}

	function set_start($start) {
		$this->start = $start;
	}

	function set_end($end) {
		$this->end = $end;
	}

	function get_identifier() {
		return $this->identifier;
	}
	
	function get_distance() {
		return $this->distance;
	}
	
	function get_start() {
		return $this->start;
	}

	function get_end() {
		return $this->end;
	}
	
	function find($distance, $position) {
		$statement = $this->database->prepare("SELECT * FROM `distance` WHERE `distance` <= ? AND (`start` = ? OR `end` = ?);");
		$statement->bind("i", $this->distance);
		$statement->bind("i", $this->position);
		$statement->bind("i", $this->position);
		$result = $statement->execute();
		if($result->success() == true) {
			if($result->rows() > 0) {
				$data = array();
				for($i = 0; $i < $result->rows(); $i++) {
					array_push($data, $result->fetch_array(RASSOC));
				}
				return $data;
			} else {
				throw new Exception("Did not find any positions.");
			}
		} else {
			throw new Exception("Database query failed!");
		}
		return false;
	}

	
	function select() {
		if(!empty($this->identifier)) {
			$statement = $this->database->prepare("SELECT * FROM `distance` WHERE `id` = ?;");
			$statement->bind("i", $this->distance);
		} else if(!empty($this->start) && !empty($this->end)) {
			$statement = $this->database->prepare("SELECT * FROM `distance` WHERE (`start` = ? AND `end` = ?) OR (`start` = ? AND `end` = ?);");
			$statement->bind("i", $this->start);
			$statement->bind("i", $this->end);
			$statement->bind("i", $this->end);
			$statement->bind("i", $this->start);
		} else {
			throw new Exception("No identifying data specified. Give distance identifier or position identifiers. identifier: " . $this->identifier . " start: " . $this->start . " end: " . $this->end); 
		}
		$result = $statement->execute();
		if($result->success() == true) {
			if($result->rows() >= 1) {
				$data = $result->fetch_object();
				if(empty($data)) throw new Exception("Failed to fetch object!");
				$this->identifier = $data->id;
				$this->distance = $data->distance;
				$this->start = $data->start;
				$this->end = $data->end;
				return true;
			} else {
				return false;
			}
		} else {
			throw new Exception("Database query failed!");
		}
		return false;
	}
	
	function insert() {
		if(!empty($this->identifier)) {
			throw new Exception("Identifier already set.");
			return false;
		}
		if(empty($this->distance)) {
			throw new Exception("Distance is not set.");
			return false;
		}
		if(empty($this->start)) {
			throw new Exception("Start position is not set.");
			return false;
		}
		if(empty($this->end)) {
			throw new Exception("End position is not set.");
			return false;
		}
		if($this->select() == false) {
			$statement = $this->database->prepare("INSERT INTO `distance` (`distance`, `start`, `end`) VALUES (?, ?, ?);");
			$statement->bind("i", $this->distance);
			$statement->bind("i", $this->start);
			$statement->bind("i", $this->end);
			$result = $statement->execute();
			if($result->success() == true) {
				return $this->select();
			} else {
				throw new Exception("Database query failed!");
			}
		} else {
			throw new Exception("Distance already exists for these positions");
		}
		return false;
	}
	
	function get_uncalculated() {
		$start = 79;
		$statement = $this->database->prepare("SELECT * FROM `distance` ORDER BY `id` DESC LIMIT 0, 1;");
		$result = $statement->execute();
		if($result->success() == true) {
			$data = $result->fetch_array(RASSOC);
			print_r($data);
			$next_end = $data['end'] + 1;
			$next_start = $data['start'] + 1;
			$end_statement = $this->database->prepare("SELECT * FROM `position` WHERE `id` = ? OR `id` = ? ORDER BY `id` DESC LIMIT 0, 1;");
			$end_statement->bind("i", $next_end);
			$end_statement->bind("i", $start);
			$end_result = $end_statement->execute();
			if($end_result->success() == true && $end_result->rows() >= 1) {
				$end = $end_result->fetch_array(RASSOC);
				print_r($end);
				$start_statement = $this->database->prepare("SELECT * FROM `position` WHERE `id` = ?;");
				if($end['id'] == $next_end) {
					$start_statement->bind("i", $data['start']);
				} else {
					$start_statement->bind("i", $next_start);
				}
				$start_result = $start_statement->execute();
				if($start_result->success() == true && $start_result->rows() >= 1) {
					$start = $start_result->fetch_array(RASSOC);
					print_r($start);
					$start['identifier'] = $start['id'];
					$end['identifier'] = $end['id'];
					return array("start" => $start, "end" => $end);
				}
			}
		} else {
			$end_statement = $this->database->prepare("SELECT * FROM `position` WHERE `id` = ?");
			$end_statement->bind("i", $start + 1);
			$end_result = $end_statement->execute();
			if($end_result->success() == true && $end_result->rows() > 1) {
				$end = $end_result->fetch_array(RASSOC);
				$start_statement = $this->database->prepare("SELECT * FROM `position` WHERE `id` = ?");
				$start_statement->bind("i", $start);
				$start_result = $start_statement->execute();
				if($start_result->success() == true && $start_result->rows() > 1) {
					$start['identifier'] = $start['id'];
					$end['identifier'] = $end['id'];
					return array("start" => $start, "end" => $end);
				}
			}
		}

		return false;
	}
}

?>
