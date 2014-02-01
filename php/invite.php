<?php

class invite {
	private $database;

	public function __construct($database) {
		$this->database = $database;
	}

	public function create_table() {
		$table_statement = "CREATE TABLE IF NOT EXISTS `invite` (" .
				"id INT NOT NULL AUTO_INCREMENT," .
				"address TEXT NOT NULL," .
				"count INT NOT NULL," .
				"a_id INT NOT NULL," .
				"UNIQUE(address(128))," .
				"PRIMARY KEY(id)," .
				"FOREIGN KEY(a_id) REFERENCES account(id));";
		$statement = $this->database->prepare($table_statement);
		return $statement->execute();
	}

	private function send($address) {
		$to = $address;
		$subject = "Hei, sinut on kutsuttu liittymään seuraamme.";

		$message = "Hyvää päivää. \r\n\r\n" .
			"Joku ystävistäsi on kutsunut sinut liittymään\r\n" .
			"sinkkupalstallemme http://kattellaan.com sivustolle\r\n\r\n" .
			"Jos et halua liittyä voit unohtaa tämän viestin.\r\n" .
			"mutta jos sinulla on jotain kysyttävää tähän sähköpostiin saa vastata.\r\n\r\n" .
			"Jos et halua tätä viestiä enään, niin rekisteröidy\r\n" .
			"seuraamme tai voit poistaa kutsun osoitteesta:\r\n" .
			"http://kattellaan.com/php/api.php?call=delete_invite&address=" . $address . "\r\n\r\n" . 
			"Terveisin kattellaan treffipalstalta.\r\n";

		$headers = "From: support@kattellaan.com\r\n" .
			"Content-Type: text/html; charset=UTF-8\r\n" .
			"Reply-To: support@kattellaan.com\r\n" .
			"X-mailer: PHP/ " . phpversion();
		return mail($to, $subject, $message, $headers);
	}

	public function insert($address, $requester) {
		$statement = $this->database->prepare("INSERT INTO `invite` (`address`, `count`, `a_id`) VALUES (?, ?, ?);");
		$statement->bind("s", $address);
		$statement->bind("i", 1);
		$statement->bind("s", $requester);
		$result = $statement->execute();
		if($result->success() == true) {
			return $this->send($address);
		} else {
			throw new Exception("Failed to insert invite to the database: " . $statement->get());
		}
	}

	public function update($address) {
		$statement = $this->database->prepare("UPDATE `invite` SET `count` = `count` + 1 WHERE `address` = ?;");
		$statement->bind("s", $address);
		if($statement->execute() == true) {
			return $this->send($address);
		} else {
			throw new Exception("Failed to update invite in the database.");
		}
	}

	public function remove($address) {
		$statement = $this->database->prepare("DELETE FROM `invite` WHERE `address` = ?;\r\n");
		$statement->bind("s", $address);
		return $statement->execute();
	}
}

?>
