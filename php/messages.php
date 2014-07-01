<?php

class message {

	private $database;
	private $identifier;
	private $sender;
	private $receiver;
	private $timestamp;
	private $seen;
	private $type;
	private $message;

	public function __construct($database) {
		$this->database = $database;
	}

	public function set_identifier($identifier) {
		$this->identifier = $identifier;
	}
	
	public function set_sender($sender) {
		$this->sender = $sender;
	}
	
	public function set_receiver($receiver) {
		$this->receiver = $receiver;
	}
	
	public function set_timestamp($timestamp) {
		$this->timestamp = $timestamp;
	}

	public function set_seen($seen) {
		$this->seen = $seen;
	}

	public function set_type($type) {
		$this->type = $type;
	}
	
	public function set_message($message) {
		$this->message = $message;
	}

	public function get_identifier() {
		return $this->identifier;
	}

	public function get_sender() {
		return $this->sender;
	}
	
	public function get_receiver() {
		return $this->receiver;
	}
	
	public function get_timestamp() {
		return $this->timestamp;
	}
	
	public function get_seen() {
		return $this->seen;
	}

	public function get_type() {
		return $this->type;
	}
	
	public function get_message() {
		return $this->message;
	}

	public function create_table() {
		$table = "CREATE TABLE IF NOT EXISTS `message` (" .
				"id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," .
				"sender INT NOT NULL," .
				"receiver INT NOT NULL," .
				"timestamp DATETIME NOT NULL," .
				"seen TINYINT(1)," .
				"type TEXT," .
				"message LONGBLOB);";
		printf("%s\r\n", $table);
		$statement = $this->database->prepare($table);
		$result = $statement->execute();
		return $result->success();
	}

	public function select() {
		if(!empty($this->identifier)) {
			$statement = $this->database->prepare("SELECT * FROM `message` WHERE `id` = ?;");
			$statement->bind("i", $this->identifier);
		} else if(!empty($this->sender) && !empty($this->receiver) && !empty($this->timestamp) 
				&& !empty($this->seen) && !empty($this->type) && !empty($this->message)) {
			$query = "SELECT * FROM `message` " .
					"WHERE `sender` = ? AND `receiver` = ? " .
					"AND `timestamp` = ? AND `seen` = ? AND `message` = ?";
			$statement = $this->database->prepare($query);
			$statement->bind("i", $this->sender);
			$statement->bind("i", $this->receiver);
			$statement->bind("s", $this->timestamp);
			$statement->bind("i", $this->seen);
			$statement->bind("s", $this->type);
			$statement->bind("s", $this->message);
		} else {
			throw new Exception("No identifying data specified. Give identifier.");
			return false;
		}
		$result = $statement->execut();
		if($result->success() == true) {
			if($result->rows() == 1) {
				$data = $result->fetch_object();
				if(empty($data)) throw new Exception("Failed to fetch object.");
				$this->identifier = $data->id;
				return $true;
			} else {
				return false;
			}
		} else {
			throw new Exception("Database query failed in message->select().");
			return false;
		}
	}

	public function insert() {
		if(!empty($this->identifier)) {
			throw new Exception("Identifier is alseeny set.");
			return false;
		}
		if(empty($this->sender)) {
			throw new Exception("Sender is not set.");
			return false;	
		}
		if(empty($this->receiver)) {
			throw new Exception("Receiver is not set.");
			return false;
		}
		if(empty($this->timestamp)) {
			$this->timestamp = gmdate("Y-m-d h:i:s");
		}
		if(empty($this->seen)) {
			$this->seen = 0;
		}
		if(empty($this->type)) {
			$this->type = "text";
		}
		if(empty($this->message)) {
			$this->message = "";
		}
		$query = "INSERT INTO `message` (`sender`, `receiver`, `timestamp`, `seen`, `type`, `message`) " .
				"VALUES (?, ?, ?, ?, ?, ?);";
		$statement = $this->database->prepare($query);
		$statement->bind("i", $this->sender);
		$statement->bind("i", $this->receiver);
		$statement->bind("s", $this->timestamp);
		$statement->bind("i", $this->seen);
		$statement->bind("s", $this->type);
		$statement->bind("s", $this->message);
		$result = $statement->execute();
		if($result->success() == true) {
			return $this->select();
		} else {
			throw new Exception("Database query failed in message->insert(). Query = " . $query);
		}
	}

	public function seen() {
		$this->seen = 1;
		$this->update();
	}

	public function update() {
		if(!empty($this->identifier) && !empty($this->sender) && !empty($this->receiver) && !empty($this->timestamp) && !empty($this->seen) && !empty($this->type) && !empty($this->message)) {
			$query = "UPDATE `message` SET `sender` = ?, `receiver` = ?, `timestamp` = ?, ".
					"`seen` = ?, `type` = ?, `message` = ? WHERE `id` = ?;";
			$statement = $this->database->prepare($query);
			$statement->bind("i", $this->sender);
			$statement->bind("i", $this->receiver);
			$statement->bind("s", $this->timestamp);
			$statement->bind("i", $this->seen);
			$statement->bind("s", $this->type);
			$statement->bind("s", $this->message);
			$statement->bind("i", $this->identifier);
			$result = $statement->execute();
			return $result->success();
		} else {
			return false;
		}
	}
}

class messages {
	private $database;
	private $messages;

	public function __construct($database) {
		$this->database = $database;
	}
	
	private function get_messages($statement) {
		$result = $statement->execute();
		if($result->success() == true) {
			if($result->rows() > 0) {
				for($i = 0; $i < $result->rows(); $i++) {
					$data = $result->fetch_object();
					$msg = new message($this->database);
					$msg->set_identifier($data->id);
					$msg->set_sender($data->sender);
					$msg->set_receiver($data->receiver);
					$msg->set_timestamp($data->timestamp);
					$msg->set_seen($data->seen);
					$msg->set_type($data->type);
					$msg->set_message($data->message);
					array_push($messages, $msg);
				}
				return true;
			} else {
				throw new Exception("No results found.");
				return false;
			}
		} else {
			throw new Exception("Database query failed.");
		}
	}
		
	public function get_latest($receiver, $limit) {
		$query = "SELECT * FROM `message` WHERE `receiver` = ? ORDER BY `timestamp` ASC LIMIT ?;"; 
		$statement = $this->database->prepare($query);
		$statement->bind("i", $receiver);
		$statement->bind("i", $limit);
		return $this->get_messages($statement);
	}
	
	public function get_sender($sender, $receiver) {
		$query = "SELECT * FROM `message` WHERE `sender` = ? AND `receiver` = ? ORDER BY `timestamp` ASC;";
		$statement = $this->database->prepare($query);
		$statement->bind("i", $sender);
		$statement->bind("i", $receiver);
		return $this->get_messages($statement);
	}

	public function get_discussions($uid) {
		$query = "SELECT `sender`, `receiver` FROM `message` WHERE `sender` = ? OR `receiver` = ? ORDER BY `timestamp`;";
		$statement = $this->database->prepare($query);
		$statement->bind("i", $uid);
		$statement->bind("i", $uid);
		return $this->get_messages($statement);
	}
	
	public function get_discussion($sender, $receiver, $limit) {
		$query = "SELECT * FROM `message` WHERE (`sender` = ? AND `recever` = ?) OR (`sender` = ? AND `receiver` = ?) ORDER BY `timestamp` ASC LIMIT ?;";
		$statement = $this->database->prepare($query);
		$statement->bind("i", $sender);
		$statement->bind("i", $receiver);
		$statement->bind("i", $receiver);
		$statement->bind("i", $sender);
		$statement->bind("i", $limit);
		return $this->get_messages($statement);
	}

}

?>
