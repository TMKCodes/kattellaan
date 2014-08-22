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
		$last_distance_statement = $this->database->prepare("SELECT * FROM `distance` ORDER BY `id` DESC LIMIT 0, 1;");
		$last_distance_result = $last_distance_statement->execute();
		if($last_distance_result->success() == true && $last_distance_result->rows() == 1) {
			$first_position_statement = $this->database->prepare("SELECT * FROM `position` LIMIT 0, 1;");
			$first_position_result = $first_position_statement->execute();
			if($first_position_result->rows() < 1) {
				return false;
			}

			$last_position_statement = $this->database->prepare("SELECT * FROM `position` ORDER BY `id` DESC LIMIT 0, 1;");
			$last_position_result = $last_position_statement->execute();
			if($last_position_result->rows() < 1) {
				return false;
			}

			$last_distance = $last_distance_result->fetch_array(RASSOC);
			$first_position = $first_position_result->fetch_array(RASSOC);
			$last_position = $last_position_result->fetch_array(RASSOC);
			if($first_position['id'] == $last_position['id']) {
				return false;
			}
		
			if($last_distance['end'] == $last_position['id']) {
				$next_end = $first_position['id'];
				if($last_distance['start'] == $last_position['id']) {
					return false;
				} else {
					$next_start_found = false;
					$next_start = $last_distance['start'] + 1;
					while($next_start_found == false) {
						$next_start_statement = $this->database->prepare("SELECT * FROM `position` WHERE `id` = ?;");
						$next_start_statement->bind("i", $next_start);
						$next_start_result = $next_start_statement->execute();
						if($next_start_result->success() == true && $next_start_result->rows() == 1) {
							$next_start_data = $next_start_result->fetch_array(RASSOC);
							$next_start = $next_start_data['id'];
							$exists_statement = $this->database->prepare("SELECT * FROM `distance` WHERE (`start` = ? AND `end` = ?) OR (`start` = ? AND `end` = ?);");
							$exists_statement->bind("i", $next_start);
							$exists_statement->bind("i", $next_end);
							$exists_statement->bind("i", $next_end);
							$exists_statement->bind("i", $next_start);
							$exists_result = $exists_statement->execute();
							if($exists_result->success() == true && $exists_result->rows() == 1) {
								$next_end_found = false;
								$next_end = $next_end + 1;
								while($next_end_found == false) {
									$next_end_statement = $this->database->prepare("SELECT * FROM `position` WHERE `id` = ?;");
									$next_end_statement->bind("i", $next_end);
									$next_end_result = $next_end_statement->execute();
									if($next_end_result->success() == true && $next_end_result->rows() == 1) {
										$next_end_data = $next_end_result->fetch_array(RASSOC);
										$next_end = $next_end_data['id'];
										$exists_statement = $this->database->prepare("SELECT * FROM `distance` WHERE (`start` = ? AND `end` = ?) OR (`start` = ? AND `end` = ?);");
										$exists_statement->bind("i", $next_start);
										$exists_statement->bind("i", $next_end);
										$exists_statement->bind("i", $next_end);
										$exists_statement->bind("i", $next_start);
										$exists_result = $exists_statement->execute();
										if($exists_result->success() == true && $exists_result->rows() == 1) {
											$next_end += 1;
										} else {
											if($next_start != $next_end) {
												$next_end_found = true;	
											} else {
												$next_end += 1;
											}
										}
									} else {
										$next_end += 1;
									}
									if($next_end == $last_position['id']) {
										return false;
									}
								}	
							} else {
								$next_start_found = true;	
							}
						} else {
							$next_start += 1;
						}
					}
				}
			} else {
				$next_start = $last_distance['start'];		
				$next_end_found = false;
				$next_end = $last_distance['end'] + 1;
				while($next_end_found == false) {
					$next_end_statement = $this->database->prepare("SELECT * FROM `position` WHERE `id` = ?;");
					$next_end_statement->bind("i", $next_end);
					$next_end_result = $next_end_statement->execute();
					if($next_end_result->success() == true && $next_end_result->rows() == 1) {
						$next_end_data = $next_end_result->fetch_array(RASSOC);
						$next_end = $next_end_data['id'];
						$exists_statement = $this->database->prepare("SELECT * FROM `distance` WHERE (`start` = ? AND `end` = ?) OR (`start` = ? AND `end` = ?);");
						$exists_statement->bind("i", $next_start);
						$exists_statement->bind("i", $next_end);
						$exists_statement->bind("i", $next_end);
						$exists_statement->bind("i", $next_start);
						$exists_result = $exists_statement->execute();
						if($exists_result->success() == true && $exists_result->rows() == 1) {
							$next_end += 1;
						} else {
							$next_end_found = true;	
						}
					} else {
						$next_end += 1;
					}
					if($next_end == $last_position['id']) {
						return false;
					}
				}
			}

			
			printf("Next start: %s, Next end: %s\r\n", $next_start, $next_end);
			$start_select = $this->database->prepare("SELECT * FROM `position` WHERE `id` = ?");
			$start_select->bind("i", $next_start);
			$start_result = $start_select->execute();
			if($start_result->success() == true && $start_result->rows() == 1) {
				$start = $start_result->fetch_array(RASSOC);
				$start['identifier'] = $start['id'];
			}
			$end_select = $this->database->prepare("SELECT * FROM `position` WHERE `id` = ?");
			$end_select->bind("i", $next_end);
			$end_result = $end_select->execute();
			if($end_result->success() == true && $end_result->rows() == 1) {
				$end = $end_result->fetch_array(RASSOC);
				$end['identifier'] = $end['id'];
			}
			return array("start" => $start, "end" => $end);
		} else {
			$start = 1;
			$end_statement = $this->database->prepare("SELECT * FROM `position` WHERE `id` = ?");
			$end_statement->bind("i", $start + 1);
			$end_result = $end_statement->execute();
			if($end_result->success() == true && $end_result->rows() >= 1) {
				$end = $end_result->fetch_array(RASSOC);
				$start_statement = $this->database->prepare("SELECT * FROM `position` WHERE `id` = ?");
				$start_statement->bind("i", $start);
				$start_result = $start_statement->execute();
				if($start_result->success() == true && $start_result->rows() >= 1) {
					$start = $start_result->fetch_array(RASSOC);
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
