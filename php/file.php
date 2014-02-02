<?php

class files {
	private $database;
	private $private_path;
	private $public_path;

	public function __construct($database, $private_path, $public_path) {
		$this->database = $database;
		$this->private_path = $private_path;
		$this->public_path = $public_path;
	}

	public function select($identifier) {
		$statement = $this->database->prepare("SELECT * FROM `file` WHERE `owner` = ?;");
		$statement->bind("i", $identifier);
		$result = $statement->execute();
		if($result->success() == true) {
			$files = array();
			for($i = 0; $i < $result->rows(); $i++) {
				$dfile = $result->fetch_object();
				$file = new file($this->database, $this->private_path, $this->public_path);
				$file->set_name($dfile->name);
				$file->set_owner($dfile->owner);
				$file->set_public($this->public_path . $dfile->name);
				$file->set_private($this->private_path . $dfile->name);
				array_push($files, $file);
			}
			return $files;
		} else {
			return false;
		}
	}
}

class file {
	private $database;
	private $public;
	private $public_path;
	private $private;
	private $private_path;
	private $owner;
	private $name;

	public function __construct($database, $private_path, $public_path) {
		$this->database = $database;
		$this->private_path = $private_path;
		$this->public_path = $public_path;
	}
	
	public function get_public() {
		return $this->public;
	}

	public function get_private() {
		return $this->private;
	}
	public function get_owner() {
		return $this->owner;
	}
	public function get_name() {
		return $this->name;
	}
	
	public function set_public($public) {
		$this->public = $public;
	}
	
	public function set_private($private) {
		$this->private = $private;
	}

	public function set_name($name) {
		$this->name = $name;
	}

	public function set_owner($owner) {
		$this->owner = $owner;
	}

	public function create_table() {
		$table_statement = "CREATE TABLE IF NOT EXISTS `file` (" .
					"id INT NOT NULL AUTO_INCREMENT," .
					"name TEXT NOT NULL," .
					"owner INT NOT NULL," .
					"UNIQUE(name(128))," .
					"PRIMARY KEY(id)," .
					"FOREIGN KEY (owner) REFERENCES account(id));";
		$statement = $this->database->prepare($table_statement);
		$result = $statement->execute();
		return $result->success();			
	}
	private function rename() {
		$new_name = explode(".", $this->name);
		$statement = $this->database->prepare("SELECT count(*) AS `total` FROM `file`;");
		$result = $statement->execute();
		if($result->success() == true) {
			$files = $result->fetch_object();
			$new_name[0] == $new_name[0] . "-" . ($files->total + 1);
			$this->name = implode(".", $new_name);
		} else {
			return false;
		}
	}
	
	public function get_extension() {
		$extension = explode(".", $this->name);
		return $extension[count($extension)-1];
	}
	
	public function select() {
		if(!empty($this->name)) {
			$statement = $this->database->prepare("SELECT * FROM `file` WHERE `name` = ?;");
			$statement->bind("s", $this->name);
			$result = $statement->execute();
			if($result->success() == true) {
				$dfile = $result->fetch_object();
				$this->owner = $dfile->owner;
				$this->name = $dfile->name;
				$this->public = $this->public_path . $dfile->name;
				$this->private = $this->private_path . $dfile->name;
				return true;
			} else {
				return false;
			}
		} else {
			throw new Exception("File name member not specified");
		}
	}
	
	public function insert() {
		if(!empty($this->name) && !empty($this->owner)) {
			if($this->select() == true) {
				$this->rename();		
			}
			$statement = $this->database->prepare("INSERT INTO `file` (`owner`, `name`) VALUES (?, ?);");
			$statement->bind("i", $this->owner);
			$statement->bind("s", $this->name);
			$result = $statement->execute();
			$this->public = $this->public_path . $this->name;
			$this->private = $this->private_path . $this->name;
			return $result->success();
		} else {
			throw new Exception("File name: " . $this->name . " and owner: " . $this->owner . "members are not specified");
		}
	}
	public function delete() {
		if(!empty($this->name)) {
			$statement = $this->database->prepare("DELETE * FROM `file` WHERE `name` = ?;");
			$statement->bind("s", $this->name);
			$result = $statement->execute();
			return $result->success();
		} else {
			throw new Exception("File name member not specified");
		}
	}
}

?>
