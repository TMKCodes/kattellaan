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
	private $political_importance;
	private $relationship_status;
	private $religion;
	private $religion_importance;
	private $sexual_orientation;
	private $smoking;
	private $travel;
	private $vocation;
	private $weight;

	public function __construct($database) {
		$this->database = $database;
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
		$this->gender = $profile['gender'];
		$this->hair_color = $profile['hair_color'];
		$this->height = $profile['height'];
		$this->identifier = $profile['identifier'];
		$this->ignite_me = $profile['ignite_me'];
		$this->income = $profile['income'];
		$this->kids = $profile['kids'];
		$this->language_skills = $profile['language_skills'];
		$this->latlng = $profile['latlng'];
		$this->left_right_politics = $profile['left_right_politics'];
		$this->liberal_conservative_politics = $profile['liberal_conservative_politics'];
		$this->looking_for = $profile['looking_for'];
		$this->not_exciting = $profile['not_exciting'];
		$this->pets = $profile['pets'];
		$this->picture = $profile['picture'];
		$this->political_importance = $profile['political_importance'];
		$this->relationship_status = $profile['relationship_status'];
		$this->religion = $profile['religion'];
		$this->religion_importance = $profile['religion_importance'];
		$this->sexual_orientation = $profile['sexual_orientation'];
		$this->smoking = $profile['smoking'];
		$this->travel = $profile['travel'];
		$this->vocation = $profile['vocation'];
		$this->weight = $profile['weight'];
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
		$profile['gender'] = $this->gender;
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
		$profile['political_importance'] = $this->political_importance;
		$profile['relationship_status'] = $this->relationship_status;
		$profile['religion'] = $this->religion;
		$profile['religion_importance'] = $this->religion_importance;
		$profile['sexual_orientation'] = $this->sexual_orientation;
		$profile['smoking'] = $this->smoking;
		$profile['travel'] = $this->travel;
		$profile['weight'] = $this->weight;
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
			"gender TEXT," .
			"hair_color TEXT," .
			"height TEXT," .
			"identifier INT NOT NULL," .
			"ignite_me TEXT," .
			"income TEXT," .
			"kids TEXT," .
			"language_skills TEXT," .
			"latlng TEXT," .
			"left_right_poltics TEXT," .
			"liberal_conservative_politics TEXT," .
			"looking_for TEXT," .
			"not_exciting TEXT," .
			"pets TEXT," .
			"picture TEXT," .
			"political_importance TEXT," .
			"relationship_status TEXT," .
			"religion TEXT," .
			"religion_importance TEXT," .
			"smoking TEXT," .
			"travel TEXT," . 
			"weight TEXT);";
		$statement = $this->database->prepare($table_query);
		$result = $statement->execute();
		if($result->success() == true) {
			return true;
		} else {
			return false;
		}
			
	}

	public function select() {

	}

	public function insert() {

	}

	public function update() {

	}
}

?>
