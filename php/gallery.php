<?php

class gallery {
	private $database;

	public function __construct($database) {
		$this->database = $database;		
	}

	public function create_table() {
		$table_query = "CREATE TABLE IF NOT EXISTS `gallery` (" .
				"id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," .
				"uid INT NOT NULL," .
				"img TEXT NOT NULL);";
		$statement = $this->database->prepare($table_query);
		$result = $statement->execute();
		return $result->success();
	}

	public function insert($uid, $img) {
		if(!empty($uid) && !empty($img)) {
			$statement = $this->database->prepare("INSERT INTO `gallery` (`uid`, `img`) VALUES (?, ?);");
			$statement->bind("i", $uid);
			$statement->bind("s", $img);
			$result = $statement->execute();
			return $result->success();
		} else {
			if(empty($uid)) throw new Exception("User identifier was emtpy.");
			if(empty($img)) throw new Exception("Image name was empty.");
			return false;	
		}
	}

	public function delete($uid, $img) {
		if(!empty($uid) && !empty($img)) {
			$statement = $this->database->prepare("DELETE FROM `gallery` WHERE `uid` = ? AND `img` = ?;");
			$statement->bind("i", $uid);
			$statement->bind("s", $img);
			$result = $statement->execute();
			return $result->success();
		} else {
			if(empty($uid)) throw new Exception("User identifier was emtpy.");
			if(empty($img)) throw new Exception("Image name was empty.");
			return false;
		}
	}

	public function select($uid) {
		if(!empty($uid)) {
			$statement = $this->database->prepare("SELECT * FROM `gallery` WHERE `uid` = ?;");
			$statement->bind("i", $uid);
			$result = $statement->execute();
			if($result->success() == true) {
				if($result->rows() > 0) {
					$data = $result->fetch_array(RASSOC);
					return $data;
				} else {
					return false;
				}
			} else {
				throw new Exception("Failed query: " . $statement->get());
				return false;
			}
		} else {
			throw new Exception("User identifier was empty.");
			return false;
		}
	}
}

?>
