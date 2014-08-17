<?php

class profile {
	private $database;

	private $identifier;
	private $accomodation;
	private $address;
	private $alcohol;
	private $best_things_in_the_world;
	private $birthday;
	private $body_type;
	private $dress_style;
	private $education;
	private $ethnic_identity;
	private $exercise;
	private $eye_color;
	private $favorite_bands;
	private $favorite_movies;
	private $favorite_radio_shows;
	private $favorite_television_series;
	private $gender;
	private $hair_color;
	private $hair_length;
	private $height;
	private $ignite_me;
	private $income;
	private $kids;
	private $language_skills;
	private $latlng;
	private $left_right_politics;
	private $liberal_conservative_politics;
	private $looking_for;
	private $not_exciting;
	private $pets;
	private $picture;
	private $profile_text;
	private $political_importance;
	private $relationship_status;
	private $religion;
	private $religion_importance;
	private $sexual_orientation;
	private $smoking;
	private $travel;
	private $vocation;
	private $weight;
	private $work;

	public function __construct($database) {
		$this->database = $database;
	}	

	public function strip_latlng($latlng) {
		$latlng = str_replace("(", "", $latlng);
		$latlng = str_replace(")", "", $latlng);
		$latlng = explode(", ", $latlng);
		return $latlng;
	}
	
	public function get_latlng() {
		return $this->latlng;
	}

	public function set($profile) {
		$this->accomodation = $profile['accomodation'];
		$this->address = $profile['address'];
		$this->alcohol = $profile['alcohol'];
		$this->best_things_in_the_world = $profile['best_things_in_the_world'];
		$this->birthday = $profile['birthday'];
		$this->body_type = $profile['body_type'];
		$this->dress_style = $profile['dress_style'];
		$this->education = $profile['education'];
		$this->ethnic_identity = $profile['ethnic_identity'];
		$this->exercise = $profile['exercise'];
		$this->eye_color = $profile['eye_color'];
		$this->favorite_bands = $profile['favorite_bands'];
		$this->favorite_movies = $profile['favorite_movies'];
		$this->favorite_radio_shows = $profile['favorite_radio_shows'];
		$this->favorite_television_series = $profile['favorite_television_series'];
		$this->gender = $profile['gender'];
		$this->hair_length = $profile['hair_length'];
		$this->hair_color = $profile['hair_color'];
		$this->height = $profile['height'];
		if(!empty($profile['identifier'])) {
			$this->identifier = $profile['identifier'];
		}
		$this->ignite_me = $profile['ignite_me'];
		$this->income = $profile['income'];
		$this->kids = $profile['kids'];
		$this->language_skills = $profile['language_skills'];
		if(!empty($profile['latlng'])) {
			$this->latlng = $profile['latlng'];
		}
		$this->left_right_politics = $profile['left_right_politics'];
		$this->liberal_conservative_politics = $profile['liberal_conservative_politics'];
		$this->looking_for = $profile['looking_for'];
		$this->not_exciting = $profile['not_exciting'];
		$this->pets = $profile['pets'];
		if(!empty($profile['picture'])) {
			$this->picture = $profile['picture'];
		} else {
			$this->picture = "";
		}
		$this->profile_text = $profile['profile_text'];
		$this->political_importance = $profile['political_importance'];
		$this->relationship_status = $profile['relationship_status'];
		$this->religion = $profile['religion'];
		$this->religion_importance = $profile['religion_importance'];
		$this->sexual_orientation = $profile['sexual_orientation'];
		$this->smoking = $profile['smoking'];
		$this->travel = $profile['travel'];
		$this->vocation = $profile['vocation'];
		$this->weight = $profile['weight'];
		$this->work = $profile['work'];	
	}
	
	public function get() {
		$profile['accomodation'] = $this->accomodation;
		$profile['address'] = $this->address;
		$profile['alcohol'] = $this->alcohol;
		$profile['best_things_in_the_world'] = $this->best_things_in_the_world;
		$profile['birthday'] = $this->birthday;
		$profile['body_type'] = $this->body_type;
		$profile['dress_style'] = $this->dress_style;
		$profile['education'] = $this->education;
		$profile['ethnic_identity'] = $this->ethnic_identity;
		$profile['exercise'] = $this->exercise;
		$profile['eye_color'] = $this->eye_color;
		$profile['favorite_bands'] = $this->favorite_bands;
		$profile['favorite_movies'] = $this->favorite_movies;
		$profile['favorite_radio_shows'] = $this->favorite_radio_shows;
		$profile['favorite_television_series'] = $this->favorite_television_series;
		$profile['gender'] = $this->gender;
		$profile['hair_length'] = $this->hair_length;
		$profile['hair_color'] = $this->hair_color;
		$profile['height'] = $this->height;
		$profile['identifier'] = $this->identifier;
		$profile['ignite_me'] = $this->ignite_me;
		$profile['income'] = $this->income;
		$profile['kids'] = $this->kids;
		$profile['language_skills'] = $this->language_skills;
		$profile['latlng'] = $this->latlng;
		$profile['left_right_politics'] = $this->left_right_politics;
		$profile['liberal_conservative_politics'] = $this->liberal_conservative_politics;
		$profile['looking_for'] = $this->looking_for;
		$profile['not_exciting'] = $this->not_exciting;
		$profile['pets'] = $this->pets;
		$profile['picture'] = $this->picture;
		$profile['profile_text'] = $this->profile_text;
		$profile['political_importance'] = $this->political_importance;
		$profile['relationship_status'] = $this->relationship_status;
		$profile['religion'] = $this->religion;
		$profile['religion_importance'] = $this->religion_importance;
		$profile['sexual_orientation'] = $this->sexual_orientation;
		$profile['smoking'] = $this->smoking;
		$profile['travel'] = $this->travel;
		$profile['vocation'] = $this->vocation;
		$profile['weight'] = $this->weight;
		$profile['work'] = $this->work;
		return $profile;
	}

	public function create_table() {
		$table_query = "CREATE TABLE IF NOT EXISTS `profile` (" .
			"accomodation TEXT," .
			"address TEXT," .
			"alcohol TEXT," .
			"best_things_in_the_world TEXT," .
			"birthday DATE," . 
			"body_type TEXT," .
			"dress_style TEXT," .
			"education TEXT," .
			"ethnic_identity TEXT," .
			"exercise TEXT," .
			"eye_color TEXT," .
			"favorite_bands TEXT," .
			"favorite_movies TEXT," .
			"favorite_radio_shows TEXT," .
			"favorite_television_series TEXT,".
			"gender TEXT," .
			"hair_length TEXT," .
			"hair_color TEXT," .
			"height TEXT," .
			"identifier INT NOT NULL," .
			"ignite_me TEXT," .
			"income TEXT," .
			"kids TEXT," .
			"language_skills TEXT," .
			"latlng TEXT," .
			"left_right_politics TEXT," .
			"liberal_conservative_politics TEXT," .
			"looking_for TEXT," .
			"not_exciting TEXT," .
			"pets TEXT," .
			"picture TEXT," .
			"profile_text TEXT," .
			"political_importance TEXT," .
			"relationship_status TEXT," .
			"religion TEXT," .
			"religion_importance TEXT," .
			"sexual_orientation TEXT," .
			"smoking TEXT," .
			"travel TEXT," .
			"vocation TEXT," . 
			"weight TEXT," .
			"work TEXT);";
		$statement = $this->database->prepare($table_query);
		$result = $statement->execute();
		if($result->success() == true) {
			return true;
		} else {
			return false;
		}
			
	}

	private function execute_select($statement) {
		$result = $statement->execute();
		if($result->success() == true) {
			if($result->rows() > 0) {
				$data = array();
				for($i = 0; $i <= $result->rows(); $i++) {
					$profile = new profile($this->database);
					$profile->set($result->fetch_array(RASSOC));
					array_push($data, $profile);
				}
				return $data;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	public function select_by_position($position) {
		$statment = $this->database->prepare("SELECT * FROM `profile` WHERE `latlng` = ?;");
		$statement->bind('s', "(" . $position['latitude'] . ", " . $position['longitude'] . ")");	
		return $this->execute_select($statement);
	}
	
	public function select_by_age($min, $max) {
		$this_year = date("Y");
		$min_birthday_year = $this_year - $min;
		$max_birthday_year = $this_year - $max;
		$min_birthday = $min_birthday_year . "-12-31";
		$max_birthday = $max_birthday_year . "-01-01";
		$statment = $this->database->prepare("SELECT * FROM `profile` WHERE `birthday` >= ? AND `birthday` <= ?;");
		$statement->bind('s', $max_birthday);
		$statement->bind('s', $min_birthday);	
		return $this->execute_select($statement);
	}

	public function select($identifier) {
		$statement = $this->database->prepare("SELECT * FROM `profile` WHERE `identifier` = ?;");
		$statement->bind('i', $identifier);
 		$result = $statement->execute();
		if($result->success() == true) {
			if($result->rows() > 0) {
				$data = $result->fetch_array(RASSOC);
				$this->set($data);
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	private function sbind($statement, $with_identifier) {
		$statement->bind('s', $this->accomodation);
		$statement->bind('s', $this->address);
		$statement->bind('s', $this->alcohol);
		$statement->bind('s', $this->best_things_in_the_world);
		$statement->bind('s', $this->birthday);
		$statement->bind('s', $this->body_type);
		$statement->bind('s', $this->dress_style);
		$statement->bind('s', $this->education);
		$statement->bind('s', $this->ethnic_identity);
		$statement->bind('s', $this->exercise);
		$statement->bind('s', $this->eye_color);
		$statement->bind('s', $this->favorite_bands);
		$statement->bind('s', $this->favorite_movies);
		$statement->bind('s', $this->favorite_radio_shows);
		$statement->bind('s', $this->favorite_television_series);
		$statement->bind('s', $this->gender);
		$statement->bind('s', $this->hair_length);
		$statement->bind('s', $this->hair_color);
		$statement->bind('s', $this->height);
		if($with_identifier == true) {
			$statement->bind('i', $this->identifier);
		}
		$statement->bind('s', $this->ignite_me);
		$statement->bind('s', $this->income);
		$statement->bind('s', $this->kids);
		$statement->bind('s', $this->language_skills);
		$statement->bind('s', $this->latlng);
		$statement->bind('s', $this->left_right_politics);
		$statement->bind('s', $this->liberal_conservative_politics);
		$statement->bind('s', $this->looking_for);
		$statement->bind('s', $this->not_exciting);
		$statement->bind('s', $this->pets);
		$statement->bind('s', $this->picture);
		$statement->bind('s', $this->profile_text);
		$statement->bind('s', $this->political_importance);
		$statement->bind('s', $this->relationship_status);
		$statement->bind('s', $this->religion);
		$statement->bind('s', $this->religion_importance);
		$statement->bind('s', $this->sexual_orientation);
		$statement->bind('s', $this->smoking);
		$statement->bind('s', $this->travel);
		$statement->bind('s', $this->vocation);
		$statement->bind('s', $this->weight);
		$statement->bind('s', $this->work);
		return $statement;	
	}

	public function insert() {
		if(!empty($this->identifier)) {
			$query = "INSERT INTO `profile` (`accomodation`, `address`, `alcohol`, " . 
				"`best_things_in_the_world`, `birthday`, `body_type`, `dress_style`, " .
				"`education`, `ethnic_identity`, `exercise`, `eye_color`, `favorite_bands`, " .
				"`favorite_movies`, `favorite_radio_shows`, `favorite_television_series`, " .
				"`gender`, `hair_length`,  `hair_color`,".
				"`height`, `identifier`, `ignite_me`, `income`, `kids`, `language_skills`,".
				"`latlng`, `left_right_politics`, `liberal_conservative_politics`,".
				"`looking_for`, `not_exciting`, `pets`, `picture`, `profile_text`, `political_importance`,".
				"`relationship_status`, `religion`, `religion_importance`, `sexual_orientation`,".
				"`smoking`, `travel`, `vocation`, `weight`, `work`) " . 
				"VALUES (".	
				"?, ?, ?, ?, ?, ?, ?, ?, ?, ?, " . // 10
				"?, ?, ?, ?, ?, ?, ?, ?, ?, ?, " . // 20
				"?, ?, ?, ?, ?, ?, ?, ?, ?, ?, " . // 30
				"?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"; // 42
			$statement = $this->database->prepare($query);
			$statement = $this->sbind($statement, true);
			$result = $statement->execute();
			return $statement->get();
		} else {
			return false;
		}
	}

	public function update() {
		if(!empty($this->identifier)) {
			$query = "UPDATE `profile` " .
				"SET `accomodation` = ?, `address` = ?, `alcohol` = ?, " .
				"`best_things_in_the_world` = ?, `birthday` = ?, `body_type` = ?, " .
				"`dress_style` = ?, `education` = ?, `ethnic_identity` = ?, " .
				"`exercise` = ?, `eye_color` = ?, `favorite_bands` = ?, " .
				"`favorite_movies` = ?, `favorite_radio_shows` = ?, `favorite_television_series` = ?, " .
				"`gender` = ?, `hair_length` = ?, `hair_color` = ?, `height` = ?, `ignite_me` = ?, " . 
				"`income` = ?, `kids` = ?, `language_skills` = ?, `latlng` = ?, " .
				"`left_right_politics` = ?, `liberal_conservative_politics` = ?, " .	
				"`looking_for` = ?, `not_exciting` = ?, `pets` = ?, `picture` = ?, `profile_text` = ?, " .
				"`political_importance` = ?, `relationship_status` = ?, `religion` = ?, " .
				"`religion_importance` = ?, `sexual_orientation` = ?, `smoking` = ?, " .
				"`travel` = ?, `vocation` = ?, `weight` = ?, `work` = ? " .
				"WHERE `identifier` = ?;";
			$statement = $this->database->prepare($query);
			$statement = $this->sbind($statement, false);
			$statement->bind('i', $this->identifier);
			$result = $statement->execute();
			if($result->success() == true) {
				return true;
			}
		} else {
			return false;
		}
	}
}

?>
